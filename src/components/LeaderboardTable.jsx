import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resolveAvatar } from '../utils/avatar.js';

const titles = [
  { min: 2000, label: 'Legend', badge: 'star' },
  { min: 1500, label: 'Code Samurai', badge: 'sprout' },
  { min: 700, label: 'Protocol Builder', badge: 'gem' },
  { min: 1, label: 'Rising Coder', badge: 'bolt' },
  { min: 0, label: 'New Player', badge: 'dot' }
];

const titleFor = (points = 0) => titles.find((item) => points >= item.min) || titles.at(-1);
const progressFor = (user) => {
  const unlocked = user.achievements?.length || 0;
  const total = 8;
  return {
    unlocked,
    total,
    percent: Math.min((unlocked / total) * 100, 100)
  };
};

export default function LeaderboardTable({ users = [] }) {
  return (
    <div className="arena-list">
      {users.map((user, index) => (
        <motion.div
          className="arena-player-row"
          key={user._id || user.username}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ scale: 1.01 }}
        >
          <Link className="arena-player-link" to={`/profile/${user.username}`}>
            <div className={`rank-ribbon rank-${index < 2 ? 'purple' : 'green'}`}>
              <span>{titleFor(user.totalPoints).badge === 'star' ? '★' : '✦'}</span>
            </div>
            <img className="arena-avatar" src={resolveAvatar(user.avatarUrl)} alt={user.username} />
            <div className="arena-player-info">
              <strong>{user.displayName || user.username}</strong>
              <span>{titleFor(user.totalPoints).label}</span>
              <div className="arena-progress-line">
                <i style={{ width: `${progressFor(user).percent}%` }} />
                <em>
                  {progressFor(user).unlocked}/{progressFor(user).total}
                </em>
              </div>
            </div>
            <strong className="arena-points">{user.totalPoints}<small>PTS</small></strong>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
