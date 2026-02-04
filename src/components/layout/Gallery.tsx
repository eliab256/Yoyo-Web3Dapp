import NftCard from '../nft/NftCard';
import nftData from '../../data/nftCardData';
import type { NftData } from '../../types/nftTypes';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { selectSelectedNftId, setSelectedNft } from '../../redux/selectedNftSlice';
import NftDetails from '../nft/NftDetails';
import { gsap } from 'gsap';

const Gallery: React.FC = () => {
    const dispatch = useDispatch();
    const currentNftSelected = useSelector(selectSelectedNftId);
    const selectedNft: NftData | undefined = nftData.find(nft => nft.tokenId === currentNftSelected);
    const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

    useEffect(() => {
        const animateImages = () => {
            imagesRef.current.forEach(img => {
                if (img) {
                    const randomX = Math.random() * 100 - 50;
                    const randomY = Math.random() * 100 - 50;
                    const randomDelay = Math.random() * 3;
                    const randomDuration = 3 + Math.random() * 3;

                    gsap.fromTo(
                        img,
                        {
                            opacity: 0,
                            scale: 0.5,
                            x: randomX,
                            y: randomY,
                            rotation: Math.random() * 180,
                        },
                        {
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                            rotation: 0,
                            duration: randomDuration,
                            delay: randomDelay,
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

    return (
        <div className="flex flex-col items-center text-center w-full relative">
            <div className="flex items-center justify-center min-h-screen w-full px-2 sm:px-4 relative overflow-hidden ">
                {/* Animated NFT images in the background */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-0 items-center justify-items-center">
                    {nftData.slice(0, 20).map((nft, index) => (
                        <img
                            key={nft.tokenId}
                            ref={el => {
                                imagesRef.current[index] = el;
                            }}
                            src={nft.image}
                            alt=""
                            className="w-full h-auto object-contain"
                            style={{
                                zIndex: 0,
                                opacity: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold relative z-10">
                    Yoga for Every Body,
                    <br></br>Powered by Technology
                </h1>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 pb-8 ">
                {nftData.map(nft => (
                    <NftCard key={nft.tokenId} {...nft} onClick={tokenId => dispatch(setSelectedNft(tokenId))} />
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
