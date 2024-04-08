import * as fs from 'fs';
import * as path from 'path';

import {
    Connection, Keypair, PublicKey,
    Transaction, TransactionInstruction,
    sendAndConfirmTransaction
} from "@solana/web3.js";

export function readKey(fileName: string) {
    try {
        let stringfile = path.resolve("../keys", fileName + ".json");
        let fileval = fs.readFileSync(stringfile);
        let privatekey = new Uint8Array(JSON.parse(fileval.toString()));
    
        return Keypair.fromSecretKey(privatekey)
    } catch (err) {
        console.log("Not a valid Keypair. ERR: " + err);
        return null;
    }
}

export function toJSONString(obj: Object) {
    return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    );
}