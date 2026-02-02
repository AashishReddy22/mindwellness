import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Play, Music } from 'lucide-react';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface Playlist {
  id: string;
  name: string;
  mood_id: string;
  description: string;
  songs: string;
}

export const MusicModule: React.FC = () => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: moodsData } = await supabase
          .from('moods')
          .select('*');
        const { data: playlistsData } = await supabase
          .from('music_playlists')
          .select('*');

        setMoods(moodsData || []);
        setPlaylists(playlistsData || []);
        if (moodsData && moodsData.length > 0) {
          setSelectedMood(moodsData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePlayPlaylist = async (playlistId: string) => {
    if (!user) return;

    try {
      setPlaying(playlistId);

      await supabase
        .from('user_progress')
        .update({ total_music_sessions: supabase.rpc('increment', { x: 1 }) })
        .eq('user_id', user.id);

      setTimeout(() => {
        setPlaying(null);
      }, 3000);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-300">Loading music...</div>;
  }

  const selectedMoodData = moods.find(m => m.id === selectedMood);
  const moodPlaylists = playlists.filter(p => p.mood_id === selectedMood);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text from-pink-300 to-blue-300">
          Mood-Based Music Discovery
        </h2>
        <p className="text-gray-300 mb-6">
          Let music regulate your emotions. Select a mood and discover curated playlists.
        </p>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Select Your Mood</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moods.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`mood-btn transition-all ${
                  selectedMood === mood.id
                    ? `bg-gradient-to-br to-gray-900`
                    : 'bg-white/10 border border-white/20'
                }`}
                style={selectedMood === mood.id ? { backgroundImage: `linear-gradient(135deg, ${mood.color}, rgba(0,0,0,0.3))` } : {}}
              >
                <div className="text-3xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-medium">{mood.name}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedMoodData && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-gray-300">
              <span className="font-medium text-pink-300">{selectedMoodData.name} vibes</span> - Perfect for emotional regulation and mood enhancement
            </p>
          </div>
        )}

        {moodPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moodPlaylists.map(playlist => {
              const songs = JSON.parse(playlist.songs || '[]');
              return (
                <div key={playlist.id} className="card group">
                  <div className="flex items-start justify-between mb-3">
                    <Music className="w-8 h-8 text-purple-300" />
                    <span className="text-xs font-medium text-gray-400">
                      {songs.length} songs
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-pink-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {playlist.description}
                  </p>

                  <div className="mb-4 space-y-1">
                    {songs.slice(0, 3).map((song: string, idx: number) => (
                      <div key={idx} className="text-xs text-gray-500">
                        • {song}
                      </div>
                    ))}
                    {songs.length > 3 && (
                      <div className="text-xs text-gray-600 italic">
                        +{songs.length - 3} more songs
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePlayPlaylist(playlist.id)}
                    className="w-full btn-primary gradient-btn from-blue-400 to-cyan-400 text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {playing === playlist.id ? 'Playing...' : 'Play'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No playlists available for this mood yet
          </div>
        )}
      </div>
    </div>
  );
};
