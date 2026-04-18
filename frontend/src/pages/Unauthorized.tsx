import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Card style={{ textAlign: 'center', maxWidth: '400px' }}>
        <ShieldAlert size={64} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Clearance Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Your current Role-Based Access Control (RBAC) profile does not possess the requisite permissions to access this native module.
        </p>
        <Button onClick={() => navigate('/dashboard')} fullWidth>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};
