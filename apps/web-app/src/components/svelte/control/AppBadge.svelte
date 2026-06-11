<div class="app-badge glass-panel">
  <div class="status-dot-container">
    <span class="status-dot-ping"></span>
    <span class="status-dot"></span>
  </div>
  <div class="app-info">
    <h1 class="app-title">JUMPA</h1>
    <p class="app-subtitle">Real-time Spatial Matching</p>
  </div>
</div>

<style>
  .app-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-radius: 18px;
  }

  .status-dot-container {
    position: relative;
    display: flex;
    width: 12px;
    height: 12px;
  }

  .status-dot-ping {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--color-cyan-400);
    opacity: 0.75;
    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .status-dot {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--color-cyan-500);
  }

  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .app-info {
    display: flex;
    flex-direction: column;
  }

  .app-title {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--text-primary);
    text-transform: uppercase;
    line-height: 1.2;
    margin: 0;
  }

  .app-subtitle {
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 500;
    margin: 0;
  }
</style>
