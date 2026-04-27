import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

const readLocalStorageValue = <T,>(key: string, initialValue: T): T => {
    if (typeof window === "undefined") {
        return initialValue;
    }

    try {
        const item = window.localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return initialValue;
    }
};

function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() =>
        readLocalStorageValue(key, initialValue)
    );
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        setStoredValue(readLocalStorageValue(key, initialValue));
        setIsHydrated(true);
    }, [key]);

    const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
        setStoredValue((currentValue) => {
            const nextValue =
                typeof value === "function"
                    ? (value as (currentValue: T) => T)(currentValue)
                    : value;

            if (typeof window !== "undefined") {
                try {
                    window.localStorage.setItem(key, JSON.stringify(nextValue));
                } catch (error) {
                    console.error("Error saving to localStorage", error);
                }
            }

            return nextValue;
        });
    }, [key]);

    return [storedValue, setValue, isHydrated] as const;
}

export default useLocalStorage;
