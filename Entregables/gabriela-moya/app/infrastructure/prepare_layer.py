"""Prepare Lambda Layer content for SAM build.

Usage:
    python infrastructure/prepare_layer.py

Generates:
    layer_content/
    ├── python/
    │   └── engine/    ← copied from src/engine/
    └── data/          ← copied from data/

Run before:
    sam build
    sam validate
"""

import os
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

SRC_ENGINE = os.path.join(PROJECT_ROOT, "src", "engine")
SRC_DATA = os.path.join(PROJECT_ROOT, "data")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "layer_content")
OUTPUT_PYTHON = os.path.join(OUTPUT_DIR, "python", "engine")
OUTPUT_DATA = os.path.join(OUTPUT_DIR, "data")


def clean():
    """Remove previously generated layer content."""
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)


def copy_engine():
    """Copy src/engine/ → layer_content/python/engine/."""
    shutil.copytree(
        SRC_ENGINE,
        OUTPUT_PYTHON,
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"),
    )


def copy_data():
    """Copy data/ → layer_content/data/."""
    shutil.copytree(
        SRC_DATA,
        OUTPUT_DATA,
        ignore=shutil.ignore_patterns("__pycache__", ".gitkeep"),
    )


def main():
    print("Preparing Lambda Layer content...")
    clean()
    copy_engine()
    copy_data()

    # Report
    py_files = sum(1 for _, _, files in os.walk(OUTPUT_PYTHON) for f in files if f.endswith(".py"))
    data_files = sum(1 for _, _, files in os.walk(OUTPUT_DATA) for f in files if f.endswith(".json"))
    print(f"  python/engine/: {py_files} Python files")
    print(f"  data/: {data_files} JSON files")
    print(f"  Output: {OUTPUT_DIR}")
    print("Done.")


if __name__ == "__main__":
    main()
