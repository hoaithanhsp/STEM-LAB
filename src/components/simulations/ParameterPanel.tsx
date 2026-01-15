import { SimulationParameter } from '../../hooks/useSimulation';

interface ParameterPanelProps {
    parameters: SimulationParameter[];
    values: Record<string, number>;
    onChange: (id: string, value: number) => void;
    onReset: () => void;
}

export default function ParameterPanel({ parameters, values, onChange, onReset }: ParameterPanelProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-800">Tham Số Thí Nghiệm</span>
                </div>
                <button
                    onClick={onReset}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                </button>
            </div>

            <div className="space-y-4">
                {parameters.map((param) => (
                    <div key={param.id}>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                {param.name}
                            </label>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-primary-600">
                                    {values[param.id]?.toFixed(param.step < 1 ? 1 : 0) || param.defaultValue}
                                </span>
                                <span className="text-xs text-gray-500">{param.unit}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={values[param.id] || param.defaultValue}
                                onChange={(e) => onChange(param.id, parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                            />
                            <div
                                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg pointer-events-none"
                                style={{
                                    width: `${((values[param.id] || param.defaultValue) - param.min) / (param.max - param.min) * 100}%`
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{param.min} {param.unit}</span>
                            <span>{param.max} {param.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          position: relative;
          z-index: 10;
        }
        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        }
      `}</style>
        </div>
    );
}
