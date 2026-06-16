<script lang="ts">
  import { locateUser, isLocating, userLocation } from '@/store/mapStore';

  function handleLocate() {
    locateUser();
  }

  $: label = $isLocating ? 'Locating...' : 'Locate Me';
</script>

<button
  on:click={handleLocate}
  class="pointer-events-auto flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-[18px] border border-white/8 bg-white/3 backdrop-blur-md text-text-primary shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-white/10 active:scale-95 cursor-pointer relative"
  class:animate-pulse={$isLocating}
  title={label}
  aria-label={label}
>
  <span class="transition-transform duration-300 rotate-0 hover:rotate-12">
    <!-- Phosphor GPS Target Icon -->
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 256 256" 
      fill="currentColor" 
      class="w-5 h-5 transition-colors duration-300"
      class:text-cyan-400={$userLocation !== null}
      class:text-text-primary={$userLocation === null}
    >
      <path d="M240,120H215.63A88.13,88.13,0,0,0,136,40.37V16a8,8,0,0,0-16,0V40.37A88.13,88.13,0,0,0,40.37,120H16a8,8,0,0,0,0,16H40.37A88.13,88.13,0,0,0,120,215.63V240a8,8,0,0,0,16,0V215.63A88.13,88.13,0,0,0,215.63,136H240a8,8,0,0,0,0-16ZM128,200a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Z"/>
    </svg>
  </span>
  
  {#if $isLocating}
    <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
    </span>
  {/if}
</button>
