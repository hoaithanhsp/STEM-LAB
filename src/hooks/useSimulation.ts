import { useState, useEffect, useCallback } from 'react';

// Simulation config type
export interface SimulationParameter {
    id: string;
    name: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
}

export interface SimulationResult {
    id: string;
    name: string;
    unit: string;
    value: number;
    formula?: string;
}

export interface SimulationConfig {
    type: string;
    parameters: SimulationParameter[];
    calculateResults: (params: Record<string, number>) => SimulationResult[];
}

// ============= ĐỊNH LUẬT OHM =============
export const ohmLawSimulation: SimulationConfig = {
    type: 'ohm_law',
    parameters: [
        { id: 'voltage', name: 'Điện áp', unit: 'V', min: 0, max: 12, step: 0.5, defaultValue: 6 },
        { id: 'resistance', name: 'Điện trở', unit: 'Ω', min: 1, max: 100, step: 1, defaultValue: 20 },
    ],
    calculateResults: (params) => {
        const voltage = params.voltage || 6;
        const resistance = params.resistance || 20;
        const current = voltage / resistance;
        const power = voltage * current;

        return [
            { id: 'current', name: 'Dòng điện', unit: 'A', value: Number(current.toFixed(3)), formula: 'I = U/R' },
            { id: 'power', name: 'Công suất', unit: 'W', value: Number(power.toFixed(3)), formula: 'P = U×I' },
        ];
    },
};

// ============= PHẢN ỨNG AXIT-BAZƠ =============
export const acidBaseSimulation: SimulationConfig = {
    type: 'acid_base',
    parameters: [
        { id: 'acidConc', name: 'Nồng độ HCl', unit: 'M', min: 0.1, max: 2, step: 0.1, defaultValue: 1 },
        { id: 'baseConc', name: 'Nồng độ NaOH', unit: 'M', min: 0.1, max: 2, step: 0.1, defaultValue: 1 },
        { id: 'acidVolume', name: 'Thể tích Acid', unit: 'ml', min: 10, max: 100, step: 5, defaultValue: 50 },
        { id: 'baseVolume', name: 'Thể tích Base', unit: 'ml', min: 10, max: 100, step: 5, defaultValue: 30 },
    ],
    calculateResults: (params) => {
        const acidConc = params.acidConc || 1;
        const baseConc = params.baseConc || 1;
        const acidVolume = params.acidVolume || 50;
        const baseVolume = params.baseVolume || 30;

        const acidMoles = acidConc * acidVolume / 1000;
        const baseMoles = baseConc * baseVolume / 1000;
        const totalVolume = (acidVolume + baseVolume) / 1000;

        let pH: number;
        let status: number;

        if (Math.abs(acidMoles - baseMoles) < 0.0001) {
            pH = 7;
            status = 1; // Trung hòa
        } else if (acidMoles > baseMoles) {
            const excessH = (acidMoles - baseMoles) / totalVolume;
            pH = -Math.log10(excessH);
            status = 0; // Axit dư
        } else {
            const excessOH = (baseMoles - acidMoles) / totalVolume;
            const pOH = -Math.log10(excessOH);
            pH = 14 - pOH;
            status = 2; // Bazơ dư
        }

        return [
            { id: 'ph', name: 'pH', unit: '', value: Number(pH.toFixed(2)) },
            { id: 'status', name: 'Trạng thái', unit: '', value: status },
            { id: 'acidMoles', name: 'Mol HCl', unit: 'mol', value: Number(acidMoles.toFixed(4)) },
            { id: 'baseMoles', name: 'Mol NaOH', unit: 'mol', value: Number(baseMoles.toFixed(4)) },
        ];
    },
};

// ============= TẾ BÀO THỰC VẬT =============
export const plantCellSimulation: SimulationConfig = {
    type: 'plant_cell',
    parameters: [
        { id: 'zoom', name: 'Độ phóng đại', unit: 'x', min: 100, max: 400, step: 50, defaultValue: 100 },
        { id: 'stain', name: 'Thuốc nhuộm', unit: '%', min: 0, max: 100, step: 10, defaultValue: 50 },
    ],
    calculateResults: (params) => {
        const zoom = params.zoom || 100;
        const stain = params.stain || 50;
        const visibility = Math.min(100, (zoom / 400) * 100 + stain * 0.3);

        return [
            { id: 'visibility', name: 'Độ rõ nét', unit: '%', value: Number(visibility.toFixed(1)) },
            { id: 'cellSize', name: 'Kích thước ảnh', unit: 'μm', value: Number((100 / zoom * 50).toFixed(1)) },
        ];
    },
};

// ============= CON LẮC ĐƠN =============
export const pendulumSimulation: SimulationConfig = {
    type: 'pendulum',
    parameters: [
        { id: 'length', name: 'Chiều dài dây', unit: 'm', min: 0.1, max: 2, step: 0.1, defaultValue: 1 },
        { id: 'angle', name: 'Góc lệch ban đầu', unit: '°', min: 5, max: 45, step: 5, defaultValue: 15 },
        { id: 'gravity', name: 'Gia tốc g', unit: 'm/s²', min: 1, max: 20, step: 0.5, defaultValue: 9.8 },
    ],
    calculateResults: (params) => {
        const length = params.length || 1;
        const gravity = params.gravity || 9.8;

        const period = 2 * Math.PI * Math.sqrt(length / gravity);
        const frequency = 1 / period;
        const omega = Math.sqrt(gravity / length);

        return [
            { id: 'period', name: 'Chu kỳ', unit: 's', value: Number(period.toFixed(3)), formula: 'T = 2π√(l/g)' },
            { id: 'frequency', name: 'Tần số', unit: 'Hz', value: Number(frequency.toFixed(3)), formula: 'f = 1/T' },
            { id: 'omega', name: 'Tần số góc', unit: 'rad/s', value: Number(omega.toFixed(3)), formula: 'ω = √(g/l)' },
        ];
    },
};

// ============= KHÚC XẠ ÁNH SÁNG =============
export const refractionSimulation: SimulationConfig = {
    type: 'refraction',
    parameters: [
        { id: 'incidentAngle', name: 'Góc tới', unit: '°', min: 0, max: 85, step: 5, defaultValue: 30 },
        { id: 'n1', name: 'Chiết suất môi trường 1', unit: '', min: 1, max: 2, step: 0.1, defaultValue: 1 },
        { id: 'n2', name: 'Chiết suất môi trường 2', unit: '', min: 1, max: 2.5, step: 0.1, defaultValue: 1.5 },
    ],
    calculateResults: (params) => {
        const incidentAngle = params.incidentAngle || 30;
        const n1 = params.n1 || 1;
        const n2 = params.n2 || 1.5;

        const incidentRad = incidentAngle * Math.PI / 180;
        const sinRefracted = (n1 / n2) * Math.sin(incidentRad);

        let refractedAngle: number;
        let totalReflection = false;

        if (sinRefracted > 1) {
            totalReflection = true;
            refractedAngle = 90;
        } else {
            refractedAngle = Math.asin(sinRefracted) * 180 / Math.PI;
        }

        const criticalAngle = n1 < n2 ? 90 : Math.asin(n2 / n1) * 180 / Math.PI;

        return [
            { id: 'refractedAngle', name: 'Góc khúc xạ', unit: '°', value: Number(refractedAngle.toFixed(1)), formula: 'n₁sinθ₁ = n₂sinθ₂' },
            { id: 'criticalAngle', name: 'Góc tới hạn', unit: '°', value: Number(criticalAngle.toFixed(1)) },
            { id: 'totalReflection', name: 'Phản xạ toàn phần', unit: '', value: totalReflection ? 1 : 0 },
        ];
    },
};

// ============= ĐIỆN PHÂN =============
export const electrolysisSimulation: SimulationConfig = {
    type: 'electrolysis',
    parameters: [
        { id: 'current', name: 'Cường độ dòng điện', unit: 'A', min: 0.1, max: 5, step: 0.1, defaultValue: 1 },
        { id: 'time', name: 'Thời gian', unit: 'phút', min: 1, max: 60, step: 1, defaultValue: 30 },
    ],
    calculateResults: (params) => {
        const current = params.current || 1;
        const timeMinutes = params.time || 30;
        const timeSeconds = timeMinutes * 60;

        // Faraday constant
        const F = 96485;
        // Cu: M = 64, n = 2
        const massCu = (64 * current * timeSeconds) / (2 * F);
        // O2: M = 32, n = 4
        const massO2 = (32 * current * timeSeconds) / (4 * F);
        const volumeO2 = (massO2 / 32) * 22.4;

        return [
            { id: 'massCu', name: 'Khối lượng Cu', unit: 'g', value: Number(massCu.toFixed(3)), formula: 'm = (M×I×t)/(n×F)' },
            { id: 'volumeO2', name: 'Thể tích O₂ (đktc)', unit: 'L', value: Number(volumeO2.toFixed(3)) },
            { id: 'charge', name: 'Điện lượng', unit: 'C', value: Number((current * timeSeconds).toFixed(1)), formula: 'Q = I×t' },
        ];
    },
};

// Map experiment ID to simulation config
export const simulationConfigs: Record<string, SimulationConfig> = {
    '1': ohmLawSimulation,
    '2': acidBaseSimulation,
    '3': plantCellSimulation,
    '4': pendulumSimulation,
    '5': refractionSimulation,
    '6': electrolysisSimulation,
};

// Custom hook for simulation
export function useSimulation(experimentId: string) {
    const config = simulationConfigs[experimentId];

    const [parameters, setParameters] = useState<Record<string, number>>(() => {
        if (!config) return {};
        const initial: Record<string, number> = {};
        config.parameters.forEach(p => {
            initial[p.id] = p.defaultValue;
        });
        return initial;
    });

    const [results, setResults] = useState<SimulationResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const updateParameter = useCallback((id: string, value: number) => {
        setParameters(prev => ({ ...prev, [id]: value }));
    }, []);

    const reset = useCallback(() => {
        if (!config) return;
        const initial: Record<string, number> = {};
        config.parameters.forEach(p => {
            initial[p.id] = p.defaultValue;
        });
        setParameters(initial);
        setIsRunning(false);
    }, [config]);

    const run = useCallback(() => {
        setIsRunning(true);
    }, []);

    // Calculate results whenever parameters change
    useEffect(() => {
        if (config && isRunning) {
            const newResults = config.calculateResults(parameters);
            setResults(newResults);
        }
    }, [config, parameters, isRunning]);

    // Auto-run on mount
    useEffect(() => {
        if (config) {
            setIsRunning(true);
            const newResults = config.calculateResults(parameters);
            setResults(newResults);
        }
    }, []);

    return {
        config,
        parameters,
        results,
        isRunning,
        updateParameter,
        reset,
        run,
    };
}
