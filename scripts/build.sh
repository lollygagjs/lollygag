#! /bin/sh

for dir in packages/*/; do
  (cd "$dir" && echo "$dir" && yarn build && echo "Done!" && exit 0)
done
