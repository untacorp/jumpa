<script lang="ts">
  import type { ChatMessage } from '../../../types';
  import MessageItem from './MessageItem.svelte';

  export let messages: ChatMessage[];
</script>

<div id="chat-feed" class="message-feed custom-scrollbar">
  {#each messages as msg (msg.id)}
    <MessageItem {msg} />
  {/each}
</div>

<style>
  .message-feed {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 4px;
  }
</style>
