import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, Database, GitPullRequest, LayoutDashboard, LogOut, Medal, RefreshCw, ScrollText, Search, Settings, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { resolveAvatar } from '../utils/avatar.js';

const blankLab = {
  title: '',
  description: '',
  repoOwner: '',
  repoName: '',
  githubUrl: '',
  icon: '🧪',
  points: 100,
  difficulty: 'Beginner',
  deadline: ''
};

const blankBadge = {
  title: '',
  description: '',
  icon: '🫡',
  rarity: 'Common',
  pointsRequired: 0
};

const repoFromUrl = (value) => {
  const match = value.match(/github\.com\/([^/]+)\/([^/\s?#]+)/i) || value.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!match) return null;
  return {
    repoOwner: match[1],
    repoName: match[2].replace(/\.git$/, '')
  };
};

const isUrl = (value = '') => /^https?:\/\//i.test(value);
const renderIcon = (value, fallback = '•') =>
  isUrl(value) ? <img className="crm-item-logo" src={value} alt="" /> : <span className="crm-item-icon">{value || fallback}</span>;

const PAGE_SIZE = 8;
const LOG_PAGE_SIZE = 12;

const normalize = (value = '') => String(value).toLowerCase().trim();

const matchesSearch = (item, fields, term) => {
  const query = normalize(term);
  if (!query) return true;
  return fields.some((field) => normalize(field(item)).includes(query));
};

const paginate = (items, page, pageSize = PAGE_SIZE) => {
  const pages = Math.max(Math.ceil(items.length / pageSize), 1);
  const safePage = Math.min(Math.max(page, 1), pages);
  return {
    page: safePage,
    pages,
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize)
  };
};

function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="crm-search-field">
      <Search size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Pagination({ page, pages, total, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="crm-pagination">
      <span>{total} items</span>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      <strong>{page} / {pages}</strong>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pages} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const { admin, adminLogin, logout } = useAuth();
  const [labs, setLabs] = useState([]);
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(blankLab);
  const [badgeForm, setBadgeForm] = useState(blankBadge);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin' });
  const [editingId, setEditingId] = useState(null);
  const [editingBadgeId, setEditingBadgeId] = useState(null);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [assigningBadge, setAssigningBadge] = useState(null);
  const [assigningLab, setAssigningLab] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState([]);
  const [selectedLabUsers, setSelectedLabUsers] = useState([]);
  const [selectedAssignedLabUsers, setSelectedAssignedLabUsers] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewLabFilter, setReviewLabFilter] = useState('all');
  const [labSearch, setLabSearch] = useState('');
  const [badgeSearch, setBadgeSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [assignBadgeSearch, setAssignBadgeSearch] = useState('');
  const [assignLabSearch, setAssignLabSearch] = useState('');
  const [pages, setPages] = useState({ labs: 1, badges: 1, users: 1, submissions: 1 });
  const [logFilters, setLogFilters] = useState({ search: '', category: 'all', from: '', to: '', page: 1 });
  const [logMeta, setLogMeta] = useState({ page: 1, pages: 1, total: 0, categories: [] });
  const [busyAction, setBusyAction] = useState('');

  const load = async (logOverride = {}) => {
    if (!admin) return;

    const nextLogFilters = { ...logFilters, ...logOverride };
    const logParams = {
      page: nextLogFilters.page,
      limit: LOG_PAGE_SIZE
    };
    if (nextLogFilters.category !== 'all') logParams.type = nextLogFilters.category;
    if (nextLogFilters.from) logParams.from = nextLogFilters.from;
    if (nextLogFilters.to) logParams.to = nextLogFilters.to;

    const [{ data: labData }, { data: submissionData }, { data: userData }, { data: badgeData }, { data: logData }] = await Promise.all([
      api.get('/api/labs'),
      api.get('/api/submissions'),
      api.get('/api/admin/users'),
      api.get('/api/badges'),
      api.get('/api/admin/logs', { params: logParams })
    ]);
    setLabs(Array.isArray(labData.labs) ? labData.labs : []);
    setSubmissions(Array.isArray(submissionData.submissions) ? submissionData.submissions : []);
    setUsers(Array.isArray(userData.users) ? userData.users : []);
    setBadges(Array.isArray(badgeData.badges) ? badgeData.badges : []);
    setLogs(Array.isArray(logData.logs) ? logData.logs : []);
    setLogMeta(logData.meta || { page: 1, pages: 1, total: logData.logs?.length || 0, categories: [] });
  };

  useEffect(() => {
    load();
  }, [admin, logFilters.category, logFilters.from, logFilters.to, logFilters.page]);

  const updateListPage = (key, page) => {
    setPages((current) => ({ ...current, [key]: Math.max(page, 1) }));
  };

  const updateLogFilters = (patch) => {
    setLogFilters((current) => ({ ...current, ...patch, page: patch.page || 1 }));
  };

  useEffect(() => {
    if (!admin) return undefined;

    const sections = ['overview', 'labs', 'badges', 'users', 'submissions', 'logs']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-28% 0px -58% 0px',
        threshold: [0.08, 0.2, 0.4]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [admin]);

  const login = async (event) => {
    event.preventDefault();
    try {
      await adminLogin(loginForm.username, loginForm.password);
      setMessage('Admin daxil oldu.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Admin login alınmadı.');
    }
  };

  const saveLab = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      points: Number(form.points),
      deadline: form.deadline || undefined,
      githubUrl: form.githubUrl || undefined
    };

    try {
      setBusyAction('save-lab');
      if (editingId) {
        await api.put(`/api/labs/${editingId}`, payload);
        setMessage('Lab updated.');
      } else {
        await api.post('/api/labs', payload);
        setMessage('Lab created.');
      }

      setForm(blankLab);
      setEditingId(null);
      load();
    } catch (error) {
      const errors = error.response?.data?.errors;
      setMessage(errors?.map((item) => item.message).join(' ') || error.response?.data?.message || 'Lab save failed.');
    } finally {
      setBusyAction('');
    }
  };

  const edit = (lab) => {
    setEditingId(lab._id);
    setForm({
      title: lab.title,
      description: lab.description,
      repoOwner: lab.repoOwner,
      repoName: lab.repoName,
      githubUrl: lab.githubUrl || `https://github.com/${lab.repoOwner}/${lab.repoName}`,
      points: lab.points,
      icon: lab.icon || '🧪',
      difficulty: lab.difficulty,
      deadline: lab.deadline ? lab.deadline.slice(0, 10) : ''
    });
  };

  const remove = async (id) => {
    await api.delete(`/api/labs/${id}`);
    setMessage('Lab archived.');
    load();
  };

  const syncLab = async (id) => {
    try {
      setBusyAction(`sync-lab-${id}`);
      const { data } = await api.post(`/api/labs/${id}/sync`);
      setMessage(`${data.result.lab.title}: ${data.result.created} new PR, ${data.result.updated} updated.`);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lab sync failed.');
    } finally {
      setBusyAction('');
    }
  };

  const syncAll = async () => {
    try {
      setBusyAction('sync-all');
      const { data } = await api.post('/api/labs/sync');
      const results = Array.isArray(data.results) ? data.results : [];
      const created = results.reduce((sum, item) => sum + item.created, 0);
      const failed = results.filter((item) => item.failed);
      setMessage(
        failed.length
          ? `${created} new PRs synced. Failed: ${failed.map((item) => item.lab?.title).join(', ')}`
          : `All labs synced. ${created} new PR submissions.`
      );
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Sync all failed.');
    } finally {
      setBusyAction('');
    }
  };

  const approveSubmission = async (submission) => {
    try {
      setBusyAction(`approve-${submission._id}`);
      await api.post(`/api/admin/submissions/${submission._id}/approve`);
      setMessage(`PR #${submission.prNumber} approved.`);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Approve failed.');
    } finally {
      setBusyAction('');
    }
  };

  const rejectSubmission = async (submission) => {
    try {
      setBusyAction(`reject-${submission._id}`);
      await api.post(`/api/admin/submissions/${submission._id}/reject`);
      setMessage(`PR #${submission.prNumber} rejected.`);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Reject failed.');
    } finally {
      setBusyAction('');
    }
  };

  const approveAllPending = async () => {
    try {
      setBusyAction('approve-all');
      const { data } = await api.post('/api/admin/submissions/approve-all');
      setMessage(data.message);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Approve all failed.');
    } finally {
      setBusyAction('');
    }
  };

  const saveUserPoints = async (user, points) => {
    await api.put(`/api/admin/users/${user._id}`, { totalPoints: Number(points) });
    setMessage(`@${user.username} score updated.`);
    load();
  };

  const deleteUser = async (id) => {
    await api.delete(`/api/admin/users/${id}`);
    setMessage('User deleted.');
    load();
  };

  const saveBadge = async (event) => {
    event.preventDefault();
    const payload = {
      title: badgeForm.title,
      description: badgeForm.description,
      icon: badgeForm.icon,
      rarity: badgeForm.rarity,
      pointsRequired: Number(badgeForm.pointsRequired)
    };

    try {
      setBusyAction('save-sidequest');
      if (editingBadgeId) {
        await api.put(`/api/admin/badges/${editingBadgeId}`, payload);
        setMessage('Side quest updated.');
      } else {
        await api.post('/api/admin/badges', payload);
        setMessage('Side quest created.');
      }

      setBadgeForm(blankBadge);
      setEditingBadgeId(null);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Side quest save failed.');
    } finally {
      setBusyAction('');
    }
  };

  const editBadge = (badge) => {
    setEditingBadgeId(badge._id);
    setBadgeForm({
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      pointsRequired: badge.pointsRequired || 0
    });
  };

  const openAssignBadge = (badge) => {
    setAssigningBadge(badge);
    setSelectedUsers([]);
    setSelectedAssignedUsers([]);
    setAssignBadgeSearch('');
  };

  const openAssignLab = (lab) => {
    setAssigningLab(lab);
    setSelectedLabUsers([]);
    setSelectedAssignedLabUsers([]);
    setAssignLabSearch('');
  };

  const toggleSelectedUser = (id) => {
    setSelectedUsers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectedAssignedUser = (id) => {
    setSelectedAssignedUsers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectedLabUser = (id) => {
    setSelectedLabUsers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectedAssignedLabUser = (id) => {
    setSelectedAssignedLabUsers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const assignBadge = async () => {
    if (!assigningBadge || !selectedUsers.length) return;
    try {
      setBusyAction('assign-sidequest');
      const { data } = await api.post(`/api/admin/badges/${assigningBadge._id}/assign`, {
        userIds: selectedUsers
      });
      setMessage(data.message);
      setAssigningBadge(null);
      setSelectedUsers([]);
      setSelectedAssignedUsers([]);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Assign failed.');
    } finally {
      setBusyAction('');
    }
  };

  const unassignBadge = async () => {
    if (!assigningBadge || !selectedAssignedUsers.length) return;
    try {
      setBusyAction('unassign-sidequest');
      const { data } = await api.post(`/api/admin/badges/${assigningBadge._id}/unassign`, {
        userIds: selectedAssignedUsers
      });
      setMessage(data.message);
      setAssigningBadge(null);
      setSelectedUsers([]);
      setSelectedAssignedUsers([]);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Remove failed.');
    } finally {
      setBusyAction('');
    }
  };

  const assignLab = async () => {
    if (!assigningLab || !selectedLabUsers.length) return;
    try {
      setBusyAction('assign-lab');
      const { data } = await api.post(`/api/admin/labs/${assigningLab._id}/assign`, {
        userIds: selectedLabUsers
      });
      setMessage(data.message);
      setAssigningLab(null);
      setSelectedLabUsers([]);
      setSelectedAssignedLabUsers([]);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lab assign failed.');
    } finally {
      setBusyAction('');
    }
  };

  const unassignLab = async () => {
    if (!assigningLab || !selectedAssignedLabUsers.length) return;
    try {
      setBusyAction('unassign-lab');
      const { data } = await api.post(`/api/admin/labs/${assigningLab._id}/unassign`, {
        userIds: selectedAssignedLabUsers
      });
      setMessage(data.message);
      setAssigningLab(null);
      setSelectedLabUsers([]);
      setSelectedAssignedLabUsers([]);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lab remove failed.');
    } finally {
      setBusyAction('');
    }
  };

  const deleteBadge = async (id) => {
    await api.delete(`/api/admin/badges/${id}`);
    setMessage('Side quest deleted.');
    load();
  };

  const filteredLabs = labs.filter((lab) =>
    matchesSearch(lab, [
      (item) => item.title,
      (item) => item.repoOwner,
      (item) => item.repoName,
      (item) => item.difficulty
    ], labSearch)
  );
  const filteredBadges = badges.filter((badge) =>
    matchesSearch(badge, [
      (item) => item.title,
      (item) => item.description,
      (item) => item.rarity
    ], badgeSearch)
  );
  const filteredUsers = users.filter((user) =>
    matchesSearch(user, [
      (item) => item.displayName,
      (item) => item.username,
      (item) => item.connectedGithub,
      (item) => item.email,
      (item) => item.rank,
      (item) => item.totalPoints
    ], userSearch)
  );
  const pendingSubmissions = submissions.filter((submission) => (submission.reviewStatus || 'pending') === 'pending').length;
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus = reviewFilter === 'all' || (submission.reviewStatus || 'pending') === reviewFilter;
    const matchesLab = reviewLabFilter === 'all' || submission.labId?._id === reviewLabFilter;
    const matchesQuery = matchesSearch(submission, [
      (item) => item.userId?.username,
      (item) => item.labId?.title,
      (item) => item.repoOwner,
      (item) => item.repoName,
      (item) => item.prNumber,
      (item) => item.status,
      (item) => item.reviewStatus
    ], submissionSearch);
    return matchesStatus && matchesLab && matchesQuery;
  });
  const filteredLogs = logs.filter((log) =>
    matchesSearch(log, [
      (item) => item.message,
      (item) => item.actor,
      (item) => item.type
    ], logFilters.search)
  );
  const visibleLabs = paginate(filteredLabs, pages.labs);
  const visibleBadges = paginate(filteredBadges, pages.badges);
  const visibleUsers = paginate(filteredUsers, pages.users);
  const visibleSubmissions = paginate(filteredSubmissions, pages.submissions);
  const assignBadgeUsers = users.filter((user) =>
    matchesSearch(user, [
      (item) => item.displayName,
      (item) => item.username,
      (item) => item.totalPoints
    ], assignBadgeSearch)
  );
  const assignLabUsers = users.filter((user) =>
    matchesSearch(user, [
      (item) => item.displayName,
      (item) => item.username,
      (item) => item.totalPoints
    ], assignLabSearch)
  );
  const hasAssignedBadge = (user, badge) =>
    user.badges?.some((entry) => String(entry.item?._id || entry.item) === String(badge?._id));
  const hasAssignedLab = (user, lab) =>
    submissions.some((submission) =>
      String(submission.userId?._id || submission.userId) === String(user?._id) &&
      String(submission.labId?._id || submission.labId) === String(lab?._id) &&
      (submission.reviewStatus || 'pending') === 'approved'
    );

  if (!admin) {
    return (
      <section className="crm-login-page">
        <form className="crm-login-card" onSubmit={login}>
          <div>
            <span className="crm-kicker">Private control</span>
            <h1>Admin Console</h1>
            <p>Manage labs, scoring, badges, and GitHub PR sync from one clean workspace.</p>
          </div>
          <label>
            Username
            <input
              onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
          </label>
          <button className="crm-primary-button">Login</button>
          {message && <p className="crm-message">{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="crm-admin-page">
      <aside className="crm-sidebar">
        <div className="crm-sidebar-brand">
          <LayoutDashboard size={22} />
          <div>
            <strong>GitRank</strong>
            <span>Admin CRM</span>
          </div>
        </div>
        <nav>
          <a className={activeSection === 'overview' ? 'active' : ''} href="#overview"><Database size={18} /> Overview</a>
          <a className={activeSection === 'labs' ? 'active' : ''} href="#labs"><GitPullRequest size={18} /> Labs</a>
          <a className={activeSection === 'users' ? 'active' : ''} href="#users"><Users size={18} /> Users</a>
          <a className={activeSection === 'badges' ? 'active' : ''} href="#badges"><Medal size={18} /> Badges</a>
          <a className={activeSection === 'submissions' ? 'active' : ''} href="#submissions"><Trophy size={18} /> Submissions</a>
          <a className={activeSection === 'logs' ? 'active' : ''} href="#logs"><ScrollText size={18} /> Logs</a>
        </nav>
        <button className="crm-ghost-button" onClick={logout}>
          <LogOut size={17} /> Logout
        </button>
      </aside>

      <div className="crm-workspace">
        <header className="crm-topbar" id="overview">
          <div>
            <span className="crm-kicker">Control plane</span>
            <h1>Operations Dashboard</h1>
            <p>Sync GitHub labs, tune scores, and maintain reward rules.</p>
          </div>
          <div className="crm-top-actions">
            {message && <span className="crm-toast">{message}</span>}
            <button className="crm-primary-button" onClick={syncAll} disabled={busyAction === 'sync-all'}>
              <RefreshCw size={17} /> {busyAction === 'sync-all' ? 'Syncing...' : 'Sync all PRs'}
            </button>
          </div>
        </header>

        <section className="crm-metrics">
          {[
            ['Labs', labs.length, GitPullRequest],
            ['Students', users.length, Users],
            ['Submissions', submissions.length, Database],
            ['Pending review', pendingSubmissions, RefreshCw]
          ].map(([label, value, Icon]) => (
            <article className="crm-metric-card" key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="crm-section-grid" id="labs">
          <form className="crm-panel crm-form" onSubmit={saveLab}>
            <div className="crm-panel-heading">
              <div>
                <span className="crm-kicker">Task setup</span>
                <h2>{editingId ? 'Edit lab' : 'Create lab'}</h2>
              </div>
              <Settings size={20} />
            </div>
            <div className="crm-form-grid">
              {['title', 'githubUrl', 'repoOwner', 'repoName'].map((field) => (
                <label key={field}>
                  {field}
                  <input
                    value={form[field]}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (field === 'githubUrl') {
                        const parsed = repoFromUrl(value);
                        setForm({ ...form, githubUrl: value, ...(parsed || {}) });
                        return;
                      }
                      setForm({ ...form, [field]: value });
                    }}
                    required
                  />
                </label>
              ))}
              <label className="crm-span-2">
                description
                <input
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  required
                />
              </label>
              <label className="crm-span-2">
                logo image URL / emoji
                <input
                  value={form.icon}
                  onChange={(event) => setForm({ ...form, icon: event.target.value })}
                />
              </label>
              <label>
                points
                <input
                  type="number"
                  min="1"
                  value={form.points}
                  onChange={(event) => setForm({ ...form, points: event.target.value })}
                />
              </label>
              <label>
                difficulty
                <select
                  value={form.difficulty}
                  onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
                >
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                deadline
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                />
              </label>
            </div>
            <button className="crm-primary-button" disabled={busyAction === 'save-lab'}>
              {busyAction === 'save-lab' ? 'Saving...' : editingId ? 'Update lab' : 'Create lab'}
            </button>
          </form>

          <article className="crm-panel">
            <div className="crm-panel-heading">
              <div>
                <span className="crm-kicker">Active tasks</span>
                <h2>Labs</h2>
              </div>
              <div className="crm-heading-actions">
                <SearchInput
                  value={labSearch}
                  onChange={(value) => {
                    setLabSearch(value);
                    updateListPage('labs', 1);
                  }}
                  placeholder="Search labs"
                />
                <span className="crm-count">{filteredLabs.length}</span>
              </div>
            </div>
            <div className="crm-table">
              {visibleLabs.items.map((lab) => (
                <div className="crm-table-row" key={lab._id}>
                  <div>
                    <strong>{renderIcon(lab.icon, '🧪')}{lab.title}</strong>
                    <span>{lab.repoOwner}/{lab.repoName}</span>
                  </div>
                  <b>{lab.points} XP</b>
                  <div className="crm-actions">
                    <button onClick={() => openAssignLab(lab)}>Assign</button>
                    <button onClick={() => syncLab(lab._id)} disabled={busyAction === `sync-lab-${lab._id}`}>
                      {busyAction === `sync-lab-${lab._id}` ? 'Syncing...' : 'Sync'}
                    </button>
                    <button onClick={() => edit(lab)}>Edit</button>
                    <button className="danger" onClick={() => remove(lab._id)}>Archive</button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={visibleLabs.page} pages={visibleLabs.pages} total={filteredLabs.length} onPageChange={(page) => updateListPage('labs', page)} />
          </article>
        </section>

        <section className="crm-section-grid" id="badges">
          <form className="crm-panel crm-form" onSubmit={saveBadge}>
            <div className="crm-panel-heading">
              <div>
                <span className="crm-kicker">Side quests</span>
                <h2>{editingBadgeId ? 'Edit side quest' : 'Create side quest'}</h2>
              </div>
              <Medal size={20} />
            </div>
            <div className="crm-form-grid">
              {['title', 'icon'].map((field) => (
                <label key={field}>
                  {field === 'icon' ? 'logo image URL / emoji' : field}
                  <input
                    value={badgeForm[field]}
                    onChange={(event) => setBadgeForm({ ...badgeForm, [field]: event.target.value })}
                  />
                </label>
              ))}
              <label className="crm-span-2">
                description
                <input
                  value={badgeForm.description}
                  onChange={(event) => setBadgeForm({ ...badgeForm, description: event.target.value })}
                />
              </label>
              <label>
                points
                <input
                  type="number"
                  min="0"
                  value={badgeForm.pointsRequired}
                  onChange={(event) => setBadgeForm({ ...badgeForm, pointsRequired: event.target.value })}
                />
              </label>
              <label>
                rarity
                <select
                  value={badgeForm.rarity}
                  onChange={(event) => setBadgeForm({ ...badgeForm, rarity: event.target.value })}
                >
                  {['Common', 'Rare', 'Epic', 'Legendary'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="crm-primary-button" disabled={busyAction === 'save-sidequest'}>
              {busyAction === 'save-sidequest' ? 'Saving...' : editingBadgeId ? 'Update side quest' : 'Create side quest'}
            </button>
          </form>

          <article className="crm-panel">
            <div className="crm-panel-heading">
              <div>
                <span className="crm-kicker">Manual XP</span>
                <h2>Side Quests</h2>
              </div>
              <div className="crm-heading-actions">
                <SearchInput
                  value={badgeSearch}
                  onChange={(value) => {
                    setBadgeSearch(value);
                    updateListPage('badges', 1);
                  }}
                  placeholder="Search quests"
                />
                <span className="crm-count">{filteredBadges.length}</span>
              </div>
            </div>
            <div className="crm-table">
              {visibleBadges.items.map((badge) => (
                <div className="crm-table-row" key={badge._id}>
                  <div>
                    <strong>{renderIcon(badge.icon, '🫡')}{badge.title}</strong>
                    <span>{badge.rarity}</span>
                  </div>
                  <b>{badge.pointsRequired || 0} XP</b>
                  <div className="crm-actions">
                    <button onClick={() => openAssignBadge(badge)}>Assign</button>
                    <button onClick={() => editBadge(badge)}>Edit</button>
                    <button className="danger" onClick={() => deleteBadge(badge._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={visibleBadges.page} pages={visibleBadges.pages} total={filteredBadges.length} onPageChange={(page) => updateListPage('badges', page)} />
          </article>
        </section>

        <section className="crm-panel" id="users">
          <div className="crm-panel-heading">
            <div>
              <span className="crm-kicker">People and scoring</span>
              <h2>Users</h2>
            </div>
            <div className="crm-heading-actions">
              <SearchInput
                value={userSearch}
                onChange={(value) => {
                  setUserSearch(value);
                  updateListPage('users', 1);
                }}
                placeholder="Search users"
              />
              <span className="crm-count">{filteredUsers.length}</span>
            </div>
          </div>
          <div className="crm-user-table">
            {visibleUsers.items.map((user) => (
              <div className="crm-user-row" key={user._id}>
                <img src={resolveAvatar(user.avatarUrl)} alt={user.username} />
                <Link to={`/profile/${user.username}`}>
                  <strong>{user.displayName || user.username}</strong>
                  <span>@{user.username} - Rank #{user.rank || '-'}</span>
                </Link>
                <input
                  type="number"
                  defaultValue={user.totalPoints}
                  onBlur={(event) => saveUserPoints(user, event.target.value)}
                />
                <button className="crm-danger-button" onClick={() => deleteUser(user._id)}>Delete</button>
              </div>
            ))}
          </div>
          <Pagination page={visibleUsers.page} pages={visibleUsers.pages} total={filteredUsers.length} onPageChange={(page) => updateListPage('users', page)} />
        </section>

        <section className="crm-panel" id="submissions">
          <div className="crm-panel-heading">
            <div>
              <span className="crm-kicker">GitHub intake</span>
              <h2>Review queue</h2>
            </div>
            <div className="crm-heading-actions">
              <SearchInput
                value={submissionSearch}
                onChange={(value) => {
                  setSubmissionSearch(value);
                  updateListPage('submissions', 1);
                }}
                placeholder="Search PRs"
              />
              <select
                className="crm-queue-select"
                value={reviewLabFilter}
                onChange={(event) => {
                  setReviewLabFilter(event.target.value);
                  updateListPage('submissions', 1);
                }}
                aria-label="Filter review queue by lab"
              >
                <option value="all">All labs</option>
                {labs.map((lab) => (
                  <option key={lab._id} value={lab._id}>
                    {lab.title}
                  </option>
                ))}
              </select>
              <div className="crm-filter-group">
                {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                  <button
                    className={reviewFilter === filter ? 'active' : ''}
                    key={filter}
                    onClick={() => {
                      setReviewFilter(filter);
                      updateListPage('submissions', 1);
                    }}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button className="crm-primary-button" onClick={approveAllPending} disabled={!pendingSubmissions || busyAction === 'approve-all'}>
                {busyAction === 'approve-all' ? 'Approving...' : 'Approve all pending'}
              </button>
              <span className="crm-count">{pendingSubmissions}</span>
            </div>
          </div>
          <div className="crm-table">
            {visibleSubmissions.items.map((submission) => (
              <div
                className={`crm-table-row review-row ${submission.reviewStatus || 'pending'}`}
                key={submission._id}
              >
                <div>
                  <strong>
                    @{submission.userId?.username}
                    <a className="crm-inline-link" href={submission.prUrl} target="_blank" rel="noreferrer">
                      PR #{submission.prNumber}
                    </a>
                  </strong>
                  <span>{submission.labId?.title} - {submission.repoOwner}/{submission.repoName}</span>
                </div>
                <b>{submission.pointsAwarded || submission.labId?.points || 0} XP</b>
                <div className="crm-review-meta">
                  <span className={`crm-status ${submission.status}`}>{submission.status}</span>
                  <span className={`crm-review-status ${submission.reviewStatus || 'pending'}`}>
                    {submission.reviewStatus || 'pending'}
                  </span>
                </div>
                <div className="crm-actions">
                  <button
                    disabled={(submission.reviewStatus || 'pending') === 'approved' || busyAction === `approve-${submission._id}`}
                    onClick={() => approveSubmission(submission)}
                  >
                    {busyAction === `approve-${submission._id}` ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className="danger"
                    disabled={(submission.reviewStatus || 'pending') === 'approved' || busyAction === `reject-${submission._id}`}
                    onClick={() => rejectSubmission(submission)}
                  >
                    {busyAction === `reject-${submission._id}` ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={visibleSubmissions.page} pages={visibleSubmissions.pages} total={filteredSubmissions.length} onPageChange={(page) => updateListPage('submissions', page)} />
        </section>

        <section className="crm-panel" id="logs">
          <div className="crm-panel-heading">
            <div>
              <span className="crm-kicker">System history</span>
              <h2>Logs</h2>
            </div>
            <div className="crm-heading-actions">
              <SearchInput
                value={logFilters.search}
                onChange={(value) => updateLogFilters({ search: value })}
                placeholder="Search logs"
              />
              <select
                className="crm-queue-select"
                value={logFilters.category}
                onChange={(event) => updateLogFilters({ category: event.target.value })}
                aria-label="Filter logs by category"
              >
                <option value="all">All categories</option>
                {logMeta.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                className="crm-date-input"
                type="date"
                value={logFilters.from}
                onChange={(event) => updateLogFilters({ from: event.target.value })}
                aria-label="Logs from date"
              />
              <input
                className="crm-date-input"
                type="date"
                value={logFilters.to}
                onChange={(event) => updateLogFilters({ to: event.target.value })}
                aria-label="Logs to date"
              />
              <span className="crm-count">{logMeta.total || filteredLogs.length}</span>
            </div>
          </div>
          <div className="crm-log-list">
            {filteredLogs.length ? (
              filteredLogs.map((log) => (
                <article className="crm-log-row" key={log._id}>
                  <span className="crm-log-icon"><Clock3 size={16} /></span>
                  <div>
                    <strong>{log.message}</strong>
                    <small>
                      {log.actor || 'system'} - {new Date(log.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <em>{log.type}</em>
                </article>
              ))
            ) : (
              <p className="muted">No logs yet. Actions like point changes, PR syncs, approvals, and deletions will appear here.</p>
            )}
          </div>
          <Pagination page={logMeta.page || 1} pages={logMeta.pages || 1} total={logMeta.total || filteredLogs.length} onPageChange={(page) => setLogFilters((current) => ({ ...current, page }))} />
        </section>
      </div>

      {assigningBadge && (
        <div className="crm-modal-backdrop" role="presentation" onClick={() => setAssigningBadge(null)}>
          <div className="crm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="crm-panel-heading">
              <div>
                <span className="crm-kicker">Assign side quest</span>
                <h2>{assigningBadge.icon} {assigningBadge.title}</h2>
              </div>
              <span className="crm-count">{assigningBadge.pointsRequired || 0} XP</span>
            </div>
            <SearchInput value={assignBadgeSearch} onChange={setAssignBadgeSearch} placeholder="Search users" />
            <div className="crm-assign-list">
              {assignBadgeUsers.map((user) => {
                const alreadyAssigned = hasAssignedBadge(user, assigningBadge);
                return (
                  <label className={`crm-assign-user ${alreadyAssigned ? 'assigned' : ''}`} key={user._id}>
                    <input
                      type="checkbox"
                      checked={
                        alreadyAssigned
                          ? selectedAssignedUsers.includes(user._id)
                          : selectedUsers.includes(user._id)
                      }
                      onChange={() =>
                        alreadyAssigned
                          ? toggleSelectedAssignedUser(user._id)
                          : toggleSelectedUser(user._id)
                      }
                    />
                    <img src={resolveAvatar(user.avatarUrl)} alt={user.username} />
                    <span>
                      <strong>{user.displayName || user.username}</strong>
                      <small>
                        @{user.username} - {user.totalPoints} XP{alreadyAssigned ? ' - assigned, select to remove' : ''}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="crm-modal-actions">
              <button className="crm-ghost-button" onClick={() => setAssigningBadge(null)}>Cancel</button>
              <button className="crm-danger-button" onClick={unassignBadge} disabled={!selectedAssignedUsers.length || busyAction === 'unassign-sidequest'}>
                {busyAction === 'unassign-sidequest' ? 'Removing...' : `Remove from ${selectedAssignedUsers.length || 0}`}
              </button>
              <button className="crm-primary-button" onClick={assignBadge} disabled={!selectedUsers.length || busyAction === 'assign-sidequest'}>
                {busyAction === 'assign-sidequest' ? 'Assigning...' : `Assign to ${selectedUsers.length || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {assigningLab && (
        <div className="crm-modal-backdrop" role="presentation" onClick={() => setAssigningLab(null)}>
          <div className="crm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="crm-panel-heading">
              <div>
                <span className="crm-kicker">Assign lab</span>
                <h2>{renderIcon(assigningLab.icon, 'ðŸ§ª')} {assigningLab.title}</h2>
              </div>
              <span className="crm-count">{assigningLab.points || 0} XP</span>
            </div>
            <SearchInput value={assignLabSearch} onChange={setAssignLabSearch} placeholder="Search users" />
            <div className="crm-assign-list">
              {assignLabUsers.map((user) => {
                const alreadyAssigned = hasAssignedLab(user, assigningLab);
                return (
                  <label className={`crm-assign-user ${alreadyAssigned ? 'assigned' : ''}`} key={user._id}>
                    <input
                      type="checkbox"
                      checked={
                        alreadyAssigned
                          ? selectedAssignedLabUsers.includes(user._id)
                          : selectedLabUsers.includes(user._id)
                      }
                      onChange={() =>
                        alreadyAssigned
                          ? toggleSelectedAssignedLabUser(user._id)
                          : toggleSelectedLabUser(user._id)
                      }
                    />
                    <img src={resolveAvatar(user.avatarUrl)} alt={user.username} />
                    <span>
                      <strong>{user.displayName || user.username}</strong>
                      <small>
                        @{user.username} - {user.totalPoints} XP{alreadyAssigned ? ' - assigned, select to remove' : ''}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="crm-modal-actions">
              <button className="crm-ghost-button" onClick={() => setAssigningLab(null)}>Cancel</button>
              <button className="crm-danger-button" onClick={unassignLab} disabled={!selectedAssignedLabUsers.length || busyAction === 'unassign-lab'}>
                {busyAction === 'unassign-lab' ? 'Removing...' : `Remove from ${selectedAssignedLabUsers.length || 0}`}
              </button>
              <button className="crm-primary-button" onClick={assignLab} disabled={!selectedLabUsers.length || busyAction === 'assign-lab'}>
                {busyAction === 'assign-lab' ? 'Assigning...' : `Assign to ${selectedLabUsers.length || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
