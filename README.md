# SCA 
## Solana Commerce Application

### Description

A Solana blockchain tool designed as Proof-Of-Concept, to illustrate how blockchain can be used to tackle real world problems. The particular problem we are addressing here is the lack of safety when selling items over the internet. 

Consider the following scenario:

Alice has an used computer that she wants to sell, but she lives in a small town, and has had problems finding an interested buyer, so she advertises it on the Internet and finds someone interested on the other side of the country (or the other side of the world, for that matter).

Bob wants to purchase the computer, and they have agreed on the price and reviewed the details.

Now, the problem is, that since they don't know anything about each other, they have a trust issue. Can Alice send the computer and trust that Bob will pay for it? Can Bob send Alice a payment, and trust that the computer will arrive safely?

Over time, solutions have been proposed for this problem, generally involving a company, acting as a middle-man, overseeing the transaction, and charging a fee for it, and that is viable. However, I wanted to offer an alternative, what we could call a "community based" solution, in which, instead of a company overseeing the transaction, voluntary members of the public participate as "arbiters". 

### Solana blockchain

Following with the example, if a company is to act as the middle-man, that company needs to keep records of the transaction, in a public or semi-public manner, and blockchains, already, by design, have this feature enabled; in addition, Solana offers excellent programming and security features that make it ideal to explore possible implementations of a solution in this problem space. Furthermore, a blockchain solution offers the added benefit of having the data in a public space, not tied to any particular party to the transaction.

### How does it work

A sale of an item is called an "Operation" in the context of this program. And it has 2 parties, a seller and a buyer.
The parties to the operation find each other by whatever means available, and agree on the terms to the item sale.
At that point, the SELLER is in charge of initializing the Solana program to conduct the operation, and whenever a Solana transaction occurs, the executing party pays for it.
At this point, only SOL is supported as the operation token.
Before the operation proceeds, arbiters will be designated of mutual accord. These accounts will be called to vote on the
destination of the tokens in the account should a dispute arise between the buyer and seller.

The operation flow goes like this:

1. Seller: 
	Compose a JSON object describing the item to sell, and any accompanying materials
	Upload to IPFS with Pinata
	InitializeOperation with (Value, Token, CID)
	Send the data account pubkey to BUYER
2. Buyer:
	Approves item to purchase by registering his own address.
3. Either Party:
	Invites 3 arbiters to participate in the operation.
4. Arbiter:
	An invited arbiter reviews the details and registers himself to participate.
	The program will register them in order 1, 2, 3 as received.
5. Both parties:
	Register their approval of the assigned arbiters.
6. Buyer transfers to the program the token amount.
7. Seller sends the item.
8. Buyer approves the sale, and seller gets the token amount, or alternatively,
	Seller refunds the buyer the deposit.

In case of a dispute, which can only arise after point 6 above, since before that, participants can simply decide not to continue, this alternate flow will happen:

7. Dispute resolution starts.
8. Participants submit additional information as  IPFS data.
9. Arbiters review the additional information and vote. The vote is decided by simple majority.
10. Winner claims token amount.

### Build & Use

#### Version notes

The current version supports only command line tools, and requires some values adjustments, which I hope to improve in future versions. Please read the following instructions.

#### Rust Program

1. Veriify your Rust (1.75+) and Solana (1.18.8+) install versions
2. Generate your Program Auth keypair as "programowner.json" in folder /keys
3. Build and deploy to localhost with ./deploylocal.sh. Of course, you can edit this bash file to deploy to devnet.
4. That 1st build will create a programID, now you need to replace the one in the lib.rs file, in the value "declare_id()".
5. Build & deploy again.

#### Client Apps

There are 3 command line tools, one for each of the participants in an operation: Seller, Buyer and Arbiter. They are separate so that the interested parties can only install the one they want.

For each:

1. Make sure you are using Node 16+ (tested successfuly with 21, you can use N, NVM, etc)
2. npm install
3. npm run build
4. The package.json file has a command START, set to use localhost, you can edit the URL if you want.

Seller:

1. Create an account at Pinata. We'll use it to upload/download IPFS info.
2. Generate your Seller keypair as "seller.json" in folder /keys
3. Edit START in package.json with your Pinata JWT and IPFS gateway. Update your ProgramID as well.
4. Open index.ts file and locate the function recordItemInfo. Compose the JSON object of the item information as you like.
5. npm run build & npm run start
	1. init -> Creates a new operation and uploads the JSON object, this is the 1st function you need to use.
6. Copy the operation account pubkey and IPFS gateway and send it your BUYER.
7. Once the BUYER has registered himself to the operation, send it as well to any arbiter you want to invite.
8. After the 3 arbiters have registered themselves, you'll need to approve them. If you already have an Operation account from a previous program run, add it to package.json START in OPERATION.
	1. approve -> Seller/Buyer approves of registered arbiters.
9. BUYER will now make his token deposit.
10. At this point you should deliver the item, and wait for BUYER to release the tokens to you. And you're done.
11. If you cannot deliver the item, you can cancel the operation and issue a refund to the buyer, or should a problem arise, you can initiate a dispute. The program already knows the account of the buyer for this.
	1. refund -> Seller cancels the op and issues buyer a refund.
	2. dispute -> Seller/Buyer initiates a dispute.
12. If there's a dispute active, you can now upload further information to IPFS. Open index.ts file and locate the function sellerInfo. Compose the JSON object of the item information as you like. npm run build.
	1. info -> Upload additional info for a dispute.
13. Arbiters will vote, and if the result is in your favor, you can claim the tokens.
	1. claim -> Seller/Buyer claims the tokens.

Buyer:

1. Create an account at Pinata. We'll use it to upload/download IPFS info.
2. Generate your Buyer keypair as "buyer.json" in folder /keys
3. Edit START in package.json with your Pinata JWT and IPFS gateway. Update your ProgramID as well and the Operation Pubkey given to you by the seller. If you want, before starting, you can use the gateway to look at the data.
4. npm run start
	1. register -> Register yourself as buyer in an operation.
5. Once you have registered to the operation, send the operation pubkey to any arbiter you want to invite.
6. After the 3 arbiters have registered themselves, you'll need to approve them
	1. approve -> Seller/Buyer approves of registered arbiters.
7. Deposit the token amount. "Value" in the Operation account. The program already knows this number and will deduct it from your Buyer account.
	1. deposit -> Buyer deposits token amount.
8. Once you have item delivered, you can release the amount or should a problem arise, you can initiate a dispute. The program already knows the account of the buyer for this.
	1. release -> Buyer releases the token amount.
	2. dispute -> Seller/Buyer initiates a dispute.
9. If there's a dispute active, you can now upload further information to IPFS. Open index.ts file and locate the function buyerInfo. Compose the JSON object of the item information as you like. npm run build.
	1. info -> Upload additional info for a dispute.
10. Arbiters will vote, and if the result is in your favor, you can claim the tokens.
	1. claim -> Seller/Buyer claims the tokens.

Arbiter:
1. Generate your Arbiter keypair as "arbiter.json" in folder /keys
2. Edit START in package.json with the IPFS gateway. Update your ProgramID as well and the Operation Pubkey given to you by the seller. If you want, before starting, you can use the gateway to look at the data. Buyer might use a different gateway.
3. npm run start
	1. register -> Register yourself as arbiter in an operation.
4. If a dispute starts, download the information and review
	1. download -> Arbiter downloads info.
5. In index.ts locate the function arboterVotes and change the value true/false accordingly. npm run build.
	1. vote -> Arbiter votes.

#### Test app

The Test folder contains a full test app with all the lifecycle options for easy local testing.
Devnet program ID: 7f3bKvFg9WrUr3RGig5gGj8GnEFYMML86ffgxaH19ft1

### Credits

By SAFT.Industries - https://linkedin.com/in/saft


