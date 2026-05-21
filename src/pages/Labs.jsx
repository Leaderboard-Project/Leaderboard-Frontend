import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, GitPullRequest, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const isUrl = (value = '') => /^https?:\/\//i.test(value);

export default function Labs() {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    api.get('/api/labs').then(({ data }) => setLabs(data.labs));
  }, []);

  return (
    <section className="page labs-page">
      <div className="labs-hero">
        <div>
          <p className="arena-chip">OPEN MISSIONS</p>
          <h1>Labs</h1>
          <p>Pick a lab, open the repo, submit your PR, and collect XP when it lands.</p>
        </div>
        <div className="labs-hero-stat">
          <Trophy size={18} />
          <strong>{labs.length}</strong>
          <span>Active labs</span>
        </div>
      </div>

      <div className="labs-grid">
        {labs.map((lab) => (
          <article className="lab-mission-card" key={lab._id}>
            <div className="lab-card-topline">
              <div className="lab-card-icon">
                {isUrl(lab.icon) ? <img src={lab.icon} alt="" /> : <span>{lab.icon || '🧪'}</span>}
              </div>
              <span className="difficulty">{lab.difficulty}</span>
            </div>

            <div className="lab-card-main">
              <h2>{lab.title}</h2>
              <p>{lab.description}</p>
            </div>

            <div className="lab-meta-grid">
              <div>
                <GitPullRequest size={16} />
                <span>{lab.points} XP</span>
              </div>
              <div>
                <CalendarDays size={16} />
                <span>{lab.deadline ? new Date(lab.deadline).toLocaleDateString() : 'No deadline'}</span>
              </div>
            </div>

            <div className="lab-card-actions">
              <a href={`https://github.com/${lab.repoOwner}/${lab.repoName}`} target="_blank" rel="noreferrer">
                Repo <ArrowUpRight size={16} />
              </a>
              <Link to="/submit" state={{ labId: lab._id }}>
                Submit PR
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
