<script lang="ts">
  import { activeTab, startSession } from '@/store/mapStore';
  import { 
    Bell, 
    Warning, 
    Megaphone, 
    Users, 
    MapPin, 
    Bicycle, 
    Car, 
    Bus, 
    Footprints, 
    Check, 
    X 
  } from 'phosphor-svelte';

  type ActivitySubTab = 'notifications' | 'history';
  let activeSubTab: ActivitySubTab = 'notifications';

  type NotificationFilter = 'all' | 'invites' | 'system' | 'promos';
  let activeFilter: NotificationFilter = 'all';

  // Sample data
  const notifications = [
    {
      id: 'notif-1',
      type: 'invite',
      initiator: 'Eka',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
      title: 'Eka invited group SCBD Coffee Club to meet at Giyanti Coffee Roastery',
      time: '5 mins ago',
      unread: true,
      venueName: 'Giyanti Coffee Roastery',
      coords: [106.8402, -6.1895]
    },
    {
      id: 'notif-2',
      type: 'system',
      title: 'Sesi Jumpa will auto-cancel in 5 minutes',
      subtitle: 'Travel times have exceeded maximum ETA limits.',
      time: '12 mins ago',
      unread: false
    },
    {
      id: 'notif-3',
      type: 'promo',
      title: 'SCBD Common Ground: Buy 1 Get 1 Coffee!',
      subtitle: 'Flash deal for premium B2B members in SCBD district.',
      time: '1 hour ago',
      unread: false
    },
    {
      id: 'notif-4',
      type: 'social',
      title: 'Your review for Gelora Bung Karno Park got 10 likes!',
      subtitle: 'Earned 50 contribution points.',
      time: '2 hours ago',
      unread: false
    }
  ];

  const historyItems = [
    {
      id: 'hist-1',
      status: 'completed',
      date: 'Saturday, 14 Jun',
      venue: 'SCBD Common Ground',
      address: 'Sudirman Central Business District',
      isMedian: true,
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'
      ],
      reviewed: true
    },
    {
      id: 'hist-2',
      status: 'cancelled',
      date: 'Friday, 12 Jun',
      venue: 'Kopi Toko Djawa (Menteng)',
      address: 'Jl. Johar No.34, Menteng',
      isMedian: false,
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'
      ],
      reviewed: false
    }
  ];

  // Confirmation sheet state
  let selectedNotif: any = null;
  let showConfirmsheet = false;
  let transportMode = 'bike';

  function openConfirmation(notif: any) {
    selectedNotif = notif;
    showConfirmsheet = true;
  }

  function handleConfirmation(choice: 'accept' | 'decline') {
    if (choice === 'accept' && selectedNotif) {
      startSession(`Meet at ${selectedNotif.venueName}`, selectedNotif.coords);
      activeTab.set('map');
    }
    showConfirmsheet = false;
    selectedNotif = null;
  }

  function handleQuickReinvite(item: any) {
    startSession(`Hangout at ${item.venue}`, [106.8095, -6.2244]); // mock SCBD coordinates
    activeTab.set('map');
  }

  $: filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'invites') return n.type === 'invite';
    if (activeFilter === 'system') return n.type === 'system';
    if (activeFilter === 'promos') return n.type === 'promo';
    return true;
  });
</script>

<div class="flex flex-col h-full bg-[var(--bg-slate-950)] text-[var(--text-primary)] border-r border-[var(--bg-slate-800)] relative">
  <!-- Header -->
  <div class="px-6 pt-6 pb-4 border-b border-[var(--bg-slate-800)]">
    <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
      Activity Hub
    </h1>
    
    <!-- Segmented Tab Control -->
    <div class="mt-4 flex bg-[var(--bg-slate-900)] border border-[var(--bg-slate-800)] p-1 rounded-xl relative">
      <button 
        on:click={() => activeSubTab = 'notifications'}
        class="flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all duration-300 relative z-10 cursor-pointer {activeSubTab === 'notifications' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
      >
        Notifications
        {#if notifications.some(n => n.unread)}
          <span class="absolute top-2 right-4 w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
          <span class="absolute top-2 right-4 w-2 h-2 rounded-full bg-cyan-500"></span>
        {/if}
      </button>
      <button 
        on:click={() => activeSubTab = 'history'}
        class="flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all duration-300 relative z-10 cursor-pointer {activeSubTab === 'history' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
      >
        History
      </button>
      
      <!-- Sliding indicator -->
      <div 
        class="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[var(--bg-slate-950)] rounded-lg transition-transform duration-300 ease-out shadow-sm"
        style="transform: translateX({activeSubTab === 'history' ? '100%' : '0%'}); border: 1px solid var(--border-glass);"
      ></div>
    </div>
  </div>

  <!-- Content List Area -->
  <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
    {#if activeSubTab === 'notifications'}
      <!-- Notification filter chips -->
      <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
        {#each ['all', 'invites', 'system', 'promos'] as filter}
          <button
            on:click={() => activeFilter = filter as NotificationFilter}
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap {activeFilter === filter ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 shadow-sm' : 'bg-[var(--bg-slate-900)] border-[var(--bg-slate-800)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
          >
            {filter}
          </button>
        {/each}
      </div>

      <!-- Notification list -->
      {#if filteredNotifications.length === 0}
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-12 h-12 rounded-full bg-[var(--bg-slate-900)] flex items-center justify-center border border-[var(--bg-slate-800)] mb-4">
            <Bell size={20} class="text-[var(--text-muted)]" />
          </div>
          <p class="text-sm font-bold text-[var(--text-primary)]">No new alerts</p>
          <p class="text-xs text-[var(--text-muted)] mt-1 max-w-[200px]">Invite friends to hang out from the map or chat tabs!</p>
        </div>
      {:else}
        <div class="flex flex-col gap-3">
          {#each filteredNotifications as notif}
            <div 
              class="p-4 rounded-xl border transition-all duration-300 relative {notif.unread ? 'bg-cyan-500/5 border-cyan-500/20 shadow-sm' : 'bg-[var(--bg-slate-900)] border-[var(--bg-slate-800)] hover:bg-[var(--bg-slate-800)]'}"
            >
              <div class="flex gap-3">
                {#if notif.avatar}
                  <div class="relative flex-shrink-0">
                    <img src={notif.avatar} alt="Avatar" class="w-10 h-10 rounded-full border border-[var(--bg-slate-800)]" />
                    <div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-slate-950)] flex items-center justify-center">
                      <MapPin size={8} class="text-white" weight="fill" />
                    </div>
                  </div>
                {:else}
                  <div class="w-10 h-10 rounded-full bg-[var(--bg-slate-900)] border border-[var(--bg-slate-800)] flex items-center justify-center text-[var(--text-primary)] flex-shrink-0">
                    {#if notif.type === 'system'}
                      <Warning size={18} class="text-red-500" weight="bold" />
                    {:else if notif.type === 'promo'}
                      <Megaphone size={18} class="text-yellow-600" weight="bold" />
                    {:else}
                      <Users size={18} class="text-emerald-500" weight="bold" />
                    {/if}
                  </div>
                {/if}

                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold leading-snug text-[var(--text-primary)]">{notif.title}</p>
                  {#if notif.subtitle}
                    <p class="text-[11px] text-[var(--text-secondary)] mt-1 leading-normal">{notif.subtitle}</p>
                  {/if}
                  <span class="text-[9px] text-[var(--text-muted)] block mt-1.5">{notif.time}</span>
                  
                  {#if notif.type === 'invite'}
                    <button 
                      on:click={() => openConfirmation(notif)}
                      class="mt-3 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      Konfirmasi / Detail
                    </button>
                  {:else if notif.type === 'system'}
                    <button 
                      on:click={() => activeTab.set('map')}
                      class="mt-3 px-3 py-1.5 bg-[var(--bg-slate-900)] hover:bg-[var(--bg-slate-800)] text-[var(--text-primary)] text-[10px] border border-[var(--bg-slate-800)] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer"
                    >
                      Open Map
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- History Tab -->
      <div class="flex flex-col gap-6">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3 block">This Week</span>
          <div class="flex flex-col gap-3">
            {#each historyItems as item}
              <div class="p-4 rounded-xl border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)] hover:bg-[var(--bg-slate-800)] transition-all duration-300">
                <div class="flex justify-between items-start mb-3">
                  <span class="text-[9px] text-[var(--text-muted)]">{item.date}</span>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-md {item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-[var(--bg-slate-800)] text-[var(--text-muted)] border border-[var(--bg-slate-800)]'}">
                    {item.status.toUpperCase()}
                  </span>
                </div>
                
                <div class="flex gap-3">
                  <!-- Map thumbnail mock -->
                  <div class="w-16 h-16 rounded-xl border border-[var(--bg-slate-800)] relative overflow-hidden flex-shrink-0 bg-[var(--bg-slate-800)]">
                    <div class="absolute inset-0 opacity-40 {item.status === 'cancelled' ? 'grayscale' : ''}" style="background-image: radial-gradient(#22c55e 1px, transparent 1px); background-size: 8px 8px;"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full {item.status === 'completed' ? 'bg-cyan-500 shadow-[0_0_8px_var(--primary-500)]' : 'bg-[var(--text-muted)]'}"></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold leading-snug truncate text-[var(--text-primary)]">{item.venue}</p>
                    <p class="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{item.address}</p>
                    {#if item.isMedian}
                      <span class="inline-block mt-1 text-[8px] bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                        📍 Chosen by algorithm
                      </span>
                    {/if}

                    <!-- Overlapping avatars -->
                    <div class="flex -space-x-2 mt-2">
                      {#each item.avatars as avatar}
                        <img src={avatar} alt="Avatar" class="w-5 h-5 rounded-full border border-[var(--bg-slate-950)] object-cover" />
                      {/each}
                    </div>
                  </div>
                </div>

                {#if item.status === 'completed'}
                  <div class="border-t border-[var(--bg-slate-800)] mt-4 pt-3 flex justify-between gap-2">
                    <button class="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border border-[var(--bg-slate-800)] bg-[var(--bg-slate-950)] hover:bg-[var(--bg-slate-900)] text-[var(--text-primary)] transition-all cursor-pointer text-center">
                      {item.reviewed ? 'View Review' : 'Give Review'}
                    </button>
                    <button 
                      on:click={() => handleQuickReinvite(item)}
                      class="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 transition-all cursor-pointer text-center"
                    >
                      Gather here again
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Inline Confirmation Bottom Sheet Modal -->
{#if showConfirmsheet && selectedNotif}
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
    <div class="w-full bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] rounded-t-3xl p-6 shadow-2xl pointer-events-auto">
      <div class="w-12 h-1.5 bg-[var(--bg-slate-800)] rounded-full mx-auto mb-6"></div>
      
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-base font-extrabold text-[var(--text-primary)]">Join spatial meeting?</h2>
          <p class="text-xs text-[var(--text-secondary)] mt-1">Destination: {selectedNotif.venueName}</p>
        </div>
        <button on:click={() => showConfirmsheet = false} class="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div class="mb-6">
        <label class="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Choose Transportation</label>
        <div class="grid grid-cols-4 gap-2">
          {#each [
            { id: 'bike', label: 'Bike', icon: Bicycle },
            { id: 'car', label: 'Car', icon: Car },
            { id: 'transit', label: 'Transit', icon: Bus },
            { id: 'walking', label: 'Walking', icon: Footprints }
          ] as transport}
            <button 
              on:click={() => transportMode = transport.id}
              class="py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all {transportMode === transport.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 shadow-sm' : 'bg-[var(--bg-slate-900)] border-[var(--bg-slate-800)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
            >
              <svelte:component this={transport.icon} size={20} weight={transportMode === transport.id ? 'bold' : 'regular'} />
              <span class="text-[9px] mt-0.5">{transport.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="flex gap-3">
        <button 
          on:click={() => handleConfirmation('decline')}
          class="flex-1 py-3 border border-[var(--bg-slate-800)] rounded-xl text-xs font-bold text-center text-red-500 hover:bg-[var(--bg-slate-900)] transition-all active:scale-95 cursor-pointer"
        >
          Decline
        </button>
        <button 
          on:click={() => handleConfirmation('accept')}
          class="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-md"
        >
          Join / Go
        </button>
      </div>
    </div>
  </div>
{/if}

