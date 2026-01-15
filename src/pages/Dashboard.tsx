import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockExperiments } from '../data/mockData';
import * as storage from '../services/storage';
import { StudentStats, AdminStats, StudentProgress } from '../types';
import Layout from '../components/Layout';
import {
    Beaker, Trophy, Clock, CheckCircle, Users, BookOpen,
    FileText, ArrowRight, Sparkles, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [studentStats, setStudentStats] = useState<StudentStats>({
        completedExperiments: 0,
        completionRate: 0,
        achievements: 0,
        totalTime: 0,
    });
    const [adminStats, setAdminStats] = useState<AdminStats>({
        totalStudents: 0,
        totalExperiments: mockExperiments.length,
        todayCompleted: 0,
        pendingReports: 0,
    });
    const [recentProgress, setRecentProgress] = useState<StudentProgress[]>([]);

    useEffect(() => {
        if (user) {
            loadStats();
        }
    }, [user]);

    const loadStats = () => {
        if (!user) return;

        if (isAdmin) {
            // Admin stats
            const allUsers = storage.getAllUsers();
            const students = allUsers.filter(u => u.role === 'student');
            const allProgress = storage.getAllProgress();
            const completedToday = allProgress.filter(p => {
                if (p.status === 'completed' && p.end_time) {
                    const today = new Date().toDateString();
                    return new Date(p.end_time).toDateString() === today;
                }
                return false;
            });
            const reports = storage.getAllReports();
            const pendingReports = reports.filter(r => !r.saved_to_profile);

            setAdminStats({
                totalStudents: students.length,
                totalExperiments: mockExperiments.length,
                todayCompleted: completedToday.length,
                pendingReports: pendingReports.length,
            });

            setRecentProgress(allProgress.slice(-5).reverse());
        } else {
            // Student stats
            const progress = storage.getProgress(user.id);
            const completed = progress.filter(p => p.status === 'completed');
            const achievements = storage.getUserAchievements(user.id);
            const totalTime = completed.length * 30; // Estimate 30 min per experiment

            setStudentStats({
                completedExperiments: completed.length,
                completionRate: mockExperiments.length > 0
                    ? Math.round((completed.length / mockExperiments.length) * 100)
                    : 0,
                achievements: achievements.length,
                totalTime,
            });

            setRecentProgress(progress.slice(-5).reverse());
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng! 🌅';
        if (hour < 18) return 'Chào buổi chiều! ☀️';
        return 'Chào buổi tối! 🌙';
    };

    const getExperimentTitle = (experimentId: string) => {
        const exp = mockExperiments.find(e => e.id === experimentId);
        return exp?.title || 'Thí nghiệm';
    };

    const statsCards = isAdmin ? [
        { label: 'Tổng học sinh', value: adminStats.totalStudents, icon: Users, color: 'from-primary-400 to-primary-600', bgColor: 'bg-primary-100' },
        { label: 'Tổng thí nghiệm', value: adminStats.totalExperiments, icon: Beaker, color: 'from-secondary-400 to-secondary-600', bgColor: 'bg-secondary-100' },
        { label: 'Hoàn thành hôm nay', value: adminStats.todayCompleted, icon: CheckCircle, color: 'from-green-400 to-green-600', bgColor: 'bg-green-100' },
        { label: 'Báo cáo chờ duyệt', value: adminStats.pendingReports, icon: FileText, color: 'from-accent-400 to-accent-600', bgColor: 'bg-accent-100' },
    ] : [
        { label: 'Thí nghiệm đã làm', value: studentStats.completedExperiments, icon: CheckCircle, color: 'from-primary-400 to-primary-600', bgColor: 'bg-primary-100' },
        { label: 'Hoàn thành', value: `${studentStats.completionRate}%`, icon: TrendingUp, color: 'from-secondary-400 to-secondary-600', bgColor: 'bg-secondary-100' },
        { label: 'Huy hiệu', value: studentStats.achievements, icon: Trophy, color: 'from-accent-400 to-accent-600', bgColor: 'bg-accent-100' },
        { label: 'Phút học tập', value: studentStats.totalTime, icon: Clock, color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-100' },
    ];

    return (
        <Layout>
            <div className="p-4 pb-24 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-gray-800"
                    >
                        {getGreeting()}
                    </motion.h1>
                    <p className="text-gray-500">
                        {isAdmin ? 'Quản lý và theo dõi tiến độ học tập' : 'Khám phá thế giới khoa học qua thí nghiệm'}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass rounded-2xl p-4 card-hover"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className={`text-xs font-medium ${stat.bgColor} px-2 py-1 rounded-full text-gray-600`}>
                                    {isAdmin ? 'Quản trị' : 'Tiến độ'}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isAdmin ? 'Hoạt động gần đây' : 'Thí nghiệm gần đây'}
                        </h2>
                        <Link to="/library" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {recentProgress.length > 0 ? (
                        <div className="space-y-3">
                            {recentProgress.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        to={`/experiment/${item.experiment_id}`}
                                        className="glass rounded-xl p-4 flex items-center gap-4 card-hover block"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                                            <Beaker className="w-6 h-6 text-primary-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">
                                                {getExperimentTitle(item.experiment_id)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : item.status === 'in_progress'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang làm' : 'Chưa làm'}
                                                </span>
                                                {item.score && (
                                                    <span className="text-xs text-accent-600 font-medium">
                                                        ⭐ {item.score}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass rounded-xl p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">
                                {isAdmin ? 'Chưa có hoạt động nào' : 'Bạn chưa bắt đầu thí nghiệm nào'}
                            </p>
                            <Link
                                to="/library"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                            >
                                <Sparkles className="w-5 h-5" />
                                Khám phá ngay
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Access */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Truy cập nhanh</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <Link to="/library" className="glass rounded-xl p-4 text-center card-hover">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                <Beaker className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Thư viện</p>
                        </Link>
                        <Link to="/profile" className="glass rounded-xl p-4 text-center card-hover">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Cá nhân</p>
                        </Link>
                        <button onClick={loadStats} className="glass rounded-xl p-4 text-center card-hover">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Làm mới</p>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-400">Powered by STEM Virtual Lab</p>
                    <p className="text-xs text-gray-300 mt-1">Học tập qua trải nghiệm thực tế</p>
                </div>
            </div>
        </Layout>
    );
}
