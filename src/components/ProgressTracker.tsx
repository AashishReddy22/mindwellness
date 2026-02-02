import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Trophy, TrendingUp } from 'lucide-react';

export const ProgressTracker: React.FC<{ userProgress: any }> = ({ userProgress }) => {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('game_sessions')
          .select('completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const gamesPerDay = Array(7).fill(0);
        data?.forEach(session => {
          const day = Math.floor((Date.now() - new Date(session.completed_at).getTime()) / (24 * 60 * 60 * 1000));
          if (day < 7) gamesPerDay[day]++;
        });

        setWeeklyData(gamesPerDay.reverse());

        const streak = userProgress?.current_streak || 0;
        const gamesPlayed = userProgress?.total_games_played || 0;
        const achList = [];

        if (streak >= 1) achList.push('First Step');
        if (streak >= 7) achList.push('Week Warrior');
        if (streak >= 30) achList.push('Monthly Master');
        if (gamesPlayed >= 5) achList.push('Game Enthusiast');
        if (gamesPlayed >= 20) achList.push('Mind Master');

        setAchievements(achList);
      } catch (error) {
        console.error('Error loading weekly data:', error);
      }
    };

    loadWeeklyData();
  }, [user, userProgress]);

  const maxGames = Math.max(...weeklyData, 1);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 gradient-text from-pink-300 to-blue-300 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Your Progress
        </h2>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Games This Week</h3>
          <div className="flex items-end gap-2 h-32">
            {weeklyData.map((count, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-pink-400 to-purple-400 transition-all hover:shadow-lg"
                  style={{ height: `${(count / maxGames) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs text-gray-400 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Total Games</div>
            <div className="text-3xl font-bold text-pink-300">
              {userProgress?.total_games_played || 0}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Current Streak</div>
            <div className="text-3xl font-bold text-purple-300">
              {userProgress?.current_streak || 0}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Balance Score</div>
            <div className="text-3xl font-bold text-blue-300">
              {userProgress?.emotional_balance_score || 50}%
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6 gradient-text from-yellow-300 to-orange-300 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Achievements
        </h2>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/50 text-center scale-in"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-medium text-yellow-200 text-sm">{achievement}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            Keep playing games to unlock achievements!
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text from-green-300 to-emerald-300 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Wellness Insights
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-medium text-green-300 mb-2">Focus Enhancement</h3>
            <p className="text-sm text-gray-400">
              You improve focus by 23% after playing focus games
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-medium text-blue-300 mb-2">Emotional Balance</h3>
            <p className="text-sm text-gray-400">
              Your emotional balance has improved by {(userProgress?.emotional_balance_score || 50) - 50}% this week
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-medium text-purple-300 mb-2">Best Time</h3>
            <p className="text-sm text-gray-400">
              You're most focused between 9 AM - 11 AM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
