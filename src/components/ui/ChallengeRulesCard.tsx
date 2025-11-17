import React from 'react';
import { X, Trophy, Users, Flame, Sparkles, Ticket } from 'lucide-react';

interface ChallengeRulesCardProps {
  onClose: () => void;
}

export const ChallengeRulesCard: React.FC<ChallengeRulesCardProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-primary via-primary-light to-primary max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border-2 border-accent/50 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-white/10 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📋 Challenge Rules & Prizes
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Team Challenge - MAIN FOCUS */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              🏆 TEAM COMPETITION (Main Event!)
            </h3>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-lg p-4 space-y-2">
              <p className="text-gray-300 text-sm">
                <strong className="text-white text-lg">Winning Team Gets:</strong> <span className="text-2xl text-purple-400 font-bold">$15 per team member!</span>
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Team Size:</strong> 5 members each
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">How it Works:</strong> Teams compete based on combined total steps. The team with the highest total wins! Work together, motivate each other, and dominate! 💪
              </p>
            </div>
          </section>

          {/* Individual Prizes - Secondary */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Individual Bonuses (Top 3)
            </h3>
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥇</span>
                    <span className="text-white font-semibold">1st Place</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">$25</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-300/20 to-gray-400/20 border border-gray-300/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥈</span>
                    <span className="text-white font-semibold">2nd Place</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-300">$15</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥉</span>
                    <span className="text-white font-semibold">3rd Place</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">$10</span>
                </div>
              </div>
            </div>
          </section>

          {/* Heat Week */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Heat Week (Nov 10-16)
            </h3>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 space-y-2">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">When:</strong> Monday, Nov 10 @ 12:00 AM EST - Sunday, Nov 16 @ 11:59 PM EST
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">What Happens:</strong> Team competition pauses. Everyone competes individually for one week.
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Team Formation:</strong> After Heat Week ends, teams are automatically and randomly generated based on Sunday night's rankings. The top 5 performers become team captains, and all participants are randomly assigned to create balanced teams.
              </p>
            </div>
          </section>

          {/* Wildcard System */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Wildcard Points (After Heat Week)
            </h3>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Active:</strong> After Heat Week ends (Nov 17+)
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">How to Win:</strong> Each day, a random challenge is selected (e.g., "Most Improved", "Best Streak", "Weekend Warrior"). The winner gets +1 wildcard point!
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Prize:</strong> Participant with the most wildcard points at the end wins a special prize! 🎁
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Check Daily:</strong> Visit the site each day to see who won yesterday's wildcard challenge!
              </p>
            </div>
          </section>

          {/* Weekly 70k Milestone */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-green-400" />
              Weekly 70K Goal
            </h3>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2">
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Weekly Target:</strong> 70,000 steps per week (10,000 steps/day)
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Achievement Badge:</strong> Earn a special badge each week you hit 70k!
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Raffle Entry:</strong> Hit 70k for 4 total weeks to earn +1 raffle ticket! 🎟️
              </p>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Week Resets:</strong> Every Monday at 12:00 AM EST
              </p>
            </div>
          </section>

          {/* Milestones & Raffle */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-yellow-400" />
              Milestone Raffle Tickets
            </h3>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
              <p className="text-gray-300 text-sm">
                Earn raffle tickets for hitting cumulative milestones:
              </p>
              <ul className="space-y-1 text-gray-300 text-sm ml-4">
                <li>⭐ <strong className="text-white">150,000 steps:</strong> +1 ticket</li>
                <li>⭐⭐ <strong className="text-white">225,000 steps:</strong> +1 ticket (2 total)</li>
                <li>⭐⭐⭐ <strong className="text-white">300,000 steps:</strong> +1 ticket (3 total)</li>
              </ul>
              <p className="text-gray-300 text-sm mt-2">
                <strong className="text-white">Prize Drawing:</strong> At the end of the challenge, raffle tickets are entered for additional prizes!
              </p>
            </div>
          </section>

          {/* Challenge Period */}
          <section className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-center text-white text-sm">
              <strong>Challenge Period:</strong> November 10 - December 10, 2025
              <br />
              <span className="text-gray-400">30 days to reach 300,000 steps!</span>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-primary border-t border-white/10 p-4 z-10">
          <button
            onClick={onClose}
            className="w-full btn-primary py-3"
          >
            Got It! Let's Go! 🏃‍♂️
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to show rules on first visit
export const useShowRulesOnFirstVisit = () => {
  const [showRules, setShowRules] = React.useState(false);

  React.useEffect(() => {
    const hasSeenRules = localStorage.getItem('stepChallenge_hasSeenRules');
    if (!hasSeenRules) {
      setShowRules(true);
      localStorage.setItem('stepChallenge_hasSeenRules', 'true');
    }
  }, []);

  return { showRules, setShowRules };
};
