import { atom } from 'nanostores';
import type { Venue, JumpaSession, SessionStatus } from '../types';

// Global state atoms (No $ prefix to avoid Svelte syntax errors)
export const mapCenter = atom<readonly [number, number]>([115.1800, -8.6700]); // Default to South Bali (Denpasar/Seminyak) for POI testing
export const mapZoom = atom<number>(12);
export const isChatOpen = atom<boolean>(false);
export const blackholeOrigin = atom<{ x: number; y: number }>({ x: 0, y: 0 });
export const activeSession = atom<JumpaSession | null>(null);
export const userLocation = atom<readonly [number, number] | null>(null);
export const isLocating = atom<boolean>(false);

// Selected venue / active marker
export const selectedVenue = atom<Venue | null>(null);

// Active Navigation Tab: map, chat, activity, profile
export type NavigationTab = 'map' | 'chat' | 'activity' | 'profile';
export const activeTab = atom<NavigationTab>('map');

export function setActiveTab(tab: NavigationTab) {
  activeTab.set(tab);
}

// Map theme mode: auto (time-based), day, night, sunset
export type MapThemeMode = 'auto' | 'day' | 'night' | 'sunset';
export const mapTheme = atom<MapThemeMode>('auto');

export function setMapTheme(mode: MapThemeMode) {
  mapTheme.set(mode);
}

// Synchronize mapTheme state with HTML root element data-theme attribute
if (typeof document !== 'undefined') {
  mapTheme.subscribe((theme) => {
    let activeTheme: string = theme;
    if (theme === 'auto') {
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 5) activeTheme = 'night';
      else if (hour >= 5 && hour < 8) activeTheme = 'sunrise';
      else if (hour >= 8 && hour < 17) activeTheme = 'day';
      else activeTheme = 'sunset';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  });
}

// Sample venues around Indonesia
export const venues = atom<readonly Venue[]>([]);

// Helper functions to mutate state
export function setMapCenter(lng: number, lat: number) {
  mapCenter.set([lng, lat]);
}

export function setMapZoom(zoomVal: number) {
  mapZoom.set(zoomVal);
}

export function toggleChat(open?: boolean) {
  const current = isChatOpen.get();
  isChatOpen.set(open !== undefined ? open : !current);
}

export function setBlackholeOrigin(x: number, y: number) {
  blackholeOrigin.set({ x, y });
}

export function startSession(name: string, destination: readonly [number, number]) {
  activeSession.set({
    id: `session-${Math.random().toString(36).substr(2, 9)}`,
    name,
    status: 'DISCOVERY',
    destination,
  });
}

export function updateSessionStatus(status: SessionStatus) {
  const current = activeSession.get();
  if (current) {
    activeSession.set({ ...current, status });
  }
}

export function selectVenue(venue: Venue | null) {
  selectedVenue.set(venue);
  if (venue) {
    setMapCenter(venue.coordinates[0], venue.coordinates[1]);
    // Only adjust zoom if the current view is zoomed out further than 15.5
    if (mapZoom.get() < 15.5) {
      setMapZoom(15.5);
    }
  }
}

let watchId: any = null;

export function locateUser() {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    console.warn('Geolocation not supported');
    return;
  }
  
  isLocating.set(true);
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { longitude, latitude } = position.coords;
      userLocation.set([longitude, latitude]);
      setMapCenter(longitude, latitude);
      setMapZoom(15);
      isLocating.set(false);
      
      // Start tracking position continuously
      startTrackingUserLocation();
    },
    (error) => {
      console.error('Error locating user:', error);
      isLocating.set(false);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

export function startTrackingUserLocation() {
  if (typeof window === 'undefined' || !navigator.geolocation) return;
  if (watchId !== null) return;
  
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { longitude, latitude } = position.coords;
      userLocation.set([longitude, latitude]);
    },
    (error) => {
      console.warn('Error watching user location:', error);
    },
    { enableHighAccuracy: true }
  );
}

export function stopTrackingUserLocation() {
  if (typeof window !== 'undefined' && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
