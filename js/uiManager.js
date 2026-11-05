// js/uiManager.js — Multiplayer Screens, 3-Column Room Lobby, Live Caterpillar Podium, Modifier Draft & Cup Podium
import {
  GAMEPLAY_CONFIG,
  CATERPILLAR_CLASSES,
  BODY_SHAPES,
  RACE_MODIFIERS,
  CUPS_DEFINITIONS,
  ROOM_SETTINGS,
  GRIP_STYLES,
  COSMETICS_CATALOG,
  isCosmeticUnlocked,
  unlockRandomCosmeticGift,
  getUnlockedCosmeticsCount
} from './gameplayConfig.js';
import { COSMETIC_PALETTES, Caterpillar } from './caterpillar.js';
import { LEVEL_DEFINITIONS } from './levels.js';
import { sound } from './audio.js';

export class UIManager {
  constructor(game, network) {
    this.game = game;
    this.network = network;

    // Active screen: 'home' | 'lobbies' | 'room' | 'game'
    this.activeScreen = 'home';
    this.activeWorkshopTab = 'palette'; // 'palette' | 'hat' | 'grip' | 'face' | 'classes'

    // Preview caterpillar for Home & Room Lobby canvases
    this.previewCat = new Caterpillar(0, 0, { isRemote: false });
    this.previewCat.hideFloatingTag = true;

    this.selectedModifierId = null;
    this.hasClaimedCupGift = false;
    this.countdownInterval = null;
    this.previewRafId = null;

    this.initDOM();
    this.bindNetworkEvents();
    this.refreshServerInfo();
    this.syncPreviewCaterpillar();
  }

  initDOM() {
    const wrapper = document.getElementById('game-wrapper');
    if (!wrapper) return;

    const uiContainer = document.createElement('div');
    uiContainer.id = 'mp-ui-root';
    uiContainer.innerHTML = `
      <!-- ==================== 1. ÉCRAN D'ACCUEIL ==================== -->
      <section id="screen-home" class="mp-screen">
        <div class="mp-forest-bg"></div>

        <!-- Top Wood Sign Bar -->
        <header class="mp-top-bar">
          <div class="wood-sign-badge">
            <span class="wood-bolt left"></span>
            <span class="logo-leaf">🌿</span>
            <span class="wood-title">SLIP GRIP</span>
            <span class="wood-sub">CHAMPIONNAT MULTIJOUEUR</span>
            <span class="wood-bolt right"></span>
          </div>

          <div class="home-top-right">
            <div class="pseudo-pill">
              <label for="home-pseudo-input">🐛 Pseudo :</label>
              <input id="home-pseudo-input" type="text" maxlength="16" placeholder="Chenille" />
            </div>
            <div class="cosmetics-counter-pill" id="home-cosmetics-count" title="Cosmétiques débloqués en remportant des Coupes">
              🎁 <span id="unlocked-count-txt">0/0</span> Cosmétiques
            </div>
            <button id="btn-solo-practice" class="wood-btn small-btn">
              🎯 Entraînement Solo
            </button>
          </div>
        </header>

        <!-- Center Hero Card -->
        <div class="home-center-stage">
          <div class="home-hero-panel">
            <div class="hero-wood-header">
              <span class="wood-bolt left"></span>
              <h1>COURSE DE CHENILLES & COMBAT PVP</h1>
              <span class="wood-bolt right"></span>
            </div>

            <p class="hero-tagline">
              Affrontez vos amis dans le même monde ! Saisissez les autres chenilles, lancez-leur des glands et des ennemis, et décrochez des <strong>Modificateurs de rattrapage</strong> sur 3 courses pour remporter un <strong>Cadeau Cosmétique</strong> !
            </p>

            <!-- Live Caterpillar Podium Canvas -->
            <div class="home-preview-stage">
              <canvas id="home-preview-canvas" width="460" height="175"></canvas>
              <div class="preview-stage-caption" id="home-preview-caption">Votre Chenille</div>
            </div>

            <!-- Main Action Buttons -->
            <div class="home-main-actions">
              <button id="btn-home-create-room" class="cartoon-cta-btn green-cta">
                <span class="cta-icon">🏠</span>
                <div class="cta-text">
                  <strong>CRÉER UNE ROOM</strong>
                  <small>Héberger une Coupe (Admin)</small>
                </div>
              </button>

              <button id="btn-home-join-lobbies" class="cartoon-cta-btn orange-cta">
                <span class="cta-icon">🌐</span>
                <div class="cta-text">
                  <strong>REJOINDRE UNE ROOM</strong>
                  <small>Voir les salons ouverts (<span id="home-open-rooms-badge">0</span>)</small>
                </div>
              </button>
            </div>

            <div class="home-secondary-actions">
              <button id="btn-home-customize" class="wood-btn">
                🎨 Atelier & Cosmétiques
              </button>
              <button id="btn-home-rules" class="wood-btn">
                ❓ Contrôles & Règles
              </button>
            </div>
          </div>

          <!-- LAN Server & QR Code Signpost -->
          <aside class="lan-qr-signpost">
            <div class="wood-sign-header">📡 SERVEUR LOCAL / LAN</div>
            <div class="lan-qr-body">
              <div class="lan-status-row">
                <span id="net-status-dot" class="status-dot offline"></span>
                <span id="net-status-text">Connexion au serveur...</span>
              </div>
              <div class="qr-box">
                <img id="lan-qr-img" alt="QR Code LAN" src="" />
              </div>
              <p class="lan-url-label">Rejoindre sur le même Wi-Fi :</p>
              <code id="lan-url-code" class="lan-url-code">http://localhost:8090</code>
            </div>
          </aside>
        </div>
      </section>

      <!-- ==================== 2. ÉCRAN DES SALONS OUVERTS ==================== -->
      <section id="screen-lobbies" class="mp-screen hidden">
        <div class="mp-forest-bg"></div>

        <header class="mp-top-bar">
          <button id="btn-lobbies-back" class="wood-btn">◀ Retour Accueil</button>
          <div class="wood-sign-badge">
            <span class="wood-bolt left"></span>
            <span class="wood-title">🌐 SALONS OUVERTS</span>
            <span class="wood-bolt right"></span>
          </div>
          <button id="btn-lobbies-refresh" class="wood-btn">🔄 Actualiser</button>
        </header>

        <div class="lobbies-container">
          <!-- Direct Code Join + Create Room Bar -->
          <div class="lobbies-action-bar dark-glass-panel">
            <div class="join-code-group">
              <label for="input-room-code">🔑 Rejoindre avec un code :</label>
              <input id="input-room-code" type="text" maxlength="6" placeholder="Ex: 4829" />
              <button id="btn-join-by-code" class="cartoon-btn green-btn">Rejoindre ▶</button>
            </div>

            <div class="create-room-group">
              <button id="btn-lobbies-create" class="cartoon-btn orange-btn">➕ Créer une Nouvelle Room</button>
            </div>
          </div>

          <!-- Open Rooms Table / Cards -->
          <div class="lobbies-list-panel dark-glass-panel">
            <div class="panel-wood-header">
              <span>LISTE DES ROOMS DISPONIBLES EN DIRECT</span>
              <span id="lobbies-count-badge" class="pill-badge">0 salon ouvert</span>
            </div>
            <div id="open-lobbies-list" class="open-lobbies-grid"></div>
          </div>
        </div>
      </section>

      <!-- ==================== 3. SALON D'ATTENTE / ROOM LOBBY (3 COLONNES) ==================== -->
      <section id="screen-room-lobby" class="mp-screen hidden">
        <div class="mp-forest-bg"></div>

        <header class="mp-top-bar">
          <button id="btn-leave-room" class="wood-btn danger-wood">◀ Quitter la Room</button>

          <div class="wood-sign-badge">
            <span class="wood-bolt left"></span>
            <span id="room-header-title" class="wood-title">SALON DE COURSE</span>
            <span id="room-header-code" class="room-code-pill">CODE: ----</span>
            <span class="wood-bolt right"></span>
          </div>

          <div class="room-top-status">
            <span id="room-role-badge" class="role-badge">JOUEUR</span>
          </div>
        </header>

        <!-- 3-Column Layout: 30% Players / 45% Workshop / 25% Cup & Admin Settings -->
        <div class="room-three-cols">
          <!-- COLUMN 1 (30%): JOUEURS DE LA ROOM -->
          <div class="room-col col-players dark-glass-panel">
            <div class="panel-wood-header">
              <span>👥 JOUEURS CONNECTÉS</span>
              <span id="room-players-count" class="pill-badge">1/4</span>
            </div>

            <div class="room-pseudo-editor">
              <label for="room-pseudo-input">Votre Pseudo :</label>
              <div class="pseudo-input-row">
                <input id="room-pseudo-input" type="text" maxlength="16" placeholder="Votre pseudo..." />
                <button id="btn-save-pseudo" class="mini-wood-btn">OK</button>
              </div>
            </div>

            <div id="room-players-list" class="room-players-list"></div>
          </div>

          <!-- COLUMN 2 (45%): ATELIER DE LA CHENILLE -->
          <div class="room-col col-workshop dark-glass-panel">
            <div class="panel-wood-header">
              <span>🎨 ATELIER DE LA CHENILLE</span>
              <span id="workshop-unlocked-pill" class="pill-badge gold-pill">🎁 0/0</span>
            </div>

            <!-- Live Caterpillar Podium Preview -->
            <div class="workshop-podium-box">
              <canvas id="room-preview-canvas" width="480" height="165"></canvas>
              <div class="podium-wooden-base">
                <span id="workshop-cat-summary">Vert Pomme • Couronne • Ventouses Classiques</span>
              </div>
            </div>

            <!-- Category Tabs -->
            <div class="workshop-tabs" id="workshop-tabs">
              <button class="ws-tab active" data-tab="palette">🎨 Couleurs</button>
              <button class="ws-tab" data-tab="hat">🎩 Chapeaux</button>
              <button class="ws-tab" data-tab="grip">🧲 Ventouses</button>
              <button class="ws-tab" data-tab="face">😊 Visages</button>
              <button class="ws-tab" data-tab="classes">🐛 Espèce</button>
            </div>

            <!-- Options Grid -->
            <div id="workshop-items-grid" class="workshop-items-grid"></div>
          </div>

          <!-- COLUMN 3 (25%): COUPE & PARAMÈTRES DE L'ADMIN -->
          <div class="room-col col-admin dark-glass-panel">
            <div class="panel-wood-header">
              <span>🏆 COUPE & PARAMÈTRES</span>
              <span id="admin-lock-badge" class="pill-badge">👑 Admin</span>
            </div>

            <div class="admin-scroll-body">
              <!-- Cup Selection (3 Races) - Designated Square / Card -->
              <div class="admin-block">
                <div class="admin-block-header">
                  <label class="admin-block-title">🏆 Coupe de la Compétition :</label>
                </div>
                <div id="room-cup-slot-container" class="room-cup-slot-container"></div>
              </div>

              <!-- Host Gameplay Settings -->
              <div class="admin-block">
                <div class="admin-block-header">
                  <label class="admin-block-title">⚙️ Réglages de la Partie :</label>
                  <button id="btn-reset-room-settings" class="mini-wood-btn" title="Réinitialiser les réglages">🔄 Défaut</button>
                </div>

                <div class="room-sliders-list" id="room-settings-list">
                  <!-- Built from ROOM_SETTINGS (gameplayConfig.js) by renderRoomSettingsControls -->
                </div>
              </div>
            </div>

            <!-- Launch / Ready Footer -->
            <div class="room-launch-footer">
              <button id="btn-room-start-cup" class="cartoon-cta-btn green-cta full-width">
                <span class="cta-icon">🏁</span>
                <div class="cta-text">
                  <strong id="btn-room-start-label">LANCER LA COUPE !</strong>
                  <small id="btn-room-start-sub">3 Courses • Modificateurs & Cadeau</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== 4. HUD MULTIJOUEUR EN COURSE ==================== -->
      <div id="mp-race-hud" class="mp-race-hud hidden">
        <!-- Top-Left Live Standings Cards -->
        <div id="mp-live-standings" class="mp-live-standings"></div>

        <!-- Top-Center Cup Race Indicator & 20s Finish Countdown -->
        <div class="mp-center-banners">
          <div id="mp-cup-race-pill" class="mp-cup-race-pill">
            🏆 Course 1 / 3
          </div>
          <div id="mp-finish-countdown-banner" class="mp-finish-countdown hidden">
            ⏱️ 1er arrivé ! Fin de la course dans <strong id="mp-countdown-sec">20</strong>s !
          </div>
        </div>

        <!-- Leave Multiplayer Race Button -->
        <button id="btn-mp-back-lobby" class="mp-back-lobby-btn" title="Retourner au salon">
          🏠 Salon
        </button>
      </div>

      <!-- ==================== 5. MODAL INTER-COURSE & DRAFT DES MODIFICATEURS ==================== -->
      <div id="modal-race-results" class="modal-backdrop hidden">
        <div class="modal-card rr-card">
          <header class="rr-head">
            <div class="rr-title">
              <small id="rr-cup-name"></small>
              <strong id="results-modal-title">Course 1/3 terminée</strong>
            </div>
            <div class="rr-timer" title="Course suivante">
              <svg viewBox="0 0 36 36"><circle class="rr-timer-bg" cx="18" cy="18" r="15.5"></circle><circle id="rr-timer-arc" class="rr-timer-arc" cx="18" cy="18" r="15.5"></circle></svg>
              <span id="results-draft-timer">15</span>
            </div>
          </header>
          <ol id="results-rankings-list" class="rr-standings"></ol>
          <section id="rr-action" class="rr-action"></section>
          <footer id="results-draft-status" class="rr-footer"></footer>
        </div>
      </div>

      <!-- ==================== 6. MODAL PODIUM FINAL DE LA COUPE & CADEAU COSMÉTIQUE ==================== -->
      <div id="modal-cup-podium" class="modal-backdrop hidden">
        <div class="modal-card rr-card">
          <header class="rr-head">
            <div class="rr-title">
              <small id="podium-cup-name"></small>
              <strong id="podium-cup-title">Coupe terminée</strong>
            </div>
          </header>
          <div id="podium-steps-container" class="pd-steps"></div>
          <ol id="podium-rest-list" class="rr-standings"></ol>
          <section id="podium-gift-section" class="rr-action">
            <div id="podium-gift-box" class="pd-gift">
              <span class="pd-gift-icon" id="gift-icon-anim">🎁</span>
              <div class="pd-gift-text">
                <strong id="gift-headline"></strong>
                <small id="gift-description"></small>
              </div>
              <button id="btn-open-gift" class="cartoon-btn orange-btn">Ouvrir mon cadeau</button>
              <button id="btn-equip-gift" class="cartoon-btn green-btn hidden">Équiper</button>
            </div>
          </section>
          <footer class="rr-footer">
            <button id="btn-podium-return-room" class="cartoon-btn green-btn">🏠 Retour au salon</button>
          </footer>
        </div>
      </div>

      <!-- ==================== 7. MODAL SÉLECTION DE LA COUPE (POPUP EN UN CLIC) ==================== -->
      <div id="modal-cup-picker" class="modal-backdrop hidden">
        <div class="modal-card cup-picker-modal dark-glass-panel">
          <div class="panel-wood-header big-wood-header gold-wood">
            <span>🏆 CHOISIR UNE COUPE (3 COURSES)</span>
            <button id="btn-close-cup-picker" class="close-modal-icon-btn" title="Fermer">✕</button>
          </div>

          <p class="cup-picker-subtitle">
            Cliquez sur une coupe pour la sélectionner immédiatement et préparer la compétition :
          </p>

          <div id="cup-picker-grid" class="cup-picker-grid"></div>

          <div class="modal-buttons">
            <button id="btn-dismiss-cup-picker" class="wood-btn">Fermer</button>
          </div>
        </div>
      </div>
    `;

    wrapper.appendChild(uiContainer);

    // Also add multi-player markers container inside top progress bar
    const progressWrap = document.querySelector('.progress-bar-wrap');
    if (progressWrap) {
      this.elMultiMarkers = document.createElement('div');
      this.elMultiMarkers.id = 'mp-progress-markers';
      this.elMultiMarkers.className = 'mp-progress-markers';
      progressWrap.appendChild(this.elMultiMarkers);
    }

    this.bindUIEvents();
  }

  renderRoomSettingsControls() {
    const list = document.getElementById('room-settings-list');
    if (!list) return;
    list.innerHTML = ROOM_SETTINGS.map((def) => def.type === 'toggle' ? `
      <label class="room-slider-item room-toggle-item">
        <div class="rs-label-row">
          <span>${def.label}</span>
          <strong id="rs-val-${def.key}">${def.default ? 'Oui' : 'Non'}</strong>
        </div>
        <input type="checkbox" id="rs-${def.key}" ${def.default ? 'checked' : ''} />
      </label>` : `
      <div class="room-slider-item">
        <div class="rs-label-row">
          <span>${def.label}</span>
          <strong id="rs-val-${def.key}">${def.format(def.default)}</strong>
        </div>
        <input type="range" id="rs-${def.key}" min="${def.min}" max="${def.max}" step="${def.step}" value="${def.default}" />
      </div>`).join('');
    for (const def of ROOM_SETTINGS) {
      const input = document.getElementById(`rs-${def.key}`);
      const valEl = document.getElementById(`rs-val-${def.key}`);
      if (!input) continue;
      input.addEventListener(def.type === 'toggle' ? 'change' : 'input', () => {
        if (!this.network.isHost()) return;
        const val = def.type === 'toggle' ? input.checked : parseFloat(input.value);
        if (valEl) valEl.textContent = def.type === 'toggle' ? (val ? 'Oui' : 'Non') : def.format(val);
        this.network.updateRoomConfig({ [def.key]: val });
      });
    }
  }

  bindUIEvents() {
    const homePseudo = document.getElementById('home-pseudo-input');
    const roomPseudo = document.getElementById('room-pseudo-input');
    if (homePseudo) {
      homePseudo.value = this.network.pseudo;
      homePseudo.addEventListener('change', () => {
        this.network.savePseudo(homePseudo.value);
        if (roomPseudo) roomPseudo.value = this.network.pseudo;
        this.game.caterpillar.pseudo = this.network.pseudo;
        this.network.updateProfile(this.network.pseudo, this.game.caterpillar.cosmetics, true);
        this.syncPreviewCaterpillar();
      });
    }

    // Home buttons
    document.getElementById('btn-solo-practice')?.addEventListener('click', () => {
      sound.playGrip(true);
      this.showScreen('game');
      this.game.startSoloMode();
    });

    document.getElementById('btn-home-create-room')?.addEventListener('click', () => {
      sound.playGrip(true);
      if (homePseudo && homePseudo.value.trim()) {
        this.network.savePseudo(homePseudo.value.trim());
      }
      this.network.createRoom(this.game.caterpillar.cosmetics);
    });

    document.getElementById('btn-home-join-lobbies')?.addEventListener('click', () => {
      sound.playGrip(true);
      if (homePseudo && homePseudo.value.trim()) {
        this.network.savePseudo(homePseudo.value.trim());
      }
      this.network.requestRoomsList();
      this.showScreen('lobbies');
    });

    document.getElementById('btn-home-customize')?.addEventListener('click', () => {
      sound.playGrip(true);
      this.game.syncCosmeticsUI();
      document.getElementById('cosmetics-modal')?.classList.remove('hidden');
    });

    document.getElementById('btn-home-rules')?.addEventListener('click', () => {
      sound.playGrip(true);
      document.getElementById('help-modal')?.classList.remove('hidden');
    });

    // Open Lobbies screen buttons
    document.getElementById('btn-lobbies-back')?.addEventListener('click', () => {
      sound.playGrip(false);
      this.showScreen('home');
    });

    document.getElementById('btn-lobbies-refresh')?.addEventListener('click', () => {
      sound.playGrip(true);
      this.network.requestRoomsList();
    });

    document.getElementById('btn-join-by-code')?.addEventListener('click', () => {
      const codeInput = document.getElementById('input-room-code');
      const code = codeInput ? codeInput.value.trim() : '';
      if (!code) return;
      sound.playGrip(true);
      this.network.joinRoom(code, this.game.caterpillar.cosmetics);
    });

    document.getElementById('btn-lobbies-create')?.addEventListener('click', () => {
      sound.playGrip(true);
      this.network.createRoom(this.game.caterpillar.cosmetics);
    });

    // Room Lobby screen buttons
    document.getElementById('btn-leave-room')?.addEventListener('click', () => {
      sound.playGrip(false);
      this.game.caterpillar.resetProgression();
      this.game.isInActiveCup = false;
      this.network.leaveRoom();
      this.showScreen('home');
    });

    const saveRoomPseudo = () => {
      if (!roomPseudo) return;
      this.network.updateProfile(roomPseudo.value, this.game.caterpillar.cosmetics, true);
      if (homePseudo) homePseudo.value = this.network.pseudo;
      this.game.caterpillar.pseudo = this.network.pseudo;
      this.syncPreviewCaterpillar();
      sound.playGrip(true);
    };
    document.getElementById('btn-save-pseudo')?.addEventListener('click', saveRoomPseudo);
    roomPseudo?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveRoomPseudo();
    });

    // Workshop tabs in Room Lobby
    document.querySelectorAll('#workshop-tabs .ws-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeWorkshopTab = btn.dataset.tab;
        document.querySelectorAll('#workshop-tabs .ws-tab').forEach(b => b.classList.toggle('active', b === btn));
        this.renderWorkshopGrid();
        sound.playGrip(true);
      });
    });

    // Host room settings (built from ROOM_SETTINGS)
    this.renderRoomSettingsControls();

    document.getElementById('btn-reset-room-settings')?.addEventListener('click', () => {
      if (!this.network.isHost()) return;
      const defaults = {};
      for (const def of ROOM_SETTINGS) defaults[def.key] = def.default;
      this.network.updateRoomConfig(defaults);
      sound.playBoing();
    });

    // Room Start Cup / Ready button
    document.getElementById('btn-room-start-cup')?.addEventListener('click', () => {
      if (!this.network.currentRoom) return;
      if (this.network.isHost()) {
        const cfg = this.network.currentRoom.config || {};
        if (!cfg.cupId) {
          sound.playHit();
          this.openCupPickerModal(null);
          return;
        }
        sound.playVictory();
        this.network.startCup();
      } else {
        sound.playGrip(true);
        const me = this.network.getLocalPlayer();
        const nextReady = !(me && me.ready);
        this.network.updateProfile(this.network.pseudo, this.game.caterpillar.cosmetics, nextReady);
      }
    });

    // Cup Picker Modal Close Buttons
    document.getElementById('btn-close-cup-picker')?.addEventListener('click', () => {
      sound.playGrip(false);
      this.closeCupPickerModal();
    });
    document.getElementById('btn-dismiss-cup-picker')?.addEventListener('click', () => {
      sound.playGrip(false);
      this.closeCupPickerModal();
    });
    document.getElementById('modal-cup-picker')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-cup-picker') {
        sound.playGrip(false);
        this.closeCupPickerModal();
      }
    });

    // Back to Lobby button during race
    document.getElementById('btn-mp-back-lobby')?.addEventListener('click', () => {
      if (this.network.currentRoom) {
        this.showScreen('room');
      } else {
        this.showScreen('home');
      }
    });

    // Podium Open & Equip Gift buttons
    document.getElementById('btn-open-gift')?.addEventListener('click', () => {
      this.claimVictoryCosmeticGift();
    });

    document.getElementById('btn-equip-gift')?.addEventListener('click', () => {
      this.equipCurrentCupReward();
    });

    // Podium Return to Room button
    document.getElementById('btn-podium-return-room')?.addEventListener('click', () => {
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
      this.game.caterpillar.resetProgression();
      this.game.isInActiveCup = false;
      if (this.network.isHost()) {
        this.network.returnToLobby();
      }
      this.showScreen('room');
    });

    this.renderWorkshopGrid();
    this.updateUnlockedCounters();
  }

  bindNetworkEvents() {
    this.network.on('connected', () => {
      const dot = document.getElementById('net-status-dot');
      const txt = document.getElementById('net-status-text');
      if (dot) dot.className = 'status-dot online';
      if (txt) txt.textContent = 'Serveur Connecté (Temps Réel)';
    });

    this.network.on('disconnected', () => {
      const dot = document.getElementById('net-status-dot');
      const txt = document.getElementById('net-status-text');
      if (dot) dot.className = 'status-dot offline';
      if (txt) txt.textContent = 'Hors-ligne (Reconnexion...)';
    });

    this.network.on('rooms_list', (rooms) => {
      this.renderOpenLobbies(rooms);
    });

    this.network.on('room_joined', (room) => {
      this.showScreen('room');
      this.renderRoomLobby(room);
    });

    this.network.on('room_state', (room) => {
      this.renderRoomLobby(room);
    });

    this.network.on('returned_to_lobby', (room) => {
      document.getElementById('modal-race-results')?.classList.add('hidden');
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
      this.closeCupPickerModal();
      this.game.caterpillar.resetProgression();
      this.game.isInActiveCup = false;
      this.showScreen('room');
      this.renderRoomLobby(room);
    });

    this.network.on('left_room', (msg) => {
      document.getElementById('modal-race-results')?.classList.add('hidden');
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
      this.closeCupPickerModal();
      this.game.caterpillar.resetProgression();
      this.game.isInActiveCup = false;
      if (msg && Array.isArray(msg.rooms)) {
        this.renderOpenLobbies(msg.rooms);
      }
      this.showScreen('home');
    });

    this.network.on('room_lost', () => {
      document.getElementById('modal-race-results')?.classList.add('hidden');
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
      document.getElementById('mp-race-hud')?.classList.add('hidden');
      this.closeCupPickerModal();
      this.game.caterpillar.resetProgression();
      this.game.isInActiveCup = false;
      this.game.isMultiplayer = false;
      this.showScreen('home');
      alert('Connexion perdue trop longtemps : vous avez quitté la room.');
    });

    this.network.on('room_error', (msg) => {
      alert((msg && msg.message) || 'Erreur de salon');
    });

    this.network.on('cup_race_start', (msg) => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      if (this.draftTimerInterval) {
        clearInterval(this.draftTimerInterval);
        this.draftTimerInterval = null;
      }
      document.getElementById('modal-race-results')?.classList.add('hidden');
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
      this.showScreen('game');
      this.game.startMultiplayerRace(msg);
    });

    this.network.on('race_countdown_started', (msg) => {
      const banner = document.getElementById('mp-finish-countdown-banner');
      const secEl = document.getElementById('mp-countdown-sec');
      if (!banner || !secEl) return;
      banner.classList.remove('hidden');
      let rem = msg.duration || 20;
      secEl.textContent = rem;
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      this.countdownInterval = setInterval(() => {
        rem = Math.max(0, rem - 1);
        secEl.textContent = rem;
        if (rem <= 0) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }, 1000);
    });

    this.network.on('cup_draft_start', (msg) => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      document.getElementById('mp-finish-countdown-banner')?.classList.add('hidden');
      this.showRaceResultsModal(msg);
    });

    this.network.on('modifier_selected', (msg) => {
      if (!this.resultsDraft || !msg.playerId) return;
      this.resultsDraft.chosen.set(msg.playerId, msg.modifierId);
      if (this.lastStandings) this.renderResultsStandings(this.lastStandings);
      this.updateResultsFooter(Number(document.getElementById('results-draft-timer')?.textContent) || 0);
    });

    this.network.on('draft_all_ready', () => {
      if (this.draftTimerInterval) {
        clearInterval(this.draftTimerInterval);
        this.draftTimerInterval = null;
      }
      const footer = document.getElementById('results-draft-status');
      if (footer) footer.textContent = '🚀 Tout le monde est prêt, course suivante !';
    });

    this.network.on('cup_podium_start', (msg) => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      if (this.draftTimerInterval) {
        clearInterval(this.draftTimerInterval);
        this.draftTimerInterval = null;
      }
      document.getElementById('mp-finish-countdown-banner')?.classList.add('hidden');
      document.getElementById('modal-race-results')?.classList.add('hidden');
      this.showCupPodiumModal(msg);
    });
  }

  async refreshServerInfo() {
    const info = await this.network.fetchServerInfo();
    const url = info.url || window.location.origin;
    const codeEl = document.getElementById('lan-url-code');
    const qrImg = document.getElementById('lan-qr-img');
    if (codeEl) codeEl.textContent = url;
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`;
      qrImg.onerror = () => {
        qrImg.style.display = 'none';
      };
    }
    if (Array.isArray(info.rooms)) {
      this.renderOpenLobbies(info.rooms);
    }
  }

  // Multiplayer hides solo-only HUD parts (level select, record, restart, tuning, tips)
  applyHudMode() {
    document.body.classList.toggle('mp-mode', !!this.game.isMultiplayer);
  }

  showScreen(screenName) {
    this.activeScreen = screenName;
    const sHome = document.getElementById('screen-home');
    const sLobbies = document.getElementById('screen-lobbies');
    const sRoom = document.getElementById('screen-room-lobby');
    const mpHud = document.getElementById('mp-race-hud');
    const topHud = document.getElementById('hud-top');
    const botHud = document.getElementById('hud-bottom');
    const coach = document.getElementById('coach-banner');

    sHome?.classList.toggle('hidden', screenName !== 'home');
    sLobbies?.classList.toggle('hidden', screenName !== 'lobbies');
    sRoom?.classList.toggle('hidden', screenName !== 'room');

    const inGame = screenName === 'game';
    topHud?.classList.toggle('hidden', !inGame);
    botHud?.classList.toggle('hidden', !inGame);
    coach?.classList.toggle('hidden', !inGame);
    mpHud?.classList.toggle('hidden', !(inGame && this.game.isMultiplayer));
    this.applyHudMode();

    const gameCanvas = document.getElementById('game-canvas');
    if (gameCanvas) {
      gameCanvas.classList.toggle('sleeping', !inGame);
    }

    if (inGame) {
      this.stopPreviewLoop();
      this.game.resumeGameLoop();
    } else {
      this.game.pauseGameLoop();
      if (screenName === 'home' || screenName === 'room') {
        this.startPreviewLoop();
      } else {
        this.stopPreviewLoop();
      }
    }

    if (screenName === 'home' || screenName === 'room') {
      if (this.game && this.game.caterpillar) {
        this.game.isInActiveCup = false;
        this.game.caterpillar.resetProgression();
      }
      this.syncPreviewCaterpillar();
      this.updateUnlockedCounters();
      this.renderWorkshopGrid();
    }
  }

  updateUnlockedCounters() {
    const counts = getUnlockedCosmeticsCount();
    const txt = `${counts.unlocked}/${counts.total}`;
    const elHome = document.getElementById('unlocked-count-txt');
    const elWs = document.getElementById('workshop-unlocked-pill');
    if (elHome) elHome.textContent = txt;
    if (elWs) elWs.textContent = `🎁 ${txt} Débloqués`;
  }

  renderOpenLobbies(rooms = []) {
    const badgeHome = document.getElementById('home-open-rooms-badge');
    const badgeLobbies = document.getElementById('lobbies-count-badge');
    const listEl = document.getElementById('open-lobbies-list');

    const openCount = rooms.filter(r => r.state === 'lobby').length;
    if (badgeHome) badgeHome.textContent = String(openCount);
    if (badgeLobbies) badgeLobbies.textContent = `${rooms.length} salon${rooms.length > 1 ? 's' : ''} actif${rooms.length > 1 ? 's' : ''}`;

    if (!listEl) return;
    if (rooms.length === 0) {
      listEl.innerHTML = `
        <div class="empty-lobbies-box">
          <div class="empty-icon">🍃</div>
          <h3>Aucun salon ouvert pour le moment</h3>
          <p>Cliquez sur <strong>"Créer une Nouvelle Room"</strong> ci-dessus pour ouvrir le premier salon de compétition !</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = rooms.map(r => {
      const isLobby = r.state === 'lobby';
      const hostPseudo = r.hostName || 'Hôte';
      return `
        <div class="lobby-room-card ${isLobby ? 'joinable' : 'in-progress'}">
          <div class="lrc-main">
            <div class="lrc-title-row">
              <span class="lrc-code">#${r.code}</span>
              <h4 class="lrc-name">Salon de ${this.escapeHtml(hostPseudo)}</h4>
              <span class="lrc-status ${isLobby ? 'open' : 'busy'}">
                ${isLobby ? '🟢 En attente' : `🏁 Course ${(r.raceIndex || 0) + 1}/3`}
              </span>
            </div>
            <div class="lrc-meta-row">
              <span>👑 Admin : <strong>${this.escapeHtml(hostPseudo)}</strong></span>
              <span>${r.cupIcon || '🏆'} ${this.escapeHtml(r.cupName || 'Coupe')}</span>
              <span>👥 <strong>${r.maxPlayers ? `${r.playerCount}/${r.maxPlayers}` : r.playerCount}</strong> Joueurs</span>
            </div>
          </div>
          <div class="lrc-actions">
            <button class="cartoon-btn green-btn btn-join-room-item" data-code="${r.code}">
              Rejoindre ▶
            </button>
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-join-room-item').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playGrip(true);
        this.network.joinRoom(btn.dataset.code, this.game.caterpillar.cosmetics);
      });
    });
  }

  renderRoomLobby(room) {
    if (!room) return;
    const isHost = this.network.isHost();
    const cfg = room.config || {};

    const titleEl = document.getElementById('room-header-title');
    const codeEl = document.getElementById('room-header-code');
    const roleEl = document.getElementById('room-role-badge');
    const countEl = document.getElementById('room-players-count');
    const roomPseudo = document.getElementById('room-pseudo-input');

    const hostPlayer = (room.players || []).find(p => p.id === room.hostId);
    if (titleEl) titleEl.textContent = `SALON DE ${(hostPlayer ? hostPlayer.pseudo : 'COURSE').toUpperCase()}`;
    if (codeEl) codeEl.textContent = `CODE : #${room.code}`;
    if (roleEl) {
      roleEl.textContent = isHost ? '👑 ADMIN DE LA ROOM' : '🐛 PARTICIPANT';
      roleEl.className = `role-badge ${isHost ? 'host' : 'guest'}`;
    }
    if (countEl) countEl.textContent = cfg.maxPlayers ? `${(room.players || []).length}/${cfg.maxPlayers}` : `${(room.players || []).length}`;
    if (roomPseudo && document.activeElement !== roomPseudo) {
      roomPseudo.value = this.network.pseudo;
    }

    // 1. Render Connected Players List
    const playersListEl = document.getElementById('room-players-list');
    if (playersListEl) {
      playersListEl.innerHTML = (room.players || []).map((p) => {
        const pal = COSMETIC_PALETTES[(p.cosmetics && p.cosmetics.palette) || 'emerald'] || COSMETIC_PALETTES.emerald;
        const cls = CATERPILLAR_CLASSES[(p.cosmetics && p.cosmetics.bodyType) || 'classique'] || CATERPILLAR_CLASSES.classique;
        const isMe = p.id === this.network.playerId;
        const isRoomHost = p.id === room.hostId;
        const modsHtml = (p.modifiers || []).map(m => {
          const mod = RACE_MODIFIERS[m];
          return mod ? `<span class="mod-mini-pill" title="${mod.name}: ${mod.desc}">${mod.icon} ${mod.name}</span>` : '';
        }).join('');

        return `
          <div class="room-player-row ${isMe ? 'is-me' : ''}">
            <div class="rp-avatar" style="background: ${pal.bodyFill}; border-color: ${pal.outline};">
              <span class="rp-avatar-eyes">🐛</span>
            </div>
            <div class="rp-info">
              <div class="rp-name-line">
                <strong>${this.escapeHtml(p.pseudo)}</strong>
                ${isMe ? '<span class="you-tag">(Vous)</span>' : ''}
                ${isRoomHost ? '<span class="host-crown" title="Admin de la Room">👑</span>' : ''}
              </div>
              <div class="rp-sub-line">
                <span>${cls.icon} ${cls.name}</span>
                ${p.score > 0 ? `<span class="rp-pts">🏆 ${p.score} pts</span>` : ''}
              </div>
              ${modsHtml ? `<div class="rp-mods-line">${modsHtml}</div>` : ''}
            </div>
            <div class="rp-status">
              <span class="ready-pill ${p.ready || isRoomHost ? 'ready' : 'waiting'}">
                ${isRoomHost ? '👑 ADMIN' : (p.ready ? '✅ PRÊT' : '⏳ ATTENTE')}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Render Cup Slot (Designated square/card in Room Lobby)
    const slotContainer = document.getElementById('room-cup-slot-container');
    if (slotContainer) {
      const selectedCup = cfg.cupId ? CUPS_DEFINITIONS[cfg.cupId] : null;

      if (!selectedCup) {
        slotContainer.innerHTML = `
          <div class="cup-slot-card empty ${isHost ? 'clickable' : 'readonly'}" id="btn-open-cup-slot">
            <div class="cup-slot-icon-box empty-icon-box">
              <span class="cup-slot-icon">➕</span>
            </div>
            <div class="cup-slot-info">
              <strong class="cup-slot-title">${isHost ? 'CHOISIR UNE COUPE' : 'AUCUNE COUPE SÉLECTIONNÉE'}</strong>
              <small class="cup-slot-hint">${isHost ? 'Cliquez pour ouvrir le sélecteur de coupes (3 courses)' : "L'admin n'a pas encore choisi de coupe"}</small>
            </div>
            ${isHost ? '<span class="cup-slot-action-btn">Choisir 👆</span>' : ''}
          </div>
        `;
      } else {
        const lvls = selectedCup.levels || [0, 1, 2];
        const mapsList = lvls.map((idx, i) => {
          const lvl = LEVEL_DEFINITIONS[idx] || LEVEL_DEFINITIONS[0];
          return `<span class="cup-slot-map-pill">#${i + 1} ${lvl.name}</span>`;
        }).join('');

        slotContainer.innerHTML = `
          <div class="cup-slot-card selected ${isHost ? 'clickable' : 'readonly'}" id="btn-open-cup-slot">
            <div class="cup-slot-icon-box">
              <span class="cup-slot-icon">${selectedCup.icon}</span>
            </div>
            <div class="cup-slot-info">
              <div class="cup-slot-title-row">
                <strong class="cup-slot-title">${selectedCup.name}</strong>
                ${isHost ? '<span class="cup-slot-change-badge">Changer ✏️</span>' : ''}
              </div>
              <small class="cup-slot-desc">${selectedCup.desc || ''}</small>
              <div class="cup-slot-maps-row">${mapsList}</div>
            </div>
          </div>
        `;
      }

      if (isHost) {
        document.getElementById('btn-open-cup-slot')?.addEventListener('click', () => {
          sound.playGrip(true);
          this.openCupPickerModal(cfg.cupId);
        });
      }
    }

    // 3. Sync Room Gameplay Settings Sliders
    const syncSlider = (id, val, fmt) => {
      const slider = document.getElementById(`rs-${id}`);
      const valEl = document.getElementById(`rs-val-${id}`);
      if (slider) {
        slider.value = val;
        slider.disabled = !isHost;
      }
      if (valEl) valEl.textContent = fmt(val);
    };

    for (const def of ROOM_SETTINGS) {
      const val = cfg[def.key] !== undefined ? cfg[def.key] : def.default;
      if (def.type === 'toggle') {
        const box = document.getElementById(`rs-${def.key}`);
        const valEl = document.getElementById(`rs-val-${def.key}`);
        if (box) { box.checked = !!val; box.disabled = !isHost; }
        if (valEl) valEl.textContent = val ? 'Oui' : 'Non';
      } else {
        syncSlider(def.key, val, def.format);
      }
    }

    const resetBtn = document.getElementById('btn-reset-room-settings');
    if (resetBtn) resetBtn.style.display = isHost ? 'inline-flex' : 'none';

    const lockBadge = document.getElementById('admin-lock-badge');
    if (lockBadge) {
      lockBadge.textContent = isHost ? '👑 Modifiable (Admin)' : '🔒 Réglé par l\'Admin';
    }

    // 4. Sync Start / Ready Button
    const startLabel = document.getElementById('btn-room-start-label');
    const startSub = document.getElementById('btn-room-start-sub');
    const startBtn = document.getElementById('btn-room-start-cup');
    if (startBtn && startLabel && startSub) {
      const pCount = (room.players || []).length;
      if (isHost) {
        if (!cfg.cupId) {
          startBtn.className = 'cartoon-cta-btn orange-cta full-width';
          startLabel.textContent = '⚠️ CHOISIR UNE COUPE D\'ABORD';
          startSub.textContent = 'Cliquez ici ou sur le carré pour choisir la coupe';
        } else {
          startBtn.className = 'cartoon-cta-btn green-cta full-width';
          startLabel.textContent = '🏁 LANCER LA COMPÉTITION !';
          startSub.textContent = `3 Courses • ${pCount} Joueur${pCount > 1 ? 's' : ''} dans le monde`;
        }
      } else {
        const me = this.network.getLocalPlayer();
        const ready = me && me.ready;
        startBtn.className = `cartoon-cta-btn ${ready ? 'orange-cta' : 'green-cta'} full-width`;
        startLabel.textContent = ready ? 'PRÊT ! (EN ATTENTE DE L\'ADMIN)' : 'JE SUIS PRÊT !';
        startSub.textContent = 'Vous pouvez modifier votre chenille en attendant';
      }
    }
  }

  // ==================== CUP PICKER MODAL (1-CLICK SELECTION) ====================
  openCupPickerModal(selectedCupId = null) {
    const modal = document.getElementById('modal-cup-picker');
    const grid = document.getElementById('cup-picker-grid');
    if (!modal || !grid) return;

    grid.innerHTML = Object.values(CUPS_DEFINITIONS).map((cup) => {
      const isSelected = selectedCupId === cup.id;
      const lvls = cup.levels || [0, 1, 2];
      const diffLabels = ['Niveau 1 (Facile)', 'Niveau 2 (Moyen)', 'Niveau 3 (Difficile)'];
      const mapsHtml = lvls.map((idx, i) => {
        const lvl = LEVEL_DEFINITIONS[idx] || LEVEL_DEFINITIONS[0];
        const diff = diffLabels[i] || `Course ${i + 1}`;
        return `
          <div class="picker-map-row">
            <span class="pmr-pill pmr-step">Course ${i + 1}</span>
            <div class="pmr-details">
              <strong class="pmr-name">${lvl.name}</strong>
              <small class="pmr-diff diff-lvl-${i + 1}">${diff}</small>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="picker-cup-card ${isSelected ? 'selected' : ''}" data-cup="${cup.id}">
          <div class="pcc-header">
            <span class="pcc-icon">${cup.icon}</span>
            <div class="pcc-titles">
              <h3 class="pcc-name">${cup.name}</h3>
              <p class="pcc-desc">${cup.desc || ''}</p>
            </div>
            ${isSelected ? '<span class="pcc-badge-selected">✔ CHOISIE</span>' : ''}
          </div>
          <div class="pcc-maps-container">
            ${mapsHtml}
          </div>
          <button class="cartoon-btn green-btn full-width pcc-select-btn" data-cup="${cup.id}">
            ${isSelected ? '✔ Actuellement Choisie' : 'Sélectionner cette Coupe ▶'}
          </button>
        </div>
      `;
    }).join('');

    // In 1 single click: select cup and close popup immediately!
    grid.querySelectorAll('.picker-cup-card, .pcc-select-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const cupId = el.dataset.cup;
        if (!cupId) return;
        sound.playVictory();
        this.network.updateRoomConfig({ cupId });
        this.closeCupPickerModal();
      });
    });

    modal.classList.remove('hidden');
  }

  closeCupPickerModal() {
    document.getElementById('modal-cup-picker')?.classList.add('hidden');
  }

  renderWorkshopGrid() {
    const grid = document.getElementById('workshop-items-grid');
    if (!grid) return;

    const cos = this.game.caterpillar.cosmetics;
    const tab = this.activeWorkshopTab;

    if (tab === 'classes') {
      grid.innerHTML = Object.values(CATERPILLAR_CLASSES).map(cls => {
        const active = (cos.bodyType || 'classique') === cls.id;
        return `
          <button class="ws-item-card class-ws-card ${active ? 'active' : ''}" data-class="${cls.id}">
            <div class="ws-icon">${cls.icon}</div>
            <div class="ws-name">${cls.name}</div>
            <div class="ws-sub">${cls.subtitle || ''}</div>
          </button>
        `;
      }).join('');

      grid.querySelectorAll('.ws-item-card').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!this.game.changeSpecies(btn.dataset.class)) return;
          this.onLocalCosmeticChanged();
        });
      });
      return;
    }

    const items = COSMETICS_CATALOG.filter(item => item.category === tab);
    grid.innerHTML = items.map(item => {
      const unlocked = isCosmeticUnlocked(item.category, item.id);
      let isActive = false;
      if (tab === 'palette') isActive = cos.palette === item.id;
      if (tab === 'hat') isActive = cos.hat === item.id;
      if (tab === 'grip') isActive = (cos.grip || 'classic') === item.id;
      if (tab === 'face') isActive = cos.face === item.id;

      return `
        <button class="ws-item-card ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''}" data-key="${item.id}" data-unlocked="${unlocked}">
          <div class="ws-icon">${unlocked ? item.icon : '🔒'}</div>
          <div class="ws-name">${item.name}</div>
          <div class="ws-sub">${unlocked ? (isActive ? '✔ Équipé' : 'Disponible') : '🎁 Cadeau Coupe'}</div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.ws-item-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const isUnlocked = btn.dataset.unlocked === 'true';
        if (!isUnlocked) {
          sound.playSticky(false);
          return;
        }
        const key = btn.dataset.key;
        if (tab === 'palette') this.game.caterpillar.cosmetics.palette = key;
        if (tab === 'hat') this.game.caterpillar.cosmetics.hat = key;
        if (tab === 'grip') this.game.caterpillar.cosmetics.grip = key;
        if (tab === 'face') this.game.caterpillar.cosmetics.face = key;
        this.game.caterpillar.saveCosmetics();
        this.onLocalCosmeticChanged();
      });
    });
  }

  onLocalCosmeticChanged() {
    sound.playGrip(true);
    this.syncPreviewCaterpillar();
    this.renderWorkshopGrid();
    this.game.syncCosmeticsUI();
    this.network.updateProfile(this.network.pseudo, this.game.caterpillar.cosmetics, true);
  }

  syncPreviewCaterpillar() {
    const cos = this.game.caterpillar.cosmetics;
    this.previewCat.cosmetics = { ...cos };
    this.previewCat.setBodyType(cos.bodyType || 'classique');
    this.previewCat.setBodyShape(cos.bodyShape || 'larve');

    const pal = COSMETIC_PALETTES[cos.palette] || COSMETIC_PALETTES.emerald;
    const grip = GRIP_STYLES[cos.grip || 'classic'] || GRIP_STYLES.classic;
    const cls = CATERPILLAR_CLASSES[cos.bodyType || 'classique'] || CATERPILLAR_CLASSES.classique;
    const summaryText = `${cls.name} • ${pal.name} • ${grip.name}`;

    const elRoomSum = document.getElementById('workshop-cat-summary');
    const elHomeSum = document.getElementById('home-preview-caption');
    if (elRoomSum) elRoomSum.textContent = summaryText;
    if (elHomeSum) elHomeSum.textContent = `${this.network.pseudo} — ${summaryText}`;
  }

  drawPreviewCanvases(time) {
    if (this.activeScreen !== 'home' && this.activeScreen !== 'room') return;
    const canvasId = this.activeScreen === 'home' ? 'home-preview-canvas' : 'room-preview-canvas';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    const groundY = h - 34;

    const spotGrad = ctx.createRadialGradient(w * 0.5, groundY - 30, 10, w * 0.5, groundY - 20, 160);
    spotGrad.addColorStop(0, 'rgba(140, 245, 171, 0.25)');
    spotGrad.addColorStop(1, 'rgba(140, 245, 171, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#5c3a1e';
    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(w * 0.14, groundY, w * 0.72, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38d84e';
    ctx.beginPath();
    ctx.roundRect(w * 0.16, groundY - 4, w * 0.68, 9, 5);
    ctx.fill();

    const N = this.previewCat.numNodes;
    const segLen = this.previewCat.extendedSegLen * 0.85;
    const totalLen = (N - 1) * segLen;
    const startX = w * 0.5 - totalLen * 0.5;
    const breathe = Math.sin(time * 3.2) * 0.14 + 0.16;
    this.previewCat.contraction = breathe;
    this.previewCat.propellerAngle = time * 14;

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const arch = Math.sin(t * Math.PI) * (18 + breathe * 28);
      const headBob = i === N - 1 ? Math.sin(time * 4.5) * 4 : 0;
      this.previewCat.nodes[i].x = startX + t * totalLen * (1 - breathe * 0.18);
      this.previewCat.nodes[i].y = groundY - 16 - arch + headBob;
    }
    this.previewCat.rearAnchor.anchored = true;
    this.previewCat.frontAnchor.anchored = false;

    this.previewCat.draw(ctx, time);
    ctx.restore();
  }

  startPreviewLoop() {
    if (this.previewRafId) return;
    const render = (timeMs) => {
      if (this.activeScreen !== 'home' && this.activeScreen !== 'room') {
        this.previewRafId = null;
        return;
      }
      this.drawPreviewCanvases(timeMs / 1000);
      this.previewRafId = requestAnimationFrame(render);
    };
    this.previewRafId = requestAnimationFrame(render);
  }

  stopPreviewLoop() {
    if (this.previewRafId) {
      cancelAnimationFrame(this.previewRafId);
      this.previewRafId = null;
    }
  }

  // ==================== LIVE RACE MULTIPLAYER HUD ====================
  updateLiveRaceHUD(playersInfo = []) {
    if (!this.game.isMultiplayer) return;

    const standingsEl = document.getElementById('mp-live-standings');
    if (standingsEl) {
      const sorted = [...playersInfo].sort((a, b) => {
        if (a.finished && b.finished) return a.finishTime - b.finishTime;
        if (a.finished) return -1;
        if (b.finished) return 1;
        return b.progress - a.progress;
      });

      standingsEl.innerHTML = sorted.map((p, idx) => {
        const pal = COSMETIC_PALETTES[p.palette || 'emerald'] || COSMETIC_PALETTES.emerald;
        const rankLabels = ['1er 🥇', '2e 🥈', '3e 🥉'];
        const rankTxt = rankLabels[idx] || `${idx + 1}e`;
        const modsTxt = (p.modifiers || []).map(m => (RACE_MODIFIERS[m] ? RACE_MODIFIERS[m].icon : '')).join('');
        return `
          <div class="mp-rank-card ${p.isLocal ? 'local-player' : ''}">
            <span class="mp-rank-pos">${rankTxt}</span>
            <span class="mp-rank-dot" style="background: ${pal.bodyFill};"></span>
            <span class="mp-rank-name">${this.escapeHtml(p.pseudo)} ${modsTxt}</span>
            <span class="mp-rank-pct">${p.finished ? '🏁' : `${Math.round(p.progress * 100)}%`}</span>
          </div>
        `;
      }).join('');
    }

    if (this.elMultiMarkers) {
      this.elMultiMarkers.innerHTML = playersInfo
        .filter(p => !p.isLocal)
        .map(p => {
          const pal = COSMETIC_PALETTES[p.palette || 'emerald'] || COSMETIC_PALETTES.emerald;
          const pct = Math.max(0, Math.min(100, p.progress * 100)).toFixed(1);
          return `<span class="mp-track-dot" style="left: ${pct}%; background: ${pal.bodyFill};" title="${this.escapeHtml(p.pseudo)}"></span>`;
        })
        .join('');
    }
  }

  // ==================== INTER-RACE RESULTS & MODIFIER DRAFT MODAL ====================
  // Short, comparable effect chips for a race modifier (biggest effects first)
  modifierChips(mod) {
    const pct = (m) => Math.round((m - 1) * 100);
    const chips = [];
    const add = (label, value, weight) => { if (value) chips.push({ label, good: value > 0, weight }); };
    if (mod.speedMult && mod.speedMult !== 1) add(`Vitesse ${pct(mod.speedMult) > 0 ? '+' : ''}${pct(mod.speedMult)}%`, pct(mod.speedMult), Math.abs(pct(mod.speedMult)));
    if (mod.jumpMult && mod.jumpMult !== 1) add(`Saut ${pct(mod.jumpMult) > 0 ? '+' : ''}${pct(mod.jumpMult)}%`, pct(mod.jumpMult), Math.abs(pct(mod.jumpMult)));
    if (mod.extraSegments) add(`+${mod.extraSegments} segments`, 1, mod.extraSegments * 30);
    if (mod.hpBonus) add(`+${mod.hpBonus} PV`, 1, mod.hpBonus * 0.6);
    if (mod.strengthMult && mod.strengthMult !== 1) add(`Force ${pct(mod.strengthMult) > 0 ? '+' : ''}${pct(mod.strengthMult)}%`, pct(mod.strengthMult), Math.abs(pct(mod.strengthMult)) * 0.6);
    if (mod.gravityMult && mod.gravityMult !== 1) add(`Gravité ${pct(mod.gravityMult) > 0 ? '+' : ''}${pct(mod.gravityMult)}%`, -pct(mod.gravityMult), Math.abs(pct(mod.gravityMult)));
    if (mod.scaleMult && mod.scaleMult !== 1) chips.push({ label: `Taille ${pct(mod.scaleMult) > 0 ? '+' : ''}${pct(mod.scaleMult)}%`, good: null, weight: Math.abs(pct(mod.scaleMult)) * 0.8 });
    if (mod.reachMult && mod.reachMult !== 1) add(`Allonge ${pct(mod.reachMult) > 0 ? '+' : ''}${pct(mod.reachMult)}%`, pct(mod.reachMult), Math.abs(pct(mod.reachMult)) * 0.7);
    return chips.sort((x, y) => y.weight - x.weight).slice(0, 3);
  }

  // Between two races of a cup. Everyone sees the standings; only players who did not
  // win the race get to pick a catch-up bonus.
  showRaceResultsModal(msg) {
    const modal = document.getElementById('modal-race-results');
    if (!modal) return;
    modal.classList.remove('hidden');
    sound.playVictory();

    this.selectedModifierId = null;
    const standings = msg.standings || [];
    this.resultsDraft = {
      eligible: new Set(standings.filter((r) => (r.draftOptions || []).length > 0).map((r) => r.id)),
      chosen: new Map()
    };

    const room = this.network.currentRoom;
    const cupName = room && room.cup ? `${room.cup.icon || ''} ${room.cup.name}` : '';
    document.getElementById('rr-cup-name').textContent = cupName;
    document.getElementById('results-modal-title').textContent = `Course ${(msg.raceIndex || 0) + 1}/3 terminée`;

    this.renderResultsStandings(standings);

    const me = standings.find((r) => r.id === this.network.playerId);
    this.renderResultsAction(me);

    // Countdown ring + footer
    if (this.draftTimerInterval) clearInterval(this.draftTimerInterval);
    const total = msg.draftDuration || 15;
    let remaining = total;
    const tick = () => {
      document.getElementById('results-draft-timer').textContent = Math.max(0, remaining);
      const arc = document.getElementById('rr-timer-arc');
      if (arc) arc.style.strokeDashoffset = String(97.4 * (1 - Math.max(0, remaining) / total));
      this.updateResultsFooter(remaining);
    };
    tick();
    this.draftTimerInterval = setInterval(() => {
      remaining--;
      tick();
      if (remaining <= 0) {
        clearInterval(this.draftTimerInterval);
        this.draftTimerInterval = null;
        const options = (me && me.draftOptions) || [];
        if (!this.selectedModifierId && options.length > 0) {
          this.selectModifierChoice(options[Math.floor(Math.random() * options.length)]);
        }
      }
    }, 1000);
  }

  renderResultsStandings(standings) {
    const list = document.getElementById('results-rankings-list');
    if (!list) return;
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = standings.map((r) => {
      const isMe = r.id === this.network.playerId;
      const pal = COSMETIC_PALETTES[(r.cosmetics && r.cosmetics.palette) || 'emerald'] || COSMETIC_PALETTES.emerald;
      const time = r.finished ? `${Number(r.finishTime || 0).toFixed(1)} s` : `${Math.round((r.progress || 0) * 100)} %`;
      const mods = (r.modifiers || []).map((m) => (RACE_MODIFIERS[m] ? RACE_MODIFIERS[m].icon : '')).join('');
      const picked = this.resultsDraft.chosen.get(r.id);
      const draftMark = this.resultsDraft.eligible.has(r.id)
        ? `<span class="rr-pick" title="Bonus">${picked ? (RACE_MODIFIERS[picked] ? RACE_MODIFIERS[picked].icon : '✓') : '…'}</span>`
        : '<span class="rr-pick"></span>';
      return `
        <li class="rr-row ${isMe ? 'is-me' : ''}">
          <span class="rr-rank">${medals[r.rank - 1] || `${r.rank}e`}</span>
          <span class="rr-dot" style="background:${pal.bodyFill || '#4cd137'}"></span>
          <span class="rr-name">${this.escapeHtml(r.pseudo)}${isMe ? ' <em>toi</em>' : ''}<span class="rr-mods">${mods}</span></span>
          <span class="rr-time ${r.finished ? '' : 'dnf'}">${time}</span>
          <span class="rr-pts">+${r.pointsEarned}</span>
          <strong class="rr-total">${r.totalScore} pts</strong>
          ${draftMark}
        </li>`;
    }).join('');
    this.lastStandings = standings;
  }

  renderResultsAction(me) {
    const box = document.getElementById('rr-action');
    if (!box) return;
    const options = (me && me.draftOptions) || [];
    if (options.length === 0) {
      box.className = 'rr-action rr-winner';
      box.innerHTML = me && me.rank === 1
        ? '<span class="rr-winner-medal">🥇</span><div><strong>Tu as gagné cette course !</strong><small>Le vainqueur ne prend pas de bonus.</small></div>'
        : '<div><strong>Pas de bonus pour toi cette fois.</strong></div>';
      return;
    }
    if (this.selectedModifierId) {
      const mod = RACE_MODIFIERS[this.selectedModifierId];
      box.className = 'rr-action rr-chosen';
      box.innerHTML = `<span class="rr-chosen-icon">${mod ? mod.icon : '✓'}</span><div><strong>Bonus choisi : ${mod ? mod.name : ''}</strong><small>Il reste actif jusqu’à la fin de la coupe.</small></div>`;
      return;
    }
    box.className = 'rr-action';
    box.innerHTML = `
      <h3>Choisis un bonus pour la suite de la coupe</h3>
      <div class="rr-cards">
        ${options.map((id) => {
          const mod = RACE_MODIFIERS[id];
          if (!mod) return '';
          const chips = this.modifierChips(mod).map((c) =>
            `<span class="rr-chip ${c.good === null ? '' : (c.good ? 'up' : 'down')}">${c.label}</span>`).join('');
          return `<button class="rr-mod" data-mod="${mod.id}" style="--mod-color:${mod.color}" title="${this.escapeHtml(mod.desc || '')}">
              <span class="rr-mod-icon">${mod.icon}</span>
              <span class="rr-mod-name">${mod.name}</span>
              <span class="rr-chips">${chips}</span>
            </button>`;
        }).join('')}
      </div>`;
    box.onclick = (e) => {
      const card = e.target.closest('.rr-mod');
      if (card) this.selectModifierChoice(card.dataset.mod);
    };
  }

  updateResultsFooter(remaining) {
    const footer = document.getElementById('results-draft-status');
    if (!footer || !this.resultsDraft) return;
    const waiting = this.resultsDraft.eligible.size - this.resultsDraft.chosen.size;
    const left = Math.max(0, remaining);
    footer.textContent = this.resultsDraft.eligible.size === 0 || waiting <= 0
      ? 'Course suivante…'
      : `Course suivante dans ${left} s · bonus choisis ${this.resultsDraft.chosen.size}/${this.resultsDraft.eligible.size}`;
  }

  selectModifierChoice(modId) {
    if (this.selectedModifierId) return;
    this.selectedModifierId = modId;
    sound.playPowerUp();
    this.network.selectModifier(modId);
    this.renderResultsAction((this.lastStandings || []).find((r) => r.id === this.network.playerId));
  }

  // ==================== FINAL CUP PODIUM & COSMETIC GIFT MODAL ====================
  // End of a cup: podium for everyone; only the cup champion unlocks a cosmetic
  showCupPodiumModal(msg) {
    const modal = document.getElementById('modal-cup-podium');
    if (!modal) return;
    modal.classList.remove('hidden');
    sound.playVictory();

    // Reset progression now that the 3 races of the cup are completed!
    this.game.caterpillar.resetProgression();
    this.game.isInActiveCup = false;

    const standings = msg.overallStandings || [];
    const room = this.network.currentRoom;
    document.getElementById('podium-cup-name').textContent = room && room.cup ? `${room.cup.icon || ''} ${room.cup.name}` : '';
    document.getElementById('podium-cup-title').textContent = 'Coupe terminée';

    const step = (p, place) => {
      if (!p) return '';
      const pal = COSMETIC_PALETTES[(p.cosmetics && p.cosmetics.palette) || 'emerald'] || COSMETIC_PALETTES.emerald;
      const isMe = p.id === this.network.playerId;
      return `
        <div class="pd-col pd-place-${place} ${isMe ? 'is-me' : ''}">
          <span class="pd-medal">${['👑', '🥈', '🥉'][place - 1]}</span>
          <strong class="pd-name">${this.escapeHtml(p.pseudo)}</strong>
          <span class="pd-pts">${p.totalScore} pts</span>
          <div class="pd-block" style="background: linear-gradient(180deg, ${pal.bodyFill}, ${pal.bodyShade});">${place}</div>
        </div>`;
    };
    // Visual order: 2nd, 1st, 3rd (only the places that exist)
    document.getElementById('podium-steps-container').innerHTML =
      step(standings[1], 2) + step(standings[0], 1) + step(standings[2], 3);

    document.getElementById('podium-rest-list').innerHTML = standings.slice(3).map((p, i) => `
      <li class="rr-row pd-rest ${p.id === this.network.playerId ? 'is-me' : ''}">
        <span class="rr-rank">${i + 4}e</span>
        <span class="rr-name">${this.escapeHtml(p.pseudo)}</span>
        <strong class="rr-total">${p.totalScore} pts</strong>
      </li>`).join('');

    this.hasClaimedCupGift = false;
    this.currentCupReward = null;
    const isCupWinner = msg.championId === this.network.playerId;
    const me = standings.find((p) => p.id === this.network.playerId);
    const myRank = me ? standings.indexOf(me) + 1 : null;
    const btnOpenGift = document.getElementById('btn-open-gift');
    const btnEquipGift = document.getElementById('btn-equip-gift');
    document.getElementById('gift-icon-anim').textContent = isCupWinner ? '🎁' : (['', '👑', '🥈', '🥉'][myRank] || '🏁');
    btnEquipGift.classList.add('hidden');
    btnOpenGift.disabled = false;
    btnOpenGift.classList.toggle('hidden', !isCupWinner);
    document.getElementById('gift-headline').textContent = isCupWinner
      ? 'Champion de la coupe !'
      : `Tu termines ${myRank === 1 ? '1er' : `${myRank}e`} sur ${standings.length}${me ? ` · ${me.totalScore} pts` : ''}`;
    document.getElementById('gift-description').textContent = isCupWinner
      ? 'Ouvre ton cadeau : un nouveau cosmétique t’attend.'
      : 'Le champion de la coupe débloque un cosmétique. Revanche ?';
  }

  claimVictoryCosmeticGift() {
    // Only the cup champion is rewarded (the button is hidden for the others)
    if (this.hasClaimedCupGift || document.getElementById('btn-open-gift')?.classList.contains('hidden')) return;
    this.hasClaimedCupGift = true;

    const result = unlockRandomCosmeticGift();
    const reward = result ? result.item : null;
    this.currentCupReward = reward;
    sound.playVictory();
    this.updateUnlockedCounters();

    const giftHeadline = document.getElementById('gift-headline');
    const giftDesc = document.getElementById('gift-description');
    const btnOpenGift = document.getElementById('btn-open-gift');
    const btnEquipGift = document.getElementById('btn-equip-gift');
    const giftIcon = document.getElementById('gift-icon-anim');

    if (reward) {
      if (giftIcon) giftIcon.textContent = reward.icon || '🌟';
      if (giftHeadline) {
        giftHeadline.textContent = !result.isNew
          ? `Collection complète ! (${reward.name})`
          : `Débloqué : ${reward.name}`;
      }
      if (giftDesc) {
        giftDesc.textContent = 'Disponible dans l’atelier.';
      }
      if (btnOpenGift) {
        btnOpenGift.classList.add('hidden');
      }
      if (btnEquipGift) {
        btnEquipGift.classList.remove('hidden');
        btnEquipGift.disabled = false;
        btnEquipGift.textContent = 'Équiper';
      }
    }
  }

  equipCurrentCupReward() {
    const reward = this.currentCupReward;
    if (!reward) return;
    if (reward.category === 'palette') this.game.caterpillar.cosmetics.palette = reward.id;
    if (reward.category === 'hat') this.game.caterpillar.cosmetics.hat = reward.id;
    if (reward.category === 'grip') this.game.caterpillar.cosmetics.grip = reward.id;
    if (reward.category === 'face') this.game.caterpillar.cosmetics.face = reward.id;
    this.game.caterpillar.saveCosmetics();
    this.onLocalCosmeticChanged();
    sound.playPowerUp();

    const btnEquipGift = document.getElementById('btn-equip-gift');
    if (btnEquipGift) {
      btnEquipGift.textContent = '✅ Équipé avec succès !';
      btnEquipGift.disabled = true;
    }
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
