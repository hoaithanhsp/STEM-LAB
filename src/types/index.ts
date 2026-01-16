// User types
export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'student';
    avatar_url?: string;
    created_at: string;
}

// Experiment types
export interface Experiment {
    id: string;
    title: string;
    subject: string;
    difficulty_level: 'Dễ' | 'Trung bình' | 'Khó';
    short_description: string;
    learning_objectives: string[];
    tools_instructions: string[];
    simulation_config?: string;
    estimated_time: number;
    thumbnail_url?: string;
    created_at: string;
}

// Student progress types
export interface StudentProgress {
    id: string;
    user_id: string;
    experiment_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    start_time?: string;
    end_time?: string;
}

// Custom experiment types (created by teachers via AI)
export interface CustomExperiment {
    id: string;
    title: string;
    subject: string;
    difficulty_level: 'Dễ' | 'Trung bình' | 'Khó';
    short_description: string;
    learning_objectives: string[];
    tools_instructions: string[];
    simulation_config?: string;
    estimated_time: number;
    thumbnail_url?: string;
    created_at: string;
    created_by: string;
    // Approval fields
    status: 'pending' | 'approved';
    approved_by?: string;
    approved_at?: string;
}

// Lab report types
export interface LabReport {
    id: string;
    user_id: string;
    experiment_id: string;
    steps: string;
    observations: string;
    ai_conclusion: string;
    answers: Record<string, string>;
    created_at: string;
    saved_to_profile: boolean;
    // Approval fields
    status: 'pending' | 'approved' | 'rejected';
    teacher_feedback?: string;
    reviewed_by?: string;
    reviewed_at?: string;
}

// Achievement types
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    achieved_at: string;
}

// Auth context type
export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, isTeacher: boolean) => Promise<boolean>;
    register: (email: string, password: string, fullName: string, isTeacher: boolean) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

// Stats types
export interface StudentStats {
    completedExperiments: number;
    completionRate: number;
    achievements: number;
    totalTime: number;
}

export interface AdminStats {
    totalStudents: number;
    totalExperiments: number;
    todayCompleted: number;
    pendingReports: number;
}
