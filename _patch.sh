#! /bin/sh

# install jq if not already installed
if ! command -v jq >/dev/null; then
    sudo apt install -y jq
fi

issemver() {
    [[ $1 =~ ^v[0-9]+\.+[0-9]+\.+[0-9]+(\-[0-9A-Za-z]+)?$ ]]
}

# TODO:
# yarn version --patch --no-git-tag-version
# this will disable automatic commits of updated package.json files
# add a way to make git commit changes with the message `v<$newver>`

for dir in "${1:-packages}"/*/; do
    (
        cd "$dir" \
        && lastmsg=$(git log -1 --pretty=%B .) \
        && echo "$dir $lastmsg" \
        && \
        if ! issemver "$lastmsg"; then
            yarn version --patch \
            && newver=$(cat package.json | jq -r .version) `# get new version from package.json` \
            && yarn publish --new-version "$newver"
        else echo "No changes to publish";
        fi
    )
done
