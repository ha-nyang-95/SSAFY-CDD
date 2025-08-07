
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: string | null;
  login: (username: string, password?: string) => Promise<boolean>; // password는 옵셔널로 설정
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TEMP_USER = {
  id: 'admin',
  pw: 'admin',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const login = async (username: string, password?: string): Promise<boolean> => {
    // 임시 로그인 로직: admin/admin 일 경우에만 성공
    if (username === TEMP_USER.id && password === TEMP_USER.pw) {
      await new Promise(resolve => setTimeout(resolve, 300)); // 가짜 딜레이
      setIsLoggedIn(true);
      setCurrentUser(username);
      return true; // 성공 반환
    }
    // 그 외의 경우는 실패
    return false; // 실패 반환
  };

  // const login = (username: string) => {
  //   setIsLoggedIn(true);
  //   setCurrentUser(username);
  // };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
