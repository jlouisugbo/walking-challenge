import React, { useState, useEffect } from 'react';
import { Users, Trophy, ChevronDown, ChevronUp, Award, Crown, TrendingUp, MessageSquare, Send } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useChallenge } from '../contexts/ChallengeContext';
import { formatNumber, stepsToMiles } from '../utils/calculations';
import { loadTeamComments, saveTeamComment, type TeamComment } from '../utils/supabaseStorage';

export const Teams: React.FC = () => {
  const { teams, config } = useChallenge();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(teams[0]?.name || null);
  const [comments, setComments] = useState<Map<string, TeamComment[]>>(new Map());
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const toggleTeam = (teamName: string) => {
    setExpandedTeam(expandedTeam === teamName ? null : teamName);
  };

  // Load comments for expanded team
  useEffect(() => {
    if (expandedTeam && !comments.has(expandedTeam)) {
      loadTeamComments(expandedTeam).then((teamComments) => {
        setComments(new Map(comments.set(expandedTeam, teamComments)));
      });
    }
  }, [expandedTeam]);

  // Handle comment submission
  const handleSubmitComment = async (teamName: string) => {
    if (!newCommentName.trim() || !newCommentText.trim()) {
      alert('Please enter both your name and a comment.');
      return;
    }

    setSubmittingComment(true);
    const success = await saveTeamComment(teamName, newCommentName.trim(), newCommentText.trim());

    if (success) {
      // Reload comments
      const teamComments = await loadTeamComments(teamName);
      setComments(new Map(comments.set(teamName, teamComments)));
      // Clear form
      setNewCommentName('');
      setNewCommentText('');
    } else {
      alert('Failed to post comment. Please try again.');
    }

    setSubmittingComment(false);
  };

  if (teams.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          Team Rankings
        </h1>
        <div className="glass-card p-8 md:p-12 text-center">
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">👥</div>
          <p className="text-lg md:text-xl text-gray-400 mb-2">No teams assigned yet</p>
          <p className="text-sm text-gray-500">
            Teams will be assigned after Heat Week on Nov 17, 2025. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          Team Rankings
        </h1>
        <div className="text-gray-400 text-sm md:text-base">{teams.length} teams</div>
      </div>

      {/* Team Accordion Bars */}
      <div className="space-y-2 md:space-y-3">
        {teams.map((team) => {
          const isExpanded = expandedTeam === team.name;
          const leader = team.members.sort((a, b) => b.totalSteps - a.totalSteps)[0];
          const isTopTeam = team.rank === 1;

          return (
            <div
              key={team.name}
              className="glass-card overflow-hidden transition-all duration-300"
              style={{
                borderLeft: `4px solid ${team.color || '#8b5cf6'}`,
              }}
            >
              {/* Team Bar - Clickable Header */}
              <button
                onClick={() => toggleTeam(team.name)}
                className="w-full px-3 md:px-4 py-2 md:py-3 hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  {/* Rank & Icon/Image */}
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    {/* Team Image - 48x48px on desktop, 40x40px on mobile */}
                    {team.imageUrl ? (
                      <img
                        src={team.imageUrl}
                        alt={team.name}
                        className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg border-2 border-accent/30"
                        style={{ width: '40px', height: '40px' }}
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-primary-light/50 rounded-lg">
                        <span className="text-2xl md:text-3xl">{team.icon || '👥'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {isTopTeam && <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />}
                      <span className="text-lg md:text-xl font-bold text-gray-400">#{team.rank}</span>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="text-base md:text-lg font-bold text-white truncate">
                    {team.name}
                  </div>

                  {/* Leader Name (hidden on mobile if too narrow) */}
                  <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm text-gray-400">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">{leader?.name || 'No leader'}</span>
                  </div>

                  {/* Total Steps */}
                  <div className="flex-shrink-0 ml-auto mr-2 md:mr-4">
                    <div className="text-sm md:text-base font-bold text-accent stat-number">
                      {formatNumber(team.totalSteps)}
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      {stepsToMiles(team.totalSteps).toFixed(0)} mi
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/10 p-3 md:p-4 bg-primary-light/30 space-y-3 md:space-y-4">
                  {/* Team Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-primary-light/50 rounded-lg p-2 md:p-3">
                      <div className="text-xs text-gray-400">Total Steps</div>
                      <div className="text-base md:text-lg font-bold text-white stat-number">
                        {formatNumber(team.totalSteps)}
                      </div>
                    </div>
                    <div className="bg-primary-light/50 rounded-lg p-2 md:p-3">
                      <div className="text-xs text-gray-400">Avg/Member</div>
                      <div className="text-base md:text-lg font-bold text-accent stat-number">
                        {formatNumber(team.averageSteps)}
                      </div>
                    </div>
                    <div className="bg-primary-light/50 rounded-lg p-2 md:p-3">
                      <div className="text-xs text-gray-400">Members</div>
                      <div className="text-base md:text-lg font-bold text-purple-400">
                        {team.members.length}
                      </div>
                    </div>
                  </div>

                  {/* Team Description */}
                  {team.description && (
                    <div className="text-xs md:text-sm text-gray-300 italic p-2 md:p-3 bg-primary-light/30 rounded-lg">
                      "{team.description}"
                    </div>
                  )}

                  {/* Prize Info */}
                  {isTopTeam && (
                    <div className="text-xs md:text-sm text-yellow-400 font-semibold p-2 md:p-3 bg-yellow-400/10 rounded-lg">
                      💰 Prize: ${config.prizes.teamBonusPerMember * team.members.length} Team Bonus
                      (${config.prizes.teamBonusPerMember}/member)
                    </div>
                  )}

                  {/* Team Dynamics */}
                  <div className="bg-primary-light/30 rounded-lg p-3 md:p-4">
                    <div className="text-xs md:text-sm text-gray-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      Team Dynamics
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contribution Pie Chart */}
                      <div>
                        <div className="text-xs text-gray-400 mb-2">Member Contributions</div>
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie
                              data={team.members.map((m) => ({
                                name: m.name,
                                value: m.totalSteps,
                              }))}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={50}
                              label={(entry) => `${((entry.value / team.totalSteps) * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {team.members.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1a1f2e',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '8px',
                              }}
                              formatter={(value: number) => formatNumber(value)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Most Improved Member */}
                      <div>
                        <div className="text-xs text-gray-400 mb-2">Most Improved</div>
                        {(() => {
                          // Calculate most improved based on rank change
                          const mostImproved = [...team.members].sort((a, b) => {
                            const aChange = a.rankChange?.direction === 'up' ? a.rankChange.change : 0;
                            const bChange = b.rankChange?.direction === 'up' ? b.rankChange.change : 0;
                            return bChange - aChange;
                          })[0];

                          return mostImproved && mostImproved.rankChange?.direction === 'up' ? (
                            <div className="bg-primary-light/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🚀</span>
                                <div>
                                  <div className="text-sm font-semibold text-white">{mostImproved.name}</div>
                                  <div className="text-xs text-green-400">
                                    ↑ {mostImproved.rankChange.change} spot{mostImproved.rankChange.change > 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatNumber(mostImproved.totalSteps)} steps
                              </div>
                            </div>
                          ) : (
                            <div className="bg-primary-light/50 rounded-lg p-3 text-center">
                              <div className="text-sm text-gray-400">No rank changes yet</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div>
                    <div className="text-xs md:text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Award className="w-3 h-3 md:w-4 md:h-4" />
                      Team Members
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      {team.members
                        .sort((a, b) => b.totalSteps - a.totalSteps)
                        .map((member, index) => {
                          const contribution = (member.totalSteps / team.totalSteps) * 100;
                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between bg-primary-light/50 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs text-gray-500 flex-shrink-0">#{index + 1}</span>
                                <span className="text-xs md:text-sm text-white truncate">{member.name}</span>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  ({contribution.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <div className="text-xs md:text-sm font-semibold text-accent stat-number">
                                  {formatNumber(member.totalSteps)}
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                  {stepsToMiles(member.totalSteps).toFixed(0)} mi
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Team Comments */}
                  <div>
                    <div className="text-xs md:text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                      Team Comments
                    </div>

                    {/* New Comment Form */}
                    <div className="bg-primary-light/30 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Your name..."
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          className="px-3 py-2 bg-primary-light border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => handleSubmitComment(team.name)}
                          disabled={submittingComment}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                        >
                          <Send className="w-3 h-3" />
                          {submittingComment ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                      <textarea
                        placeholder="Leave a comment for your team..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-primary-light border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent resize-none"
                      />
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2">
                      {comments.get(team.name)?.length ? (
                        comments.get(team.name)!.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-primary-light/50 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-xs md:text-sm font-semibold text-accent">
                                {comment.authorName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300">{comment.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-primary-light/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-400">
                            No comments yet. Be the first to comment!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
