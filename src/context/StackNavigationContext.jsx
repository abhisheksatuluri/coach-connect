
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const StackNavigationContext = createContext(null);

export const useStackNavigation = () => {
    const context = useContext(StackNavigationContext);
    if (!context) {
        throw new Error('useStackNavigation must be used within a StackNavigationProvider');
    }
    return context;
};

export const StackNavigationProvider = ({ children }) => {
    const [stack, setStack] = useState([]);
    const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);

    // stack item structure: { id: string, component: ReactComponent, props: object, options: { isWidget: boolean } }

    const pushScreen = useCallback((component, props = {}, options = {}) => {
        const id = Math.random().toString(36).substr(2, 9);
        setStack(prev => [...prev, { id, component, props, options }]);
    }, []);

    const popScreen = useCallback(() => {
        setStack(prev => {
            if (prev.length === 0) return prev;
            const newStack = [...prev];
            newStack.pop();
            return newStack;
        });
    }, []);

    const clearStack = useCallback(() => {
        setStack([]);
    }, []);

    // Check if any widget-related screen is active
    const isAnyWidgetActive = useMemo(() => {
        const isWidgetScreenOpen = stack.some(screen => screen.options?.isWidget);
        return isWidgetMenuOpen || isWidgetScreenOpen;
    }, [stack, isWidgetMenuOpen]);

    const value = {
        stack,
        pushScreen,
        popScreen,
        clearStack,
        isWidgetMenuOpen,
        setIsWidgetMenuOpen,
        isAnyWidgetActive
    };

    return (
        <StackNavigationContext.Provider value={value}>
            {children}
        </StackNavigationContext.Provider>
    );
};
