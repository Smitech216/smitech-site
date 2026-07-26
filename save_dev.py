#!/usr/bin/env python3
"""Sauvegarde les changements sur main avec un message de commit incrémenté."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent


def run_git(*args: str, capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        text=True,
        capture_output=capture_output,
        check=True,
    )


def get_next_dev_number() -> int:
    logs = run_git("log", "--oneline", "--decorate", "--all").stdout.splitlines()
    numbers = []
    for line in logs:
        match = re.search(r"save dev(\d+)", line)
        if match:
            numbers.append(int(match.group(1)))
    return max(numbers, default=0) + 1


def main() -> None:
    run_git("checkout", "main")
    run_git("pull", "--ff-only", "origin", "main")

    status = run_git("status", "--porcelain").stdout.strip()
    if status:
        dev_number = get_next_dev_number()
        run_git("add", "-A")
        run_git("commit", "-m", f"save dev{dev_number}")
        print(f"Commit créé sur main : save dev{dev_number}")
    else:
        print("Aucun changement à committer.")

    run_git("push", "origin", "main")
    print("Poussé sur main")


if __name__ == "__main__":
    main()
