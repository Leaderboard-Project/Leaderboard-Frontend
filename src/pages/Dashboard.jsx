import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard.jsx';
import { api } from '../api/client.js';
import { resolveAvatar } from '../utils/avatar.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: [], labs: [], submissions: [] });

  useEffect(() => {
    Promise.all([api.get('/api/leaderboard'), api.get('/api/labs'), api.get('/api/submissions')]).then(
      ([leaderboard, labs, submissions]) => {
        setStats({
          users: leaderboard.data.users,
          labs: labs.data.labs,
          submissions: submissions.data.submissions
        });
      }
    );
  }, []);

  const leader = stats.users[0];

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Public dashboard</p>
        <h1>IDDA Lab Rankings</h1>
      </div>
      <div className="stats-grid">
        <StatCard label="Builders" value={stats.users.length} />
        <StatCard label="Active labs" value={stats.labs.length} tone="pink" />
        <StatCard label="Submitted PRs" value={stats.submissions.length} tone="green" />
      </div>
      <div className="dashboard-grid">
        <motion.article className="glass-card large-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Latest submissions</h2>
          {stats.submissions.length ? (
            <div className="mini-list">
              {stats.submissions.slice(0, 8).map((submission) => (
                <a href={submission.prUrl} target="_blank" rel="noreferrer" key={submission._id}>
                  <span>@{submission.userId?.username} - {submission.repoOwner}/{submission.repoName} #{submission.prNumber}</span>
                  <strong>{submission.pointsAwarded} XP</strong>
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No PRs synced yet. Admin can sync GitHub pulls from the control panel.</p>
          )}
          <Link className="primary-button compact" to="/leaderboard">
            Open leaderboard
          </Link>
        </motion.article>
        <motion.article className="glass-card large-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Current leader</h2>
          {leader ? (
            <div className="profile-mini">
              <img src={resolveAvatar(leader.avatarUrl)} alt={leader.username} />
              <strong>@{leader.username}</strong>
              <span>{leader.totalPoints} XP</span>
            </div>
          ) : (
            <p className="muted">Leaderboard will appear after first sync.</p>
          )}
        </motion.article>
      </div>
    </section>
  );
}
