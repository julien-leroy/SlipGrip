// js/main.js — Main Game Loop, Hold-to-Grip Input Controller, Checkpoints, Camera & HUD Manager

import { PhysicsWorld } from './physics.js?v=40';
import { Caterpillar } from './caterpillar.js?v=40';
import { ParticleSystem } from './particles.js?v=40';
import { LEVEL_DEFINITIONS, LevelRenderer } from './levels.js?v=40';
import { sound } from './audio.js?v=40';
import { GAMEPLAY_CONFIG, GAMEPLAY_PRESETS, applyPreset, saveGameplayConfig, resetGameplayConfig, saveAsDefaultGameplayConfig } from './gameplayConfig.js?v=40';

class SlipGripGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.world = new PhysicsWorld();
    this.particles = new ParticleSystem();
    this.renderer = new LevelRenderer();

    this.currentLevelIndex = 0;
    this.level = LEVEL_DEFINITIONS[0];
    this.caterpillar = new Caterpillar(this.level.startX, this.level.startY);

    this.lastCheckpoint = {
      x: this.level.startX,
      y: this.level.startY
    };

    this.inputs = {
      space: false,
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.raceStarted = false;
    this.raceFinished = false;
    this.raceTime = 0;
    this.bestTimes = this.loadBestTimes();
    this.confettiTimer = 0;

    this.camera = {
      x: 0,
      y: 0,
      focusX: this.level.startX + 120,
      focusY: this.level.startY - 40,
      scale: 0.62
    };

    this.globalTime = 0;
    this.lastFrameTime = performance.now();

    this.cacheDomElements();
    this.bindEvents();
    this.syncCosmeticsUI();
    this.syncTuningUI();
    this.resize();
    this.loadLevel(0);

    requestAnimationFrame((t) => this.loop(t));
  }

  cacheDomElements() {
    this.elTimer = document.getElementById('race-timer');
    this.elBest = document.getElementById('best-timer');
    this.elProgressFill = document.getElementById('race-progress-fill');
    this.elProgressBug = document.getElementById('race-progress-bug');

    this.elRearWidget = document.getElementById('anchor-rear-widget');
    this.elFrontWidget = document.getElementById('anchor-front-widget');
    this.elStateQ = document.getElementById('state-q');
    this.elStateD = document.getElementById('state-d');
    this.elIconQ = document.getElementById('icon-q');
    this.elIconD = document.getElementById('icon-d');

    this.elOmegaPct = document.getElementById('omega-pct');
    this.elOmegaFill = document.getElementById('omega-meter-fill');
    this.elComLeft = document.getElementById('com-left');
    this.elComRight = document.getElementById('com-right');

    this.elCoachText = document.getElementById('coach-text');

    this.elVictoryModal = document.getElementById('victory-modal');
    this.elVictoryTitle = document.getElementById('victory-title');
    this.elVictoryTime = document.getElementById('victory-time');
    this.elVictoryBest = document.getElementById('victory-best');
    this.elNewRecordBadge = document.getElementById('new-record-badge');

    this.elHelpModal = document.getElementById('help-modal');
    this.elCosmeticsModal = document.getElementById('cosmetics-modal');
    this.elTuningModal = document.getElementById('tuning-modal');
    this.lvlButtons = Array.from(document.querySelectorAll('.lvl-btn'));
  }

  syncCosmeticsUI() {
    if (!this.elCosmeticsModal) return;
    const cos = this.caterpillar.cosmetics;
    document.querySelectorAll('#class-options .class-card').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.class === (cos.bodyType || 'classique'));
    });
    document.querySelectorAll('#palette-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.palette === cos.palette);
    });
    document.querySelectorAll('#hat-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.hat === cos.hat);
    });
    document.querySelectorAll('#face-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.face === cos.face);
    });
  }

  syncTuningUI() {
    if (!this.elTuningModal) return;
    const cfg = GAMEPLAY_CONFIG;

    const setSlider = (id, val) => {
      const slider = document.getElementById(`tune-${id}`);
      const readout = document.getElementById(`val-${id}`);
      if (slider) slider.value = val;
      if (readout) readout.textContent = val;
    };

    setSlider('gravity', cfg.gravity);
    setSlider('groundSnapping', cfg.groundSnapping);
    setSlider('orientationUpForce', cfg.orientationUpForce);
    setSlider('orientationResponsiveness', cfg.orientationResponsiveness);
    setSlider('bendOrientationPower', cfg.bendOrientationPower !== undefined ? cfg.bendOrientationPower : 1.0);
    setSlider('jumpBoost', cfg.jumpBoost);
    setSlider('groundPushForce', cfg.groundPushForce !== undefined ? cfg.groundPushForce : 1.35);
    setSlider('unbendExtensionSpeed', cfg.unbendExtensionSpeed !== undefined ? cfg.unbendExtensionSpeed : 8.0);
    setSlider('unbendReachBonus', cfg.unbendReachBonus !== undefined ? cfg.unbendReachBonus : 1.0);
    setSlider('jumpUpAngleBonus', cfg.jumpUpAngleBonus);
    setSlider('jumpChargeTime', cfg.jumpChargeTime);
    setSlider('gripDistance', cfg.gripDistance);
    setSlider('omegaArchVisual', cfg.omegaArchVisual);
    setSlider('wigglePhysicsAmount', cfg.wigglePhysicsAmount);
    setSlider('clawScale', cfg.clawScale);

    const chkBendOrient = document.getElementById('tune-bendCanOrientVertically');
    if (chkBendOrient) chkBendOrient.checked = cfg.bendCanOrientVertically !== false;

    const chkPreserveShape = document.getElementById('tune-preserveShapeOnBend');
    if (chkPreserveShape) chkPreserveShape.checked = cfg.preserveShapeOnBend !== false;

    const chkAirborneExt = document.getElementById('tune-airborneExtensionOnly');
    if (chkAirborneExt) chkAirborneExt.checked = cfg.airborneExtensionOnly !== false;

    const chkBadges = document.getElementById('tune-showBadgesOverlay');
    if (chkBadges) chkBadges.checked = !!cfg.showBadgesOverlay;

    document.querySelectorAll('#preset-buttons .preset-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.preset === cfg.activePreset);
    });
  }

  toggleTuningModal() {
    if (!this.elTuningModal) return;
    const isHidden = this.elTuningModal.classList.contains('hidden');
    if (isHidden) {
      this.syncTuningUI();
      this.elTuningModal.classList.remove('hidden');
    } else {
      this.elTuningModal.classList.add('hidden');
    }
  }

  loadBestTimes() {
    try {
      const raw = localStorage.getItem('slipgrip_best_times');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveBestTimes() {
    try {
      localStorage.setItem('slipgrip_best_times', JSON.stringify(this.bestTimes));
    } catch {
      // Ignore storage errors
    }
  }

  formatTime(seconds) {
    if (seconds === undefined || seconds === null) return '--:--.--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const code = e.code;
      const key = e.key.toLowerCase();

      if (['KeyQ', 'KeyA', 'KeyD', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
        if (!this.raceStarted && !this.raceFinished) {
          this.raceStarted = true;
        }
      }

      // Hold Q (or A) -> Grip Rear Foot
      if (key === 'q' || key === 'a' || code === 'KeyQ') {
        e.preventDefault();
        this.caterpillar.setRearHold(true, this.particles);
      }

      // Hold D -> Grip Front Foot
      if (key === 'd' || code === 'KeyD') {
        e.preventDefault();
        this.caterpillar.setFrontHold(true, this.particles);
      }

      // Hold SPACE -> Contract into Omega (Ω)
      if (code === 'Space') {
        e.preventDefault();
        this.inputs.space = true;
      }

      // Arrow keys -> Orientation / Aiming
      if (code === 'ArrowLeft') { e.preventDefault(); this.inputs.left = true; }
      if (code === 'ArrowRight') { e.preventDefault(); this.inputs.right = true; }
      if (code === 'ArrowUp') { e.preventDefault(); this.inputs.up = true; }
      if (code === 'ArrowDown') { e.preventDefault(); this.inputs.down = true; }

      // C -> Respawn at latest Checkpoint
      if (key === 'c') {
        e.preventDefault();
        this.respawnAtCheckpoint();
      }

      // R -> Full level restart
      if (key === 'r') {
        e.preventDefault();
        this.loadLevel(this.currentLevelIndex);
      }

      // T or Tab -> Toggle Gameplay & Physics Tuning Lab
      if (key === 't' || code === 'Tab') {
        e.preventDefault();
        this.toggleTuningModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      // Release Q -> Release Rear Foot immediately
      if (key === 'q' || key === 'a' || code === 'KeyQ') {
        this.caterpillar.setRearHold(false, this.particles);
      }

      // Release D -> Release Front Foot immediately
      if (key === 'd' || code === 'KeyD') {
        this.caterpillar.setFrontHold(false, this.particles);
      }

      // Release SPACE -> Extend body
      if (code === 'Space') this.inputs.space = false;

      if (code === 'ArrowLeft') this.inputs.left = false;
      if (code === 'ArrowRight') this.inputs.right = false;
      if (code === 'ArrowUp') this.inputs.up = false;
      if (code === 'ArrowDown') this.inputs.down = false;
    });

    // Mouse / Touch press & release on Q / D HUD widgets
    this.elRearWidget.addEventListener('pointerdown', () => {
      if (!this.raceStarted && !this.raceFinished) this.raceStarted = true;
      this.caterpillar.setRearHold(true, this.particles);
    });
    this.elRearWidget.addEventListener('pointerup', () => {
      this.caterpillar.setRearHold(false, this.particles);
    });
    this.elRearWidget.addEventListener('pointerleave', () => {
      this.caterpillar.setRearHold(false, this.particles);
    });

    this.elFrontWidget.addEventListener('pointerdown', () => {
      if (!this.raceStarted && !this.raceFinished) this.raceStarted = true;
      this.caterpillar.setFrontHold(true, this.particles);
    });
    this.elFrontWidget.addEventListener('pointerup', () => {
      this.caterpillar.setFrontHold(false, this.particles);
    });
    this.elFrontWidget.addEventListener('pointerleave', () => {
      this.caterpillar.setFrontHold(false, this.particles);
    });

    // Level selector buttons
    this.lvlButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.level, 10);
        this.loadLevel(idx);
        btn.blur();
      });
    });

    // Checkpoint respawn button
    document.getElementById('btn-checkpoint').addEventListener('click', (e) => {
      this.respawnAtCheckpoint();
      e.currentTarget.blur();
    });

    // Full Restart button
    document.getElementById('btn-restart').addEventListener('click', (e) => {
      this.loadLevel(this.currentLevelIndex);
      e.currentTarget.blur();
    });

    // Mute button
    const btnMute = document.getElementById('btn-mute');
    btnMute.addEventListener('click', () => {
      const muted = sound.toggleMute();
      btnMute.textContent = muted ? '🔇' : '🔊';
      btnMute.blur();
    });

    // Cosmetics modal buttons
    const btnCosmetics = document.getElementById('btn-cosmetics');
    if (btnCosmetics && this.elCosmeticsModal) {
      btnCosmetics.addEventListener('click', () => {
        this.syncCosmeticsUI();
        this.elCosmeticsModal.classList.remove('hidden');
        btnCosmetics.blur();
      });
    }
    const btnCloseCosmetics = document.getElementById('btn-close-cosmetics');
    if (btnCloseCosmetics && this.elCosmeticsModal) {
      btnCloseCosmetics.addEventListener('click', () => {
        this.elCosmeticsModal.classList.add('hidden');
      });
    }

    document.querySelectorAll('#class-options .class-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const clsId = btn.dataset.class;
        this.caterpillar.setBodyType(clsId);
        this.syncCosmeticsUI();
        sound.playGrip(true);
        const titleEl = btn.querySelector('.class-title');
        const name = titleEl ? titleEl.textContent.trim() : clsId;
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 30, `MORPHOLOGIE : ${name}`, '#ffd93b');
      });
    });

    document.querySelectorAll('#palette-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.palette = btn.dataset.palette;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        sound.playGrip();
      });
    });

    document.querySelectorAll('#hat-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.hat = btn.dataset.hat;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        sound.playGrip();
      });
    });

    document.querySelectorAll('#face-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.face = btn.dataset.face;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        sound.playGrip();
      });
    });

    // Tuning Modal Events
    const btnTuning = document.getElementById('btn-tuning');
    if (btnTuning) {
      btnTuning.addEventListener('click', () => {
        this.toggleTuningModal();
        btnTuning.blur();
      });
    }

    const btnCloseTuning = document.getElementById('btn-close-tuning');
    if (btnCloseTuning) {
      btnCloseTuning.addEventListener('click', () => this.toggleTuningModal());
    }

    const btnCloseTuningX = document.getElementById('btn-close-tuning-x');
    if (btnCloseTuningX) {
      btnCloseTuningX.addEventListener('click', () => this.toggleTuningModal());
    }

    // Preset selector buttons
    document.querySelectorAll('#preset-buttons .preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pKey = btn.dataset.preset;
        applyPreset(pKey);
        this.syncTuningUI();
        sound.playGrip(true);
        const name = btn.querySelector('strong') ? btn.querySelector('strong').textContent.trim() : pKey;
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 25, `PRESET : ${name}`, '#38d84e');
      });
    });

    // Sliders live binding
    const bindSlider = (prop, isInt = false) => {
      const input = document.getElementById(`tune-${prop}`);
      const readout = document.getElementById(`val-${prop}`);
      if (!input) return;
      input.addEventListener('input', () => {
        const val = isInt ? parseInt(input.value, 10) : parseFloat(input.value);
        GAMEPLAY_CONFIG[prop] = val;
        if (readout) readout.textContent = val;
        saveGameplayConfig();
      });
    };

    bindSlider('gravity', true);
    bindSlider('groundSnapping', false);
    bindSlider('orientationUpForce', true);
    bindSlider('orientationResponsiveness', false);
    bindSlider('bendOrientationPower', false);
    bindSlider('jumpBoost', false);
    bindSlider('groundPushForce', false);
    bindSlider('unbendExtensionSpeed', false);
    bindSlider('unbendReachBonus', false);
    bindSlider('jumpUpAngleBonus', false);
    bindSlider('jumpChargeTime', false);
    bindSlider('gripDistance', true);
    bindSlider('omegaArchVisual', false);
    bindSlider('wigglePhysicsAmount', true);
    bindSlider('clawScale', false);

    const bindCheckbox = (id, prop) => {
      const chk = document.getElementById(id);
      if (chk) {
        chk.addEventListener('change', () => {
          GAMEPLAY_CONFIG[prop] = chk.checked;
          saveGameplayConfig();
        });
      }
    };

    bindCheckbox('tune-bendCanOrientVertically', 'bendCanOrientVertically');
    bindCheckbox('tune-preserveShapeOnBend', 'preserveShapeOnBend');
    bindCheckbox('tune-airborneExtensionOnly', 'airborneExtensionOnly');
    bindCheckbox('tune-showBadgesOverlay', 'showBadgesOverlay');

    // Copy config button
    const btnCopyConfig = document.getElementById('btn-copy-config');
    if (btnCopyConfig) {
      btnCopyConfig.addEventListener('click', () => {
        const json = JSON.stringify(GAMEPLAY_CONFIG, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(json).then(() => {
            btnCopyConfig.textContent = '✅ Copié dans le presse-papier !';
            setTimeout(() => { btnCopyConfig.textContent = '📋 Copier la Config'; }, 2200);
            this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 30, 'CONFIG COPIÉE ! 📋', '#ffd93b');
          }).catch(() => {
            console.log('SlipGrip Gameplay Config:\n', json);
            alert('Config copiée dans la console F12 !');
          });
        } else {
          console.log('SlipGrip Gameplay Config:\n', json);
          alert('Config affichée dans la console développeur F12 !');
        }
      });
    }

    // Save as Default button
    const btnSaveDefault = document.getElementById('btn-save-default');
    if (btnSaveDefault) {
      btnSaveDefault.addEventListener('click', () => {
        saveAsDefaultGameplayConfig();
        saveGameplayConfig();
        sound.playCheckpoint();
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 25, 'DÉFAUT ENREGISTRÉ ! 💾', '#ffd93b');
        btnSaveDefault.textContent = '✅ Enregistré par défaut !';
        setTimeout(() => { btnSaveDefault.textContent = '💾 Définir par Défaut'; }, 2000);
      });
    }

    // Reset tuning button
    const btnResetTuning = document.getElementById('btn-reset-tuning');
    if (btnResetTuning) {
      btnResetTuning.addEventListener('click', () => {
        resetGameplayConfig();
        this.syncTuningUI();
        sound.playBoing();
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 25, 'RÉINITIALISÉ ! 🔄', '#ff7675');
      });
    }

    // Help modal buttons
    document.getElementById('btn-help').addEventListener('click', () => {
      this.elHelpModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-help').addEventListener('click', () => {
      this.elHelpModal.classList.add('hidden');
    });

    // Victory modal buttons
    document.getElementById('btn-replay-lvl').addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
    });
    document.getElementById('btn-next-lvl').addEventListener('click', () => {
      const nextIdx = (this.currentLevelIndex + 1) % LEVEL_DEFINITIONS.length;
      this.loadLevel(nextIdx);
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    this.level = LEVEL_DEFINITIONS[index];

    this.lvlButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    this.world.clear();
    this.particles.clear();
    this.level.build(this.world);

    this.lastCheckpoint = {
      x: this.level.startX,
      y: this.level.startY
    };

    this.caterpillar.reset(this.level.startX, this.level.startY);

    this.raceStarted = false;
    this.raceFinished = false;
    this.raceTime = 0;
    this.confettiTimer = 0;

    this.elVictoryModal.classList.add('hidden');
    this.elCoachText.innerHTML = this.level.coachHint;
    this.elBest.textContent = this.formatTime(this.bestTimes[this.level.id]);

    const com = this.caterpillar.centerOfMass;
    this.camera.focusX = com.x + 120;
    this.camera.focusY = com.y - 30;
    this.camera.x = this.camera.focusX - (this.canvas.width / this.camera.scale) * 0.36;
    this.camera.y = this.camera.focusY - (this.canvas.height / this.camera.scale) * 0.58;
  }

  respawnAtCheckpoint() {
    this.caterpillar.reset(this.lastCheckpoint.x, this.lastCheckpoint.y);
    const com = this.caterpillar.centerOfMass;
    this.camera.focusX = com.x + 120;
    this.camera.focusY = com.y - 30;
    this.particles.spawnPopup(this.lastCheckpoint.x + 70, this.lastCheckpoint.y - 30, 'CHECKPOINT ! 🚩', '#ffd93b');
  }

  checkCheckpoints() {
    const head = this.caterpillar.head;
    const rear = this.caterpillar.rear;
    for (const cp of this.world.checkpoints) {
      if (!cp.activated) {
        const distHead = Math.hypot(head.x - cp.x, head.y - cp.y);
        const distRear = Math.hypot(rear.x - cp.x, rear.y - cp.y);
        if (distHead < 85 || distRear < 85 || head.x >= cp.x) {
          cp.activated = true;
          this.lastCheckpoint = {
            x: cp.x - 60,
            y: cp.y - 28
          };
          sound.playCheckpoint();
          this.particles.spawnConfetti(cp.x, cp.y - 70, 20);
          this.particles.spawnPopup(cp.x, cp.y - 105, `${cp.label} VALIDÉ !`, '#38d84e');
        }
      }
    }
  }

  triggerVictory() {
    this.raceFinished = true;
    sound.playVictory();

    const finishX = this.level.finishX;
    const finishY = this.level.finishY;
    this.particles.spawnConfetti(finishX, finishY - 80, 55);
    this.particles.spawnPopup(finishX, finishY - 120, 'BRAVO ! 🏁', '#ffd93b');

    const prevBest = this.bestTimes[this.level.id];
    const isNewRecord = prevBest === undefined || this.raceTime < prevBest;
    if (isNewRecord) {
      this.bestTimes[this.level.id] = this.raceTime;
      this.saveBestTimes();
    }

    this.elBest.textContent = this.formatTime(this.bestTimes[this.level.id]);
    this.elVictoryTitle.textContent = `${this.level.name} Terminé !`;
    this.elVictoryTime.textContent = this.formatTime(this.raceTime);
    this.elVictoryBest.textContent = this.formatTime(this.bestTimes[this.level.id]);
    this.elNewRecordBadge.classList.toggle('hidden', !isNewRecord);

    setTimeout(() => {
      if (this.raceFinished) {
        this.elVictoryModal.classList.remove('hidden');
      }
    }, 1350);
  }

  updateHUD() {
    this.elTimer.textContent = this.formatTime(this.raceTime);
    const progress = Math.max(0, Math.min(1, (this.caterpillar.head.x - this.level.startX) / (this.level.finishX - this.level.startX)));
    const pct = (progress * 100).toFixed(1) + '%';
    this.elProgressFill.style.width = pct;
    this.elProgressBug.style.left = pct;

    this.updateAnchorWidget(this.elRearWidget, this.elStateQ, this.elIconQ, this.caterpillar.rearAnchor, '🟣');
    this.updateAnchorWidget(this.elFrontWidget, this.elStateD, this.elIconD, this.caterpillar.frontAnchor, '🟢');

    const omegaPct = Math.round(this.caterpillar.omegaCharge * 100);
    this.elOmegaPct.textContent = `${omegaPct}%`;
    this.elOmegaFill.style.width = `${omegaPct}%`;

    this.elComLeft.classList.toggle('active', this.inputs.left);
    this.elComRight.classList.toggle('active', this.inputs.right);
  }

  updateAnchorWidget(widgetEl, stateEl, iconEl, anchor, defaultIcon) {
    widgetEl.classList.remove('anchored', 'armed', 'slipping', 'stuck');

    if (anchor.stuckCrumb) {
      widgetEl.classList.add('stuck');
      stateEl.textContent = 'ENGLUÉE ! (ESPACE)';
      iconEl.textContent = '🍯';
    } else if (anchor.propRef) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = anchor.propRef.type === 'pinecone' ? 'AGRIPPÉE (POMME DE PIN)' : 'AGRIPPÉE (GLAND)';
      iconEl.textContent = '🌰';
    } else if (anchor.anchored && anchor.slipping) {
      widgetEl.classList.add('slipping');
      stateEl.textContent = 'GLISSE !';
      iconEl.textContent = '🫧';
    } else if (anchor.anchored) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = 'AGRIPPÉE AU SOL';
      iconEl.textContent = defaultIcon;
    } else if (anchor.holdingKey) {
      widgetEl.classList.add('armed');
      stateEl.textContent = 'CHERCHE LE SOL...';
      iconEl.textContent = '🧲';
    } else {
      stateEl.textContent = 'LIBRE (RELÂCHÉE)';
      iconEl.textContent = '⚪';
    }
  }

  update(dt) {
    this.globalTime += dt;

    if (this.raceStarted && !this.raceFinished) {
      this.raceTime += dt;
    }

    this.world.update(dt);
    this.caterpillar.update(dt, this.world, this.inputs, this.particles);
    this.particles.update(dt);

    this.checkCheckpoints();

    const com = this.caterpillar.centerOfMass;
    if (com.y > 1020) {
      this.respawnAtCheckpoint();
      return;
    }

    if (!this.raceFinished && this.caterpillar.head.x >= this.level.finishX) {
      this.triggerVictory();
    }

    if (this.raceFinished) {
      this.confettiTimer += dt;
      if (this.confettiTimer > 0.65) {
        this.confettiTimer = 0;
        this.particles.spawnConfetti(this.level.finishX, this.level.finishY - 70, 22);
      }
    }

    // Ultra-calm Deadzone Camera (Zero shake, zero reaction to Ω folding!)
    const deadzoneRight = 160;
    const deadzoneLeft = 140;
    const deadzoneY = 140;

    if (com.x > this.camera.focusX + deadzoneRight) {
      this.camera.focusX = com.x - deadzoneRight;
    } else if (com.x < this.camera.focusX - deadzoneLeft) {
      this.camera.focusX = com.x + deadzoneLeft;
    }

    if (com.y > this.camera.focusY + deadzoneY) {
      this.camera.focusY = com.y - deadzoneY;
    } else if (com.y < this.camera.focusY - deadzoneY) {
      this.camera.focusY = com.y + deadzoneY;
    }

    const viewW = this.canvas.width / this.camera.scale;
    const viewH = this.canvas.height / this.camera.scale;

    const targetCamX = this.camera.focusX - viewW * 0.36;
    const targetCamY = this.camera.focusY - viewH * 0.58;

    this.camera.x += (targetCamX - this.camera.x) * Math.min(1, dt * 1.8);
    this.camera.y += (targetCamY - this.camera.y) * Math.min(1, dt * 1.5);
    this.camera.y = Math.max(-360, Math.min(200, this.camera.y));

    this.updateHUD();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    this.renderer.drawBackground(ctx, w, h, this.camera.x * this.camera.scale, this.camera.y * this.camera.scale, this.level, this.globalTime);

    ctx.save();
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(-this.camera.x, -this.camera.y);

    this.renderer.drawWorld(ctx, this.world, this.level, this.globalTime, this.raceFinished);
    this.caterpillar.draw(ctx, this.globalTime);
    this.particles.draw(ctx);

    ctx.restore();
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.slipGripGame = new SlipGripGame();
});
