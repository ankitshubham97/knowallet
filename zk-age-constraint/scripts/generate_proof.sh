#!/usr/bin/bash

cd /home/ubuntu/workspace/hawkeye/api/zk-age-constraint/circuit_js
input_file=$(mktemp)
echo $1 > $input_file
node generate_witness.js circuit.wasm $input_file ../witness.wtns
cd ../
snarkjs plonk prove circuit_final.zkey witness.wtns proof1.json public1.json

echo "{ \"proof\": " > e.json
cat proof1.json >> e.json
echo ", \"public\": " >> e.json
cat public1.json >> e.json
echo "}" >> e.json

rm proof1.json public1.json $input_file
cat e.json | jq -c .