#!/bin/bash
# Run browser tests with timeout - exits automatically when done

cd "$(dirname "$0")"
npm run test:browser -- tests/browser/09-multi-card-selection.spec.js
exit $?

