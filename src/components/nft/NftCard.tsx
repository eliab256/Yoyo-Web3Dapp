import React from 'react';
import nftData from '../../data/nftCardData';

interface NftCardProps {
    tokenId: number;
    onClick?: (tokenId: number) => void;
    isCurrentAuction?: boolean;
}

const NftCard: React.FC<NftCardProps> = ({ tokenId, onClick, isCurrentAuction }) => {
    const nft = nftData[tokenId];
    const { image, metadata } = nft || {};

    return (
        <div
            onClick={() => onClick?.(tokenId)}
            className={`bg-white rounded-xl overflow-hidden transition-shadow duration-300 max-w-sm mx-auto ${
                isCurrentAuction ? 'border-[6px] border-[var(--secondGreen)] bg-[var(--secondGreen)]' : ''
            }`}
            style={{ boxShadow: '0 10px 25px -5px rgba(130, 95, 170, 0.5), 0 8px 10px -6px rgba(130, 95, 170, 0.3)' }}
        >
            {/* Immagine NFT */}
            <div className="relative aspect-square">
                <img src={image} alt={metadata?.name || `NFT #${tokenId}`} className="w-full h-full object-cover" />
                
                {/* Banner asta corrente sovrapposto */}
                {isCurrentAuction && (
                    <div className="absolute top-0 left-0 right-0 bg-[var(--secondGreen)] text-white text-center py-2 px-4 font-semibold text-sm uppercase z-10">
                        Auction open for this NFT
                    </div>
                )}
            </div>

            {/* Nome e Token ID */}
            <div className="p-2 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-1">{metadata?.name || 'Unknown NFT'}</h2>
                <p className="text-lg text-black-500">Token ID: {tokenId}</p>
            </div>
        </div>
    );
};

export default NftCard;
