<script lang="ts">
  import { 
    Gear, 
    Trophy, 
    Lock, 
    Star, 
    ThumbsUp, 
    X 
  } from 'phosphor-svelte';

  type ProfileSubTab = 'lists' | 'reviews';
  let activeSubTab: ProfileSubTab = 'lists';

  // Stats & User mock data
  const user = {
    name: 'Kadek Agus Arya Pranata',
    username: '@aryapranata',
    bio: 'Spatial Explorer. Looking for the perfect cup of coffee in Jakarta. ☕📍',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    friends: 120,
    jumpas: 45,
    level: 'Local Explorer',
    points: 840,
    nextLevelPoints: 1000
  };

  // Mock list cards
  const curatedLists = [
    {
      id: 'list-1',
      title: 'Spot Nugas Cozy',
      count: 12,
      private: false,
      covers: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=60&h=60&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=60&h=60&fit=crop',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=60&h=60&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=60&h=60&fit=crop'
      ]
    },
    {
      id: 'list-2',
      title: 'Secret Coffee Spots',
      count: 6,
      private: true,
      covers: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=60&h=60&fit=crop',
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=60&h=60&fit=crop'
      ]
    }
  ];

  // Mock review cards
  const reviews = [
    {
      id: 'rev-1',
      venue: 'Giyanti Coffee Roastery',
      stars: 5,
      comment: 'Best cold brew in town! The outdoor seating is very cozy and perfect for working.',
      likes: 12,
      photos: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop'
      ]
    },
    {
      id: 'rev-2',
      venue: 'Gelora Bung Karno Park',
      stars: 4,
      comment: 'Very spacious park. Nice place to run in the morning or have a picnic with friends.',
      likes: 8,
      photos: []
    }
  ];

  // Leaderboard state
  let showLeaderboard = false;
  const leaderboard = [
    { name: 'Kadek Agus (You)', rank: 1, points: 840, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
    { name: 'Eka Wijaya', rank: 2, points: 790, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' },
    { name: 'Luh Putu', rank: 3, points: 620, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' }
  ];

  // Settings state
  let showSettings = false;
  let shareLocationOnActive = true;
  let publicAccount = true;
</script>

<div class="flex flex-col h-full bg-[var(--bg-slate-950)] text-[var(--text-primary)] border-r border-[var(--bg-slate-800)] relative">
  <!-- Top header row with Settings icon -->
  <div class="absolute top-6 right-6 z-10">
    <button 
      on:click={() => showSettings = true}
      class="w-10 h-10 rounded-xl bg-[var(--bg-slate-900)] border border-[var(--bg-slate-800)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate-800)] transition-all cursor-pointer"
    >
      <Gear size={20} />
    </button>
  </div>

  <!-- Profile Identity Header -->
  <div class="px-6 pt-10 pb-4 flex flex-col items-center border-b border-[var(--bg-slate-800)] text-center">
    <div class="relative">
      <img src={user.avatar} alt="Profile Avatar" class="w-20 h-20 rounded-full object-cover border-2 border-cyan-500 shadow-sm" />
      <span class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--bg-slate-950)] flex items-center justify-center"></span>
    </div>
    
    <h2 class="text-base font-extrabold text-[var(--text-primary)] mt-3 leading-tight">{user.name}</h2>
    <span class="text-xs text-[var(--text-muted)] mt-0.5">{user.username}</span>
    <p class="text-[11px] text-[var(--text-secondary)] max-w-[280px] mt-2 leading-relaxed">{user.bio}</p>

    <!-- Metrics Bar -->
    <div class="w-full grid grid-cols-2 gap-4 border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)] rounded-xl p-3 mt-4">
      <div class="text-center border-r border-[var(--bg-slate-800)]">
        <span class="text-base font-extrabold text-[var(--text-primary)]">{user.friends}</span>
        <span class="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mt-0.5">Friends</span>
      </div>
      <div class="text-center">
        <span class="text-base font-extrabold text-[var(--text-primary)]">{user.jumpas}</span>
        <span class="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mt-0.5">Jumpas</span>
      </div>
    </div>
  </div>

  <!-- Gamification Level Bar -->
  <div class="px-6 py-4 border-b border-[var(--bg-slate-800)]">
    <button 
      on:click={() => showLeaderboard = true}
      class="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--bg-slate-800)] bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 hover:from-cyan-500/10 hover:to-emerald-500/10 transition-all cursor-pointer text-left"
    >
      <div class="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 flex-shrink-0">
        <Trophy size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-bold text-[var(--text-primary)] leading-none">{user.level}</span>
          <span class="text-[9px] font-bold text-cyan-600">{user.points}/{user.nextLevelPoints} XP</span>
        </div>
        <div class="w-full h-1.5 bg-[var(--bg-slate-900)] rounded-full overflow-hidden border border-[var(--bg-slate-800)]">
          <div class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style="width: {(user.points / user.nextLevelPoints) * 100}%"></div>
        </div>
      </div>
    </button>
  </div>

  <!-- UGC Tabs Navigation -->
  <div class="px-6 pt-4 border-b border-[var(--bg-slate-800)]">
    <div class="flex border-b border-[var(--bg-slate-800)]">
      <button 
        on:click={() => activeSubTab = 'lists'}
        class="flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer {activeSubTab === 'lists' ? 'border-cyan-500 text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
      >
        Place-lists
      </button>
      <button 
        on:click={() => activeSubTab = 'reviews'}
        class="flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer {activeSubTab === 'reviews' ? 'border-cyan-500 text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
      >
        Reviews
      </button>
    </div>
  </div>

  <!-- UGC Content list -->
  <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
    {#if activeSubTab === 'lists'}
      <div class="grid grid-cols-2 gap-3">
        {#each curatedLists as list}
          <div class="p-3 rounded-xl border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)] hover:bg-[var(--bg-slate-800)] transition-all duration-300 relative group cursor-pointer">
            <!-- Thumbnails grid (up to 4) -->
            <div class="grid grid-cols-2 gap-1 rounded-lg overflow-hidden bg-[var(--bg-slate-800)] border border-[var(--bg-slate-800)] aspect-square mb-2.5">
              {#each list.covers as cover}
                <img src={cover} alt="Cover" class="w-full h-full object-cover" />
              {/each}
              {#if list.covers.length < 4}
                {#each Array(4 - list.covers.length) as _}
                  <div class="bg-[var(--bg-slate-900)] w-full h-full"></div>
                {/each}
              {/if}
            </div>

            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-xs font-bold text-[var(--text-primary)] group-hover:text-cyan-600 transition-colors leading-tight truncate max-w-[100px]">{list.title}</h4>
                <span class="text-[9px] text-[var(--text-muted)] mt-0.5 block">{list.count} Places</span>
              </div>
              {#if list.private}
                <span class="text-[var(--text-muted)]" title="Private list">
                  <Lock size={12} class="inline-block align-middle" />
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex flex-col gap-4">
        {#each reviews as rev}
          <div class="p-4 rounded-xl border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)]">
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-xs font-bold text-[var(--text-primary)] hover:text-cyan-600 cursor-pointer">{rev.venue}</span>
              <div class="flex gap-0.5 text-yellow-500">
                {#each Array(5) as _, i}
                  <Star size={12} weight={i < rev.stars ? 'fill' : 'regular'} />
                {/each}
              </div>
            </div>
            
            <p class="text-[11px] text-[var(--text-secondary)] leading-relaxed">{rev.comment}</p>
            
            {#if rev.photos.length > 0}
              <div class="flex gap-2 mt-3">
                {#each rev.photos as photo}
                  <img src={photo} alt="Review" class="w-12 h-12 rounded-lg border border-[var(--bg-slate-800)] object-cover" />
                {/each}
              </div>
            {/if}

            <div class="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[var(--bg-slate-800)] text-[9px] text-[var(--text-muted)]">
              <ThumbsUp size={10} class="inline" />
              <span>{rev.likes} Likes</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Leaderboard Sheet Overlay -->
{#if showLeaderboard}
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
    <div class="w-full bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] rounded-t-3xl p-6 shadow-2xl pointer-events-auto">
      <div class="w-12 h-1.5 bg-[var(--bg-slate-800)] rounded-full mx-auto mb-6"></div>
      
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-base font-extrabold text-[var(--text-primary)]">Leaderboard</h2>
          <p class="text-xs text-[var(--text-secondary)] mt-1">Friends-only contribution stats</p>
        </div>
        <button on:click={() => showLeaderboard = false} class="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div class="flex flex-col gap-2 mb-4">
        {#each leaderboard as member}
          <div class="flex items-center justify-between p-3 rounded-xl border border-[var(--bg-slate-800)] bg-[var(--bg-slate-900)]">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-cyan-600 w-4">{member.rank}</span>
              <img src={member.avatar} alt="Avatar" class="w-8 h-8 rounded-full border border-[var(--bg-slate-800)] object-cover" />
              <span class="text-xs font-bold text-[var(--text-primary)]">{member.name}</span>
            </div>
            <span class="text-xs font-extrabold text-emerald-600">{member.points} XP</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<!-- Settings Sheet Overlay -->
{#if showSettings}
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
    <div class="w-full bg-[var(--bg-slate-950)] border-t border-[var(--bg-slate-800)] rounded-t-3xl p-6 shadow-2xl pointer-events-auto">
      <div class="w-12 h-1.5 bg-[var(--bg-slate-800)] rounded-full mx-auto mb-6"></div>
      
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-base font-extrabold text-[var(--text-primary)]">Settings</h2>
          <p class="text-xs text-[var(--text-secondary)] mt-1">Profile & privacy options</p>
        </div>
        <button on:click={() => showSettings = false} class="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div class="flex flex-col gap-4 mb-6">
        <!-- Switch 1 -->
        <div class="flex items-center justify-between">
          <div class="flex-1 pr-4">
            <span class="text-xs font-bold text-[var(--text-primary)] block">Share Active Location</span>
            <span class="text-[10px] text-[var(--text-muted)] mt-0.5 block leading-normal">Let friends see your live GPS path on the map during an active meeting.</span>
          </div>
          <button 
            on:click={() => shareLocationOnActive = !shareLocationOnActive}
            class="w-11 h-6 rounded-full p-1 cursor-pointer transition-all flex items-center flex-shrink-0 {shareLocationOnActive ? 'bg-cyan-500 justify-end' : 'bg-[var(--bg-slate-800)] justify-start'}"
          >
            <div class="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        <!-- Switch 2 -->
        <div class="flex items-center justify-between">
          <div class="flex-1 pr-4">
            <span class="text-xs font-bold text-[var(--text-primary)] block">Public Account Visibility</span>
            <span class="text-[10px] text-[var(--text-muted)] mt-0.5 block leading-normal">Allow strangers to discover your account via search. Otherwise, only invites work.</span>
          </div>
          <button 
            on:click={() => publicAccount = !publicAccount}
            class="w-11 h-6 rounded-full p-1 cursor-pointer transition-all flex items-center flex-shrink-0 {publicAccount ? 'bg-cyan-500 justify-end' : 'bg-[var(--bg-slate-800)] justify-start'}"
          >
            <div class="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

