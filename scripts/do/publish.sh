#! /bin/bash

# Check if 'jq' is installed, and if not, install it
if ! command -v jq >/dev/null; then
    sudo apt install -y jq
fi

# Define a list of valid arguments
valid=(
    --major
    --minor
    --patch
    --premajor
    --preminor
    --prepatch
    --prerelease
)

# Function to check if an argument is valid
isvalidarg() {
    [[ " ${valid[*]} " = *" $1 "* ]]
}

# Check if the first argument is a valid argument
if ! isvalidarg "$1"; then
    echo "Invalid argument: ${1-<none>}"
    echo "Accepted: ${valid[*]}"
    echo "Sample usage: $(basename "$0") ${valid[2]}"
    echo "Exiting..."
    exit 0
fi

# Get a list of uncommitted changes in the git repository
mapfile -t gitdirt < <(git ls-files -o -m --exclude-standard)

# Function to check if a directory is dirty (has uncommitted changes)
isdirty() {
    [[ " ${gitdirt[*]} " =~ $1 ]]
}

# Function to check if a string is a semantic version
issemver() {
    [[ $1 =~ ^v[0-9]+\.+[0-9]+\.+[0-9]+(\-[0-9A-Za-z]+)?$ ]]
}

# Perform a 'yarn do:build' command
yarn do:build

sep="----------------------------"

echo "$sep"

# Iterate over directories in the 'packages' folder
for dir in packages/*/; do
    (
        # Enter the directory
        cd "$dir" || exit

        # Get the last commit message in the directory
        lastmsg=$(git log -1 --pretty=%B .)
        echo "$dir $lastmsg"

        # Check if the directory is dirty (has uncommitted changes)
        if isdirty "$dir"*; then
            echo "Uncommitted changes found. Skipping..."
            echo "$sep"
            exit
        fi

        # Check if the last commit message is a semantic version
        if issemver "$lastmsg"; then
            echo "No changes since last publish. Skipping..."
        else
            # Update the version using the specified argument
            yarn version "$1" --no-git-tag-version
            newver=$(cat <package.json | jq -r .version) # New version from package.json

            # Commit the updated version and publish the package
            git add package.json && git commit -m "v$newver"
            yarn publish --new-version "$newver"
        fi

        echo "$sep"
        exit
    )
done
