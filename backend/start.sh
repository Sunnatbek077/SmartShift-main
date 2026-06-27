#!/usr/bin/env bash
# Backend serverni ishga tushiradi.
# Ishlatish: cd backend && ./start.sh
set -e
cd "$(dirname "$0")"
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
