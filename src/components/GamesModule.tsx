import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Play, Clock, Zap } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  description: string;
  type: string;
  emoji: string;
  color: string;
  duration_seconds: number;
}

export const GamesModule: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingGame, setPlayingGame] = useState<string | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const loadGames = async () => {
      try {
        const { data } = await supabase
          .from('games')
          .select('*');
        setGames(data || []);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    if (!playingGame) return;

    const game = games.find(g => g.id === playingGame);
    if (!game) return;

    const interval = setInterval(() => {
      setGameTime(prev => {
        if (prev >= game.duration_seconds) {
          completeGame();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playingGame, games]);

  const completeGame = async () => {
    if (!user || !playingGame) return;

    try {
      const game = games.find(g => g.id === playingGame);
      if (!game) return;

      await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_id: playingGame,
          completed: true,
          duration_seconds: game.duration_seconds,
          score: Math.floor(Math.random() * 100) + 1
        });

      const { data: progress } = await supabase
        .from('user_progress')
        .select('total_games_played')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progress) {
        await supabase
          .from('user_progress')
          .update({ total_games_played: (progress.total_games_played || 0) + 1 })
          .eq('user_id', user.id);
      }

      setPlayingGame(null);
      setGameTime(0);
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-300">Loading games...</div>;
  }

  if (playingGame) {
    const game = games.find(g => g.id === playingGame);
    const duration = game?.duration_seconds || 180;
    const progress = (gameTime / duration) * 100;

    return (
      <div className="card text-center space-y-6">
        <div className="text-6xl mb-4 float-animation">{game?.emoji}</div>
        <h2 className="text-3xl font-bold gradient-text from-pink-300 to-blue-300">
          {game?.name}
        </h2>
        <p className="text-gray-300">{game?.description}</p>

        <div className="py-8">
          <div className="text-5xl font-bold mb-4 text-purple-300">
            {gameTime.toString().padStart(2, '0')}:{(0).toString().padStart(2, '0')}
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <div className="text-sm text-gray-400">Game Difficulty</div>
            <div className="text-lg font-medium text-purple-300">Medium</div>
          </div>
          <button
            onClick={() => {
              setPlayingGame(null);
              setGameTime(0);
            }}
            className="w-full btn-secondary border-white/20 text-white hover:bg-white/5"
          >
            Stop Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text from-pink-300 to-blue-300">
          Mind Games
        </h2>
        <p className="text-gray-300 mb-6">
          Strengthen your mind through fun, science-backed games. No pressure, just growth!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(game => (
            <div
              key={game.id}
              className="card group hover:border-white/50"
              style={{ borderColor: game.color + '40' }}
            >
              <div className="text-4xl mb-3">{game.emoji}</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-pink-300 transition-colors">
                {game.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {game.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Clock className="w-4 h-4" />
                <span>{Math.round(game.duration_seconds / 60)} min</span>
              </div>

              <button
                onClick={() => setPlayingGame(game.id)}
                className="w-full btn-primary gradient-btn from-pink-400 to-purple-400 text-white flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Play Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
