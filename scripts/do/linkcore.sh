#! /bin/bash

for dir in packages/*/; do
    if [[ $dir != packages/core/ ]]; then
        (cd "$dir" && echo "$dir" && yarn link @lollygag/core && echo "Done!")
    fi
done
