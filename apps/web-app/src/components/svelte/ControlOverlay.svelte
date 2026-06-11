<script lang="ts">
  import { 
    venues, 
    selectedVenue, 
    activeSession, 
    isChatOpen,
    selectVenue,
    startSession,
    updateSessionStatus
  } from '../../store/mapStore';
  import type { Venue } from '../../types';
  import AppBadge from './control/AppBadge.svelte';
  import SessionTracker from './control/SessionTracker.svelte';
  import VenuePanel from './control/VenuePanel.svelte';
  import ChatFAB from './control/ChatFAB.svelte';

  function handleVenueClick(venue: Venue) {
    selectVenue(venue);
  }

  function handleStartSession() {
    if ($selectedVenue) {
      startSession(`Hangout at ${$selectedVenue.name}`, $selectedVenue.coordinates);
    }
  }

  function handleGoEnRoute() {
    updateSessionStatus('EN_ROUTE');
  }

  function handleEndSession() {
    activeSession.set(null);
  }
</script>

<div class="overlay-container">
  
  <!-- Top Bar: App Title and Status -->
  <div class="top-bar">
    <AppBadge />
    <SessionTracker
      session={$activeSession}
      onGoEnRoute={handleGoEnRoute}
      onEndSession={handleEndSession}
    />
  </div>

  <!-- Bottom Area: Venue Browser & Chat FAB -->
  <div class="bottom-area">
    <VenuePanel
      venuesList={$venues}
      selectedVenue={$selectedVenue}
      activeSession={$activeSession}
      onVenueClick={handleVenueClick}
      onStartSession={handleStartSession}
    />
    <ChatFAB isChatOpen={$isChatOpen} />
  </div>
</div>

<style>
  .overlay-container {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: auto;
  }

  .bottom-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    pointer-events: auto;
  }
  @media (min-width: 768px) {
    .bottom-area {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  }
</style>
