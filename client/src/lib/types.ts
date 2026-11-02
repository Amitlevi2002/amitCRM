export const STAGES = ['Prospecting', 'Negotiation', 'Closed Won', 'Lost'] as const;
export type Stage = (typeof STAGES)[number];

export const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Contact {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    phone?: string;
    type: 'Private' | 'Business';
    status: 'Active' | 'Inactive';
    createdAt: string;
    updatedAt: string;
}

export interface Deal {
    _id: string;
    title: string;
    companyName: string;
    stage: Stage;
    estimatedValue: number;
    probability: number;
    expectedCloseDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    _id: string;
    type: ActivityType;
    date: string;
    outcome?: string;
    relatedTo: string;
    relatedToType: 'Contact' | 'Lead';
    createdAt: string;
}

export interface SearchResults {
    contacts: Contact[];
    leads: Deal[];
}

export type NewContact = Omit<Contact, '_id' | 'createdAt' | 'updatedAt'>;
export type NewDeal = Omit<Deal, '_id' | 'createdAt' | 'updatedAt'>;
export type NewActivity = Omit<Activity, '_id' | 'createdAt'>;
