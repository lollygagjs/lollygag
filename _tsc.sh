#! /bin/sh

for dir in "${1:-packages}"/*/; do
  ( cd "$dir" && echo "$dir" && npx tsc -d )
done
