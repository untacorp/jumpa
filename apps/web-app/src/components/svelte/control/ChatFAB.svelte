<script lang="ts">
  import { toggleChat, setBlackholeOrigin } from '../../../store/mapStore';

  export let isChatOpen: boolean;

  let chatButtonEl: HTMLButtonElement;

  function handleChatToggle() {
    if (chatButtonEl) {
      const rect = chatButtonEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setBlackholeOrigin(x, y);
    }
    toggleChat();
  }
</script>

<div class="fab-wrapper">
  <button
    bind:this={chatButtonEl}
    on:click={handleChatToggle}
    class="fab-button"
    aria-label="Toggle Chat"
  >
    <span class="fab-ping"></span>
    
    {#if isChatOpen}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="fab-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="fab-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.598.598 0 0 1-.655-.705l.408-1.9a7.95 7.95 0 0 1-1.393-4.576C3.77 7.444 7.8 3.75 12.75 3.75S21 7.444 21 12Z" />
      </svg>
    {/if}
  </button>
</div>

<style>
  .fab-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  .fab-button {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-cyan-600), var(--color-cyan-400));
    color: #02040a;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .fab-button:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 32px rgba(6, 182, 212, 0.5);
  }
  .fab-button:active {
    transform: scale(0.95);
  }

  .fab-ping {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--color-cyan-400);
    opacity: 0.2;
    animation: ping 2s infinite;
  }

  .fab-icon {
    width: 24px;
    height: 24px;
  }

  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
</style>
