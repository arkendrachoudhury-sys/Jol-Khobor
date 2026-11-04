#!/usr/bin/env bash
# Run from inside the Jol-Khobor folder. Needs git and the GitHub CLI (gh auth login first).
set -e
git init -b main
git add .
git commit -m "Initial commit: Jol-Khobor flood dashboard demo"
gh repo create Jol-Khobor --public --source=. --push \
  --description "Crowdsourced, verified street-level waterlogging dashboard for Kolkata (demo with simulated data)"
gh repo edit --add-topic flood --add-topic kolkata --add-topic civic-tech --add-topic dashboard
