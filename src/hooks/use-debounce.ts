"use client";

import { useCallback, useRef, useState } from "react";

export function useDebounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number,
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => fn(...args), delay);
        },
        [fn, delay],
    ) as T;
}

export function useDebouncedValue(initialValue: string, delay: number) {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    const setDebounced = useDebounce((v: string) => {
        setDebouncedValue(v);
    }, delay);

    const handleChange = useCallback(
        (v: string) => {
            setValue(v);
            setDebounced(v);
        },
        [setDebounced],
    );

    return { value, debouncedValue, setValue: handleChange };
}
