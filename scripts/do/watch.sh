#! /bin/bash

pkgs=

for dir in packages/*/; do
    pkgs+="$(basename "$dir") "
done

mapfile -t pkgsarray < <(echo "$pkgs")

isvalidarg() {
    [[ " ${pkgsarray[*]} " = *" $1 "* ]]
}

# Exit if argument is empty or invalid
if ! isvalidarg "$1"; then
    echo "Invalid package name: ${1-<none>}"
    echo "Accepted: ${pkgsarray[*]}"
    echo "Sample usage: $(basename "$0") ${pkgsarray[2]}"
    echo "Exiting..."
    exit
fi

(cd "packages/$1" || exit && yarn start)
