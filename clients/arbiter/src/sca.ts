import {
    Connection, Keypair, PublicKey,
    Transaction, TransactionInstruction,
    sendAndConfirmTransaction, SystemProgram,
} from "@solana/web3.js";

import { createArbiterVoteInstruction, createBuyerAddInfoInstruction, createBuyerDepositInstruction, createBuyerReleaseInstruction, createInitializeOperationInstruction, createParticipantApprovesArbitersInstruction, createParticipantClaimInstruction, createRegisterArbiterInstruction, createRegisterBuyerInstruction, createSellerAddInfoInstruction, createSellerRefundInstruction, createStartDisputeInstruction } from "./instruction";
import { AccountTypes, Participant, TokenVersion, createNewDataAccount } from "./type";

const programId = new PublicKey(process.env.PROGRAMID);

export async function initializeOperation(conn: Connection, seller: Keypair, ipfsCID: string): Promise<PublicKey> {  

 	let operationAccountPubkey = await createNewDataAccount(conn, seller, programId, AccountTypes.Operation);
	console.log ("OPERATION ACCOUNT:" + operationAccountPubkey.toBase58());

    let tx = new Transaction();
    tx.add(
        new TransactionInstruction({
          keys: [
                {pubkey: seller.publicKey, isSigner: true, isWritable: true}, // SELLER
                {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
            ],
          data: createInitializeOperationInstruction(BigInt(1000), TokenVersion.Sol, ipfsCID),
          programId: programId,
        })
      );

    let sig = await sendAndConfirmTransaction(conn, tx, [seller]);

    return operationAccountPubkey;
}

export async function registerBuyer(conn: Connection, buyer: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

   let tx = new Transaction();
   tx.add(
	   new TransactionInstruction({
		 keys: [
			   {pubkey: buyer.publicKey, isSigner: true, isWritable: true}, // BUYER
			   {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		   ],
		 data: createRegisterBuyerInstruction(),
		 programId: programId,
	   })
	 );

   let sig = await sendAndConfirmTransaction(conn, tx, [buyer]);

   return sig;
}

export async function registerArbiter(conn: Connection, arbiter: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

  let tx = new Transaction();
  tx.add(
    new TransactionInstruction({
    keys: [
        {pubkey: arbiter.publicKey, isSigner: true, isWritable: true}, // BUYER
        {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
      ],
    data: createRegisterArbiterInstruction(),
    programId: programId,
    })
  );

  let sig = await sendAndConfirmTransaction(conn, tx, [arbiter]);

  return sig;
}

export async function sellerApproves(conn: Connection, seller: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

  let tx = new Transaction();
  tx.add(
    new TransactionInstruction({
    keys: [
        {pubkey: seller.publicKey, isSigner: true, isWritable: true}, // BUYER
        {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
      ],
    data: createParticipantApprovesArbitersInstruction(Participant.Seller),
    programId: programId,
    })
  );

  let sig = await sendAndConfirmTransaction(conn, tx, [seller]);

  return sig;
}

export async function buyerApproves(conn: Connection, buyer: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

  let tx = new Transaction();
  tx.add(
    new TransactionInstruction({
    keys: [
        {pubkey: buyer.publicKey, isSigner: true, isWritable: true}, // BUYER
        {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
      ],
    data: createParticipantApprovesArbitersInstruction(Participant.Buyer),
    programId: programId,
    })
  );

  let sig = await sendAndConfirmTransaction(conn, tx, [buyer]);

  return sig;
}

export async function buyerDeposit(conn: Connection, buyer: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

  let tx = new Transaction();
  tx.add(
    new TransactionInstruction({
    keys: [
        {pubkey: buyer.publicKey, isSigner: true, isWritable: true}, // BUYER
        {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
        {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}, // OPERATIONACCOUNT
      ],
    data: createBuyerDepositInstruction(),
    programId: programId,
    })
  );

  let sig = await sendAndConfirmTransaction(conn, tx, [buyer]);

  return sig;
}

export async function buyerRelease(conn: Connection, buyer: Keypair,
	seller: PublicKey, operationAccountPubkey: PublicKey) :Promise<string> {  

	let tx = new Transaction();
	tx.add(
	  new TransactionInstruction({
	  keys: [
		  {pubkey: buyer.publicKey, isSigner: true, isWritable: true}, // BUYER
		  {pubkey: seller, isSigner: false, isWritable: true}, // SELLER
		  {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		],
	  data: createBuyerReleaseInstruction(),
	  programId: programId,
	  })
	);
  
	let sig = await sendAndConfirmTransaction(conn, tx, [buyer]);
  
	return sig;
}

export async function sellerRefund(conn: Connection, seller: Keypair,
	buyer: PublicKey, operationAccountPubkey: PublicKey) :Promise<string> {  

	let tx = new Transaction();
	tx.add(
	  new TransactionInstruction({
	  keys: [
		  {pubkey: seller.publicKey, isSigner: true, isWritable: true}, // BUYER
		  {pubkey: buyer, isSigner: false, isWritable: true}, // SELLER
		  {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		],
	  data: createSellerRefundInstruction(),
	  programId: programId,
	  })
	);
  
	let sig = await sendAndConfirmTransaction(conn, tx, [seller]);
  
	return sig;
}

export async function startDispute(conn: Connection, participant: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

	let tx = new Transaction();
	tx.add(
	  new TransactionInstruction({
	  keys: [
		  {pubkey: participant.publicKey, isSigner: true, isWritable: true}, // BUYER
		  {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		],
	  data: createStartDisputeInstruction(),
	  programId: programId,
	  })
	);
  
	let sig = await sendAndConfirmTransaction(conn, tx, [participant]);
  
	return sig;
}

export async function sellerAddInfo(conn: Connection, seller: Keypair, 
	ipfsCID: string, operationAccountPubkey: PublicKey): Promise<string> {  

   let tx = new Transaction();
   tx.add(
	   new TransactionInstruction({
		 keys: [
			   {pubkey: seller.publicKey, isSigner: true, isWritable: true}, // SELLER
			   {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		   ],
		 data: createSellerAddInfoInstruction(ipfsCID),
		 programId: programId,
	   })
	 );

   let sig = await sendAndConfirmTransaction(conn, tx, [seller]);

   return sig;
}

export async function buyerAddInfo(conn: Connection, buyer: Keypair, 
	ipfsCID: string, operationAccountPubkey: PublicKey): Promise<string> {  

   let tx = new Transaction();
   tx.add(
	   new TransactionInstruction({
		 keys: [
			   {pubkey: buyer.publicKey, isSigner: true, isWritable: true}, // SELLER
			   {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		   ],
		 data: createBuyerAddInfoInstruction(ipfsCID),
		 programId: programId,
	   })
	 );

   let sig = await sendAndConfirmTransaction(conn, tx, [buyer]);

   return sig;
}

export async function arbiterVote(conn: Connection, arbiter: Keypair, 
	vote: boolean, operationAccountPubkey: PublicKey): Promise<string> {  

   let tx = new Transaction();
   tx.add(
	   new TransactionInstruction({
		 keys: [
			   {pubkey: arbiter.publicKey, isSigner: true, isWritable: true}, // SELLER
			   {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		   ],
		 data: createArbiterVoteInstruction(vote),
		 programId: programId,
	   })
	 );

   let sig = await sendAndConfirmTransaction(conn, tx, [arbiter]);

   return sig;
}

export async function participantClaim(conn: Connection, participant: Keypair, operationAccountPubkey: PublicKey) :Promise<string> {  

	let tx = new Transaction();
	tx.add(
	  new TransactionInstruction({
	  keys: [
		  {pubkey: participant.publicKey, isSigner: true, isWritable: true}, // BUYER
		  {pubkey: operationAccountPubkey, isSigner: false, isWritable: true}, // OPERATIONACCOUNT
		],
	  data: createParticipantClaimInstruction(),
	  programId: programId,
	  })
	);
  
	let sig = await sendAndConfirmTransaction(conn, tx, [participant]);
  
	return sig;
}