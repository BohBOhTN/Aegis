import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Card style={{ textAlign: 'center', maxWidth: '400px' }}>
        <MapPinOff size={64} color="var(--warning)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>System Route Unresolved</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          The requested endpoint or user interface module could not be located within the active routing matrix.
        </p>
        <Button onClick={() => navigate('/dashboard')} fullWidth>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};
