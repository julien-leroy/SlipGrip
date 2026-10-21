// js/adminManager.js — Panneau d'Administration SlipGrip (URL /admin)
// Gestionnaire de Gameplay, Éditeur de Maps interactif & Gestionnaire de Coupes (1 background par coupe)

import {
  GAMEPLAY_CONFIG,
  GAMEPLAY_PRESETS,
  applyPreset,
  saveGameplayConfig,
  resetGameplayConfig,
  saveAsDefaultGameplayConfig,
  CUPS_DEFINITIONS,
  AVAILABLE_BACKGROUNDS,
  loadSavedCups,
  saveSavedCups
} from './gameplayConfig.js?v=100';

import {
  LEVEL_DEFINITIONS,
  extractDeclarativeMap,
  buildFromDeclarative,
  loadSavedMaps,
  saveSavedMaps
} from './levels.js?v=100';

import { sound } from './audio.js?v=100';

// Catalogue complet des items de la Boîte à Outils (Toolbox)
export const TOOLBOX_CATALOG = [
  // 1. Sols & Terrains (Matériaux)
  { id: 'soil_dirt', category: 'terrains', subType: 'dirt', icon: '🟤', label: 'Terre & Sol', desc: 'Sol terreux naturel standard' },
  { id: 'soil_root', category: 'terrains', subType: 'root', icon: '🪵', label: 'Racine noueuse', desc: 'Bois solide et adhérent' },
  { id: 'soil_moss', category: 'terrains', subType: 'moss', icon: '🌿', label: 'Mousse duveteuse', desc: 'Amortit les chutes sans rebond' },
  { id: 'soil_stem', category: 'terrains', subType: 'stem', icon: '🌱', label: 'Tige végétale', desc: 'Branche fine à escalader' },
  { id: 'soil_leaf', category: 'terrains', subType: 'leaf', icon: '🍃', label: 'Feuille verte', desc: 'Surface végétale souple' },
  { id: 'soil_can', category: 'terrains', subType: 'can', icon: '🥫', label: 'Canette alu', desc: 'Métal rigide conducteur' },
  { id: 'soil_plastic', category: 'terrains', subType: 'plastic', icon: '🥤', label: 'Plastique dur', desc: 'Lisse et très glissant' },
  { id: 'soil_fork', category: 'terrains', subType: 'fork', icon: '🍴', label: 'Fourchette métal', desc: 'Surface métallique solide' },
  { id: 'soil_silk', category: 'terrains', subType: 'silk', icon: '🕸️', label: 'Liane de soie', desc: 'Pont suspendu aérien souple' },
  { id: 'soil_honeycomb', category: 'terrains', subType: 'honeycomb', icon: '🐝', label: 'Alvéole cire', desc: 'Sol alvéolé adhérent' },
  { id: 'soil_straw', category: 'terrains', subType: 'straw', icon: '🌾', label: 'Paille séchée', desc: 'Tiges fines et sèches' },

  // 2. Plateformes Spéciales
  { id: 'plat_leaf', category: 'platforms', subType: 'leaf', icon: '🍃', label: 'Feuille oscillante', desc: 'Rebondit sous le poids' },
  { id: 'plat_pendulum', category: 'platforms', subType: 'pendulum', icon: '⏱️', label: 'Balancier pendulaire', desc: 'Oscille dans les airs' },
  { id: 'plat_seesaw', category: 'platforms', subType: 'fork', icon: '⚖️', label: 'Couteau à bascule', desc: 'Bascule d\'un côté à l\'autre' },
  { id: 'plat_move_h', category: 'platforms', subType: 'moving_h', icon: '↔️', label: 'Plateforme Mobile H', desc: 'Navette horizontale auto' },
  { id: 'plat_move_v', category: 'platforms', subType: 'moving_v', icon: '↕️', label: 'Plateforme Mobile V', desc: 'Ascenseur vertical auto' },

  // 3. Ennemis
  { id: 'enemy_aphid', category: 'enemies', subType: 'aphid', icon: '🐛', label: 'Puceron patrouilleur', desc: 'Patrouille et projetable' },
  { id: 'enemy_hedgehog', category: 'enemies', subType: 'hedgehog', icon: '🦔', label: 'Hérisson aux piquants', desc: 'Piquant et agressif' },

  // 4. Pouvoirs
  { id: 'power_feather', category: 'powers', subType: 'feather', icon: '🪶', label: 'Plume Poids-Plume', desc: 'Plane dans les airs' },
  { id: 'power_speed', category: 'powers', subType: 'speed', icon: '⚡', label: 'Éclair Vitesse', desc: 'Vitesse de déplacement x1.5' },
  { id: 'power_strength', category: 'powers', subType: 'strength', icon: '💪', label: 'Haltère Super-Force', desc: 'Projette glands et ennemis' },
  { id: 'power_shield', category: 'powers', subType: 'shield', icon: '🛡️', label: 'Bulle Bouclier', desc: 'Protège contre 1 choc' },

  // 5. Accessoires & Pièges
  { id: 'prop_acorn', category: 'props', subType: 'acorn', icon: '🌰', label: 'Gland propulsable', desc: 'Munition légère projetable' },
  { id: 'prop_pinecone', category: 'props', subType: 'pinecone', icon: '🌲', label: 'Pomme de pin lourde', desc: 'Obstacle massif roulant' },
  { id: 'hazard_thorn', category: 'props', subType: 'thorn', icon: '🌵', label: 'Ronce piquante', desc: 'Pique et ralentit' },
  { id: 'hazard_honey', category: 'props', subType: 'honey', icon: '🍯', label: 'Goutte de miel', desc: 'Colle fermement la chenille' },
  { id: 'hazard_jam', category: 'props', subType: 'jam', icon: '🍓', label: 'Confiture gluante', desc: 'Surface collante rouge' },

  // 6. Interactifs & Décorations
  { id: 'inter_mushroom', category: 'interact', subType: 'mushroom', icon: '🍄', label: 'Champignon tremplin', desc: 'Propulse haut dans les airs' },
  { id: 'inter_checkpoint', category: 'interact', subType: 'checkpoint', icon: '🚩', label: 'Checkpoint', desc: 'Point de réapparition' },
  { id: 'inter_start', category: 'interact', subType: 'start', icon: '🏁', label: 'Drapeau Départ', desc: 'Spawn de départ de la course' },
  { id: 'inter_finish', category: 'interact', subType: 'finish', icon: '🏆', label: 'Arche d\'Arrivée', desc: 'Ligne d\'arrivée de la course' },
  { id: 'deco_flower', category: 'interact', subType: 'flower', icon: '🌸', label: 'Fleur géante', desc: 'Décoration champêtre' },
  { id: 'deco_fern', category: 'interact', subType: 'fern', icon: '🌿', label: 'Fougère courbée', desc: 'Décoration végétale' }
];

export function isAdminRoute() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/admin' || p === '/admin/' || p.startsWith('/admin') || h === '#admin';
}

export class AdminManager {
  constructor(game) {
    this.game = game;
    this.container = null;
    this.activeTab = 'gameplay'; // 'gameplay' | 'maps' | 'cups'
    this.selectedMapId = 0;
    this.selectedCupId = 'coupe_bourgeons';
    this.mapEditorData = null;
    this.previewPanX = 0;
    this.previewZoom = 0.28;
    this.isDraggingCanvas = false;
    this.dragStartX = 0;
    this.dragStartPanX = 0;

    // Fullscreen Studio State
    this.studioContainer = null;
    this.studioCanvas = null;
    this.studioCtx = null;
    this.studioMinimapCanvas = null;
    this.studioMinimapCtx = null;
    this.studioPanX = 0;
    this.studioPanY = -80;
    this.studioZoom = 0.55;
    this.studioSnapGrid = true;
    this.studioSelection = null; // { category, index, vertexIndex }
    this.studioActiveToolboxTab = 'all';
    this.isDraggingItem = false;
    this.isRotatingItem = false;
    this.isPanningStudio = false;
    this.isSpacePanning = false;
    this.isDraggingMinimap = false;
    this.dragStartMouse = { x: 0, y: 0 };
    this.dragStartPan = { x: 0, y: 0 };
    this.dragStartItemPos = null;

    // Load any custom maps & cups on start
    loadSavedMaps();
    loadSavedCups();

    // Check URL route on load and on state change
    this.checkRoute();
    window.addEventListener('popstate', () => this.checkRoute());
    window.addEventListener('hashchange', () => this.checkRoute());
  }

  checkRoute() {
    if (isAdminRoute()) {
      this.open();
    } else if (this.container && !this.container.classList.contains('hidden')) {
      this.close(false);
    }
  }

  open() {
    if (!this.container) {
      this.buildDOM();
    }
    this.container.classList.remove('hidden');

    // Pause / hide game HUD and main screens
    if (this.game && this.game.ui) {
      document.getElementById('screen-home')?.classList.add('hidden');
      document.getElementById('screen-lobbies')?.classList.add('hidden');
      document.getElementById('screen-room-lobby')?.classList.add('hidden');
      document.getElementById('hud-top')?.classList.add('hidden');
      document.getElementById('hud-bottom')?.classList.add('hidden');
    }

    this.switchTab(this.activeTab);
  }

  close(navigate = true) {
    if (this.container) {
      this.container.classList.add('hidden');
    }
    if (navigate && window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    if (this.game && this.game.ui) {
      this.game.ui.showScreen('home');
    }
  }

  buildDOM() {
    const wrapper = document.getElementById('game-wrapper') || document.body;
    this.container = document.createElement('div');
    this.container.id = 'admin-root';
    this.container.className = 'admin-root';

    this.container.innerHTML = `
      <div class="admin-topbar">
        <div class="admin-brand">
          <span class="admin-icon">🛠️</span>
          <div class="admin-titles">
            <strong>SLIPGRIP — PANNEAU ADMIN</strong>
            <small>Configuration Gameplay, Éditeur de Maps & Gestionnaire de Coupes</small>
          </div>
        </div>

        <nav class="admin-tabs-nav">
          <button class="admin-tab-btn active" data-tab="gameplay">🎛️ Paramètres Gameplay</button>
          <button class="admin-tab-btn" data-tab="maps">🗺️ Éditeur de Maps</button>
          <button class="admin-tab-btn" data-tab="cups">🏆 Gestionnaire de Coupes</button>
        </nav>

        <div class="admin-top-actions">
          <button id="btn-admin-close" class="admin-btn secondary-btn">◀ Retour au Jeu</button>
        </div>
      </div>

      <div class="admin-content-area">
        <!-- 1. ONGLET GAMEPLAY -->
        <section id="admin-sec-gameplay" class="admin-section active">
          <div class="admin-card">
            <div class="admin-card-header">
              <h3>🎮 Presets Prédéfinis</h3>
              <p>Activez instantanément un profil de maniement complet.</p>
            </div>
            <div class="admin-presets-grid" id="admin-presets-list"></div>
          </div>

          <div class="admin-card">
            <div class="admin-card-header">
              <h3>🎛️ Variables de Physique & Contrôles</h3>
              <p>Modifiez en direct les valeurs clés du gameplay.</p>
            </div>
            <div class="admin-sliders-grid" id="admin-sliders-list"></div>

            <div class="admin-actions-bar">
              <button id="btn-admin-save-default" class="admin-btn primary-btn">💾 Définir par Défaut</button>
              <button id="btn-admin-copy-config" class="admin-btn secondary-btn">📋 Copier Config JS</button>
              <button id="btn-admin-reset-config" class="admin-btn danger-btn">🔄 Réinitialiser</button>
            </div>
          </div>
        </section>

        <!-- 2. ONGLET ÉDITEUR DE MAPS -->
        <section id="admin-sec-maps" class="admin-section hidden">
          <div class="map-editor-layout">
            <!-- Sidebar : Choix & Métadonnées -->
            <div class="map-editor-sidebar admin-card">
              <div class="admin-card-header flex-between">
                <h3>🗺️ Niveaux</h3>
                <button id="btn-admin-new-map" class="admin-btn mini-btn green-btn">➕ Nouvelle Map</button>
              </div>

              <div class="form-group">
                <label for="admin-map-select">Sélectionner une Map :</label>
                <select id="admin-map-select" class="admin-select"></select>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="admin-map-name">Nom de la Map :</label>
                  <input type="text" id="admin-map-name" class="admin-input" />
                </div>
                <div class="form-group">
                  <label for="admin-map-diff">Difficulté :</label>
                  <select id="admin-map-diff" class="admin-select">
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="admin-map-theme">Thème Graphique :</label>
                  <select id="admin-map-theme" class="admin-select">
                    <option value="forest">Forêt & Sous-Bois</option>
                    <option value="garden">Jardin & Potager</option>
                    <option value="canopy">Canopée & Hauteurs</option>
                    <option value="mushroom">Caverne aux Spores</option>
                    <option value="marsh">Canyon Marécageux</option>
                    <option value="hive">Ruche & Alvéoles</option>
                    <option value="picnic_chaos">Pique-Nique Géant</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="admin-map-cup">Coupe d'Appartenance :</label>
                  <select id="admin-map-cup" class="admin-select"></select>
                </div>
              </div>

              <div class="form-grid-4">
                <div class="form-group">
                  <label for="admin-map-start-x">Départ X :</label>
                  <input type="number" id="admin-map-start-x" class="admin-input" value="160" />
                </div>
                <div class="form-group">
                  <label for="admin-map-start-y">Départ Y :</label>
                  <input type="number" id="admin-map-start-y" class="admin-input" value="500" />
                </div>
                <div class="form-group">
                  <label for="admin-map-finish-x">Arrivée X :</label>
                  <input type="number" id="admin-map-finish-x" class="admin-input" value="4400" />
                </div>
                <div class="form-group">
                  <label for="admin-map-finish-y">Arrivée Y :</label>
                  <input type="number" id="admin-map-finish-y" class="admin-input" value="460" />
                </div>
              </div>

              <div class="form-group">
                <label for="admin-map-subtitle">Sous-titre descriptif :</label>
                <input type="text" id="admin-map-subtitle" class="admin-input" />
              </div>

              <div class="form-group">
                <label for="admin-map-hint">Conseil du Coach :</label>
                <textarea id="admin-map-hint" class="admin-textarea" rows="2"></textarea>
              </div>

              <div class="map-sidebar-actions">
                <button id="btn-admin-open-studio" class="admin-btn green-btn full-width highlight-pulse" style="font-size: 1.05rem; padding: 14px 18px; margin-bottom: 8px;">🛠️ Éditer la map (Studio Plein Écran)</button>
                <button id="btn-admin-save-map" class="admin-btn primary-btn full-width">💾 Enregistrer la Map</button>
                <button id="btn-admin-test-map" class="admin-btn secondary-btn full-width">🎮 Tester en Solo</button>
                <button id="btn-admin-export-map" class="admin-btn secondary-btn full-width">📋 Exporter en Code JS</button>
              </div>
            </div>

            <!-- Main Editor Area : Canvas Preview & Elements Inspector -->
            <div class="map-editor-main">
              <!-- Canvas Interactive Preview -->
              <div class="admin-card map-canvas-box">
                <div class="map-canvas-header">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span>Aperçu Interactif du Terrain</span>
                    <button id="btn-canvas-open-studio" class="admin-btn mini-btn green-btn">🛠️ Éditer la map</button>
                  </div>
                  <div class="canvas-controls">
                    <span id="map-coord-readout" class="coord-readout">X: 0 | Y: 0</span>
                    <button id="btn-zoom-out" class="mini-icon-btn">🔍-</button>
                    <span id="zoom-level-txt" class="zoom-txt">30%</span>
                    <button id="btn-zoom-in" class="mini-icon-btn">🔍+</button>
                    <button id="btn-zoom-reset" class="mini-icon-btn" title="Vue d'ensemble">🏠</button>
                  </div>
                </div>

                <div class="canvas-viewport-wrap" id="map-canvas-viewport">
                  <canvas id="map-preview-canvas" width="1200" height="340"></canvas>
                </div>

                <div class="canvas-pan-slider-row">
                  <span>Défiler horizontalement :</span>
                  <input type="range" id="map-pan-slider" min="-200" max="6000" step="50" value="0" />
                  <span id="pan-val-txt">0 px</span>
                </div>
              </div>

              <!-- Elements Manager (Polylines, Props, Enemies, Hazards) -->
              <div class="admin-card map-elements-card">
                <div class="elements-tabs">
                  <button class="elem-tab active" data-elem="polylines">⛰️ Terrains & Branches (<span id="count-polylines">0</span>)</button>
                  <button class="elem-tab" data-elem="props">🌰 Glands & Pommes (<span id="count-props">0</span>)</button>
                  <button class="elem-tab" data-elem="enemies">🐛 Pucerons & Hérissons (<span id="count-enemies">0</span>)</button>
                  <button class="elem-tab" data-elem="hazards">🌵 Ronces & Miel (<span id="count-hazards">0</span>)</button>
                  <button class="elem-tab" data-elem="extras">🍄 Tremplins & Bonus (<span id="count-extras">0</span>)</button>
                </div>

                <div class="elements-body" id="map-elements-body"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. ONGLET GESTIONNAIRE DE COUPES -->
        <section id="admin-sec-cups" class="admin-section hidden">
          <div class="cups-manager-layout">
            <!-- Cups List -->
            <div class="cups-list-col admin-card">
              <div class="admin-card-header flex-between">
                <h3>🏆 Coupes du Jeu</h3>
                <button id="btn-admin-new-cup" class="admin-btn mini-btn green-btn">➕ Nouvelle Coupe</button>
              </div>

              <div id="admin-cups-grid" class="admin-cups-grid"></div>
            </div>

            <!-- Cup Editor Form -->
            <div class="cup-editor-col admin-card">
              <div class="admin-card-header">
                <h3 id="cup-editor-heading">Édition de la Coupe</h3>
                <p>Configurez les 3 maps de la coupe et son <strong>background unique</strong> partagé.</p>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="admin-cup-name">Nom de la Coupe :</label>
                  <input type="text" id="admin-cup-name" class="admin-input" />
                </div>
                <div class="form-group">
                  <label for="admin-cup-diff">Difficulté :</label>
                  <select id="admin-cup-diff" class="admin-select">
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label for="admin-cup-icon">Icône Emoji :</label>
                  <input type="text" id="admin-cup-icon" class="admin-input" maxlength="4" value="🏆" />
                </div>
                <div class="form-group">
                  <label for="admin-cup-desc">Description courte :</label>
                  <input type="text" id="admin-cup-desc" class="admin-input" />
                </div>
              </div>

              <!-- BACKGROUND UNIQUE DE LA COUPE -->
              <div class="form-group cup-bg-section">
                <label>🖼️ Arrière-Plan Unique de la Coupe (appliqué à l'ensemble des 3 maps) :</label>
                <p class="section-hint">Toutes les maps associées à cette coupe afficheront cet univers visuel.</p>
                <div class="bg-picker-grid" id="cup-bg-picker"></div>
              </div>

              <!-- 3 MAPS DE LA COUPE -->
              <div class="form-group cup-maps-section">
                <label>🏁 Les 3 Courses de la Coupe (Progression 1 -> 2 -> 3) :</label>
                <div class="cup-maps-slots">
                  <div class="cup-slot-item">
                    <span class="slot-badge">Course 1</span>
                    <select id="admin-cup-map-0" class="admin-select cup-map-select"></select>
                  </div>
                  <div class="cup-slot-item">
                    <span class="slot-badge">Course 2</span>
                    <select id="admin-cup-map-1" class="admin-select cup-map-select"></select>
                  </div>
                  <div class="cup-slot-item">
                    <span class="slot-badge">Course 3</span>
                    <select id="admin-cup-map-2" class="admin-select cup-map-select"></select>
                  </div>
                </div>
              </div>

              <div class="cup-actions-bar">
                <button id="btn-admin-save-cup" class="admin-btn primary-btn">💾 Enregistrer la Coupe</button>
                <button id="btn-admin-export-cups" class="admin-btn secondary-btn">📋 Exporter en Code JS</button>
                <button id="btn-admin-delete-cup" class="admin-btn danger-btn hidden">🗑️ Supprimer</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Code Export Modal -->
      <div id="admin-code-modal" class="admin-modal-backdrop hidden">
        <div class="admin-modal-card">
          <div class="modal-header">
            <h3 id="admin-code-title">Code Exporté</h3>
            <button id="btn-close-code-modal" class="close-x-btn">✕</button>
          </div>
          <textarea id="admin-code-textarea" class="admin-code-area" readonly></textarea>
          <div class="modal-footer">
            <button id="btn-copy-code-text" class="admin-btn primary-btn">Copier dans le Presse-Papier 📋</button>
          </div>
        </div>
      </div>

      <!-- FULLSCREEN MAP STUDIO -->
      <div id="fullscreen-map-studio" class="fullscreen-studio hidden">
        <header class="studio-topbar">
          <div class="studio-topbar-left">
            <button id="btn-studio-close" class="admin-btn secondary-btn">◀ Quitter le Studio</button>
            <div class="studio-map-meta">
              <span class="studio-map-badge" id="studio-map-badge">MAP 0</span>
              <strong id="studio-map-title">Nom de la Map</strong>
              <span class="studio-cup-tag" id="studio-cup-tag">🏆 Coupe</span>
            </div>
          </div>

          <div class="studio-topbar-center">
            <div class="studio-view-controls">
              <button id="studio-zoom-out" class="studio-tool-btn" title="Zoom arrière">🔍 -</button>
              <span id="studio-zoom-val" class="studio-zoom-readout">55%</span>
              <button id="studio-zoom-in" class="studio-tool-btn" title="Zoom avant">🔍 +</button>
              <button id="studio-zoom-fit" class="studio-tool-btn" title="Vue globale de la map">🔲 Vue globale</button>
            </div>
            <div class="studio-coord-badge" id="studio-coord-badge">📍 X: 0 | Y: 0</div>
            <label class="studio-toggle-label" title="Aligner sur la grille de 20px">
              <input type="checkbox" id="studio-grid-snap" checked />
              <span>🧲 Grille (20px)</span>
            </label>
          </div>

          <div class="studio-topbar-right">
            <button id="btn-studio-delete" class="admin-btn danger-btn mini-btn" title="Supprimer la sélection (Touche Suppr)">🗑️ Supprimer (Suppr)</button>
            <button id="btn-studio-save" class="admin-btn primary-btn">💾 Sauvegarder</button>
            <button id="btn-studio-test" class="admin-btn green-btn">🎮 Tester la Map</button>
          </div>
        </header>

        <div class="studio-body">
          <!-- Left: Toolbox -->
          <aside class="studio-toolbox">
            <div class="toolbox-header">
              <h4>🧰 BOÎTE À OUTILS</h4>
              <small>Glissez-déposez sur la map</small>
            </div>

            <div class="toolbox-tabs" id="studio-toolbox-tabs">
              <button class="tb-tab active" data-tb="all">Tout</button>
              <button class="tb-tab" data-tb="terrains">Sols</button>
              <button class="tb-tab" data-tb="platforms">Plateformes</button>
              <button class="tb-tab" data-tb="enemies">Ennemis</button>
              <button class="tb-tab" data-tb="powers">Pouvoirs</button>
              <button class="tb-tab" data-tb="props">Pièges</button>
              <button class="tb-tab" data-tb="interact">Interactifs</button>
            </div>

            <div class="toolbox-items-list" id="toolbox-items-list"></div>
          </aside>

          <!-- Center: Canvas Viewport -->
          <main class="studio-canvas-container" id="studio-canvas-container">
            <canvas id="studio-main-canvas"></canvas>
            <div class="studio-canvas-hint">
              <span>💡 <strong>Astuce :</strong> Molette = Zoomer • Clic Droit ou Espace+Glisser = Caméra • Glissez un item depuis la boîte à outils pour le poser</span>
            </div>

            <div class="studio-minimap-bar">
              <div class="minimap-track" id="studio-minimap-track">
                <canvas id="studio-minimap-canvas" height="32"></canvas>
                <div class="minimap-viewport-box" id="studio-minimap-viewport"></div>
              </div>
            </div>
          </main>

          <!-- Right: Inspector -->
          <aside class="studio-inspector" id="studio-inspector"></aside>
        </div>
      </div>
    `;

    wrapper.appendChild(this.container);
    this.bindEvents();
  }

  bindEvents() {
    // Top Tabs
    this.container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Close button
    document.getElementById('btn-admin-close')?.addEventListener('click', () => {
      this.close(true);
    });

    // Close code modal
    document.getElementById('btn-close-code-modal')?.addEventListener('click', () => {
      document.getElementById('admin-code-modal')?.classList.add('hidden');
    });
    document.getElementById('btn-copy-code-text')?.addEventListener('click', () => {
      const ta = document.getElementById('admin-code-textarea');
      if (ta) {
        ta.select();
        navigator.clipboard.writeText(ta.value);
        sound.playGrip(true);
      }
    });

    // Boutons d'ouverture du Studio Plein Écran
    document.getElementById('btn-admin-open-studio')?.addEventListener('click', () => {
      this.openFullscreenStudio(this.selectedMapId);
    });
    document.getElementById('btn-canvas-open-studio')?.addEventListener('click', () => {
      this.openFullscreenStudio(this.selectedMapId);
    });

    this.initGameplayTab();
    this.initMapEditorTab();
    this.initCupManagerTab();
    this.initStudioEvents();
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.getElementById('admin-sec-gameplay')?.classList.toggle('hidden', tabName !== 'gameplay');
    document.getElementById('admin-sec-maps')?.classList.toggle('hidden', tabName !== 'maps');
    document.getElementById('admin-sec-cups')?.classList.toggle('hidden', tabName !== 'cups');

    if (tabName === 'maps') {
      this.loadMapIntoEditor(this.selectedMapId);
    } else if (tabName === 'cups') {
      this.renderCupsList();
      this.loadCupIntoEditor(this.selectedCupId);
    }
  }

  // ==================== 1. GAMEPLAY SETTINGS TAB ====================
  initGameplayTab() {
    const presetsList = document.getElementById('admin-presets-list');
    if (presetsList) {
      presetsList.innerHTML = Object.entries(GAMEPLAY_PRESETS).map(([k, p]) => `
        <button class="admin-preset-card ${GAMEPLAY_CONFIG.activePreset === k ? 'active' : ''}" data-preset="${k}">
          <strong>${p.name}</strong>
          <span>${p.desc}</span>
        </button>
      `).join('');

      presetsList.querySelectorAll('.admin-preset-card').forEach(card => {
        card.addEventListener('click', () => {
          const k = card.dataset.preset;
          applyPreset(k);
          presetsList.querySelectorAll('.admin-preset-card').forEach(c => c.classList.toggle('active', c.dataset.preset === k));
          this.refreshGameplaySliders();
          sound.playGrip(true);
        });
      });
    }

    const slidersList = document.getElementById('admin-sliders-list');
    if (slidersList) {
      const fields = [
        { key: 'gravity', label: '🌍 Gravité', min: 200, max: 900, step: 10, unit: 'px/s²' },
        { key: 'groundSnapping', label: '⬇️ Plaquage au sol', min: 0.5, max: 3.0, step: 0.1, unit: '' },
        { key: 'walkSpeed', label: '🚶 Vitesse Marche Avant', min: 20, max: 120, step: 5, unit: 'px/s' },
        { key: 'walkBackSpeed', label: '🔙 Vitesse Marche Arrière', min: 10, max: 80, step: 5, unit: 'px/s' },
        { key: 'orientationUpForce', label: '🚀 Force Levage Tête (↑)', min: 400, max: 2200, step: 50, unit: '' },
        { key: 'orientationResponsiveness', label: '⚡ Réactivité Orientation', min: 0.5, max: 2.5, step: 0.1, unit: '' },
        { key: 'bendOrientationPower', label: '🧭 Force Orientation Charge Espace', min: 0.2, max: 2.5, step: 0.1, unit: '' },
        { key: 'jumpBoost', label: '🦘 Puissance Saut Espace', min: 0.5, max: 2.5, step: 0.05, unit: '' },
        { key: 'groundPushForce', label: '🦶 Poussée Décollage Surface', min: 0.5, max: 2.5, step: 0.05, unit: '' },
        { key: 'unbendExtensionSpeed', label: '⚡ Vitesse Détente / Déploiement', min: 3.0, max: 18.0, step: 0.5, unit: '' },
        { key: 'unbendReachBonus', label: '📏 Portée Extension Relâchement', min: 0.8, max: 1.6, step: 0.05, unit: '' },
        { key: 'jumpUpAngleBonus', label: '📐 Bonus Saut Haut', min: 0.5, max: 2.5, step: 0.05, unit: '' },
        { key: 'jumpChargeTime', label: '⏱️ Temps Max Charge Saut', min: 1.0, max: 5.0, step: 0.5, unit: 's' },
        { key: 'gripDistance', label: '🧲 Distance Accroche Ventouses', min: 12, max: 45, step: 1, unit: 'px' },
        { key: 'wigglePhysicsAmount', label: '🐛 Wiggle Larvaire', min: 0, max: 50, step: 2, unit: '' },
        { key: 'clawScale', label: '🐾 Taille des Griffes', min: 0.8, max: 2.2, step: 0.05, unit: '' }
      ];

      slidersList.innerHTML = fields.map(f => {
        const val = GAMEPLAY_CONFIG[f.key] !== undefined ? GAMEPLAY_CONFIG[f.key] : 1.0;
        return `
          <div class="admin-slider-item">
            <div class="as-label-row">
              <label for="adm-${f.key}">${f.label} :</label>
              <strong id="val-adm-${f.key}">${val}${f.unit ? ' ' + f.unit : ''}</strong>
            </div>
            <input type="range" id="adm-${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${val}" />
          </div>
        `;
      }).join('') + `
        <div class="admin-slider-item full-width-slider">
          <label for="adm-backgroundMode">🖼️ Mode Rendu Arrière-Plans :</label>
          <select id="adm-backgroundMode" class="admin-select">
            <option value="parallax" ${GAMEPLAY_CONFIG.backgroundMode === 'parallax' ? 'selected' : ''}>✨ Parallaxe Optimisé (Fluide 4-5 couches)</option>
            <option value="eco" ${GAMEPLAY_CONFIG.backgroundMode === 'eco' ? 'selected' : ''}>🍃 Mode Éco (1 image composite - 120 FPS garanti)</option>
            <option value="minimal" ${GAMEPLAY_CONFIG.backgroundMode === 'minimal' ? 'selected' : ''}>🎨 Minimaliste (Vectoriel pur)</option>
          </select>
        </div>
      `;

      fields.forEach(f => {
        const input = document.getElementById(`adm-${f.key}`);
        const readout = document.getElementById(`val-adm-${f.key}`);
        if (input && readout) {
          input.addEventListener('input', () => {
            const v = Number(input.value);
            GAMEPLAY_CONFIG[f.key] = v;
            readout.textContent = `${v}${f.unit ? ' ' + f.unit : ''}`;
            saveGameplayConfig();
          });
        }
      });

      const bgModeSelect = document.getElementById('adm-backgroundMode');
      bgModeSelect?.addEventListener('change', () => {
        GAMEPLAY_CONFIG.backgroundMode = bgModeSelect.value;
        saveGameplayConfig();
      });
    }

    // Save as default / Reset / Copy
    document.getElementById('btn-admin-save-default')?.addEventListener('click', () => {
      saveAsDefaultGameplayConfig();
      sound.playGrip(true);
      alert('Configuration gameplay enregistrée par défaut avec succès !');
    });

    document.getElementById('btn-admin-reset-config')?.addEventListener('click', () => {
      resetGameplayConfig();
      this.refreshGameplaySliders();
      sound.playGrip(true);
    });

    document.getElementById('btn-admin-copy-config')?.addEventListener('click', () => {
      const code = JSON.stringify(GAMEPLAY_CONFIG, null, 2);
      this.openCodeModal('Configuration Gameplay Active (JSON)', code);
    });
  }

  refreshGameplaySliders() {
    this.initGameplayTab();
  }

  // ==================== 2. MAP EDITOR TAB ====================
  initMapEditorTab() {
    const select = document.getElementById('admin-map-select');
    if (!select) return;

    this.refreshMapSelectOptions();

    select.addEventListener('change', () => {
      this.loadMapIntoEditor(Number(select.value));
    });

    document.getElementById('btn-admin-new-map')?.addEventListener('click', () => {
      this.createNewMap();
    });

    // Zoom & Pan controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.previewZoom = Math.min(1.2, this.previewZoom + 0.05);
      this.updateZoomText();
      this.renderMapCanvas();
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.previewZoom = Math.max(0.12, this.previewZoom - 0.05);
      this.updateZoomText();
      this.renderMapCanvas();
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      this.previewZoom = 0.28;
      this.previewPanX = 0;
      this.updateZoomText();
      this.renderMapCanvas();
    });

    const panSlider = document.getElementById('map-pan-slider');
    panSlider?.addEventListener('input', () => {
      this.previewPanX = Number(panSlider.value);
      document.getElementById('pan-val-txt').textContent = `${this.previewPanX} px`;
      this.renderMapCanvas();
    });

    // Elements category tabs
    this.container.querySelectorAll('.elem-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('.elem-tab').forEach(t => t.classList.toggle('active', t === tab));
        this.renderElementsBody(tab.dataset.elem);
      });
    });

    // Save map
    document.getElementById('btn-admin-save-map')?.addEventListener('click', () => {
      this.saveCurrentMap();
    });

    // Test map in solo
    document.getElementById('btn-admin-test-map')?.addEventListener('click', () => {
      this.testCurrentMap();
    });

    // Export map to JS
    document.getElementById('btn-admin-export-map')?.addEventListener('click', () => {
      this.exportCurrentMapCode();
    });

    // Mouse drag on canvas for panning
    const canvas = document.getElementById('map-preview-canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        this.isDraggingCanvas = true;
        this.dragStartX = e.clientX;
        this.dragStartPanX = this.previewPanX;
      });
      window.addEventListener('mousemove', (e) => {
        if (!this.isDraggingCanvas) return;
        const dx = (e.clientX - this.dragStartX) / this.previewZoom;
        this.previewPanX = Math.max(-200, Math.min(6000, this.dragStartPanX - dx));
        if (panSlider) panSlider.value = this.previewPanX;
        document.getElementById('pan-val-txt').textContent = `${Math.round(this.previewPanX)} px`;
        this.renderMapCanvas();
      });
      window.addEventListener('mouseup', () => {
        this.isDraggingCanvas = false;
      });

      // Mousemove coordinates indicator
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseCanvasX = (e.clientX - rect.left);
        const mouseCanvasY = (e.clientY - rect.top);
        const worldX = Math.round(this.previewPanX + mouseCanvasX / this.previewZoom);
        const worldY = Math.round(mouseCanvasY / this.previewZoom);
        const readout = document.getElementById('map-coord-readout');
        if (readout) readout.textContent = `X: ${worldX} | Y: ${worldY}`;
      });
    }
  }

  refreshMapSelectOptions() {
    const select = document.getElementById('admin-map-select');
    if (!select) return;
    select.innerHTML = LEVEL_DEFINITIONS.map(m => `
      <option value="${m.id}" ${m.id === this.selectedMapId ? 'selected' : ''}>
        Map ${m.id} : ${m.name} (${m.difficulty})
      </option>
    `).join('');

    // Fill cup selector
    const cupSelect = document.getElementById('admin-map-cup');
    if (cupSelect) {
      cupSelect.innerHTML = Object.values(CUPS_DEFINITIONS).map(c => `
        <option value="${c.id}">${c.name} (${c.difficulty})</option>
      `).join('');
    }
  }

  updateZoomText() {
    const zTxt = document.getElementById('zoom-level-txt');
    if (zTxt) zTxt.textContent = `${Math.round(this.previewZoom * 100)}%`;
  }

  loadMapIntoEditor(mapId) {
    this.selectedMapId = mapId;
    const map = LEVEL_DEFINITIONS.find(m => m.id === mapId) || LEVEL_DEFINITIONS[0];
    if (!map) return;

    // Fill form fields
    document.getElementById('admin-map-name').value = map.name || '';
    document.getElementById('admin-map-diff').value = map.difficulty || 'Facile';
    document.getElementById('admin-map-theme').value = map.theme || 'forest';
    document.getElementById('admin-map-cup').value = map.cupId || 'coupe_bourgeons';
    document.getElementById('admin-map-start-x').value = map.startX || 160;
    document.getElementById('admin-map-start-y').value = map.startY || 500;
    document.getElementById('admin-map-finish-x').value = map.finishX || 4400;
    document.getElementById('admin-map-finish-y').value = map.finishY || 460;
    document.getElementById('admin-map-subtitle').value = map.subtitle || '';
    document.getElementById('admin-map-hint').value = map.coachHint || '';

    // Extract declarative data
    this.mapEditorData = map.declarativeData ? JSON.parse(JSON.stringify(map.declarativeData)) : extractDeclarativeMap(map);

    this.updateElementBadges();
    const activeElemTab = this.container.querySelector('.elem-tab.active')?.dataset.elem || 'polylines';
    this.renderElementsBody(activeElemTab);
    this.renderMapCanvas();
  }

  updateElementBadges() {
    if (!this.mapEditorData) return;
    document.getElementById('count-polylines').textContent = this.mapEditorData.polylines?.length || 0;
    document.getElementById('count-props').textContent = this.mapEditorData.props?.length || 0;
    document.getElementById('count-enemies').textContent = (this.mapEditorData.aphids?.length || 0) + (this.mapEditorData.hedgehogs?.length || 0);
    document.getElementById('count-hazards').textContent = (this.mapEditorData.thorns?.length || 0) + (this.mapEditorData.stickyCrumbs?.length || 0);
    document.getElementById('count-extras').textContent = (this.mapEditorData.mushrooms?.length || 0) + (this.mapEditorData.powerUps?.length || 0) + (this.mapEditorData.dynamicPlatforms?.length || 0);
  }

  renderElementsBody(category) {
    const body = document.getElementById('map-elements-body');
    if (!body || !this.mapEditorData) return;

    if (category === 'polylines') {
      const list = this.mapEditorData.polylines || [];
      body.innerHTML = `
        <div class="elem-actions-header">
          <strong>Lignes de Terrain (${list.length})</strong>
          <button id="btn-add-polyline" class="admin-btn mini-btn green-btn">➕ Ajouter une Ligne</button>
        </div>
        <div class="elem-cards-list">
          ${list.map((p, idx) => `
            <div class="elem-card">
              <div class="elem-card-top">
                <span class="elem-badge material-${p.material}">${p.material || 'dirt'}</span>
                <span class="elem-info">${p.points?.length || 0} points • Épaisseur: ${p.thickness || 24}px</span>
                <button class="mini-icon-btn danger" data-del-poly="${idx}" title="Supprimer">🗑️</button>
              </div>
              <div class="poly-points-preview">
                Points: [${(p.points || []).map(pt => `[${pt[0]},${pt[1]}]`).join(', ')}]
              </div>
            </div>
          `).join('')}
        </div>
      `;

      body.querySelector('#btn-add-polyline')?.addEventListener('click', () => {
        this.promptAddPolyline();
      });

      body.querySelectorAll('[data-del-poly]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.delPoly);
          this.mapEditorData.polylines.splice(idx, 1);
          this.updateElementBadges();
          this.renderElementsBody('polylines');
          this.renderMapCanvas();
        });
      });
    } else if (category === 'props') {
      const list = this.mapEditorData.props || [];
      body.innerHTML = `
        <div class="elem-actions-header">
          <strong>Glands (+20 PV) & Pommes de Pin géantes (${list.length})</strong>
          <button id="btn-add-prop" class="admin-btn mini-btn green-btn">➕ Ajouter un Prop</button>
        </div>
        <div class="elem-cards-list">
          ${list.map((pr, idx) => `
            <div class="elem-card flex-between">
              <span>${pr.type === 'pinecone' ? '🌲 Pomme de pin' : '🌰 Gland'} à (X: ${Math.round(pr.x)}, Y: ${Math.round(pr.y)}) • Échelle: ${pr.scale || 1.0}</span>
              <button class="mini-icon-btn danger" data-del-prop="${idx}">🗑️</button>
            </div>
          `).join('')}
        </div>
      `;
      body.querySelector('#btn-add-prop')?.addEventListener('click', () => this.promptAddProp());
      body.querySelectorAll('[data-del-prop]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.props.splice(Number(btn.dataset.delProp), 1);
          this.updateElementBadges();
          this.renderElementsBody('props');
          this.renderMapCanvas();
        });
      });
    } else if (category === 'enemies') {
      const aphids = this.mapEditorData.aphids || [];
      const hogs = this.mapEditorData.hedgehogs || [];
      body.innerHTML = `
        <div class="elem-actions-header">
          <strong>Pucerons (${aphids.length}) & Hérissons (${hogs.length})</strong>
          <div class="flex-gap">
            <button id="btn-add-aphid" class="admin-btn mini-btn green-btn">➕ Puceron</button>
            <button id="btn-add-hog" class="admin-btn mini-btn orange-btn">➕ Hérisson</button>
          </div>
        </div>
        <div class="elem-cards-list">
          ${aphids.map((a, idx) => `
            <div class="elem-card flex-between">
              <span>🐛 Puceron à (X: ${Math.round(a.x)}, Y: ${Math.round(a.y)}) • Patrouille: [${Math.round(a.patrolMinX || a.x - 80)}, ${Math.round(a.patrolMaxX || a.x + 80)}]</span>
              <button class="mini-icon-btn danger" data-del-aphid="${idx}">🗑️</button>
            </div>
          `).join('')}
          ${hogs.map((h, idx) => `
            <div class="elem-card flex-between">
              <span>🦔 Hérisson à (X: ${Math.round(h.x)}, Y: ${Math.round(h.y)}) • Patrouille: [${Math.round(h.patrolMinX || h.x - 110)}, ${Math.round(h.patrolMaxX || h.x + 110)}]</span>
              <button class="mini-icon-btn danger" data-del-hog="${idx}">🗑️</button>
            </div>
          `).join('')}
        </div>
      `;
      body.querySelector('#btn-add-aphid')?.addEventListener('click', () => this.promptAddAphid());
      body.querySelector('#btn-add-hog')?.addEventListener('click', () => this.promptAddHedgehog());
      body.querySelectorAll('[data-del-aphid]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.aphids.splice(Number(btn.dataset.delAphid), 1);
          this.updateElementBadges();
          this.renderElementsBody('enemies');
          this.renderMapCanvas();
        });
      });
      body.querySelectorAll('[data-del-hog]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.hedgehogs.splice(Number(btn.dataset.delHog), 1);
          this.updateElementBadges();
          this.renderElementsBody('enemies');
          this.renderMapCanvas();
        });
      });
    } else if (category === 'hazards') {
      const thorns = this.mapEditorData.thorns || [];
      const crumbs = this.mapEditorData.stickyCrumbs || [];
      body.innerHTML = `
        <div class="elem-actions-header">
          <strong>Ronces / Graines (${thorns.length}) & Mares Collantes (${crumbs.length})</strong>
          <div class="flex-gap">
            <button id="btn-add-thorn" class="admin-btn mini-btn orange-btn">➕ Ronces</button>
            <button id="btn-add-crumb" class="admin-btn mini-btn green-btn">➕ Glu / Miel</button>
          </div>
        </div>
        <div class="elem-cards-list">
          ${thorns.map((t, idx) => `
            <div class="elem-card flex-between">
              <span>🌵 Ronces / Graines à (X: ${Math.round(t.x)}, Y: ${Math.round(t.y)}) • Rayon: ${t.radius || 28}px</span>
              <button class="mini-icon-btn danger" data-del-thorn="${idx}">🗑️</button>
            </div>
          `).join('')}
          ${crumbs.map((c, idx) => `
            <div class="elem-card flex-between">
              <span>🍯 Mare de ${c.kind === 'honey' ? 'Miel' : 'Confiture'} à (X: ${Math.round(c.x)}, Y: ${Math.round(c.y)})</span>
              <button class="mini-icon-btn danger" data-del-crumb="${idx}">🗑️</button>
            </div>
          `).join('')}
        </div>
      `;
      body.querySelector('#btn-add-thorn')?.addEventListener('click', () => this.promptAddThorn());
      body.querySelector('#btn-add-crumb')?.addEventListener('click', () => this.promptAddStickyCrumb());
      body.querySelectorAll('[data-del-thorn]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.thorns.splice(Number(btn.dataset.delThorn), 1);
          this.updateElementBadges();
          this.renderElementsBody('hazards');
          this.renderMapCanvas();
        });
      });
      body.querySelectorAll('[data-del-crumb]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.stickyCrumbs.splice(Number(btn.dataset.delCrumb), 1);
          this.updateElementBadges();
          this.renderElementsBody('hazards');
          this.renderMapCanvas();
        });
      });
    } else if (category === 'extras') {
      const shrooms = this.mapEditorData.mushrooms || [];
      const pups = this.mapEditorData.powerUps || [];
      const dyns = this.mapEditorData.dynamicPlatforms || [];
      body.innerHTML = `
        <div class="elem-actions-header">
          <strong>Tremplins (${shrooms.length}), Power-ups (${pups.length}) & Plateformes Mobiles (${dyns.length})</strong>
          <div class="flex-gap">
            <button id="btn-add-shroom" class="admin-btn mini-btn green-btn">➕ Champignon</button>
            <button id="btn-add-pup" class="admin-btn mini-btn orange-btn">➕ Power-up</button>
          </div>
        </div>
        <div class="elem-cards-list">
          ${shrooms.map((s, idx) => `
            <div class="elem-card flex-between">
              <span>🍄 Champignon Tremplin à (X: ${Math.round(s.x)}, Y: ${Math.round(s.y)}) • Rebond: ${s.bounceSpeed || 380}</span>
              <button class="mini-icon-btn danger" data-del-shroom="${idx}">🗑️</button>
            </div>
          `).join('')}
          ${pups.map((p, idx) => `
            <div class="elem-card flex-between">
              <span>⚡ Power-up [${p.type || 'speed'}] à (X: ${Math.round(p.x)}, Y: ${Math.round(p.y)})</span>
              <button class="mini-icon-btn danger" data-del-pup="${idx}">🗑️</button>
            </div>
          `).join('')}
          ${dyns.map((d, idx) => `
            <div class="elem-card flex-between">
              <span>🍃 Plateforme dynamique [${d.type || 'leaf'}] à (X: ${Math.round(d.pivotX || 0)}, Y: ${Math.round(d.pivotY || 0)})</span>
              <button class="mini-icon-btn danger" data-del-dyn="${idx}">🗑️</button>
            </div>
          `).join('')}
        </div>
      `;
      body.querySelector('#btn-add-shroom')?.addEventListener('click', () => this.promptAddMushroom());
      body.querySelector('#btn-add-pup')?.addEventListener('click', () => this.promptAddPowerUp());
      body.querySelectorAll('[data-del-shroom]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.mushrooms.splice(Number(btn.dataset.delShroom), 1);
          this.updateElementBadges();
          this.renderElementsBody('extras');
          this.renderMapCanvas();
        });
      });
      body.querySelectorAll('[data-del-pup]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.powerUps.splice(Number(btn.dataset.delPup), 1);
          this.updateElementBadges();
          this.renderElementsBody('extras');
          this.renderMapCanvas();
        });
      });
      body.querySelectorAll('[data-del-dyn]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.mapEditorData.dynamicPlatforms.splice(Number(btn.dataset.delDyn), 1);
          this.updateElementBadges();
          this.renderElementsBody('extras');
          this.renderMapCanvas();
        });
      });
    }
  }

  // Quick element creation prompts
  promptAddPolyline() {
    const mat = prompt('Matériau (dirt, root, moss, stem, leaf, silk, can, plastic, honeycomb, straw) :', 'root') || 'dirt';
    const ptsStr = prompt('Points format JSON [[x1,y1],[x2,y2],...] :', '[[1000, 480], [1300, 420], [1600, 480]]');
    if (!ptsStr) return;
    try {
      const pts = JSON.parse(ptsStr);
      if (Array.isArray(pts) && pts.length >= 2) {
        this.mapEditorData.polylines.push({ points: pts, material: mat, thickness: 24, isGroundMass: false });
        this.updateElementBadges();
        this.renderElementsBody('polylines');
        this.renderMapCanvas();
      }
    } catch (e) {
      alert('Format de points invalide.');
    }
  }

  promptAddProp() {
    const type = prompt('Type de prop (acorn ou pinecone) :', 'acorn') || 'acorn';
    const x = Number(prompt('Position X :', '1200')) || 1200;
    const y = Number(prompt('Position Y :', '480')) || 480;
    this.mapEditorData.props.push({ type, x, y, scale: 1.0 });
    this.updateElementBadges();
    this.renderElementsBody('props');
    this.renderMapCanvas();
  }

  promptAddAphid() {
    const x = Number(prompt('Position X :', '1400')) || 1400;
    const y = Number(prompt('Position Y :', '500')) || 500;
    this.mapEditorData.aphids.push({ x, y, radius: 22, patrolMinX: x - 100, patrolMaxX: x + 100 });
    this.updateElementBadges();
    this.renderElementsBody('enemies');
    this.renderMapCanvas();
  }

  promptAddHedgehog() {
    const x = Number(prompt('Position X :', '2000')) || 2000;
    const y = Number(prompt('Position Y :', '520')) || 520;
    this.mapEditorData.hedgehogs.push({ x, y, radius: 28, patrolMinX: x - 130, patrolMaxX: x + 130 });
    this.updateElementBadges();
    this.renderElementsBody('enemies');
    this.renderMapCanvas();
  }

  promptAddThorn() {
    const x = Number(prompt('Position X :', '1800')) || 1800;
    const y = Number(prompt('Position Y :', '550')) || 550;
    this.mapEditorData.thorns.push({ x, y, radius: 28 });
    this.updateElementBadges();
    this.renderElementsBody('hazards');
    this.renderMapCanvas();
  }

  promptAddStickyCrumb() {
    const kind = prompt('Type de glu (honey ou jam) :', 'honey') || 'honey';
    const x = Number(prompt('Position X :', '1900')) || 1900;
    const y = Number(prompt('Position Y :', '540')) || 540;
    this.mapEditorData.stickyCrumbs.push({ x, y, radius: 32, kind });
    this.updateElementBadges();
    this.renderElementsBody('hazards');
    this.renderMapCanvas();
  }

  promptAddMushroom() {
    const x = Number(prompt('Position X :', '2100')) || 2100;
    const y = Number(prompt('Position Y :', '580')) || 580;
    this.mapEditorData.mushrooms.push({ x, y, radius: 44, bounceSpeed: 420 });
    this.updateElementBadges();
    this.renderElementsBody('extras');
    this.renderMapCanvas();
  }

  promptAddPowerUp() {
    const type = prompt('Type de powerup (feather, speed, strength, shield) :', 'feather') || 'feather';
    const x = Number(prompt('Position X :', '1600')) || 1600;
    const y = Number(prompt('Position Y :', '320')) || 320;
    this.mapEditorData.powerUps.push({ x, y, type });
    this.updateElementBadges();
    this.renderElementsBody('extras');
    this.renderMapCanvas();
  }

  // Live Canvas Rendering of the entire Map
  renderMapCanvas() {
    const canvas = document.getElementById('map-preview-canvas');
    if (!canvas || !this.mapEditorData) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Sky Background gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#74b9ff');
    skyGrad.addColorStop(1, '#dfe6e9');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.scale(this.previewZoom, this.previewZoom);
    ctx.translate(-this.previewPanX, 0);

    // Grid lines (every 200px)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let x = -200; x <= 6500; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }

    const materialColors = {
      dirt: '#8B5A2B',
      root: '#5C4033',
      moss: '#2ecc71',
      stem: '#27ae60',
      leaf: '#2ecc71',
      silk: '#ffffff',
      can: '#bdc3c7',
      plastic: '#e74c3c',
      fork: '#7f8c8d',
      honeycomb: '#f39c12',
      straw: '#f1c40f'
    };

    // 1. Polylines
    for (const p of this.mapEditorData.polylines || []) {
      if (!p.points || p.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(p.points[0][0], p.points[0][1]);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i][0], p.points[i][1]);
      }
      ctx.strokeStyle = materialColors[p.material] || '#8B5A2B';
      ctx.lineWidth = (p.thickness || 24);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw point handles
      for (const pt of p.points) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 2. Start Flag
    const startX = Number(document.getElementById('admin-map-start-x')?.value) || 160;
    const startY = Number(document.getElementById('admin-map-start-y')?.value) || 500;
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(startX, startY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('🏁 DÉPART', startX - 35, startY - 22);

    // 3. Finish Line
    const finishX = Number(document.getElementById('admin-map-finish-x')?.value) || 4400;
    const finishY = Number(document.getElementById('admin-map-finish-y')?.value) || 460;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(finishX, finishY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('🏁 ARRIVÉE', finishX - 35, finishY - 24);

    // 4. Mushrooms
    for (const m of this.mapEditorData.mushrooms || []) {
      ctx.fillStyle = '#e84393';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius || 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '22px sans-serif';
      ctx.fillText('🍄', m.x - 11, m.y + 8);
    }

    // 5. Props (Acorns & Pinecones)
    for (const pr of this.mapEditorData.props || []) {
      ctx.fillStyle = pr.type === 'pinecone' ? '#b33939' : '#cd6133';
      const r = pr.type === 'pinecone' ? 50 : 25;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText(pr.type === 'pinecone' ? '🌲' : '🌰', pr.x - 10, pr.y + 7);
    }

    // 6. Enemies
    for (const a of this.mapEditorData.aphids || []) {
      ctx.fillStyle = '#26de81';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.fillText('🐛', a.x - 9, a.y + 6);
    }
    for (const h of this.mapEditorData.hedgehogs || []) {
      ctx.fillStyle = '#8854d0';
      ctx.beginPath();
      ctx.arc(h.x, h.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.fillText('🦔', h.x - 11, h.y + 7);
    }

    // 7. Thorns
    for (const t of this.mapEditorData.thorns || []) {
      ctx.fillStyle = '#eb3b5a';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius || 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.fillText('🌵', t.x - 9, t.y + 6);
    }

    // 8. Sticky crumbs (Honey / Jam)
    for (const sc of this.mapEditorData.stickyCrumbs || []) {
      ctx.fillStyle = sc.kind === 'honey' ? '#fa8231' : '#b71540';
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, sc.radius || 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.fillText('🍯', sc.x - 9, sc.y + 6);
    }

    // 9. Power-ups
    for (const pu of this.mapEditorData.powerUps || []) {
      ctx.fillStyle = '#f7b731';
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '20px sans-serif';
      ctx.fillText(pu.type === 'feather' ? '🪶' : '⚡', pu.x - 10, pu.y + 7);
    }

    ctx.restore();
  }

  createNewMap() {
    const newId = LEVEL_DEFINITIONS.length > 0 ? Math.max(...LEVEL_DEFINITIONS.map(m => m.id)) + 1 : 0;
    const newMap = {
      id: newId,
      cupId: 'coupe_bourgeons',
      difficulty: 'Facile',
      theme: 'forest',
      name: `Nouvelle Map ${newId}`,
      subtitle: 'Niveau inédit créé via l’Éditeur Admin !',
      skyTop: '#ffefc2',
      skyBottom: '#b8f59e',
      accentBg: '#2d5a27',
      startX: 160,
      startY: 500,
      finishX: 4400,
      finishY: 460,
      coachHint: '💡 <strong>Nouveau Niveau :</strong> Créez votre propre parcours !',
      declarativeData: {
        polylines: [
          { points: [[-200, 560], [400, 560], [1200, 520], [2400, 520], [3600, 480], [4600, 480]], material: 'dirt', thickness: 24, isGroundMass: true }
        ],
        mushrooms: [],
        props: [{ type: 'acorn', x: 800, y: 500, scale: 1.0 }],
        aphids: [{ x: 1400, y: 500, radius: 22, patrolMinX: 1300, patrolMaxX: 1500 }],
        hedgehogs: [],
        thorns: [],
        powerUps: [{ x: 2000, y: 380, type: 'feather' }],
        stickyCrumbs: [],
        dynamicPlatforms: [],
        checkpoints: [{ x: 2200, y: 500, label: 'Checkpoint 1' }],
        decorations: []
      },
      build(world) {
        buildFromDeclarative(world, this.declarativeData);
      }
    };

    LEVEL_DEFINITIONS.push(newMap);
    saveSavedMaps();
    this.refreshMapSelectOptions();
    this.loadMapIntoEditor(newId);
    sound.playGrip(true);
  }

  saveCurrentMap() {
    const map = LEVEL_DEFINITIONS.find(m => m.id === this.selectedMapId);
    if (!map) return;

    map.name = document.getElementById('admin-map-name').value;
    map.difficulty = document.getElementById('admin-map-diff').value;
    map.theme = document.getElementById('admin-map-theme').value;
    map.cupId = document.getElementById('admin-map-cup').value;
    map.startX = Number(document.getElementById('admin-map-start-x').value);
    map.startY = Number(document.getElementById('admin-map-start-y').value);
    map.finishX = Number(document.getElementById('admin-map-finish-x').value);
    map.finishY = Number(document.getElementById('admin-map-finish-y').value);
    map.subtitle = document.getElementById('admin-map-subtitle').value;
    map.coachHint = document.getElementById('admin-map-hint').value;

    map.declarativeData = JSON.parse(JSON.stringify(this.mapEditorData));
    map.build = function(world) {
      buildFromDeclarative(world, this.declarativeData);
    };

    saveSavedMaps();
    sound.playGrip(true);
    alert(`Map "${map.name}" enregistrée avec succès !`);
    this.refreshMapSelectOptions();
  }

  testCurrentMap() {
    this.saveCurrentMap();
    this.close(true);
    if (this.game) {
      const idx = LEVEL_DEFINITIONS.findIndex(m => m.id === this.selectedMapId);
      if (idx >= 0) {
        this.game.loadLevel(idx);
        this.game.ui.showScreen('game');
      }
    }
  }

  exportCurrentMapCode() {
    const map = LEVEL_DEFINITIONS.find(m => m.id === this.selectedMapId);
    if (!map) return;
    const data = this.mapEditorData;
    const code = `  {
    id: ${map.id},
    cupId: '${map.cupId || 'coupe_bourgeons'}',
    difficulty: '${map.difficulty || 'Facile'}',
    theme: '${map.theme || 'forest'}',
    name: '${map.name.replace(/'/g, "\\'")}',
    subtitle: '${(map.subtitle || '').replace(/'/g, "\\'")}',
    skyTop: '${map.skyTop || '#ffefc2'}',
    skyBottom: '${map.skyBottom || '#b8f59e'}',
    accentBg: '${map.accentBg || '#2d5a27'}',
    startX: ${map.startX},
    startY: ${map.startY},
    finishX: ${map.finishX},
    finishY: ${map.finishY},
    coachHint: '${(map.coachHint || '').replace(/'/g, "\\'")}',
    declarativeData: ${JSON.stringify(data, null, 2)},
    build(world) {
      buildFromDeclarative(world, this.declarativeData);
    }
  }`;
    this.openCodeModal(`Code JS de la Map : ${map.name}`, code);
  }

  // ==================== 3. CUP MANAGER TAB ====================
  initCupManagerTab() {
    this.renderCupsList();
    this.renderBackgroundPicker();

    document.getElementById('btn-admin-new-cup')?.addEventListener('click', () => {
      this.createNewCup();
    });

    document.getElementById('btn-admin-save-cup')?.addEventListener('click', () => {
      this.saveCurrentCup();
    });

    document.getElementById('btn-admin-export-cups')?.addEventListener('click', () => {
      const code = 'export const CUPS_DEFINITIONS = ' + JSON.stringify(CUPS_DEFINITIONS, null, 2) + ';';
      this.openCodeModal('Code JS des Coupes', code);
    });
  }

  renderCupsList() {
    const grid = document.getElementById('admin-cups-grid');
    if (!grid) return;
    grid.innerHTML = Object.values(CUPS_DEFINITIONS).map(cup => `
      <div class="admin-cup-item-card ${cup.id === this.selectedCupId ? 'active' : ''}" data-cup-id="${cup.id}">
        <div class="acic-header">
          <span class="acic-icon">${cup.icon || '🏆'}</span>
          <div>
            <strong>${cup.name}</strong>
            <small class="pill-diff diff-${cup.difficulty}">${cup.difficulty}</small>
          </div>
        </div>
        <div class="acic-bg-badge">
          🖼️ Background : <code>${cup.bgSet || 'game_background_2'}</code>
        </div>
        <div class="acic-maps-summary">
          3 Maps : [${(cup.levels || []).join(', ')}]
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.admin-cup-item-card').forEach(card => {
      card.addEventListener('click', () => {
        this.loadCupIntoEditor(card.dataset.cupId);
      });
    });
  }

  renderBackgroundPicker() {
    const picker = document.getElementById('cup-bg-picker');
    if (!picker) return;
    picker.innerHTML = AVAILABLE_BACKGROUNDS.map(bg => `
      <div class="bg-picker-card" data-bg-id="${bg.id}">
        <div class="bg-card-thumb thumb-${bg.id}">
          <span class="bg-thumb-icon">${bg.icon}</span>
        </div>
        <div class="bg-card-info">
          <strong>${bg.name}</strong>
          <small>${bg.desc}</small>
        </div>
        <div class="bg-check-mark">✔</div>
      </div>
    `).join('');

    picker.querySelectorAll('.bg-picker-card').forEach(card => {
      card.addEventListener('click', () => {
        picker.querySelectorAll('.bg-picker-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  loadCupIntoEditor(cupId) {
    this.selectedCupId = cupId;
    const cup = CUPS_DEFINITIONS[cupId];
    if (!cup) return;

    this.container.querySelectorAll('.admin-cup-item-card').forEach(c => {
      c.classList.toggle('active', c.dataset.cupId === cupId);
    });

    document.getElementById('cup-editor-heading').textContent = `Édition : ${cup.name}`;
    document.getElementById('admin-cup-name').value = cup.name || '';
    document.getElementById('admin-cup-diff').value = cup.difficulty || 'Facile';
    document.getElementById('admin-cup-icon').value = cup.icon || '🏆';
    document.getElementById('admin-cup-desc').value = cup.desc || '';

    // Set background card selection
    const bgPicker = document.getElementById('cup-bg-picker');
    if (bgPicker) {
      bgPicker.querySelectorAll('.bg-picker-card').forEach(c => {
        c.classList.toggle('active', c.dataset.bgId === (cup.bgSet || 'game_background_2'));
      });
    }

    // Set 3 maps dropdowns
    const mapSelects = [
      document.getElementById('admin-cup-map-0'),
      document.getElementById('admin-cup-map-1'),
      document.getElementById('admin-cup-map-2')
    ];

    const currentLevels = cup.levels || [0, 1, 2];
    mapSelects.forEach((sel, i) => {
      if (!sel) return;
      sel.innerHTML = LEVEL_DEFINITIONS.map(m => `
        <option value="${m.id}" ${m.id === currentLevels[i] ? 'selected' : ''}>
          Map ${m.id} : ${m.name} (${m.difficulty})
        </option>
      `).join('');
    });
  }

  createNewCup() {
    const id = 'coupe_custom_' + Date.now();
    const newCup = {
      id,
      name: 'Nouvelle Coupe Personnalisée',
      difficulty: 'Moyen',
      icon: '✨',
      desc: '3 courses épiques sur mesure !',
      bgSet: 'game_background_3',
      levels: [0, 1, 2],
      cards: [
        { levelId: 0, title: '1. PREMIÈRE COURSE', icon: '🏁', bg: 'linear-gradient(135deg, #2d5a27, #8cf5ab)' },
        { levelId: 1, title: '2. DEUXIÈME COURSE', icon: '⚡', bg: 'linear-gradient(135deg, #0984e3, #81ecec)' },
        { levelId: 2, title: '3. FINALE', icon: '👑', bg: 'linear-gradient(135deg, #c0392b, #2c3e50)' }
      ]
    };

    CUPS_DEFINITIONS[id] = newCup;
    saveSavedCups();
    this.renderCupsList();
    this.loadCupIntoEditor(id);
    sound.playGrip(true);
  }

  saveCurrentCup() {
    const cup = CUPS_DEFINITIONS[this.selectedCupId];
    if (!cup) return;

    cup.name = document.getElementById('admin-cup-name').value;
    cup.difficulty = document.getElementById('admin-cup-diff').value;
    cup.icon = document.getElementById('admin-cup-icon').value;
    cup.desc = document.getElementById('admin-cup-desc').value;

    const activeBgCard = document.querySelector('#cup-bg-picker .bg-picker-card.active');
    cup.bgSet = activeBgCard ? activeBgCard.dataset.bgId : (cup.bgSet || 'game_background_2');

    const m0 = Number(document.getElementById('admin-cup-map-0').value);
    const m1 = Number(document.getElementById('admin-cup-map-1').value);
    const m2 = Number(document.getElementById('admin-cup-map-2').value);
    cup.levels = [m0, m1, m2];

    // Synchronize cupId on the 3 maps so they inherit this cup's single background
    cup.levels.forEach(lvlId => {
      const lvl = LEVEL_DEFINITIONS.find(m => m.id === lvlId);
      if (lvl) lvl.cupId = cup.id;
    });

    saveSavedCups();
    saveSavedMaps();
    sound.playGrip(true);
    alert(`Coupe "${cup.name}" enregistrée avec succès ! Le background "${cup.bgSet}" est appliqué aux 3 maps.`);
    this.renderCupsList();
  }

  openCodeModal(title, code) {
    const modal = document.getElementById('admin-code-modal');
    const titleEl = document.getElementById('admin-code-title');
    const ta = document.getElementById('admin-code-textarea');
    if (!modal || !ta) return;
    if (titleEl) titleEl.textContent = title;
    ta.value = code;
    modal.classList.remove('hidden');
  }

  // ==================== 🛠️ FULLSCREEN MAP STUDIO IMPLEMENTATION ====================

  openFullscreenStudio(mapId) {
    this.selectedMapId = (mapId !== undefined) ? mapId : this.selectedMapId;
    const map = LEVEL_DEFINITIONS.find(m => m.id === this.selectedMapId) || LEVEL_DEFINITIONS[0];
    if (!map) return;

    this.currentStudioMap = map;
    this.mapEditorData = map.declarativeData ? JSON.parse(JSON.stringify(map.declarativeData)) : extractDeclarativeMap(map);

    // Setup Topbar Badges
    const badgeEl = document.getElementById('studio-map-badge');
    const titleEl = document.getElementById('studio-map-title');
    const cupEl = document.getElementById('studio-cup-tag');
    if (badgeEl) badgeEl.textContent = `MAP ${map.id}`;
    if (titleEl) titleEl.textContent = map.name || `Map ${map.id}`;
    if (cupEl) {
      const cupDef = CUPS_DEFINITIONS[map.cupId];
      cupEl.textContent = `🏆 ${cupDef ? cupDef.name : 'Course'}`;
    }

    // Camera initial position centering on start point
    this.studioPanX = Math.max(-100, (map.startX || 160) - 180);
    this.studioPanY = -40;
    this.studioZoom = 0.55;
    this.studioSelection = null;

    this.studioContainer = document.getElementById('fullscreen-map-studio');
    this.studioCanvas = document.getElementById('studio-main-canvas');
    if (this.studioCanvas) this.studioCtx = this.studioCanvas.getContext('2d');
    this.studioMinimapCanvas = document.getElementById('studio-minimap-canvas');
    if (this.studioMinimapCanvas) this.studioMinimapCtx = this.studioMinimapCanvas.getContext('2d');

    this.studioContainer?.classList.remove('hidden');

    this.resizeStudioCanvas();
    this.renderStudioToolbox();
    this.renderStudioCanvas();
    this.renderStudioMinimap();
    this.renderStudioInspector();

    sound.playGrip(true);
  }

  closeFullscreenStudio() {
    this.studioContainer?.classList.add('hidden');
    // Sync values back to admin panel
    this.updateElementBadges();
    this.renderMapCanvas();
  }

  resizeStudioCanvas() {
    const cont = document.getElementById('studio-canvas-container');
    if (!cont || !this.studioCanvas) return;
    const rect = cont.getBoundingClientRect();
    this.studioCanvas.width = Math.max(300, Math.floor(rect.width));
    this.studioCanvas.height = Math.max(200, Math.floor(rect.height - 48));

    if (this.studioMinimapCanvas) {
      this.studioMinimapCanvas.width = Math.max(200, Math.floor(rect.width - 32));
      this.studioMinimapCanvas.height = 32;
    }
  }

  renderStudioToolbox() {
    const list = document.getElementById('toolbox-items-list');
    if (!list) return;

    const currentTab = this.studioActiveToolboxTab || 'all';
    const items = currentTab === 'all'
      ? TOOLBOX_CATALOG
      : TOOLBOX_CATALOG.filter(it => it.category === currentTab);

    list.innerHTML = items.map(it => `
      <div class="tb-item-card" draggable="true" data-id="${it.id}">
        <div class="tb-item-icon">${it.icon}</div>
        <div class="tb-item-info">
          <strong>${it.label}</strong>
          <small>${it.desc}</small>
        </div>
      </div>
    `).join('');

    // Wire HTML5 Drag & Drop on cards
    list.querySelectorAll('.tb-item-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const item = TOOLBOX_CATALOG.find(x => x.id === card.dataset.id);
        if (!item) return;
        e.dataTransfer.setData('application/json', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
  }

  initStudioEvents() {
    // 1. Toolbox Tabs
    document.getElementById('studio-toolbox-tabs')?.querySelectorAll('.tb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#studio-toolbox-tabs .tb-tab').forEach(t => t.classList.toggle('active', t === tab));
        this.studioActiveToolboxTab = tab.dataset.tb;
        this.renderStudioToolbox();
      });
    });

    // 2. Topbar Actions
    document.getElementById('btn-studio-close')?.addEventListener('click', () => this.closeFullscreenStudio());
    document.getElementById('btn-studio-save')?.addEventListener('click', () => this.saveStudioMap());
    document.getElementById('btn-studio-test')?.addEventListener('click', () => this.testStudioMap());
    document.getElementById('btn-studio-delete')?.addEventListener('click', () => this.deleteStudioSelected());

    // Zoom controls
    document.getElementById('studio-zoom-in')?.addEventListener('click', () => {
      this.studioZoom = Math.min(2.0, this.studioZoom + 0.10);
      this.updateStudioZoomUI();
      this.renderStudioCanvas();
      this.renderStudioMinimap();
    });
    document.getElementById('studio-zoom-out')?.addEventListener('click', () => {
      this.studioZoom = Math.max(0.12, this.studioZoom - 0.10);
      this.updateStudioZoomUI();
      this.renderStudioCanvas();
      this.renderStudioMinimap();
    });
    document.getElementById('studio-zoom-fit')?.addEventListener('click', () => {
      this.studioZoom = 0.24;
      this.studioPanX = -100;
      this.studioPanY = -50;
      this.updateStudioZoomUI();
      this.renderStudioCanvas();
      this.renderStudioMinimap();
    });

    const snapBox = document.getElementById('studio-grid-snap');
    snapBox?.addEventListener('change', () => {
      this.studioSnapGrid = !!snapBox.checked;
    });

    // 3. HTML5 Drag & Drop onto Studio Canvas
    const canvas = document.getElementById('studio-main-canvas');
    if (!canvas) return;

    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        const item = JSON.parse(raw);
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        let wx = this.studioPanX + (cx / this.studioZoom);
        let wy = this.studioPanY + (cy / this.studioZoom);
        if (this.studioSnapGrid) {
          wx = Math.round(wx / 20) * 20;
          wy = Math.round(wy / 20) * 20;
        }
        this.addDroppedItem(item, wx, wy);
      } catch (err) {
        console.error('Erreur drop item studio:', err);
      }
    });

    // 4. Canvas Mouse Interactions (Select, Move, Rotate, Pan, Wheel Zoom)
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const wx = this.studioPanX + (cx / this.studioZoom);
      const wy = this.studioPanY + (cy / this.studioZoom);

      // Panning check: Right click (2), Middle click (1), or Space held
      if (e.button === 2 || e.button === 1 || this.isSpacePanning) {
        this.isPanningStudio = true;
        this.dragStartMouse = { x: e.clientX, y: e.clientY };
        this.dragStartPan = { x: this.studioPanX, y: this.studioPanY };
        return;
      }

      if (e.button === 0) {
        // A. Check if clicking on the Rotation Gizmo handle of current selection
        if (this.checkGizmoHandleHit(wx, wy)) {
          this.isRotatingItem = true;
          this.dragStartMouse = { x: wx, y: wy };
          return;
        }

        // B. Hit test entities on canvas
        const hit = this.studioHitTest(wx, wy);
        if (hit) {
          this.studioSelection = hit;
          this.isDraggingItem = true;
          this.dragStartMouse = { x: wx, y: wy };
          this.recordDragItemInitial(hit);
          this.renderStudioCanvas();
          this.renderStudioInspector();
          sound.playGrip(true);
        } else {
          // Deselect
          this.studioSelection = null;
          this.renderStudioCanvas();
          this.renderStudioInspector();
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.studioContainer || this.studioContainer.classList.contains('hidden')) return;

      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const wx = this.studioPanX + (cx / this.studioZoom);
      const wy = this.studioPanY + (cy / this.studioZoom);

      // Update Coordinate badge
      const coordBadge = document.getElementById('studio-coord-badge');
      if (coordBadge) {
        coordBadge.textContent = `📍 X: ${Math.round(wx)} | Y: ${Math.round(wy)}`;
      }

      // Handle Pan
      if (this.isPanningStudio) {
        const dx = (e.clientX - this.dragStartMouse.x) / this.studioZoom;
        const dy = (e.clientY - this.dragStartMouse.y) / this.studioZoom;
        this.studioPanX = this.dragStartPan.x - dx;
        this.studioPanY = this.dragStartPan.y - dy;
        this.renderStudioCanvas();
        this.renderStudioMinimap();
        return;
      }

      // Handle Rotation
      if (this.isRotatingItem && this.studioSelection) {
        const center = this.getSelectedItemCenter();
        if (center) {
          let angle = Math.atan2(wy - center.y, wx - center.x);
          if (e.shiftKey) {
            const step = Math.PI / 12; // Snap to 15°
            angle = Math.round(angle / step) * step;
          }
          this.setSelectedItemAngle(angle);
          this.renderStudioCanvas();
          this.updateInspectorAngleField(angle);
        }
        return;
      }

      // Handle Drag / Move
      if (this.isDraggingItem && this.studioSelection && this.dragItemInitial) {
        let deltaX = wx - this.dragStartMouse.x;
        let deltaY = wy - this.dragStartMouse.y;
        this.applyItemDragDelta(deltaX, deltaY);
        this.renderStudioCanvas();
        this.renderStudioMinimap();
        this.renderStudioInspector();
        return;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingItem = false;
      this.isRotatingItem = false;
      this.isPanningStudio = false;
      this.isDraggingMinimap = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const oldZoom = this.studioZoom;
      const newZoom = Math.max(0.12, Math.min(2.0, oldZoom * zoomFactor));

      const worldX = this.studioPanX + (cx / oldZoom);
      const worldY = this.studioPanY + (cy / oldZoom);

      this.studioZoom = newZoom;
      this.studioPanX = worldX - (cx / newZoom);
      this.studioPanY = worldY - (cy / newZoom);

      this.updateStudioZoomUI();
      this.renderStudioCanvas();
      this.renderStudioMinimap();
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // 5. Minimap Track Click & Drag
    const minimapTrack = document.getElementById('studio-minimap-track');
    if (minimapTrack) {
      const handleMinimapNav = (e) => {
        const rect = minimapTrack.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const mapTotalW = 6000;
        this.studioPanX = -200 + pct * mapTotalW - (canvas.width * 0.5 / this.studioZoom);
        this.renderStudioCanvas();
        this.renderStudioMinimap();
      };

      minimapTrack.addEventListener('mousedown', (e) => {
        this.isDraggingMinimap = true;
        handleMinimapNav(e);
      });
      window.addEventListener('mousemove', (e) => {
        if (this.isDraggingMinimap) handleMinimapNav(e);
      });
    }

    // 6. Global Keybindings in Studio
    window.addEventListener('keydown', (e) => {
      if (!this.studioContainer || this.studioContainer.classList.contains('hidden')) return;

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.deleteStudioSelected();
      } else if (e.key === 'Escape') {
        if (this.studioSelection) {
          this.studioSelection = null;
          this.renderStudioCanvas();
          this.renderStudioInspector();
        } else {
          this.closeFullscreenStudio();
        }
      } else if (e.code === 'Space') {
        this.isSpacePanning = true;
        canvas.style.cursor = 'grab';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpacePanning = false;
        if (canvas) canvas.style.cursor = 'default';
      }
    });

    window.addEventListener('resize', () => {
      if (!this.studioContainer || this.studioContainer.classList.contains('hidden')) return;
      this.resizeStudioCanvas();
      this.renderStudioCanvas();
      this.renderStudioMinimap();
    });
  }

  updateStudioZoomUI() {
    const el = document.getElementById('studio-zoom-val');
    if (el) el.textContent = `${Math.round(this.studioZoom * 100)}%`;
  }

  // ==================== CREATION & PLACEMENT (DRAG & DROP) ====================
  addDroppedItem(it, wx, wy) {
    if (!this.mapEditorData) return;

    if (it.category === 'terrains') {
      const poly = {
        points: [[Math.round(wx - 140), Math.round(wy)], [Math.round(wx + 140), Math.round(wy)]],
        material: it.subType,
        thickness: 24,
        isGroundMass: false
      };
      this.mapEditorData.polylines.push(poly);
      this.studioSelection = { category: 'polylines', index: this.mapEditorData.polylines.length - 1, vertexIndex: null };
    } else if (it.category === 'platforms') {
      const type = (it.subType === 'fork') ? 'fork' : ((it.subType === 'leaf') ? 'leaf' : ((it.subType.startsWith('moving')) ? 'moving' : 'pendulum'));
      const dp = {
        type: type,
        material: it.subType === 'fork' ? 'fork' : (it.subType === 'leaf' ? 'leaf' : 'stem'),
        pivotX: wx,
        pivotY: wy,
        baseAngle: 0,
        angle: 0,
        moveX: it.subType === 'moving_h' ? 240 : 0,
        moveY: it.subType === 'moving_v' ? -180 : 0,
        moveSpeed: 1.2,
        stiffness: it.subType === 'fork' ? 8 : 16,
        damping: 2.8,
        localPoints: [[-90, 0], [90, 0]],
        thickness: 20
      };
      this.mapEditorData.dynamicPlatforms.push(dp);
      this.studioSelection = { category: 'dynamicPlatforms', index: this.mapEditorData.dynamicPlatforms.length - 1, vertexIndex: null };
    } else if (it.category === 'enemies') {
      if (it.subType === 'aphid') {
        this.mapEditorData.aphids.push({ x: wx, y: wy, radius: 22, patrolMinX: wx - 120, patrolMaxX: wx + 120 });
        this.studioSelection = { category: 'aphids', index: this.mapEditorData.aphids.length - 1 };
      } else {
        this.mapEditorData.hedgehogs.push({ x: wx, y: wy, radius: 28, patrolMinX: wx - 140, patrolMaxX: wx + 140 });
        this.studioSelection = { category: 'hedgehogs', index: this.mapEditorData.hedgehogs.length - 1 };
      }
    } else if (it.category === 'powers') {
      this.mapEditorData.powerUps.push({ x: wx, y: wy, type: it.subType });
      this.studioSelection = { category: 'powerUps', index: this.mapEditorData.powerUps.length - 1 };
    } else if (it.category === 'props') {
      if (it.subType === 'acorn' || it.subType === 'pinecone') {
        this.mapEditorData.props.push({ type: it.subType, x: wx, y: wy, scale: 1.0, angle: 0 });
        this.studioSelection = { category: 'props', index: this.mapEditorData.props.length - 1 };
      } else if (it.subType === 'thorn') {
        this.mapEditorData.thorns.push({ x: wx, y: wy, radius: 26 });
        this.studioSelection = { category: 'thorns', index: this.mapEditorData.thorns.length - 1 };
      } else if (it.subType === 'honey' || it.subType === 'jam') {
        this.mapEditorData.stickyCrumbs.push({ x: wx, y: wy, radius: 32, kind: it.subType });
        this.studioSelection = { category: 'stickyCrumbs', index: this.mapEditorData.stickyCrumbs.length - 1 };
      }
    } else if (it.category === 'interact') {
      if (it.subType === 'mushroom') {
        this.mapEditorData.mushrooms.push({ x: wx, y: wy, radius: 42, bounceSpeed: 420, angle: 0 });
        this.studioSelection = { category: 'mushrooms', index: this.mapEditorData.mushrooms.length - 1 };
      } else if (it.subType === 'checkpoint') {
        this.mapEditorData.checkpoints.push({ x: wx, y: wy, label: `Checkpoint ${this.mapEditorData.checkpoints.length + 1}` });
        this.studioSelection = { category: 'checkpoints', index: this.mapEditorData.checkpoints.length - 1 };
      } else if (it.subType === 'start') {
        if (this.currentStudioMap) { this.currentStudioMap.startX = wx; this.currentStudioMap.startY = wy; }
        document.getElementById('admin-map-start-x').value = Math.round(wx);
        document.getElementById('admin-map-start-y').value = Math.round(wy);
        this.studioSelection = { category: 'start', index: 0 };
      } else if (it.subType === 'finish') {
        if (this.currentStudioMap) { this.currentStudioMap.finishX = wx; this.currentStudioMap.finishY = wy; }
        document.getElementById('admin-map-finish-x').value = Math.round(wx);
        document.getElementById('admin-map-finish-y').value = Math.round(wy);
        this.studioSelection = { category: 'finish', index: 0 };
      } else if (it.subType === 'flower' || it.subType === 'fern') {
        this.mapEditorData.decorations.push({ type: it.subType, x: wx, y: wy, scale: 1.2, angle: 0 });
        this.studioSelection = { category: 'decorations', index: this.mapEditorData.decorations.length - 1 };
      }
    }

    sound.playGrip(true);
    this.renderStudioCanvas();
    this.renderStudioMinimap();
    this.renderStudioInspector();
  }

  // ==================== HIT TESTING & GIZMO SELECTION ====================
  checkGizmoHandleHit(wx, wy) {
    if (!this.studioSelection) return false;
    const center = this.getSelectedItemCenter();
    if (!center) return false;
    const angle = this.getSelectedItemAngle();
    if (angle === null) return false;

    const handleDist = Math.max(50, (center.radius || 35) + 25);
    const hx = center.x + Math.cos(angle) * handleDist;
    const hy = center.y + Math.sin(angle) * handleDist;

    const hitDist = Math.hypot(wx - hx, wy - hy);
    return hitDist < (18 / this.studioZoom);
  }

  studioHitTest(wx, wy) {
    const d = this.mapEditorData;
    if (!d) return null;
    const zoom = this.studioZoom;

    // 1. Start & Finish
    const map = this.currentStudioMap;
    if (map) {
      if (Math.hypot(wx - (map.startX || 160), wy - (map.startY || 500)) < 30) {
        return { category: 'start', index: 0 };
      }
      if (Math.hypot(wx - (map.finishX || 4400), wy - (map.finishY || 460)) < 30) {
        return { category: 'finish', index: 0 };
      }
    }

    // 2. Checkpoints
    for (let i = (d.checkpoints?.length || 0) - 1; i >= 0; i--) {
      const cp = d.checkpoints[i];
      if (Math.hypot(wx - cp.x, wy - cp.y) < 26) return { category: 'checkpoints', index: i };
    }

    // 3. Dynamic Platforms
    for (let i = (d.dynamicPlatforms?.length || 0) - 1; i >= 0; i--) {
      const dp = d.dynamicPlatforms[i];
      if (Math.hypot(wx - (dp.pivotX || 0), wy - (dp.pivotY || 0)) < 26) return { category: 'dynamicPlatforms', index: i };
    }

    // 4. Mushrooms
    for (let i = (d.mushrooms?.length || 0) - 1; i >= 0; i--) {
      const m = d.mushrooms[i];
      if (Math.hypot(wx - m.x, wy - m.y) < (m.radius || 40)) return { category: 'mushrooms', index: i };
    }

    // 5. Enemies (Aphids & Hedgehogs)
    for (let i = (d.aphids?.length || 0) - 1; i >= 0; i--) {
      const a = d.aphids[i];
      if (Math.hypot(wx - a.x, wy - a.y) < (a.radius || 22)) return { category: 'aphids', index: i };
    }
    for (let i = (d.hedgehogs?.length || 0) - 1; i >= 0; i--) {
      const h = d.hedgehogs[i];
      if (Math.hypot(wx - h.x, wy - h.y) < (h.radius || 28)) return { category: 'hedgehogs', index: i };
    }

    // 6. Power-ups
    for (let i = (d.powerUps?.length || 0) - 1; i >= 0; i--) {
      const pu = d.powerUps[i];
      if (Math.hypot(wx - pu.x, wy - pu.y) < 24) return { category: 'powerUps', index: i };
    }

    // 7. Props
    for (let i = (d.props?.length || 0) - 1; i >= 0; i--) {
      const pr = d.props[i];
      const r = pr.type === 'pinecone' ? 45 : 25;
      if (Math.hypot(wx - pr.x, wy - pr.y) < r * (pr.scale || 1)) return { category: 'props', index: i };
    }

    // 8. Hazards (Thorns & Sticky crumbs)
    for (let i = (d.thorns?.length || 0) - 1; i >= 0; i--) {
      const t = d.thorns[i];
      if (Math.hypot(wx - t.x, wy - t.y) < (t.radius || 26)) return { category: 'thorns', index: i };
    }
    for (let i = (d.stickyCrumbs?.length || 0) - 1; i >= 0; i--) {
      const sc = d.stickyCrumbs[i];
      if (Math.hypot(wx - sc.x, wy - sc.y) < (sc.radius || 30)) return { category: 'stickyCrumbs', index: i };
    }

    // 9. Decorations
    for (let i = (d.decorations?.length || 0) - 1; i >= 0; i--) {
      const dc = d.decorations[i];
      if (Math.hypot(wx - dc.x, wy - dc.y) < 32 * (dc.scale || 1)) return { category: 'decorations', index: i };
    }

    // 10. Polylines: Check Vertices first
    for (let pIdx = (d.polylines?.length || 0) - 1; pIdx >= 0; pIdx--) {
      const p = d.polylines[pIdx];
      if (!p.points) continue;
      for (let ptIdx = 0; ptIdx < p.points.length; ptIdx++) {
        const pt = p.points[ptIdx];
        if (Math.hypot(wx - pt[0], wy - pt[1]) < (14 / zoom)) {
          return { category: 'polylines', index: pIdx, vertexIndex: ptIdx };
        }
      }
    }

    // 11. Polylines: Check Line Segments
    for (let pIdx = (d.polylines?.length || 0) - 1; pIdx >= 0; pIdx--) {
      const p = d.polylines[pIdx];
      if (!p.points || p.points.length < 2) continue;
      for (let i = 0; i < p.points.length - 1; i++) {
        const dist = this.distToSegment({ x: wx, y: wy }, { x: p.points[i][0], y: p.points[i][1] }, { x: p.points[i + 1][0], y: p.points[i + 1][1] });
        if (dist < ((p.thickness || 24) * 0.5 + 8 / zoom)) {
          return { category: 'polylines', index: pIdx, vertexIndex: null };
        }
      }
    }

    return null;
  }

  distToSegment(p, v, w) {
    const l2 = Math.hypot(v.x - w.x, v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  recordDragItemInitial(sel) {
    const d = this.mapEditorData;
    if (!sel || !d) return;

    if (sel.category === 'polylines') {
      const p = d.polylines[sel.index];
      if (sel.vertexIndex !== null && sel.vertexIndex !== undefined) {
        this.dragItemInitial = { ptX: p.points[sel.vertexIndex][0], ptY: p.points[sel.vertexIndex][1] };
      } else {
        this.dragItemInitial = { points: p.points.map(pt => [pt[0], pt[1]]) };
      }
    } else if (sel.category === 'start') {
      const map = this.currentStudioMap;
      this.dragItemInitial = { x: map.startX || 160, y: map.startY || 500 };
    } else if (sel.category === 'finish') {
      const map = this.currentStudioMap;
      this.dragItemInitial = { x: map.finishX || 4400, y: map.finishY || 460 };
    } else if (sel.category === 'dynamicPlatforms') {
      const dp = d.dynamicPlatforms[sel.index];
      this.dragItemInitial = { x: dp.pivotX, y: dp.pivotY };
    } else {
      const arr = d[sel.category];
      if (arr && arr[sel.index]) {
        const item = arr[sel.index];
        this.dragItemInitial = {
          x: item.x,
          y: item.y,
          patrolMinX: item.patrolMinX,
          patrolMaxX: item.patrolMaxX
        };
      }
    }
  }

  applyItemDragDelta(deltaX, deltaY) {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    const init = this.dragItemInitial;
    if (!sel || !d || !init) return;

    const snap = this.studioSnapGrid ? 20 : 1;

    if (sel.category === 'polylines') {
      const p = d.polylines[sel.index];
      if (sel.vertexIndex !== null && sel.vertexIndex !== undefined) {
        p.points[sel.vertexIndex][0] = Math.round((init.ptX + deltaX) / snap) * snap;
        p.points[sel.vertexIndex][1] = Math.round((init.ptY + deltaY) / snap) * snap;
      } else if (init.points) {
        const sDx = Math.round(deltaX / snap) * snap;
        const sDy = Math.round(deltaY / snap) * snap;
        for (let i = 0; i < p.points.length; i++) {
          p.points[i][0] = init.points[i][0] + sDx;
          p.points[i][1] = init.points[i][1] + sDy;
        }
      }
    } else if (sel.category === 'start') {
      const map = this.currentStudioMap;
      map.startX = Math.round((init.x + deltaX) / snap) * snap;
      map.startY = Math.round((init.y + deltaY) / snap) * snap;
      document.getElementById('admin-map-start-x').value = map.startX;
      document.getElementById('admin-map-start-y').value = map.startY;
    } else if (sel.category === 'finish') {
      const map = this.currentStudioMap;
      map.finishX = Math.round((init.x + deltaX) / snap) * snap;
      map.finishY = Math.round((init.y + deltaY) / snap) * snap;
      document.getElementById('admin-map-finish-x').value = map.finishX;
      document.getElementById('admin-map-finish-y').value = map.finishY;
    } else if (sel.category === 'dynamicPlatforms') {
      const dp = d.dynamicPlatforms[sel.index];
      dp.pivotX = Math.round((init.x + deltaX) / snap) * snap;
      dp.pivotY = Math.round((init.y + deltaY) / snap) * snap;
    } else {
      const item = d[sel.category]?.[sel.index];
      if (!item) return;
      const sDx = Math.round(deltaX / snap) * snap;
      const sDy = Math.round(deltaY / snap) * snap;
      item.x = init.x + sDx;
      item.y = init.y + sDy;
      if (init.patrolMinX !== undefined && init.patrolMaxX !== undefined) {
        item.patrolMinX = init.patrolMinX + sDx;
        item.patrolMaxX = init.patrolMaxX + sDx;
      }
    }
  }

  getSelectedItemCenter() {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    if (!sel || !d) return null;

    if (sel.category === 'start') return { x: this.currentStudioMap.startX || 160, y: this.currentStudioMap.startY || 500, radius: 25 };
    if (sel.category === 'finish') return { x: this.currentStudioMap.finishX || 4400, y: this.currentStudioMap.finishY || 460, radius: 25 };
    if (sel.category === 'dynamicPlatforms') {
      const dp = d.dynamicPlatforms[sel.index];
      return dp ? { x: dp.pivotX, y: dp.pivotY, radius: 35 } : null;
    }
    if (sel.category === 'polylines') {
      const p = d.polylines[sel.index];
      if (sel.vertexIndex !== null && sel.vertexIndex !== undefined && p?.points[sel.vertexIndex]) {
        return { x: p.points[sel.vertexIndex][0], y: p.points[sel.vertexIndex][1], radius: 15 };
      }
      return null;
    }
    const item = d[sel.category]?.[sel.index];
    return item ? { x: item.x, y: item.y, radius: item.radius || 30 } : null;
  }

  getSelectedItemAngle() {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    if (!sel || !d) return null;

    if (sel.category === 'mushrooms') return d.mushrooms[sel.index]?.angle || 0;
    if (sel.category === 'dynamicPlatforms') return d.dynamicPlatforms[sel.index]?.baseAngle || d.dynamicPlatforms[sel.index]?.angle || 0;
    if (sel.category === 'decorations') return d.decorations[sel.index]?.angle || 0;
    if (sel.category === 'props') return d.props[sel.index]?.angle || 0;
    return null;
  }

  setSelectedItemAngle(angle) {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    if (!sel || !d) return;

    if (sel.category === 'mushrooms') {
      d.mushrooms[sel.index].angle = angle;
    } else if (sel.category === 'dynamicPlatforms') {
      const dp = d.dynamicPlatforms[sel.index];
      dp.baseAngle = angle;
      dp.angle = angle;
    } else if (sel.category === 'decorations') {
      d.decorations[sel.index].angle = angle;
    } else if (sel.category === 'props') {
      d.props[sel.index].angle = angle;
    }
  }

  // ==================== RENDERING FULLSCREEN STUDIO CANVAS ====================
  renderStudioCanvas() {
    const canvas = this.studioCanvas;
    const ctx = this.studioCtx;
    const d = this.mapEditorData;
    if (!canvas || !ctx || !d) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Sky Gradient matching cup / theme
    const theme = this.currentStudioMap?.theme || 'forest';
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (theme === 'garden') {
      skyGrad.addColorStop(0, '#c7ecee'); skyGrad.addColorStop(1, '#dff9fb');
    } else if (theme === 'canopy') {
      skyGrad.addColorStop(0, '#81ecec'); skyGrad.addColorStop(1, '#55efc4');
    } else if (theme === 'marsh') {
      skyGrad.addColorStop(0, '#747d8c'); skyGrad.addColorStop(1, '#a4b0be');
    } else {
      skyGrad.addColorStop(0, '#686de0'); skyGrad.addColorStop(1, '#30336b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.scale(this.studioZoom, this.studioZoom);
    ctx.translate(-this.studioPanX, -this.studioPanY);

    // 2. Grids and Rulers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -400; x <= 6500; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, -500);
      ctx.lineTo(x, 1500);
      ctx.stroke();
    }
    for (let y = -500; y <= 1500; y += 100) {
      ctx.beginPath();
      ctx.moveTo(-400, y);
      ctx.lineTo(6500, y);
      ctx.stroke();
    }
    // Major 500px guides with coordinate tags
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 12px monospace';
    for (let x = 0; x <= 6000; x += 500) {
      ctx.beginPath();
      ctx.moveTo(x, -500);
      ctx.lineTo(x, 1500);
      ctx.stroke();
      ctx.fillText(`${x}m`, x + 5, 20);
    }

    const materialColors = {
      dirt: '#8B5A2B', root: '#5C4033', moss: '#2ecc71', stem: '#27ae60',
      leaf: '#16a085', can: '#bdc3c7', plastic: '#e74c3c', fork: '#7f8c8d',
      silk: '#ecf0f1', honeycomb: '#f39c12', straw: '#f1c40f'
    };

    // 3. Polylines
    (d.polylines || []).forEach((p, pIdx) => {
      if (!p.points || p.points.length < 2) return;
      const isSelectedPoly = (this.studioSelection?.category === 'polylines' && this.studioSelection?.index === pIdx);

      ctx.beginPath();
      ctx.moveTo(p.points[0][0], p.points[0][1]);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i][0], p.points[i][1]);
      }
      ctx.strokeStyle = materialColors[p.material] || '#8B5A2B';
      ctx.lineWidth = (p.thickness || 24);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw vertices
      p.points.forEach((pt, ptIdx) => {
        const isSelectedVertex = isSelectedPoly && this.studioSelection?.vertexIndex === ptIdx;
        ctx.fillStyle = isSelectedVertex ? '#ffd93b' : '#ffffff';
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], isSelectedVertex ? 8 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isSelectedVertex ? '#d35400' : '#2d3436';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      if (isSelectedPoly && this.studioSelection.vertexIndex === null) {
        ctx.strokeStyle = '#ffd93b';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 4. Dynamic Platforms
    (d.dynamicPlatforms || []).forEach((dp, i) => {
      const isSel = (this.studioSelection?.category === 'dynamicPlatforms' && this.studioSelection?.index === i);
      const angle = dp.baseAngle || dp.angle || 0;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Pivot cord if pendulum
      if (dp.type === 'pendulum') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dp.pivotX, dp.pivotY - 140);
        ctx.lineTo(dp.pivotX, dp.pivotY);
        ctx.stroke();
      }

      // Platform Bar
      ctx.save();
      ctx.translate(dp.pivotX, dp.pivotY);
      ctx.rotate(angle);
      ctx.fillStyle = dp.type === 'fork' ? '#7f8c8d' : (dp.type === 'leaf' ? '#2ecc71' : '#e67e22');
      ctx.fillRect(-90, -10, 180, 20);
      ctx.restore();

      // Pivot Dot
      ctx.fillStyle = isSel ? '#ffd93b' : '#e74c3c';
      ctx.beginPath();
      ctx.arc(dp.pivotX, dp.pivotY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Moving Platform Guide Arrow
      if (dp.moveX || dp.moveY) {
        ctx.strokeStyle = 'rgba(56, 216, 78, 0.5)';
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(dp.pivotX, dp.pivotY);
        ctx.lineTo(dp.pivotX + (dp.moveX || 0), dp.pivotY + (dp.moveY || 0));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 5. Mushrooms
    (d.mushrooms || []).forEach((m, i) => {
      const isSel = (this.studioSelection?.category === 'mushrooms' && this.studioSelection?.index === i);
      ctx.fillStyle = isSel ? '#ff7675' : '#e84393';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius || 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '26px sans-serif';
      ctx.fillText('🍄', m.x - 13, m.y + 9);

      // Bounce vector line
      const ang = m.angle || 0;
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x + Math.cos(ang) * 45, m.y + Math.sin(ang) * 45);
      ctx.stroke();
    });

    // 6. Enemies (Aphids & Hedgehogs)
    (d.aphids || []).forEach((a, i) => {
      const isSel = (this.studioSelection?.category === 'aphids' && this.studioSelection?.index === i);
      // Patrol track
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(a.patrolMinX, a.y);
      ctx.lineTo(a.patrolMaxX, a.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isSel ? '#55efc4' : '#26de81';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius || 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.fillText('🐛', a.x - 11, a.y + 8);
    });

    (d.hedgehogs || []).forEach((h, i) => {
      const isSel = (this.studioSelection?.category === 'hedgehogs' && this.studioSelection?.index === i);
      ctx.strokeStyle = 'rgba(155, 89, 182, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(h.patrolMinX, h.y);
      ctx.lineTo(h.patrolMaxX, h.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isSel ? '#a29bfe' : '#8854d0';
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius || 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '24px sans-serif';
      ctx.fillText('🦔', h.x - 12, h.y + 8);
    });

    // 7. Power-ups
    (d.powerUps || []).forEach((pu, i) => {
      const isSel = (this.studioSelection?.category === 'powerUps' && this.studioSelection?.index === i);
      ctx.fillStyle = isSel ? '#ffeaa7' : '#f7b731';
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      const icon = pu.type === 'feather' ? '🪶' : (pu.type === 'speed' ? '⚡' : (pu.type === 'strength' ? '💪' : '🛡️'));
      ctx.fillText(icon, pu.x - 11, pu.y + 8);
    });

    // 8. Props
    (d.props || []).forEach((pr, i) => {
      const isSel = (this.studioSelection?.category === 'props' && this.studioSelection?.index === i);
      const isPine = pr.type === 'pinecone';
      ctx.fillStyle = isPine ? '#b33939' : '#cd6133';
      const r = (isPine ? 40 : 25) * (pr.scale || 1);
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${Math.round(22 * (pr.scale || 1))}px sans-serif`;
      ctx.fillText(isPine ? '🌲' : '🌰', pr.x - 11, pr.y + 8);
    });

    // 9. Thorns & Sticky crumbs
    (d.thorns || []).forEach(t => {
      ctx.fillStyle = '#eb3b5a';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius || 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.fillText('🌵', t.x - 11, t.y + 8);
    });
    (d.stickyCrumbs || []).forEach(sc => {
      ctx.fillStyle = sc.kind === 'honey' ? '#fa8231' : '#b71540';
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, sc.radius || 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.fillText(sc.kind === 'honey' ? '🍯' : '🍓', sc.x - 11, sc.y + 8);
    });

    // 10. Checkpoints
    (d.checkpoints || []).forEach((cp, i) => {
      const isSel = (this.studioSelection?.category === 'checkpoints' && this.studioSelection?.index === i);
      ctx.fillStyle = isSel ? '#fdcb6e' : '#0984e3';
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '20px sans-serif';
      ctx.fillText('🚩', cp.x - 10, cp.y + 7);
    });

    // 11. Decorations
    (d.decorations || []).forEach((dc, i) => {
      const isSel = (this.studioSelection?.category === 'decorations' && this.studioSelection?.index === i);
      ctx.font = `${Math.round(28 * (dc.scale || 1.2))}px sans-serif`;
      ctx.fillText(dc.type === 'fern' ? '🌿' : '🌸', dc.x - 14, dc.y + 10);
    });

    // 12. Start Banner & Finish Line
    const map = this.currentStudioMap;
    if (map) {
      // Start Flag
      const sx = map.startX || 160;
      const sy = map.startY || 500;
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(sx, sy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('🏁 DÉPART', sx - 35, sy - 25);

      // Finish Gate
      const fx = map.finishX || 4400;
      const fy = map.finishY || 460;
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(fx, fy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd93b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🏆 ARRIVÉE', fx - 40, fy - 28);
    }

    // 13. SELECTION OUTLINE & ROTATION GIZMO
    if (this.studioSelection) {
      const center = this.getSelectedItemCenter();
      if (center) {
        // Glowing outline
        ctx.strokeStyle = '#ffd93b';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(center.x, center.y, (center.radius || 30) + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rotation Gizmo (for rotatable items)
        const angle = this.getSelectedItemAngle();
        if (angle !== null) {
          const handleDist = Math.max(50, (center.radius || 35) + 25);
          const hx = center.x + Math.cos(angle) * handleDist;
          const hy = center.y + Math.sin(angle) * handleDist;

          // Stalk ray
          ctx.strokeStyle = '#ffd93b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(hx, hy);
          ctx.stroke();

          // Circular grab handle
          ctx.fillStyle = '#e67e22';
          ctx.beginPath();
          ctx.arc(hx, hy, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Degree label
          const deg = Math.round((angle * 180) / Math.PI);
          ctx.fillStyle = '#ffd93b';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`${deg}°`, hx + 12, hy + 4);
        }
      }
    }

    ctx.restore();
  }

  // ==================== MINIMAP RENDERING ====================
  renderStudioMinimap() {
    const canvas = this.studioMinimapCanvas;
    const ctx = this.studioMinimapCtx;
    const d = this.mapEditorData;
    if (!canvas || !ctx || !d) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const minX = -200;
    const maxX = 6000;
    const totalW = maxX - minX;

    // Draw mini terrain polylines
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    (d.polylines || []).forEach(p => {
      if (!p.points || p.points.length < 2) return;
      ctx.beginPath();
      for (let i = 0; i < p.points.length; i++) {
        const mx = ((p.points[i][0] - minX) / totalW) * w;
        const my = Math.max(2, Math.min(h - 2, (p.points[i][1] / 800) * h));
        if (i === 0) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
      }
      ctx.stroke();
    });

    // Update Viewport box position
    const box = document.getElementById('studio-minimap-viewport');
    if (box) {
      const viewStartPct = Math.max(0, Math.min(1, (this.studioPanX - minX) / totalW));
      const viewWidthPct = Math.max(0.04, Math.min(1, (this.studioCanvas.width / this.studioZoom) / totalW));
      box.style.left = `${viewStartPct * 100}%`;
      box.style.width = `${viewWidthPct * 100}%`;
    }
  }

  // ==================== INSPECTOR PANEL RENDERING ====================
  renderStudioInspector() {
    const panel = document.getElementById('studio-inspector');
    if (!panel) return;

    const sel = this.studioSelection;
    const d = this.mapEditorData;

    if (!sel || !d) {
      // Empty state with map info & keyboard shortcuts
      const map = this.currentStudioMap || {};
      panel.innerHTML = `
        <div class="inspector-header">
          <h4>🗺️ Carte : ${map.name || 'Sans Nom'}</h4>
          <span class="inspector-type-badge">${map.difficulty || 'Facile'}</span>
        </div>

        <div class="inspector-section">
          <div class="inspector-section-title">Informations Générales</div>
          <div class="inspector-form-group">
            <label>Nom :</label>
            <input type="text" id="insp-map-name" class="admin-input" value="${map.name || ''}" />
          </div>
          <div class="inspector-row-2">
            <div class="inspector-form-group">
              <label>Difficulté :</label>
              <select id="insp-map-diff" class="admin-select">
                <option value="Facile" ${map.difficulty === 'Facile' ? 'selected' : ''}>Facile</option>
                <option value="Moyen" ${map.difficulty === 'Moyen' ? 'selected' : ''}>Moyen</option>
                <option value="Difficile" ${map.difficulty === 'Difficile' ? 'selected' : ''}>Difficile</option>
              </select>
            </div>
            <div class="inspector-form-group">
              <label>Thème :</label>
              <select id="insp-map-theme" class="admin-select">
                <option value="forest" ${map.theme === 'forest' ? 'selected' : ''}>Forêt</option>
                <option value="garden" ${map.theme === 'garden' ? 'selected' : ''}>Jardin</option>
                <option value="canopy" ${map.theme === 'canopy' ? 'selected' : ''}>Canopée</option>
                <option value="marsh" ${map.theme === 'marsh' ? 'selected' : ''}>Marécage</option>
              </select>
            </div>
          </div>
        </div>

        <div class="inspector-empty-state">
          <div class="inspector-empty-icon">👈</div>
          <strong>Sélectionnez un élément</strong>
          <small>Cliquez sur un objet de la map ou glissez-déposez depuis la boîte à outils pour le modifier.</small>
        </div>

        <div class="inspector-shortcuts-card">
          <div class="shortcut-row"><span>Sélectionner / Déplacer</span> <span class="shortcut-key">Clic Gauche</span></div>
          <div class="shortcut-row"><span>Orienter / Tourner</span> <span class="shortcut-key">Poignée Orange</span></div>
          <div class="shortcut-row"><span>Supprimer l'objet</span> <span class="shortcut-key">Touche Suppr</span></div>
          <div class="shortcut-row"><span>Zoomer</span> <span class="shortcut-key">Molette</span></div>
          <div class="shortcut-row"><span>Déplacer caméra</span> <span class="shortcut-key">Clic Droit / Espace</span></div>
        </div>
      `;

      document.getElementById('insp-map-name')?.addEventListener('input', (e) => {
        map.name = e.target.value;
        document.getElementById('studio-map-title').textContent = map.name;
        document.getElementById('admin-map-name').value = map.name;
      });
      document.getElementById('insp-map-diff')?.addEventListener('change', (e) => {
        map.difficulty = e.target.value;
        document.getElementById('admin-map-diff').value = map.difficulty;
      });
      document.getElementById('insp-map-theme')?.addEventListener('change', (e) => {
        map.theme = e.target.value;
        document.getElementById('admin-map-theme').value = map.theme;
        this.renderStudioCanvas();
      });
      return;
    }

    // Item Selected: Render specific Inspector
    const cat = sel.category;
    let title = 'Élément';
    let contentHtml = '';

    if (cat === 'polylines') {
      const p = d.polylines[sel.index];
      title = (sel.vertexIndex !== null && sel.vertexIndex !== undefined) ? `Point #${sel.vertexIndex + 1} de Terrain` : `Ligne de Terrain`;
      contentHtml = `
        <div class="inspector-form-group">
          <label>Matériau de surface :</label>
          <select id="insp-poly-mat" class="admin-select">
            ${['dirt', 'root', 'moss', 'stem', 'leaf', 'can', 'plastic', 'fork', 'silk', 'honeycomb', 'straw'].map(m => `
              <option value="${m}" ${p.material === m ? 'selected' : ''}>${m}</option>
            `).join('')}
          </select>
        </div>
        <div class="inspector-form-group">
          <label>Épaisseur :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-poly-thick" min="10" max="60" value="${p.thickness || 24}" />
            <span class="inspector-slider-val" id="val-poly-thick">${p.thickness || 24} px</span>
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Points : ${p.points?.length || 0}</label>
          <div class="flex-gap">
            <button id="btn-insp-add-pt" class="admin-btn mini-btn green-btn">➕ Ajouter un point</button>
            ${(sel.vertexIndex !== null && p.points.length > 2) ? `<button id="btn-insp-del-pt" class="admin-btn mini-btn danger-btn">🗑️ Supprimer ce point</button>` : ''}
          </div>
        </div>
      `;
    } else if (cat === 'mushrooms') {
      const m = d.mushrooms[sel.index];
      title = 'Champignon Tremplin 🍄';
      const deg = Math.round(((m.angle || 0) * 180) / Math.PI);
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(m.x)}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(m.y)}" />
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Orientation / Angle de projection :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-item-angle" min="-180" max="180" value="${deg}" />
            <span class="inspector-slider-val" id="val-item-angle">${deg}°</span>
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Puissance de rebond :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-shroom-bounce" min="200" max="800" step="10" value="${m.bounceSpeed || 420}" />
            <span class="inspector-slider-val" id="val-shroom-bounce">${m.bounceSpeed || 420}</span>
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Rayon du dôme :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-shroom-rad" min="24" max="70" value="${m.radius || 42}" />
            <span class="inspector-slider-val" id="val-shroom-rad">${m.radius || 42} px</span>
          </div>
        </div>
      `;
    } else if (cat === 'dynamicPlatforms') {
      const dp = d.dynamicPlatforms[sel.index];
      title = `Plateforme Spéciale [${dp.type}]`;
      const deg = Math.round(((dp.baseAngle || 0) * 180) / Math.PI);
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Pivot X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(dp.pivotX)}" />
          </div>
          <div class="inspector-form-group">
            <label>Pivot Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(dp.pivotY)}" />
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Orientation de base :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-item-angle" min="-180" max="180" value="${deg}" />
            <span class="inspector-slider-val" id="val-item-angle">${deg}°</span>
          </div>
        </div>
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Course X :</label>
            <input type="number" id="insp-dp-movex" class="admin-input" value="${dp.moveX || 0}" />
          </div>
          <div class="inspector-form-group">
            <label>Course Y :</label>
            <input type="number" id="insp-dp-movey" class="admin-input" value="${dp.moveY || 0}" />
          </div>
        </div>
      `;
    } else if (cat === 'aphids' || cat === 'hedgehogs') {
      const enemy = (cat === 'aphids') ? d.aphids[sel.index] : d.hedgehogs[sel.index];
      title = (cat === 'aphids') ? 'Puceron Patrouilleur 🐛' : 'Hérisson Piquant 🦔';
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(enemy.x)}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(enemy.y)}" />
          </div>
        </div>
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Patrouille Min X :</label>
            <input type="number" id="insp-patrol-min" class="admin-input" value="${Math.round(enemy.patrolMinX)}" />
          </div>
          <div class="inspector-form-group">
            <label>Patrouille Max X :</label>
            <input type="number" id="insp-patrol-max" class="admin-input" value="${Math.round(enemy.patrolMaxX)}" />
          </div>
        </div>
      `;
    } else if (cat === 'powerUps') {
      const pu = d.powerUps[sel.index];
      title = 'Pouvoir Spécial ⚡';
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(pu.x)}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(pu.y)}" />
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Type de bonus :</label>
          <select id="insp-pu-type" class="admin-select">
            <option value="feather" ${pu.type === 'feather' ? 'selected' : ''}>🪶 Plume Poids-Plume</option>
            <option value="speed" ${pu.type === 'speed' ? 'selected' : ''}>⚡ Éclair Hyper-Vitesse</option>
            <option value="strength" ${pu.type === 'strength' ? 'selected' : ''}>💪 Haltère Super-Force</option>
            <option value="shield" ${pu.type === 'shield' ? 'selected' : ''}>🛡️ Bulle Bouclier</option>
          </select>
        </div>
      `;
    } else if (cat === 'props') {
      const pr = d.props[sel.index];
      title = (pr.type === 'pinecone') ? 'Pomme de Pin 🌲' : 'Gland 🌰';
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(pr.x)}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(pr.y)}" />
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Échelle / Taille :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-prop-scale" min="0.5" max="2.5" step="0.1" value="${pr.scale || 1.0}" />
            <span class="inspector-slider-val" id="val-prop-scale">${pr.scale || 1.0}x</span>
          </div>
        </div>
      `;
    } else if (cat === 'decorations') {
      const dc = d.decorations[sel.index];
      title = (dc.type === 'fern') ? 'Fougère 🌿' : 'Fleur Géante 🌸';
      const deg = Math.round(((dc.angle || 0) * 180) / Math.PI);
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(dc.x)}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(dc.y)}" />
          </div>
        </div>
        <div class="inspector-form-group">
          <label>Orientation :</label>
          <div class="inspector-slider-row">
            <input type="range" id="insp-item-angle" min="-180" max="180" value="${deg}" />
            <span class="inspector-slider-val" id="val-item-angle">${deg}°</span>
          </div>
        </div>
      `;
    } else if (cat === 'start' || cat === 'finish') {
      const map = this.currentStudioMap;
      const isStart = cat === 'start';
      title = isStart ? 'Drapeau de Départ 🏁' : 'Ligne d\'Arrivée 🏆';
      const px = isStart ? (map.startX || 160) : (map.finishX || 4400);
      const py = isStart ? (map.startY || 500) : (map.finishY || 460);
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${Math.round(px)}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${Math.round(py)}" />
          </div>
        </div>
      `;
    } else {
      const item = d[cat]?.[sel.index];
      title = `Élément [${cat}]`;
      contentHtml = `
        <div class="inspector-row-2">
          <div class="inspector-form-group">
            <label>Position X :</label>
            <input type="number" id="insp-item-x" class="admin-input" value="${item ? Math.round(item.x) : 0}" />
          </div>
          <div class="inspector-form-group">
            <label>Position Y :</label>
            <input type="number" id="insp-item-y" class="admin-input" value="${item ? Math.round(item.y) : 0}" />
          </div>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="inspector-header">
        <h4>${title}</h4>
        <span class="inspector-type-badge">${cat}</span>
      </div>

      <div class="inspector-section">
        ${contentHtml}
      </div>

      <div class="inspector-actions-bar">
        ${(cat !== 'start' && cat !== 'finish') ? `
          <button id="btn-insp-duplicate" class="admin-btn secondary-btn">📄 Dupliquer cet élément</button>
          <button id="btn-insp-delete" class="admin-btn danger-btn">🗑️ Supprimer cet élément (Suppr)</button>
        ` : ''}
      </div>
    `;

    // Wire live input updates
    this.bindInspectorInputs();
  }

  bindInspectorInputs() {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    if (!sel || !d) return;

    const xIn = document.getElementById('insp-item-x');
    const yIn = document.getElementById('insp-item-y');
    const angleIn = document.getElementById('insp-item-angle');

    if (xIn) {
      xIn.addEventListener('input', () => {
        const val = Number(xIn.value);
        if (sel.category === 'start') this.currentStudioMap.startX = val;
        else if (sel.category === 'finish') this.currentStudioMap.finishX = val;
        else if (sel.category === 'dynamicPlatforms') d.dynamicPlatforms[sel.index].pivotX = val;
        else if (d[sel.category]?.[sel.index]) d[sel.category][sel.index].x = val;
        this.renderStudioCanvas();
      });
    }
    if (yIn) {
      yIn.addEventListener('input', () => {
        const val = Number(yIn.value);
        if (sel.category === 'start') this.currentStudioMap.startY = val;
        else if (sel.category === 'finish') this.currentStudioMap.finishY = val;
        else if (sel.category === 'dynamicPlatforms') d.dynamicPlatforms[sel.index].pivotY = val;
        else if (d[sel.category]?.[sel.index]) d[sel.category][sel.index].y = val;
        this.renderStudioCanvas();
      });
    }
    if (angleIn) {
      angleIn.addEventListener('input', () => {
        const deg = Number(angleIn.value);
        const rad = (deg * Math.PI) / 180;
        document.getElementById('val-item-angle').textContent = `${deg}°`;
        this.setSelectedItemAngle(rad);
        this.renderStudioCanvas();
      });
    }

    // Polyline material & thickness
    const polyMat = document.getElementById('insp-poly-mat');
    polyMat?.addEventListener('change', () => {
      d.polylines[sel.index].material = polyMat.value;
      this.renderStudioCanvas();
    });
    const polyThick = document.getElementById('insp-poly-thick');
    polyThick?.addEventListener('input', () => {
      d.polylines[sel.index].thickness = Number(polyThick.value);
      document.getElementById('val-poly-thick').textContent = `${polyThick.value} px`;
      this.renderStudioCanvas();
    });

    // Mushroom bounce & radius
    const shroomBounce = document.getElementById('insp-shroom-bounce');
    shroomBounce?.addEventListener('input', () => {
      d.mushrooms[sel.index].bounceSpeed = Number(shroomBounce.value);
      document.getElementById('val-shroom-bounce').textContent = shroomBounce.value;
    });
    const shroomRad = document.getElementById('insp-shroom-rad');
    shroomRad?.addEventListener('input', () => {
      d.mushrooms[sel.index].radius = Number(shroomRad.value);
      document.getElementById('val-shroom-rad').textContent = `${shroomRad.value} px`;
      this.renderStudioCanvas();
    });

    // Enemy Patrol Range
    const pMin = document.getElementById('insp-patrol-min');
    pMin?.addEventListener('input', () => {
      const arr = (sel.category === 'aphids') ? d.aphids : d.hedgehogs;
      arr[sel.index].patrolMinX = Number(pMin.value);
      this.renderStudioCanvas();
    });
    const pMax = document.getElementById('insp-patrol-max');
    pMax?.addEventListener('input', () => {
      const arr = (sel.category === 'aphids') ? d.aphids : d.hedgehogs;
      arr[sel.index].patrolMaxX = Number(pMax.value);
      this.renderStudioCanvas();
    });

    // PowerUp type
    const puType = document.getElementById('insp-pu-type');
    puType?.addEventListener('change', () => {
      d.powerUps[sel.index].type = puType.value;
      this.renderStudioCanvas();
    });

    // Prop scale
    const propScale = document.getElementById('insp-prop-scale');
    propScale?.addEventListener('input', () => {
      d.props[sel.index].scale = Number(propScale.value);
      document.getElementById('val-prop-scale').textContent = `${propScale.value}x`;
      this.renderStudioCanvas();
    });

    // Add point to polyline
    document.getElementById('btn-insp-add-pt')?.addEventListener('click', () => {
      const p = d.polylines[sel.index];
      const last = p.points[p.points.length - 1];
      p.points.push([last[0] + 120, last[1]]);
      this.renderStudioCanvas();
      this.renderStudioInspector();
    });

    // Delete point from polyline
    document.getElementById('btn-insp-del-pt')?.addEventListener('click', () => {
      const p = d.polylines[sel.index];
      if (p.points.length > 2 && sel.vertexIndex !== null) {
        p.points.splice(sel.vertexIndex, 1);
        sel.vertexIndex = null;
        this.renderStudioCanvas();
        this.renderStudioInspector();
      }
    });

    // Duplicate & Delete buttons
    document.getElementById('btn-insp-duplicate')?.addEventListener('click', () => this.duplicateStudioSelected());
    document.getElementById('btn-insp-delete')?.addEventListener('click', () => this.deleteStudioSelected());
  }

  updateInspectorAngleField(rad) {
    const deg = Math.round((rad * 180) / Math.PI);
    const slider = document.getElementById('insp-item-angle');
    const valTxt = document.getElementById('val-item-angle');
    if (slider) slider.value = deg;
    if (valTxt) valTxt.textContent = `${deg}°`;
  }

  deleteStudioSelected() {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    if (!sel || !d) return;

    if (sel.category === 'start' || sel.category === 'finish') {
      alert('Le départ et l\'arrivée ne peuvent pas être supprimés.');
      return;
    }

    if (sel.category === 'polylines') {
      const p = d.polylines[sel.index];
      if (sel.vertexIndex !== null && sel.vertexIndex !== undefined) {
        if (p.points.length > 2) {
          p.points.splice(sel.vertexIndex, 1);
          sel.vertexIndex = null;
        } else {
          d.polylines.splice(sel.index, 1);
          this.studioSelection = null;
        }
      } else {
        d.polylines.splice(sel.index, 1);
        this.studioSelection = null;
      }
    } else {
      const arr = d[sel.category];
      if (arr && arr[sel.index]) {
        arr.splice(sel.index, 1);
        this.studioSelection = null;
      }
    }

    sound.playGrip(true);
    this.renderStudioCanvas();
    this.renderStudioMinimap();
    this.renderStudioInspector();
  }

  duplicateStudioSelected() {
    const sel = this.studioSelection;
    const d = this.mapEditorData;
    if (!sel || !d) return;

    if (sel.category === 'polylines') {
      const p = d.polylines[sel.index];
      const clone = {
        points: p.points.map(pt => [pt[0] + 40, pt[1] + 20]),
        material: p.material,
        thickness: p.thickness,
        isGroundMass: p.isGroundMass
      };
      d.polylines.push(clone);
      this.studioSelection = { category: 'polylines', index: d.polylines.length - 1, vertexIndex: null };
    } else {
      const arr = d[sel.category];
      if (arr && arr[sel.index]) {
        const item = arr[sel.index];
        const clone = JSON.parse(JSON.stringify(item));
        if (clone.x !== undefined) clone.x += 40;
        if (clone.y !== undefined) clone.y += 20;
        if (clone.pivotX !== undefined) clone.pivotX += 40;
        if (clone.pivotY !== undefined) clone.pivotY += 20;
        if (clone.patrolMinX !== undefined) { clone.patrolMinX += 40; clone.patrolMaxX += 40; }
        arr.push(clone);
        this.studioSelection = { category: sel.category, index: arr.length - 1 };
      }
    }

    sound.playGrip(true);
    this.renderStudioCanvas();
    this.renderStudioMinimap();
    this.renderStudioInspector();
  }

  saveStudioMap() {
    const map = this.currentStudioMap;
    if (!map || !this.mapEditorData) return;

    map.declarativeData = JSON.parse(JSON.stringify(this.mapEditorData));
    map.build = function(world) {
      buildFromDeclarative(world, this.declarativeData);
    };

    saveSavedMaps();
    sound.playGrip(true);
    alert(`Map "${map.name}" sauvegardée avec succès dans l'Éditeur Studio !`);
    this.updateElementBadges();
  }

  testStudioMap() {
    this.saveStudioMap();
    this.closeFullscreenStudio();
    this.close(true);

    if (this.game) {
      const idx = LEVEL_DEFINITIONS.findIndex(m => m.id === this.selectedMapId);
      if (idx >= 0) {
        this.game.loadLevel(idx);
        this.game.ui.showScreen('game');
      }
    }
  }
}
