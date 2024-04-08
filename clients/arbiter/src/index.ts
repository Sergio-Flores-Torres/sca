import {
    Connection, Keypair, PublicKey,
    Transaction, TransactionInstruction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";

import * as Util from "./util";
import * as SCA from "./sca";

import * as fs from 'fs';
import * as path from 'path';
import { AccountTypes, OperationAccountData, getAccountData } from "./type";
import { download } from "./pinata"

const connection = new Connection(process.env.URL,"finalized");
var arbiter: Keypair;
var opInfo: PublicKey = new PublicKey(process.env.OPERATION);

arbiter = Util.readKey("arbiter");

async function assignArbiter() {

	console.log("Using arbiter " + arbiter.publicKey.toBase58());

	let result = await SCA.registerArbiter(connection, arbiter, opInfo);
	console.log(JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function review() {
	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let arr1 = new Uint8Array(operationAccountInfo.ipfsCid);
	let ipfsstr1 = Buffer.from(arr1.buffer).toString();
	console.log("Info IPFS " + ipfsstr1);

	let arr2 = new Uint8Array(operationAccountInfo.sellerIpfsExt);
	let ipfsstr2 = Buffer.from(arr2.buffer).toString();
	console.log("Seller IPFS " + ipfsstr2);

	let arr3 = new Uint8Array(operationAccountInfo.buyerIpfsExt);
	let ipfsstr3 = Buffer.from(arr3.buffer).toString();
	console.log("Buyer IPFS " + ipfsstr3);

	await download(ipfsstr1);
	await download(ipfsstr2);
	await download(ipfsstr3);
}

async function arbiterVotes() {
	console.log("Using arbiter " + arbiter.publicKey.toBase58());

	let result = await SCA.arbiterVote(connection, arbiter, false, opInfo);  // Vote here, TRUE for SELLER, FALSE for BUYER
	console.log("Arbiter votes " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}


async function requestInput() {
	console.log("Available functions:");
	console.log("register -> Register yourself as arbiter in an operation.");
	console.log("download -> Arbiter downloads info.");
	console.log("vote -> Arbiter votes.");
	console.log("[Any key] -> Quit tool");

	// Execute Tests
	const readline = require('readline');
	const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
	});
	
	rl.question('Your choice? ', async function (task: string) {
		console.log(task);
		rl.close();

		switch (task) {
			case "register": 
				try {await assignArbiter();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "download": 
				try {await review();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "vote": 
				try {await arbiterVotes();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			default:
		}

	});
}

(async () => {
	 console.log("sca-arbiter cli starting...");
	 await requestInput();
})()