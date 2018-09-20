#!/bin/sh

cd "$(dirname "$0")"
DIR=$(pwd)

$DIR/script/dev-setup

if ! [ -x "$(command -v ttab)" ]; then
  echo 'Error: ttab is not installed. See: https://www.npmjs.com/package/ttab' >&2
  echo 'using `heroku local -f Procfile.development`'
  heroku local -f Procfile.development
else
  # echo 'Running rails server...'
  ttab bin/rails server
  # echo 'Starting heroku local to run webpack-dev-server...'
  ttab heroku local webpack,worker -f Procfile.development
  # echo 'Opening atom...'
  ttab 'atom . && open http://localhost:3000'
fi
