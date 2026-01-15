import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockAchievements } from '../data/mockData';
import * as storage from '../services/storage';
import Layout from '../components/Layout';
import {
    User, Mail, Calendar, LogOut, Settings, Trophy,
    Beaker, Clock, ChevronRight, Shield, Edit2
} from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        experiments: 0,
        achievements: 0,
        totalTime: 0,
    });
    const [userAchievements, setUserAchievements] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            loadStats();
        }
    }, [user]);

    const loadStats = () => {
        if (!user) return;

        const progress = storage.getProgress(user.id);
        const completed = progress.filter(p => p.status === 'completed');
        const achievements = storage.getUserAchievements(user.id);

        setStats({
            experiments: completed.length,
            achievements: achievements.length,
            totalTime: completed.length * 30,
        });

        setUserAchievements(achievements.map(a => a.achievement_id));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const menuItems = [
        { icon: Settings, label: 'Cài đặt tài khoản', onClick: () => { } },
        { icon: Shield, label: 'Bảo mật', onClick: () => { } },
        { icon: Trophy, label: 'Thành tích của tôi', onClick: () => { } },
    ];

    return (
        <Layout>
            <div className="p-4 pb-24 max-w-4xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-6 mb-6 relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                    <div className="relative flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                                <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-800">{user?.full_name || 'Người dùng'}</h1>
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user?.role === 'admin'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-secondary-100 text-secondary-700'
                                    }`}>
                                    <Shield className="w-3 h-3" />
                                    {user?.role === 'admin' ? 'Giáo viên' : 'Học sinh'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Join date */}
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Tham gia từ {user?.created_at ? formatDate(user.created_at) : 'Không rõ'}
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-2xl p-4 text-center"
                    >
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                            <Beaker className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats.experiments}</p>
                        <p className="text-xs text-gray-500">Thí nghiệm</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass rounded-2xl p-4 text-center"
                    >
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats.achievements}</p>
                        <p className="text-xs text-gray-500">Huy hiệu</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-4 text-center"
                    >
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalTime}</p>
                        <p className="text-xs text-gray-500">Phút</p>
                    </motion.div>
                </div>

                {/* Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl p-4 mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Thành tích</h2>
                        <span className="text-xs text-gray-500">{userAchievements.length}/{mockAchievements.length}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                        {mockAchievements.map((achievement) => {
                            const isUnlocked = userAchievements.includes(achievement.id);
                            return (
                                <div
                                    key={achievement.id}
                                    className={`relative flex flex-col items-center ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isUnlocked
                                            ? 'bg-gradient-to-br from-accent-100 to-accent-200 shadow-lg'
                                            : 'bg-gray-200'
                                        }`}>
                                        {achievement.icon}
                                    </div>
                                    <p className="text-xs text-gray-600 text-center mt-1 line-clamp-1">
                                        {achievement.title}
                                    </p>
                                    {isUnlocked && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Menu */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl overflow-hidden mb-6"
                >
                    {menuItems.map((item, index) => (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="text-gray-800 font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    ))}
                </motion.div>

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 font-semibold rounded-2xl hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </motion.button>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-400">STEM Lab Simulator v1.0</p>
                    <p className="text-xs text-gray-300 mt-1">Phòng Thí Nghiệm Ảo</p>
                </div>
            </div>
        </Layout>
    );
}
