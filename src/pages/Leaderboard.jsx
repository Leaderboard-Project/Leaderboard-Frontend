import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Users } from 'lucide-react';
import { api } from '../api/client.js';
import LeaderboardTable from '../components/LeaderboardTable.jsx';
import { resolveAvatar } from '../utils/avatar.js';

const playerTitle = (points = 0) => {
  if (points >= 2000) return 'Legend';
  if (points >= 1500) return 'Code Samurai';
  if (points >= 700) return 'Protocol Builder';
  if (points > 0) return 'Rising Coder';
  return 'New Player';
};

export default function Leaderboard({ preview = false }) {
  const [users, setUsers] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api
      .get('/api/leaderboard', { params: { limit: preview ? 5 : 50 } })
      .then(({ data }) => setUsers(data.users))
      .catch(() => setUsers([]));
    api.get('/api/achievements').then(({ data }) => setAchievements(data.achievements)).catch(() => {});
  }, [preview]);

  const totalUnlocked = users.reduce((sum, user) => sum + (user.achievements?.length || 0), 0);
  const podium = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <section className={preview ? 'preview-board web3-preview' : 'page arena-page web3-leaderboard'}>
      {!preview && (
        <div className="web3-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      <div className="arena-heading row-heading web3-hero">
        <div>
          <p className="arena-chip">COHORT 2026</p>
          <h1>{preview ? 'Leaderboard Preview' : 'IDDA Achievements'}</h1>
        </div>
        {!preview && (
          <Link className="web3-hero-action" to="/labs">
            Labs <ArrowUpRight size={18} />
          </Link>
        )}
      </div>
      {!preview && (
        <div className="arena-stats-panel web3-stats">
          <div><Users size={18} /><strong>{users.length}</strong><span>Students</span></div>
          <div><Sparkles size={18} /><strong>{achievements.length}</strong><span>Achievements</span></div>
          <div><Sparkles size={18} /><strong>{totalUnlocked}</strong><span>Unlocked</span></div>
        </div>
      )}
      {!preview && podium.length > 0 && (
        <section className="podium-section web3-podium">
          {podium.map((user, index) => (
            <Link
              className={`podium-card podium-${index + 1}`}
              to={`/profile/${user.username}`}
              key={user._id || user.username}
            >
              <span className="podium-rank">#{index + 1}</span>
              <img src={resolveAvatar(user.avatarUrl)} alt={user.username} />
              <div>
                <h2>{user.displayName || user.username}</h2>
                <p>{playerTitle(user.totalPoints)}</p>
              </div>
              <strong>{user.totalPoints}<small>PTS</small></strong>
            </Link>
          ))}
        </section>
      )}
      {!preview && <h2 className="arena-section-title">All Players</h2>}
      <LeaderboardTable users={preview ? users : rest} />
    </section>
  );
}
