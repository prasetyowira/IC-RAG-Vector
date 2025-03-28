import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { backend } from 'declarations/backend';
import { RootState } from './store';

// Define interface for user
export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOwner: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isOwner: false,
};

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    setIsOwner: (state, action: PayloadAction<boolean>) => {
      state.isOwner = action.payload;
    }
  }
});

// Export actions and selectors
export const { clearError, setUser, setIsOwner } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;
export const selectIsOwner = (state: RootState) => state.auth.isOwner;

export default authSlice.reducer; 