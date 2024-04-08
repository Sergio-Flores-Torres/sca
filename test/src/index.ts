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

const connection = new Connection("http://localhost:8899","finalized");
var seller: Keypair;
var buyer: Keypair;

var arbiters: Keypair[] = [];

async function initOp(ipfsCID:string):Promise<PublicKey> {
    seller = Util.readKey("seller");
    console.log("Using seller " + seller.publicKey.toBase58());

    let result = await SCA.initializeOperation(connection, seller, ipfsCID);
    console.log(JSON.stringify(result));

    let operationAccountInfo = await getAccountData(connection, result, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
	let arr = new Uint8Array(operationAccountInfo.ipfsCid);
	let str = Buffer.from(arr.buffer).toString();
	console.log(str)

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

async function assignBuyer(opInfo: PublicKey) {

	buyer = Util.readKey("buyer");
	console.log("Using buyer " + buyer.publicKey.toBase58());
	let operationAccountPubkey = opInfo;

	let result = await SCA.registerBuyer(connection, buyer, operationAccountPubkey);
	console.log(JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, operationAccountPubkey, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function assignArbiters(opInfo: PublicKey) {

	arbiters.push(Util.readKey("arbiter1"));
	arbiters.push(Util.readKey("arbiter2"));
	arbiters.push(Util.readKey("arbiter3"));

	console.log("Using arbiter 1 " + arbiters[0].publicKey.toBase58());
	console.log("Using arbiter 2 " + arbiters[1].publicKey.toBase58());
	console.log("Using arbiter 3 " + arbiters[2].publicKey.toBase58());

    let operationAccountPubkey = opInfo;

	let result = await SCA.registerArbiter(connection, arbiters[0], operationAccountPubkey);
	console.log(JSON.stringify(result));

	result = await SCA.registerArbiter(connection, arbiters[1], operationAccountPubkey);
	console.log(JSON.stringify(result));

    result = await SCA.registerArbiter(connection, arbiters[2], operationAccountPubkey);
	console.log(JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, operationAccountPubkey, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function approvals(opInfo: PublicKey) {
	let result = await SCA.buyerApproves(connection, buyer, opInfo);
	console.log("Buyer approves " + JSON.stringify(result));
	
    result = await SCA.sellerApproves(connection, seller, opInfo);
	console.log("Seller approves " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function buyerPays(opInfo: PublicKey) {
	let result = await SCA.buyerDeposit(connection, buyer, opInfo);
	console.log("Buyer completed deposit " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());
}

async function buyerClose(opInfo: PublicKey) {
	let result = await SCA.buyerRelease(connection, buyer, seller.publicKey, opInfo);
	console.log("Buyer release " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());

	lamports = await connection.getBalance(seller.publicKey);
	console.log("Seller balance " + lamports.toString());
}

async function sellerRefund(opInfo: PublicKey) {
	let result = await SCA.sellerRefund(connection, seller, buyer.publicKey, opInfo);
	console.log("Seller refund " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());

	lamports = await connection.getBalance(seller.publicKey);
	console.log("Seller balance " + lamports.toString());

}

async function buyerDispute(opInfo: PublicKey) {
	let result = await SCA.startDispute(connection, buyer, opInfo);
	console.log("Buyer dispute " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function sellerDispute(opInfo: PublicKey) {
	let result = await SCA.startDispute(connection, seller, opInfo);
	console.log("Seller dispute " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function sellerInfo(opInfo: PublicKey) {
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

async function buyerInfo(opInfo: PublicKey) {
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

async function arbiterVotes(opInfo: PublicKey) {
	let arbiter1 = Util.readKey("arbiter1");
	console.log("Using arbiter1 " + arbiter1.publicKey.toBase58());

	let result = await SCA.arbiterVote(connection, arbiter1, true, opInfo);
	console.log("Arbiter1 votes " + JSON.stringify(result));

	let arbiter2 = Util.readKey("arbiter2");
	console.log("Using arbiter2 " + arbiter2.publicKey.toBase58());

	result = await SCA.arbiterVote(connection, arbiter2, true, opInfo);
	console.log("Arbiter2 votes " + JSON.stringify(result));

	let arbiter3 = Util.readKey("arbiter3");
	console.log("Using arbiter3 " + arbiter3.publicKey.toBase58());

	result = await SCA.arbiterVote(connection, arbiter3, false, opInfo);
	console.log("Arbiter3 votes " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));
}

async function claim(opInfo: PublicKey) {
	let result = await SCA.participantClaim(connection, seller, opInfo);
	console.log("Seller claim " + JSON.stringify(result));

	let operationAccountInfo = await getAccountData(connection, opInfo, AccountTypes.Operation) as OperationAccountData
    console.log(Util.toJSONString(operationAccountInfo));

	let lamports = await connection.getBalance(buyer.publicKey);
	console.log("Buyer balance " + lamports.toString());

	lamports = await connection.getBalance(seller.publicKey);
	console.log("Seller balance " + lamports.toString());
}

(async () => {

     let opInfo = await recordItemInfo();
     await assignBuyer(opInfo);
     await assignArbiters(opInfo);
     await approvals(opInfo);
     await buyerPays(opInfo);

	 // Normal flow
	 // await buyerClose(opInfo);

	 // Cancel flow
	 // await sellerRefund(opInfo);

	 // Dispute Flow
	 await sellerDispute(opInfo);
	 await sellerInfo(opInfo);
	 await buyerInfo(opInfo);
	 await arbiterVotes(opInfo);
	 await claim(opInfo);
	 /*
     let operationAccountInfo = await getAccountData(connection, 
        opInfo, AccountTypes.Operation) as OperationAccountData
     console.log(Util.toJSONString(operationAccountInfo));
     */

})()