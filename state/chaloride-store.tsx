import React, { createContext, useContext, useMemo, useReducer } from 'react';

export type Money = {
  currency: 'INR';
  amountPaise: number;
};

export type LatLng = { latitude: number; longitude: number };

export type Place = {
  label: string;
  location?: LatLng;
};

export type RideTypeId = 'bike' | 'auto' | 'mini' | 'sedan';

export type RideType = {
  id: RideTypeId;
  title: string;
  capacityText: string;
  baseFarePaise: number;
  perKmPaise: number;
  etaMinutes: number;
};

export type Driver = {
  name: string;
  vehicle: string;
  numberPlate: string;
  rating: number;
};

export type RideStatus =
  | 'requested'
  | 'accepted'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'canceled';

export type Ride = {
  id: string;
  requestedAtMs: number;
  pickup: Place;
  dropoff: Place;
  rideTypeId: RideTypeId;
  distanceKm: number;
  status: RideStatus;
  estimate: Money;
  finalFare?: Money;
  driver?: Driver;
  otp?: string;
  rating?: number;
  note?: string;
};

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
};

export type PaymentMethod = {
  id: string;
  type: 'cash' | 'wallet' | 'card';
  label: string;
};

export type ChaloRideState = {
  user: User | null;
  walletBalance: Money;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string;
  rides: Ride[];
};

type Action =
  | { type: 'auth/signIn'; user: User }
  | { type: 'auth/signOut' }
  | { type: 'wallet/add'; amountPaise: number }
  | { type: 'payment/addMethod'; method: PaymentMethod }
  | { type: 'payment/setDefault'; paymentMethodId: string }
  | { type: 'ride/create'; ride: Ride }
  | { type: 'ride/updateStatus'; rideId: string; status: RideStatus }
  | { type: 'ride/setDriver'; rideId: string; driver: Driver; otp: string }
  | { type: 'ride/setFinalFare'; rideId: string; finalFare: Money }
  | { type: 'ride/rate'; rideId: string; rating: number };

const defaultState: ChaloRideState = {
  user: null,
  walletBalance: { currency: 'INR', amountPaise: 0 },
  paymentMethods: [
    { id: 'pm_cash', type: 'cash', label: 'Cash' },
    { id: 'pm_wallet', type: 'wallet', label: 'ChaloRide Wallet' },
  ],
  defaultPaymentMethodId: 'pm_cash',
  rides: [],
};

function updateRide(rides: Ride[], rideId: string, patch: Partial<Ride>): Ride[] {
  return rides.map((r) => (r.id === rideId ? { ...r, ...patch } : r));
}

function reducer(state: ChaloRideState, action: Action): ChaloRideState {
  switch (action.type) {
    case 'auth/signIn':
      return { ...state, user: action.user };
    case 'auth/signOut':
      return { ...state, user: null };
    case 'wallet/add':
      return {
        ...state,
        walletBalance: {
          currency: 'INR',
          amountPaise: state.walletBalance.amountPaise + action.amountPaise,
        },
      };
    case 'payment/addMethod':
      return {
        ...state,
        paymentMethods: [action.method, ...state.paymentMethods],
        defaultPaymentMethodId: action.method.id,
      };
    case 'payment/setDefault':
      return { ...state, defaultPaymentMethodId: action.paymentMethodId };
    case 'ride/create':
      return { ...state, rides: [action.ride, ...state.rides] };
    case 'ride/updateStatus':
      return { ...state, rides: updateRide(state.rides, action.rideId, { status: action.status }) };
    case 'ride/setDriver':
      return {
        ...state,
        rides: updateRide(state.rides, action.rideId, { driver: action.driver, otp: action.otp }),
      };
    case 'ride/setFinalFare':
      return { ...state, rides: updateRide(state.rides, action.rideId, { finalFare: action.finalFare }) };
    case 'ride/rate':
      return { ...state, rides: updateRide(state.rides, action.rideId, { rating: action.rating }) };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

type Store = {
  state: ChaloRideState;
  dispatch: React.Dispatch<Action>;
};

const ChaloRideContext = createContext<Store | null>(null);

export function ChaloRideProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ChaloRideContext.Provider value={value}>{children}</ChaloRideContext.Provider>;
}

export function useChaloRideStore() {
  const ctx = useContext(ChaloRideContext);
  if (!ctx) throw new Error('useChaloRideStore must be used within ChaloRideProvider');
  return ctx;
}

export const RIDE_TYPES: RideType[] = [
  { id: 'bike', title: 'Bike', capacityText: '1 seat', baseFarePaise: 2500, perKmPaise: 900, etaMinutes: 2 },
  { id: 'auto', title: 'Auto', capacityText: '3 seats', baseFarePaise: 3500, perKmPaise: 1200, etaMinutes: 3 },
  { id: 'mini', title: 'Mini', capacityText: '4 seats', baseFarePaise: 5000, perKmPaise: 1500, etaMinutes: 4 },
  { id: 'sedan', title: 'Sedan', capacityText: '4 seats', baseFarePaise: 6500, perKmPaise: 1900, etaMinutes: 5 },
];

export function estimateFarePaise(rideTypeId: RideTypeId, distanceKm: number) {
  const rt = RIDE_TYPES.find((r) => r.id === rideTypeId) ?? RIDE_TYPES[0];
  return Math.round(rt.baseFarePaise + rt.perKmPaise * Math.max(1, distanceKm));
}

export function randomOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function randomDriver(): Driver {
  const names = ['Ravi', 'Aman', 'Sahil', 'Neha', 'Priya', 'Imran'];
  const vehicles = ['Honda Activa', 'Bajaj RE', 'Swift Dzire', 'WagonR', 'Hyundai Aura'];
  const plates = ['MH 01 AB 1234', 'DL 3C AX 7788', 'KA 05 MM 9090', 'UP 32 ZZ 4421'];
  return {
    name: names[Math.floor(Math.random() * names.length)]!,
    vehicle: vehicles[Math.floor(Math.random() * vehicles.length)]!,
    numberPlate: plates[Math.floor(Math.random() * plates.length)]!,
    rating: 4.2 + Math.random() * 0.7,
  };
}

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
