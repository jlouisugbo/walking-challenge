import React, { useState } from 'react';
import { Users, Trophy, Crown, MessageSquare, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useChallenge } from '../contexts/ChallengeContext';
import { formatNumber, stepsToMiles } from '../utils/calculations';
import { loadTeamComments, saveTeamComment, type TeamComment } from '../utils/supabaseStorage';

export const Teams: React.FC = () => {
  const { teams, config } = useChallenge();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [comments, setComments] = useState<Map<string, TeamComment[]>>(new Map());
  const [commentsModalTeam, setCommentsModalTeam] = useState<string | null>(null);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());

  // Load comment counts for all teams
  React.useEffect(() => {
    const loadAllCommentCounts = async () => {
      const counts = new Map<string, number>();
      for (const team of teams) {
        const teamComments = await loadTeamComments(team.name);
        counts.set(team.name, teamComments.length);
      }
      setCommentCounts(counts);
    };
    if (teams.length > 0) {
      loadAllCommentCounts();
    }
  }, [teams]);

  const toggleTeam = (teamName: string) => {
    setExpandedTeam(expandedTeam === teamName ? null : teamName);
  };

  const openCommentsModal = (teamName: string) => {
    setCommentsModalTeam(teamName);
    if (!comments.has(teamName)) {
      loadTeamComments(teamName).then((teamComments) => {
        setComments(new Map(comments.set(teamName, teamComments)));
      });
    }
  };

  const handleSubmitComment = async (teamName: string) => {
    if (!newCommentName.trim() || !newCommentText.trim()) {
      alert('Please enter both your name and a comment.');
      return;
    }

    setSubmittingComment(true);
    const success = await saveTeamComment(teamName, newCommentName.trim(), newCommentText.trim());

    if (success) {
      const teamComments = await loadTeamComments(teamName);
      setComments(new Map(comments.set(teamName, teamComments)));
      setCommentCounts(new Map(commentCounts.set(teamName, teamComments.length)));
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
        <div className="glass-card p-6 md:p-8 text-center">
          <div className="text-4xl md:text-5xl mb-2">👥</div>
          <p className="text-base md:text-lg text-gray-400">No teams formed yet</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Teams will be formed after Heat Week
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
          Team Rankings
        </h1>
        <div className="text-gray-400 text-xs md:text-sm">{teams.length} teams</div>
      </div>

      {/* Compact Team Cards - Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        {teams.map((team) => {
          const isExpanded = expandedTeam === team.name;
          const isTopTeam = team.rank === 1;

          // Generate trend data for line chart
          const generateTeamTrendData = () => {
            const allDates = new Set<string>();
            team.members.forEach((m) => {
              m.dailyHistory?.forEach((d) => allDates.add(d.date));
            });
            const dates = Array.from(allDates).sort();
            return dates.map((date) => {
              const dataPoint: any = { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
              team.members.forEach((m) => {
                const dayData = m.dailyHistory?.find((d) => d.date === date);
                dataPoint[m.name] = dayData?.steps || 0;
              });
              return dataPoint;
            });
          };

          const trendData = generateTeamTrendData();

          return (
            <div
              key={team.name}
              className="glass-card overflow-hidden cursor-pointer hover:border-accent/30 transition-colors"
              style={{ borderLeft: `4px solid ${team.color || '#8b5cf6'}` }}
              onClick={() => toggleTeam(team.name)}
            >
              {/* Compact Team Header */}
              <div className="p-2 md:p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Team Image/Icon - Smaller: 32px */}
                    {team.imageUrl ? (
                      <img
                        src={team.imageUrl}
                        alt={team.name}
                        className="w-8 h-8 object-cover rounded border border-accent/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center bg-primary-light/50 rounded flex-shrink-0">
                        <span className="text-lg">{team.icon || '👥'}</span>
                      </div>
                    )}

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        {isTopTeam && <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />}
                        <span className="text-xs text-gray-400">#{team.rank}</span>
                        <span className="text-sm md:text-base font-bold text-white truncate">{team.name}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatNumber(team.totalSteps)} steps • {stepsToMiles(team.totalSteps).toFixed(0)} mi
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommentsModal(team.name);
                      }}
                      className="flex items-center gap-1 p-1.5 hover:bg-white/10 rounded transition-colors"
                      title="Comments"
                    >
                      <MessageSquare className="w-4 h-4 text-accent" />
                      {commentCounts.get(team.name) && commentCounts.get(team.name)! > 0 && (
                        <span className="text-xs text-accent font-semibold">
                          {commentCounts.get(team.name)}
                        </span>
                      )}
                    </button>
                    <div className="p-1.5">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-accent" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Member List - Always Visible */}
                <div className="space-y-0.5">
                  {team.members
                    .sort((a, b) => b.totalSteps - a.totalSteps)
                    .map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between text-xs py-0.5 px-1 rounded hover:bg-white/5"
                      >
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          {index === 0 && <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                          <span className="text-gray-500 flex-shrink-0 text-[10px]">#{index + 1}</span>
                          <span className="text-white truncate text-xs">{member.name}</span>
                        </div>
                        <span className="text-accent font-semibold flex-shrink-0 ml-1 text-xs">
                          {formatNumber(member.totalSteps)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-white/10 p-2 md:p-3 bg-primary-light/20 space-y-2">
                  {/* Team Stats - Avg/Member and Most Improved side by side */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-primary-light/50 rounded p-2">
                      <div className="text-xs text-gray-400">Avg/Member</div>
                      <div className="text-sm font-bold text-accent">{formatNumber(team.averageSteps)}</div>
                    </div>
                    {(() => {
                      const mostImproved = [...team.members].sort((a, b) => {
                        const aChange = a.rankChange?.direction === 'up' ? a.rankChange.change : 0;
                        const bChange = b.rankChange?.direction === 'up' ? b.rankChange.change : 0;
                        return bChange - aChange;
                      })[0];

                      return mostImproved && mostImproved.rankChange?.direction === 'up' ? (
                        <div className="bg-green-500/10 rounded p-2">
                          <div className="text-xs text-gray-400">🚀 Most Improved</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white font-semibold truncate">{mostImproved.name}</span>
                            <span className="text-xs text-green-400 flex-shrink-0 ml-1">
                              ↑{mostImproved.rankChange.change}
                            </span>
                          </div>
                        </div>
                      ) : isTopTeam ? (
                        <div className="bg-yellow-400/10 rounded p-2">
                          <div className="text-xs text-gray-400">Prize</div>
                          <div className="text-sm font-bold text-yellow-400">
                            ${config.prizes.teamBonusPerMember * team.members.length}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Charts Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Pie Chart - Team Contribution */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Team Contribution</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Pie
                            data={team.members.map((m) => ({
                              name: m.name,
                              value: m.totalSteps,
                            }))}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
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
                              fontSize: '12px',
                              color: '#ffffff',
                              zIndex: 1000,
                            }}
                            formatter={(value: number) => formatNumber(value)}
                            wrapperStyle={{ zIndex: 1000 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Line Chart - Member Progress */}
                    {trendData.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Member Progress</div>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1a1f2e',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '8px',
                                fontSize: '10px',
                                color: '#ffffff',
                                zIndex: 1000,
                              }}
                              wrapperStyle={{ zIndex: 1000 }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            {team.members.map((m, index) => (
                              <Line
                                key={m.id}
                                type="monotone"
                                dataKey={m.name}
                                stroke={['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]}
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                activeDot={{ r: 4 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comments Modal */}
      {commentsModalTeam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary rounded-xl border border-white/20 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-primary">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-white">{commentsModalTeam} Comments</h3>
              </div>
              <button
                onClick={() => setCommentsModalTeam(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* New Comment Form */}
              <div className="bg-primary-light/30 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Your name..."
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="w-full px-3 py-2 bg-primary-light border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
                />
                <textarea
                  placeholder="Leave a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-primary-light border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent resize-none"
                />
                <button
                  onClick={() => handleSubmitComment(commentsModalTeam)}
                  disabled={submittingComment}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-accent hover:bg-accent/80 text-white rounded transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  <Send className="w-3 h-3" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-2">
                {comments.get(commentsModalTeam)?.length ? (
                  comments.get(commentsModalTeam)!.map((comment) => (
                    <div key={comment.id} className="bg-primary-light/50 rounded p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-semibold text-accent">{comment.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-primary-light/50 rounded p-4 text-center">
                    <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
