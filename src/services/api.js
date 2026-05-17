import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://lyrebird04.ifn666.com/a02/api';

// Core fetch wrapper for every service function to call
// handles: auth headers, JSON parsing, error normalisation

async function request(endpoint, options = {}) {
    const token = await SecureStore.getItemAsync('jwt');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data = null;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        if (!response.ok) {
            const error = new Error(data?.message || `Request failed: ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }


        const linkHeader = response.headers.get('Link');

        return { data, linkHeader, status: response.status };

    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Network request failed') {
            const networkError = new Error(
                'Unable to connect to the server. Check your connection and try again.'
            );
            networkError.isNetworkError = true;
            throw networkError;
        }
        throw error;
    }
}

export const api = {
    get: (endpoint) => request(endpoint),
    // search: (endpoint) => request(endpoint,{ method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};