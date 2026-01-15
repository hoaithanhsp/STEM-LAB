import { SimulationResult } from '../../hooks/useSimulation';
import { CheckCircle, Zap } from 'lucide-react';

interface ResultsPanelProps {
    results: SimulationResult[];
    isRunning: boolean;
}

export default function ResultsPanel({ results, isRunning }: ResultsPanelProps) {
    const getStatusText = (value: number) => {
        if (value === 0) return { text: 'Axit dư', color: 'text-red-600', bg: 'bg-red-100' };
        if (value === 1) return { text: 'Trung hòa', color: 'text-green-600', bg: 'bg-green-100' };
        return { text: 'Bazơ dư', color: 'text-blue-600', bg: 'bg-blue-100' };
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-800">Kết Quả Thực Nghiệm</span>
                </div>
                {isRunning && (
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-700">Live</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {results.map((result) => {
                    // Special handling for status field
                    if (result.id === 'status') {
                        const status = getStatusText(result.value);
                        return (
                            <div key={result.id} className={`rounded-xl ${status.bg} p-3`}>
                                <p className="text-xs text-gray-600 mb-1">{result.name}</p>
                                <p className={`text-lg font-bold ${status.color}`}>{status.text}</p>
                            </div>
                        );
                    }

                    // Special handling for boolean fields
                    if (result.id === 'totalReflection') {
                        return (
                            <div key={result.id} className={`rounded-xl p-3 ${result.value ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                                <p className="text-xs text-gray-600 mb-1">{result.name}</p>
                                <p className={`text-lg font-bold ${result.value ? 'text-yellow-700' : 'text-gray-500'}`}>
                                    {result.value ? 'Có' : 'Không'}
                                </p>
                            </div>
                        );
                    }

                    return (
                        <div key={result.id} className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-3">
                            <p className="text-xs text-primary-600 mb-1">{result.name}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-primary-700">{result.value}</span>
                                <span className="text-sm text-primary-500">{result.unit}</span>
                            </div>
                            {result.formula && (
                                <p className="text-xs text-primary-400 mt-1 font-mono">{result.formula}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {results.length === 0 && (
                <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Điều chỉnh tham số để xem kết quả</p>
                </div>
            )}
        </div>
    );
}
