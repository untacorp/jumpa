<script lang="ts">
  import { useStore } from '@nanostores/react';
  import { 
    activeSession, 
    startSession, 
    updateSessionStatus, 
    selectedVenue,
    selectVenue,
    activeTab
  } from '@/store/mapStore';
  import type { SessionStatus } from '@/types';
  
  import { 
    PaperPlaneTilt, 
    Plus, 
    MapPin, 
    Bicycle, 
    Car, 
    Bus, 
    Footprints, 
    CaretLeft, 
    Check, 
    X 
  } from 'phosphor-svelte';

  // State
  let selectedGroup: any = null;
  let chatText = '';
  let showAddMenu = false;
  let rsvpStatus: 'idle' | 'joined' | 'declined' = 'idle';
  let showLobbyDetails = false;

  // Mock Groups data
  const groups = [
    {
      id: 'group-1',
      name: 'Grup Tongkrongan',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
      lastMessage: 'Yuk kumpul nugas santai',
      time: '14:02',
      unread: 1
    },
    {
      id: 'group-2',
      name: 'SCBD Coffee Club',
      avatar: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=100&h=100&fit=crop',
      lastMessage: 'Giyanti coffee enakk sih',
      time: 'Kemarin',
      unread: 0
    }
  ];

  // Mock chat messages
  let messages = [
    { id: 'm1', sender: 'Eka', text: 'Oi, kumpul nugas santai sore ini kuy', isSelf: false },
    { id: 'm2', sender: 'Luh Putu', text: 'Kuyy, di mana?', isSelf: false }
  ];

  function openChat(group: any) {
    selectedGroup = group;
  }

  function closeChat() {
    selectedGroup = null;
  }

  function sendMessage() {
    if (!chatText.trim()) return;
    messages = [...messages, {
      id: `m-${Date.now()}`,
      sender: 'Me',
      text: chatText,
      isSelf: true
    }];
    chatText = '';
  }

  function initiateSesi() {
    startSession(`Meeting: ${selectedGroup.name}`, [106.8402, -6.1895]); // coordinates of Giyanti
    showAddMenu = false;
  }

  function handleRsvp(choice: 'joined' | 'declined') {
    rsvpStatus = choice;
    if (choice === 'joined') {
      updateSessionStatus('VOTING');
    }
  }

  function triggerNavigation() {
    updateSessionStatus('EN_ROUTE');
    activeTab.set('map'); // switch view to map to show route
  }

  function cancelSesi() {
    activeSession.set(null);
    rsvpStatus = 'idle';
  }
</script>

<div class="flex flex-col h-full bg-[var(--bg-slate-950)] text-[var(--text-primary)] border-r border-[var(--bg-slate-800)] relative font-['Plus_Jakarta_Sans',sans-serif]">
  
  {#if !selectedGroup}
    <!-- Screen 1: Master Chat List -->
    <div class="px-6 pt-6 pb-4 border-b border-[var(--bg-slate-800)] bg-[var(--bg-slate-950)]">
      <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
        Chat
      </h1>
      <!-- Search chat input -->
      <div class="mt-4 relative">
        <input 
          type="text" 
          placeholder="Search conversation..." 
          class="w-full bg-[var(--bg-slate-900)] border border-[var(--bg-slate-800)] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 text-[var(--text-primary)] placeholder-[var(--text-muted)]" 
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
      <div class="flex flex-col gap-2">
        {#each groups as group}
          <button 
            on:click={() => openChat(group)}
            class="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-[var(--bg-slate-800)] hover:bg-[var(--bg-slate-900)] transition-all cursor-pointer text-left w-full"
          >
            <div class="flex items-center gap-3 min-w-0">
              <img src={group.avatar} alt="Avatar" class="w-11 h-11 rounded-full object-cover border border-[var(--bg-slate-800)]" />
              <div class="min-w-0">
                <h3 class="text-xs font-bold text-[var(--text-primary)] leading-snug">{group.name}</h3>
                <p class="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate max-w-[180px]">{group.lastMessage}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-[9px] text-[var(--text-muted)]">{group.time}</span>
              {#if group.unread > 0}
                <span class="w-4 h-4 bg-cyan-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center mt-1 mx-auto">
                  {group.unread}
                </span>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </div>

  {:else}
    <!-- Screen 2: Detailed Chat Room -->
    <!-- Chat Header -->
    <div class="px-4 py-4 border-b border-[var(--bg-slate-800)] flex items-center justify-between bg-[var(--bg-slate-900)]/40 relative z-20">
      <div class="flex items-center gap-3">
        <button on:click={closeChat} class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer mr-1">
          <CaretLeft size={20} weight="bold" />
        </button>
        <img src={selectedGroup.avatar} alt="Avatar" class="w-9 h-9 rounded-full object-cover border border-[var(--bg-slate-800)]" />
        <div>
          <h3 class="text-xs font-bold text-[var(--text-primary)] leading-tight">{selectedGroup.name}</h3>
          <span class="text-[9px] text-emerald-600 block mt-0.5 font-bold">Online</span>
        </div>
      </div>

      <!-- Sesi Active Pill Board -->
      {#if $activeSession}
        <button 
          on:click={() => showLobbyDetails = !showLobbyDetails}
          class="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-cyan-500/20 transition-all"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span class="text-[9px] font-extrabold uppercase tracking-wider">
            {#if $activeSession.status === 'DISCOVERY'}
              Status: 2/3 Siap
            {:else if $activeSession.status === 'VOTING'}
              Voting State
            {:else}
              On Route
            {/if}
          </span>
        </button>
      {/if}
    </div>

    <!-- Active Lobby Details dropdown board -->
    {#if $activeSession && showLobbyDetails}
      <div class="px-6 py-4 bg-[var(--bg-slate-900)] border-b border-[var(--bg-slate-800)] flex flex-col gap-2 relative z-10">
        <div class="flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
          <span>Lobby Status</span>
          <button on:click={cancelSesi} class="text-red-500 hover:text-red-600 cursor-pointer font-bold">Cancel Session</button>
        </div>
        <div class="flex flex-col gap-1.5 mt-1">
          <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--bg-slate-950)] border border-[var(--bg-slate-800)]">
            <span class="text-[var(--text-primary)] font-semibold">Me (You)</span>
            <span class="text-cyan-600 text-[10px] uppercase font-bold">Joined • Bike</span>
          </div>
          <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--bg-slate-950)] border border-[var(--bg-slate-800)]">
            <span class="text-[var(--text-primary)] font-semibold">Eka</span>
            <span class="text-cyan-600 text-[10px] uppercase font-bold">Joined • Car</span>
          </div>
          <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--bg-slate-950)] border border-[var(--bg-slate-800)]">
            <span class="text-[var(--text-primary)] font-semibold">Luh Putu</span>
            <span class="text-[var(--text-muted)] text-[10px] uppercase font-bold">Waiting...</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Chat Messages Stream -->
    <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 custom-scrollbar bg-[var(--bg-slate-900)]/20">
      {#each messages as msg}
        <div class="flex flex-col {msg.isSelf ? 'items-end' : 'items-start'}">
          <span class="text-[9px] text-[var(--text-secondary)] mb-0.5">{msg.sender}</span>
          <div class="px-3.5 py-2 rounded-2xl max-w-[80%] text-xs font-semibold leading-normal {msg.isSelf ? 'bg-cyan-500 text-white rounded-tr-sm shadow-[0_3px_10px_rgba(6,182,212,0.2)]' : 'bg-[var(--bg-slate-950)] border border-[var(--bg-slate-800)] text-[var(--text-primary)] rounded-tl-sm'}">
            {msg.text}
          </div>
        </div>
      {/each}

      <!-- Sesi Jumpa Active status card inside Chat -->
      {#if $activeSession}
        <div class="p-4 rounded-2xl border border-cyan-500/20 bg-[var(--bg-slate-950)] flex flex-col gap-3 my-2 shadow-[0_4px_15px_rgba(15,23,42,0.03)] border-l-4 border-l-cyan-500">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
              <MapPin size={18} weight="bold" />
            </div>
            <div>
              <h4 class="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Sesi Jumpa Active</h4>
              <p class="text-[9px] text-[var(--text-secondary)] mt-0.5">Destination: Giyanti Coffee Roastery</p>
            </div>
          </div>

          {#if rsvpStatus === 'idle'}
            <div class="flex gap-2 border-t border-[var(--bg-slate-800)] pt-3">
              <button 
                on:click={() => handleRsvp('declined')}
                class="flex-1 py-2 rounded-lg border border-[var(--bg-slate-800)] hover:bg-[var(--bg-slate-900)] text-[10px] font-bold text-center text-red-500 cursor-pointer"
              >
                Decline
              </button>
              <button 
                on:click={() => handleRsvp('joined')}
                class="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-bold text-center cursor-pointer shadow-[0_3px_8px_rgba(6,182,212,0.2)]"
              >
                Join Sesi
              </button>
            </div>
          {:else if rsvpStatus === 'joined'}
            <div class="border-t border-[var(--bg-slate-800)] pt-3 flex flex-col gap-2">
              <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check size={14} weight="bold" />
                Joined! Waiting for other members...
              </span>
              
              {#if $activeSession.status === 'VOTING'}
                <button 
                  on:click={triggerNavigation}
                  class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-lg cursor-pointer transition-all active:scale-95 text-center shadow-[0_4px_12px_rgba(6,182,212,0.25)]"
                >
                  Start Route Navigation
                </button>
              {/if}
            </div>
          {:else}
            <span class="text-[10px] text-[var(--text-secondary)] font-bold border-t border-[var(--bg-slate-800)] pt-3 block flex items-center gap-1">
              <X size={14} weight="bold" />
              You declined this meeting session.
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Chat input box -->
    <div class="p-4 border-t border-[var(--bg-slate-800)] bg-[var(--bg-slate-950)] relative">
      <!-- Add menu dropdown (Popup menu for Sesi Jumpa) -->
      {#if showAddMenu}
        <div class="absolute bottom-[80px] left-4 bg-[var(--bg-slate-950)] border border-[var(--bg-slate-800)] rounded-2xl p-2 w-[180px] shadow-xl z-30">
          <button 
            on:click={initiateSesi}
            class="w-full text-left p-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-slate-900)] flex items-center gap-2.5 cursor-pointer"
          >
            <MapPin size={16} class="text-cyan-500" weight="bold" />
            Start Sesi Jumpa
          </button>
        </div>
      {/if}

      <div class="flex items-center gap-2">
        <button 
          on:click={() => showAddMenu = !showAddMenu}
          class="w-10 h-10 rounded-xl bg-[var(--bg-slate-900)] border border-[var(--bg-slate-800)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate-800)] transition-all cursor-pointer flex-shrink-0"
        >
          <Plus size={20} weight="bold" />
        </button>

        <input 
          type="text" 
          bind:value={chatText}
          placeholder="Type message..." 
          on:keydown={(e) => e.key === 'Enter' && sendMessage()}
          class="flex-1 bg-[var(--bg-slate-900)] border border-[var(--bg-slate-800)] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 text-[var(--text-primary)] placeholder-[var(--text-muted)]" 
        />

        <button 
          on:click={sendMessage}
          class="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 transition-all active:scale-95 cursor-pointer flex-shrink-0 shadow-[0_4px_12px_rgba(6,182,212,0.25)]"
        >
          <PaperPlaneTilt size={18} weight="bold" />
        </button>
      </div>
    </div>
  {/if}
</div>
