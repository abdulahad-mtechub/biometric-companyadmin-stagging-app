import { createSlice } from '@reduxjs/toolkit';
import logger from '@utils/logger';

const initialState = {
  totalCount: 0,
  pendingMessages: {}, // { [threadId]: [messages] }
  isOnline: true,
  cachedThreads: [], // Cached threads/messages list for offline access
  threadsLastFetched: null, // Timestamp of last threads fetch
  threadsHasNext: false, // Whether there are more pages
  threadsCurrentPage: 1, // Current page for threads
  threadsIsStale: false, // Whether threads data needs refresh
};

const messageSlice = createSlice({
  name: 'messageSlice',
  initialState,
  reducers: {
    addCountObject: (state, action) => {
      // Existing functionality
    },
    removeThreadById: (state, action) => {
      // Existing functionality
    },
    addPendingMessage: (state, action) => {
      const { threadId, message } = action.payload;
      if (!state.pendingMessages[threadId]) {
        state.pendingMessages[threadId] = [];
      }
      state.pendingMessages[threadId].push(message);
    },
    removePendingMessage: (state, action) => {
      const { threadId, messageId } = action.payload;
      if (state.pendingMessages[threadId]) {
        state.pendingMessages[threadId] = state.pendingMessages[threadId].filter(
          msg => msg.id !== messageId
        );
        // Remove thread if no pending messages
        if (state.pendingMessages[threadId].length === 0) {
          delete state.pendingMessages[threadId];
        }
      }
    },
    clearPendingMessages: (state, action) => {
      const { threadId } = action.payload;
      if (threadId) {
        delete state.pendingMessages[threadId];
      } else {
        // Clear all pending messages
        state.pendingMessages = {};
      }
    },
    setNetworkStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    syncPendingMessage: (state, action) => {
      const { threadId, oldTempId, realMessageId } = action.payload;
      if (state.pendingMessages[threadId]) {
        const message = state.pendingMessages[threadId].find(msg => msg.id === oldTempId);
        if (message) {
          message.id = realMessageId;
          message.synced = true;
        }
      }
    },
    // Threads/_messages list caching
    setCachedThreads: (state, action) => {
      const { threads, page, hasNext } = action.payload;
      if (page === 1) {
        state.cachedThreads = threads;
      } else {
        // Append for pagination
        state.cachedThreads = [...state.cachedThreads, ...threads];
      }
      state.threadsCurrentPage = page;
      state.threadsHasNext = hasNext;
      state.threadsLastFetched = Date.now();
      state.threadsIsStale = false;
    },
    updateCachedThread: (state, action) => {
      const updatedThread = action.payload;
      const index = state.cachedThreads.findIndex(thread => thread.id === updatedThread.id);
      if (index !== -1) {
        state.cachedThreads[index] = { ...state.cachedThreads[index], ...updatedThread };
      } else {
        state.cachedThreads = [updatedThread, ...state.cachedThreads];
      }
    },
    updateThreadLastMessage: (state, action) => {
      const { threadId, lastMessage, lastMessageType, lastMessageAt, unreadCount } = action.payload;
      const index = state.cachedThreads.findIndex(thread => thread.id === threadId);
      if (index !== -1) {
        state.cachedThreads[index] = {
          ...state.cachedThreads[index],
          last_message_content: lastMessage,
          last_message_type: lastMessageType,
          last_message_at: lastMessageAt,
          unread_count: unreadCount,
        };
        // Move updated thread to top
        const updatedThread = state.cachedThreads[index];
        state.cachedThreads.splice(index, 1);
        state.cachedThreads.unshift(updatedThread);
      }
    },
    incrementThreadUnreadCount: (state, action) => {
      const { threadId } = action.payload;
      const index = state.cachedThreads.findIndex(thread => thread.id === threadId);
      if (index !== -1) {
        state.cachedThreads[index].unread_count = (state.cachedThreads[index].unread_count || 0) + 1;
        // Move thread to top
        const updatedThread = state.cachedThreads[index];
        state.cachedThreads.splice(index, 1);
        state.cachedThreads.unshift(updatedThread);
      }
    },
    clearCachedThreads: (state) => {
      state.cachedThreads = [];
      state.threadsLastFetched = null;
      state.threadsHasNext = false;
      state.threadsCurrentPage = 1;
      state.threadsIsStale = false;
    },
    setThreadsStale: (state) => {
      state.threadsIsStale = true;
    },
    setTotalCount: (state, action) => {
      state.totalCount = action.payload;
    },
  },
});

export const {
  addCountObject,
  removeThreadById,
  addPendingMessage,
  removePendingMessage,
  clearPendingMessages,
  setNetworkStatus,
  syncPendingMessage,
  setCachedThreads,
  updateCachedThread,
  updateThreadLastMessage,
  incrementThreadUnreadCount,
  clearCachedThreads,
  setThreadsStale,
  setTotalCount,
} = messageSlice.actions;

export default messageSlice.reducer;
