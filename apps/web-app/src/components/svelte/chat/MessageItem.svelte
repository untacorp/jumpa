<script lang="ts">
  import type { ChatMessage } from '../../../types';

  export let msg: ChatMessage;
</script>

{#if msg.isSystem}
  <div class="system-message-row">
    <span class="system-message">{msg.text}</span>
  </div>
{:else}
  <div class="message-row {msg.sender === 'You' ? 'sent' : 'received'}">
    <div class="message-bubble-header">
      <span class="sender-name">{msg.sender}</span>
      <span class="message-time">{msg.time}</span>
    </div>
    <div class="message-bubble">
      {msg.text}
    </div>
  </div>
{/if}

<style>
  .system-message-row {
    display: flex;
    justify-content: center;
    margin: 8px 0;
  }

  .system-message {
    background-color: var(--bg-space);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: var(--color-cyan-400);
    font-size: 9px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    text-align: center;
  }

  .message-row {
    display: flex;
    flex-direction: column;
  }
  .message-row.sent {
    align-items: flex-end;
  }
  .message-row.received {
    align-items: flex-start;
  }

  .message-bubble-header {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 2px;
  }

  .sender-name {
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
  }

  .message-time {
    font-size: 8.5px;
    color: var(--text-muted);
  }

  .message-bubble {
    max-width: 80%;
    border-radius: 16px;
    padding: 10px 14px;
    font-size: 12px;
    line-height: 1.5;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .message-row.sent .message-bubble {
    background: linear-gradient(135deg, var(--color-cyan-600), var(--color-cyan-500));
    color: #02040a;
    border-top-right-radius: 0;
    font-weight: 500;
  }
  .message-row.received .message-bubble {
    background-color: var(--bg-slate-900);
    color: var(--text-primary);
    border-top-left-radius: 0;
    border-color: rgba(255, 255, 255, 0.06);
  }
</style>
