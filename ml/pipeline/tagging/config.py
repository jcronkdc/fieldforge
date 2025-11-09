"""Configuration for story genome tagging heuristics."""

GENRE_LABELS = [
    "science fiction",
    "fantasy",
    "romance",
    "thriller",
    "comedy",
    "drama",
    "horror",
    "mystery",
]

MOOD_LABELS = [
    "uplifting",
    "dark",
    "melancholic",
    "hopeful",
    "chaotic",
    "whimsical",
]

HUMOR_KEYWORDS = {
    "slapstick": ["slipped", "banana peel", "cartwheel", "trip"],
    "sarcastic": ["yeah right", "sure", "obviously", "snarked"],
    "dry": ["deadpan", "matter-of-fact", "understated"],
}

PERSPECTIVE_PRONOUNS = {
    "first_person": ["I", "me", "we", "us"],
    "second_person": ["you"],
    "third_person": ["he", "she", "they", "them", "it"],
}

DEFAULT_MODEL = "facebook/bart-large-mnli"

