// AlertContext.js
import React, { createContext, useState, useContext } from 'react';
import logger from '@utils/logger';

const AlertContext = createContext();

export const useAlert = () => {
    return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({
        visible: false,
        message: '',
        type: 'success',
        description: '',
        duration: 3000,
        onPress: () => {},
    });

    const showAlert = (message, type = 'success', description, duration, onPress) => {
        setAlert({ visible: true, message, type, description , duration, onPress});
    };

    const hideAlert = () => {
        setAlert((prev) => ({ visible: false }));
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
            {children}
        </AlertContext.Provider>
    );
};
