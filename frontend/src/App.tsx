import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
import { RBACGuard } from './routes/RBACGuard';
import { Card } from './components/ui/Card';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RBACGuard />}>
          <Route element={<MainLayout />}>
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <Card>
                <h2>Aegis Dashboard Placeholder</h2>
                <p>Foundation architecture connected successfully.</p>
              </Card>
            } />

            <Route path="/admin/*" element={
               <RBACGuard allowedRoles={['SuperAdmin', 'Admin']} />
            }>
               <Route path="users" element={
                 <Card>
                   <h2>User Matrix Placeholder</h2>
                 </Card>
               } />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
