import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { createActor } from 'declarations/backend';
import { canisterId } from 'declarations/backend';
import { useDispatch } from 'react-redux';
import { setIsOwner } from './authSlice';

// Set identity provider based on environment
const network = import.meta.env.DFX_NETWORK || 'local';
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local

interface AuthContextType {
  authClient: AuthClient | null;
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: string;
  isInitializing: boolean;
  actor: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkIsOwner: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [actor, setActor] = useState<any | null>(null);

  // Create actor with the provided identity
  const setupActor = (currentIdentity: Identity) => {
    const newActor = createActor(canisterId, {
      agentOptions: {
        identity: currentIdentity
      }
    });
    setActor(newActor);
    return newActor;
  };

  // Check if the authenticated user is an owner
  const checkIsOwner = async (): Promise<boolean> => {
    if (!actor) return false;

    try {
      const isOwner = await actor.check_is_owner();
      dispatch(setIsOwner(isOwner));
      return isOwner;
    } catch (error) {
      console.error("Error checking owner status:", error);
      dispatch(setIsOwner(false));
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        const isAuthed = await client.isAuthenticated();
        setIsAuthenticated(isAuthed);
        
        if (isAuthed) {
          const currentIdentity = client.getIdentity();
          setIdentity(currentIdentity);
          setupActor(currentIdentity);
          setPrincipal(currentIdentity.getPrincipal().toString());
          
          // After setting up the actor, check if the user is an owner
          setTimeout(async () => {
            await checkIsOwner();
          }, 500); // Small delay to ensure actor is initialized
        }
      } catch (error) {
        console.error("Error initializing auth client:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    
    await authClient.login({
      identityProvider,
      onSuccess: async () => {
        setIsAuthenticated(true);
        const currentIdentity = authClient.getIdentity();
        setIdentity(currentIdentity);
        const newActor = setupActor(currentIdentity);
        setPrincipal(currentIdentity.getPrincipal().toString());
        
        // Check owner status after login
        setTimeout(async () => {
          await checkIsOwner();
        }, 500); // Small delay to ensure actor is initialized
      }
    });
  };

  const logout = async () => {
    if (!authClient) return;
    
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setActor(null);
    setPrincipal('');
    dispatch(setIsOwner(false)); // Reset owner status on logout
  };

  return (
    <AuthContext.Provider value={{ 
      authClient, 
      isAuthenticated, 
      identity, 
      principal, 
      isInitializing,
      actor,
      login, 
      logout,
      checkIsOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 