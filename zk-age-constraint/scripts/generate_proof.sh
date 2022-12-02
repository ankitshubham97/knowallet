cd /home/ubuntu/workspace/hawkeye/api/zk-age-constraint/circuit_js
node generate_witness.js circuit.wasm ../input.json ../witness.wtns
cd ../
./node_modules/.bin/snarkjs plonk prove circuit_final.zkey witness.wtns proof.json public.json
rm witness.wtns

echo "{ \"proof\": " > e.json
cat proof.json >> e.json
echo ", \"public\": " >> e.json
cat public.json >> e.json
echo "}" >> e.json

cat e.json | jq -c .
rm e.json