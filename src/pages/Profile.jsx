import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Github, GitPullRequest, Lock, Medal, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { resolveAvatar } from '../utils/avatar.js';

const playerTitle = (points = 0) => {
  if (points >= 2000) return 'Legend';
  if (points >= 1500) return 'Code Samurai';
  if (points >= 700) return 'Protocol Builder';
  if (points > 0) return 'Rising Coder';
  return 'New Player';
};

const isUrl = (value = '') => /^https?:\/\//i.test(value);

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    Promise.all([api.get(`/api/users/${username}`), api.get('/api/labs')]).then(([profileData, labsData]) => {
      setProfile(profileData.data.user);
      setLabs(labsData.data.labs);
    });
  }, [username]);

  if (!profile) return <div className="page-status">Loading profile...</div>;

  const submissions = [...(profile.submissions || [])].sort(
    (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
  );
  const labAchievements = submissions.filter((submission) => submission.labId);
  const approvedSubmissionsByLab = new Map(
    labAchievements
      .filter((submission) => submission.reviewStatus === 'approved')
      .map((submission) => [String(submission.labId?._id), submission])
  );
  const sideQuests = profile.badges?.filter((badge) => badge.item) || [];
  const approvedLabs = labAchievements.filter((submission) => submission.reviewStatus === 'approved').length;
  const totalAchievements = approvedLabs + sideQuests.length;

  return (
    <section className="page player-profile-page">
      <div className="player-card">
        <div className="player-card-top">
          <img src={resolveAvatar(profile.avatarUrl)} alt={profile.username} />
          <div className="player-title-block">
            <h1>{profile.displayName || profile.username}</h1>
            <p>{playerTitle(profile.totalPoints)}</p>
            <span>@{profile.connectedGithub || profile.username}</span>
          </div>
          <div className="player-total">
            <strong>{profile.totalPoints}</strong>
            <span>POINTS</span>
          </div>
        </div>

        <div className="profile-quick-stats">
          <div>
            <Award size={18} />
            <strong>#{profile.rank || '-'}</strong>
            <span>Rank</span>
          </div>
          <div>
            <GitPullRequest size={18} />
            <strong>{labAchievements.length}</strong>
            <span>Labs</span>
          </div>
          <div>
            <CheckCircle2 size={18} />
            <strong>{approvedLabs}</strong>
            <span>Approved</span>
          </div>
          <a href={profile.profileUrl} target="_blank" rel="noreferrer">
            <Github size={18} />
            <strong>GitHub</strong>
            <span>Profile</span>
          </a>
        </div>

        <div className="player-achievements">
          <div className="profile-section-heading">
            <div>
              <span>Lab progress</span>
              <h2>Achievements</h2>
            </div>
            <strong>{totalAchievements}</strong>
          </div>

          <div className="player-achievement-grid">
            {sideQuests.length || labs.length ? (
              <>
              {sideQuests.map((badge) => (
                <article className="profile-achievement-card unlocked" key={badge.item?._id}>
                  <span>
                    {isUrl(badge.item?.icon) ? <img src={badge.item.icon} alt="" /> : badge.item?.icon || <Medal size={18} />}
                  </span>
                  <div>
                    <h3>{badge.item?.title}</h3>
                    <small>{badge.item?.description}</small>
                  </div>
                  <em>side quest</em>
                  <strong>+{badge.item?.pointsRequired || 0} XP</strong>
                </article>
              ))}
              {labs.map((lab) => {
                const submission = approvedSubmissionsByLab.get(String(lab._id));
                const unlocked = Boolean(submission);
                return (
                <article className={`profile-achievement-card ${unlocked ? 'unlocked' : 'locked'}`} key={lab._id}>
                  <span>
                    {unlocked ? (
                      isUrl(lab.icon) ? <img src={lab.icon} alt="" /> : lab.icon || <Star size={18} />
                    ) : (
                      <Lock size={18} />
                    )}
                  </span>
                  <div>
                    <h3>{lab.title}</h3>
                    <small>
                      {lab.description}
                    </small>
                  </div>
                  <em>{unlocked ? `PR #${submission.prNumber}` : 'locked'}</em>
                  <strong>{unlocked ? `+${submission.pointsAwarded || lab.points || 0} XP` : `${lab.points || 0} XP`}</strong>
                </article>
                );
              })}
              </>
            ) : (
              <article className="profile-empty-achievements" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', padding: '2rem', margin: '0 auto', borderRadius: '8px' }}>
                  <h3 >No lab achievements yet</h3>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
