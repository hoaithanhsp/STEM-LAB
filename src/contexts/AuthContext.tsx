import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import * as storage from '../services/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing user session
        const savedUser = storage.getUser();
        if (savedUser) {
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, _password: string, isTeacher: boolean): Promise<boolean> => {
        // Demo: Simple password check (in production use proper auth)
        const existingUser = storage.findUserByEmail(email);

        if (existingUser) {
            // Check if password matches (stored in email for demo)
            // In real app, use proper password hashing
            if (existingUser.role === (isTeacher ? 'admin' : 'student')) {
                storage.saveUser(existingUser);
                setUser(existingUser);
                return true;
            }
            return false;
        }

        return false;
    };

    const register = async (
        email: string,
        _password: string,
        fullName: string,
        isTeacher: boolean
    ): Promise<boolean> => {
        // Check if user already exists
        const existingUser = storage.findUserByEmail(email);
        if (existingUser) {
            return false;
        }

        // Create new user
        const newUser: User = {
            id: storage.generateId(),
            email,
            full_name: fullName,
            role: isTeacher ? 'admin' : 'student',
            created_at: new Date().toISOString(),
        };

        storage.addUser(newUser);
        storage.saveUser(newUser);
        setUser(newUser);
        return true;
    };

    const logout = () => {
        storage.removeUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
