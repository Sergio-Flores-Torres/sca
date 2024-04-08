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
import { download, upload } from "./pinata"

const connection = new Connection(process.env.URL,"finalized");
var seller: Keypair;
var opInfo: PublicKey = new PublicKey(process.env.OPERATION);
seller = Util.readKey("seller");

async function initOp(ipfsCID:string):Promise<PublicKey> {
    console.log("Using seller " + seller.publicKey.toBase58());

    let result = await SCA.initializeOperation(connection, seller, ipfsCID);
    console.log(JSON.stringify(result));

    let operationAccountInfo = await getAccountData(connection, result, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
	let arr = new Uint8Array(operationAccountInfo.ipfsCid);
	let str = Buffer.from(arr.buffer).toString();
	console.log("IPFS: " + str)

	return result;
}

async function recordItemInfo(): Promise<PublicKey> {

    let obj = {
        name: "Used Macbook Air 13",
        desc: "bla bla bla",
        price: "1000",
        token: "Sol",
    };
    let ipfsCID = await upload(obj);
	let opInfo = await initOp(ipfsCID);
	return opInfo;
}

async function approveArbiters() {	
    let result = await SCA.sellerApproves(connection, seller, opInfo);
	console.log("Seller approves " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function sellerRefund() {
	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let result = await SCA.sellerRefund(connection, seller, operationAccountInfo.buyer, opInfo);
	console.log("Seller refund " + JSON.stringify(result));

	operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function sellerDispute() {
	let result = await SCA.startDispute(connection, seller, opInfo);
	console.log("Seller dispute " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function sellerInfo() {
    let obj = {
        name: "Used Macbook Air 13",
        desc: "bla bla bla",
        price: "1000",
        token: "Sol",
    };
    let ipfsCID = await upload(obj);

	let result = await SCA.sellerAddInfo(connection, seller, ipfsCID, opInfo);
	console.log("Seller added info " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function claim() {
	let result = await SCA.participantClaim(connection, seller, opInfo);
	console.log("Seller claim " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(seller.publicKey);
	console.log("Seller balance " + lamports.toString());
}

async function requestInput() {
	console.log("Available functions:");
	console.log("init -> Upload JSON to IPFS and initializes an operation.");
	console.log("approve -> Seller/Buyer approves of registered arbiters.");
	console.log("refund -> Seller cancels the op and issues buyer a refund.");
	console.log("dispute -> Seller/Buyer initiates a dispute.");
	console.log("info -> Upload additional info for a dispute.");
	console.log("claim -> Seller/Buyer claims the tokens.");
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
			case "init": 
				try {opInfo = await recordItemInfo();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "approve": 
				try {await approveArbiters();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "refund": 
				try {await sellerRefund();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "dispute": 
				try {await sellerDispute();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "info": 
				try {await sellerInfo();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "claim": 
				try {await claim();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			default:
		}

	});
}

(async () => {
	 console.log("sca-seller cli starting...");
	 await requestInput();
})()