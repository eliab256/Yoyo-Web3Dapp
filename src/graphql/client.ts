import type { Address } from 'viem';
import type {
    TransferEvent,
    TransfersResponse,
    BidsResponse,
    BidPlaced,
    AuctionsLifecycleResponse,
    BidderRefundsResponse,
    BidderRefund,
    BidderFailedRefundResponse,
    FinalizedAuction,
    FinalizedAuctionsResponse,
    FailedMint,
    FailedMintResponse,
} from '../types/queriesTypes';
import {
    GET_RECEIVED_NFTS,
    GET_SENT_NFTS,
    GET_BID_HYSTORY_FROM_AUCTION_ID,
    GET_AUCTIONS_LIFECYCLE,
    GET_BIDDER_REFUNDS,
    GET_BIDDER_FAILED_REFUNDS,
    GET_ALL_FINALIZED_AUCTIONS,
    GET_ALL_MINT_FAILED,
} from './queries';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_INDEXER_URL_PROD || import.meta.env.VITE_INDEXER_URL_DEV;

async function fetchGraphQL<T>(query: string, variables: Record<string, any> = {}) {
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const { data, errors } = await response.json();

    if (errors) {
        throw new Error(errors[0].message);
    }

    return data as T;
}

export async function getReceivedNFTs(ownerAddress: Address): Promise<TransferEvent[]> {
    const data = await fetchGraphQL<TransfersResponse>(GET_RECEIVED_NFTS, {
        ownerAddress: ownerAddress.toLowerCase(),
    });
    return data.allTransfers.nodes;
}

export async function getSentNFTs(ownerAddress: Address): Promise<TransferEvent[]> {
    const data = await fetchGraphQL<TransfersResponse>(GET_SENT_NFTS, { ownerAddress: ownerAddress.toLowerCase() });
    return data.allTransfers.nodes;
}

export async function getBidHistoryFromAuctionId(auctionId: string): Promise<BidPlaced[]> {
    const data = await fetchGraphQL<BidsResponse>(GET_BID_HYSTORY_FROM_AUCTION_ID, { auctionId: auctionId });
    return data.allYoyoAuctionBidPlaceds.nodes;
}

export async function getAuctionsLifecycle(): Promise<AuctionsLifecycleResponse> {
    const data = await fetchGraphQL<AuctionsLifecycleResponse>(GET_AUCTIONS_LIFECYCLE);
    return data;
}

export async function getBidderRefundsByAddress(address: Address): Promise<BidderRefund[]> {
    const data = await fetchGraphQL<BidderRefundsResponse>(GET_BIDDER_REFUNDS, {
        bidderAddress: address.toLowerCase(),
    });
    return data.allYoyoAuctionBidderRefundeds.nodes;
}

export async function getBidderFailedRefundsByAddress(address: Address): Promise<BidderRefund[]> {
    const data = await fetchGraphQL<BidderFailedRefundResponse>(GET_BIDDER_FAILED_REFUNDS, {
        addr: address.toLowerCase(),
    });
    return data.allYoyoAuctionBidderRefundFaileds.nodes;
}

export async function getAllFinalizedAuctions(address: Address): Promise<FinalizedAuction[]> {
    const data = await fetchGraphQL<FinalizedAuctionsResponse>(GET_ALL_FINALIZED_AUCTIONS, {
        addr: address.toLowerCase(),
    });
    return data.allYoyoAuctionAuctionFinalizeds.nodes;
}

export async function getAllMintFailed(address: Address): Promise<FailedMint[]> {
    const data = await fetchGraphQL<FailedMintResponse>(GET_ALL_MINT_FAILED, {
        addr: address.toLowerCase(),
    });
    return data.allYoyoAuctionMintFaileds.nodes;
}
