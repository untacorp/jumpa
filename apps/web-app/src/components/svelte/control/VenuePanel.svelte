<script lang="ts">
  import type { Venue, JumpaSession } from '../../../types';

  export let venuesList: readonly Venue[];
  export let selectedVenue: Venue | null;
  export let activeSession: JumpaSession | null;
  export let onVenueClick: (venue: Venue) => void;
  export let onStartSession: () => void;
</script>

<div class="venue-panel glass-panel">
  <div class="panel-header">
    <h2 class="panel-title">Discover Locations</h2>
    <span class="panel-badge">{venuesList.length} spots</span>
  </div>

  <!-- Scrollable List of Venues -->
  <div class="venue-list custom-scrollbar">
    {#each venuesList as venue (venue.id)}
      <button
        on:click={() => onVenueClick(venue)}
        class="venue-item {selectedVenue?.id === venue.id ? 'selected' : ''}"
      >
        <div class="venue-info-text">
          <span class="venue-name">{venue.name}</span>
          <span class="venue-address">{venue.address}</span>
        </div>
        <div class="venue-meta">
          <span class="venue-category">{venue.category}</span>
          <span class="venue-rating">★ {venue.weight}</span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Selected Venue Details Action -->
  {#if selectedVenue}
    <div class="selected-detail">
      <div class="selected-meta">
        <span class="selected-label">Selected Hub</span>
        <span class="selected-name">{selectedVenue.name}</span>
      </div>
      {#if !activeSession}
        <button on:click={onStartSession} class="btn-action">
          <span>Jumpa Here!</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="action-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .venue-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 290px;
    border-radius: 24px;
    padding: 20px;
  }
  @media (min-width: 768px) {
    .venue-panel {
      max-width: 380px;
    }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .panel-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin: 0;
  }

  .panel-badge {
    background-color: var(--bg-slate-800);
    color: var(--text-secondary);
    font-family: monospace;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .venue-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 140px;
    padding-right: 4px;
  }

  .venue-item {
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .venue-item:hover {
    border-color: var(--bg-slate-800);
    background-color: rgba(255, 255, 255, 0.03);
  }
  .venue-item.selected {
    border-color: rgba(6, 182, 212, 0.4);
    background-color: rgba(6, 182, 212, 0.08);
  }

  .venue-info-text {
    display: flex;
    flex-direction: column;
  }

  .venue-name {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .venue-address {
    font-size: 9.5px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .venue-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .venue-category {
    background-color: var(--bg-space);
    color: var(--color-cyan-400);
    font-size: 8.5px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    border: 1px solid rgba(6, 182, 212, 0.15);
  }

  .venue-rating {
    font-size: 9.5px;
    color: var(--color-yellow-500);
    font-weight: 700;
    margin-top: 4px;
  }

  .selected-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
    margin-top: 12px;
  }

  .selected-meta {
    display: flex;
    flex-direction: column;
  }

  .selected-label {
    font-size: 9px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--text-muted);
  }

  .selected-name {
    font-size: 12px;
    font-weight: 800;
    color: var(--color-cyan-300);
  }

  .btn-action {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: var(--color-cyan-500);
    color: #02040a;
    border: none;
    border-radius: 12px;
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
    transition: all 0.2s ease;
  }
  .btn-action:hover {
    background-color: var(--color-cyan-400);
    box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4);
    transform: translateY(-1px);
  }
  .btn-action:active {
    transform: translateY(0) scale(0.95);
  }

  .action-icon {
    width: 14px;
    height: 14px;
  }
</style>
