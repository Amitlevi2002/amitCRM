import { Calendar, Mail, Phone, StickyNote } from 'lucide-react';
import type { ActivityType } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICONS = { Call: Phone, Email: Mail, Meeting: Calendar, Note: StickyNote };

export function ActivityIcon({ type, className }: { type: ActivityType; className?: string }) {
    const Icon = ICONS[type] ?? StickyNote;
    return (
        <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground', className)}>
            <Icon size={12} strokeWidth={1.75} />
        </span>
    );
}
