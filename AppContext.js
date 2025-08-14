import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [actionStatus, setActionStatus] = useState(false);

  // Load from AsyncStorage on app start
  useEffect(() => {
    const loadActionStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('actionstatus');
        if (storedStatus !== null) {
          setActionStatus(storedStatus === 'true');
        }
      } catch (error) {
        console.log('Error loading actionstatus:', error);
      }
    };
    loadActionStatus();
  }, []);

  // Update both state & storage
  const updateActionStatus = async status => {
    try {
      await AsyncStorage.setItem('actionstatus', status.toString());
      setActionStatus(status);
    } catch (error) {
      console.log('Error saving actionstatus:', error);
    }
  };

  return (
    <AppContext.Provider value={{ actionStatus, updateActionStatus }}>
      {children}
    </AppContext.Provider>
  );
};
