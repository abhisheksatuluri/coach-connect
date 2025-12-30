import { CLIENTS, SESSIONS, JOURNEYS, TASKS, PRACTITIONERS, CURRENT_USER, CHATS, MESSAGES, NOTES, KNOWLEDGE_BASE, PAYMENTS } from '../data/testData.js';

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockData = {
  Client: CLIENTS,
  Session: SESSIONS,
  Journey: JOURNEYS,
  Task: TASKS,
  Practitioner: PRACTITIONERS,
  User: [CURRENT_USER],
  Conversation: CHATS,
  Message: MESSAGES,
  Note: NOTES,
  KnowledgeBase: KNOWLEDGE_BASE,
  Payment: PAYMENTS,

  // Mocks for joined tables or less used entities
  ClientJourney: [],
  ClientJourneyStep: [],
  JourneyStep: [],
  Action: [],
  ApprovalRequest: [],
  File: []
};

const createMockEntity = (entityName) => ({
  list: async (sortString) => {
    // console.log(`[MockAPI] List ${entityName}`);
    await delay(50); // Small delay to simulate async
    let data = mockData[entityName] || [];

    // Basic sorting support needed for Dashboard "upcoming" queries etc.
    if (sortString && Array.isArray(data)) {
      // Very basic sort handling
      if (sortString === '-date_time' || sortString === '-created_at') {
        // No-op for now, data already generally sorted in testData
      }
    }
    return [...data];
  },
  filter: async (criteria) => {
    // console.log(`[MockAPI] Filter ${entityName}`, criteria);
    await delay(50);
    const data = mockData[entityName] || [];
    return data.filter(item => {
      return Object.entries(criteria).every(([key, value]) => item[key] == value);
    });
  },
  get: async (id) => {
    // console.log(`[MockAPI] Get ${entityName} ${id}`);
    await delay(50);
    const data = mockData[entityName] || [];
    return data.find(item => item.id === id);
  },
  create: async (payload) => {
    console.log(`[MockAPI] Create ${entityName}`, payload);
    return { id: `mock-${Date.now()}`, ...payload };
  },
  update: async (id, payload) => {
    console.log(`[MockAPI] Update ${entityName} ${id}`, payload);
    return { id, ...payload };
  },
  delete: async (id) => {
    console.log(`[MockAPI] Delete ${entityName} ${id}`);
    return true;
  }
});

// Proxy handler to dynamically create entity mocks
const entitiesHandler = {
  get: function (target, prop, receiver) {
    if (!target[prop]) {
      target[prop] = createMockEntity(prop);
    }
    return target[prop];
  }
};

export const api = {
  auth: {
    me: async () => {
      // console.log("[MockAPI] Auth Me");
      await delay(100);
      return CURRENT_USER;
    },
    login: async () => {
      console.log("[MockAPI] Login Prevented");
      return CURRENT_USER;
    },
    logout: async () => {
      console.log("[MockAPI] Logout");
      return true;
    }
  },
  entities: new Proxy({}, entitiesHandler),
  functions: {
    invoke: async (functionName, args) => {
      console.log(`[MockAPI] Function Invoke: ${functionName}`, args);
      await delay(100);

      // Basic returns for common functions if needed
      if (functionName === 'chat/getUnreadCount') return { data: { unreadCount: 3 } };

      return { data: {} };
    }
  }
};

export default api;
