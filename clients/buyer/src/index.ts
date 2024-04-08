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
var buyer: Keypair;
var opInfo: PublicKey = new PublicKey(process.env.OPERATION);
buyer = Util.readKey("buyer");

async function assignBuyer() {
	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
	let arr = new Uint8Array(operationAccountInfo.ipfsCid);
	let ipfsStr = Buffer.from(arr.buffer).toString();

	// Prints to console the IPFS stored data for verification
	await download(ipfsStr);

	console.log("Using buyer " + buyer.publicKey.toBase58());

	let result = await SCA.registerBuyer(connection, buyer, opInfo);
	console.log(JSON.stringify(result));

	operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

}

async function approveArbiters() {	
    let result = await SCA.buyerApproves(connection, buyer, opInfo);
	console.log("Buyer approves " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function buyerPays() {
	let result = await SCA.buyerDeposit(connection, buyer, opInfo);
	console.log("Buyer completed deposit " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());
}

async function buyerClose() {
	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let result = await SCA.buyerRelease(connection, buyer, operationAccountInfo.seller, opInfo);
	console.log("Buyer release " + JSON.stringify(result));

	operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());
}

async function buyerDispute() {
	let result = await SCA.startDispute(connection, buyer, opInfo);
	console.log("Buyer dispute " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function buyerInfo() {
    let obj = {
        name: "Used Macbook Air 13",
        desc: "bla bla bla",
        price: "1000",
        token: "Sol",
    };
    let ipfsCID = await upload(obj);

	let result = await SCA.buyerAddInfo(connection, buyer, ipfsCID, opInfo);
	console.log("Buyer added info " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function claim() {
	let result = await SCA.participantClaim(connection, buyer, opInfo);
	console.log("Buyer claim " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());
}

async function requestInput() {
	console.log("Available functions:");
	console.log("register -> Register yourself as buyer in an operation.");
	console.log("approve -> Seller/Buyer approves of registered arbiters.");
	console.log("deposit -> Buyer deposits token amount.");
	console.log("release -> Buyer releases the token amount.");
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
			case "register": 
				try {await assignBuyer();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "approve": 
				try {await approveArbiters();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "deposit": 
				try {await buyerPays();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "release": 
				try {await buyerClose();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "dispute": 
				try {await buyerDispute();}
				catch(err) {console.error(err)} 

				await requestInput();
				break;

			case "info": 
				try {await buyerInfo();}
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
	 console.log("sca-buyer cli starting...");
	 await requestInput();
})()