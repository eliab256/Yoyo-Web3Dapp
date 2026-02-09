import { useReadContract, useChainId } from 'wagmi';
import { yoyoAuctionABI } from '../contracts/yoyoAuctionAbi';
import { chainsToContractAddress } from '../contracts/addresses';
import { useEffect, useRef } from 'react';

/**
 * @title useCurrentDutchAuctionPrice
 * @notice Custom hook to fetch and monitor the current price of a Dutch Auction
 * @dev This hook reads the current auction price from the YoyoAuction smart contract
 * using the `getCurrentAuctionPrice` function. It implements an automatic refetch
 * mechanism when the user returns to the browser tab, but only if at least 5 minutes
 * have passed since the last fetch to avoid excessive API calls.
 *
 * The hook uses wagmi's `useReadContract` to interact with the blockchain and React's
 * `useEffect` to listen for window focus events. The refetch is throttled using a
 * timestamp-based approach stored in a ref to prevent unnecessary contract reads.
 *
 * @return currentPrice The current auction price in wei (bigint), or undefined if not yet loaded
 * @return isLoading Boolean indicating whether the contract call is in progress
 *
 * @notice Used in:
 * - CurrentAuction.tsx: Displays the current Dutch auction price to users
 *
 * @custom:security The hook only reads data from the contract and does not perform any write operations
 * @custom:optimization Implements a 5-minute throttle on refetch to minimize RPC calls and improve performance
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
