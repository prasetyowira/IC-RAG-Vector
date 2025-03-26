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
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Healthcheck thunk to verify canister connectivity
export const checkHealth = createAsyncThunk(
  'auth/checkHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await backend.healthcheck();
      return response;
    } catch (error) {
      const errorString = String(error);
      const match = errorString.match(/(SysTransient|CanisterReject), \+"([^\\"]+")/);
      const errorMessage = match ? match[2] : 'Connection failed';
      return rejectWithValue(errorMessage);
    }
  }
);

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
    }
  },
  extraReducers: (builder) => {
    builder
      // Healthcheck
      .addCase(checkHealth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkHealth.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(checkHealth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and selectors
export const { clearError, setUser } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer; 