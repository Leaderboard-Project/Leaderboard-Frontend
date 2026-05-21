import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { api } from '../api/client.js';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.get('/api/achievements').then(({ data }) => setAchievements(data.achievements));
  }, []);

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Unlock matrix</p>
        <h1>Achievements</h1>
      </div>
      <div className="card-grid">
        {achievements.map((achievement, index) => {
          return (
            <motion.article
              className="glass-card achievement-card unlocked"
              key={achievement._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Award />
              <h2>{achievement.title}</h2>
              <p>{achievement.description}</p>
              <div className="progress">
                <span style={{ width: '100%' }} />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
