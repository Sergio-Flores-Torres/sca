cd program/sca
cargo build-bpf
cd ../..
solana program deploy --keypair ./keys/programowner.json --url localhost ./program/sca/target/deploy/sca.so
