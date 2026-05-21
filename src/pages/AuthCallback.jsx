import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeGithubLogin } = useAuth();
  const [message, setMessage] = useState('Completing GitHub login...');

  useEffect(() => {
    const code = params.get('code');

    if (!code) {
      setMessage('GitHub did not return an authorization code.');
      return;
    }

    completeGithubLogin(code)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((error) => {
        setMessage(error.response?.data?.message || 'GitHub login failed.');
      });
  }, [completeGithubLogin, navigate, params]);

  return <div className="page-status">{message}</div>;
}
