import { User, StudentProgress, LabReport, UserAchievement } from '../types';

const STORAGE_KEYS = {
    USER: 'stem_lab_user',
    USERS: 'stem_lab_users',
    PROGRESS: 'stem_lab_progress',
    REPORTS: 'stem_lab_reports',
    ACHIEVEMENTS: 'stem_lab_user_achievements',
};

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
