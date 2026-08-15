#!/usr/bin/env sh
set -e
npm run build
wrangler pages deploy dist --project-name astra-app
