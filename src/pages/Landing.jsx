import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Leaderboard from './Leaderboard.jsx';

export default function Landing() {
  return (
    <div className="landing public-arena">
      <section className="hero">
        <div className="hero-copy">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="arena-chip">
            COHORT 2026
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            IDDA ACHIEVEMENTS
          </motion.h1>
          <motion.p
            className="hero-text"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            GitHub pull request-lərindən avtomatik hesablanan lab balları, achievement-lər,
            badge-lər və real-time leaderboard.
          </motion.p>
          <div className="hero-actions">
            <Link className="primary-button" to="/leaderboard">
              View ranks <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/labs">
              Open Labs
            </Link>
          </div>
        </div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="chain-grid">
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="floating-panel panel-one">
            <Trophy /> +260 XP validated
          </div>
          <div className="floating-panel panel-two">
            <Zap /> Achievement unlocked
          </div>
        </motion.div>
      </section>

    

      <section className="preview-section">
        <Leaderboard preview />
      </section>
    </div>
  );
}
