"use client";

import React from 'react';
import {
    Bell,
    CheckCircle2,
    ChevronDown,
    Filter,
    MoreHorizontal,
    PhoneOutgoing,
    Plus,
    Search,
    Clock,
    AlertCircle
} from 'lucide-react';

// --- shadcn UI Component Imports ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- Dummy Data ---
const contactsData = [
    {
        id: '1',
        name: 'Sarah Jenkins',
        company: 'Acme Corp',
        status: 'overdue',
        lastContacted: '45 days ago',
        frequencyGoal: '30 days',
        initials: 'SJ',
    },
    {
        id: '2',
        name: 'Michael Chen',
        company: 'Globex Designs',
        status: 'warning',
        lastContacted: '25 days ago',
        frequencyGoal: '30 days',
        initials: 'MC',
    },
    {
        id: '3',
        name: 'Jessica Alvarez',
        company: 'Stark Industries',
        status: 'healthy',
        lastContacted: 'Yesterday',
        frequencyGoal: '14 days',
        initials: 'JA',
    },
    {
        id: '4',
        name: 'Robert Fitzy',
        company: 'Consulting LLC',
        status: 'overdue',
        lastContacted: '2 months ago',
        frequencyGoal: '45 days',
        initials: 'RF',
    },
];

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        overdue: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        warning: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        healthy: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    };

    const icons = {
        overdue: <AlertCircle className="h-3.5 w-3.5" />,
        warning: <Clock className="h-3.5 w-3.5" />,
        healthy: <CheckCircle2 className="h-3.5 w-3.5" />,
    };

    const labels = {
        overdue: "Overdue",
        warning: "Due Soon",
        healthy: "Healthy",
    };

    const key = status as keyof typeof styles;

    return (
        <Badge variant="outline" className={`${styles[key]} flex gap-1.5 items-center w-fit px-2.5 py-0.5 font-medium transition-colors`}>
            {icons[key]}
            {labels[key]}
        </Badge>
    );
};

export default function DashboardMockup() {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">

            {/* 1. Header Section */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
                        <PhoneOutgoing className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Pulse</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    </Button>
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                        <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            {/* 2. Main Dashboard Content */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">

                {/* Page Titles */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-extrabold tracking-tight">Relationship Health</h2>
                        <p className="text-slate-500 text-lg">
                            Check in with <span className="font-semibold text-red-600 underline decoration-red-200 underline-offset-4">2 contacts</span> to maintain your network.
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Plus className="mr-2 h-5 w-5" /> Add New Contact
                    </Button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, company, or email..."
                            className="pl-11 h-11 border-0 bg-slate-50 focus-visible:ring-1 focus-visible:ring-blue-100 focus-visible:bg-white transition-all text-base"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="h-11 border-dashed px-4 text-slate-600 flex gap-2.5 font-medium">
                            <Filter className="h-4 w-4" />
                            Status: All
                            <ChevronDown className="h-4 w-4 opacity-40" />
                        </Button>
                        <Button variant="outline" className="h-11 px-4 text-slate-600 flex gap-2.5 font-medium">
                            Sort: Urgency
                            <ChevronDown className="h-4 w-4 opacity-40" />
                        </Button>
                    </div>
                </div>

                {/* 3. The Pulse Table */}
                <Card className="shadow-sm border-slate-200 overflow-hidden bg-white rounded-2xl ring-1 ring-slate-200/50">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="pl-6 h-14 font-semibold text-slate-600">Contact</TableHead>
                                <TableHead className="h-14 font-semibold text-slate-600">Health Status</TableHead>
                                <TableHead className="h-14 font-semibold text-slate-600">Last Spoke</TableHead>
                                <TableHead className="hidden lg:table-cell h-14 font-semibold text-slate-600">Cadence</TableHead>
                                <TableHead className="text-right pr-6 h-14 font-semibold text-slate-600">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contactsData.map((contact) => (
                                <TableRow key={contact.id} className="group hover:bg-slate-50/80 border-slate-100 transition-colors">
                                    <TableCell className="pl-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-11 w-11 border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                                                <AvatarFallback className={`${contact.status === 'overdue' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'} font-bold`}>
                                                    {contact.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-slate-900 text-[15px]">{contact.name}</div>
                                                <div className="text-sm text-slate-500 font-medium">{contact.company}</div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <StatusBadge status={contact.status} />
                                    </TableCell>

                                    <TableCell className="text-sm font-semibold text-slate-600">
                                        {contact.lastContacted}
                                    </TableCell>

                                    <TableCell className="hidden lg:table-cell text-slate-500 font-medium text-sm">
                                        <span className="inline-flex items-center rounded-lg bg-slate-100/80 px-2.5 py-1 ring-1 ring-inset ring-slate-200/50">
                                            Every {contact.frequencyGoal}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                variant={contact.status === 'overdue' ? "default" : "secondary"}
                                                size="sm"
                                                className={`h-9 px-4 font-semibold transition-all ${contact.status === 'overdue'
                                                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
                                                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
                                                    }`}
                                            >
                                                <CheckCircle2 className={`mr-2 h-4 w-4 ${contact.status === 'overdue' ? 'text-white' : 'text-emerald-600'}`} />
                                                Log Check-in
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 transition-colors">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl ring-1 ring-slate-200 border-0">
                                                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Relationship Care</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="rounded-md cursor-pointer px-2 py-2 font-medium">View History & Notes</DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-md cursor-pointer px-2 py-2 font-medium">Edit Check-in Range</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="rounded-md cursor-pointer px-2 py-2 font-semibold text-amber-600 focus:text-amber-700 focus:bg-amber-50">
                                                        <Clock className="mr-2 h-4 w-4" /> Snooze for 7 days
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </div>
    );
}