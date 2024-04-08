import {
    Connection, Keypair, PublicKey,
    SystemProgram,
    Transaction, TransactionInstruction,
    sendAndConfirmTransaction, 
} from "@solana/web3.js";

import * as borsh from 'borsh';
import { Buffer } from 'buffer';

import { u32, u8, struct, Layout, seq, Sequence } from "@solana/buffer-layout";
import { publicKey, u64, bool } from "@solana/buffer-layout-utils";

export const enum TokenVersion {
	Sol = 0,
};

export const enum OperationStatus {
	Closed = 0,
	Opened = 1,
};

export const enum AccountTypes {
	Operation = 0,
}

export const enum Participant {
	Buyer = 0,
	Seller = 1,
};

export const enum VotingOptions {
	NoVote = 0,
	Buyer = 1,
	Seller = 2,
}

export const PREFIX = "saftsca";

export interface OperationAccountData {
	status: OperationStatus;
	createdAt: bigint;
	tokenVersion: TokenVersion;
	value: bigint;
	seller: PublicKey;
	buyer: PublicKey;
	ipfsCid: number[];
	arbiter1: PublicKey;
	arbiter2: PublicKey;
	arbiter3: PublicKey;
	sellerApproved: boolean;
	buyerApproved: boolean;
	sellerIpfsExt: number[];
	buyerIpfsExt: number[];
	arbiterVote1: VotingOptions;
	arbiterVote2: VotingOptions;
	arbiterVote3: VotingOptions;
}

export const OperationAccountDataLayout = struct<OperationAccountData>([
	u8('status'),
	u64('createdAt'),
	u8('tokenVersion'),
	u64('value'),
    publicKey('seller'),
    publicKey('buyer'),
	seq(u8(), 46, 'ipfsCid'),
	publicKey('arbiter1'),
	publicKey('arbiter2'),
	publicKey('arbiter3'),
	bool('sellerApproved'),
	bool('buyerApproved'),
	seq(u8(), 46, 'sellerIpfsExt'),
	seq(u8(), 46, 'buyerIpfsExt'),
	u8('arbiterVote1'),
	u8('arbiterVote2'),
	u8('arbiterVote3'),
]);

export async function getAccountData(connection: Connection, accountPubkey: PublicKey,
	accountType: AccountTypes): Promise<any> {
	const accountInfo = await connection.getAccountInfo(accountPubkey);

	if (accountInfo === null) {
		throw 'Error: cannot find the DATA account';
	}

	let lamports = await connection.getBalance(accountPubkey);

	let deserializedRes = null;

	switch (accountType) {
		case AccountTypes.Operation:
			deserializedRes = OperationAccountDataLayout.decode(accountInfo.data);
			break;
	}

	console.log("Balance: " + lamports.toString());
	return deserializedRes;	
}

export async function createNewDataAccount(connection: Connection, payer: Keypair, 
	programId: PublicKey, accountType: AccountTypes) : Promise<PublicKey> {

	let seed = PREFIX + Date.now().toString();	
	let accountPubkey = await PublicKey.createWithSeed(
		payer.publicKey,
		seed,
		programId
	);
	
	let dataSize = 0;

	switch (accountType) {
		case AccountTypes.Operation:
			dataSize = OperationAccountDataLayout.span;
			break;
	}
	const lamports = await connection.getMinimumBalanceForRentExemption(dataSize);

	const transaction = new Transaction().add(
		SystemProgram.createAccountWithSeed({
			fromPubkey: payer.publicKey,
			basePubkey: payer.publicKey,
			seed: seed,
			newAccountPubkey: accountPubkey,
			lamports,
			space: dataSize,
			programId
		}),
	);

	await sendAndConfirmTransaction(connection, transaction, [payer]);
	console.log(`Account created ${accountPubkey.toBase58()} to store Information...`);

	return accountPubkey;
}



