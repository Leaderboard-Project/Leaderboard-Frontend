import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';

export default function SubmitPR() {
  const [labs, setLabs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [labId, setLabId] = useState('');

  useEffect(() => {
    api.get('/api/labs').then(({ data }) => {
      setLabs(data.labs);
      if (!labId && data.labs[0]) setLabId(data.labs[0]._id);
    });
  }, [labId]);

  useEffect(() => {
    api
      .get('/api/submissions', { params: labId ? { labId } : {} })
      .then(({ data }) => setSubmissions(data.submissions));
  }, [labId]);

  return (
    <section className="page narrow">
      <div className="page-heading">
        <p className="eyebrow">GitHub PR tracker</p>
        <h1>Synced submissions</h1>
      </div>
      <div className="glass-card form-card">
        <label>
          Lab
          <select value={labId} onChange={(event) => setLabId(event.target.value)} required>
            {labs.map((lab) => (
              <option value={lab._id} key={lab._id}>
                {lab.title} - {lab.points} XP
              </option>
            ))}
          </select>
        </label>
        <div className="mini-list">
          {submissions.map((submission) => (
            <motion.a
              href={submission.prUrl}
              target="_blank"
              rel="noreferrer"
              key={submission._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>@{submission.userId?.username} PR #{submission.prNumber}</span>
              <strong>{submission.status}</strong>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
