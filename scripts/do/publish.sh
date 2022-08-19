#! /bin/sh

# Install jq if not already installed
if ! command -v jq >/dev/null; then
    sudo apt install -y jq
fi

# Array of valid arguments
valid=(
    --major
    --minor
    --patch
    --premajor
    --preminor
    --prepatch
    --prerelease
)

# Checks if `$1` (string literal) is found in `$valid`
isvalidarg() {
    [[ " ${valid[*]} " = *" $1 "* ]]
}

# Exit if argument is empty or invalid
if ! isvalidarg "$1"; then
    echo "Invalid argument: ${1-<none>}"
    echo "Accepted: ${valid[*]}"
    echo "Sample usage: $(basename "$0") ${valid[2]}"
    echo "Exiting..."
    exit 0
fi

# Array of uncommitted and untracked files in git
gitdirt=($(git ls-files -o -m --exclude-standard))

# Checks if `$1` (pattern or string literal) is found in `$gitdirt`
isdirty() {
    [[ " ${gitdirt[*]} " =~ $1 ]]
}

# Check if `$1` is a valid `v` preceded semver
issemver() {
    [[ $1 =~ ^v[0-9]+\.+[0-9]+\.+[0-9]+(\-[0-9A-Za-z]+)?$ ]]
}

# Run build before attempting to bump and publish
yarn do:build

sep="----------------------------"

echo "$sep"

for dir in packages/*/; do
    (
        cd "$dir" || exit
        # Last commit message for current `$dir`
        lastmsg=$(git log -1 --pretty=%B .)
        echo "$dir $lastmsg"

        # Skip if current `$dir` has uncommitted changes
        if isdirty "$dir"*; then
            echo "Uncommitted changes found. Skipping..."
            echo "$sep"
            exit
        fi

        # Skip if `$lastmsg` is a semver
        if issemver "$lastmsg"; then
            echo "No changes since last publish. Skipping..."
        else
            yarn version "$1" --no-git-tag-version
            newver=$(cat <package.json | jq -r .version) # New version from package.json
            git add "${dir}package.json" && git commit -m "v$newver"
            yarn publish --new-version "$newver"
        fi

        echo "$sep"
        exit
    )
done
