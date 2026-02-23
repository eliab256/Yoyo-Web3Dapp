import { useQuery } from '@tanstack/react-query';
import { getSentNFTs } from '../graphql/client';
import type { Address } from 'viem';

/**
 * Custom hook to check if an NFT has been minted and sold.
 *
 * @remarks
 * Filters transfer events where `from` is the zero address (0x0000...0000) to identify
 * minted NFTs. All NFTs sent from the zero address have been minted and are considered sold.
 *
 * @param tokenId - The token ID to check
 * @returns Query result with boolean indicating if the NFT has been minted and sold
 */
const useSoldNFTs = (tokenId: number) => {
    const zeroAddress: Address = '0x0000000000000000000000000000000000000000';
    return useQuery({
        queryKey: ['soldNFTs', zeroAddress, tokenId],
        queryFn: async (): Promise<boolean> => {
            if (!zeroAddress) return false;
            const sent = await getSentNFTs(zeroAddress);

            // Get all tokenIds sent from zero address (minted NFTs)
            const mintedNfts = sent.map(transfer => Number(transfer.tokenId));

            console.log('Minted NFTs:', mintedNfts);
            console.log('Checking tokenId:', tokenId);
            console.log('Is Sold:', mintedNfts.includes(tokenId));

            return mintedNfts.includes(tokenId);
        },
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: true, // refetch when window gets focus
    });
};

export default useSoldNFTs;
