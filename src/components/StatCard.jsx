import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, tone = 'cyan' }) {
  return (
    <motion.article
      className={`glass-card stat-card ${tone}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.article>
  );
}
