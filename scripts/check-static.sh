#!/usr/bin/env bash
set -euo pipefail

npm run lint
npm run build
npm run audit
node -e "JSON.parse(require('fs').readFileSync('package-lock.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8'));"
test -f public/env.js
test -f nginx.conf
