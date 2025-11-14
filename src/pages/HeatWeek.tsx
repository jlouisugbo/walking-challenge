import React from 'react';
import { Flame, Crown, Trophy } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { ParticipantCard } from '../components/ui/ParticipantCard';
import { isHeatWeek, calculateDaysElapsed } from '../utils/calculations';

export const HeatWeek: React.FC = () => {
  const { rankedParticipants, config } = useChallenge();
  const inHeatWeek = isHeatWeek(config.startDate);
  const daysElapsed = calculateDaysElapsed(config.startDate);

  const topFive = rankedParticipants.slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-3">
          <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
          Heat Week
          <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
        </h1>
        <p className="text-lg text-gray-400">Week 1: Nov 10-17 • Individual Competition</p>
      </div>

      {/* Heat Week Status */}
      {inHeatWeek ? (
        <div className="glass-card p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 text-center">
          <div className="text-5xl mb-3">🔥</div>
          <div className="text-2xl font-bold text-white mb-2">Heat Week is ACTIVE!</div>
          <p className="text-gray-300">
            Top 5 will become team captains. Give it your all!
          </p>
          <div className="mt-3 text-sm text-orange-300">
            Day {Math.min(daysElapsed + 1, 7)} of 7
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-center">
          <div className="text-5xl mb-3">📊</div>
          <div className="text-2xl font-bold text-white mb-2">Heat Week Results</div>
          <p className="text-gray-300">
            Heat Week has concluded. Check out the final standings below!
          </p>
        </div>
      )}

      {/* Captain Selection Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-7 h-7 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Captain Selection</h2>
        </div>
        <div className="space-y-3">
          <p className="text-gray-300">
            The top 5 performers during Heat Week will earn the honor of becoming{' '}
            <span className="text-yellow-400 font-semibold">Team Captains</span>!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-primary-light/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">📋 Captain Responsibilities:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Lead your team to victory</li>
                <li>• Motivate team members</li>
                <li>• Set the pace for your squad</li>
              </ul>
            </div>
            <div className="bg-primary-light/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">🏆 Captain Benefits:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Pick your team members</li>
                <li>• Share in team bonus prize</li>
                <li>• Lead your squad to glory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 - Captain Contenders */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-accent" />
          {inHeatWeek ? 'Current Top 5 - Captain Contenders' : 'Final Top 5 - Team Captains'}
        </h2>
        <div className="space-y-3">
          {topFive.length > 0 ? (
            topFive.map((participant, index) => (
              <div
                key={participant.id}
                className="relative"
              >
                {index < 5 && (
                  <div className="absolute -left-2 -top-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      👑 Captain
                    </div>
                  </div>
                )}
                <ParticipantCard
                  participant={participant}
                  showTeam={!inHeatWeek}
                />
              </div>
            ))
          ) : (
            <div className="glass-card p-12 text-center text-gray-400">
              <p>No participants yet. Add participants in the Admin page!</p>
            </div>
          )}
        </div>
      </div>

      {/* All Participants */}
      {rankedParticipants.length > 5 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Other Participants
          </h2>
          <div className="space-y-3">
            {rankedParticipants.slice(5).map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                showTeam={!inHeatWeek}
              />
            ))}
          </div>
        </div>
      )}

      {/* Heat Week Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Heat Week Timeline</h2>
        <div className="space-y-4">
          <TimelineItem
            day="Day 1-3"
            title="Early Push"
            description="Get off to a strong start and establish your position"
            active={daysElapsed >= 0 && daysElapsed <= 2 && inHeatWeek}
          />
          <TimelineItem
            day="Day 4-5"
            title="Mid-Week Grind"
            description="Maintain momentum and stay consistent"
            active={daysElapsed >= 3 && daysElapsed <= 4 && inHeatWeek}
          />
          <TimelineItem
            day="Day 6-7"
            title="Final Sprint"
            description="Give everything you've got! Captain positions are decided!"
            active={daysElapsed >= 5 && daysElapsed <= 6 && inHeatWeek}
          />
        </div>
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{
  day: string;
  title: string;
  description: string;
  active: boolean;
}> = ({ day, title, description, active }) => {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
        active
          ? 'bg-accent/20 border-l-4 border-accent'
          : 'bg-primary-light/30 border-l-4 border-transparent'
      }`}
    >
      <div
        className={`text-sm font-bold px-3 py-1 rounded-full ${
          active ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400'
        }`}
      >
        {day}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>
          {title}
        </div>
        <div className="text-sm text-gray-400 mt-1">{description}</div>
      </div>
      {active && (
        <div className="text-2xl animate-pulse">🔥</div>
      )}
    </div>
  );
};
