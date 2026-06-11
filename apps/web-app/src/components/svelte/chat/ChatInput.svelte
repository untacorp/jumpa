<script lang="ts">
  export let value = '';
  export let onSend: () => void;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      onSend();
    }
  }
</script>

<div class="input-bar">
  <input
    type="text"
    placeholder="Type a message..."
    bind:value
    on:keydown={handleKeyDown}
    class="input-field"
  />
  <button on:click={onSend} class="btn-send" aria-label="Send message">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  </button>
</div>

<style>
  .input-bar {
    display: flex;
    gap: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 16px;
    margin-top: 16px;
  }

  .input-field {
    flex: 1;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background-color: rgba(255, 255, 255, 0.02);
    padding: 10px 16px;
    font-size: 12px;
    color: var(--text-primary);
    outline: none;
    transition: all 0.2s ease;
  }
  .input-field:focus {
    border-color: rgba(6, 182, 212, 0.4);
    background-color: rgba(255, 255, 255, 0.05);
  }
  .input-field::placeholder {
    color: var(--text-muted);
  }

  .btn-send {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background-color: var(--color-cyan-500);
    color: #02040a;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .btn-send:hover {
    background-color: var(--color-cyan-400);
  }
  .btn-send:active {
    transform: scale(0.95);
  }
</style>
