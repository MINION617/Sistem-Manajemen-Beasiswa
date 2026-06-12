import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/AdminLayout'; // Renamed to DashboardLayout in file
import SponsorManagement from './pages/admin/SponsorManagement';
import ScholarshipManagement from './pages/admin/ScholarshipManagement';
import Profile from './pages/student/Profile';
import ScholarshipList from './pages/student/ScholarshipList';
import ApplicationForm from './pages/student/ApplicationForm';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  return children;
};

const RoleBasedHome = () => {
  const { role } = useAuth();
  if (role === 'STAFF') return <Dashboard />;
  if (role === 'MAHASISWA') return <ScholarshipList />;
  return <Dashboard />;
};

const Dashboard = () => {
  const { user, role } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg">Welcome back, <span className="font-semibold">{user.email}</span>!</p>
        <p className="text-gray-600 mt-2">Current Role: <span className="text-blue-600 font-medium">{role}</span></p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RoleBasedHome />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/sponsors" 
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <DashboardLayout>
                  <SponsorManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/scholarships" 
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <DashboardLayout>
                  <ScholarshipManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['MAHASISWA']}>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apply/:id" 
            element={
              <ProtectedRoute allowedRoles={['MAHASISWA']}>
                <DashboardLayout>
                  <ApplicationForm />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
