#! /bin/sh

# Install jq if not already installed
if ! command -v jq >/dev/null; then
    sudo apt install -y jq
fi

# List of valid arguments
valid=(
    --major,
    --minor,
    --patch,
    --premajor,
    --preminor,
    --prepatch,
    --prerelease
)

# Check if `$1` (string literal) is found in `$valid`
isvalidarg() {
    [[ "${valid[@]}" = $1 ]]
}

# Exit if argument is empty or invalid
if ! isvalidarg "$1"; then
    echo "Invalid argument: ${1-<none>}"
    echo "Accepted values are ${valid[@]}"
    echo "Sample usage: $(basename $0) ${valid[2]}"
    echo "Exiting..."
    exit 0
fi

# List of uncommitted and untracked files in git
gitdirt=($(git ls-files -o -m --exclude-standard))

# Checks if `$1` (pattern or string literal) is found in `$gitdirt`
isdirty() {
    [[ "${gitdirt[@]}" = $1 ]]
}

# Check if `$1` is a valid `v` preceded semver
issemver() {
    [[ $1 =~ ^v[0-9]+\.+[0-9]+\.+[0-9]+(\-[0-9A-Za-z]+)?$ ]]
}

sep="----------------------------"

echo "$sep"

for dir in packages/*/; do
    (
        cd "$dir"

        lastmsg=$(git log -1 --pretty=%B .)

        echo "$dir $lastmsg"

        # Skip if current `$dir` has uncommitted changes
        if isdirty "$dir"*; then
            echo "Uncommitted changes found. Skipping..."
            echo "$sep"
            exit 0
        fi

        # Skip if `$lastmsg` is a semver
        if issemver "$lastmsg"; then
            echo "No changes since last publish. Skipping..."
        else
            echo "Will version and publish..."
            # yarn version $1 --no-git-tag-version
            # newver=$(cat package.json | jq -r .version) # Get new version from package.json
            # yarn publish --new-version "$newver"
            # git add "${dir}package.json"
            # git commit -m "v$newver"
        fi

        echo "$sep"
        exit 0
    )
done
