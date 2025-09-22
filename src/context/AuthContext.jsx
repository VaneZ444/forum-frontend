import React, { createContext, useState, useEffect } from "react";
import api from "../api/api"; // правильный импорт

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // синхронная проверка роли
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            } else {
                // на всякий случай, если localStorage пустой
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
    try {
        const response = await api.login(email, password);
        const { token, nickname, role } = response.data;

        // формируем объект user с ролью
        const userData = { nickname, role };
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return userData;
    } catch (error) {
        console.error("Login error details:", error);
        
        let errorMessage = "Ошибка входа";
        
        // Безопасная проверка наличия response
        if (error.response) {
            // Сервер ответил с ошибкой
            const { data, status } = error.response;
            
            if (data && typeof data === 'object') {
                errorMessage = data.message || data.error || `Ошибка сервера: ${status}`;
            } else if (typeof data === 'string') {
                errorMessage = data;
            } else {
                errorMessage = `Ошибка сервера: ${status}`;
            }
        } else if (error.request) {
            // Запрос был сделан, но ответ не получен
            errorMessage = "Нет ответа от сервера";
        } else {
            // Что-то пошло не так при настройке запроса
            errorMessage = error.message || "Неизвестная ошибка";
        }
        
        throw new Error(errorMessage);
    }
};

    const register = async (email, password, nickname) => {
        try {
            const response = await api.register(email, password, nickname); // используем метод из api
            const { token, user: userData } = response.data;
            
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Ошибка регистрации");
        }
    };
    const isAdmin = () => {
        return user?.role === "admin";
    };
    const isAuthorized = () => {
        return !!user?.role;
    };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, isAdmin, logout, isAuthorized, loading }}>
            {children}
        </AuthContext.Provider>
    );
}