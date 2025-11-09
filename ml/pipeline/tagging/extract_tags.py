"""Story genome tagging extractor."""

from __future__ import annotations

import argparse
import json
import math
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
from transformers import pipeline

from . import config


@dataclass
class TaggingResult:
    genre: str
    mood: str
    perspective: str
    humor: Optional[str]
    pacing: Dict[str, float]
    stats: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TagExtractor:
    """Extracts story genome tags using heuristics + zero-shot classification."""

    def __init__(self, model_name: str = config.DEFAULT_MODEL) -> None:
        self.classifier = pipeline("zero-shot-classification", model=model_name)

    def extract(self, text: str) -> TaggingResult:
        cleaned = text.strip()
        if not cleaned:
            raise ValueError("Input text is empty")

        genre = self._classify(cleaned, config.GENRE_LABELS)
        mood = self._classify(cleaned, config.MOOD_LABELS)
        perspective = self._detect_perspective(cleaned)
        humor = self._detect_humor(cleaned)
        pacing = self._compute_pacing(cleaned)

        stats = {
            "word_count": pacing["word_count"],
            "sentence_count": pacing["sentence_count"],
            "avg_sentence_length": pacing["avg_sentence_length"],
            "std_sentence_length": pacing["std_sentence_length"],
        }

        return TaggingResult(
            genre=genre,
            mood=mood,
            perspective=perspective,
            humor=humor,
            pacing={k: v for k, v in pacing.items() if k not in {"word_count", "sentence_count"}},
            stats=stats,
        )

    def _classify(self, text: str, labels: list[str]) -> str:
        result = self.classifier(text, candidate_labels=labels, multi_label=False)
        return result["labels"][0]

    def _detect_perspective(self, text: str) -> str:
        counts = {key: 0 for key in config.PERSPECTIVE_PRONOUNS}
        tokens = re.findall(r"\b\w+\b", text.lower())
        for key, words in config.PERSPECTIVE_PRONOUNS.items():
            counts[key] = sum(tokens.count(w.lower()) for w in words)
        # Choose the perspective with the highest count, default to third person
        perspective = max(counts, key=counts.get)
        return perspective

    def _detect_humor(self, text: str) -> Optional[str]:
        lower = text.lower()
        matched = []
        for humor_type, keywords in config.HUMOR_KEYWORDS.items():
            if any(keyword in lower for keyword in keywords):
                matched.append(humor_type)
        if not matched:
            return None
        return matched[0]

    def _compute_pacing(self, text: str) -> Dict[str, float]:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
        if not sentences:
            sentences = [text.strip()]
        words_per_sentence = [len(re.findall(r"\b\w+\b", sentence)) for sentence in sentences]
        total_words = sum(words_per_sentence)
        sentence_count = len(sentences)
        avg_sentence_length = total_words / sentence_count
        std_sentence_length = float(np.std(words_per_sentence)) if sentence_count > 1 else 0.0
        reading_speed_wpm = 180  # average adult reading speed
        estimated_minutes = total_words / reading_speed_wpm
        return {
            "word_count": total_words,
            "sentence_count": sentence_count,
            "avg_sentence_length": avg_sentence_length,
            "std_sentence_length": std_sentence_length,
            "estimated_read_time_min": round(estimated_minutes, 2),
            "pace_bucket": self._pace_bucket(avg_sentence_length),
        }

    def _pace_bucket(self, avg_sentence_length: float) -> str:
        if avg_sentence_length < 10:
            return "rapid"
        if avg_sentence_length < 20:
            return "moderate"
        return "leisurely"


def _load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract story genome tags")
    parser.add_argument("--text", help="Inline text to analyze", default=None)
    parser.add_argument("--text-file", help="Path to text file", default=None)
    args = parser.parse_args()

    if not args.text and not args.text_file:
        raise SystemExit("Provide --text or --text-file")

    if args.text:
        raw_text = args.text
    else:
        raw_text = _load_text(Path(args.text_file))

    extractor = TagExtractor()
    result = extractor.extract(raw_text)
    print(json.dumps(result.to_dict(), indent=2))


if __name__ == "__main__":
    main()

