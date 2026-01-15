import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface SimulationCanvasProps {
    experimentType: string;
    parameters: Record<string, number>;
    isRunning: boolean;
}

export default function SimulationCanvas({ experimentType, parameters, isRunning }: SimulationCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [animationFrame, setAnimationFrame] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setAnimationFrame(f => (f + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, [isRunning]);

    // Render different simulations based on type
    const renderSimulation = () => {
        switch (experimentType) {
            case 'ohm_law':
                return <OhmLawSimulation params={parameters} frame={animationFrame} />;
            case 'acid_base':
                return <AcidBaseSimulation params={parameters} frame={animationFrame} />;
            case 'plant_cell':
                return <PlantCellSimulation params={parameters} frame={animationFrame} />;
            case 'pendulum':
                return <PendulumSimulation params={parameters} frame={animationFrame} />;
            case 'refraction':
                return <RefractionSimulation params={parameters} frame={animationFrame} />;
            case 'electrolysis':
                return <ElectrolysisSimulation params={parameters} frame={animationFrame} />;
            default:
                return <DefaultSimulation />;
        }
    };

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden"
        >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }} />

            {renderSimulation()}

            {/* Status overlay */}
            {isRunning && (
                <div className="absolute bottom-3 left-3 bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Mô phỏng đang chạy</span>
                </div>
            )}
        </div>
    );
}

// ============= OHM LAW SIMULATION =============
function OhmLawSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
    const voltage = params.voltage || 6;
    const resistance = params.resistance || 20;
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
                {/* Electrons */}
                {[0, 1, 2].map(i => (
                    <circle
                        key={i}
                        cx={60 + ((frame * intensity * 2 + i * 100) % 280)}
                        cy={100 - Math.sin((frame + i * 60) * 0.1) * 30}
                        r={4}
                        fill="#60a5fa"
                        className="animate-pulse"
                    />
                ))}
            </svg>

            {/* Resistor */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2">
                <div className="w-20 h-12 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{resistance}Ω</span>
                </div>
                {/* Glow effect based on power */}
                <div
                    className="absolute inset-0 rounded bg-orange-500 blur-xl"
                    style={{ opacity: intensity * 0.5 }}
                />
            </div>

            {/* Light bulb */}
            <motion.div
                className="absolute top-6 left-1/2 -translate-x-1/2"
                animate={{
                    boxShadow: `0 0 ${20 + intensity * 30}px ${10 + intensity * 20}px rgba(250, 204, 21, ${0.3 + intensity * 0.5})`
                }}
            >
                <div
                    className="w-12 h-16 rounded-t-full border-2 border-yellow-400"
                    style={{
                        background: `radial-gradient(circle, rgba(250,204,21,${0.3 + intensity * 0.7}) 0%, transparent 70%)`
                    }}
                />
            </motion.div>

            {/* Current indicator */}
            <div className="absolute bottom-6 right-6 text-right">
                <p className="text-gray-400 text-xs">Dòng điện</p>
                <p className="text-2xl font-bold text-green-400">{current.toFixed(2)}A</p>
            </div>
        </div>
    );
}

// ============= ACID BASE SIMULATION =============
function AcidBaseSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
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
                    {/* Bubbles */}
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-white/30"
                            animate={{
                                y: [-20, -100],
                                opacity: [0.5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5
                            }}
                            style={{ left: `${20 + i * 20}%`, bottom: '10%' }}
                        />
                    ))}
                </div>
                <p className="text-center text-xs text-red-400 mt-2">HCl {acidConc}M</p>
            </div>

            {/* Plus sign */}
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

            {/* Arrow */}
            <div className="text-white text-2xl">→</div>

            {/* Result beaker */}
            <div className="relative">
                <div className="w-24 h-36 bg-gray-700/50 rounded-b-lg border-2 border-gray-600 border-t-0 overflow-hidden">
                    <motion.div
                        className={`absolute bottom-0 w-full bg-gradient-to-t ${color}`}
                        animate={{ height: `${(acidVol + baseVol) / 2}%` }}
                        transition={{ type: 'spring' }}
                    >
                        {/* Reaction animation */}
                        <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    </motion.div>
                </div>
                <p className={`text-center text-xs mt-2 ${status === 'Trung hòa' ? 'text-green-400' :
                        status === 'Axit' ? 'text-red-400' : 'text-blue-400'
                    }`}>{status}</p>
            </div>
        </div>
    );
}

// ============= PLANT CELL SIMULATION =============
function PlantCellSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
    const zoom = params.zoom || 100;
    const stain = params.stain || 50;
    const scale = zoom / 100;

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
                className="relative"
                animate={{ scale }}
                transition={{ type: 'spring' }}
            >
                {/* Cell wall */}
                <div
                    className="w-48 h-32 rounded-lg border-4"
                    style={{
                        borderColor: `rgba(34, 197, 94, ${0.3 + stain / 200})`,
                        backgroundColor: `rgba(34, 197, 94, ${0.1 + stain / 500})`
                    }}
                >
                    {/* Cell membrane */}
                    <div
                        className="absolute inset-1 rounded border-2"
                        style={{ borderColor: `rgba(134, 239, 172, ${0.5 + stain / 200})` }}
                    >
                        {/* Nucleus */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-10 rounded-full"
                            style={{
                                backgroundColor: `rgba(139, 92, 246, ${0.3 + stain / 150})`,
                                borderWidth: 2,
                                borderColor: `rgba(139, 92, 246, ${0.5 + stain / 100})`
                            }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {/* Nucleolus */}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                                style={{ backgroundColor: `rgba(139, 92, 246, ${0.6 + stain / 100})` }}
                            />
                        </motion.div>

                        {/* Chloroplasts */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                className="absolute w-4 h-2 rounded-full"
                                style={{
                                    backgroundColor: `rgba(34, 197, 94, ${0.5 + stain / 150})`,
                                    left: `${15 + i * 18}%`,
                                    top: `${20 + (i % 2) * 50}%`
                                }}
                                animate={{
                                    x: Math.sin(frame * 0.02 + i) * 3,
                                    y: Math.cos(frame * 0.02 + i) * 2
                                }}
                            />
                        ))}

                        {/* Vacuole */}
                        <motion.div
                            className="absolute bottom-2 right-2 w-16 h-10 rounded-full"
                            style={{
                                backgroundColor: `rgba(147, 197, 253, ${0.2 + stain / 300})`,
                                borderWidth: 1,
                                borderColor: `rgba(59, 130, 246, ${0.3 + stain / 200})`
                            }}
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Microscope overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 rounded-full border-8 border-gray-900"
                    style={{
                        background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 70%)'
                    }}
                />
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 right-4 bg-gray-800/80 rounded-lg px-3 py-1">
                <span className="text-white text-sm font-mono">{zoom}x</span>
            </div>
        </div>
    );
}

// ============= PENDULUM SIMULATION =============
function PendulumSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
    const length = params.length || 1;
    const angle = params.angle || 15;
    const gravity = params.gravity || 9.8;

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
                {/* Pivot */}
                <circle cx={pivotX} cy={pivotY} r="8" fill="#6b7280" />
                <rect x={pivotX - 30} y={pivotY - 8} width="60" height="8" fill="#4b5563" rx="2" />

                {/* Rope */}
                <line
                    x1={pivotX}
                    y1={pivotY}
                    x2={ballX}
                    y2={ballY}
                    stroke="#a3a3a3"
                    strokeWidth="2"
                />

                {/* Trail */}
                <path
                    d={`M ${pivotX + ropeLength * Math.sin(-angle * Math.PI / 180)} ${pivotY + ropeLength * Math.cos(angle * Math.PI / 180)} 
              A ${ropeLength} ${ropeLength} 0 0 1 
              ${pivotX + ropeLength * Math.sin(angle * Math.PI / 180)} ${pivotY + ropeLength * Math.cos(angle * Math.PI / 180)}`}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5 5"
                />

                {/* Ball */}
                <motion.circle
                    cx={ballX}
                    cy={ballY}
                    r="18"
                    fill="url(#ballGradient)"
                    filter="url(#shadow)"
                />

                {/* Gradient definition */}
                <defs>
                    <radialGradient id="ballGradient" cx="30%" cy="30%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </radialGradient>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4" />
                    </filter>
                </defs>

                {/* Angle indicator */}
                <text x={pivotX + 50} y={pivotY + 40} fill="#9ca3af" fontSize="12">
                    θ = {currentAngle.toFixed(1)}°
                </text>

                {/* Length indicator */}
                <text x={pivotX - 80} y={pivotY + ropeLength / 2} fill="#9ca3af" fontSize="12">
                    L = {length}m
                </text>
            </svg>
        </div>
    );
}

// ============= REFRACTION SIMULATION =============
function RefractionSimulation({ params }: { params: Record<string, number>; frame: number }) {
    const incidentAngle = params.incidentAngle || 30;
    const n1 = params.n1 || 1;
    const n2 = params.n2 || 1.5;

    const incidentRad = incidentAngle * Math.PI / 180;
    const sinRefracted = (n1 / n2) * Math.sin(incidentRad);
    const totalReflection = sinRefracted > 1;
    const refractedAngle = totalReflection ? 90 : Math.asin(sinRefracted) * 180 / Math.PI;

    const centerX = 200;
    const centerY = 130;
    const rayLength = 100;

    // Incident ray end point
    const incidentEndX = centerX - rayLength * Math.sin(incidentRad);
    const incidentEndY = centerY - rayLength * Math.cos(incidentRad);

    // Refracted ray end point
    const refractedRad = refractedAngle * Math.PI / 180;
    const refractedEndX = centerX + rayLength * Math.sin(refractedRad);
    const refractedEndY = centerY + rayLength * Math.cos(refractedRad);

    // Reflected ray
    const reflectedEndX = centerX + rayLength * Math.sin(incidentRad);
    const reflectedEndY = centerY - rayLength * Math.cos(incidentRad);

    return (
        <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 400 260">
                {/* Medium 1 (top) */}
                <rect x="0" y="0" width="400" height="130" fill="rgba(59, 130, 246, 0.1)" />
                <text x="20" y="30" fill="#60a5fa" fontSize="14">n₁ = {n1}</text>
                <text x="20" y="50" fill="#60a5fa" fontSize="12">Không khí</text>

                {/* Medium 2 (bottom) */}
                <rect x="0" y="130" width="400" height="130" fill="rgba(59, 130, 246, 0.3)" />
                <text x="20" y="160" fill="#3b82f6" fontSize="14">n₂ = {n2}</text>
                <text x="20" y="180" fill="#3b82f6" fontSize="12">Thủy tinh</text>

                {/* Interface line */}
                <line x1="0" y1="130" x2="400" y2="130" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5 5" />

                {/* Normal line */}
                <line x1={centerX} y1="30" x2={centerX} y2="230" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 3" />
                <text x={centerX + 5} y="25" fill="#9ca3af" fontSize="10">Pháp tuyến</text>

                {/* Incident ray */}
                <line
                    x1={incidentEndX} y1={incidentEndY}
                    x2={centerX} y2={centerY}
                    stroke="#fbbf24" strokeWidth="3"
                >
                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                </line>
                <polygon
                    points={`${centerX},${centerY} ${centerX - 8},${centerY - 15} ${centerX + 8},${centerY - 15}`}
                    fill="#fbbf24"
                    transform={`rotate(${incidentAngle}, ${centerX}, ${centerY})`}
                />

                {/* Refracted ray */}
                {!totalReflection && (
                    <line
                        x1={centerX} y1={centerY}
                        x2={refractedEndX} y2={refractedEndY}
                        stroke="#10b981" strokeWidth="3"
                    />
                )}

                {/* Reflected ray */}
                <line
                    x1={centerX} y1={centerY}
                    x2={reflectedEndX} y2={reflectedEndY}
                    stroke={totalReflection ? "#ef4444" : "rgba(239, 68, 68, 0.4)"}
                    strokeWidth={totalReflection ? 3 : 2}
                />

                {/* Angle labels */}
                <text x={centerX - 60} y={centerY - 30} fill="#fbbf24" fontSize="12">θ₁ = {incidentAngle}°</text>
                {!totalReflection && (
                    <text x={centerX + 20} y={centerY + 50} fill="#10b981" fontSize="12">θ₂ = {refractedAngle.toFixed(1)}°</text>
                )}

                {/* Total reflection warning */}
                {totalReflection && (
                    <text x={centerX - 60} y={centerY + 50} fill="#ef4444" fontSize="14" fontWeight="bold">
                        Phản xạ toàn phần!
                    </text>
                )}
            </svg>
        </div>
    );
}

// ============= ELECTROLYSIS SIMULATION =============
function ElectrolysisSimulation({ params, frame }: { params: Record<string, number>; frame: number }) {
    const current = params.current || 1;
    const time = params.time || 30;
    const bubbleSpeed = current * 2;

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Electrolysis cell */}
            <div className="relative w-64 h-48 bg-blue-900/30 rounded-lg border-2 border-gray-600 overflow-hidden">
                {/* Solution */}
                <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-blue-500/40 to-blue-400/20" />

                {/* Cathode (left) */}
                <div className="absolute left-8 top-4 bottom-8 w-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-gray-500" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">−</span>

                    {/* Copper deposit */}
                    <motion.div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-b"
                        animate={{ height: `${Math.min(80, time * current)}%` }}
                    />
                </div>

                {/* Anode (right) */}
                <div className="absolute right-8 top-4 bottom-8 w-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-gray-500" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">+</span>

                    {/* Oxygen bubbles */}
                    {[0, 1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-white/60"
                            animate={{
                                y: [0, -100],
                                opacity: [0.8, 0]
                            }}
                            transition={{
                                duration: 2 / bubbleSpeed,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                            style={{
                                left: `${-4 + i * 4}px`,
                                bottom: '30%'
                            }}
                        />
                    ))}
                </div>

                {/* Cu2+ ions moving */}
                {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-orange-400 text-[8px] text-white flex items-center justify-center font-bold"
                        animate={{
                            x: [-50, -100],
                            opacity: [1, 0]
                        }}
                        transition={{
                            duration: 3 / current,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                        style={{
                            right: '50%',
                            top: `${30 + i * 12}%`
                        }}
                    >
                        Cu
                    </motion.div>
                ))}

                {/* Labels */}
                <div className="absolute bottom-1 left-6 text-xs text-orange-400">Cu</div>
                <div className="absolute bottom-1 right-6 text-xs text-blue-300">O₂</div>
            </div>

            {/* Power supply */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-4">
                <span className="text-white text-sm">{current}A</span>
                <div className="w-8 h-3 bg-green-500 rounded animate-pulse" />
                <span className="text-white text-sm">{time}min</span>
            </div>
        </div>
    );
}

// ============= DEFAULT SIMULATION =============
function DefaultSimulation() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-primary-500/30 bg-primary-500/20 flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <p className="text-gray-400 text-sm">Chọn một thí nghiệm để bắt đầu</p>
            </div>
        </div>
    );
}
