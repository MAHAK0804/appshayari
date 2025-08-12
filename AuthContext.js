/* eslint-disable no-shadow */
import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const loadUserFromStorage = async () => {
    const loginStatus = await AsyncStorage.getItem('IsLogin');
    const userData = await AsyncStorage.getItem('userData');
    const userIdStore = await AsyncStorage.getItem('userId');
    setIsLogin(loginStatus === 'true');
    setUser(userData ? JSON.parse(userData) : null);
    setUserId(userIdStore);
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const login = async (userId, userData) => {
    await AsyncStorage.setItem('IsLogin', 'true');
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('userId', userId);
    setIsLogin(true);
    setUser(userData);
    setUserId(userId);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['IsLogin', 'userData', 'userId', 'otp']);
    setIsLogin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLogin, user, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
};
