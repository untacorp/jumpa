<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    activeTab, 
    setActiveTab, 
    venues, 
    selectedVenue, 
    selectVenue, 
    startSession,
    activeSession
  } from '@/store/mapStore';
  import type { NavigationTab } from '@/store/mapStore';
  
  import { 
    MapTrifold, 
    Chats, 
    Bell, 
    User, 
    MagnifyingGlass, 
    X,
    ArrowRight
  } from 'phosphor-svelte';

  import ChatPanel from '../chat/ChatPanel.svelte';
  import ActivityPanel from './ActivityPanel.svelte';
  import ProfilePanel from './ProfilePanel.svelte';

  // State
  let currentTab: NavigationTab = 'map';
  let searchText = '';
  let showDiscoverySheet = false;
  let showHandoffMenu = false;

  // Subscribe to nanostore activeTab
  activeTab.subscribe((val) => {
    currentTab = val;
    handleViewportShift(val);
  });

  function handleTabClick(tab: NavigationTab) {
    setActiveTab(tab);
  }

  // Adjust map viewport position dynamically based on viewport size and tab
  function handleViewportShift(tab: NavigationTab) {
    if (typeof window === 'undefined') return;
    const viewport = document.getElementById('map-viewport');
    if (!viewport) return;

    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      // Shift map to the right of vertical nav (72px) + panel (408px) = 480px
      if (tab === 'map') {
        viewport.style.left = '72px';
        viewport.style.width = 'calc(100% - 72px)';
      } else {
        viewport.style.left = '480px';
        viewport.style.width = 'calc(100% - 480px)';
      }
    } else {
      // Mobile full screen map
      viewport.style.left = '0';
      viewport.style.width = '100%';
    }
  }

  onMount(() => {
    // Initial viewport shift
    handleViewportShift(currentTab);
    
    // Listen to resize events
    const resizeListener = () => handleViewportShift(currentTab);
    window.addEventListener('resize', resizeListener);
    
    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  });

  // Handoff logic (Ajak Grup ke Sini)
  const mockGroups = [
    { id: 'group-1', name: 'Grup Tongkrongan' },
    { id: 'group-2', name: 'SCBD Coffee Club' }
  ];

  function initiateSocialHandoff(group: any) {
    if (!$selectedVenue) return;
    
    // 1. Start session in store
    startSession(`Meeting: ${group.name}`, $selectedVenue.coordinates);
    
    // 2. Hide handoff menu & reset selectedVenue details
    showHandoffMenu = false;
    
    // 3. Navigate to Chat tab
    setActiveTab('chat');
  }

  $: showDiscoveryToggle = currentTab === 'map' && !showDiscoverySheet && !$selectedVenue;
</script>

<div class="absolute inset-0 z-20 pointer-events-none flex flex-col md:flex-row h-full w-full font-['Plus_Jakarta_Sans',sans-serif]">
  
  <!-- DESKTOP NAVIGATION SIDEBAR (Visible only on md screens and above) -->
  <div class="hidden md:flex flex-col items-center py-6 w-[72px] bg-[var(--bg-slate-950)] border-r border-[var(--bg-slate-800)] z-30 pointer-events-auto justify-between flex-shrink-0">
    <div class="flex flex-col items-center gap-6 w-full">
      <!-- Logo App -->
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_4px_12px_rgba(6,182,212,0.15)]">
        <span class="text-slate-950 font-black text-sm">J</span>
      </div>
      
      <!-- Nav Icons -->
      <div class="flex flex-col gap-4 w-full px-2">
        <button 
          on:click={() => handleTabClick('map')}
          class="w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'map' ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
          title="Map"
        >
          <MapTrifold size={20} weight={currentTab === 'map' ? 'bold' : 'regular'} />
          <span class="text-[8px] font-bold uppercase tracking-wider">Map</span>
        </button>

        <button 
          on:click={() => handleTabClick('chat')}
          class="w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'chat' ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
          title="Chat"
        >
          <Chats size={20} weight={currentTab === 'chat' ? 'bold' : 'regular'} />
          <span class="text-[8px] font-bold uppercase tracking-wider">Chat</span>
        </button>

        <button 
          on:click={() => handleTabClick('activity')}
          class="w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'activity' ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
          title="Activity"
        >
          <Bell size={20} weight={currentTab === 'activity' ? 'bold' : 'regular'} />
          <span class="text-[8px] font-bold uppercase tracking-wider">Activity</span>
        </button>

        <button 
          on:click={() => handleTabClick('profile')}
          class="w-full py-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'profile' ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
          title="Profile"
        >
          <User size={20} weight={currentTab === 'profile' ? 'bold' : 'regular'} />
          <span class="text-[8px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  </div>

  <!-- MASTER DISPLAY PANEL (Left docked panel in desktop, overlays map on mobile when active) -->
  {#if currentTab !== 'map'}
    <div 
      class="w-full md:w-[408px] h-[calc(100vh-68px)] md:h-full z-30 pointer-events-auto transition-transform duration-500 flex-shrink-0"
    >
      {#if currentTab === 'chat'}
        <ChatPanel />
      {:else if currentTab === 'activity'}
        <ActivityPanel />
      {:else if currentTab === 'profile'}
        <ProfilePanel />
      {/if}
    </div>
  {/if}

  <!-- OVERLAYS FOR MAP TAB (Only active when Map tab is selected) -->
  {#if currentTab === 'map'}
    <!-- Floating Search Bar Overlay -->
    <div class="absolute top-4 left-4 right-4 md:left-[100px] md:right-auto md:w-[360px] z-30 pointer-events-auto">
      <div class="relative glass-panel rounded-2xl flex items-center px-4 py-3 border border-[var(--bg-slate-800)] shadow-2xl bg-[var(--bg-slate-950)]/90 backdrop-blur-md">
        <MagnifyingGlass size={18} class="text-cyan-500 mr-3" weight="bold" />
        <input 
          type="text" 
          bind:value={searchText}
          placeholder="Cari tempat nongkrong..." 
          class="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full focus:ring-0"
        />
      </div>
    </div>

    <!-- Floating Toggle Button for Discovery Sheet -->
    {#if showDiscoveryToggle}
      <div class="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
        <button 
          on:click={() => showDiscoverySheet = true}
          class="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_4px_15px_rgba(6,182,212,0.3)] cursor-pointer transition-all"
        >
          Explore Places
        </button>
      </div>
    {/if}

    <!-- Discovery Feed Bottom Sheet -->
    {#if showDiscoverySheet}
      <div class="absolute inset-x-0 bottom-0 bg-slate-950/20 z-30 flex items-end justify-center pointer-events-auto h-full">
        <div class="w-full md:w-[460px] bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] rounded-t-3xl p-6 glass-panel flex flex-col max-h-[60vh] shadow-[0_-10px_30px_rgba(15,23,42,0.05)]">
          <div class="w-12 h-1.5 bg-[var(--bg-slate-800)] rounded-full mx-auto mb-4 cursor-pointer" on:click={() => showDiscoverySheet = false}></div>
          
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">Curated Discovery Feed</h3>
            <button on:click={() => showDiscoverySheet = false} class="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer text-xs font-bold">Close</button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {#each $venues as venue}
              <button 
                on:click={() => {
                  selectVenue(venue);
                  showDiscoverySheet = false;
                }}
                class="flex gap-4 p-3 rounded-xl border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)] hover:bg-[var(--bg-slate-800)] transition-all text-left w-full cursor-pointer"
              >
                <!-- Thumbnail placeholder -->
                <div class="w-16 h-16 rounded-lg bg-[var(--bg-slate-800)] flex-shrink-0 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10"></div>
                  <span class="absolute top-1 right-1 text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1 rounded font-bold">★ {venue.weight}</span>
                </div>
                
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-[var(--text-primary)] truncate">{venue.name}</h4>
                  <span class="text-[9px] text-cyan-600 font-bold mt-0.5 block capitalize">{venue.category.replace(/_/g, ' ')}</span>
                  <p class="text-[10px] text-[var(--text-muted)] mt-1 truncate">{venue.address}</p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Place Details Profile Bottom Sheet (Clicked marker detail) -->
    {#if $selectedVenue && !showHandoffMenu}
      <div class="absolute inset-x-0 bottom-0 bg-slate-950/20 z-30 flex items-end justify-center pointer-events-auto h-full">
        <div class="w-full md:w-[460px] bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] rounded-t-3xl p-6 glass-panel shadow-[0_-10px_30px_rgba(15,23,42,0.05)]">
          <div class="w-12 h-1.5 bg-[var(--bg-slate-800)] rounded-full mx-auto mb-4 cursor-pointer" on:click={() => selectVenue(null)}></div>
          
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-sm font-extrabold text-[var(--text-primary)]">{$selectedVenue.name}</h2>
              <span class="text-[10px] text-cyan-600 font-bold mt-0.5 block capitalize">{$selectedVenue.category.replace(/_/g, ' ')} • ★ {$selectedVenue.weight}</span>
            </div>
            <button on:click={() => selectVenue(null)} class="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <p class="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{$selectedVenue.address}</p>

          <div class="flex gap-2">
            <button 
              on:click={() => selectVenue(null)}
              class="flex-1 py-3 border border-[var(--bg-slate-800)] rounded-xl text-xs font-bold text-center text-[var(--text-secondary)] hover:bg-[var(--bg-slate-900)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              on:click={() => showHandoffMenu = true}
              class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl text-xs font-extrabold text-center transition-all cursor-pointer shadow-[0_4px_12px_rgba(6,182,212,0.25)]"
            >
              Ajak Grup ke Sini
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Social Handoff Group Selection Menu overlay -->
    {#if showHandoffMenu && $selectedVenue}
      <div class="absolute inset-0 bg-slate-950/20 z-40 flex items-end justify-center pointer-events-auto h-full">
        <div class="w-full md:w-[460px] bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] rounded-t-3xl p-6 glass-panel shadow-[0_-10px_30px_rgba(15,23,42,0.05)]">
          <div class="w-12 h-1.5 bg-[var(--bg-slate-800)] rounded-full mx-auto mb-4 cursor-pointer" on:click={() => showHandoffMenu = false}></div>
          
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Ajak ke: {$selectedVenue.name}</h2>
              <p class="text-xs text-[var(--text-secondary)] mt-1">Pilih grup untuk memulai ruang pertemuan</p>
            </div>
            <button on:click={() => showHandoffMenu = false} class="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div class="flex flex-col gap-2 mb-4">
            {#each mockGroups as group}
              <button 
                on:click={() => initiateSocialHandoff(group)}
                class="w-full p-3.5 rounded-xl border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)] hover:bg-[var(--bg-slate-800)] text-left text-xs font-bold text-[var(--text-primary)] transition-all flex justify-between items-center cursor-pointer"
              >
                {group.name}
                <div class="flex items-center gap-1 text-cyan-600">
                  <span>Invite</span>
                  <ArrowRight size={14} />
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- MOBILE NAVIGATION BOTTOM NAVBAR (Visible absolutely at bottom on mobile) -->
  <div class="absolute bottom-0 inset-x-0 md:hidden flex h-[68px] bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] z-30 pointer-events-auto justify-around items-center px-4">
    <button 
      on:click={() => handleTabClick('map')}
      class="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'map' ? 'text-cyan-600' : 'text-[var(--text-muted)]'}"
    >
      <MapTrifold size={20} weight={currentTab === 'map' ? 'bold' : 'regular'} />
      <span class="text-[9px] font-bold uppercase tracking-wider">Map</span>
    </button>

    <button 
      on:click={() => handleTabClick('chat')}
      class="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'chat' ? 'text-cyan-600' : 'text-[var(--text-muted)]'}"
    >
      <Chats size={20} weight={currentTab === 'chat' ? 'bold' : 'regular'} />
      <span class="text-[9px] font-bold uppercase tracking-wider">Chat</span>
    </button>

    <button 
      on:click={() => handleTabClick('activity')}
      class="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'activity' ? 'text-cyan-600' : 'text-[var(--text-muted)]'}"
    >
      <Bell size={20} weight={currentTab === 'activity' ? 'bold' : 'regular'} />
      <span class="text-[9px] font-bold uppercase tracking-wider">Activity</span>
    </button>

    <button 
      on:click={() => handleTabClick('profile')}
      class="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all {currentTab === 'profile' ? 'text-cyan-600' : 'text-[var(--text-muted)]'}"
    >
      <User size={20} weight={currentTab === 'profile' ? 'bold' : 'regular'} />
      <span class="text-[9px] font-bold uppercase tracking-wider">Profile</span>
    </button>
  </div>

</div>
