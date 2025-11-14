import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import type { WildcardResult } from '../../types';
import { WILDCARD_CATEGORIES } from '../../utils/wildcardSystem';

interface WildcardAnnouncementProps {
  result: WildcardResult;
}

export const WildcardAnnouncement: React.FC<WildcardAnnouncementProps> = ({ result }) => {
  const category = WILDCARD_CATEGORIES[result.category];

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-lg p-6 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Daily Wildcard Winner!</h3>
          </div>

          <div className="mb-3">
            <div className="text-2xl font-bold text-purple-300 mb-1">
              {category.emoji} {category.name}
            </div>
            <div className="text-sm text-gray-400">{category.description}</div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 mb-3">
            <div className="text-lg text-white mb-1">
              🏆 <span className="font-bold">{result.winnerName}</span>
            </div>
            <div className="text-sm text-gray-300">{result.description}</div>
          </div>

          <div className="flex items-center gap-2 text-yellow-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>+1 Wildcard Point Awarded!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
