import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as gemini from '../services/geminiService';
import * as storage from '../services/storage';
import Layout from '../components/Layout';
import {
    ArrowLeft, Upload, FileText, Image, Sparkles, Check, X,
    AlertCircle, Key, Eye, EyeOff, Beaker, Loader2
} from 'lucide-react';

export default function CreateExperiment() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<'upload' | 'generating' | 'preview' | 'success'>('upload');
    const [uploadType, setUploadType] = useState<'text' | 'image'>('text');
    const [textContent, setTextContent] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [generatedExperiment, setGeneratedExperiment] = useState<gemini.GeneratedExperiment | null>(null);

    // API Key modal
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState(gemini.getApiKey() || '');
    const [showKey, setShowKey] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            setUploadType('image');
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setImagePreview(result);
                // Extract base64 without data URL prefix
                setImageBase64(result.split(',')[1]);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'text/plain' || file.type === 'application/pdf') {
            setUploadType('text');
            const reader = new FileReader();
            reader.onload = (event) => {
                setTextContent(event.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleGenerate = async () => {
        // Check API key
        if (!gemini.getApiKey()) {
            setShowApiKeyModal(true);
            return;
        }

        if (uploadType === 'text' && !textContent.trim()) {
            setError('Vui lòng nhập nội dung hoặc tải file');
            return;
        }

        if (uploadType === 'image' && !imageBase64) {
            setError('Vui lòng tải ảnh lên');
            return;
        }

        setError('');
        setStep('generating');

        try {
            let result: gemini.GeneratedExperiment;

            if (uploadType === 'image' && imageBase64) {
                result = await gemini.analyzeImage(imageBase64);
            } else {
                result = await gemini.analyzeAndGenerateExperiment(textContent, 'text');
            }

            setGeneratedExperiment(result);
            setStep('preview');
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === 'API_KEY_REQUIRED' || error.message === 'API_KEY_INVALID') {
                setShowApiKeyModal(true);
                setStep('upload');
            } else {
                setError(error.message || 'Đã xảy ra lỗi khi tạo thí nghiệm');
                setStep('upload');
            }
        }
    };

    const handleSaveExperiment = () => {
        if (!generatedExperiment || !user) return;

        // Get existing custom experiments
        const customExperimentsStr = localStorage.getItem('stem_lab_custom_experiments');
        const customExperiments = customExperimentsStr ? JSON.parse(customExperimentsStr) : [];

        // Create new experiment
        const newExperiment = {
            id: `custom_${storage.generateId()}`,
            ...generatedExperiment,
            thumbnail_url: imagePreview || undefined,
            created_at: new Date().toISOString(),
            created_by: user.id,
        };

        customExperiments.push(newExperiment);
        localStorage.setItem('stem_lab_custom_experiments', JSON.stringify(customExperiments));

        setStep('success');
    };

    const saveApiKey = () => {
        if (apiKey.trim()) {
            gemini.setApiKey(apiKey.trim());
            setShowApiKeyModal(false);
        }
    };

    // Redirect if not admin
    if (user?.role !== 'admin') {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Quyền truy cập bị từ chối</h2>
                        <p className="text-gray-500 mb-4">Chỉ giáo viên mới có thể tạo thí nghiệm mới</p>
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

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-800">Tạo Thí Nghiệm AI</p>
                                <p className="text-xs text-gray-500">Tự động sinh mô phỏng từ giáo án</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowApiKeyModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                        >
                            <Key className="w-4 h-4" />
                            {gemini.getApiKey() ? 'Đổi API Key' : 'Nhập API Key'}
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Step: Upload */}
                    {step === 'upload' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Upload Type Toggle */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <p className="text-sm font-medium text-gray-700 mb-3">Chọn loại nội dung</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setUploadType('text')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${uploadType === 'text'
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span className="font-medium">Văn bản / PDF</span>
                                    </button>
                                    <button
                                        onClick={() => setUploadType('image')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${uploadType === 'image'
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <Image className="w-5 h-5" />
                                        <span className="font-medium">Hình ảnh</span>
                                    </button>
                                </div>
                            </div>

                            {/* Content Input */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                {uploadType === 'text' ? (
                                    <>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium text-gray-700">Nội dung giáo án / sách giáo khoa</p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Tải file .txt
                                            </button>
                                        </div>
                                        <textarea
                                            value={textContent}
                                            onChange={(e) => setTextContent(e.target.value)}
                                            placeholder="Dán nội dung từ giáo án, sách giáo khoa hoặc tài liệu tham khảo vào đây...

Ví dụ: 
Định luật Ohm phát biểu rằng cường độ dòng điện chạy qua một đoạn mạch tỉ lệ thuận với hiệu điện thế đặt vào hai đầu đoạn mạch và tỉ lệ nghịch với điện trở của đoạn mạch đó.
Công thức: I = U/R
Trong đó: I là cường độ dòng điện (A), U là hiệu điện thế (V), R là điện trở (Ω)"
                                            rows={10}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                                        />
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-3">Tải ảnh giáo án / sách giáo khoa</p>

                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-64 object-contain bg-gray-100 rounded-xl"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setImageBase64(null);
                                                    }}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary-400 hover:bg-primary-50 transition-all"
                                            >
                                                <Upload className="w-10 h-10 text-gray-400" />
                                                <div className="text-center">
                                                    <p className="text-gray-600 font-medium">Kéo thả hoặc click để tải ảnh</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG tối đa 10MB</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={uploadType === 'image' ? 'image/*' : '.txt,.pdf'}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={uploadType === 'text' ? !textContent.trim() : !imageBase64}
                                className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Tạo Thí Nghiệm với AI
                            </button>
                        </motion.div>
                    )}

                    {/* Step: Generating */}
                    {step === 'generating' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang phân tích và tạo mô phỏng...</h2>
                            <p className="text-gray-500">AI đang xử lý nội dung của bạn</p>
                        </motion.div>
                    )}

                    {/* Step: Preview */}
                    {step === 'preview' && generatedExperiment && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <Check className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-800">Thí nghiệm đã được tạo thành công!</p>
                                    <p className="text-sm text-green-700">Xem lại và xác nhận để lưu vào thư viện</p>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                                            {generatedExperiment.subject}
                                        </span>
                                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                                            {generatedExperiment.difficulty_level}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{generatedExperiment.title}</h2>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Mô tả</p>
                                        <p className="text-gray-600 text-sm">{generatedExperiment.short_description}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Mục tiêu học tập</p>
                                        <ul className="space-y-1">
                                            {generatedExperiment.learning_objectives.map((obj, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                                                    {obj}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Tham số điều chỉnh</p>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedExperiment.parameters.map((param) => (
                                                <span key={param.id} className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                                    {param.name} ({param.min}-{param.max} {param.unit})
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Công thức</p>
                                        <pre className="p-3 bg-gray-100 rounded-lg text-sm font-mono text-gray-700">
                                            {generatedExperiment.simulation_config}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl"
                                >
                                    Tạo lại
                                </button>
                                <button
                                    onClick={handleSaveExperiment}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Lưu vào Thư viện
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h2>
                            <p className="text-gray-500 mb-8">Thí nghiệm đã được lưu vào thư viện</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setStep('upload');
                                        setTextContent('');
                                        setImagePreview(null);
                                        setImageBase64(null);
                                        setGeneratedExperiment(null);
                                    }}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl"
                                >
                                    Tạo thêm
                                </button>
                                <button
                                    onClick={() => navigate('/library')}
                                    className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2"
                                >
                                    <Beaker className="w-5 h-5" />
                                    Xem Thư viện
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* API Key Modal */}
                {showApiKeyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                                        <Key className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Gemini API Key</h3>
                                        <p className="text-xs text-gray-500">Để sử dụng tính năng AI</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowApiKeyModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Lấy API Key miễn phí tại{' '}
                                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
                                        Google AI Studio
                                    </a>
                                </p>

                                <div className="relative mb-4">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Nhập API Key..."
                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button
                                    onClick={saveApiKey}
                                    disabled={!apiKey.trim()}
                                    className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl disabled:opacity-50"
                                >
                                    Lưu API Key
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
