const CONFIG_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = CONFIG_URL.endsWith('/api') ? CONFIG_URL : `${CONFIG_URL}/api`;

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'API Error');
    }
    if (res.status === 204) return null;
    return res.json();
};

export const api = {
    contacts: {
        list: () => fetch(`${API_BASE}/contacts`).then(handleResponse),
        create: (data: any) => fetch(`${API_BASE}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id: string, data: any) => fetch(`${API_BASE}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id: string) => fetch(`${API_BASE}/contacts/${id}`, {
            method: 'DELETE'
        }).then(handleResponse),
    },
    leads: {
        list: () => fetch(`${API_BASE}/leads`).then(handleResponse),
        create: (data: any) => fetch(`${API_BASE}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id: string, data: any) => fetch(`${API_BASE}/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id: string) => fetch(`${API_BASE}/leads/${id}`, {
            method: 'DELETE'
        }).then(handleResponse),
    },
    activities: {
        list: () => fetch(`${API_BASE}/activities`).then(handleResponse),
        create: (data: any) => fetch(`${API_BASE}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id: string) => fetch(`${API_BASE}/activities/${id}`, {
            method: 'DELETE'
        }).then(handleResponse),
    },
    stats: {
        get: () => fetch(`${API_BASE}/stats`).then(handleResponse),
    },
    search: {
        query: (q: string) => fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`).then(handleResponse),
    }
};
