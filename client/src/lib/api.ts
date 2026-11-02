import { demoApi } from './demo';
import type { Activity, Contact, Deal, NewActivity, NewContact, NewDeal, SearchResults } from './types';

const CONFIG_URL = import.meta.env.VITE_API_URL as string | undefined;

/** With no VITE_API_URL the app runs on in-browser demo data instead of the Express server. */
export const isDemo = !CONFIG_URL;

const API_BASE = CONFIG_URL?.endsWith('/api') ? CONFIG_URL : `${CONFIG_URL}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `Request failed (${res.status})`);
    }
    return res.status === 204 ? (null as T) : res.json();
}

const send = (method: string, data?: unknown): RequestInit => ({ method, body: data === undefined ? undefined : JSON.stringify(data) });

const httpApi = {
    contacts: {
        list: () => request<Contact[]>('/contacts'),
        create: (data: NewContact) => request<Contact>('/contacts', send('POST', data)),
        update: (id: string, data: Partial<NewContact>) => request<Contact>(`/contacts/${id}`, send('PUT', data)),
        delete: (id: string) => request<null>(`/contacts/${id}`, send('DELETE')),
    },
    leads: {
        list: () => request<Deal[]>('/leads'),
        create: (data: NewDeal) => request<Deal>('/leads', send('POST', data)),
        update: (id: string, data: Partial<NewDeal>) => request<Deal>(`/leads/${id}`, send('PUT', data)),
        delete: (id: string) => request<null>(`/leads/${id}`, send('DELETE')),
    },
    activities: {
        list: () => request<Activity[]>('/activities'),
        create: (data: NewActivity) => request<Activity>('/activities', send('POST', data)),
        delete: (id: string) => request<null>(`/activities/${id}`, send('DELETE')),
    },
    search: {
        query: (q: string) => request<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
    },
};

export const api = isDemo ? demoApi : httpApi;
