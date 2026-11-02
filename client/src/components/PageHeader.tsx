import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
    return (
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="caret text-[24px] font-semibold tracking-tight"><span className="text-primary">&gt; </span>{title.toLowerCase()}</h1>
                {description && <p className="mt-0.5 text-[13.5px] text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
    );
}
