#! /bin/sh

for dir in packages/*/; do
  (cd "$dir" && echo "$dir" && npx tsc)
done
