import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Parse the end date and set to midnight EST (UTC-5)
      // Create a date at midnight in EST timezone
      const endDateParts = endDate.split('-');
      const year = parseInt(endDateParts[0]);
      const month = parseInt(endDateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(endDateParts[2]);

      // Create date at midnight EST by using a specific time string
      // "2025-12-10T23:59:59-05:00" means Dec 10 11:59:59 PM EST
      const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59-05:00`;
      const end = new Date(endDateStr).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-accent" />
        <span className="text-sm uppercase tracking-wide text-gray-400">Time Remaining</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <TimeUnit value={timeRemaining.days} label="Days" />
        <TimeUnit value={timeRemaining.hours} label="Hours" />
        <TimeUnit value={timeRemaining.minutes} label="Mins" />
        <TimeUnit value={timeRemaining.seconds} label="Secs" />
      </div>
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-accent stat-number">{value.toString().padStart(2, '0')}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
};
