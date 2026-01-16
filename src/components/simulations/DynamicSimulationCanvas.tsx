import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SimulationType, VisualConfig } from '../../types';

interface DynamicSimulationCanvasProps {
    simulationType: SimulationType;
    visualConfig?: VisualConfig;
    parameters: Record<string, number>;
    formulas?: {
        outputId: string;
        outputName: string;
        outputUnit: string;
        formula: string;
    }[];
    isRunning: boolean;
}

// Safe math evaluation
function evaluateFormula(formula: string, params: Record<string, number>): number {
    try {
        let expression = formula;

        // Replace parameter names with values
        Object.entries(params).forEach(([key, value]) => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            expression = expression.replace(regex, value.toString());
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
            // Check if the argument appears to be in degrees (contains theta, angle, or similar)
            if (arg.includes('theta') || arg.includes('angle') || arg.includes('°')) {
                return `Math.${func}((${arg}) * Math.PI / 180)`;
            }
            return match;
        });

        // eslint-disable-next-line no-eval
        const result = eval(expression);
        return isNaN(result) || !isFinite(result) ? 0 : result;
    } catch {
        return 0;
    }
}

export default function DynamicSimulationCanvas({
    simulationType,
    visualConfig,
    parameters,
    formulas,
    isRunning
}: DynamicSimulationCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [animationFrame, setAnimationFrame] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setAnimationFrame(f => (f + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, [isRunning]);

    // Calculate results from formulas
    const results = useMemo(() => {
        if (!formulas) return [];
        return formulas.map(f => ({
            ...f,
            value: evaluateFormula(f.formula, parameters)
        }));
    }, [formulas, parameters]);

    // Render different simulations based on type
    const renderSimulation = () => {
        switch (simulationType) {
            case 'projectile':
                return <ProjectileSimulation params={parameters} config={visualConfig} frame={animationFrame} />;
            case 'parabola':
            case 'quadratic':
                return <ParabolaSimulation params={parameters} config={visualConfig} frame={animationFrame} />;
            case 'linear':
                return <LinearSimulation params={parameters} config={visualConfig} />;
            case 'graph':
                return <GraphSimulation params={parameters} config={visualConfig} />;
            case 'pendulum':
                return <PendulumSimulation params={parameters} frame={animationFrame} />;
            case 'wave':
                return <WaveSimulation params={parameters} frame={animationFrame} config={visualConfig} />;
            case 'circuit':
                return <CircuitSimulation params={parameters} frame={animationFrame} />;
            case 'chemistry':
                return <ChemistrySimulation params={parameters} frame={animationFrame} />;
            default:
                return <DefaultSimulation config={visualConfig} results={results} />;
        }
    };

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden"
        >
            {/* Grid background */}
            {visualConfig?.showGrid !== false && (
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />
            )}

            {renderSimulation()}

            {/* Status overlay */}
            {isRunning && (
                <div className="absolute bottom-3 left-3 bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Mô phỏng đang chạy</span>
                </div>
            )}

            {/* Results overlay */}
            {results.length > 0 && (
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 space-y-1">
                    {results.slice(0, 3).map((r) => (
                        <div key={r.outputId} className="text-xs">
                            <span className="text-gray-400">{r.outputName}: </span>
                            <span className="text-white font-mono">{r.value.toFixed(2)}</span>
                            <span className="text-gray-400 ml-1">{r.outputUnit}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============= PROJECTILE (NÉM XIÊN) SIMULATION =============
function ProjectileSimulation({
    params,
    config,
    frame
}: {
    params: Record<string, number>;
    config?: VisualConfig;
    frame: number;
}) {
    const v0 = params.v0 || params.velocity || 20;
    const theta = (params.theta || params.angle || 45) * Math.PI / 180;
    const g = params.g || params.gravity || 9.8;

    // Calculate trajectory points
    const points: { x: number; y: number }[] = [];
    const maxT = (2 * v0 * Math.sin(theta)) / g;
    const maxX = v0 * Math.cos(theta) * maxT;
    const maxY = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);

    for (let t = 0; t <= maxT; t += maxT / 50) {
        const x = v0 * Math.cos(theta) * t;
        const y = v0 * Math.sin(theta) * t - 0.5 * g * t * t;
        if (y >= 0) points.push({ x, y });
    }

    // Scale to fit
    const padding = 40;
    const width = 400 - 2 * padding;
    const height = 280 - 2 * padding;
    const scaleX = maxX > 0 ? width / maxX : 1;
    const scaleY = maxY > 0 ? height / maxY : 1;
    const scale = Math.min(scaleX, scaleY);

    // Animation - ball position
    const animT = (frame % 100) / 100 * maxT;
    const ballX = v0 * Math.cos(theta) * animT;
    const ballY = v0 * Math.sin(theta) * animT - 0.5 * g * animT * animT;

    const primaryColor = config?.colors?.primary || '#3b82f6';
    const secondaryColor = config?.colors?.secondary || '#10b981';

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 280">
                {/* Axes */}
                <line x1={padding} y1={280 - padding} x2={380} y2={280 - padding} stroke="#6b7280" strokeWidth="2" />
                <line x1={padding} y1={280 - padding} x2={padding} y2={20} stroke="#6b7280" strokeWidth="2" />

                {/* Axis labels */}
                <text x={200} y={275} fill="#9ca3af" fontSize="12" textAnchor="middle">
                    {config?.xAxis?.label || 'x'} ({config?.xAxis?.unit || 'm'})
                </text>
                <text x={15} y={140} fill="#9ca3af" fontSize="12" textAnchor="middle" transform="rotate(-90, 15, 140)">
                    {config?.yAxis?.label || 'y'} ({config?.yAxis?.unit || 'm'})
                </text>

                {/* Trajectory path */}
                <path
                    d={`M ${padding} ${280 - padding} ` + points.map(p =>
                        `L ${padding + p.x * scale} ${280 - padding - p.y * scale}`
                    ).join(' ')}
                    stroke={primaryColor}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5 3"
                />

                {/* Animated ball */}
                {ballY >= 0 && (
                    <motion.circle
                        cx={padding + ballX * scale}
                        cy={280 - padding - ballY * scale}
                        r="8"
                        fill={secondaryColor}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                )}

                {/* Starting point */}
                <circle cx={padding} cy={280 - padding} r="5" fill="#ef4444" />

                {/* Max height indicator */}
                <line
                    x1={padding + (maxX / 2) * scale - 10}
                    y1={280 - padding - maxY * scale}
                    x2={padding + (maxX / 2) * scale + 10}
                    y2={280 - padding - maxY * scale}
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                />
                <text
                    x={padding + (maxX / 2) * scale + 15}
                    y={280 - padding - maxY * scale + 5}
                    fill="#fbbf24"
                    fontSize="10"
                >
                    H = {maxY.toFixed(1)}m
                </text>

                {/* Range indicator */}
                <text
                    x={padding + maxX * scale}
                    y={280 - padding + 15}
                    fill="#10b981"
                    fontSize="10"
                    textAnchor="middle"
                >
                    R = {maxX.toFixed(1)}m
                </text>
            </svg>
        </div>
    );
}

// ============= PARABOLA (HÀM BẬC 2) SIMULATION =============
function ParabolaSimulation({
    params,
    config,
    frame: _frame
}: {
    params: Record<string, number>;
    config?: VisualConfig;
    frame: number;
}) {
    const a = params.a ?? 1;
    const b = params.b ?? 0;
    const c = params.c ?? 0;

    // Vertex
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    // Calculate points
    const points: { x: number; y: number }[] = [];
    const xMin = config?.xAxis?.min ?? -10;
    const xMax = config?.xAxis?.max ?? 10;

    for (let x = xMin; x <= xMax; x += 0.2) {
        const y = a * x * x + b * x + c;
        points.push({ x, y });
    }

    // Scale
    const padding = 50;
    const width = 400 - 2 * padding;
    const height = 280 - 2 * padding;
    const yValues = points.map(p => p.y);
    const yMin = Math.min(...yValues, 0);
    const yMax = Math.max(...yValues, 0);
    const yRange = yMax - yMin || 1;

    const scaleX = width / (xMax - xMin);
    const scaleY = height / yRange;

    const toSvgX = (x: number) => padding + (x - xMin) * scaleX;
    const toSvgY = (y: number) => 280 - padding - (y - yMin) * scaleY;

    const primaryColor = config?.colors?.primary || '#8b5cf6';

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 280">
                {/* Grid */}
                {Array.from({ length: 11 }, (_, i) => {
                    const x = xMin + (xMax - xMin) * i / 10;
                    return (
                        <line
                            key={`vgrid-${i}`}
                            x1={toSvgX(x)}
                            y1={padding}
                            x2={toSvgX(x)}
                            y2={280 - padding}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Axes */}
                <line x1={padding} y1={toSvgY(0)} x2={400 - padding} y2={toSvgY(0)} stroke="#6b7280" strokeWidth="2" />
                <line x1={toSvgX(0)} y1={padding} x2={toSvgX(0)} y2={280 - padding} stroke="#6b7280" strokeWidth="2" />

                {/* Arrow heads */}
                <polygon points={`${400 - padding},${toSvgY(0)} ${390 - padding},${toSvgY(0) - 5} ${390 - padding},${toSvgY(0) + 5}`} fill="#6b7280" />
                <polygon points={`${toSvgX(0)},${padding} ${toSvgX(0) - 5},${padding + 10} ${toSvgX(0) + 5},${padding + 10}`} fill="#6b7280" />

                {/* Labels */}
                <text x={395 - padding} y={toSvgY(0) - 10} fill="#9ca3af" fontSize="12">x</text>
                <text x={toSvgX(0) + 10} y={padding + 5} fill="#9ca3af" fontSize="12">y</text>

                {/* Parabola curve */}
                <path
                    d={`M ${toSvgX(points[0].x)} ${toSvgY(points[0].y)} ` +
                        points.slice(1).map(p => `L ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' ')}
                    stroke={primaryColor}
                    strokeWidth="3"
                    fill="none"
                />

                {/* Vertex point */}
                <circle cx={toSvgX(vertexX)} cy={toSvgY(vertexY)} r="6" fill="#ef4444" />
                <text x={toSvgX(vertexX) + 10} y={toSvgY(vertexY) - 10} fill="#ef4444" fontSize="10">
                    Đỉnh ({vertexX.toFixed(1)}, {vertexY.toFixed(1)})
                </text>

                {/* Axis of symmetry */}
                <line
                    x1={toSvgX(vertexX)}
                    y1={padding}
                    x2={toSvgX(vertexX)}
                    y2={280 - padding}
                    stroke="#fbbf24"
                    strokeWidth="1"
                    strokeDasharray="5 5"
                />

                {/* Formula display */}
                {config?.showFormula !== false && (
                    <text x={padding + 10} y={padding + 20} fill="#ffffff" fontSize="14" fontWeight="bold">
                        y = {a !== 1 ? (a === -1 ? '-' : a) : ''}x² {b >= 0 ? `+ ${b}` : b}x {c >= 0 ? `+ ${c}` : c}
                    </text>
                )}
            </svg>
        </div>
    );
}

// ============= LINEAR (ĐƯỜNG THẲNG) SIMULATION =============
function LinearSimulation({
    params,
    config
}: {
    params: Record<string, number>;
    config?: VisualConfig;
}) {
    const a = params.a ?? 1;
    const b = params.b ?? 0;

    const xMin = config?.xAxis?.min ?? -10;
    const xMax = config?.xAxis?.max ?? 10;

    const y1 = a * xMin + b;
    const y2 = a * xMax + b;

    const padding = 50;
    const width = 400 - 2 * padding;
    const height = 280 - 2 * padding;

    const yMin = Math.min(y1, y2, -5);
    const yMax = Math.max(y1, y2, 5);
    const yRange = yMax - yMin || 1;

    const scaleX = width / (xMax - xMin);
    const scaleY = height / yRange;

    const toSvgX = (x: number) => padding + (x - xMin) * scaleX;
    const toSvgY = (y: number) => 280 - padding - (y - yMin) * scaleY;

    // X-intercept
    const xIntercept = a !== 0 ? -b / a : 0;

    const primaryColor = config?.colors?.primary || '#10b981';

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 280">
                {/* Axes */}
                <line x1={padding} y1={toSvgY(0)} x2={400 - padding} y2={toSvgY(0)} stroke="#6b7280" strokeWidth="2" />
                <line x1={toSvgX(0)} y1={padding} x2={toSvgX(0)} y2={280 - padding} stroke="#6b7280" strokeWidth="2" />

                {/* Labels */}
                <text x={395 - padding} y={toSvgY(0) - 10} fill="#9ca3af" fontSize="12">x</text>
                <text x={toSvgX(0) + 10} y={padding + 5} fill="#9ca3af" fontSize="12">y</text>

                {/* Line */}
                <line
                    x1={toSvgX(xMin)}
                    y1={toSvgY(y1)}
                    x2={toSvgX(xMax)}
                    y2={toSvgY(y2)}
                    stroke={primaryColor}
                    strokeWidth="3"
                />

                {/* Y-intercept */}
                <circle cx={toSvgX(0)} cy={toSvgY(b)} r="5" fill="#3b82f6" />
                <text x={toSvgX(0) + 10} y={toSvgY(b) - 5} fill="#3b82f6" fontSize="10">
                    (0, {b})
                </text>

                {/* X-intercept */}
                {a !== 0 && xIntercept >= xMin && xIntercept <= xMax && (
                    <>
                        <circle cx={toSvgX(xIntercept)} cy={toSvgY(0)} r="5" fill="#ef4444" />
                        <text x={toSvgX(xIntercept)} y={toSvgY(0) + 20} fill="#ef4444" fontSize="10" textAnchor="middle">
                            ({xIntercept.toFixed(1)}, 0)
                        </text>
                    </>
                )}

                {/* Formula */}
                {config?.showFormula !== false && (
                    <text x={padding + 10} y={padding + 20} fill="#ffffff" fontSize="14" fontWeight="bold">
                        y = {a !== 1 ? (a === -1 ? '-' : a) : ''}x {b >= 0 ? `+ ${b}` : b}
                    </text>
                )}
            </svg>
        </div>
    );
}

// ============= GRAPH (ĐỒ THỊ TỔNG QUÁT) SIMULATION =============
function GraphSimulation({
    params,
    config
}: {
    params: Record<string, number>;
    config?: VisualConfig;
}) {
    const equation = config?.curveEquation || 'x';

    const xMin = config?.xAxis?.min ?? -10;
    const xMax = config?.xAxis?.max ?? 10;

    const points: { x: number; y: number }[] = [];
    for (let x = xMin; x <= xMax; x += 0.2) {
        const y = evaluateFormula(equation.replace(/y\s*=/i, ''), { ...params, x });
        if (isFinite(y)) points.push({ x, y });
    }

    if (points.length === 0) {
        return <DefaultSimulation config={config} results={[]} />;
    }

    const padding = 50;
    const width = 400 - 2 * padding;
    const height = 280 - 2 * padding;

    const yValues = points.map(p => p.y);
    const yMin = Math.min(...yValues, -1);
    const yMax = Math.max(...yValues, 1);
    const yRange = yMax - yMin || 1;

    const scaleX = width / (xMax - xMin);
    const scaleY = height / yRange;

    const toSvgX = (x: number) => padding + (x - xMin) * scaleX;
    const toSvgY = (y: number) => 280 - padding - (y - yMin) * scaleY;

    const primaryColor = config?.colors?.primary || '#f59e0b';

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 280">
                {/* Axes */}
                <line x1={padding} y1={toSvgY(0)} x2={400 - padding} y2={toSvgY(0)} stroke="#6b7280" strokeWidth="2" />
                <line x1={toSvgX(0)} y1={padding} x2={toSvgX(0)} y2={280 - padding} stroke="#6b7280" strokeWidth="2" />

                {/* Curve */}
                <path
                    d={`M ${toSvgX(points[0].x)} ${toSvgY(points[0].y)} ` +
                        points.slice(1).map(p => `L ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' ')}
                    stroke={primaryColor}
                    strokeWidth="3"
                    fill="none"
                />

                {/* Formula */}
                {config?.showFormula !== false && (
                    <text x={padding + 10} y={padding + 20} fill="#ffffff" fontSize="12">
                        {config?.curveEquation || 'y = f(x)'}
                    </text>
                )}
            </svg>
        </div>
    );
}

// ============= PENDULUM SIMULATION =============
function PendulumSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
    const length = params.length || params.l || 1;
    const angle = params.angle || params.theta || 15;
    const gravity = params.gravity || params.g || 9.8;

    const omega = Math.sqrt(gravity / length);
    const currentAngle = angle * Math.cos(omega * frame * 0.05);
    const ropeLength = 80 + length * 50;

    const pivotX = 200;
    const pivotY = 30;
    const ballX = pivotX + ropeLength * Math.sin(currentAngle * Math.PI / 180);
    const ballY = pivotY + ropeLength * Math.cos(currentAngle * Math.PI / 180);

    return (
        <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 400 250">
                <circle cx={pivotX} cy={pivotY} r="8" fill="#6b7280" />
                <rect x={pivotX - 30} y={pivotY - 8} width="60" height="8" fill="#4b5563" rx="2" />

                <line x1={pivotX} y1={pivotY} x2={ballX} y2={ballY} stroke="#a3a3a3" strokeWidth="2" />

                <motion.circle
                    cx={ballX}
                    cy={ballY}
                    r="18"
                    fill="url(#ballGradient)"
                />

                <defs>
                    <radialGradient id="ballGradient" cx="30%" cy="30%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </radialGradient>
                </defs>

                <text x={pivotX + 50} y={pivotY + 40} fill="#9ca3af" fontSize="12">
                    θ = {currentAngle.toFixed(1)}°
                </text>
                <text x={pivotX - 80} y={pivotY + ropeLength / 2} fill="#9ca3af" fontSize="12">
                    L = {length}m
                </text>
            </svg>
        </div>
    );
}

// ============= WAVE SIMULATION =============
function WaveSimulation({
    params,
    frame,
    config
}: {
    params: Record<string, number>;
    frame: number;
    config?: VisualConfig;
}) {
    const amplitude = params.amplitude || params.A || 50;
    const wavelength = params.wavelength || params.lambda || 100;
    const frequency = params.frequency || params.f || 1;

    const points: string[] = [];
    for (let x = 0; x <= 400; x += 2) {
        const y = 140 + amplitude * Math.sin((x / wavelength) * 2 * Math.PI - frame * frequency * 0.1);
        points.push(`${x},${y}`);
    }

    const primaryColor = config?.colors?.primary || '#06b6d4';

    return (
        <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 400 280">
                {/* Center line */}
                <line x1="0" y1="140" x2="400" y2="140" stroke="#6b7280" strokeWidth="1" strokeDasharray="5 5" />

                {/* Wave */}
                <polyline
                    points={points.join(' ')}
                    stroke={primaryColor}
                    strokeWidth="3"
                    fill="none"
                />

                {/* Amplitude indicator */}
                <line x1="30" y1={140 - amplitude} x2="30" y2={140 + amplitude} stroke="#fbbf24" strokeWidth="2" />
                <text x="40" y="100" fill="#fbbf24" fontSize="10">A = {amplitude}</text>

                {/* Wavelength indicator */}
                <line x1="100" y1="200" x2={100 + wavelength} y2="200" stroke="#10b981" strokeWidth="2" />
                <text x={100 + wavelength / 2} y="220" fill="#10b981" fontSize="10" textAnchor="middle">λ = {wavelength}</text>
            </svg>
        </div>
    );
}

// ============= CIRCUIT SIMULATION =============
function CircuitSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
    const voltage = params.voltage || params.U || 6;
    const resistance = params.resistance || params.R || 20;
    const current = voltage / resistance;
    const intensity = Math.min(1, current / 0.5);

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Battery */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2">
                <div className="w-16 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 flex flex-col items-center justify-center">
                    <div className="text-yellow-400 text-xs font-bold">{voltage}V</div>
                    <div className="w-8 h-3 bg-yellow-500 rounded mt-1" />
                    <div className="w-4 h-2 bg-yellow-600 rounded-t" />
                </div>
            </div>

            {/* Wire with electrons */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                <path
                    d="M 60 100 L 120 100 L 120 50 L 280 50 L 280 100 L 340 100 L 340 150 L 280 150 L 280 100"
                    stroke="#4ade80"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="10 5"
                    strokeDashoffset={-frame * intensity * 2}
                />
                {[0, 1, 2].map(i => (
                    <circle
                        key={i}
                        cx={60 + ((frame * intensity * 2 + i * 100) % 280)}
                        cy={100 - Math.sin((frame + i * 60) * 0.1) * 30}
                        r={4}
                        fill="#60a5fa"
                    />
                ))}
            </svg>

            {/* Resistor */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2">
                <div className="w-20 h-12 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{resistance}Ω</span>
                </div>
                <div
                    className="absolute inset-0 rounded bg-orange-500 blur-xl"
                    style={{ opacity: intensity * 0.5 }}
                />
            </div>

            {/* Current indicator */}
            <div className="absolute bottom-6 right-6 text-right">
                <p className="text-gray-400 text-xs">Dòng điện</p>
                <p className="text-2xl font-bold text-green-400">{current.toFixed(2)}A</p>
            </div>
        </div>
    );
}

// ============= CHEMISTRY SIMULATION =============
function ChemistrySimulation({ params, frame: _frame }: { params: Record<string, number>; frame: number }) {
    const acidConc = params.acidConc || 1;
    const baseConc = params.baseConc || 1;
    const acidVol = params.acidVolume || 50;
    const baseVol = params.baseVolume || 30;

    const acidMoles = acidConc * acidVol / 1000;
    const baseMoles = baseConc * baseVol / 1000;

    let color = 'from-red-400 to-red-600';
    let status = 'Axit';
    if (Math.abs(acidMoles - baseMoles) < 0.001) {
        color = 'from-green-400 to-green-600';
        status = 'Trung hòa';
    } else if (baseMoles > acidMoles) {
        color = 'from-blue-400 to-blue-600';
        status = 'Bazơ';
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center gap-8">
            {/* Beaker 1 - Acid */}
            <div className="relative">
                <div className="w-20 h-32 bg-gray-700/50 rounded-b-lg border-2 border-gray-600 border-t-0 overflow-hidden">
                    <motion.div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-red-400"
                        animate={{ height: `${acidVol}%` }}
                        transition={{ type: 'spring' }}
                    />
                </div>
                <p className="text-center text-xs text-red-400 mt-2">HCl {acidConc}M</p>
            </div>

            <div className="text-white text-2xl">+</div>

            {/* Beaker 2 - Base */}
            <div className="relative">
                <div className="w-20 h-32 bg-gray-700/50 rounded-b-lg border-2 border-gray-600 border-t-0 overflow-hidden">
                    <motion.div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400"
                        animate={{ height: `${baseVol}%` }}
                        transition={{ type: 'spring' }}
                    />
                </div>
                <p className="text-center text-xs text-blue-400 mt-2">NaOH {baseConc}M</p>
            </div>

            <div className="text-white text-2xl">→</div>

            {/* Result beaker */}
            <div className="relative">
                <div className="w-24 h-36 bg-gray-700/50 rounded-b-lg border-2 border-gray-600 border-t-0 overflow-hidden">
                    <motion.div
                        className={`absolute bottom-0 w-full bg-gradient-to-t ${color}`}
                        animate={{ height: `${(acidVol + baseVol) / 2}%` }}
                        transition={{ type: 'spring' }}
                    />
                </div>
                <p className={`text-center text-xs mt-2 ${status === 'Trung hòa' ? 'text-green-400' :
                    status === 'Axit' ? 'text-red-400' : 'text-blue-400'
                    }`}>{status}</p>
            </div>
        </div>
    );
}

// ============= DEFAULT SIMULATION =============
function DefaultSimulation({
    config,
    results
}: {
    config?: VisualConfig;
    results: { outputId: string; outputName: string; outputUnit: string; value: number }[];
}) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
                {/* Formula display */}
                {config?.curveEquation && (
                    <div className="mb-6 p-4 bg-white/10 rounded-xl">
                        <p className="text-gray-400 text-xs mb-2">Công thức</p>
                        <p className="text-xl font-mono text-white">{config.curveEquation}</p>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {results.map((r) => (
                            <div key={r.outputId} className="p-3 bg-white/5 rounded-lg">
                                <p className="text-gray-400 text-xs">{r.outputName}</p>
                                <p className="text-lg font-bold text-white">
                                    {r.value.toFixed(2)} <span className="text-sm text-gray-400">{r.outputUnit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {!config?.curveEquation && results.length === 0 && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-primary-500/30 bg-primary-500/20 flex items-center justify-center animate-pulse">
                            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-sm">Điều chỉnh tham số để xem kết quả</p>
                    </div>
                )}
            </div>
        </div>
    );
}
