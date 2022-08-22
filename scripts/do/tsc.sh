#! /bin/sh

for dir in packages/*/; do
    (cd "$dir" && echo "$dir" && npx tsc -d && echo "Done!")
done
