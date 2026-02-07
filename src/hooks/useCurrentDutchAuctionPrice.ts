import { useReadContract, useChainId } from 'wagmi';
import { yoyoAuctionABI } from '../contracts/yoyoAuctionAbi';
import { chainsToContractAddress } from '../contracts/addresses';
import { useEffect, useRef } from 'react';

/**
 * Custom hook to get the current price of a Dutch Auction.
 * 
 * This hook reads the current auction price from the YoyoAuction smart contract
 * using the `getCurrentAuctionPrice` function. It implements an automatic refetch
 * mechanism when the user returns to the browser tab, but only if at least 5 minutes
 * have passed since the last fetch to avoid excessive calls.
 * 
 * @returns {Object} An object containing:
 * @returns {bigint | undefined} currentPrice - The current auction price in wei, or undefined if not yet loaded
 * @returns {boolean} isLoading - True if the contract call is in progress, false otherwise
 */
const useCurrentDutchAuctionPrice = () => {
    const chainId = useChainId();
    const yoyoAuctionAddress = chainsToContractAddress[chainId]?.yoyoAuctionAddress;
    const lastFetchTime = useRef<number>(0);

    const {
        data: currentPrice,
        isLoading,
        refetch,
    } = useReadContract({
        address: yoyoAuctionAddress,
        abi: yoyoAuctionABI,
        functionName: 'getCurrentAuctionPrice',
    }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void };

    useEffect(() => {
        const handleFocus = () => {
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000; 

            if (now - lastFetchTime.current >= fiveMinutes) {
                refetch();
                lastFetchTime.current = now;
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [refetch]);

    return { currentPrice, isLoading };
};

export default useCurrentDutchAuctionPrice;
