
// V3 Dummy Data Generator
// Based on User Requirements for V3 Premium Experience

import { startOfToday, addDays, subDays, addHours, format, subWeeks } from 'date-fns';

// Helpers
const getAvatarInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getRandomColor = () => {
    const colors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700'];
    return colors[Math.floor(Math.random() * colors.length)];
};

// --- CONTACTS ---
export const contactsData = [
    {
        id: 'c1',
        name: 'Sarah Mitchell',
        type: 'Client',
        status: 'Active',
        goals: ['Weight Loss', 'Stress Management'],
        sessionCount: 5,
        journeyCount: 2,
        avatarColor: 'bg-emerald-100 text-emerald-700',
        email: 'sarah.m@example.com',
        phone: '+44 7700 900077'
    },
    {
        id: 'c2',
        name: 'James Cooper',
        type: 'Client',
        status: 'Active',
        goals: ['Fitness', 'Nutrition'],
        sessionCount: 3,
        journeyCount: 1,
        avatarColor: 'bg-blue-100 text-blue-700',
        email: 'j.cooper@example.com',
        phone: '+44 7700 900078'
    },
    {
        id: 'c3',
        name: 'Emma Thompson',
        type: 'Client',
        status: 'Active',
        goals: ['Sleep', 'Mindfulness'],
        sessionCount: 4,
        journeyCount: 1, // Implied from journey enrollment
        avatarColor: 'bg-purple-100 text-purple-700',
        email: 'emma.t@example.com',
        phone: '+44 7700 900079'
    },
    {
        id: 'c4',
        name: 'Michael Chen',
        type: 'Client',
        status: 'New',
        joined: 'Recently',
        goals: ['Energy'],
        sessionCount: 1,
        journeyCount: 0,
        avatarColor: 'bg-orange-100 text-orange-700',
        email: 'm.chen@example.com',
        phone: '+44 7700 900080'
    },
    {
        id: 'c5',
        name: 'Dr Emily Watson',
        type: 'Practitioner',
        specialty: 'Nutritionist',
        status: 'Active',
        avatarColor: 'bg-teal-100 text-teal-700',
        email: 'dr.watson@clinic.com'
    },
    {
        id: 'c6',
        name: 'Dr Robert Clarke',
        type: 'Practitioner',
        specialty: 'Physiotherapist',
        status: 'Active',
        avatarColor: 'bg-slate-100 text-slate-700',
        email: 'dr.clarke@clinic.com'
    },
    {
        id: 'c7',
        name: 'Lisa Anderson',
        type: 'Lead',
        status: 'Pending',
        sessionCount: 0,
        avatarColor: 'bg-pink-100 text-pink-700',
        email: 'lisa.anderson@example.com'
    },
    {
        id: 'c8',
        name: 'David Wilson',
        type: 'Client',
        status: 'Inactive',
        sessionCount: 10, // "Old sessions"
        avatarColor: 'bg-gray-100 text-gray-700',
        email: 'david.wilson@example.com'
    }
];

// --- SESSIONS ---
const today = startOfToday();

export const sessionsData = [
    {
        id: 's1',
        date: addHours(addDays(today, 1), 14), // Tomorrow 2pm
        contactId: 'c1',
        title: 'Weekly Check-in',
        duration: 45,
        status: 'Upcoming',
        hasMeetLink: true,
        type: 'Video'
    },
    {
        id: 's2',
        date: addHours(today, 10), // Today 10am
        contactId: 'c2',
        title: 'Nutrition Review',
        duration: 60,
        status: 'Upcoming',
        type: 'Video'
    },
    {
        id: 's3',
        date: subDays(today, 2), // 2 days ago
        contactId: 'c1',
        title: 'Stress Management',
        duration: 45,
        status: 'Completed',
        aiSummary: "Discussed recent work stressors. Client reports difficulty disconnecting in evenings. Explored breathing techniques.",
        aiInsights: [
            "Client showed strong commitment to meal planning",
            "Stress levels have decreased since starting meditation",
            "Sleep quality is a recurring blocker"
        ],
        aiActionItems: [
            "Schedule follow-up in 2 weeks",
            "Send nutrition guide article"
        ],
        kbMatches: ['kb7', 'kb10'], // Links to KB IDs
        type: 'Video'
    },
    {
        id: 's4',
        date: subDays(today, 3), // 3 days ago
        contactId: 'c3',
        title: 'Sleep Assessment',
        duration: 60,
        status: 'Completed',
        aiSummary: "Initial sleep pattern review. Identified late caffeine intake as potential issue.",
        aiInsights: ["Late night screen time is high", "Willing to try reading before bed"],
        type: 'In-Person'
    },
    {
        id: 's5',
        date: subWeeks(today, 1), // 1 week ago
        contactId: 'c1',
        title: 'Initial Consultation',
        duration: 90,
        status: 'Completed',
        aiSummary: "Comprehensive health history review. Established primary goals for weight loss and stress.",
        type: 'Video'
    },
    {
        id: 's6',
        date: subWeeks(today, 1), // 1 week ago
        contactId: 'c2',
        title: 'Fitness Planning',
        duration: 45,
        status: 'Completed',
        type: 'Video'
    },
    {
        id: 's7',
        date: subWeeks(today, 2), // 2 weeks ago
        contactId: 'c4',
        title: 'Discovery Call',
        duration: 30,
        status: 'Completed',
        type: 'Phone'
    },
    {
        id: 's8',
        date: addDays(today, 7), // Next Monday (approx)
        contactId: 'c3',
        title: 'Follow-up',
        duration: 45,
        status: 'Upcoming',
        type: 'Video'
    },
    {
        id: 's9',
        date: addDays(today, 9), // Next Wednesday (approx)
        contactId: 'c1',
        title: 'Journey Review',
        duration: 60,
        status: 'Upcoming',
        type: 'Video'
    },
    {
        id: 's10',
        date: subWeeks(today, 3), // 3 weeks ago
        contactId: 'c8',
        title: 'Last Session',
        duration: 45,
        status: 'Completed',
        type: 'Video'
    }
];

// --- KNOWLEDGE BASE ---
export const knowledgeBaseData = [
    // Nutrition
    { id: 'kb1', category: 'Nutrition', title: 'Understanding Macronutrients', matchCount: 12, content: 'Comprehensive guide explaining proteins, carbs, fats...', preview: 'Understanding the balance of macronutrients is key to...' },
    { id: 'kb2', category: 'Nutrition', title: 'Meal Planning Basics', matchCount: 8, content: 'How to plan weekly meals effectively.', preview: 'Strategies for efficient weekly meal prep...' },
    { id: 'kb3', category: 'Nutrition', title: 'Hydration and Health', matchCount: 5, content: 'The importance of water intake for cognitive function.', preview: 'Water makes up 60% of the human body...' },

    // Exercise
    { id: 'kb4', category: 'Exercise', title: 'Building a Sustainable Exercise Routine', matchCount: 10, content: 'Creating habits format', preview: 'Consistency beats intensity in the long run...' },
    { id: 'kb5', category: 'Exercise', title: 'Recovery and Rest Days', matchCount: 6, content: 'Why rest matters for growth.', preview: 'Muscles grow during rest, not during workouts...' },
    { id: 'kb6', category: 'Exercise', title: 'Home Workout Essentials', matchCount: 7, content: 'No equipment needed workouts.', preview: 'You can get a full body workout with just gravity...' },

    // Mindset
    { id: 'kb7', category: 'Mindset', title: 'Stress Management Techniques', matchCount: 15, content: 'Practical stress relief methods including box breathing.', preview: 'Stress is the silent killer of productivity...' },
    { id: 'kb8', category: 'Mindset', title: 'Building Healthy Habits', matchCount: 11, content: 'The science of habit formation (Atomic Habits).', preview: 'Small changes compound over time...' },
    { id: 'kb9', category: 'Mindset', title: 'Overcoming Plateaus', matchCount: 4, content: 'Pushing through stuck points.', preview: 'When progress stalls, it is time to change variables...' },

    // Sleep
    { id: 'kb10', category: 'Sleep', title: 'Sleep Hygiene Fundamentals', matchCount: 9, content: 'Creating optimal sleep environment.', preview: 'Darkness, temperature, and silence are the pillars...' },
    { id: 'kb11', category: 'Sleep', title: 'Creating a Bedtime Routine', matchCount: 6, content: 'Step by step evening routine.', preview: 'A wind-down routine signals your brain it is time...' },

    // Protocols
    { id: 'kb12', category: 'Protocols', title: 'Client Onboarding Process', matchCount: 3, content: 'Standard operating procedure for new clients.', preview: 'First impressions matter most...' }
];


// --- TASKS ---
export const tasksData = [
    { id: 't1', title: 'Follow up with Sarah', dueDate: today, priority: 'High', contactId: 'c1', completed: false },
    { id: 't2', title: 'Review nutrition plan', dueDate: today, priority: 'Medium', contactId: 'c2', completed: false },
    { id: 't3', title: 'Prepare session notes', dueDate: addDays(today, 1), priority: 'Medium', type: 'Personal', completed: false },
    { id: 't4', title: 'Send sleep guide to Emma', dueDate: addDays(today, 1), priority: 'Low', contactId: 'c3', completed: false },
    { id: 't5', title: 'Schedule quarterly review', dueDate: addDays(today, 3), priority: 'Medium', contactId: 'c1', completed: false },
    { id: 't6', title: 'Update journey curriculum', dueDate: addDays(today, 7), priority: 'Low', type: 'Personal', completed: false },
    { id: 't7', title: 'Call about missed payment', dueDate: subDays(today, 2), priority: 'High', contactId: 'c8', overdue: true, completed: false },
    { id: 't8', title: 'Complete intake form review', dueDate: subDays(today, 5), priority: 'Medium', contactId: 'c4', overdue: true, completed: false },
    { id: 't9', title: 'Send welcome packet', dueDate: subDays(today, 1), priority: 'Low', contactId: 'c4', completed: true },
    { id: 't10', title: 'Book follow-up session', dueDate: subDays(today, 3), priority: 'Medium', contactId: 'c3', completed: true },
    { id: 't11', title: 'Research new meditation techniques', priority: 'Low', type: 'Personal', completed: false },
    { id: 't12', title: 'Create workshop outline', priority: 'Medium', type: 'Personal', completed: false }
];

// --- NOTES ---
export const notesData = [
    { id: 'n1', title: 'Initial assessment notes', contactId: 'c1', content: 'Detailed notes from first meeting covering health history, goals, challenges...', category: 'Session' },
    { id: 'n2', title: 'Dietary preferences', contactId: 'c1', content: 'Notes about food allergies, likes, dislikes. Allergic to peanuts.', category: 'Personal' },
    { id: 'n3', title: 'Session observations', contactId: 'c1', content: 'Notes taken during the session 1 week ago.', category: 'Session' },
    { id: 'n4', title: 'Fitness history', contactId: 'c2', content: 'Background on his exercise experience. Ran a marathon in 2019.', category: 'Personal' },
    { id: 'n5', title: 'Sleep tracker review', contactId: 'c3', content: 'Notes about her sleep patterns. Wakes up at 3am frequently.', category: 'Progress' },
    { id: 'n6', title: 'Coaching framework template', type: 'Personal', content: 'Template for structuring sessions: Check-in, Wins, Challenges, Plan.', category: 'General' },
    { id: 'n7', title: 'Questions for difficult conversations', type: 'Personal', content: 'List of useful questions for resistance.', category: 'General' },
    { id: 'n8', title: 'Progress update', contactId: 'c1', content: 'Recent progress notes. Lost 2kg this month.', category: 'Progress' },
    { id: 'n9', title: 'Referral notes', contactId: 'c5', content: 'Notes about Dr Emily. Recommends Mediterranean diet.', category: 'General' },
    { id: 'n10', title: 'Workshop ideas', type: 'Personal', content: 'Brainstorming: Stress at Work webinar.', category: 'General' }
];

// --- JOURNEYS ---
export const journeysData = [
    {
        id: 'j1',
        title: '12 Week Transformation',
        status: 'Active',
        totalSteps: 12,
        participants: [
            { contactId: 'c1', currentStep: 8 },
            { contactId: 'c2', currentStep: 3 }
        ]
    },
    {
        id: 'j2',
        title: 'Stress Free Living',
        status: 'Active',
        totalSteps: 8,
        participants: [
            { contactId: 'c1', currentStep: 5 },
            { contactId: 'c3', currentStep: 2 }
        ]
    },
    {
        id: 'j3',
        title: 'Nutrition Fundamentals',
        status: 'Active',
        totalSteps: 6,
        participants: [
            { contactId: 'c2', currentStep: 4 }
        ]
    },
    {
        id: 'j4',
        title: 'Sleep Optimization',
        status: 'Active',
        totalSteps: 4,
        participants: [
            { contactId: 'c3', currentStep: 2 }
        ]
    }
];

// --- PAYMENTS ---
export const paymentsData = [
    { id: 'p1', contactId: 'c1', amount: 400, currency: 'GBP', status: 'Paid', date: 'February' },
    { id: 'p2', contactId: 'c1', amount: 400, currency: 'GBP', status: 'Paid', date: 'March' },
    { id: 'p3', contactId: 'c2', amount: 600, currency: 'GBP', status: 'Paid', date: 'March' },
    { id: 'p4', contactId: 'c3', amount: 350, currency: 'GBP', status: 'Pending', dueDate: addDays(today, 5) },
    { id: 'p5', contactId: 'c4', amount: 200, currency: 'GBP', status: 'Pending', dueDate: addDays(today, 10) },
    { id: 'p6', contactId: 'c8', amount: 400, currency: 'GBP', status: 'Overdue', daysOverdue: 15 },
    { id: 'p7', contactId: 'c1', amount: 400, currency: 'GBP', status: 'Pending', dueDate: addDays(today, 3) },
    { id: 'p8', contactId: 'c2', amount: 600, currency: 'GBP', status: 'Paid', date: 'February' }
];
