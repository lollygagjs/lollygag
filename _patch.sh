#! /bin/sh

issemver() {
    [[ $1 =~ ^v[0-9]+\.+[0-9]+\.+[0-9]+(\-[0-9A-Za-z]+)?$ ]]
}

for dir in "${1:-packages}"/*/; do
    (
        cd "$dir" \
        && lastmsg=$(git log -1 --pretty=%B .) \
        && echo "$dir $lastmsg" \
        && \
        if ! issemver "$lastmsg";
        then yarn version --patch --no-git-tag-version && yarn publish
        else echo "No changes to publish";
        fi
    )
done
