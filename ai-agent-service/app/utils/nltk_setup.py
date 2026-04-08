import logging
import os
from pathlib import Path

import nltk


logger = logging.getLogger(__name__)

NLTK_DATA_DIR = Path(__file__).resolve().parents[2] / "nltk_data"
REQUIRED_RESOURCES = ("wordnet", "omw-1.4")


def configure_nltk_data_path() -> Path:
    data_dir = Path(os.getenv("NLTK_DATA", str(NLTK_DATA_DIR))).resolve()
    data_dir.mkdir(parents=True, exist_ok=True)

    data_dir_str = str(data_dir)
    if data_dir_str not in nltk.data.path:
        nltk.data.path.insert(0, data_dir_str)

    return data_dir


def ensure_nltk_resources(download_if_missing: bool = False) -> Path:
    data_dir = configure_nltk_data_path()

    for resource in REQUIRED_RESOURCES:
        try:
            nltk.data.find(f"corpora/{resource}")
        except LookupError:
            if not download_if_missing:
                raise

            logger.warning("NLTK resource '%s' missing. Downloading to %s", resource, data_dir)
            nltk.download(resource, download_dir=str(data_dir), quiet=True, raise_on_error=True)

    return data_dir
