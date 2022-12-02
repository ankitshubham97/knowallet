## Installing deps

```
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
cd ~
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
```

## Interacting with this project
1. yarn compile
2. yarn genkey
3. yarn genProof
4. yarn verifyProof
5. yarn genContract
6. yarn genCalldata

compile generates:
circuit_js/circuit.wasm
circuit_js/generate_witness.js
circuit_js/witness_calculator.js
circuit.syn
circuit.r1cs

genKey generates:
circuit_final.zkey
verification_key.json

genProof generates: (takes in input.json)
proof.json -> store in db
public.json -> store in db

verifyProof generates:
nothing

genContract generates: (takes in circuit_final.zkey)
verifier.sol

genCalldata generates: (takes in proof.json, public.json)
calldata string