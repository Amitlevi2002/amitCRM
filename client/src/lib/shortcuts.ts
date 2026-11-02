// Two-key shortcuts like a terminal app: "g" then a letter.
export const GOTO: Record<string, { path: string; label: string }> = {
    o: { path: '/', label: 'Overview' },
    p: { path: '/pipeline', label: 'Pipeline' },
    c: { path: '/contacts', label: 'Contacts' },
    a: { path: '/activities', label: 'Activity' },
};
