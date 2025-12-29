import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Users, Video, Map, CheckSquare, Book, LayoutGrid, CreditCard, Stethoscope, AlertCircle, Plus } from 'lucide-react';
import V4ClientFeedItem from './V4ClientFeedItem';
import V4SessionFeedItem from './V4SessionFeedItem';
import V4JourneyFeedItem from './V4JourneyFeedItem';
import V4TaskFeedItem from './V4TaskFeedItem';
import V4NotebookFeedItem from './V4NotebookFeedItem';
import V4KnowledgeBaseFeedItem from './V4KnowledgeBaseFeedItem';
import V4AIInsightFeedItem from './V4AIInsightFeedItem';
import V4PaymentFeedItem from './V4PaymentFeedItem';
import V4PractitionerFeedItem from './V4PractitionerFeedItem';

import V4TaskSectionHeader from './V4TaskSectionHeader';
import V4PaymentSummaryCard from './V4PaymentSummaryCard';

import { useClients } from '@/hooks/useClients';
import { useSessions } from '@/hooks/useSessions';
import { useTasks } from '@/hooks/useTasks';
import { useJourneys } from '@/hooks/useJourneys';
import { useNotebook } from '@/hooks/useNotebook';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { usePayments } from '@/hooks/usePayments';
import { usePractitioners } from '@/hooks/usePractitioners';

// Helper to transform data into feed items
const useFeedItems = (clients, sessions, tasks, journeys, notes, articles, payments, practitioners) => {
    return useMemo(() => {
        const items = [];

        // 1. Sessions
        sessions.forEach(s => {
            const client = clients.find(c => c.id === s.clientId);
            items.push({
                id: s.id,
                entity: 'Sessions',
                type: s.status === 'upcoming' ? 'session_scheduled' : 'session_completed',
                actor: 'System',
                title: s.title,
                timestamp: s.date === 'Today' ? 'Today' : s.date,
                color: 'bg-violet-500',
                icon: Video,
                preview: `Session with ${client ? (client.name || client.full_name) : 'Client'}`,
                clientName: client ? (client.name || client.full_name) : 'Unknown',
                date: s.date,
                duration: s.duration,
                hasTranscript: s.hasTranscript
            });

            if (s.hasTranscript) {
                items.push({
                    id: s.id + '-insight',
                    entity: 'Sessions',
                    type: 'ai_insight',
                    actor: 'System',
                    title: 'AI Insight Generated',
                    timestamp: s.date,
                    color: 'bg-violet-500',
                    icon: Video,
                    clientName: client ? (client.name || client.full_name) : 'Unknown'
                });
            }
        });

        // 2. Clients
        clients.forEach(c => {
            const name = c.name || c.full_name || 'Unknown';
            items.push({
                id: c.id,
                entity: 'Clients',
                type: 'client_added',
                actor: 'Coach',
                title: `Client Profile: ${name}`,
                timestamp: 'Active',
                color: 'bg-blue-500',
                icon: Users,
                preview: `Status: ${c.status}.`,
                clientName: name,
                email: c.email,
                phone: c.phone
            });
        });

        // 3. Journeys
        journeys.forEach(j => {
            items.push({
                id: j.id,
                entity: 'Journeys',
                type: 'journey_update',
                actor: 'System',
                title: j.title,
                timestamp: 'Active',
                color: 'bg-emerald-500',
                icon: Map,
                preview: `${j.enrolled?.length || 0} clients enrolled.`,
                milestones: j.milestones
            });
        });

        // 4. Tasks
        tasks.forEach(t => {
            let type = 'task_created';
            let color = 'bg-stone-500';
            const status = (t.status || '').toLowerCase();
            if (status === 'overdue') { type = 'task_overdue'; color = 'bg-rose-500'; }
            else if (t.dueDate === 'Today') { type = 'task_due_today'; color = 'bg-amber-500'; }

            items.push({
                id: t.id,
                entity: 'Tasks',
                type: type,
                actor: 'Coach',
                title: t.title,
                timestamp: t.dueDate,
                color: color,
                icon: CheckSquare,
                preview: `Priority: ${t.priority}`,
                linkedEntity: t.linkedTo ? t.linkedTo.name : null,
                status: t.status
            });
        });

        // 5. Notebook
        notes.forEach(n => {
            items.push({
                id: n.id,
                entity: 'Notebook',
                type: 'note_created',
                actor: 'Coach',
                title: n.title,
                timestamp: n.lastEdited || 'Recently',
                color: 'bg-amber-500',
                icon: Book,
                preview: (n.content || '').substring(0, 80) + '...',
                category: n.folder
            });
        });

        // 6. Knowledge Base
        articles.forEach(a => {
            items.push({
                id: a.id,
                entity: 'Knowledge',
                type: 'article_created',
                actor: 'Coach',
                title: a.title,
                timestamp: 'Library',
                color: 'bg-orange-500',
                icon: LayoutGrid,
                preview: (a.snippet || a.content || '').substring(0, 80) + '...',
                category: a.category
            });
        });

        // 7. Payments
        payments.forEach(p => {
            items.push({
                id: p.id,
                entity: 'Payments',
                type: 'invoice_' + (p.status || '').toLowerCase(),
                actor: 'Billing',
                title: `Invoice ${p.id}`,
                timestamp: p.date,
                color: 'bg-rose-500',
                icon: CreditCard,
                preview: `${p.amount} - ${p.clientName}`,
                amount: p.amount,
                status: p.status
            });
        });

        // 8. Practitioners
        practitioners.forEach(p => {
            items.push({
                id: p.id,
                entity: 'Practitioners',
                type: 'practitioner_added',
                actor: 'Network',
                title: p.name,
                timestamp: 'Active',
                color: 'bg-cyan-500',
                icon: Stethoscope,
                preview: p.specialty,
                specialty: p.specialty,
                status: p.status
            });
        });

        return items;
    }, [clients, sessions, tasks, journeys, notes, articles, payments, practitioners]);
};

export default function V4Feed({ filter, onItemClick, onItemHover, className }) {
    const { data: clients = [] } = useClients();
    const { data: sessions = [] } = useSessions();
    const { data: tasks = [] } = useTasks();
    const { data: journeys = [] } = useJourneys();
    const { data: notes = [] } = useNotebook();
    const { data: articles = [] } = useKnowledgeBase();
    const { data: payments = [] } = usePayments();
    const { data: practitioners = [] } = usePractitioners();

    const feedItems = useFeedItems(clients, sessions, tasks, journeys, notes, articles, payments, practitioners);

    const showTaskGroupedView = filter === 'Tasks';
    const showPaymentsSummary = filter === 'Payments';

    // Filter Items
    const filteredItems = filter === 'All'
        ? feedItems.filter(i => !i.type.startsWith('task_')) // Hide granular tasks on main feed
        : showTaskGroupedView
            ? feedItems.filter(item => item.entity === 'Tasks')
            : feedItems.filter(item => item.entity === filter);

    const renderItem = (item) => {
        // We can keep using the specific sub-components if they are updated to match props
        // But for visual polish, the request specified "Feed Items: Background white, Border-bottom, Left color bar"
        // The default fallback below implements this exactly.

        return (
            <div
                key={item.id}
                onClick={() => onItemClick(item)}
                onMouseEnter={() => onItemHover(item)}
                onMouseLeave={() => onItemHover(null)}
                className="group relative bg-white border-b border-[#E5E7EB] p-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors flex gap-4 min-h-[80px]"
            >
                {/* Left Color Bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-[4px]", item.color)} />

                {/* Icon */}
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 mt-1",
                    item.color.replace('bg-', 'bg-').replace('500', '50')
                )}>
                    <item.icon className={cn("w-5 h-5", item.color.replace('bg-', 'text-'))} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-0.5">
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider", item.color.replace('bg-', 'text-'))}>
                            {item.entity}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] font-medium">{item.timestamp}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#111827] leading-tight group-hover:text-blue-600 transition-colors mb-0.5">
                        {item.title}
                    </h3>
                    <p className="text-[13px] text-[#6B7280] line-clamp-2 leading-relaxed">
                        {item.preview}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={cn("flex-1 bg-[#F3F4F6] min-w-[500px] flex flex-col", className)}>
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#E5E7EB] px-6 py-4 z-10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-[#111827]">{filter === 'All' ? 'Home Feed' : filter + ' Feed'}</h1>
                    <div className="text-sm text-[#6B7280] font-medium">{filter === 'All' ? 'Latest Activity' : 'Filtered View'}</div>
                </div>
                {showTaskGroupedView && (
                    <div className="relative">
                        <input type="text" placeholder="Add a new task..." className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    </div>
                )}
            </div>

            {showPaymentsSummary && <V4PaymentSummaryCard />}

            <div className="flex flex-col pb-20">
                {showTaskGroupedView ? (
                    <>
                        <V4TaskSectionHeader title="Overdue" count={filteredItems.filter(i => i.type === 'task_overdue').length} color="text-rose-600" bg="bg-rose-100" />
                        {filteredItems.filter(i => i.type === 'task_overdue').map(renderItem)}

                        <V4TaskSectionHeader title="Due Today" count={filteredItems.filter(i => i.type === 'task_due_today').length} color="text-amber-600" bg="bg-amber-100" />
                        {filteredItems.filter(i => i.type === 'task_due_today').map(renderItem)}

                        <V4TaskSectionHeader title="Upcoming" count={filteredItems.filter(i => i.type === 'task_created').length} color="text-stone-500" bg="bg-stone-100" />
                        {filteredItems.filter(i => i.type === 'task_created').map(renderItem)}
                    </>
                ) : (
                    <>
                        {filteredItems.map(item => renderItem(item))}
                        {filteredItems.length === 0 && <div className="p-12 text-center text-[#9CA3AF]">No activity found.</div>}
                    </>
                )}
                <div className="p-8 text-center opacity-50"><div className="w-2 h-2 bg-[#D1D5DB] rounded-full mx-auto" /></div>
            </div>
        </div>
    );
}
