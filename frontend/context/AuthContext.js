import React, { createContext, useState } from 'react';

// 1. Cria o Contexto
export const AuthContext = createContext({});

// 2. Cria o Provedor do Contexto
// Este componente irá gerenciar e fornecer os dados de autenticação
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // O estado que irá armazenar os dados do usuário

    // Função para simular o login
    // Ela recebe os dados do usuário (que virão da sua API) e os armazena no estado
    const login = (userData) => {
        setUser(userData);
        // Em um app real, você também salvaria um token no AsyncStorage aqui
        // para manter o usuário logado mesmo depois de fechar o app.
    };

    // Função para fazer logout
    const logout = () => {
        setUser(null);
        // Aqui você também limparia o token do AsyncStorage.
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
