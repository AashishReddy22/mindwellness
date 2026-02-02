import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const MoodSelector: React.FC<{ userProgress: any }> = ({ userProgress }) => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadMoods = async () => {
      try {
        const { data } = await supabase
          .from('moods')
          .select('*');
        setMoods(data || []);
      } catch (error) {
        console.error('Error loading moods:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoods();
  }, []);

  const handleMoodSelect = async (moodId: string) => {
    if (!user) return;

    try {
      setSelectedMood(moodId);
      await supabase
        .from('user_moods')
        .insert({
          user_id: user.id,
          mood_id: moodId,
          timestamp: new Date().toISOString()
        });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
      }, 2000);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text from-pink-300 to-blue-300">
          How are you feeling today?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moods.map(mood => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`mood-btn transition-all ${
                selectedMood === mood.id
                  ? `bg-gradient-to-br to-gray-900`
                  : 'bg-white/10 border border-white/20'
              }`}
              style={selectedMood === mood.id ? { backgroundImage: `linear-gradient(135deg, ${mood.color}, rgba(0,0,0,0.3))` } : {}}
            >
              <div className="text-4xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-medium">{mood.name}</div>
            </button>
          ))}
        </div>

        {submitted && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-center slide-in-up">
            Mood recorded! Keep going on your wellness journey.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-pink-300">Daily Challenge</h3>
          <p className="text-gray-300 mb-4">
            Play a game and discover mood-matched music to enhance your wellness routine.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
              <div className="text-2xl mb-1">🧠</div>
              <div className="text-xs text-gray-400">Game</div>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-white/5 text-center">
              <div className="text-2xl mb-1">🎵</div>
              <div className="text-xs text-gray-400">Music</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-blue-300">Your Streak</h3>
          <p className="text-gray-300 mb-4">
            Keep your wellness routine consistent and watch your progress grow.
          </p>
          <div className="text-3xl font-bold text-purple-300">
            {userProgress?.current_streak || 0} days
          </div>
        </div>
      </div>
    </div>
  );
};
