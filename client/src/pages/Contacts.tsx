import * as React from 'react';
import { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ContactForm } from '@/components/forms/ContactForm';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MoreHorizontal,
    ArrowUpDown,
    Plus,
    Filter,
    Download,
    Mail,
    Phone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Contact {
    _id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    phone?: string;
    status: 'Active' | 'Inactive';
    type: 'Private' | 'Business';
    updatedAt: string;
}

// Mock data removed

export default function Contacts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['contacts'],
        queryFn: api.contacts.list,
    });

    const createMutation = useMutation({
        mutationFn: api.contacts.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast({ title: "Success", description: "Contact created successfully." });
            setIsFormOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: api.contacts.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast({ title: "Deleted", description: "Contact removed from database." });
        },
    });

    const columns: ColumnDef<Contact>[] = [
        {
            id: 'name',
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4 font-bold">
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {row.original.firstName.charAt(0)}{row.original.lastName.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{row.original.firstName} {row.original.lastName}</span>
                </div>
            ),
        },
        {
            accessorKey: 'companyName',
            header: 'Company',
            cell: ({ row }) => <span className="text-slate-600">{row.original.companyName}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg px-2 py-0.5">
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <span className="text-slate-500 text-sm">{row.original.type}</span>,
        },
        {
            accessorKey: 'updatedAt',
            header: 'Last Activity',
            cell: ({ row }) => <span className="text-slate-500 text-sm">{new Date(row.original.updatedAt).toLocaleDateString()}</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${row.original.email}`, '_blank')}
                    >
                        <Mail size={16} className="text-slate-400" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => {
                            const phone = row.original.phone?.replace(/\D/g, '') || '';
                            window.open(`https://wa.me/${phone}`, '_blank');
                        }}
                    >
                        <Phone size={16} className="text-slate-400" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete ${row.original.firstName}?`)) {
                                deleteMutation.mutate(row.original._id);
                            }
                        }}
                    >
                        <MoreHorizontal size={16} />
                    </Button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: contacts, // Changed from DATA to contacts
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const handleExport = () => {
        if (!contacts.length) {
            toast({ title: "Export Failed", description: "No contacts to export.", variant: "destructive" });
            return;
        }

        const headers = ["First Name", "Last Name", "Company", "Email", "Phone", "Type", "Status", "Updated At"];
        const csvContent = [
            headers.join(","),
            ...contacts.map((contact: Contact) => [
                contact.firstName,
                contact.lastName,
                `"${contact.companyName}"`, // Escape CSV
                contact.email,
                contact.phone || "",
                contact.type,
                contact.status,
                new Date(contact.updatedAt).toLocaleDateString()
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: "Export Successful", description: "Your contacts list has been downloaded." });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Contacts</h1>
                    <p className="text-sm md:text-base text-slate-500">Manage your business and private contacts.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2 flex-1 sm:flex-none"
                        onClick={handleExport}
                    >
                        <Download size={18} />
                        <span className="hidden xs:inline">Export</span>
                    </Button>
                    <Button
                        className="rounded-xl shadow-lg shadow-primary/20 gap-2 flex-1 sm:flex-none"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Plus size={18} />
                        <span>Add Contact</span>
                    </Button>
                </div>
            </div>

            <ContactForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={(data) => createMutation.mutate({ ...data, owner: '507f1f77bcf86cd799439011' })}
            />

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Filter by name..."
                            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => table.getColumn('name')?.setFilterValue(event.target.value)}
                            className="pl-10 h-10 border-slate-200 rounded-xl w-full"
                        />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 text-sm text-slate-500">
                        <span>Showing {table.getFilteredRowModel().rows.length} contacts</span>
                    </div>
                </div>
                <div className="overflow-x-auto relative">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading contacts...</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="h-12 text-slate-500 font-bold px-6">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="py-4 px-6">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className="p-6 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-lg"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-lg"
                    >
                        Next
                    </Button>
                </div>
            </Card>
        </div>
    );
}
