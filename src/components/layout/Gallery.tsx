import NftCard from '../nft/NftCard';
import nftData from '../../data/nftCardData';
import type { NftData } from '../../types/nftTypes';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { selectSelectedNftId, setSelectedNft } from '../../redux/selectedNftSlice';
import NftDetails from '../nft/NftDetails';
import { gsap } from 'gsap';
import useCurrentAuction from '../../hooks/useCurrentAuction';

const Gallery: React.FC = () => {
    const dispatch = useDispatch();
    const currentNftSelected = useSelector(selectSelectedNftId);
    const selectedNft: NftData | undefined = nftData.find(nft => nft.tokenId === currentNftSelected);
    const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
    const gridRef = useRef<HTMLDivElement>(null);
    const { auction } = useCurrentAuction();
    const openAuctionTokenId = auction ? Number(auction.tokenId) : null;

    useEffect(() => {
        const animateImages = () => {
            imagesRef.current.forEach((img, index) => {
                if (img) {
                    const randomX = Math.random() * 100 - 50;
                    const randomY = Math.random() * 100 - 50;
                    const sequentialDelay = index * 0.15;
                    const duration = 4;

                    gsap.fromTo(
                        img,
                        {
                            opacity: 0,
                            scale: 0.5,
                            x: randomX,
                            y: randomY,
                            rotation: 180,
                        },
                        {
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                            rotation: 0,
                            duration: duration,
                            delay: sequentialDelay,
                            repeat: -1,
                            yoyo: true,
                            ease: 'power3.inOut',
                        }
                    );
                }
            });
        };

        animateImages();
    }, []);

    useEffect(() => {
        if (currentNftSelected !== null) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [currentNftSelected]);

    const scrollToGrid = () => {
        if (gridRef.current) {
            const headerHeight =
                parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--headerAndFooterHeight')) * 16;
            const elementPosition = gridRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="flex flex-col items-center text-center w-full relative">
            <div
                className="flex items-center justify-center min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)] 
                    w-full px-2 sm:px-4 relative overflow-hidden"
            >
                {/* Animated NFT images in the background */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-0 items-start justify-items-center ">
                    {[...nftData.slice(0, 20)].map((nft, index) => {
                        if (nft === null) {
                            return <div key="empty-11" className="w-full h-auto"></div>;
                        }
                        return (
                            <img
                                key={nft.tokenId}
                                ref={el => {
                                    imagesRef.current[index] = el;
                                }}
                                src={nft.image}
                                alt=""
                                className="w-58 h-auto object-contain"
                                style={{
                                    zIndex: 0,
                                    opacity: 0,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Title */}
                <div
                    className="relative z-10 px-6 py-4 rounded-3xl bg-[#f5f5f5]/70"
                    style={{
                        boxShadow: '0 0 40px 20px rgba(245, 245, 245, 0.7)',
                    }}
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                        Yoga for Every Body,
                        <br></br>Powered by Technology
                    </h1>
                </div>

                {/* Scroll Arrow - Triangle with Tailwind */}
                <button
                    onClick={scrollToGrid}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 animate-bounce hover:scale-110 transition-all flex flex-col items-center gap-1 cursor-pointer"
                    aria-label="Scroll to gallery"
                >
                    <span className="text-2xl sm:text-3xl font-semibold text-[var(--secondGreen)]">
                        Click to visit NFT gallery
                    </span>
                    <svg className="w-10 h-10 text-[var(--secondGreen)]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            <div
                ref={gridRef}
                className="w-full min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 pb-8 pt-6"
            >
                {nftData.map(nft => (
                    <NftCard
                        key={nft.tokenId}
                        {...nft}
                        onClick={tokenId => dispatch(setSelectedNft(tokenId))}
                        isCurrentAuction={nft.tokenId === openAuctionTokenId}
                    />
                ))}
            </div>

            {currentNftSelected !== null && selectedNft && (
                <div className="fixed inset-0 z-50 flex justify-center items-center">
                    <NftDetails {...selectedNft} />
                </div>
            )}
        </div>
    );
};

export default Gallery;
