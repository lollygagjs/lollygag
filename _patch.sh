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
        then yarn version --patch && yarn publish;
        else echo "$lastmsg is not semver";
        fi
    )
done
