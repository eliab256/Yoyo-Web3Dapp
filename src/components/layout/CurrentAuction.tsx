import useCurrentAuction from '../../hooks/useCurrentAuction';
import useEthereumPrice from '../../hooks/useEthereumPrice';
import useUserBidStatus from '../../hooks/useUserBidStatus';
import useCurrentDutchAuctionPrice from '../../hooks/useCurrentDutchAuctionPrice';
import usePlaceBid from '../../hooks/usePlaceBid';
import NftCard from '../nft/NftCard';
import CountDown from '../auction/CountDown';
import BidResume from '../auction/BidResume';
import { formatEther } from 'viem';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setIsConfirmBidPanelOpen,
    selectIsConfirmBidPanelOpen,
    dismissSuccessBox,
    dismissErrorBox,
    selectDismissedSuccessHash,
    selectDismissedErrorTimestamp,
} from '../../redux/confirmPlaceBidSlice';
import { useAccount } from 'wagmi';
import ErrorBox from '../ui/ErrorBox';
import SuccessBox from '../ui/SuccessBox';
import LoadingBox from '../ui/LoadingBox';
import WarningBox from '../ui/WarningBox';

const CurrentAuction: React.FC = () => {
    const dispatch = useDispatch();
    const { isConnected, address } = useAccount();
    const { auction, isLoading } = useCurrentAuction();
    const { price: ethPriceUSD } = useEthereumPrice();
    const {
        userHasBid,
        userIsWinning,
        isLoading: isUserBidStatusLoading,
        error: userBidStatusError,
    } = useUserBidStatus(address, auction?.auctionId.toString());
    const [bidValue, setBidValue] = useState<string>('');
    const openConfirmPanel = useSelector(selectIsConfirmBidPanelOpen);
    const dismissedSuccessHash = useSelector(selectDismissedSuccessHash);
    const dismissedErrorTimestamp = useSelector(selectDismissedErrorTimestamp);
    const { currentPrice: currentDutchAuctionPrice, isLoading: isDutchAuctionPriceLoading } =
        useCurrentDutchAuctionPrice();
    const { placeBid, isWritePending, isConfirming, isConfirmed, hash, error: placeBidError } = usePlaceBid();

    // Determine whether to show the boxes based on Redux state
    const shouldShowSuccessBox = isConfirmed && hash && hash !== dismissedSuccessHash;
    const shouldShowErrorBox =
        placeBidError && (!dismissedErrorTimestamp || Date.now() - dismissedErrorTimestamp > 100);

    // useEffect to close the confirm panel when a bid is successfully placed or when there's an error, to prevent it from being stuck open
    useEffect(() => {
        if (shouldShowSuccessBox || shouldShowErrorBox) {
            dispatch(setIsConfirmBidPanelOpen(false));
        }
    }, [shouldShowSuccessBox, shouldShowErrorBox, dispatch]);

    const getUsdPrice = useMemo(() => {
        return (ethAmount: bigint | undefined) => {
            if (!ethAmount || !ethPriceUSD) return '0.00';
            try {
                const ethValue = parseFloat(formatEther(ethAmount));
                return (ethValue * ethPriceUSD).toFixed(2);
            } catch {
                return '0.00';
            }
        };
    }, [ethPriceUSD]);

    const userBidUsd = useMemo(() => {
        if (!bidValue || !ethPriceUSD) return '0.00';
        try {
            const ethValue = parseFloat(bidValue);
            if (isNaN(ethValue)) return '0.00';
            return (ethValue * ethPriceUSD).toFixed(2);
        } catch {
            return '0.00';
        }
    }, [bidValue, ethPriceUSD]);

    const minimumRequiredBid = useMemo(() => {
        if (!auction) return 0;

        if (auction.auctionType === 0) {
            // English auction: higher bid + minimum increment
            return auction.higherBid && auction.minimumBidChangeAmount
                ? parseFloat(formatEther(auction.higherBid + auction.minimumBidChangeAmount))
                : 0;
        } else {
            // Dutch auction: current price
            return currentDutchAuctionPrice ? parseFloat(formatEther(currentDutchAuctionPrice)) : 0;
        }
    }, [auction, currentDutchAuctionPrice]);

    const isBidValid = useMemo(() => {
        if (!bidValue) return false;
        const numericBid = parseFloat(bidValue);
        if (isNaN(numericBid)) return false;
        if (!auction?.endTime) return false;
        const now = Math.floor(Date.now() / 1000);
        if (Number(auction.endTime) <= now) return false;
        return numericBid >= minimumRequiredBid;
    }, [bidValue, minimumRequiredBid, auction?.endTime]);

    // Destructure auction details
    const {
        auctionId,
        tokenId,
        //nftOwner,
        state,
        auctionType,
        startPrice,
        startTime,
        endTime,
        //higherBidder,
        higherBid,
        minimumBidChangeAmount,
    } = auction || {};

    // Success State - Bid Placed 
    if (shouldShowSuccessBox && hash) {
        return (
            <SuccessBox
                title="Bid Placed Successfully!"
                message="Your bid has been successfully placed on the blockchain."
                txHash={hash}
                onClose={() => {
                    dispatch(dismissSuccessBox(hash));
                }}
            />
        );
    }

    // Error State - Bid Placement 
    if (shouldShowErrorBox && placeBidError) {
        return (
            <ErrorBox
                title="Bid Placement Failed"
                displayMessage="There was an error placing your bid. Check console for more details or try again later."
                errorMessage={placeBidError.message}
                onClose={() => {
                    dispatch(dismissErrorBox());
                }}
            />
        );
    }

    // Loading State
    if (isLoading || isUserBidStatusLoading || isDutchAuctionPriceLoading) {
        return (
            <div className="w-full flex flex-col items-center px-2 sm:px-4 lg:min-h-[calc(100vh-var(--headerAndFooterHeight)*2)]">
                <h1 className="text-center">Current Auction</h1>

                <LoadingBox
                    title="Loading current auction..."
                    message="Please wait while we fetch the current auction details."
                />
            </div>
        );
    }

    // Error State - Bid Status
    if (userBidStatusError) {
        return (
            <ErrorBox
                title="Error Loading Bid Status"
                displayMessage="Bid status loading failed, check console for more details"
                errorMessage={userBidStatusError}
            />
        );
    }

    // No Active Auction
    if (state !== 1) {
        return (
            <div className="w-full flex flex-col items-center px-2 sm:px-4 lg:min-h-[calc(100vh-var(--headerAndFooterHeight)*2)]">
                <h1 className="text-center">Current Auction</h1>
                <WarningBox
                    title="No Active Auction"
                    message="There is currently no active auction. Wait until the next auction starts."
                />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-center px-2 sm:px-4">
            <h1 className="text-center">Current Auction</h1>
            <h2 className="text-center">Auction ID: {Number(auctionId)}</h2>
            <div className="flex flex-col lg:flex-row items-center justify-center mt-1 w-full max-w-6xl">
                <div className="mb-4 lg:mb-0 lg:mr-8 p-1">
                    <NftCard tokenId={Number(tokenId)} />
                </div>

                {/* Bid Placement Section */}
                <div
                    className="max-w-md w-full px-6 py-2 bg-white rounded-xl"
                    style={{
                        boxShadow: '0 10px 25px -5px rgba(130, 95, 170, 0.5), 0 8px 10px -6px rgba(130, 95, 170, 0.3)',
                    }}
                >
                    <h2 className="text-2xl font-bold text-center mb-1">Place Your Bid Here</h2>
                    <p className="text-lg text-center mb-2 w-full">
                        This is {auctionType === 0 ? 'an English' : 'a Dutch'} auction
                        <br></br>
                        {auctionType === 0
                            ? 'In an English auction, bidders compete by placing increasingly higher bids. The highest bidder wins.'
                            : "In a Dutch auction the price drops over time, the first bidder wins. Don't wait."}
                    </p>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Starting Price:</span>
                            <span className="text-lg">
                                {startPrice ? formatEther(startPrice) : '0'} ETH ≈ ${getUsdPrice(startPrice)}
                            </span>
                        </div>

                        {auctionType === 0 && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Min. Bid Increment:</span>
                                    <span className="text-lg">
                                        {minimumBidChangeAmount ? formatEther(minimumBidChangeAmount) : '0'} ETH ≈ $
                                        {getUsdPrice(minimumBidChangeAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Current Highest Bid:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {higherBid ? formatEther(higherBid) : '0'} ETH ≈ ${getUsdPrice(higherBid)}
                                    </span>
                                </div>

                                {/* User Bid Status Box */}
                                {(userHasBid || userIsWinning) && (
                                    <div
                                        className={`mt-3 p-1 rounded-lg text-center ${
                                            userIsWinning
                                                ? 'bg-green-50 border-2 border-green-500'
                                                : 'bg-yellow-50 border-2 border-yellow-500'
                                        }`}
                                    >
                                        {userIsWinning ? (
                                            <p className="text-green-700 font-semibold animate-pulse">
                                                🎉 You are the highest bidder now.
                                            </p>
                                        ) : (
                                            <div>
                                                <p className="text-yellow-700 font-semibold">
                                                    ⚠️ Your bid was surpassed.
                                                </p>
                                                <p className="text-yellow-600 text-sm mt-1">
                                                    Submit a higher bid to claim the item.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {auctionType === 1 && (
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Current Price:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {currentDutchAuctionPrice ? formatEther(currentDutchAuctionPrice) : '0'} ETH ≈ $
                                    {getUsdPrice(currentDutchAuctionPrice)}
                                </span>
                            </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <label className="block font-semibold mb-2">Your Offer:</label>
                            <input
                                type="number"
                                step="0.001"
                                value={bidValue}
                                onChange={e => setBidValue(e.target.value)}
                                onClick={() => {
                                    if (!bidValue) {
                                        setBidValue(minimumRequiredBid.toString());
                                    }
                                }}
                                placeholder={
                                    auctionType === 0
                                        ? higherBid && minimumBidChangeAmount
                                            ? `${formatEther(higherBid + minimumBidChangeAmount)} ETH`
                                            : '0 ETH'
                                        : currentDutchAuctionPrice
                                          ? `${formatEther(currentDutchAuctionPrice)} ETH`
                                          : '0 ETH'
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <p className="text-sm text-gray-500 mt-1">≈ ${userBidUsd} USD</p>
                            <button
                                className="w-full mt-2 px-6 py-2 bg-[#825FAA] hover:bg-[#6d4d8a] active:bg-[#5a3d6f] text-white font-semibold rounded-lg transition-colors duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                                onClick={() => dispatch(setIsConfirmBidPanelOpen(true))}
                                disabled={!isBidValid || !isConnected}
                            >
                                Enter the Auction
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <CountDown startTime={startTime} endTime={endTime} />
            {openConfirmPanel && (
                <BidResume
                    bidAmount={bidValue}
                    placeBid={placeBid}
                    isWritePending={isWritePending}
                    isConfirming={isConfirming}
                />
            )}
        </div>
    );
};

export default CurrentAuction;
