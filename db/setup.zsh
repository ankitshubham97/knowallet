#! /usr/bin/env zsh

set -eEuo pipefail

# Move into db folder
cd db/

if [[ ! -z ${NODE_ENV+unset} ]]; then
    echo "NODE_ENV is set, exiting"
    exit 1
fi

# Uncomment the following `exit 1` command and supply the required env variables.
echo "Uncomment the 'exit 1' command in the script and supply the required env variables." && exit 1

# This should only run on localhost
export PGHOST=
export PGDATABASE=
export PGUSER=
export PGPASSWORD=
export PGPORT=

# Need to run sequelize-cli from db folder
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

cd -
