<script lang="ts">
  import type { JumpaSession } from '@/types';
  import Panel from '@/components/svelte/Panel.svelte';
  import Button from '@/components/svelte/Button.svelte';

  export let session: JumpaSession | null;
  export let onGoEnRoute: () => void;
  export let onEndSession: () => void;
</script>

{#if session}
  <Panel class="!flex-row items-center gap-2 md:gap-4 px-3 md:px-5 py-2 md:py-3 !rounded-[18px]">
    <div class="text-right">
      <p class="text-[8px] md:text-[9px] uppercase tracking-wider text-cyan-400 font-extrabold mb-0.5">{session.status} MODE</p>
      <p class="text-[10px] md:text-xs font-semibold text-text-primary max-w-[100px] md:max-w-none truncate">{session.name}</p>
    </div>
    <div class="flex gap-1.5 md:gap-2">
      {#if session.status === 'DISCOVERY'}
        <Button variant="primary" on:click={onGoEnRoute} class="!px-2.5 md:!px-3.5 !py-1.5 md:!py-2 !rounded-xl text-[10px] md:text-xs">
          Start Journey
        </Button>
      {/if}
      <Button variant="danger" on:click={onEndSession} class="!px-2.5 md:!px-3.5 !py-1.5 md:!py-2 !rounded-xl text-[10px] md:text-xs">
        End
      </Button>
    </div>
  </Panel>
{/if}
