import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getReceivedNFTs, getSentNFTs } from '../graphql/client';
import getOwnedNFTs from '../utils/nftOwnership';
import type { OwnedNFT } from '../types/queriesTypes';
import type { Address } from 'viem';

/**
 * Custom hook to retrieve all YoYo NFTs owned by a wallet address.
 *
 * @remarks
 * This hook provides a complete view of NFT ownership by analyzing the full transfer history
 * of a wallet address. It implements intelligent ownership calculation and caching:
 *
 * **Avoid OwnerOf function loop calls**: Rather than iterating over ownerOf calls, which becomes
 * prohibitively expensive in terms of gas usage, this hook relies on indexed NFT transfer events
 * to compute the current ownership via the getOwnedNFTs utility.
 *
 * **Ownership Calculation via Transfer History**: Rather than relying on a single ownership
 * query, the hook fetches both received and sent NFT transfer events from the indexer, then
 * uses the `getOwnedNFTs` utility to calculate current ownership. This approach ensures accuracy
 * even if the indexer doesn't maintain a direct ownership mapping.
 *
 * **Address-Specific Cache Keys**: Each wallet address has its own cache entry, preventing
 * cache collisions when switching between addresses or viewing multiple profiles.
 *
 * @used-in
 *  - MyNfts.tsx - To display the connected user's owned YoYo NFTs in their profile page.
 *
 * @param {Address} [customAddress] - Optional address to fetch NFTs for (defaults to connected wallet)
 *
 * @returns React Query result object containing the owned NFTs array and query states
 * @returns {OwnedNFT[]} data - Array of NFTs currently owned by the target address (empty array if none)
 * @returns {boolean} isLoading - True while fetching NFT transfer history
 * @returns {boolean} isError - True if the query failed
 * @returns {Error | null} error - Error object if the query failed
 * @returns {() => void} refetch - Function to manually refetch the NFT ownership data
 */

const useUserNFTs = (customAddress?: Address) => {
    const { address: connectedAddress } = useAccount();

    const targetAddress = customAddress ?? connectedAddress;
    return useQuery({
        queryKey: ['userNFTs', targetAddress],
        queryFn: async (): Promise<OwnedNFT[]> => {
            if (!targetAddress) return [];

            const [received, sent] = await Promise.all([getReceivedNFTs(targetAddress), getSentNFTs(targetAddress)]);

            const owned = getOwnedNFTs(received, sent);

            return owned;
        },
        enabled: !!targetAddress,
        gcTime: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: true, // refetch when window gets focus
    });
};

export default useUserNFTs;
