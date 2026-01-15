import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Beaker, User, Sparkles } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
    hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
    const { user } = useAuth();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    const navItems = [
        { path: '/library', label: 'Thư viện', icon: Beaker },
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/profile', label: 'Cá nhân', icon: User },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 grid-bg">
            {/* Main Content */}
            <main className="relative">
                {children}
            </main>

            {/* Bottom Navigation - Mobile */}
            {!hideNav && user && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 safe-area-bottom md:hidden">
                    <div className="flex items-center justify-around px-4 py-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${isActive(item.path)
                                    ? 'text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl transition-all ${isActive(item.path)
                                    ? 'bg-primary-100'
                                    : 'hover:bg-gray-100'
                                    }`}>
                                    <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'text-primary-600' : ''
                                        }`} />
                                </div>
                                <span className={`text-xs mt-1 font-medium ${isActive(item.path) ? 'text-primary-600' : ''
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}

            {/* Desktop Sidebar - for larger screens */}
            {!hideNav && user && (
                <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex-col z-50">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                                <Beaker className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-800">STEM Lab</h1>
                                <p className="text-xs text-gray-500">Phòng Thí Nghiệm Ảo</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <div className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}

                        {/* Create Experiment - Admin Only */}
                        {isAdmin && (
                            <Link
                                to="/create"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 ${isActive('/create')
                                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                    : 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 hover:from-primary-100 hover:to-secondary-100'
                                    }`}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span className="font-medium">Tạo thí nghiệm AI</span>
                            </Link>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            to="/profile"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{user.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </Link>
                    </div>
                </nav>
            )}

            {/* Main content margin for desktop sidebar */}
            <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: ${!hideNav && user ? '16rem' : '0'};
          }
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
        </div>
    );
}
