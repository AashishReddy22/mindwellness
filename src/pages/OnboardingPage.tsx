import React, { useState } from 'react';
import { useNavigate } from '../hooks/useNavigate';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight } from 'lucide-react';

const GOALS = [
  { id: 'stress', label: 'Reduce stress', emoji: '😌' },
  { id: 'focus', label: 'Improve focus', emoji: '🎯' },
  { id: 'balance', label: 'Emotional balance', emoji: '⚖️' }
];

const MUSIC_GENRES = [
  { id: 'lofi', label: 'Lo-fi', emoji: '🎧' },
  { id: 'ambient', label: 'Ambient', emoji: '🌫️' },
  { id: 'classical', label: 'Classical', emoji: '🎻' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
  { id: 'electronic', label: 'Electronic', emoji: '🔊' },
  { id: 'nature', label: 'Nature sounds', emoji: '🌿' }
];

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleGenre = (id: string) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          goals: JSON.stringify(selectedGoals),
          music_preferences: JSON.stringify(selectedGenres),
          onboarding_complete: true
        });

      if (error) throw error;

      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          total_games_played: 0,
          total_music_sessions: 0,
          current_streak: 0
        });

      navigate('dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="glass-effect p-8 slide-in-up">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 gradient-text from-pink-300 to-blue-300">
                  Let's Get Started
                </h1>
                <p className="text-gray-300">
                  Tell us what you'd like to work on
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GOALS.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`mood-btn transition-all ${
                      selectedGoals.includes(goal.id)
                        ? 'bg-gradient-to-br from-pink-300 to-purple-300 text-slate-900'
                        : 'bg-white/10 border border-white/20 text-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{goal.emoji}</div>
                    <div className="font-medium">{goal.label}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={selectedGoals.length === 0}
                className="w-full btn-primary gradient-btn from-pink-400 to-purple-400 text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 gradient-text from-pink-300 to-blue-300">
                  Music Preferences
                </h1>
                <p className="text-gray-300">
                  Select genres you enjoy
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MUSIC_GENRES.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`mood-btn transition-all ${
                      selectedGenres.includes(genre.id)
                        ? 'bg-gradient-to-br from-blue-300 to-cyan-300 text-slate-900'
                        : 'bg-white/10 border border-white/20 text-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{genre.emoji}</div>
                    <div className="text-sm font-medium">{genre.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary border-white/20 text-white hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 btn-primary gradient-btn from-pink-400 to-purple-400 text-white disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
