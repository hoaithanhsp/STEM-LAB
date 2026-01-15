import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockExperiments } from '../data/mockData';
import * as storage from '../services/storage';
import { Experiment, StudentProgress } from '../types';
import { useSimulation } from '../hooks/useSimulation';
import ParameterPanel from '../components/simulations/ParameterPanel';
import ResultsPanel from '../components/simulations/ResultsPanel';
import SimulationCanvas from '../components/simulations/SimulationCanvas';
import Layout from '../components/Layout';
import {
    ArrowLeft, Heart, Share2, Clock, RotateCcw, Play,
    Beaker, BookOpen, X, Sparkles
} from 'lucide-react';

export default function ExperimentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [experiment, setExperiment] = useState<Experiment | null>(null);
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ steps: '', observations: '' });
    const [aiConclusion, setAiConclusion] = useState('');
    const [loading, setLoading] = useState(true);

    // Use simulation hook
    const simulation = useSimulation(id || '');

    useEffect(() => {
        if (id) {
            const exp = mockExperiments.find(e => e.id === id);
            setExperiment(exp || null);

            if (user) {
                const prog = storage.getProgressByExperiment(user.id, id);
                setProgress(prog || null);

                // Auto start progress
                if (!prog) {
                    const newProgress: StudentProgress = {
                        id: storage.generateId(),
                        user_id: user.id,
                        experiment_id: id,
                        status: 'in_progress',
                        start_time: new Date().toISOString(),
                    };
                    storage.saveProgress(newProgress);
                    setProgress(newProgress);
                }
            }

            setLoading(false);
        }
    }, [id, user]);

    const generateAIConclusion = () => {
        if (!experiment || !simulation.results.length) return;

        const resultText = simulation.results
            .map(r => `${r.name}: ${r.value}${r.unit}`)
            .join(', ');

        setAiConclusion(
            `Dựa trên kết quả thí nghiệm "${experiment.title}", với các thông số đo được: ${resultText}. ` +
            `Kết quả này phù hợp với lý thuyết và công thức tính toán. ` +
            `Sai số thực nghiệm nằm trong giới hạn cho phép (<5%).`
        );
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
        alert('Báo cáo đã được lưu thành công!');
    };

    if (loading) {
        return (
            <Layout hideNav>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!experiment) {
        return (
            <Layout hideNav>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">Không tìm thấy thí nghiệm</p>
                        <button onClick={() => navigate('/library')} className="px-6 py-2 bg-primary-500 text-white rounded-full">
                            Quay lại thư viện
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout hideNav>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{experiment.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">{experiment.subject}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{experiment.estimated_time} phút</span>
                                    </div>
                                </div>
                            </button>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsFavorite(!isFavorite)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                    <Share2 className="w-5 h-5 text-gray-500" />
                                </button>
                                <button
                                    onClick={simulation.reset}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 text-sm font-medium"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>
                                <button
                                    onClick={simulation.run}
                                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl text-sm font-semibold"
                                >
                                    <Play className="w-4 h-4" />
                                    Chạy Thí Nghiệm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - 2 Column Layout */}
                <div className="max-w-7xl mx-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column - Parameters & Instructions */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Parameter Panel */}
                            {simulation.config && (
                                <ParameterPanel
                                    parameters={simulation.config.parameters}
                                    values={simulation.parameters}
                                    onChange={simulation.updateParameter}
                                    onReset={simulation.reset}
                                />
                            )}

                            {/* Instructions */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-secondary-600" />
                                    </div>
                                    <span className="font-semibold text-gray-800">Hướng Dẫn & Dụng Cụ</span>
                                </div>

                                {/* Tools */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Dụng cụ</p>
                                    <div className="flex flex-wrap gap-2">
                                        {experiment.tools_instructions.slice(0, 4).map((tool, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                {tool.split('(')[0].trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Steps */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Các bước thực hiện</p>
                                    <div className="space-y-2">
                                        {experiment.learning_objectives.slice(0, 4).map((obj, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span className="line-clamp-2">{obj}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Canvas & Results */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Simulation Canvas */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                <SimulationCanvas
                                    experimentType={simulation.config?.type || 'default'}
                                    parameters={simulation.parameters}
                                    isRunning={simulation.isRunning}
                                />

                                <div className="mt-3 text-center text-xs text-gray-400">
                                    Điều chỉnh tham số ở bên trái để xem mô phỏng thay đổi
                                </div>
                            </div>

                            {/* Results Panel */}
                            <ResultsPanel
                                results={simulation.results}
                                isRunning={simulation.isRunning}
                            />

                            {/* AI Analysis Button */}
                            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Phân tích AI</p>
                                            <p className="text-xs text-gray-500">Nhận giải thích chi tiết từ AI</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { generateAIConclusion(); setShowReportModal(true); }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        AI Phân Tích & Viết Báo Cáo
                                    </button>
                                </div>

                                {aiConclusion && (
                                    <div className="mt-4 p-3 bg-white/80 rounded-xl">
                                        <p className="text-sm text-gray-700">{aiConclusion}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Báo cáo thí nghiệm</h2>
                                    <p className="text-xs text-gray-500">Tự động tạo từ kết quả</p>
                                </div>
                                <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                                <div className="rounded-xl bg-primary-50 p-3 flex items-center gap-3">
                                    <Beaker className="w-8 h-8 text-primary-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{experiment.title}</p>
                                        <p className="text-xs text-gray-500">{experiment.subject}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Các bước thực hiện</label>
                                    <textarea
                                        value={reportForm.steps}
                                        onChange={(e) => setReportForm({ ...reportForm, steps: e.target.value })}
                                        placeholder="Mô tả các bước bạn đã thực hiện..."
                                        rows={3}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Kết quả quan sát</label>
                                    <textarea
                                        value={reportForm.observations}
                                        onChange={(e) => setReportForm({ ...reportForm, observations: e.target.value })}
                                        placeholder="Ghi lại những gì bạn quan sát được..."
                                        rows={3}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
                                    <p className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Kết luận AI
                                    </p>
                                    <p className="text-sm text-gray-700">{aiConclusion || 'Đang phân tích...'}</p>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex gap-3">
                                <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl">
                                    Hủy
                                </button>
                                <button onClick={submitReport} className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg">
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
