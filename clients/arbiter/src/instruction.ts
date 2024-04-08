import { u32, u8, struct, Layout, seq } from "@solana/buffer-layout";
import { publicKey, u64, bool } from "@solana/buffer-layout-utils";
import { Participant, TokenVersion } from "./type";

export const enum SCAInstruction {
	InitializeOperation = 0,
	RegisterBuyer = 1,
	RegisterArbiter = 2,
	ParticipantApprovesArbiters = 3,
	BuyerDeposit = 4,
	BuyerRelease = 5,
	SellerRefund = 6,
	StartDispute = 7,
	SellerAddInfo = 8,
	BuyerAddInfo = 9,
	ArbiterVote = 10,
	ParticipantClaim = 11,
};

export function createInitializeOperationInstruction(value: bigint, tokenVersion: TokenVersion, ipfsCID: string): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
		u64('value') as Layout<never>, // 8 bytes
		u8('tokenVersion') as Layout<never>, // Single Byte
		(seq(u8(), 46, 'ipfsCid') as unknown) as Layout<never>, // IPFS CID hash, 46 bytes
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.InitializeOperation, 
			value: value,
            tokenVersion: tokenVersion,
			ipfsCid: Buffer.from(ipfsCID, "utf-8")
		},
		data,
	);

	return data;
}

export function createRegisterBuyerInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.RegisterBuyer, 
		},
		data,
	);

	return data;
}

export function createRegisterArbiterInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.RegisterArbiter, 
		},
		data,
	);

	return data;
}

export function createParticipantApprovesArbitersInstruction(participant: Participant): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
		u8('participant') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.ParticipantApprovesArbiters, 
            participant: participant,
		},
		data,
	);

	return data;
}

export function createBuyerDepositInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.BuyerDeposit, 
		},
		data,
	);

	return data;
}

export function createBuyerReleaseInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.BuyerRelease, 
		},
		data,
	);

	return data;
}

export function createSellerRefundInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.SellerRefund, 
		},
		data,
	);

	return data;
}

export function createStartDisputeInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.StartDispute, 
		},
		data,
	);

	return data;
}

export function createSellerAddInfoInstruction(ipfsCID: string): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
		(seq(u8(), 46, 'ipfsCid') as unknown) as Layout<never>, // IPFS CID hash, 46 bytes
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.SellerAddInfo, 
			ipfsCid: Buffer.from(ipfsCID, "utf-8")
		},
		data,
	);

	return data;
}

export function createBuyerAddInfoInstruction(ipfsCID: string): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
		(seq(u8(), 46, 'ipfsCid') as unknown) as Layout<never>, // IPFS CID hash, 46 bytes
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.BuyerAddInfo, 
			ipfsCid: Buffer.from(ipfsCID, "utf-8")
		},
		data,
	);

	return data;
}


export function createArbiterVoteInstruction(vote: boolean): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
		bool('vote') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.ArbiterVote, 
			vote: vote,
		},
		data,
	);

	return data;
}


export function createParticipantClaimInstruction(): Buffer {

	const dataLayout = struct([
		u8('instruction') as Layout<never>, // Single Byte
	]);

	const data = Buffer.alloc(dataLayout.span);

	dataLayout.encode(
		{
			instruction: SCAInstruction.ParticipantClaim, 
		},
		data,
	);

	return data;
}
