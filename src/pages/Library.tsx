import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockExperiments } from '../data/mockData';
import * as storage from '../services/storage';
import { Experiment } from '../types';
import Layout from '../components/Layout';
import {
    Search, Filter, Clock, Users, Star, ArrowRight,
    ChevronLeft, ChevronRight, X, Beaker
} from 'lucide-react';

export default function Library() {
    const { user } = useAuth();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [refreshKey] = useState(0);

    // Get approved custom experiments
    const approvedCustomExperiments = useMemo(() => {
        return storage.getApprovedCustomExperiments();
    }, [refreshKey]);

    // Combine mock + approved custom experiments
    const allExperiments = useMemo(() => {
        const customAsExperiment: Experiment[] = approvedCustomExperiments.map(exp => ({
            id: exp.id,
            title: exp.title,
            subject: exp.subject,
            difficulty_level: exp.difficulty_level,
            short_description: exp.short_description,
            learning_objectives: exp.learning_objectives,
            tools_instructions: exp.tools_instructions,
            simulation_config: exp.simulation_config,
            estimated_time: exp.estimated_time,
            thumbnail_url: exp.thumbnail_url,
            created_at: exp.created_at,
        }));
        return [...mockExperiments, ...customAsExperiment];
    }, [approvedCustomExperiments]);

    // Get unique subjects from all experiments
    const subjects = useMemo(() => {
        const uniqueSubjects = [...new Set(allExperiments.map(e => e.subject))];
        return uniqueSubjects;
    }, [allExperiments]);

    // Get student progress
    const progressMap = useMemo(() => {
        if (!user) return {};
        const progress = storage.getProgress(user.id);
        const map: Record<string, string> = {};
        progress.forEach(p => {
            map[p.experiment_id] = p.status;
        });
        return map;
    }, [user]);

    // Filter experiments
    const filteredExperiments = useMemo(() => {
        let filtered = allExperiments;

        if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase();
            filtered = filtered.filter(exp =>
                exp.title.toLowerCase().includes(keyword) ||
                exp.subject.toLowerCase().includes(keyword) ||
                exp.short_description.toLowerCase().includes(keyword)
            );
        }

        if (selectedSubject) {
            filtered = filtered.filter(exp => exp.subject === selectedSubject);
        }

        if (selectedDifficulty) {
            filtered = filtered.filter(exp => exp.difficulty_level === selectedDifficulty);
        }

        return filtered;
    }, [searchKeyword, selectedSubject, selectedDifficulty, allExperiments]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const totalPages = Math.ceil(filteredExperiments.length / pageSize);
    const paginatedExperiments = filteredExperiments.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getStatusText = (experimentId: string) => {
        const status = progressMap[experimentId];
        if (status === 'completed') return 'Hoàn thành';
        if (status === 'in_progress') return 'Đang làm';
        return 'Chưa làm';
    };

    const getStatusClass = (experimentId: string) => {
        const status = progressMap[experimentId];
        if (status === 'completed') return 'bg-green-100 text-green-700';
        if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-600';
    };

    const getDifficultyColor = (difficulty: string) => {
        if (difficulty === 'Dễ') return 'text-green-600';
        if (difficulty === 'Trung bình') return 'text-yellow-600';
        return 'text-red-600';
    };

    const getButtonText = (experimentId: string) => {
        const status = progressMap[experimentId];
        if (status === 'completed') return 'Xem lại';
        if (status === 'in_progress') return 'Tiếp tục';
        return 'Bắt đầu';
    };

    const resetFilters = () => {
        setSearchKeyword('');
        setSelectedSubject('');
        setSelectedDifficulty('');
        setCurrentPage(1);
    };

    return (
        <Layout>
            <div className="p-4 pb-24 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Thư Viện Thí Nghiệm</h1>
                    <p className="text-gray-500">Khám phá thế giới khoa học qua các thí nghiệm ảo</p>
                </div>

                {/* Search & Filter Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 mb-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">Tìm kiếm & Lọc</span>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                            placeholder="Tìm thí nghiệm theo tên..."
                            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {searchKeyword && (
                            <button
                                onClick={() => setSearchKeyword('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Môn học</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
                                className="w-full py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                            >
                                <option value="">Tất cả môn</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Độ khó</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
                                className="w-full py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                            >
                                <option value="">Tất cả độ khó</option>
                                <option value="Dễ">Dễ</option>
                                <option value="Trung bình">Trung bình</option>
                                <option value="Khó">Khó</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Filter className="w-4 h-4 text-red-500" />
                            {filteredExperiments.length} thí nghiệm có sẵn
                        </div>
                        {(searchKeyword || selectedSubject || selectedDifficulty) && (
                            <button
                                onClick={resetFilters}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Experiment Grid */}
                {paginatedExperiments.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {paginatedExperiments.map((experiment, index) => (
                                <motion.div
                                    key={experiment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass rounded-2xl overflow-hidden card-hover"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100">
                                        {experiment.thumbnail_url ? (
                                            <img
                                                src={experiment.thumbnail_url}
                                                alt={experiment.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Beaker className="w-12 h-12 text-primary-400" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Subject Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                                                {experiment.subject}
                                            </span>
                                        </div>

                                        {/* Difficulty */}
                                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            <span className={`text-xs font-medium ${getDifficultyColor(experiment.difficulty_level)}`}>
                                                {experiment.difficulty_level}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        {progressMap[experiment.id] === 'completed' && (
                                            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">
                                            {experiment.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                            {experiment.short_description}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {experiment.estimated_time} phút
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                0 HS
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                4.8
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusClass(experiment.id)}`}>
                                                {getStatusText(experiment.id)}
                                            </span>
                                            <Link
                                                to={experiment.id.startsWith('custom_')
                                                    ? `/experiment/custom/${experiment.id}`
                                                    : `/experiment/${experiment.id}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
                                            >
                                                {getButtonText(experiment.id)}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${currentPage === page
                                                ? 'bg-primary-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="glass rounded-2xl p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                            <Beaker className="w-10 h-10 text-primary-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Không tìm thấy thí nghiệm</h3>
                        <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
