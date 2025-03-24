import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { backend } from 'backend';
import { RootState } from './store';

// Define chat message types
export interface Message {
  role: { user?: null; system?: null };
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,
};

// Async thunk for sending a message to the canister
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (params: { conversationId: string; content: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const conversation = state.chat.conversations.find(c => c.id === params.conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Format messages for the canister
      const chatMessages = conversation.messages.map(msg => {
        return {
          content: msg.content,
          role: msg.role.user !== undefined ? 'user' : 'system'
        };
      });
      
      // Add current user message
      chatMessages.push({
        content: params.content,
        role: 'user'
      });
      
      // Add user message to state immediately (optimistic update)
      const userMessage: Message = {
        role: { user: null },
        content: params.content
      };
      
      // Call the canister with collection ID and messages
      const collection = "default"; // Or get this from somewhere appropriate
      const response = await backend.chat(collection, chatMessages);
      
      let responseContent = '';
      if ('Ok' in response) {
        responseContent = response.Ok;
      } else if ('Err' in response) {
        throw new Error(JSON.stringify(response.Err));
      }
      
      // Create system message from response
      const systemMessage: Message = {
        role: { system: null },
        content: responseContent
      };
      
      return {
        conversationId: params.conversationId,
        userMessage,
        systemMessage
      };
    } catch (error) {
      // Handle canister errors
      const errorString = String(error);
      const match = errorString.match(/(SysTransient|CanisterReject), \+"([^\\"]+")/);
      const errorMessage = match ? match[2] : 'Failed to send message';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for creating a new conversation
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (title: string = 'New Conversation', { rejectWithValue }) => {
    try {
      // Create a local conversation
      const conversationId = Date.now().toString();
      
      const conversation: Conversation = {
        id: conversationId,
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      return conversation;
    } catch (error) {
      return rejectWithValue('Failed to create conversation');
    }
  }
);

// Create the slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    
    clearConversations: (state) => {
      state.conversations = [];
      state.currentConversationId = null;
    },
    
    updateConversationTitle: (state, action: PayloadAction<{ conversationId: string; title: string }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.title = action.payload.title;
        conversation.updatedAt = Date.now();
      }
    },
    
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.currentConversationId === action.payload) {
        state.currentConversationId = state.conversations[0]?.id || null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations.push(action.payload);
        state.currentConversationId = action.payload.id;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
        if (conversation) {
          conversation.messages.push(action.payload.userMessage);
          conversation.messages.push(action.payload.systemMessage);
          conversation.updatedAt = Date.now();
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and selectors
export const { 
  setCurrentConversation, 
  clearConversations, 
  updateConversationTitle, 
  deleteConversation 
} = chatSlice.actions;

export const selectCurrentConversation = (state: RootState) => {
  const { currentConversationId, conversations } = state.chat;
  return conversations.find(conversation => conversation.id === currentConversationId) || null;
};

export const selectConversations = (state: RootState) => state.chat.conversations;
export const selectIsLoading = (state: RootState) => state.chat.isLoading;
export const selectError = (state: RootState) => state.chat.error;

export default chatSlice.reducer; 