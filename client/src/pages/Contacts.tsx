import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
    type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Download, Mail, MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Contact } from '@/lib/types';
import { cn, shortDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/PageHeader';
import { ContactForm, type ContactFormValues } from '@/components/forms/ContactForm';

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const;

function toCsv(rows: Contact[]) {
    const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['First name', 'Last name', 'Company', 'Email', 'Phone', 'Type', 'Status', 'Added'];
    const lines = rows.map((c) => [c.firstName, c.lastName, c.companyName, c.email, c.phone, c.type, c.status, c.createdAt.slice(0, 10)].map(cell).join(','));
    // BOM so Excel opens non-ASCII names correctly.
    return '﻿' + [header.join(','), ...lines].join('\n');
}

export default function Contacts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [params, setParams] = useSearchParams();
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
    const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('All');
    const [form, setForm] = useState<{ open: boolean; contact?: Contact | null }>({ open: false });
    const query = params.get('q') ?? '';

    const { data: contacts = [], isLoading } = useQuery({ queryKey: ['contacts'], queryFn: api.contacts.list });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['contacts'] });
    const onError = (e: Error) => toast({ title: 'Couldn’t save', description: e.message, variant: 'destructive' });

    const save = useMutation({
        mutationFn: (v: ContactFormValues) => (form.contact ? api.contacts.update(form.contact._id, v) : api.contacts.create(v)),
        onSuccess: () => { refresh(); setForm({ open: false }); },
        onError,
    });
    const remove = useMutation({
        mutationFn: api.contacts.delete,
        onSuccess: () => { refresh(); toast({ title: 'Contact deleted' }); },
        onError,
    });

    const visible = useMemo(() => (status === 'All' ? contacts : contacts.filter((c) => c.status === status)), [contacts, status]);

    const columns = useMemo<ColumnDef<Contact>[]>(() => [
        {
            id: 'name',
            header: 'Name',
            accessorFn: (c) => `${c.firstName} ${c.lastName} ${c.email} ${c.companyName ?? ''}`,
            sortingFn: (a, b) => a.original.lastName.localeCompare(b.original.lastName),
            cell: ({ row: { original: c } }) => (
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-muted-foreground">
                        {c.firstName[0]}{c.lastName[0]}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{c.firstName} {c.lastName}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                    </div>
                </div>
            ),
        },
        { accessorKey: 'companyName', header: 'Company', cell: ({ getValue }) => getValue<string>() || <span className="text-muted-foreground">—</span> },
        { accessorKey: 'phone', header: 'Phone', enableSorting: false, cell: ({ getValue }) => <span className="num text-xs">{getValue<string>()}</span> },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => (
                <span className={cn('inline-flex items-center gap-1.5 text-xs', getValue() === 'Active' ? 'text-foreground' : 'text-muted-foreground')}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', getValue() === 'Active' ? 'bg-stage-won' : 'bg-input')} />
                    {getValue<string>()}
                </span>
            ),
        },
        { accessorKey: 'createdAt', header: 'Added', cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{shortDate(getValue<string>())}</span> },
        {
            id: 'actions',
            cell: ({ row: { original: c } }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Contact actions">
                            <MoreHorizontal size={15} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setForm({ open: true, contact: c })}><Pencil size={13} /> Edit</DropdownMenuItem>
                        <DropdownMenuItem asChild><a href={`mailto:${c.email}`}><Mail size={13} /> Email</a></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => confirm(`Delete ${c.firstName} ${c.lastName}?`) && remove.mutate(c._id)}>
                            <Trash2 size={13} /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [remove]);

    const table = useReactTable({
        data: visible,
        columns,
        state: { sorting, globalFilter: query },
        onSortingChange: setSorting,
        globalFilterFn: (row, _id, value: string) => (row.getValue('name') as string).toLowerCase().includes(value.toLowerCase()),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 25 } },
    });

    const exportCsv = () => {
        const rows = table.getFilteredRowModel().rows.map((r) => r.original);
        const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
        const a = Object.assign(document.createElement('a'), { href: url, download: `contacts-${new Date().toISOString().slice(0, 10)}.csv` });
        a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = table.getFilteredRowModel().rows.length;

    return (
        <>
            <PageHeader
                title="Contacts"
                description={`${contacts.length} people across ${new Set(contacts.map((c) => c.companyName).filter(Boolean)).size} companies.`}
                actions={<>
                    <Button variant="outline" onClick={exportCsv} disabled={!filtered}><Download size={14} /> Export</Button>
                    <Button onClick={() => setForm({ open: true })}><Plus size={15} /> New contact</Button>
                </>}
            />

            <ContactForm
                open={form.open}
                contact={form.contact}
                saving={save.isPending}
                onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
                onSubmit={(v) => save.mutate(v)}
            />

            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
                        placeholder="Filter by name, email or company"
                        className="h-8 w-full rounded-md border bg-card pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/20"
                    />
                </div>
                <div className="inline-flex rounded-md border bg-card p-0.5 text-xs">
                    {STATUS_FILTERS.map((s) => (
                        <button key={s} onClick={() => setStatus(s)} className={cn('rounded px-2.5 py-1', status === s ? 'bg-secondary font-medium' : 'text-muted-foreground hover:text-foreground')}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full min-w-[720px] text-[13px]">
                    <thead>
                        {table.getHeaderGroups().map((g) => (
                            <tr key={g.id} className="border-b">
                                {g.headers.map((h) => {
                                    const sort = h.column.getIsSorted();
                                    return (
                                        <th key={h.id} className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">
                                            {h.column.getCanSort() ? (
                                                <button onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-foreground">
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                    {sort === 'asc' && <ArrowUp size={11} />}
                                                    {sort === 'desc' && <ArrowDown size={11} />}
                                                </button>
                                            ) : flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>}
                        {!isLoading && filtered === 0 && (
                            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                                {contacts.length ? 'No contacts match this filter.' : 'No contacts yet. Add the first one.'}
                            </td></tr>
                        )}
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-secondary/40">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-2.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {table.getPageCount() > 1 && (
                <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                    <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
                    <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                    <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                </div>
            )}
        </>
    );
}
