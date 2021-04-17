#!/bin/sh
# Run as './scripts/find-unused-strings.sh'
# from the top-level edge-react-gui folder.

strings=$(jq -r 'keys[]' src/common/locales/strings/enUS.json)

for string in $strings; do
  count=$(git grep -c "$string" | grep -v src/common/locales/strings/ | wc -l)
  # echo $count $string
  if [ $count -le 0 ]; then
    echo unused: $string
  fi
done
