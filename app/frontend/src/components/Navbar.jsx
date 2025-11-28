import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Home, Map, ListTodo, BookOpen, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Leaf className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
            <span className="text-xl font-bold text-gray-900">Co-Garden</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" icon={Home}>Accueil</NavLink>
            <NavLink to="/parcelles" icon={Map}>Parcelles</NavLink>
            <NavLink to="/taches" icon={ListTodo}>Tâches</NavLink>
            <NavLink to="/catalogue" icon={BookOpen}>Catalogue</NavLink>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  );
}
