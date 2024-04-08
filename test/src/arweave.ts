// Works but the wallet requires AR funding

import * as fs from "fs";
import * as path from 'path';

const Arweave = require("arweave");
import { JWKInterface } from 'arweave/node/lib/wallet';

// initialize arweave
const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export async function upload(data:object) {
    try {

		// #3 Load our key from the .env file
		let filePath = path.resolve("../keys", "arweave.json");
		const arweaveKey = JSON.parse(fs.readFileSync(filePath).toString()) as JWKInterface

		// #4 Check out wallet balance. We should probably fail if too low? 
		const arweaveWallet = await arweave.wallets.jwkToAddress(arweaveKey);
		const arweaveWalletBallance = await arweave.wallets.getBalance(arweaveWallet);
	
		console.log("balance " + arweaveWalletBallance);

		// #5 Core flow: create a transaction, upload and wait for the status! 
		let transaction = await arweave.createTransaction({data: JSON.stringify(data)}, arweaveKey);
		transaction.addTag('Content-Type', 'app/json');
		await arweave.transactions.sign(transaction, arweaveKey);
		const response = await arweave.transactions.post(transaction);

		console.log(response);
		
		const status = await arweave.transactions.getStatus(transaction.id)
		console.log(`Completed transaction ${transaction.id} with status code ${status}!`)

	    console.log(`https://www.arweave.net/${transaction.id}?ext=json`);

    } catch (e) {
        console.log("Error uploading data ", e);
    }
}

