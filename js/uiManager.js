// js/uiManager.js — Multiplayer Screens, 3-Column Room Lobby, Live Caterpillar Podium, Modifier Draft & Cup Podium
import {
  GAMEPLAY_CONFIG,
  CATERPILLAR_CLASSES,
  BODY_SHAPES,
  RACE_MODIFIERS,
  CUPS_DEFINITIONS,
  GRIP_STYLES,
  COSMETICS_CATALOG,
  isCosmeticUnlocked,
  unlockRandomCosmeticGift,
  getUnlockedCosmeticsCount
} from './gameplayConfig.js?v=72';
import { COSMETIC_PALETTES, Caterpillar } from './caterpillar.js?v=72';
import { LEVEL_DEFINITIONS } from './levels.js?v=72';
import { sound } from './audio.js?v=72';

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
              <!-- Cup Selection (3 Races) -->
              <div class="admin-block">
                <label class="admin-block-title">🗺️ Coupe Choisie (3 Courses) :</label>
                <div id="cup-selector-list" class="cup-selector-list"></div>
              </div>

              <!-- Host Gameplay Settings -->
              <div class="admin-block">
                <div class="admin-block-header">
                  <label class="admin-block-title">⚙️ Réglages de la Partie :</label>
                  <button id="btn-reset-room-settings" class="mini-wood-btn" title="Réinitialiser les réglages">🔄 Défaut</button>
                </div>

                <div class="room-sliders-list">
                  <div class="room-slider-item">
                    <div class="rs-label-row">
                      <span>🦘 Distance des sauts</span>
                      <strong id="rs-val-jumpBoost">1.00x</strong>
                    </div>
                    <input type="range" id="rs-jumpBoost" min="0.6" max="2.2" step="0.05" value="1.0" />
                  </div>

                  <div class="room-slider-item">
                    <div class="rs-label-row">
                      <span>📏 Taille chenilles départ</span>
                      <strong id="rs-val-startScale">1.00x</strong>
                    </div>
                    <input type="range" id="rs-startScale" min="0.6" max="1.8" step="0.05" value="1.0" />
                  </div>

                  <div class="room-slider-item">
                    <div class="rs-label-row">
                      <span>🐛 Segments de départ</span>
                      <strong id="rs-val-startSegments">5</strong>
                    </div>
                    <input type="range" id="rs-startSegments" min="4" max="9" step="1" value="5" />
                  </div>

                  <div class="room-slider-item">
                    <div class="rs-label-row">
                      <span>🌍 Gravité</span>
                      <strong id="rs-val-gravity">740</strong>
                    </div>
                    <input type="range" id="rs-gravity" min="300" max="950" step="20" value="740" />
                  </div>

                  <div class="room-slider-item">
                    <div class="rs-label-row">
                      <span>🧲 Portée des ventouses</span>
                      <strong id="rs-val-gripDistance">26 px</strong>
                    </div>
                    <input type="range" id="rs-gripDistance" min="16" max="45" step="1" value="26" />
                  </div>

                  <div class="room-slider-item">
                    <div class="rs-label-row">
                      <span>💥 Dégâts PvP (Objets)</span>
                      <strong id="rs-val-pvpDamageMult">1.00x</strong>
                    </div>
                    <input type="range" id="rs-pvpDamageMult" min="0.5" max="2.5" step="0.1" value="1.0" />
                  </div>
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
        <div class="modal-card mp-results-card dark-glass-panel">
          <div class="panel-wood-header big-wood-header">
            <span id="results-modal-title">🏁 RÉSULTATS DE LA COURSE 1 / 3</span>
            <span id="results-draft-status" class="pill-badge gold-pill">Choix des bonus en cours...</span>
          </div>

          <div class="results-two-cols">
            <!-- Left: Race Ranking & Cup Points -->
            <div class="results-standings-box">
              <h3>🏆 Classement & Points de la Coupe</h3>
              <div id="results-rankings-list" class="results-rankings-list"></div>
            </div>

            <!-- Right: Catch-Up Modifier Draft (For players who didn't finish 1st) -->
            <div class="results-draft-box">
              <div id="draft-eligible-panel">
                <h3>⚡ BONUS DE RATTRAPAGE (CHOISISSEZ 1 MODIFICATEUR)</h3>
                <p class="draft-subtitle">
                  Choisissez un modificateur cumulable pour votre chenille sur les courses suivantes !
                </p>
                <div id="draft-cards-container" class="draft-cards-grid"></div>
              </div>

              <div id="draft-winner-panel" class="draft-winner-notice hidden">
                <div class="winner-medal-big">🥇</div>
                <h3>VOUS AVEZ TERMINÉ 1ER DE LA COURSE !</h3>
                <p>
                  Bravo ! Vous prenez la tête avec <strong>+10 points</strong>. Les poursuivants choisissent actuellement leur modificateur de rattrapage pour tenter de vous détrôner à la course suivante !
                </p>
              </div>
            </div>
          </div>

          <div class="modal-buttons">
            <button id="btn-host-next-race" class="cartoon-btn green-btn hidden">
              ▶ Lancer la Course Suivante (Admin)
            </button>
          </div>
        </div>
      </div>

      <!-- ==================== 6. MODAL PODIUM FINAL DE LA COUPE & CADEAU COSMÉTIQUE ==================== -->
      <div id="modal-cup-podium" class="modal-backdrop hidden">
        <div class="modal-card mp-podium-card dark-glass-panel">
          <div class="panel-wood-header big-wood-header gold-wood">
            <span id="podium-cup-title">🏆 PODIUM FINAL DE LA COUPE ! 🏆</span>
          </div>

          <!-- Visual 3-Step Podium -->
          <div id="podium-steps-container" class="podium-steps-container"></div>

          <!-- Mystery Cosmetic Gift Box for Winner -->
          <div id="podium-gift-section" class="podium-gift-section">
            <div id="podium-gift-box" class="podium-gift-box">
              <div class="gift-icon-anim" id="gift-icon-anim">🎁</div>
              <div class="gift-info">
                <h3 id="gift-headline">RÉCOMPENSE DU CHAMPION !</h3>
                <p id="gift-description">Le grand vainqueur de la compétition remporte un cosmétique mystère à débloquer !</p>
              </div>
              <button id="btn-open-gift" class="cartoon-btn orange-btn">✨ Ouvrir mon Cadeau !</button>
            </div>
          </div>

          <div class="modal-buttons">
            <button id="btn-podium-return-room" class="cartoon-btn green-btn">
              🏠 Retourner au Salon
            </button>
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

    // Host Room Settings Sliders
    const bindRoomSlider = (id, key, formatFn, isInt = false) => {
      const slider = document.getElementById(`rs-${id}`);
      const valEl = document.getElementById(`rs-val-${id}`);
      if (!slider) return;
      slider.addEventListener('input', () => {
        if (!this.network.isHost()) return;
        const val = isInt ? parseInt(slider.value, 10) : parseFloat(slider.value);
        if (valEl) valEl.textContent = formatFn(val);
        this.network.updateRoomConfig({ [key]: val });
      });
    };

    bindRoomSlider('jumpBoost', 'jumpBoost', v => `${v.toFixed(2)}x`, false);
    bindRoomSlider('startScale', 'startScale', v => `${v.toFixed(2)}x`, false);
    bindRoomSlider('startSegments', 'startSegments', v => `${v}`, true);
    bindRoomSlider('gravity', 'gravity', v => `${v}`, true);
    bindRoomSlider('gripDistance', 'gripDistance', v => `${v} px`, true);
    bindRoomSlider('pvpDamageMult', 'pvpDamageMult', v => `${v.toFixed(2)}x`, false);

    document.getElementById('btn-reset-room-settings')?.addEventListener('click', () => {
      if (!this.network.isHost()) return;
      this.network.updateRoomConfig({
        jumpBoost: 1.0,
        startScale: 1.0,
        startSegments: 5,
        gravity: 740,
        gripDistance: 26,
        pvpDamageMult: 1.0
      });
      sound.playBoing();
    });

    // Room Start Cup / Ready button
    document.getElementById('btn-room-start-cup')?.addEventListener('click', () => {
      if (!this.network.currentRoom) return;
      if (this.network.isHost()) {
        sound.playVictory();
        this.network.startCup();
      } else {
        sound.playGrip(true);
        const me = this.network.getLocalPlayer();
        const nextReady = !(me && me.ready);
        this.network.updateProfile(this.network.pseudo, this.game.caterpillar.cosmetics, nextReady);
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

    // Host Next Race button in Results modal
    document.getElementById('btn-host-next-race')?.addEventListener('click', () => {
      if (this.network.isHost()) {
        sound.playGrip(true);
        this.network.nextCupRace();
      }
    });

    // Podium Open Gift button
    document.getElementById('btn-open-gift')?.addEventListener('click', () => {
      this.claimVictoryCosmeticGift();
    });

    // Podium Return to Room button
    document.getElementById('btn-podium-return-room')?.addEventListener('click', () => {
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
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
      this.showScreen('room');
      this.renderRoomLobby(room);
    });

    this.network.on('left_room', (msg) => {
      document.getElementById('modal-race-results')?.classList.add('hidden');
      document.getElementById('modal-cup-podium')?.classList.add('hidden');
      if (msg && Array.isArray(msg.rooms)) {
        this.renderOpenLobbies(msg.rooms);
      }
      this.showScreen('home');
    });

    this.network.on('room_error', (msg) => {
      alert((msg && msg.message) || 'Erreur de salon');
    });

    this.network.on('cup_race_start', (msg) => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
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
      const statusEl = document.getElementById('results-draft-status');
      if (statusEl && msg.pseudo) {
        const mod = RACE_MODIFIERS[msg.modifierId];
        statusEl.textContent = `${msg.pseudo} a choisi ${mod ? mod.icon + ' ' + mod.name : 'son bonus'} !`;
      }
    });

    this.network.on('draft_all_ready', () => {
      const statusEl = document.getElementById('results-draft-status');
      if (statusEl) {
        statusEl.textContent = '✅ Tous les joueurs ont choisi leur modificateur !';
      }
    });

    this.network.on('cup_podium_start', (msg) => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
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

    if (screenName === 'home' || screenName === 'room') {
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
              <span>👥 <strong>${r.playerCount}/${r.maxPlayers || 4}</strong> Joueurs</span>
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
    if (countEl) countEl.textContent = `${(room.players || []).length}/${cfg.maxPlayers || 4}`;
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

    // 2. Render Cup Selection Cards
    const cupListEl = document.getElementById('cup-selector-list');
    if (cupListEl) {
      const currentCupId = cfg.cupId || 'potager_geant';
      cupListEl.innerHTML = Object.values(CUPS_DEFINITIONS).map((cup) => {
        const selected = currentCupId === cup.id;
        const lvls = cup.levels || [0, 1, 2];
        const mapNames = lvls.map((idx, i) => {
          const lvl = LEVEL_DEFINITIONS[idx] || LEVEL_DEFINITIONS[0];
          return `${i + 1}. ${lvl.name}`;
        }).join(' • ');

        return `
          <div class="cup-card ${selected ? 'active' : ''} ${!isHost ? 'readonly' : ''}" data-cup="${cup.id}">
            <div class="cup-card-top">
              <span class="cup-icon">${cup.icon}</span>
              <div class="cup-titles">
                <strong>${cup.name}</strong>
                <small>${cup.desc || ''}</small>
              </div>
              ${selected ? '<span class="cup-check">✔</span>' : ''}
            </div>
            <div class="cup-maps-preview">${mapNames}</div>
          </div>
        `;
      }).join('');

      if (isHost) {
        cupListEl.querySelectorAll('.cup-card').forEach(card => {
          card.addEventListener('click', () => {
            sound.playGrip(true);
            this.network.updateRoomConfig({ cupId: card.dataset.cup });
          });
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

    syncSlider('jumpBoost', cfg.jumpBoost !== undefined ? cfg.jumpBoost : 1.0, v => `${Number(v).toFixed(2)}x`);
    syncSlider('startScale', cfg.startScale !== undefined ? cfg.startScale : 1.0, v => `${Number(v).toFixed(2)}x`);
    syncSlider('startSegments', cfg.startSegments !== undefined ? cfg.startSegments : 5, v => `${v}`);
    syncSlider('gravity', cfg.gravity !== undefined ? cfg.gravity : 740, v => `${v}`);
    syncSlider('gripDistance', cfg.gripDistance !== undefined ? cfg.gripDistance : 26, v => `${v} px`);
    syncSlider('pvpDamageMult', cfg.pvpDamageMult !== undefined ? cfg.pvpDamageMult : 1.0, v => `${Number(v).toFixed(2)}x`);

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
        startBtn.className = 'cartoon-cta-btn green-cta full-width';
        startLabel.textContent = 'LANCER LA COMPÉTITION !';
        startSub.textContent = `3 Courses • ${pCount} Joueur${pCount > 1 ? 's' : ''} dans le monde`;
      } else {
        const me = this.network.getLocalPlayer();
        const ready = me && me.ready;
        startBtn.className = `cartoon-cta-btn ${ready ? 'orange-cta' : 'green-cta'} full-width`;
        startLabel.textContent = ready ? 'PRÊT ! (EN ATTENTE DE L\'ADMIN)' : 'JE SUIS PRÊT !';
        startSub.textContent = 'Vous pouvez modifier votre chenille en attendant';
      }
    }
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
            <div class="ws-sub">${cls.pros[0] || ''}</div>
          </button>
        `;
      }).join('');

      grid.querySelectorAll('.ws-item-card').forEach(btn => {
        btn.addEventListener('click', () => {
          this.game.caterpillar.setBodyType(btn.dataset.class);
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
  showRaceResultsModal(msg) {
    const modal = document.getElementById('modal-race-results');
    if (!modal) return;
    modal.classList.remove('hidden');
    sound.playVictory();

    this.selectedModifierId = null;

    const titleEl = document.getElementById('results-modal-title');
    if (titleEl) {
      titleEl.textContent = `🏁 RÉSULTATS — COURSE ${(msg.raceIndex || 0) + 1} / 3`;
    }

    const standings = msg.standings || [];
    const rankingsEl = document.getElementById('results-rankings-list');
    if (rankingsEl) {
      rankingsEl.innerHTML = standings.map(r => {
        const isMe = r.id === this.network.playerId;
        const modsIcons = (r.modifiers || []).map(m => (RACE_MODIFIERS[m] ? RACE_MODIFIERS[m].icon : '')).join(' ');
        return `
          <div class="res-rank-row ${isMe ? 'is-me' : ''} ${r.rank === 1 ? 'first-place' : ''}">
            <span class="res-pos">${r.rank === 1 ? '🥇 1er' : (r.rank === 2 ? '🥈 2e' : (r.rank === 3 ? '🥉 3e' : `${r.rank}e`))}</span>
            <span class="res-pseudo">${this.escapeHtml(r.pseudo)} ${modsIcons}</span>
            <span class="res-race-pts">+${r.pointsEarned} pts</span>
            <strong class="res-total-pts">🏆 ${r.totalScore} pts</strong>
          </div>
        `;
      }).join('');
    }

    const myEntry = standings.find(r => r.id === this.network.playerId);
    const myChoices = (myEntry && myEntry.draftOptions) || [];
    const isFirstPlaceNoDraft = myEntry && myEntry.rank === 1 && myChoices.length === 0;

    const eligiblePanel = document.getElementById('draft-eligible-panel');
    const winnerPanel = document.getElementById('draft-winner-panel');
    const cardsContainer = document.getElementById('draft-cards-container');

    if (isFirstPlaceNoDraft || myChoices.length === 0) {
      eligiblePanel?.classList.add('hidden');
      winnerPanel?.classList.remove('hidden');
    } else {
      eligiblePanel?.classList.remove('hidden');
      winnerPanel?.classList.add('hidden');

      if (cardsContainer) {
        cardsContainer.innerHTML = myChoices.map(modId => {
          const mod = RACE_MODIFIERS[modId];
          if (!mod) return '';
          return `
            <button class="draft-mod-card" data-mod="${mod.id}" style="--mod-color: ${mod.color};">
              <div class="dmc-icon">${mod.icon}</div>
              <div class="dmc-title">${mod.name}</div>
              <div class="dmc-sub">${mod.subtitle}</div>
              <p class="dmc-desc">${mod.desc}</p>
              <span class="dmc-select-pill">Choisir ce bonus ✨</span>
            </button>
          `;
        }).join('');

        cardsContainer.querySelectorAll('.draft-mod-card').forEach(card => {
          card.addEventListener('click', () => {
            if (this.selectedModifierId) return;
            const modId = card.dataset.mod;
            this.selectedModifierId = modId;
            cardsContainer.querySelectorAll('.draft-mod-card').forEach(c => {
              c.classList.toggle('selected', c === card);
              c.classList.toggle('dimmed', c !== card);
            });
            const pill = card.querySelector('.dmc-select-pill');
            if (pill) pill.textContent = '✅ BONUS SÉLECTIONNÉ !';
            sound.playPowerUp();
            this.network.selectModifier(modId);
          });
        });
      }
    }

    const btnNext = document.getElementById('btn-host-next-race');
    if (btnNext) {
      btnNext.classList.toggle('hidden', !this.network.isHost());
    }
  }

  // ==================== FINAL CUP PODIUM & COSMETIC GIFT MODAL ====================
  showCupPodiumModal(msg) {
    const modal = document.getElementById('modal-cup-podium');
    if (!modal) return;
    modal.classList.remove('hidden');
    sound.playVictory();

    this.hasClaimedCupGift = false;
    const standings = msg.overallStandings || [];
    const podiumEl = document.getElementById('podium-steps-container');

    if (podiumEl) {
      const first = standings[0];
      const second = standings[1];
      const third = standings[2];

      const renderStep = (p, place, medal, heightClass) => {
        if (!p) return `<div class="podium-column empty ${heightClass}"></div>`;
        const pal = COSMETIC_PALETTES[(p.cosmetics && p.cosmetics.palette) || 'emerald'] || COSMETIC_PALETTES.emerald;
        return `
          <div class="podium-column ${heightClass}">
            <div class="podium-player-badge" style="border-color: ${pal.bodyFill};">
              <div class="podium-medal">${medal}</div>
              <strong class="podium-name">${this.escapeHtml(p.pseudo)}</strong>
              <span class="podium-pts">${p.totalScore} pts</span>
            </div>
            <div class="podium-step-block" style="background: linear-gradient(180deg, ${pal.bodyFill}, ${pal.bodyShade});">
              <span class="podium-step-num">${place}</span>
            </div>
          </div>
        `;
      };

      podiumEl.innerHTML = `
        ${renderStep(second, '2e', '🥈', 'step-2')}
        ${renderStep(first, '1er', '👑', 'step-1')}
        ${renderStep(third, '3e', '🥉', 'step-3')}
      `;
    }

    const isCupWinner = msg.championId === this.network.playerId;
    const giftHeadline = document.getElementById('gift-headline');
    const giftDesc = document.getElementById('gift-description');
    const btnOpenGift = document.getElementById('btn-open-gift');
    const giftIcon = document.getElementById('gift-icon-anim');

    if (giftIcon) giftIcon.textContent = '🎁';

    if (isCupWinner) {
      if (giftHeadline) giftHeadline.textContent = '🎉 FÉLICITATIONS ! VOUS REMPORTEZ LA COUPE !';
      if (giftDesc) giftDesc.textContent = 'Ouvrez votre Cadeau Mystère pour débloquer un nouveau cosmétique dans votre vestiaire !';
      if (btnOpenGift) {
        btnOpenGift.classList.remove('hidden');
        btnOpenGift.disabled = false;
        btnOpenGift.textContent = '✨ Ouvrir mon Cadeau Cosmétique !';
      }
    } else {
      const winnerPseudo = msg.championPseudo || 'Le champion';
      if (giftHeadline) giftHeadline.textContent = `🏆 ${winnerPseudo} remporte la Coupe et le Cadeau Cosmétique !`;
      if (giftDesc) giftDesc.textContent = 'Terminez 1er au classement général d\'une Coupe (3 courses) pour débloquer un cosmétique exclusif !';
      if (btnOpenGift) btnOpenGift.classList.add('hidden');
    }
  }

  claimVictoryCosmeticGift() {
    if (this.hasClaimedCupGift) return;
    this.hasClaimedCupGift = true;

    const result = unlockRandomCosmeticGift();
    const reward = result ? result.item : null;
    sound.playVictory();
    this.updateUnlockedCounters();

    const giftHeadline = document.getElementById('gift-headline');
    const giftDesc = document.getElementById('gift-description');
    const btnOpenGift = document.getElementById('btn-open-gift');
    const giftIcon = document.getElementById('gift-icon-anim');

    if (reward) {
      if (giftIcon) giftIcon.textContent = reward.icon || '🌟';
      if (giftHeadline) {
        giftHeadline.textContent = !result.isNew
          ? `🌟 COLLECTION COMPLÈTE ! (${reward.name})`
          : `🎉 NOUVEAU COSMÉTIQUE DÉBLOQUÉ : ${reward.name.toUpperCase()} !`;
      }
      if (giftDesc) {
        giftDesc.textContent = `Ce cosmétique est désormais débloqué dans votre Atelier de la Chenille !`;
      }
      if (btnOpenGift) {
        btnOpenGift.textContent = '🎨 Équiper immédiatement !';
        btnOpenGift.onclick = () => {
          if (reward.category === 'palette') this.game.caterpillar.cosmetics.palette = reward.id;
          if (reward.category === 'hat') this.game.caterpillar.cosmetics.hat = reward.id;
          if (reward.category === 'grip') this.game.caterpillar.cosmetics.grip = reward.id;
          if (reward.category === 'face') this.game.caterpillar.cosmetics.face = reward.id;
          this.game.caterpillar.saveCosmetics();
          this.onLocalCosmeticChanged();
          btnOpenGift.textContent = '✅ Équipé !';
          btnOpenGift.disabled = true;
        };
      }
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
