import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, GraduationCap, LogOut, User, Search } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Sponsors', path: '/admin/sponsors', icon: Users },
    { name: 'Scholarships', path: '/admin/scholarships', icon: GraduationCap },
  ];

  const studentNav = [
    { name: 'Scholarships', path: '/', icon: Search },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const navItems = role === 'STAFF' ? adminNav : studentNav;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">SIM-Beasiswa</h1>
          <p className="text-xs text-gray-500 uppercase mt-1">{role}</p>
        </div>
        <nav className="mt-6 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
