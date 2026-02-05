import { formatStartDate, formatTime } from '../../utils/timeUtils';
import { useState, useEffect } from 'react';

interface CountDownProps {
    startTime: bigint | undefined;
    endTime: bigint | undefined;
}

const CountDown: React.FC<CountDownProps> = ({ startTime, endTime }) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    // Countdown timer
    useEffect(() => {
        if (!endTime) return;

        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = Number(endTime) - now;
            setTimeRemaining(remaining > 0 ? remaining : 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <>
            <div className="max-w-2xl mx-auto mt-2 p-3 px-8 bg-[linear-gradient(to_left,rgb(106,170,142)_10%,rgb(147,112,186)_90%)] rounded-xl shadow-lg text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Auction Started */}
                    <div className="text-center">
                        <p className="text-lg uppercase font-bold tracking-wide opacity-90 mb-2">Auction Started</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                            <p className="text-lg font-mono">{formatStartDate(startTime)}</p>
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="text-center">
                        <p className="text-lg uppercase font-bold tracking-wide opacity-90 mb-2">Time Remaining</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                            <p
                                className={`text-xl font-mono font-bold ${
                                    timeRemaining === 0
                                        ? 'text-red-600 animate-pulse'
                                        : timeRemaining < 3600
                                          ? 'text-red-400'
                                          : ''
                                }`}
                            >
                                {timeRemaining > 0 ? formatTime(timeRemaining) : 'ENDED'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CountDown;
