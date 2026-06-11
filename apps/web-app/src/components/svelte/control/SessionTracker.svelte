<script lang="ts">
  import type { JumpaSession } from '../../../types';

  export let session: JumpaSession | null;
  export let onGoEnRoute: () => void;
  export let onEndSession: () => void;
</script>

{#if session}
  <div class="session-tracker glass-panel">
    <div class="session-info">
      <p class="session-status">{session.status} MODE</p>
      <p class="session-name">{session.name}</p>
    </div>
    <div class="button-group">
      {#if session.status === 'DISCOVERY'}
        <button on:click={onGoEnRoute} class="btn-primary">
          Start Journey
        </button>
      {/if}
      <button on:click={onEndSession} class="btn-danger">
        End
      </button>
    </div>
  </div>
{/if}

<style>
  .session-tracker {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    border-radius: 18px;
  }

  .session-info {
    text-align: right;
  }

  .session-status {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-cyan-400);
    font-weight: 800;
    margin: 0 0 2px 0;
  }

  .session-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .btn-primary {
    background-color: var(--color-cyan-500);
    color: #02040a;
    border: none;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background-color: var(--color-cyan-400);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
  }
  .btn-primary:active {
    transform: scale(0.95);
  }

  .btn-danger {
    background-color: rgba(239, 68, 68, 0.15);
    color: var(--color-red-400);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-danger:hover {
    background-color: var(--color-red-500);
    color: white;
    border-color: var(--color-red-500);
  }
  .btn-danger:active {
    transform: scale(0.95);
  }
</style>
