import { useState, useCallback } from 'react';

const BASE_URL = "https://wbhk.joaoavelar.space/webhook";

export function useAPI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (path, method = 'GET', data = null) => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (data && method !== 'GET') config.body = JSON.stringify(data);

            const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
            const response = await fetch(url, config);
            const result = await response.json();

            if (!result.success && !result.items && !Array.isArray(result)) {
                // Some endpoints might return direct data or { success: true, data: ... }
                // The original code checks res?.success. 
                // Let's assume if it has success: false it's an error.
                if (result.success === false) throw new Error(result.error || 'API Error');
            }

            return result;
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return { request, loading, error };
}
