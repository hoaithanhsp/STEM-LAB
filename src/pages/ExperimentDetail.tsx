import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockExperiments } from '../data/mockData';
import * as storage from '../services/storage';
import { Experiment, StudentProgress } from '../types';
import Layout from '../components/Layout';
import {
    ArrowLeft, Heart, Share2, Star, Clock, Info, Play,
    Pause, RotateCcw, Square, Beaker, CheckCircle, FileText,
    Zap, Target, Wrench, BookOpen, X
} from 'lucide-react';

export default function ExperimentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [experiment, setExperiment] = useState<Experiment | null>(null);
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'simulation' | 'results'>('info');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [isSimulationPaused, setIsSimulationPaused] = useState(false);
    const [simulationTime, setSimulationTime] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ steps: '', observations: '' });
    const [aiConclusion, setAiConclusion] = useState('');
    const [loading, setLoading] = useState(true);

    // Sample result data
    const [resultData] = useState({
        voltage: '5.0',
        current: '0.25',
        resistance: '20',
        power: '1.25'
    });

    useEffect(() => {
        if (id) {
            const exp = mockExperiments.find(e => e.id === id);
            setExperiment(exp || null);

            if (user) {
                const prog = storage.getProgressByExperiment(user.id, id);
                setProgress(prog || null);
            }

            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isSimulationRunning && !isSimulationPaused) {
            interval = setInterval(() => {
                setSimulationTime(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSimulationRunning, isSimulationPaused]);

    const getDifficultyText = () => {
        if (!experiment) return '';
        return experiment.difficulty_level;
    };

    const getProgressPercent = () => {
        if (!progress) return 0;
        if (progress.status === 'completed') return 100;
        if (progress.status === 'in_progress') return 50;
        return 0;
    };

    const getStatusText = () => {
        if (!progress) return 'Chưa làm';
        if (progress.status === 'completed') return 'Hoàn thành';
        if (progress.status === 'in_progress') return 'Đang làm';
        return 'Chưa làm';
    };

    const startExperiment = () => {
        if (!user || !experiment) return;

        const newProgress: StudentProgress = {
            id: storage.generateId(),
            user_id: user.id,
            experiment_id: experiment.id,
            status: 'in_progress',
            start_time: new Date().toISOString(),
        };

        storage.saveProgress(newProgress);
        setProgress(newProgress);
        setActiveTab('simulation');
    };

    const toggleSimulation = () => {
        if (!isSimulationRunning) {
            setIsSimulationRunning(true);
            setIsSimulationPaused(false);
        } else {
            setIsSimulationPaused(!isSimulationPaused);
        }
    };

    const resetSimulation = () => {
        setSimulationTime(0);
        setIsSimulationRunning(false);
        setIsSimulationPaused(false);
    };

    const stopSimulation = () => {
        setIsSimulationRunning(false);
        setIsSimulationPaused(false);
    };

    const generateAIConclusion = () => {
        // Simulated AI response
        const conclusions = [
            `Dựa trên kết quả thí nghiệm, ta có thể kết luận rằng mối quan hệ giữa các đại lượng vật lý đã được xác minh đúng như lý thuyết. Điện áp U = ${resultData.voltage}V, dòng điện I = ${resultData.current}A cho thấy điện trở R = U/I = ${resultData.resistance}Ω theo đúng định luật Ohm.`,
            `Kết quả thí nghiệm cho thấy sự tương quan chặt chẽ giữa lý thuyết và thực nghiệm. Các phép đo đạc đã xác nhận công thức P = U × I với sai số < 5%. Đây là kết quả tốt cho thí nghiệm mô phỏng.`,
        ];
        setAiConclusion(conclusions[Math.floor(Math.random() * conclusions.length)]);
    };

    const submitReport = () => {
        if (!user || !experiment) return;

        const report = {
            id: storage.generateId(),
            user_id: user.id,
            experiment_id: experiment.id,
            steps: reportForm.steps,
            observations: reportForm.observations,
            ai_conclusion: aiConclusion,
            answers: {},
            created_at: new Date().toISOString(),
            saved_to_profile: false,
        };

        storage.saveReport(report);

        // Mark as completed
        const updatedProgress: StudentProgress = {
            id: progress?.id || storage.generateId(),
            user_id: user.id,
            experiment_id: experiment.id,
            status: 'completed',
            score: 85 + Math.floor(Math.random() * 15),
            start_time: progress?.start_time || new Date().toISOString(),
            end_time: new Date().toISOString(),
        };

        storage.saveProgress(updatedProgress);
        setProgress(updatedProgress);
        setShowReportModal(false);

        // Show success
        alert('Báo cáo đã được lưu thành công!');
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    if (!experiment) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">Không tìm thấy thí nghiệm</p>
                        <button
                            onClick={() => navigate('/library')}
                            className="px-6 py-2 bg-primary-500 text-white rounded-full"
                        >
                            Quay lại thư viện
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const tabs = [
        { key: 'info', label: 'Thông tin', icon: Info },
        { key: 'simulation', label: 'Mô phỏng', icon: Play },
        { key: 'results', label: 'Kết quả', icon: Zap },
    ];

    return (
        <Layout hideNav>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Thư viện</p>
                                <p className="text-sm font-semibold text-gray-800">Chi tiết</p>
                            </div>
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center"
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-green-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero */}
                <div className="relative h-56 overflow-hidden">
                    {experiment.thumbnail_url ? (
                        <img src={experiment.thumbnail_url} alt={experiment.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                            <Beaker className="w-20 h-20 text-white/50" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                                {experiment.subject}
                            </span>
                            <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs font-medium text-yellow-600">{getDifficultyText()}</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-white drop-shadow-lg">{experiment.title}</h1>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/90 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">{experiment.estimated_time} phút</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/60 backdrop-blur-sm px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${progress?.status === 'completed' ? 'bg-green-100 text-green-700' :
                                progress?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                {getStatusText()}
                            </span>
                            {progress?.score && (
                                <span className="text-sm font-semibold text-green-600">Điểm: {progress.score}</span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">{getProgressPercent()}% hoàn thành</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercent()}%` }}
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-sm px-4 py-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as 'info' | 'simulation' | 'results')}
                                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all ${activeTab === tab.key ? 'bg-white shadow-md' : ''
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-primary-600' : 'text-gray-400'}`} />
                                <span className={`text-xs ${activeTab === tab.key ? 'text-primary-600 font-semibold' : 'text-gray-500'}`}>
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-4 pb-32">
                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <div className="mt-4 space-y-4">
                            {/* Description */}
                            <div className="glass rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <span className="font-semibold text-gray-800">Mô tả</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{experiment.short_description}</p>
                            </div>

                            {/* Learning Objectives */}
                            <div className="glass rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-secondary-600" />
                                    </div>
                                    <span className="font-semibold text-gray-800">Mục tiêu học tập</span>
                                </div>
                                <div className="space-y-2">
                                    {experiment.learning_objectives.map((obj, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-xs font-bold text-white">{idx + 1}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{obj}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tools */}
                            <div className="glass rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                                        <Wrench className="w-4 h-4 text-accent-600" />
                                    </div>
                                    <span className="font-semibold text-gray-800">Dụng cụ & Hướng dẫn</span>
                                </div>
                                <div className="space-y-2">
                                    {experiment.tools_instructions.map((tool, idx) => (
                                        <div key={idx} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-gray-600">{tool}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Theory */}
                            {experiment.simulation_config && (
                                <div className="rounded-2xl p-4 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Lý thuyết</span>
                                    </div>
                                    <div className="bg-white/80 rounded-xl p-3">
                                        <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                                            {experiment.simulation_config}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Simulation Tab */}
                    {activeTab === 'simulation' && (
                        <div className="mt-4">
                            {/* Simulation Canvas */}
                            <div className="rounded-2xl bg-gray-900 overflow-hidden shadow-2xl mb-4">
                                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">Virtual Lab Environment</span>
                                </div>

                                <div className="relative h-72 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
                                    <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }} />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {!isSimulationRunning ? (
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-primary-500/30 bg-primary-500/20 flex items-center justify-center">
                                                    <Play className="w-8 h-8 text-primary-400" />
                                                </div>
                                                <p className="text-sm text-gray-400">Nhấn "Chạy" để bắt đầu</p>
                                                <p className="text-xs text-gray-500">Mô phỏng thí nghiệm tương tác</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/50"
                                                />
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                    className="absolute -top-8 left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-secondary-400"
                                                />
                                                <motion.div
                                                    animate={{ rotate: -360 }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                                    className="absolute -right-10 top-1/2 w-3 h-3 -translate-y-1/2 rounded-full bg-accent-400"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {isSimulationRunning && (
                                        <>
                                            <div className="absolute top-4 left-4 bg-gray-800/80 rounded-lg px-3 py-2">
                                                <p className="text-xs text-gray-400">Thời gian</p>
                                                <p className="text-sm text-primary-400 font-mono">{simulationTime}s</p>
                                            </div>
                                            <div className="absolute top-4 right-4 bg-gray-800/80 rounded-lg px-3 py-2">
                                                <p className="text-xs text-gray-400">Trạng thái</p>
                                                <p className="text-sm text-secondary-400 font-mono">
                                                    {isSimulationPaused ? 'Tạm dừng' : 'Đang chạy'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-4 bg-gray-800 px-4 py-3 border-t border-gray-700">
                                    <button
                                        onClick={resetSimulation}
                                        className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                                    >
                                        <RotateCcw className="w-5 h-5 text-gray-300" />
                                    </button>
                                    <button
                                        onClick={toggleSimulation}
                                        className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/40"
                                    >
                                        {isSimulationRunning && !isSimulationPaused ? (
                                            <Pause className="w-7 h-7 text-white" />
                                        ) : (
                                            <Play className="w-7 h-7 text-white" />
                                        )}
                                    </button>
                                    <button
                                        onClick={stopSimulation}
                                        className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                                    >
                                        <Square className="w-5 h-5 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Tools Panel */}
                            <div className="glass rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                            <Beaker className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Dụng cụ thí nghiệm</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Kéo thả vào canvas</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {['Pin', 'Điện trở', 'Bóng đèn', 'Công tắc', 'Ampe kế'].map((tool, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-20 flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                                                <Beaker className="w-6 h-6 text-primary-500" />
                                            </div>
                                            <span className="text-xs text-gray-600 text-center">{tool}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Tab */}
                    {activeTab === 'results' && (
                        <div className="mt-4 space-y-4">
                            {/* Real-time Results */}
                            <div className="glass rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-secondary-600" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Kết quả Realtime</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium text-green-700">Live</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-3">
                                        <p className="text-xs text-primary-600 mb-1">Điện áp</p>
                                        <p className="text-xl font-bold text-primary-700">{resultData.voltage}V</p>
                                    </div>
                                    <div className="rounded-xl bg-gradient-to-br from-secondary-50 to-secondary-100 p-3">
                                        <p className="text-xs text-secondary-600 mb-1">Dòng điện</p>
                                        <p className="text-xl font-bold text-secondary-700">{resultData.current}A</p>
                                    </div>
                                    <div className="rounded-xl bg-gradient-to-br from-accent-50 to-accent-100 p-3">
                                        <p className="text-xs text-accent-600 mb-1">Điện trở</p>
                                        <p className="text-xl font-bold text-accent-700">{resultData.resistance}Ω</p>
                                    </div>
                                    <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-3">
                                        <p className="text-xs text-red-600 mb-1">Công suất</p>
                                        <p className="text-xl font-bold text-red-700">{resultData.power}W</p>
                                    </div>
                                </div>

                                {/* Chart placeholder */}
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-2">Biểu đồ điện áp theo thời gian</p>
                                    <div className="flex items-end gap-1 h-24">
                                        {[40, 60, 35, 80, 65, 90, 75, 85, 70, 95].map((val, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-sm transition-all"
                                                style={{ height: `${val}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* AI Explanation */}
                            <div className="rounded-2xl p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 border border-primary-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-800">Giải thích AI</span>
                                            <p className="text-xs text-gray-500">Powered by AI Assistant</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateAIConclusion}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Tạo mới
                                    </button>
                                </div>

                                <div className="bg-white/80 rounded-xl p-4">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {aiConclusion || 'Nhấn "Tạo mới" để AI phân tích kết quả thí nghiệm của bạn.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3 max-w-4xl mx-auto">
                        {progress?.status !== 'completed' && (
                            <button
                                onClick={startExperiment}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30"
                            >
                                <Beaker className="w-5 h-5" />
                                {progress?.status === 'in_progress' ? 'Tiếp tục' : 'Bắt đầu'}
                            </button>
                        )}
                        <button
                            onClick={() => { generateAIConclusion(); setShowReportModal(true); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-secondary-500 to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-secondary-500/30"
                        >
                            <FileText className="w-5 h-5" />
                            Tạo báo cáo
                        </button>
                    </div>
                </div>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden"
                        >
                            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4">
                                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Báo cáo thí nghiệm</h2>
                                        <p className="text-xs text-gray-500">Tự động tạo từ kết quả thí nghiệm</p>
                                    </div>
                                    <button
                                        onClick={() => setShowReportModal(false)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                                {/* Experiment Info */}
                                <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white">
                                            {experiment.thumbnail_url ? (
                                                <img src={experiment.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Beaker className="w-8 h-8 text-primary-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{experiment.title}</p>
                                            <p className="text-xs text-gray-500">{experiment.subject} • {getDifficultyText()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Các bước thực hiện</label>
                                    <textarea
                                        value={reportForm.steps}
                                        onChange={(e) => setReportForm({ ...reportForm, steps: e.target.value })}
                                        placeholder="Nhập các bước thí nghiệm đã thực hiện..."
                                        rows={3}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Observations */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Kết quả quan sát</label>
                                    <textarea
                                        value={reportForm.observations}
                                        onChange={(e) => setReportForm({ ...reportForm, observations: e.target.value })}
                                        placeholder="Nhập kết quả quan sát được..."
                                        rows={3}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                                    />
                                </div>

                                {/* AI Conclusion */}
                                <div className="rounded-xl bg-primary-50 p-4 mb-4">
                                    <p className="text-sm font-semibold text-primary-800 mb-2">Kết luận AI</p>
                                    <p className="text-sm text-gray-700">{aiConclusion || 'Đang tạo...'}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitReport}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg"
                                >
                                    Lưu báo cáo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
