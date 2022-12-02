cd /home/ubuntu/workspace/hawkeye/api/zk-age-constraint/
proof_json_file=$(mktemp)
public_json_file=$(mktemp)
echo $1 > $proof_json_file
echo $2 > $public_json_file
./node_modules/.bin/snarkjs zkey export soliditycalldata $public_json_file $proof_json_file