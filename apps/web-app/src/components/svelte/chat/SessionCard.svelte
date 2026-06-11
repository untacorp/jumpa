<script lang="ts">
  import type { JumpaSession } from '../../../types';

  export let session: JumpaSession | null;
</script>

{#if session}
  <div class="session-info-card">
    <p class="session-info-label">Target Destination</p>
    <p class="session-info-name">{session.name}</p>
    <div class="session-info-meta">
      <span class="session-status-badge">{session.status}</span>
      <span>• Coordinates: {session.destination ? session.destination.map(n => n.toFixed(4)).join(', ') : ''}</span>
    </div>
  </div>
{/if}

<style>
  .session-info-card {
    background-color: rgba(6, 182, 212, 0.06);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .session-info-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--color-cyan-300);
    text-transform: uppercase;
    margin: 0;
  }

  .session-info-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 2px 0 0 0;
  }

  .session-info-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 8px;
  }

  .session-status-badge {
    background-color: var(--bg-space);
    color: var(--color-cyan-400);
    border: 1px solid rgba(6, 182, 212, 0.2);
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
