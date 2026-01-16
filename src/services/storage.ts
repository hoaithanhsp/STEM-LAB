import { User, StudentProgress, LabReport, UserAchievement, CustomExperiment } from '../types';

const STORAGE_KEYS = {
    USER: 'stem_lab_user',
    USERS: 'stem_lab_users',
    PROGRESS: 'stem_lab_progress',
    REPORTS: 'stem_lab_reports',
    ACHIEVEMENTS: 'stem_lab_user_achievements',
    INITIALIZED: 'stem_lab_initialized',
    CUSTOM_EXPERIMENTS: 'stem_lab_custom_experiments',
};

// Demo accounts
const DEMO_ACCOUNTS: User[] = [
    {
        id: 'demo_teacher_001',
        email: 'giaovien@demo.com',
        full_name: 'Nguyễn Văn Thầy',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'demo_student_001',
        email: 'hocsinh@demo.com',
        full_name: 'Trần Thị Học Sinh',
        role: 'student',
        created_at: '2024-01-01T00:00:00Z',
    },
];

// Initialize demo accounts if not exists
export function initDemoAccounts(): void {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
        const existingUsers = getAllUsers();
        const newUsers = [...existingUsers];

        DEMO_ACCOUNTS.forEach(demo => {
            if (!existingUsers.find(u => u.email === demo.email)) {
                newUsers.push(demo);
            }
        });

        saveAllUsers(newUsers);
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
}

// User Storage
export function saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
}

export function removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

// All Users (for registration/login)
export function getAllUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
}

export function saveAllUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
    const users = getAllUsers();
    return users.find(u => u.email === email);
}

export function addUser(user: User): void {
    const users = getAllUsers();
    users.push(user);
    saveAllUsers(users);
}

// Student Progress Storage
export function getProgress(userId: string): StudentProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const allProgress: StudentProgress[] = data ? JSON.parse(data) : [];
    return allProgress.filter(p => p.user_id === userId);
}

export function getAllProgress(): StudentProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : [];
}

export function saveProgress(progress: StudentProgress): void {
    const allProgress = getAllProgress();
    const existingIndex = allProgress.findIndex(
        p => p.user_id === progress.user_id && p.experiment_id === progress.experiment_id
    );

    if (existingIndex >= 0) {
        allProgress[existingIndex] = progress;
    } else {
        allProgress.push(progress);
    }

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
}

export function getProgressByExperiment(userId: string, experimentId: string): StudentProgress | undefined {
    const progress = getProgress(userId);
    return progress.find(p => p.experiment_id === experimentId);
}

// Lab Reports Storage
export function getReports(userId: string): LabReport[] {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const allReports: LabReport[] = data ? JSON.parse(data) : [];
    return allReports.filter(r => r.user_id === userId);
}

export function getAllReports(): LabReport[] {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
}

export function saveReport(report: LabReport): void {
    const allReports = getAllReports();
    allReports.push(report);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(allReports));
}

// User Achievements Storage
export function getUserAchievements(userId: string): UserAchievement[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    const allAchievements: UserAchievement[] = data ? JSON.parse(data) : [];
    return allAchievements.filter(a => a.user_id === userId);
}

export function saveUserAchievement(achievement: UserAchievement): void {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    const allAchievements: UserAchievement[] = data ? JSON.parse(data) : [];
    allAchievements.push(achievement);
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(allAchievements));
}

// Generate unique ID
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== Custom Experiments Storage ==========

export function getAllCustomExperiments(): CustomExperiment[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXPERIMENTS);
    return data ? JSON.parse(data) : [];
}

export function getApprovedCustomExperiments(): CustomExperiment[] {
    return getAllCustomExperiments().filter(exp => exp.status === 'approved');
}

export function getPendingCustomExperiments(): CustomExperiment[] {
    return getAllCustomExperiments().filter(exp => exp.status === 'pending');
}

export function saveCustomExperiment(experiment: CustomExperiment): void {
    const allExperiments = getAllCustomExperiments();
    const existingIndex = allExperiments.findIndex(e => e.id === experiment.id);

    if (existingIndex >= 0) {
        allExperiments[existingIndex] = experiment;
    } else {
        allExperiments.push(experiment);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXPERIMENTS, JSON.stringify(allExperiments));
}

export function approveCustomExperiment(experimentId: string, approvedBy: string): void {
    const allExperiments = getAllCustomExperiments();
    const experiment = allExperiments.find(e => e.id === experimentId);

    if (experiment) {
        experiment.status = 'approved';
        experiment.approved_by = approvedBy;
        experiment.approved_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXPERIMENTS, JSON.stringify(allExperiments));
    }
}

// ========== Lab Reports with Approval ==========

export function getPendingReports(): LabReport[] {
    return getAllReports().filter(r => r.status === 'pending');
}

export function getApprovedReports(): LabReport[] {
    return getAllReports().filter(r => r.status === 'approved');
}

export function approveReport(reportId: string, teacherId: string, feedback?: string): void {
    const allReports = getAllReports();
    const report = allReports.find(r => r.id === reportId);

    if (report) {
        report.status = 'approved';
        report.reviewed_by = teacherId;
        report.reviewed_at = new Date().toISOString();
        if (feedback) report.teacher_feedback = feedback;
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(allReports));
    }
}

export function rejectReport(reportId: string, teacherId: string, feedback: string): void {
    const allReports = getAllReports();
    const report = allReports.find(r => r.id === reportId);

    if (report) {
        report.status = 'rejected';
        report.reviewed_by = teacherId;
        report.reviewed_at = new Date().toISOString();
        report.teacher_feedback = feedback;
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(allReports));
    }
}

export function updateReport(report: LabReport): void {
    const allReports = getAllReports();
    const existingIndex = allReports.findIndex(r => r.id === report.id);

    if (existingIndex >= 0) {
        allReports[existingIndex] = report;
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(allReports));
    }
}
