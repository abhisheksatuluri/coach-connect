import { base44 } from './base44Client';


export const googleOAuthInit = base44.functions.googleOAuthInit;

export const googleOAuthCallback = base44.functions.googleOAuthCallback;

export const refreshGoogleToken = base44.functions.refreshGoogleToken;

export const createGoogleMeetSession = base44.functions.createGoogleMeetSession;

export const oauth/google/init = base44.functions.oauth/google/init;

export const oauth/google/callback = base44.functions.oauth/google/callback;

export const callback = base44.functions.callback;

export const syncGoogleCalendarStatus = base44.functions.syncGoogleCalendarStatus;

export const meet/createInstantSession = base44.functions.meet/createInstantSession;

export const meet/webhookHandler = base44.functions.meet/webhookHandler;

export const meet/subscribeWebhook = base44.functions.meet/subscribeWebhook;

export const health = base44.functions.health;

export const meet/backfillArtifacts = base44.functions.meet/backfillArtifacts;

export const processCompletedMeetings = base44.functions.processCompletedMeetings;

export const getSessionArtifactContent = base44.functions.getSessionArtifactContent;

export const generateSessionAnalysis = base44.functions.generateSessionAnalysis;

export const sendGmailEmail = base44.functions.sendGmailEmail;

export const backfillActionClients = base44.functions.backfillActionClients;

export const sendApprovalRequestEmail = base44.functions.sendApprovalRequestEmail;

export const approveAction = base44.functions.approveAction;

export const chat/validateChatPermission = base44.functions.chat/validateChatPermission;

export const chat/getOrCreateConversation = base44.functions.chat/getOrCreateConversation;

export const chat/sendMessage = base44.functions.chat/sendMessage;

export const chat/getConversationMessages = base44.functions.chat/getConversationMessages;

export const chat/getUnreadCount = base44.functions.chat/getUnreadCount;

export const analyzeClientKnowledgeBase = base44.functions.analyzeClientKnowledgeBase;

export const analyzeSessionKnowledgeBase = base44.functions.analyzeSessionKnowledgeBase;

export const analyzeJourneyKnowledgeBase = base44.functions.analyzeJourneyKnowledgeBase;

export const logAPIUsage = base44.functions.logAPIUsage;

export const analyzeNoteKnowledgeBase = base44.functions.analyzeNoteKnowledgeBase;

export const migrateTaskContext = base44.functions.migrateTaskContext;

