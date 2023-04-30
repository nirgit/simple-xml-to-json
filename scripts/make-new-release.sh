#!/bin/bash
echo ">>>>>>>>> preparing for a new release!"

LATEST_VERSION=$(npm view simple-xml-to-json version)
NEXT_VERSION=$(grep -o "\"version\": \".*\"" package.json | cut -d'"' -f4)

if [ "$(printf '%s\n' "$NEXT_VERSION" "$LATEST_VERSION" | sort -V | head -n1)" == "$NEXT_VERSION" ]; then
  echo "Next version ($NEXT_VERSION) is not greater than latest published version ($LATEST_VERSION). Aborting."
  exit 1
fi

rm -rf ./lib/
mkdir lib 
npm i
npx rollup -c

npm publish --dry-run
echo ">>>>>>>>> Version $NEXT_VERSION is ready to be published!
