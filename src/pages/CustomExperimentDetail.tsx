import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as storage from '../services/storage';
import { CustomExperiment } from '../types';
import DynamicSimulationCanvas from '../components/simulations/DynamicSimulationCanvas';
import ParameterPanel from '../components/simulations/ParameterPanel';
import Layout from '../components/Layout';
import {
    ArrowLeft, Heart, Share2, Clock, RotateCcw, Play,
    Beaker, BookOpen, Sparkles, X
} from 'lucide-react';

export default function CustomExperimentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [experiment, setExperiment] = useState<CustomExperiment | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ steps: '', observations: '' });

    // Parameter state
    const [parameters, setParameters] = useState<Record<string, number>>({});

    useEffect(() => {
        if (id) {
            const customExperiments = storage.getAllCustomExperiments();
            const exp = customExperiments.find((e: CustomExperiment) => e.id === id);
            setExperiment(exp || null);

            // Initialize parameters from experiment config
            if (exp?.parameters) {
                const initialParams: Record<string, number> = {};
                exp.parameters.forEach((p: { id: string; defaultValue: number }) => {
                    initialParams[p.id] = p.defaultValue;
                });
                setParameters(initialParams);
            }

            setLoading(false);
        }
    }, [id]);

    const updateParameter = useCallback((paramId: string, value: number) => {
        setParameters(prev => ({ ...prev, [paramId]: value }));
    }, []);

    const resetParameters = useCallback(() => {
        if (experiment?.parameters) {
            const initialParams: Record<string, number> = {};
            experiment.parameters.forEach(p => {
                initialParams[p.id] = p.defaultValue;
            });
            setParameters(initialParams);
        }
    }, [experiment]);

    // Calculate results from formulas
    const results = useMemo(() => {
        if (!experiment?.formulas) return [];

        return experiment.formulas.map(f => {
            let value = 0;
            try {
                let expression = f.formula;

                // Replace parameter names with values
                Object.entries(parameters).forEach(([key, val]) => {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    expression = expression.replace(regex, val.toString());
                });

                // Replace math functions
                expression = expression
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/sqrt\(/g, 'Math.sqrt(')
                    .replace(/abs\(/g, 'Math.abs(')
                    .replace(/pow\(/g, 'Math.pow(')
                    .replace(/\^/g, '**')
                    .replace(/π/g, 'Math.PI')
                    .replace(/pi/gi, 'Math.PI');

                // Convert degrees to radians for trig functions
                expression = expression.replace(/Math\.(sin|cos|tan)\(([^)]+)\)/g, (match, func, arg) => {
                    if (arg.includes('theta') || arg.includes('angle') || arg.includes('°')) {
                        return `Math.${func}((${arg}) * Math.PI / 180)`;
                    }
                    return match;
                });

                // eslint-disable-next-line no-eval
                value = eval(expression);
                if (isNaN(value) || !isFinite(value)) value = 0;
            } catch {
                value = 0;
            }

            return {
                id: f.outputId,
                name: f.outputName,
                unit: f.outputUnit,
                value,
                formula: f.formula
            };
        });
    }, [experiment?.formulas, parameters]);

    const submitReport = () => {
        if (!user || !experiment) return;

        const aiConclusion = `Dựa trên kết quả thí nghiệm "${experiment.title}", với các thông số đo được: ${results.map(r => `${r.name}: ${r.value.toFixed(2)}${r.unit}`).join(', ')
            }. Kết quả này phù hợp với lý thuyết và công thức tính toán.`;

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
            status: 'pending' as const,
        };

        storage.saveReport(report);
        setShowReportModal(false);
        alert('Báo cáo đã được gửi thành công!');
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

    // Build simulation parameters for ParameterPanel
    const simulationParameters = experiment.parameters?.map(p => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        min: p.min,
        max: p.max,
        step: p.step,
        defaultValue: p.defaultValue
    })) || [];

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
                                        {experiment.simulationType && (
                                            <>
                                                <span>•</span>
                                                <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full">{experiment.simulationType}</span>
                                            </>
                                        )}
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
                                    onClick={resetParameters}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 text-sm font-medium"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl text-sm font-semibold"
                                >
                                    <Play className="w-4 h-4" />
                                    {isRunning ? 'Đang chạy' : 'Chạy Thí Nghiệm'}
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
                            {simulationParameters.length > 0 && (
                                <ParameterPanel
                                    parameters={simulationParameters}
                                    values={parameters}
                                    onChange={updateParameter}
                                    onReset={resetParameters}
                                />
                            )}

                            {/* Instructions */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-secondary-600" />
                                    </div>
                                    <span className="font-semibold text-gray-800">Hướng Dẫn & Mục Tiêu</span>
                                </div>

                                {/* Learning Objectives */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mục tiêu học tập</p>
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

                                {/* Tools */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Dụng cụ</p>
                                    <div className="flex flex-wrap gap-2">
                                        {experiment.tools_instructions.slice(0, 4).map((tool, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                {tool.split('(')[0].trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Formula Card */}
                            {experiment.simulation_config && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Công thức</p>
                                    <pre className="p-3 bg-gray-100 rounded-lg text-sm font-mono text-gray-700 whitespace-pre-wrap">
                                        {experiment.simulation_config}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Canvas & Results */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Simulation Canvas */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                <DynamicSimulationCanvas
                                    simulationType={experiment.simulationType || 'default'}
                                    visualConfig={experiment.visualConfig}
                                    parameters={parameters}
                                    formulas={experiment.formulas}
                                    isRunning={isRunning}
                                />

                                <div className="mt-3 text-center text-xs text-gray-400">
                                    Điều chỉnh tham số ở bên trái để xem mô phỏng thay đổi
                                </div>
                            </div>

                            {/* Results Panel */}
                            {results.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                            <Beaker className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Kết Quả Tính Toán</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {results.map((result) => (
                                            <div
                                                key={result.id}
                                                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
                                            >
                                                <p className="text-xs text-gray-500 mb-1">{result.name}</p>
                                                <p className="text-xl font-bold text-gray-800">
                                                    {result.value.toFixed(2)}
                                                    <span className="text-sm font-normal text-gray-500 ml-1">{result.unit}</span>
                                                </p>
                                                {result.formula && (
                                                    <p className="text-xs text-gray-400 mt-1 font-mono">{result.formula}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Analysis Button */}
                            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Viết Báo Cáo</p>
                                            <p className="text-xs text-gray-500">Ghi lại kết quả thí nghiệm</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Viết Báo Cáo
                                    </button>
                                </div>
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
                                    <p className="text-xs text-gray-500">Ghi lại kết quả của bạn</p>
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

                                {/* Results summary */}
                                {results.length > 0 && (
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Kết quả đo được:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {results.map(r => (
                                                <span key={r.id} className="px-2 py-1 bg-white rounded text-xs">
                                                    {r.name}: <strong>{r.value.toFixed(2)}</strong> {r.unit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
