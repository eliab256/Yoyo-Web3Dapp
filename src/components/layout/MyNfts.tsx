import { useAccount } from 'wagmi';
import NftCard from '../nft/NftCard';
import nftData from '../../data/nftCardData';
import type { NftData } from '../../types/nftTypes';
import useUserNFTs from '../../hooks/useUserNFTs';
import ErrorBox from '../ui/ErrorBox';
import LoadingBox from '../ui/LoadingBox';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { selectSelectedNftId, setSelectedNft } from '../../redux/selectedNftSlice';
import NftDetails from '../nft/NftDetails';

const MyNfts: React.FC = () => {
    const dispatch = useDispatch();
    const { isConnected, address } = useAccount();
    const { data: nfts, isLoading, error, refetch } = useUserNFTs();

    const currentNftSelected = useSelector(selectSelectedNftId);
    const selectedNft: NftData | undefined = nftData.find(nft => nft.tokenId === currentNftSelected);

    useEffect(() => {
        if (currentNftSelected !== null) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            // Refetch NFTs when the selected NFT is cleared (used to trigger refetch after transfer)
            refetch();
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [currentNftSelected, refetch]);

    // Extract tokenIds from nfts
    const tokenIds = nfts?.map(nft => nft.tokenId) ?? [];
    const hasNfts = tokenIds.length > 0;

    // Wallet is not connected
    if (!isConnected) {
        return (
            <div className="w-full">
                <div className="px-2 sm:px-4 text-center">
                    <h1>My Nfts</h1>
                </div>

                <ErrorBox
                    title="Wallet not connected"
                    displayMessage="Please connect your wallet to view your products."
                />
            </div>
        );
    }

    // Loading state
    if (isConnected && isLoading) {
        return (
            <div className="w-full">
                <div className="px-2 sm:px-4 text-center">
                    <h1>My Nfts</h1>
                </div>

                <LoadingBox title="Loading your NFTs..." message="Please wait while we fetch your collection." />
            </div>
        );
    }

    // Error state
    if (isConnected && error && !isLoading) {
        return (
            <div className="w-full">
                <div className="px-2 sm:px-4 text-center">
                    <h1>My Nfts</h1>
                </div>
                <ErrorBox title="Error loading NFTs" errorMessage={error} />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="px-2 sm:px-4 text-center">
                <h1>My Nfts</h1>
            </div>
            <div>
                {/* wallet is connected but the user hasn't never bought a product */}
                {isConnected && address && !hasNfts && !isLoading && !error && (
                    <ErrorBox
                        title="You don't hold any NFTs yet"
                        displayMessage="Go to the auction page and place a bid to win your first NFT."
                    />
                )}
                {/* wallet is connected and the user has bought products */}
                {isConnected && hasNfts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-12 py-6">
                        {tokenIds.map(tokenId => {
                            const nftCardData = nftData.find(nft => nft.tokenId === Number(tokenId));
                            return nftCardData ? (
                                <NftCard
                                    key={tokenId}
                                    {...nftCardData}
                                    onClick={tokenId => dispatch(setSelectedNft(tokenId))}
                                />
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            {currentNftSelected !== null && selectedNft && (
                <div className="fixed inset-0 z-50 flex justify-center items-start pt-1 ">
                    <NftDetails {...selectedNft} />
                </div>
            )}
        </div>
    );
};

export default MyNfts;
