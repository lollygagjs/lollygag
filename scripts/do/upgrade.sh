#! /bin/sh

for dir in packages/*/; do
    if [[ $dir != packages/core/ ]]; then
        (cd "$dir" && echo "$dir" && yarn upgrade @lollygag/core && echo "Done!")
    fi
done
