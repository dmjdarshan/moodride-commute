import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Persona {
  commuteAssets: ('bike' | 'car')[];
  likesDrivingCar: boolean;
  likesRidingBike: boolean;
  preferredMode: 'bike' | 'car';
  budgetVsConvenience: number;
  ontimePreference: number;
  gmapsConnected: boolean;
}

export interface User {
  email: string;
  password: string;
  name: string;
  persona: Persona | null;
  onboardingComplete: boolean;
}

interface AppContextType {
  users: User[];
  currentUser: User | null;
  locations: string[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updatePersona: (persona: Persona) => void;
  completeOnboarding: () => void;
}

const BANGALORE_LOCATIONS = [
  "Koramangala",
  "Indiranagar",
  "Whitefield",
  "HSR Layout",
  "Marathahalli",
  "Electronic City",
  "MG Road",
  "Jayanagar",
  "Bellandur",
  "Sarjapur Road",
  "ORR (Outer Ring Road)",
  "Hebbal",
  "Yeshwanthpur",
  "BTM Layout",
  "JP Nagar",
  "Silk Board",
  "Bannerghatta Road",
  "Yelahanka",
  "KR Puram",
  "Malleshwaram"
];

const INITIAL_USERS: User[] = [
  {
    email: "test@moodride.com",
    password: "test123",
    name: "Rajesh Kumar",
    persona: {
      commuteAssets: ["bike", "car"],
      likesDrivingCar: false,
      likesRidingBike: true,
      preferredMode: "bike",
      budgetVsConvenience: 40,
      ontimePreference: 7,
      gmapsConnected: true
    },
    onboardingComplete: true
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    const exists = users.some(u => u.email === email);
    if (exists) return false;
    
    const newUser: User = {
      email,
      password,
      name,
      persona: null,
      onboardingComplete: false
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updatePersona = (persona: Persona) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, persona };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.email === currentUser.email ? updatedUser : u));
  };

  const completeOnboarding = () => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, onboardingComplete: true };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.email === currentUser.email ? updatedUser : u));
  };

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      locations: BANGALORE_LOCATIONS,
      login,
      signup,
      logout,
      updatePersona,
      completeOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
