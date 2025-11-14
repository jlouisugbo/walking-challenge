import React, { useState } from 'react';
import {
  Settings,
  Upload,
  Edit3,
  Users as UsersIcon,
  Download,
  Trash2,
  Plus,
  Save,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { parsePacerLeaderboardFlexible } from '../utils/pacerParser';
import { parseCSV, parseHistoricalCSV, generateSampleCSV, generateSampleHistoricalCSV } from '../utils/csvParser';
import { formatNumber } from '../utils/calculations';
import { exportDataFromSupabase, importDataToSupabase } from '../utils/supabaseStorage';
import type { UpdatePreview } from '../types';
import { AdminProtected } from '../components/common/AdminProtected';
import {
  getRandomWildcardCategory,
  calculateWildcardWinner,
  WILDCARD_CATEGORIES,
  isAfterHeatWeek,
  getWildcardResults,
  saveWildcardResult,
} from '../utils/wildcardSystem';

type Tab = 'paste' | 'csv' | 'historical' | 'wildcard' | 'manual' | 'teams' | 'settings' | 'data';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('csv');

  return (
    <AdminProtected>
      <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-accent" />
          Admin Panel
        </h1>
        <div className="text-sm text-gray-400">Control Center</div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeTab === 'csv'}
            onClick={() => setActiveTab('csv')}
            icon={Upload}
            label="CSV Import"
          />
          <TabButton
            active={activeTab === 'historical'}
            onClick={() => setActiveTab('historical')}
            icon={Calendar}
            label="Historical Data"
          />
          <TabButton
            active={activeTab === 'wildcard'}
            onClick={() => setActiveTab('wildcard')}
            icon={Sparkles}
            label="Wildcard"
          />
          <TabButton
            active={activeTab === 'paste'}
            onClick={() => setActiveTab('paste')}
            icon={Upload}
            label="Pacer Paste"
          />
          <TabButton
            active={activeTab === 'manual'}
            onClick={() => setActiveTab('manual')}
            icon={Edit3}
            label="Manual Entry"
          />
          <TabButton
            active={activeTab === 'teams'}
            onClick={() => setActiveTab('teams')}
            icon={UsersIcon}
            label="Teams"
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={Settings}
            label="Settings"
          />
          <TabButton
            active={activeTab === 'data'}
            onClick={() => setActiveTab('data')}
            icon={Download}
            label="Data"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'csv' && <CSVTab />}
        {activeTab === 'historical' && <HistoricalTab />}
        {activeTab === 'wildcard' && <WildcardTab />}
        {activeTab === 'paste' && <PasteTab />}
        {activeTab === 'manual' && <ManualTab />}
        {activeTab === 'teams' && <TeamsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'data' && <DataTab />}
      </div>
    </div>
    </AdminProtected>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-accent text-white font-semibold'
          : 'bg-primary-light text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

const CSVTab: React.FC = () => {
  const { bulkUpdateFromPacer, applyBulkUpdate } = useChallenge();
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState<UpdatePreview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    const result = parseCSV(csvText);

    if (!result.success || result.entries.length === 0) {
      setError(result.errors.join('\n') || 'Failed to parse. Check the format.');
      setPreview(null);
      return;
    }

    // Convert CSV entries to Pacer entries format
    const pacerEntries = result.entries.map((entry, index) => ({
      name: entry.name,
      steps: entry.steps,
      rank: index + 1,
    }));

    const previews = bulkUpdateFromPacer(pacerEntries);
    setPreview(previews);
  };

  const handleApply = () => {
    if (preview) {
      applyBulkUpdate(preview);
      setCsvText('');
      setPreview(null);
      setError(null);
      alert('✅ Updates applied successfully!');
    }
  };

  const handleLoadSample = () => {
    setCsvText(generateSampleCSV());
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-accent" />
          📊 CSV Import
        </h2>

        <p className="text-sm text-gray-400 mb-4">
          Paste CSV data in the format: <code className="text-accent">Name, Steps</code>
          <br />
          Supports periods and commas in numbers (e.g., "57.323" or "57,323")
        </p>

        <div className="flex gap-2 mb-4">
          <button onClick={handleLoadSample} className="btn-secondary text-sm">
            Load Sample
          </button>
        </div>

        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Nadia, 57449&#10;Joel, 55709&#10;Shreya, 50499&#10;..."
          className="w-full h-64 px-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button onClick={handleParse} className="btn-primary">
            Parse & Preview
          </button>
          <button
            onClick={() => {
              setCsvText('');
              setPreview(null);
              setError(null);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400">Parse Error</div>
                <div className="text-sm text-red-300 whitespace-pre-wrap mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview - Same as PasteTab */}
      {preview && preview.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Preview Changes</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-gray-400 font-semibold">Name</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-semibold">Old Steps</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-semibold">New Steps</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-semibold">Change</th>
                  <th className="text-center py-2 px-3 text-gray-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-white font-medium">{item.name}</td>
                    <td className="py-2 px-3 text-right text-gray-400 stat-number">
                      {formatNumber(item.oldSteps)}
                    </td>
                    <td className="py-2 px-3 text-right text-accent stat-number">
                      {formatNumber(item.newSteps)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-semibold stat-number ${
                        item.change > 0
                          ? 'text-green-400'
                          : item.change < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.change > 0 ? '+' : ''}
                      {formatNumber(item.change)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.status === 'new' && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                          🆕 New
                        </span>
                      )}
                      {item.status === 'update' && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                          ✅ Update
                        </span>
                      )}
                      {item.status === 'unchanged' && (
                        <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs font-semibold">
                          ➖ Same
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleApply} className="btn-primary">
              <Save className="w-5 h-5 inline mr-2" />
              Confirm & Apply Updates
            </button>
            <button onClick={() => setPreview(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoricalTab: React.FC = () => {
  const { participants, addParticipant, updateParticipant } = useChallenge();
  const [historicalText, setHistoricalText] = useState('');
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    const imports = parseHistoricalCSV(historicalText);

    if (imports.length === 0) {
      setError('No valid data found. Check the format.');
      setParsedData(null);
      return;
    }

    setParsedData(imports);
  };

  const handleApply = async () => {
    if (!parsedData) return;

    try {
      for (const dayData of parsedData) {
        const date = dayData.date;

        for (const entry of dayData.entries) {
          const existing = participants.find((p) => p.name.toLowerCase() === entry.name.toLowerCase());

          if (existing) {
            // Update existing participant with daily history
            const dailyHistory = existing.dailyHistory || [];
            const existingDay = dailyHistory.find((d) => d.date === date);

            if (!existingDay) {
              dailyHistory.push({
                date,
                steps: entry.steps,
                timestamp: new Date(date).getTime(),
              });
            }

            // Sort by date
            dailyHistory.sort((a, b) => a.timestamp - b.timestamp);

            await updateParticipant(existing.id, {
              dailyHistory,
              totalSteps: entry.steps, // Update to latest total
            });
          } else {
            // Add new participant
            await addParticipant(entry.name, entry.steps, null);
          }
        }
      }

      alert(`✅ Imported ${parsedData.length} day(s) of historical data!`);
      setHistoricalText('');
      setParsedData(null);
    } catch (error) {
      console.error('Error importing historical data:', error);
      alert('❌ Failed to import historical data. Please try again.');
    }
  };

  const handleLoadSample = () => {
    setHistoricalText(generateSampleHistoricalCSV());
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent" />
          📅 Historical Data Import
        </h2>

        <p className="text-sm text-gray-400 mb-4">
          Import daily step data for previous days. Format:
          <br />
          <code className="text-accent">YYYY-MM-DD</code> (or MM/DD/YYYY)
          <br />
          <code className="text-accent">Name, Steps</code>
          <br />
          <code className="text-accent">Name2, Steps</code>
          <br />
          (blank line, then next date)
        </p>

        <div className="flex gap-2 mb-4">
          <button onClick={handleLoadSample} className="btn-secondary text-sm">
            Load Sample
          </button>
        </div>

        <textarea
          value={historicalText}
          onChange={(e) => setHistoricalText(e.target.value)}
          placeholder="2025-11-10&#10;Nadia, 8234&#10;Joel, 7892&#10;&#10;2025-11-11&#10;Nadia, 15678&#10;Joel, 14234"
          className="w-full h-80 px-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button onClick={handleParse} className="btn-primary">
            Parse & Preview
          </button>
          <button
            onClick={() => {
              setHistoricalText('');
              setParsedData(null);
              setError(null);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400">Parse Error</div>
                <div className="text-sm text-red-300 whitespace-pre-wrap mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {parsedData && parsedData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Preview: {parsedData.length} Day(s) of Data
          </h3>

          <div className="space-y-4">
            {parsedData.map((dayData, index) => (
              <div key={index} className="bg-primary-light/50 rounded-lg p-4">
                <div className="font-semibold text-accent mb-2">📅 {dayData.date}</div>
                <div className="text-sm space-y-1">
                  {dayData.entries.map((entry: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-400">{entry.name}</span>
                      <span className="text-white stat-number">{formatNumber(entry.steps)} steps</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleApply} className="btn-primary">
              <Save className="w-5 h-5 inline mr-2" />
              Import Historical Data
            </button>
            <button onClick={() => setParsedData(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PasteTab: React.FC = () => {
  const { bulkUpdateFromPacer, applyBulkUpdate } = useChallenge();
  const [pasteText, setPasteText] = useState('');
  const [preview, setPreview] = useState<UpdatePreview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    const result = parsePacerLeaderboardFlexible(pasteText);

    if (!result.success || result.entries.length === 0) {
      setError(result.errors.join('\n') || 'Failed to parse. Check the format.');
      setPreview(null);
      return;
    }

    const previews = bulkUpdateFromPacer(result.entries);
    setPreview(previews);
  };

  const handleApply = () => {
    if (preview) {
      applyBulkUpdate(preview);
      setPasteText('');
      setPreview(null);
      setError(null);
      alert('✅ Updates applied successfully!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-accent" />
          📋 Paste Pacer Leaderboard
        </h2>

        <p className="text-sm text-gray-400 mb-4">
          Copy the leaderboard from Pacer and paste it here. Expected format: Name, Steps, Rank
          (each on separate lines).
        </p>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Nadia&#10;57,449&#10;1&#10;Joel&#10;55,709&#10;2&#10;..."
          className="w-full h-64 px-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button onClick={handleParse} className="btn-primary">
            Parse & Preview
          </button>
          <button
            onClick={() => {
              setPasteText('');
              setPreview(null);
              setError(null);
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400">Parse Error</div>
                <div className="text-sm text-red-300 whitespace-pre-wrap mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Preview Changes</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-gray-400 font-semibold">Name</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-semibold">Old Steps</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-semibold">New Steps</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-semibold">Change</th>
                  <th className="text-center py-2 px-3 text-gray-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-white font-medium">{item.name}</td>
                    <td className="py-2 px-3 text-right text-gray-400 stat-number">
                      {formatNumber(item.oldSteps)}
                    </td>
                    <td className="py-2 px-3 text-right text-accent stat-number">
                      {formatNumber(item.newSteps)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-semibold stat-number ${
                        item.change > 0
                          ? 'text-green-400'
                          : item.change < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.change > 0 ? '+' : ''}
                      {formatNumber(item.change)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.status === 'new' && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                          🆕 New
                        </span>
                      )}
                      {item.status === 'update' && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                          ✅ Update
                        </span>
                      )}
                      {item.status === 'unchanged' && (
                        <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs font-semibold">
                          ➖ Same
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleApply} className="btn-primary">
              <Save className="w-5 h-5 inline mr-2" />
              Confirm & Apply Updates
            </button>
            <button onClick={() => setPreview(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ManualTab: React.FC = () => {
  const { participants, addParticipant, updateParticipantSteps, deleteParticipant } =
    useChallenge();
  const [newName, setNewName] = useState('');
  const [newSteps, setNewSteps] = useState('0');

  const handleAdd = () => {
    if (newName.trim()) {
      addParticipant(newName.trim(), parseInt(newSteps) || 0);
      setNewName('');
      setNewSteps('0');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteParticipant(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Participant */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6 text-accent" />
          Add New Participant
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="number"
            placeholder="Initial Steps"
            value={newSteps}
            onChange={(e) => setNewSteps(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="w-full md:w-32 px-4 py-3 bg-primary-light rounded-lg border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button onClick={handleAdd} className="btn-primary">
            <Plus className="w-5 h-5 inline md:mr-2" />
            <span className="hidden md:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Participant List */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">All Participants</h2>

        {participants.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No participants yet. Add one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participants
              .sort((a, b) => b.totalSteps - a.totalSteps)
              .map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  onUpdateSteps={(steps) => updateParticipantSteps(participant.id, steps)}
                  onDelete={() => handleDelete(participant.id, participant.name)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ParticipantRow: React.FC<{
  participant: any;
  onUpdateSteps: (steps: number) => void;
  onDelete: () => void;
}> = ({ participant, onUpdateSteps, onDelete }) => {
  const [steps, setSteps] = useState(participant.totalSteps.toString());
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    onUpdateSteps(parseInt(steps) || 0);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 bg-primary-light/50 rounded-lg p-3">
      <div className="flex-1">
        <div className="text-white font-medium">{participant.name}</div>
        {participant.team && (
          <div className="text-xs text-gray-400 mt-1">Team: {participant.team}</div>
        )}
      </div>

      {editing ? (
        <input
          type="number"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          className="w-32 px-3 py-2 bg-primary rounded-lg border border-accent text-white focus:outline-none"
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      ) : (
        <div className="text-accent font-bold stat-number">{formatNumber(participant.totalSteps)}</div>
      )}

      <div className="flex gap-2">
        {editing ? (
          <>
            <button onClick={handleSave} className="p-2 bg-green-500 hover:bg-green-600 rounded-lg">
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSteps(participant.totalSteps.toString());
                setEditing(false);
              }}
              className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="p-2 bg-primary hover:bg-primary-light rounded-lg"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSteps(participant.totalSteps + 1000)}
              className="px-3 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg text-accent text-xs font-semibold"
            >
              +1k
            </button>
            <button
              onClick={() => onUpdateSteps(participant.totalSteps + 5000)}
              className="px-3 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg text-accent text-xs font-semibold"
            >
              +5k
            </button>
            <button onClick={onDelete} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const TeamsTab: React.FC = () => {
  const { participants, updateParticipant, config } = useChallenge();

  const teams = ['Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta', 'Team Echo'];

  const handleAssignTeam = (participantId: string, team: string) => {
    updateParticipant(participantId, { team: team === 'none' ? null : team });
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <UsersIcon className="w-6 h-6 text-accent" />
        Team Assignment
      </h2>

      <p className="text-sm text-gray-400 mb-6">
        Assign participants to teams. Teams should typically have {config.teamSize} members each.
      </p>

      {participants.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No participants to assign. Add some first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between bg-primary-light/50 rounded-lg p-4"
              >
                <div>
                  <div className="text-white font-medium">{participant.name}</div>
                  <div className="text-xs text-gray-400 stat-number">
                    {formatNumber(participant.totalSteps)} steps
                  </div>
                </div>
                <select
                  value={participant.team || 'none'}
                  onChange={(e) => handleAssignTeam(participant.id, e.target.value)}
                  className="px-4 py-2 bg-primary rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="none">No Team</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const SettingsTab: React.FC = () => {
  const { config, updateConfig } = useChallenge();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    updateConfig(localConfig);
    alert('✅ Settings saved!');
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Challenge Settings</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={localConfig.startDate}
              onChange={(e) => setLocalConfig({ ...localConfig, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={localConfig.endDate}
              onChange={(e) => setLocalConfig({ ...localConfig, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Goal Steps</label>
          <input
            type="number"
            value={localConfig.goalSteps}
            onChange={(e) => setLocalConfig({ ...localConfig, goalSteps: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">1st Prize ($)</label>
            <input
              type="number"
              value={localConfig.prizes.first}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  prizes: { ...localConfig.prizes, first: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">2nd Prize ($)</label>
            <input
              type="number"
              value={localConfig.prizes.second}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  prizes: { ...localConfig.prizes, second: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">3rd Prize ($)</label>
            <input
              type="number"
              value={localConfig.prizes.third}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  prizes: { ...localConfig.prizes, third: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Team Bonus ($ per member)</label>
            <input
              type="number"
              value={localConfig.prizes.teamBonusPerMember}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  prizes: { ...localConfig.prizes, teamBonusPerMember: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">
        <Save className="w-5 h-5 inline mr-2" />
        Save Settings
      </button>
    </div>
  );
};

const DataTab: React.FC = () => {
  const { resetChallenge, refreshData } = useChallenge();

  const handleExport = async () => {
    try {
      const data = await exportDataFromSupabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `step-challenge-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('✅ Backup downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export data. Please try again.');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = event.target?.result as string;
            const success = await importDataToSupabase(data);
            if (success) {
              alert('✅ Data imported successfully! Refreshing...');
              await refreshData();
              window.location.reload();
            } else {
              alert('❌ Failed to import data. Check the file format.');
            }
          } catch (error) {
            console.error('Import error:', error);
            alert('❌ Failed to import data. Invalid file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (
      confirm(
        '⚠️ Are you ABSOLUTELY SURE you want to reset ALL data? This cannot be undone!\n\nType YES in the next prompt to confirm.'
      )
    ) {
      const confirmation = prompt('Type YES to confirm reset:');
      if (confirmation === 'YES') {
        resetChallenge();
        alert('✅ Challenge data has been reset.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>

      <div className="space-y-4">
        <div className="bg-primary-light/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-accent" />
            Export Data
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Download a backup of all challenge data as JSON.
          </p>
          <button onClick={handleExport} className="btn-primary">
            <Download className="w-5 h-5 inline mr-2" />
            Download Backup
          </button>
        </div>

        <div className="bg-primary-light/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent" />
            Import Data
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Restore data from a previously exported JSON file.
          </p>
          <button onClick={handleImport} className="btn-secondary">
            <Upload className="w-5 h-5 inline mr-2" />
            Import from File
          </button>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Reset all challenge data. This action cannot be undone!
          </p>
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            <Trash2 className="w-5 h-5 inline mr-2" />
            Reset Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

// Wildcard Tab Component
const WildcardTab: React.FC = () => {
  const { participants, awardWildcardPoint } = useChallenge();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [wildcardHistory, setWildcardHistory] = useState<any[]>([]);

  const isEnabled = isAfterHeatWeek(new Date(selectedDate));

  // Load wildcard history on mount
  React.useEffect(() => {
    const loadHistory = async () => {
      const history = await getWildcardResults();
      setWildcardHistory(history);
    };
    loadHistory();
  }, []);

  const handleCalculateWildcard = () => {
    if (!selectedCategory) {
      alert('Please select a wildcard category first!');
      return;
    }

    setIsCalculating(true);

    const category = selectedCategory as any;
    const winner = calculateWildcardWinner(category, participants, selectedDate);

    if (winner) {
      setResult(winner);
    } else {
      alert('Could not calculate a winner for this category. Make sure participants have sufficient data.');
    }

    setIsCalculating(false);
  };

  const handleAwardPoint = async () => {
    if (!result) return;

    try {
      // Award the point
      await awardWildcardPoint(result.winnerId);

      // Save to wildcard history
      await saveWildcardResult(result);

      // Refresh history
      const history = await getWildcardResults();
      setWildcardHistory(history);

      alert(`✨ Wildcard point awarded to ${result.winnerName}!`);
      setResult(null);
    } catch (error) {
      console.error('Error awarding wildcard point:', error);
      alert('❌ Failed to award wildcard point. Please try again.');
    }
  };

  const handleRandomCategory = () => {
    const random = getRandomWildcardCategory();
    setSelectedCategory(random);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Wildcard Challenge System
        </h2>
        <p className="text-gray-400">
          Award daily wildcard points for special achievements. Wildcard challenges are only active after Heat Week ends (Nov 17+, 2025).
        </p>
      </div>

      {!isEnabled && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Wildcard Not Active
          </div>
          <p className="text-sm text-gray-400">
            Wildcard challenges begin after Heat Week ends on November 16, 2025. The selected date ({selectedDate}) is before this date.
          </p>
        </div>
      )}

      {/* Date Selection */}
      <div className="bg-primary-light/50 rounded-lg p-4">
        <label className="block text-sm font-semibold text-white mb-2">Challenge Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Category Selection */}
      <div className="bg-primary-light/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-white">Wildcard Category</label>
          <button
            onClick={handleRandomCategory}
            className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded transition-all"
          >
            🎲 Random Category
          </button>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 bg-primary-light rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">-- Select a Category --</option>
          {Object.entries(WILDCARD_CATEGORIES).map(([key, cat]: [string, any]) => (
            <option key={key} value={key}>
              {cat.emoji} {cat.name} - {cat.description}
            </option>
          ))}
        </select>
      </div>

      {/* Calculate Winner Button */}
      <div>
        <button
          onClick={handleCalculateWildcard}
          disabled={!selectedCategory || isCalculating || !isEnabled}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? 'Calculating...' : '🎯 Calculate Winner'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">
              {WILDCARD_CATEGORIES[result.category].emoji}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {WILDCARD_CATEGORIES[result.category].name}
            </h3>
            <p className="text-sm text-gray-400">
              {WILDCARD_CATEGORIES[result.category].description}
            </p>
          </div>

          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="text-2xl font-bold text-white mb-2 text-center">
              🏆 {result.winnerName}
            </div>
            <p className="text-gray-300 text-center">{result.description}</p>
          </div>

          <button
            onClick={handleAwardPoint}
            className="btn-primary w-full"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Award +1 Wildcard Point
          </button>
        </div>
      )}

      {/* Wildcard History */}
      {wildcardHistory.length > 0 && (
        <div className="bg-primary-light/50 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-3">Recent Wildcard Winners</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wildcardHistory
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((record: any) => (
                <div
                  key={record.id}
                  className="bg-primary-light rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-semibold">
                      {WILDCARD_CATEGORIES[record.category].emoji} {record.winnerName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {record.date} - {WILDCARD_CATEGORIES[record.category].name}
                    </div>
                  </div>
                  <div className="text-yellow-400 font-semibold">+1 pt</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
