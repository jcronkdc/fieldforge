# ML Workspace

This workspace hosts experimentation assets for the story genome tagging pipeline and other narrative intelligence models.

## Environment Setup

```bash
cd ml
python3.11 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Structure

```
ml/
  README.md
  requirements.txt
  data/
    README.md
  notebooks/
    exploration.ipynb (placeholder)
  pipeline/
    tagging/
      __init__.py
      config.py
      extract_tags.py
```

## Story Genome Pipeline (v0)

`pipeline/tagging/extract_tags.py` exposes a `TagExtractor` class that scores:
- genre & mood (Transformers zero-shot classifier)
- emotional tone (zero-shot categories in `config.py`)
- pacing (token length, sentence cadence statistics)
- perspective & humor heuristics

Run a quick smoke test:

```bash
python -m pipeline.tagging.extract_tags --text-file ../samples/example_story.txt
```

The script prints JSON payloads ready to insert into `genome_scores` for the API.

## Data Management

- Place raw story seeds inside `data/raw/` (ignored by git via `.gitignore`).
- Derived datasets go under `data/processed/`.
- Document dataset provenance in `data/README.md`.

## Notebooks

Use notebooks for exploratory analysis or to compare model outputs. Keep large datasets out of git; export relevant figures or summaries back to docs.

## Next Steps

- Hook pipeline output into backend ingestion job.
- Add automated tests for tagging heuristics.
- Evaluate alternative models for tone/pacing to balance cost vs latency.

