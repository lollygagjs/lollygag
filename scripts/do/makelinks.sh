#! /bin/sh

yarn

for dir in packages/*/; do
    (cd "$dir" && echo "$dir" && yarn link && echo "Done!")
done
