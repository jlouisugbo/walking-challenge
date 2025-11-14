import React, { useState, useEffect } from 'react';
import { ChallengeRulesCard } from './ChallengeRulesCard';

export const WelcomeModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const seen = localStorage.getItem('hasSeenWelcome');
    if (!seen) {
      setShowModal(true);
    } else {
      setHasSeenWelcome(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowModal(false);
    setHasSeenWelcome(true);
  };

  const handleShowRules = () => {
    setShowModal(true);
  };

  return (
    <>
      {/* Show Rules Button (always visible after first close) */}
      {hasSeenWelcome && !showModal && (
        <button
          onClick={handleShowRules}
          className="fixed bottom-6 right-6 bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-3 rounded-lg shadow-lg transition-all z-40 flex items-center gap-2"
        >
          <span className="text-xl">📋</span>
          <span className="hidden md:inline">Challenge Rules</span>
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <ChallengeRulesCard onClose={handleClose} />
          </div>
        </div>
      )}
    </>
  );
};
