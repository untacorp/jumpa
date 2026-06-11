<script lang="ts">
  import { toggleChat } from '../../../store/mapStore';
</script>

<div class="header">
  <div class="title-area">
    <div class="icon-box">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 16px; height: 16px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    </div>
    <div class="title-meta">
      <h2 class="title">Session Hub Chat</h2>
      <div class="user-count-row">
        <span class="user-pulse"></span>
        <span class="user-count-text">3 Active Users</span>
      </div>
    </div>
  </div>
  
  <button on:click={() => toggleChat(false)} class="close-btn" aria-label="Close chat">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  </button>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background-color: rgba(6, 182, 212, 0.1);
    color: var(--color-cyan-400);
    border: 1px solid rgba(6, 182, 212, 0.2);
  }

  .title-meta {
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .user-count-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  .user-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-emerald-500);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }

  .user-count-text {
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .close-btn {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background-color: rgba(255, 255, 255, 0.03);
    padding: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }
</style>
