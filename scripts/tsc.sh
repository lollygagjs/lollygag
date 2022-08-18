#! /bin/sh

pkgs=

for dir in packages/*/; do
    pkgs+="$(basename "$dir") "
done

pkgsarray=($(echo "$pkgs"))

isvalidarg() {
    [[ " ${pkgsarray[*]} " = *" $1 "* ]]
}

# Exit if argument is empty or invalid
if ! isvalidarg "$1"; then
    echo "Invalid package name: ${1-<none>}"
    echo "Accepted: ${pkgsarray[*]}"
    echo "Sample usage: $(basename "$0") ${pkgsarray[2]}"
    echo "Exiting..."
    exit 0
fi

(cd "packages/$1" || exit 0 && yarn start)
