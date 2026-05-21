import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gem } from 'lucide-react';
import { api } from '../api/client.js';

export default function Badges() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    api.get('/api/badges').then(({ data }) => setBadges(data.badges));
  }, []);

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Collection vault</p>
        <h1>Badges</h1>
      </div>
      <div className="badge-grid">
        {badges.map((badge, index) => (
          <motion.article
            className={`glass-card badge-card ${badge.rarity.toLowerCase()} unlocked`}
            key={badge._id}
            initial={{ opacity: 0, rotateX: -16 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
          >
            <Gem />
            <span>{badge.rarity}</span>
            <h2>{badge.title}</h2>
            <p>{badge.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
