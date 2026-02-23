import type {BidderRefund} from '../types/queriesTypes';

function getUnclaimedRefund(claimedRefund:BidderRefund[] , allRefunds: BidderRefund[]): boolean {
    if (allRefunds.length - claimedRefund.length === 0) return false;
    return true;
}

export default getUnclaimedRefund;