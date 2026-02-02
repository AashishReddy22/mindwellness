import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { LogOut, Zap, Music, BarChart3, Calendar } from 'lucide-react';
import { MoodSelector } from '../components/MoodSelector';
import { GamesModule } from '../components/GamesModule';
import { MusicModule } from '../components/MusicModule';
import { ProgressTracker } from '../components/ProgressTracker';

type TabType = 'home' | 'games' | 'music' | 'progress';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setUserProgress(data);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="pulse-soft text-2xl gradient-text from-pink-300 to-blue-300">
          Loading your wellness space...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text from-pink-300 via-purple-300 to-blue-300 mb-1">
              MindWell
            </h1>
            <p className="text-gray-300">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-primary gradient-btn from-red-400 to-pink-400 text-white flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">{userProgress?.total_games_played || 0}</div>
            <div className="text-sm text-gray-300">Games Played</div>
          </div>

          <div className="card text-center">
            <Music className="w-8 h-8 mx-auto mb-2 text-pink-300" />
            <div className="text-2xl font-bold">{userProgress?.total_music_sessions || 0}</div>
            <div className="text-sm text-gray-300">Music Sessions</div>
          </div>

          <div className="card text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-300" />
            <div className="text-2xl font-bold">{userProgress?.current_streak || 0}</div>
            <div className="text-sm text-gray-300">Day Streak</div>
          </div>

          <div className="card text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-300" />
            <div className="text-2xl font-bold">{userProgress?.emotional_balance_score || 50}</div>
            <div className="text-sm text-gray-300">Balance Score</div>
          </div>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'home', label: 'Home', icon: null },
            { id: 'games', label: 'Games', icon: null },
            { id: 'music', label: 'Music', icon: null },
            { id: 'progress', label: 'Progress', icon: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'gradient-btn from-pink-400 to-purple-400 text-white'
                  : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="scale-in">
          {activeTab === 'home' && <MoodSelector userProgress={userProgress} />}
          {activeTab === 'games' && <GamesModule />}
          {activeTab === 'music' && <MusicModule />}
          {activeTab === 'progress' && <ProgressTracker userProgress={userProgress} />}
        </div>
      </div>
    </div>
  );
};
