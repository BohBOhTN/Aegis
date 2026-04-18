import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email and password are strictly required.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login({ email, password });
      
      if (res.success && res.data) {
        login(res.data.user, res.data.token);
        navigate('/dashboard'); // Standard entry point
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-backdrop"></div>
      <Card className="login-card">
        <div className="login-header">
          <ShieldCheck size={48} className="login-icon" />
          <h2>Aegis Secure Gateway</h2>
          <p>Please authenticate to access the core ERP engine.</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Input 
            label="Corporate Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@aegris.com"
            disabled={isLoading}
          />
          <Input 
            label="Master Password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />
          
          <Button type="submit" fullWidth isLoading={isLoading} className="login-submit">
            {isLoading ? 'Authenticating...' : 'Authorize Access'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
