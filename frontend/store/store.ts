import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import knowledgeReducer from './knowledgeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    knowledge: knowledgeReducer,
  },
  devTools: {
    trace: true,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 