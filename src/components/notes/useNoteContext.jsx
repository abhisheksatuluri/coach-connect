import { useMemo, useEffect, useState } from "react";

// Global state to track currently viewed objects (set by pages/components)
let globalNoteContext = {
  clientId: null,
  sessionId: null,
  journeyId: null,
  journeyTitle: null,
  taskId: null
};

let contextListeners = [];

export function setNoteContextClient(clientId) {
  globalNoteContext.clientId = clientId;
  // Clear other contexts when setting client
  globalNoteContext.sessionId = null;
  globalNoteContext.journeyId = null;
  globalNoteContext.taskId = null;
  notifyListeners();
}

export function setNoteContextSession(sessionId, clientId = null) {
  globalNoteContext.sessionId = sessionId;
  if (clientId) globalNoteContext.clientId = clientId;
  globalNoteContext.journeyId = null;
  globalNoteContext.taskId = null;
  notifyListeners();
}

export function setNoteContextJourney(journeyId, clientId = null, journeyTitle = null) {
  globalNoteContext.journeyId = journeyId;
  globalNoteContext.journeyTitle = journeyTitle;
  if (clientId) globalNoteContext.clientId = clientId;
  globalNoteContext.sessionId = null;
  globalNoteContext.taskId = null;
  console.log('[useNoteContext] Setting journey context:', { journeyId, clientId, journeyTitle });
  notifyListeners();
}

export function setNoteContextTask(taskId, clientId = null) {
  globalNoteContext.taskId = taskId;
  if (clientId) globalNoteContext.clientId = clientId;
  globalNoteContext.sessionId = null;
  globalNoteContext.journeyId = null;
  notifyListeners();
}

export function clearNoteContext() {
  globalNoteContext = {
    clientId: null,
    sessionId: null,
    journeyId: null,
    journeyTitle: null,
    taskId: null
  };
  notifyListeners();
}

function notifyListeners() {
  contextListeners.forEach(listener => listener({ ...globalNoteContext }));
}

export function useNoteContext(currentPageName) {
  const [globalContext, setGlobalContext] = useState({ ...globalNoteContext });
  
  useEffect(() => {
    // Subscribe to context changes
    const listener = (ctx) => setGlobalContext({ ...ctx });
    contextListeners.push(listener);
    
    // Get initial state
    setGlobalContext({ ...globalNoteContext });
    
    return () => {
      contextListeners = contextListeners.filter(l => l !== listener);
    };
  }, []);

  const context = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');

    // Priority 1: Check URL params for dedicated detail pages
    if (currentPageName === 'SessionDetail' && urlId) {
      return {
        type: 'session',
        sessionId: urlId,
        clientId: globalContext.clientId,
        noteType: 'Session Note'
      };
    }

    // Priority 2: Check global context set by components
    if (globalContext.sessionId) {
      return {
        type: 'session',
        sessionId: globalContext.sessionId,
        clientId: globalContext.clientId,
        noteType: 'Session Note'
      };
    }

    if (globalContext.journeyId) {
      return {
        type: 'journey',
        journeyId: globalContext.journeyId,
        journeyTitle: globalContext.journeyTitle,
        clientId: globalContext.clientId,
        noteType: 'Journey Note'
      };
    }

    if (globalContext.taskId) {
      return {
        type: 'task',
        taskId: globalContext.taskId,
        clientId: globalContext.clientId,
        noteType: 'Task Note'
      };
    }

    if (globalContext.clientId) {
      return {
        type: 'client',
        clientId: globalContext.clientId,
        noteType: 'Client Note'
      };
    }

    // Priority 3: URL-based detection for other pages
    if (currentPageName === 'ClientDetail' && urlId) {
      return {
        type: 'client',
        clientId: urlId,
        noteType: 'Client Note'
      };
    }

    if ((currentPageName === 'JourneyDetail' || currentPageName === 'JourneyProgress') && urlId) {
      return {
        type: 'journey',
        journeyId: urlId,
        noteType: 'Journey Note'
      };
    }

    if (currentPageName === 'TaskDetail' && urlId) {
      return {
        type: 'task',
        taskId: urlId,
        noteType: 'Task Note'
      };
    }

    // Default to My Note
    return {
      type: 'general',
      noteType: 'My Note'
    };
  }, [currentPageName, globalContext]);

  return context;
}

export function getNoteTypeFromContext(context) {
  console.log('[getNoteTypeFromContext] Context:', context);
  const noteType = (() => {
    switch (context.type) {
      case 'session': return 'Session Note';
      case 'client': return 'Client Note';
      case 'journey': return 'Journey Note';
      case 'task': return 'Task Note';
      default: return 'My Note';
    }
  })();
  console.log('[getNoteTypeFromContext] Determined noteType:', noteType);
  return noteType;
}