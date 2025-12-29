import { Users, Video, Map, CheckSquare, FileText, Book, CreditCard, User, Heart, Mic, Activity, Calendar, DollarSign, Award } from 'lucide-react';

/**
 * COMPLETE FEATURE SPECIFICATION MOCK DATA
 * Supports V2, V3, V4, V5 features.
 */

// --- 1. CLIENTS ---
export const CLIENTS = [
    {
        id: 'c1',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        name: 'Sarah Mitchell', // Derived for convenience
        email: 'sarah.mitchell@email.com',
        phone: '+44 7700 900001',
        status: 'Active',
        joinedDate: '2024-09-15',
        lastActivity: '2024-03-20',
        initials: 'SM',
        image: null,
        goals: ['Weight Loss', 'Stress Management', 'Better Sleep'],
        notes: [
            { id: 'cn1', date: '2024-03-15', content: 'Sarah struggles with evening snacking. Suggested herbal tea replacement.' },
            { id: 'cn2', date: '2024-02-01', content: 'Initial consultation went well. Highly motivated.' }
        ],
        stats: {
            totalSessions: 12,
            activeJourneys: 1,
            completedJourneys: 0,
            openTasks: 3,
            totalNotes: 5,
            totalPaid: 1200,
            outstanding: 0
        },
        nextSession: 'tomorrow'
    },
    {
        id: 'c2',
        firstName: 'James',
        lastName: 'Cooper',
        name: 'James Cooper',
        email: 'james.cooper@email.com',
        phone: '+44 7700 900002',
        status: 'Active',
        joinedDate: '2024-10-01',
        lastActivity: '2024-03-18',
        initials: 'JC',
        image: null,
        goals: ['Fitness', 'Nutrition'],
        notes: [],
        stats: {
            totalSessions: 8,
            activeJourneys: 1,
            completedJourneys: 0,
            openTasks: 1,
            totalNotes: 2,
            totalPaid: 800,
            outstanding: 0
        },
        nextSession: 'in 2 days'
    },
    {
        id: 'c3',
        firstName: 'Emma',
        lastName: 'Thompson',
        name: 'Emma Thompson',
        email: 'emma.thompson@email.com',
        phone: '+44 7700 900003',
        status: 'Active',
        joinedDate: '2024-11-10',
        lastActivity: '2024-03-19',
        initials: 'ET',
        image: null,
        goals: ['Work-Life Balance', 'Mindfulness'],
        notes: [],
        stats: {
            totalSessions: 5,
            activeJourneys: 1,
            completedJourneys: 0,
            openTasks: 2,
            totalNotes: 3,
            totalPaid: 500,
            outstanding: 0
        },
        nextSession: 'next week'
    },
    {
        id: 'c4',
        firstName: 'Michael',
        lastName: 'Chen',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+44 7700 900004',
        status: 'Active',
        joinedDate: '2024-12-05',
        lastActivity: '2024-03-10',
        initials: 'MC',
        image: null,
        goals: ['Energy', 'Better Sleep'],
        notes: [],
        stats: {
            totalSessions: 3,
            activeJourneys: 1,
            completedJourneys: 0,
            openTasks: 0,
            totalNotes: 1,
            totalPaid: 600, // Pending listed separately
            outstanding: 600
        },
        nextSession: 'in 3 days'
    },
    {
        id: 'c5',
        firstName: 'Lisa',
        lastName: 'Anderson',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        phone: '+44 7700 900005',
        status: 'Active',
        joinedDate: '2024-01-20',
        lastActivity: '2024-03-15',
        initials: 'LA',
        image: null,
        goals: ['Work-Life Balance', 'Stress Management'],
        notes: [],
        stats: {
            totalSessions: 20,
            activeJourneys: 1,
            completedJourneys: 2,
            openTasks: 5,
            totalNotes: 15,
            totalPaid: 2500,
            outstanding: 0
        },
        nextSession: 'next week'
    },
    {
        id: 'c6',
        firstName: 'David',
        lastName: 'Wilson',
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+44 7700 900006',
        status: 'Inactive',
        joinedDate: '2023-08-15',
        lastActivity: '2024-01-10',
        initials: 'DW',
        image: null,
        goals: ['Fitness'],
        notes: [],
        stats: {
            totalSessions: 6,
            activeJourneys: 0,
            completedJourneys: 1,
            openTasks: 0,
            totalNotes: 2,
            totalPaid: 600,
            outstanding: 0
        },
        nextSession: null
    },
    {
        id: 'c9',
        firstName: 'Sophie',
        lastName: 'Turner',
        name: 'Sophie Turner',
        email: 'sophie.turner@email.com',
        phone: '+44 7700 900009',
        status: 'Active',
        joinedDate: '2024-05-12',
        lastActivity: '2024-03-01',
        initials: 'ST',
        image: null,
        goals: ['Nutrition'],
        notes: [],
        stats: {
            totalSessions: 7,
            activeJourneys: 1,
            completedJourneys: 0,
            openTasks: 2,
            totalNotes: 4,
            totalPaid: 350,
            outstanding: 400
        },
        nextSession: 'in 10 days'
    }
];

// --- 2. SESSIONS ---
export const SESSIONS = [
    // Upcoming
    {
        id: 's1',
        clientId: 'c1',
        title: 'Weekly Check-in',
        date: 'Tomorrow',
        time: '2:00 PM',
        duration: '45 min',
        status: 'upcoming',
        locationType: 'Google Meet',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        agenda: 'Review progress on diet plan and discuss evening routine.',
        notes: ''
    },
    {
        id: 's2',
        clientId: 'c3',
        title: 'Goal Setting',
        date: 'In 2 days',
        time: '11:00 AM',
        duration: '60 min',
        status: 'upcoming',
        locationType: 'In Person',
        agenda: 'Define Q2 goals.',
        notes: ''
    },
    {
        id: 's3',
        clientId: 'c4',
        title: 'Foundation Session',
        date: 'In 3 days',
        time: '4:00 PM',
        duration: '60 min',
        status: 'upcoming',
        locationType: 'Google Meet',
        meetLink: 'https://meet.google.com/xyz-abcd-efg',
        agenda: 'Introduction to the program.',
        notes: ''
    },

    // Past with AI Data
    {
        id: 's9',
        clientId: 'c1',
        title: 'Stress Management Review',
        date: '2024-03-20', // "2 days ago"
        time: '10:00 AM',
        duration: '45 min',
        status: 'completed',
        locationType: 'Google Meet',
        hasTranscript: true,
        summary: 'Sarah reported improved sleep but high work stress. We discussed breathing techniques and set boundaries for work hours.',
        insights: [
            'Client responds well to structured evening routines.',
            'Work stress is the primary trigger for anxiety.',
            'Sleep quality has improved by 20% since last week.'
        ],
        actionItems: [
            { id: 'ai1', text: 'Practice 4-7-8 breathing daily', isTask: true },
            { id: 'ai2', text: 'Turn off work notifications by 7 PM', isTask: true }
        ],
        kbMatches: [
            { id: 'kb3', title: 'Stress Management Techniques', relevance: 'High' }
        ],
        transcript: "Coach: How have you been sleeping?\\nClient: Better, actually. I tried the tea you suggested.\\n..."
    },
    {
        id: 's10',
        clientId: 'c2',
        title: 'Fitness Progress',
        date: '2024-03-18', // "4 days ago"
        time: '2:00 PM',
        duration: '60 min',
        status: 'completed',
        locationType: 'In Person',
        hasTranscript: true,
        summary: 'James hit a PR in running. Discussed nutrition adjustments for higher intensity training.',
        insights: [
            'Recovery time is lagging behind training intensity.',
            'Protein intake needs to increase.'
        ],
        actionItems: [
            { id: 'ai3', text: 'Increase daily protein to 150g', isTask: true }
        ],
        kbMatches: [
            { id: 'kb1', title: 'Understanding Macronutrients', relevance: 'Medium' }
        ],
        transcript: "Coach: Tell me about the run.\\nClient: It was great, I felt strong but tired after...\\n..."
    }
];

// --- 3. JOURNEYS ---
export const JOURNEYS = [
    {
        id: 'j1',
        title: '12-Week Transformation',
        description: 'A comprehensive program to reset habits and build a sustainable lifestyle.',
        status: 'Active',
        totalSteps: 12,
        enrolled: [
            { clientId: 'c1', currentStep: 4, progress: 33, startDate: '2024-01-15' },
            { clientId: 'c4', currentStep: 1, progress: 8, startDate: '2024-03-10' }
        ],
        steps: [
            { step: 1, title: 'Foundation & Goal Setting', duration: '1 week' },
            { step: 2, title: 'Nutrition Basics', duration: '1 week' },
            { step: 3, title: 'Sleep Optimization', duration: '1 week' },
            { step: 4, title: 'Stress Management', duration: '1 week' },
            // ... more steps implied
        ]
    },
    {
        id: 'j2',
        title: 'Stress-Free Living',
        description: 'Mindfulness and stress reduction techniques for busy professionals.',
        status: 'Active',
        totalSteps: 8,
        enrolled: [
            { clientId: 'c3', currentStep: 3, progress: 37, startDate: '2024-02-01' },
            { clientId: 'c5', currentStep: 6, progress: 75, startDate: '2024-01-20' }
        ],
        steps: [
            { step: 1, title: 'Identifying Triggers', duration: '1 week' },
            { step: 2, title: 'Breathing Techniques', duration: '1 week' },
            { step: 3, title: 'Boundaries', duration: '2 weeks' }
        ]
    },
    {
        id: 'j3',
        title: 'Nutrition Fundamentals',
        description: 'Learn the basics of macros, micros, and meal planning.',
        status: 'Active',
        totalSteps: 6,
        enrolled: [
            { clientId: 'c2', currentStep: 2, progress: 33, startDate: '2024-03-01' }
        ],
        steps: [
            { step: 1, title: 'Pantry Cleanout', duration: '3 days' },
            { step: 2, title: 'Macronutrients 101', duration: '1 week' }
        ]
    }
];

// --- 4. TASKS ---
export const TASKS = [
    {
        id: 't1',
        title: "Review Sarah's food diary",
        linkedTo: { type: 'client', id: 'c1', name: 'Sarah Mitchell' },
        dueDate: 'Today',
        priority: 'Medium',
        status: 'Open',
        description: 'Check specifically for late night snacks.'
    },
    {
        id: 't2',
        title: "Prepare session notes for Michael",
        linkedTo: { type: 'client', id: 'c4', name: 'Michael Chen' },
        dueDate: 'Today',
        priority: 'High',
        status: 'Open',
        description: 'Review intake form before call.'
    },
    {
        id: 't3',
        title: "Send invoice to Sophie",
        linkedTo: { type: 'client', id: 'c9', name: 'Sophie Turner' },
        dueDate: '3 days ago',
        priority: 'High',
        status: 'Overdue',
        description: 'Payment for Feb package.'
    },
    {
        id: 't4',
        title: "Update journey curriculum",
        linkedTo: { type: 'journey', id: 'j1', name: '12-Week Transformation' },
        dueDate: 'Tomorrow',
        priority: 'Medium',
        status: 'Open',
        description: 'Add new video to Step 5.'
    },
    {
        id: 't5',
        title: "Research sleep supplements",
        linkedTo: null,
        dueDate: 'Next Week',
        priority: 'Low',
        status: 'Open',
        description: 'Look into Magnesium Glycinate brands.'
    }
];

// --- 5. NOTEBOOK ---
export const NOTES = [
    {
        id: 'n1',
        title: "Session framework template",
        category: 'My Notes',
        preview: 'GROW Model Questions...',
        content: '<p><strong>GROW Model:</strong></p><ul><li>Goal</li><li>Reality</li><li>Options</li><li>Way Forward</li></ul>',
        linkedTo: null,
        lastEdited: '2024-01-10',
        pinned: true
    },
    {
        id: 'n2',
        title: "Initial assessment notes - Sarah",
        category: 'Client Note',
        preview: 'Sarah mentioned prior injury...',
        content: '<p>Sarah has a history of <em>knee pain</em>. Avoid high impact cardio.</p>',
        linkedTo: { type: 'client', id: 'c1', name: 'Sarah Mitchell' },
        lastEdited: '2024-02-15',
        pinned: false
    },
    {
        id: 'n7',
        title: "Client intake form",
        category: 'File',
        preview: 'PDF Document',
        fileName: 'intake_form.pdf',
        size: '1.2 MB',
        linkedTo: null,
        lastEdited: '2023-11-20',
        pinned: false
    }
];

// --- 6. KNOWLEDGE BASE ---
export const KNOWLEDGE_BASE = [
    { id: 'kb1', title: 'Understanding Macronutrients', category: 'Nutrition', matches: 8, keywords: ['protein', 'carbs', 'fat', 'diet'] },
    { id: 'kb2', title: 'Meal Planning Basics', category: 'Nutrition', matches: 5, keywords: ['meal prep', 'planning', 'grocery'] },
    { id: 'kb3', title: 'Stress Management Techniques', category: 'Mindset', matches: 12, keywords: ['stress', 'anxiety', 'breathing', 'calm'] },
    { id: 'kb4', title: 'Building Healthy Habits', category: 'Mindset', matches: 9, keywords: ['habit', 'routine', 'consistency'] },
    { id: 'kb5', title: 'Sleep Hygiene Fundamentals', category: 'Sleep', matches: 6, keywords: ['sleep', 'insomnia', 'rest', 'bedtime'] },
    { id: 'kb6', title: 'Building a Sustainable Exercise Routine', category: 'Exercise', matches: 7, keywords: ['gym', 'workout', 'cardio', 'strength'] }
];

// --- 7. PAYMENTS ---
export const PAYMENTS = [
    { id: 'p1', invoiceNumber: 'INV-001', amount: 400.00, clientName: 'Sarah Mitchell', clientId: 'c1', status: 'Paid', date: '2024-01-15', dueDate: '2024-01-15' },
    { id: 'p2', invoiceNumber: 'INV-002', amount: 400.00, clientName: 'Sarah Mitchell', clientId: 'c1', status: 'Paid', date: '2024-02-15', dueDate: '2024-02-15' },
    { id: 'p3', invoiceNumber: 'INV-003', amount: 600.00, clientName: 'James Cooper', clientId: 'c2', status: 'Paid', date: '2024-02-01', dueDate: '2024-02-01' },
    { id: 'p5', invoiceNumber: 'INV-011', amount: 600.00, clientName: 'Michael Chen', clientId: 'c4', status: 'Pending', date: '2024-03-20', dueDate: '2024-03-27' },
    { id: 'p6', invoiceNumber: 'INV-015', amount: 400.00, clientName: 'Sophie Turner', clientId: 'c9', status: 'Overdue', date: '2024-03-05', dueDate: '2024-03-12' },
];

// --- 8. PRACTITIONERS ---
export const PRACTITIONERS = [
    {
        id: 'pr1',
        name: 'Dr. Emily Watson',
        specialty: 'Nutritionist',
        status: 'Active',
        bio: 'Specialist in metabolic health and sports nutrition.',
        email: 'emily.watson@partner.com',
        referrals: [
            { clientName: 'Sarah Mitchell', date: '2024-01-20', status: 'Completed' },
            { clientName: 'Nina Patel', date: '2024-02-10', status: 'Active' }
        ]
    },
    {
        id: 'pr2',
        name: 'Dr. Robert Clarke',
        specialty: 'Sports Physio',
        status: 'Active',
        bio: 'Expert in injury recovery and biomechanics.',
        email: 'robert.clarke@partner.com',
        referrals: [
            { clientName: 'James Cooper', date: '2024-02-05', status: 'Active' }
        ]
    },
    {
        id: 'pr4',
        name: 'Dr. Michael Torres',
        specialty: 'Sleep Specialist',
        status: 'Pending',
        bio: 'Clinical sleep psychologist.',
        email: 'm.torres@clinic.com',
        referrals: []
    }
];

// --- 9. USER & META ---
export const CURRENT_USER = {
    id: 'u1',
    full_name: 'Dr. Alex Mercer',
    email: 'alex.mercer@mindsi.com',
    role: 'coach',
    avatar: null
};

export const CHATS = [
    {
        id: 'conv1',
        participant1: 'alex.mercer@mindsi.com',
        participant2: 'sarah.mitchell@email.com',
        participant2Role: 'client',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        lastMessagePreview: 'Thanks for the session notes!',
        unreadCount: 1
    }
];

export const MESSAGES = [
    { id: 'm1', conversation_id: 'conv1', sender: 'sarah.mitchell@email.com', content: 'Hi Dr. Alex, do you have a minute?', created_date: new Date(Date.now() - 1000 * 60 * 10).toISOString(), isRead: true },
    { id: 'm2', conversation_id: 'conv1', sender: 'alex.mercer@mindsi.com', content: 'Of course, Sarah. What is on your mind?', created_date: new Date(Date.now() - 1000 * 60 * 8).toISOString(), isRead: true },
    { id: 'm3', conversation_id: 'conv1', sender: 'sarah.mitchell@email.com', content: 'Thanks for the session notes! They were really helpful.', created_date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false }
];
