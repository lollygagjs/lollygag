#! /bin/bash

yarn
yarn do:makelinks
yarn do:linkcore

for dir in packages/*/; do
    (cd "$dir" && echo "$dir" && yarn && echo "Done!")
done
