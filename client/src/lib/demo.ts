// Browser-only data source used when no API is configured (the hosted demo).
// Same shapes as the Express API, persisted in localStorage so edits survive a reload.
import type { Activity, Contact, Deal, NewActivity, NewContact, NewDeal, SearchResults } from './types';

const KEY = 'crm-demo-v2';

interface DB {
    contacts: Contact[];
    leads: Deal[];
    activities: Activity[];
}

const day = 24 * 60 * 60 * 1000;
const at = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();
let seq = 0;
const id = () => `${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function seed(): DB {
    const c = (firstName: string, lastName: string, companyName: string, email: string, phone: string, age: number, status: Contact['status'] = 'Active'): Contact => ({
        _id: id(), firstName, lastName, companyName, email, phone, type: 'Business', status,
        createdAt: at(-age), updatedAt: at(-Math.floor(age / 3)),
    });
    const contacts = [
        c('Noa', 'Ben-David', 'Kesem Logistics', 'noa@kesemlog.co.il', '+972 52 418 2290', 64),
        c('Daniel', 'Hart', 'Northwind Retail', 'd.hart@northwind.com', '+44 20 7946 0321', 41),
        c('Yael', 'Mizrahi', 'Ofek Clinics', 'yael.m@ofek-clinics.co.il', '+972 54 771 0034', 33),
        c('Omer', 'Shalev', 'Tavor Engineering', 'omer@tavor-eng.com', '+972 50 662 1187', 90),
        c('Priya', 'Raman', 'Lumen Analytics', 'priya@lumenanalytics.io', '+1 415 555 0198', 22),
        c('Itai', 'Golan', 'Golan Wines', 'itai@golanwines.co.il', '+972 53 220 4410', 120, 'Inactive'),
        c('Sarah', 'Klein', 'Brightpath Schools', 'sklein@brightpath.org', '+1 212 555 0144', 15),
        c('Avi', 'Peretz', 'Peretz & Sons Hardware', 'avi@peretz-hw.co.il', '+972 52 903 7765', 52),
        c('Lena', 'Vogel', 'Vogel Architekten', 'lena@vogel-arch.de', '+49 30 901820', 27),
        c('Tamar', 'Azoulay', 'Kesem Logistics', 'tamar@kesemlog.co.il', '+972 54 118 6602', 9),
        c('Marco', 'Bellini', 'Bellini Foods', 'marco@bellinifoods.it', '+39 02 555 0172', 74, 'Inactive'),
        c('Roni', 'Levy', 'Ofek Clinics', 'roni.l@ofek-clinics.co.il', '+972 50 334 9921', 4),
    ];

    const d = (title: string, companyName: string, stage: Deal['stage'], estimatedValue: number, probability: number, closeIn: number, age: number): Deal => ({
        _id: id(), title, companyName, stage, estimatedValue, probability,
        expectedCloseDate: at(closeIn), createdAt: at(-age), updatedAt: at(-Math.floor(age / 4)),
    });
    const leads = [
        d('Fleet tracking rollout', 'Kesem Logistics', 'Negotiation', 48000, 70, 12, 40),
        d('Annual support renewal', 'Tavor Engineering', 'Closed Won', 18500, 100, -6, 80),
        d('Patient portal pilot', 'Ofek Clinics', 'Prospecting', 22000, 25, 35, 18),
        d('POS integration', 'Northwind Retail', 'Negotiation', 31000, 60, -3, 37),
        d('Data warehouse audit', 'Lumen Analytics', 'Prospecting', 9500, 30, 21, 12),
        d('Campus Wi-Fi upgrade', 'Brightpath Schools', 'Prospecting', 27000, 20, 48, 8),
        d('Inventory system', 'Peretz & Sons Hardware', 'Closed Won', 12400, 100, -20, 60),
        d('Distributor portal', 'Golan Wines', 'Lost', 15000, 0, -30, 110),
        d('Site licence, 40 seats', 'Vogel Architekten', 'Negotiation', 21600, 75, 9, 25),
        d('Ordering app', 'Bellini Foods', 'Lost', 8800, 0, -45, 70),
        d('Second warehouse onboarding', 'Kesem Logistics', 'Prospecting', 14000, 35, 60, 5),
        d('Clinic scheduling module', 'Ofek Clinics', 'Closed Won', 26000, 100, -2, 30),
    ];

    const a = (type: Activity['type'], outcome: string, contact: Contact, offsetDays: number): Activity => ({
        _id: id(), type, outcome, relatedTo: contact._id, relatedToType: 'Contact', date: at(offsetDays), createdAt: at(offsetDays),
    });
    const [noa, daniel, yael, omer, priya, , sarah, avi, lena, tamar, , roni] = contacts;
    const activities = [
        a('Call', 'Walked through fleet pricing tiers, wants 3-year option', noa, -0.2),
        a('Email', 'Sent revised POS integration quote', daniel, -0.9),
        a('Meeting', 'Pilot scoping with clinic managers', yael, -1.4),
        a('Note', 'Renewal signed, invoice sent', omer, -6),
        a('Call', 'Intro call, current warehouse is on Postgres 11', priya, -2.1),
        a('Email', 'Shared case study from a similar school network', sarah, -3),
        a('Meeting', 'Final contract review with procurement', lena, -1.1),
        a('Call', 'Asked about second warehouse timeline', tamar, -0.6),
        a('Note', 'Go-live complete, training booked for next week', roni, -2.5),
        a('Call', 'Follow-up on inventory system, very happy', avi, -12),
        a('Email', 'Legal has questions on data retention clause', daniel, -4),
        a('Meeting', 'Site visit at the Haifa depot', noa, -8),
    ];

    return { contacts, leads, activities };
}

function read(): DB {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* storage blocked or corrupted: fall through to fresh data */ }
    const db = seed();
    write(db);
    return db;
}

function write(db: DB) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* demo still works in memory */ }
}

// Small delay so loading states are real code paths in the demo too.
const respond = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(value)), 120));
const byNewest = <T extends { createdAt: string }>(xs: T[]) => [...xs].sort((x, y) => y.createdAt.localeCompare(x.createdAt));

function collection<K extends 'contacts' | 'leads'>(name: K) {
    type Item = DB[K][number];
    return {
        list: () => respond(byNewest(read()[name] as Item[])),
        create: (data: Partial<Item>) => {
            const db = read();
            const now = new Date().toISOString();
            const item = { ...data, _id: id(), createdAt: now, updatedAt: now } as Item;
            (db[name] as Item[]).push(item);
            write(db);
            return respond(item);
        },
        update: (itemId: string, data: Partial<Item>) => {
            const db = read();
            const list = db[name] as Item[];
            const i = list.findIndex((x) => x._id === itemId);
            if (i === -1) return Promise.reject(new Error('Not found'));
            list[i] = { ...list[i], ...data, _id: itemId, updatedAt: new Date().toISOString() };
            write(db);
            return respond(list[i]);
        },
        delete: (itemId: string) => {
            const db = read();
            db[name] = (db[name] as Item[]).filter((x) => x._id !== itemId) as DB[K];
            write(db);
            return respond(null);
        },
    };
}

export const demoApi = {
    contacts: collection('contacts') as {
        list: () => Promise<Contact[]>;
        create: (d: NewContact) => Promise<Contact>;
        update: (id: string, d: Partial<NewContact>) => Promise<Contact>;
        delete: (id: string) => Promise<null>;
    },
    leads: collection('leads') as {
        list: () => Promise<Deal[]>;
        create: (d: NewDeal) => Promise<Deal>;
        update: (id: string, d: Partial<NewDeal>) => Promise<Deal>;
        delete: (id: string) => Promise<null>;
    },
    activities: {
        list: () => respond([...read().activities].sort((x, y) => y.date.localeCompare(x.date))),
        create: (data: NewActivity) => {
            const db = read();
            const item: Activity = { ...data, _id: id(), createdAt: new Date().toISOString() };
            db.activities.push(item);
            write(db);
            return respond(item);
        },
        delete: (itemId: string) => {
            const db = read();
            db.activities = db.activities.filter((x) => x._id !== itemId);
            write(db);
            return respond(null);
        },
    },
    search: {
        query: (q: string): Promise<SearchResults> => {
            const db = read();
            const s = q.toLowerCase();
            const hit = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(s));
            return respond({
                contacts: db.contacts.filter((c) => hit(c.firstName, c.lastName, c.email, c.companyName)).slice(0, 5),
                leads: db.leads.filter((l) => hit(l.title, l.companyName)).slice(0, 5),
            });
        },
    },
    reset: () => {
        try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
    },
};
