// js/levels.js — Cup races (4 themed cups × 3 races + a training level) and the cartoon renderer
import { GAMEPLAY_CONFIG } from './gameplayConfig.js';
import { surfaceKind } from './physics.js';

// Race data lives in courses.js; this module keeps the renderer
export { LEVEL_DEFINITIONS, TRAINING_LEVEL_INDEX, THEMES } from './courses.js';

// ==================== COMPLETE CARTOON TERRAIN, SCENERY & OBSTACLE RENDERER ====================
export class LevelRenderer {
  constructor() {
    this.spectators = [
      { type: 'ladybug', offsetX: -55, color: '#ff3838', phase: 0.2, size: 15 },
      { type: 'beetle',  offsetX: 48,  color: '#3867d6', phase: 1.4, size: 17 },
      { type: 'bee',     offsetX: -22, color: '#fed330', phase: 2.7, size: 14, flying: true },
      { type: 'ladybug', offsetX: 82,  color: '#ff5252', phase: 3.9, size: 14 },
      { type: 'beetle',  offsetX: 115, color: '#20bf6b', phase: 0.8, size: 16 }
    ];

    this.parallaxPacks = {};
    this.sprites = {};
    this.initParallaxPacks();
  }

  // Lazy-load and cache any sprite from assets/sprites/game/
  getSprite(relPath) {
    if (!relPath) return null;
    let entry = this.sprites[relPath];
    if (!entry) {
      const img = new Image();
      entry = { img, loaded: false, failed: false };
      img.onload = () => { entry.loaded = true; };
      img.onerror = () => { entry.failed = true; };
      img.src = `assets/sprites/game/${relPath}`;
      this.sprites[relPath] = entry;
    }
    return (entry.loaded && entry.img && entry.img.naturalWidth > 0) ? entry.img : null;
  }

  // Initialize and preload the multi-layered parallax background packs from assets
  initParallaxPacks() {
    const basePath = 'assets/backgrounds/';
    // Curated high-performance layers: keeps visual beauty and depth while cutting GPU fillrate by 60%!
    const packDefs = {
      game_background_1: [
        { file: 'sky.png', factorX: 0.0, factorY: 0.0, animSpeed: 0, alignBottom: false },
        { file: 'clouds_2.png', factorX: 0.04, factorY: 0.02, animSpeed: 14, alignBottom: false },
        { file: 'rocks_2.png', factorX: 0.22, factorY: 0.07, animSpeed: 0, alignBottom: true },
        { file: 'rocks_1.png', factorX: 0.36, factorY: 0.11, animSpeed: 0, alignBottom: true }
      ],
      game_background_2: [
        { file: 'sky.png', factorX: 0.0, factorY: 0.0, animSpeed: 0, alignBottom: false },
        { file: 'clouds_2.png', factorX: 0.05, factorY: 0.03, animSpeed: 16, alignBottom: false },
        { file: 'birds.png', factorX: 0.16, factorY: 0.04, animSpeed: 45, alignBottom: false, offsetY: -30 },
        { file: 'rocks_2.png', factorX: 0.26, factorY: 0.08, animSpeed: 0, alignBottom: true },
        { file: 'pines.png', factorX: 0.44, factorY: 0.13, animSpeed: 0, alignBottom: true }
      ],
      game_background_3: [
        { file: 'sky.png', factorX: 0.0, factorY: 0.0, animSpeed: 0, alignBottom: false },
        { file: 'clouds_1.png', factorX: 0.04, factorY: 0.02, animSpeed: 14, alignBottom: false },
        { file: 'rocks.png', factorX: 0.20, factorY: 0.06, animSpeed: 0, alignBottom: true },
        { file: 'plant.png', factorX: 0.30, factorY: 0.08, animSpeed: 0, alignBottom: true },
        { file: 'ground_2.png', factorX: 0.46, factorY: 0.12, animSpeed: 0, alignBottom: true }
      ],
      game_background_4: [
        { file: 'sky.png', factorX: 0.0, factorY: 0.0, animSpeed: 0, alignBottom: false },
        { file: 'clouds_1.png', factorX: 0.05, factorY: 0.02, animSpeed: 16, alignBottom: false },
        { file: 'rocks.png', factorX: 0.24, factorY: 0.07, animSpeed: 0, alignBottom: true },
        { file: 'ground.png', factorX: 0.42, factorY: 0.12, animSpeed: 0, alignBottom: true }
      ]
    };

    for (const [packName, layers] of Object.entries(packDefs)) {
      this.parallaxPacks[packName] = layers.map(layer => {
        const img = new Image();
        img.src = `${basePath}${packName}/layers/${layer.file}`;
        const item = {
          ...layer,
          img,
          loaded: false
        };
        img.onload = () => { item.loaded = true; };
        return item;
      });
    }

    // Add the new Ancient Forest 1920x1080 illustration for Coupe de la Fourmilière Royale
    const ancientImg = new Image();
    ancientImg.src = `${basePath}ancient_forest_1920x1080.jpg`;
    const ancientLayer = {
      file: 'sky.png',
      factorX: 0.14,
      factorY: 0.04,
      animSpeed: 0,
      alignBottom: false,
      // Busy painted backdrop: softened so the gameplay layer stays readable
      soften: 'blur(2.5px) saturate(0.7) brightness(0.72)',
      img: ancientImg,
      loaded: false
    };
    ancientImg.onload = () => { ancientLayer.loaded = true; };
    this.parallaxPacks.ancient_forest = [ancientLayer];

    // Hive cup: the mountain backdrop re-graded to warm amber (filter applied once, when cached)
    const AMBER = 'sepia(0.6) saturate(1.6) hue-rotate(-14deg) brightness(1.03)';
    this.parallaxPacks.hive_amber = this.parallaxPacks.game_background_1.map((src) => {
      const layer = { ...src, soften: AMBER, img: src.img };
      Object.defineProperty(layer, 'loaded', { get: () => src.loaded });
      return layer;
    });

    // Preload single pre-composited backgrounds for ultra-fast Eco Mode (1 single drawImage call, saving 90% GPU fillrate!)
    this.parallaxComposites = {};
    const compositeFiles = {
      game_background_1: 'game_background_1/game_background_1.png',
      game_background_2: 'game_background_2/game_background_2.png',
      game_background_3: 'game_background_3/game_background_3.1.png',
      game_background_4: 'game_background_4/game_background_4.png',
      ancient_forest: 'ancient_forest_1920x1080.jpg',
      hive_amber: 'game_background_1/game_background_1.png'
    };
    for (const [packName, file] of Object.entries(compositeFiles)) {
      const img = new Image();
      img.src = `${basePath}${file}`;
      const item = { img, loaded: false, soften: packName === 'hive_amber' ? AMBER : undefined };
      img.onload = () => { item.loaded = true; };
      this.parallaxComposites[packName] = item;
    }
  }

  // Returns the image pre-scaled to the given height. Scaling 1920x1080 sources on every
  // frame was the main rendering cost (~30 ms/frame); now it happens once per resize.
  getScaledImage(holder, img, drawH) {
    if (holder.scaled && holder.scaledH === drawH && holder.scaledSrc === img) return holder.scaled;
    const drawW = Math.round(drawH * (img.naturalWidth / img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = drawW;
    canvas.height = drawH;
    const c = canvas.getContext('2d');
    c.imageSmoothingQuality = 'high';
    if (holder.soften) c.filter = holder.soften;
    c.drawImage(img, 0, 0, drawW, drawH);
    holder.scaled = canvas;
    holder.scaledH = drawH;
    holder.scaledSrc = img;
    return canvas;
  }

  // Free the pre-scaled bitmaps of every background set except the active one
  releaseScaledBackgrounds(keepBgSet) {
    if (this.activeBgSet === keepBgSet) return;
    this.activeBgSet = keepBgSet;
    const holders = [];
    for (const [name, layers] of Object.entries(this.parallaxPacks || {})) {
      if (name !== keepBgSet) holders.push(...layers);
    }
    for (const [name, comp] of Object.entries(this.parallaxComposites || {})) {
      if (name !== keepBgSet) holders.push(comp);
    }
    for (const h of holders) h.scaled = null;
  }

  // Blit a pre-scaled image tiled horizontally, only the tiles that cover the screen
  drawTiledRow(ctx, scaled, width, scrollX, drawY) {
    const drawW = scaled.width;
    let startX = -Math.floor(((scrollX % drawW) + drawW) % drawW);
    for (let x = startX; x < width; x += drawW) {
      ctx.drawImage(scaled, x, drawY);
    }
  }

  // Draw an individual parallax image layer with horizontal wrapping and camera offsets
  drawParallaxLayer(ctx, layer, width, height, cameraX, cameraY, time) {
    if (!layer.loaded || !layer.img || layer.img.naturalWidth === 0) return false;
    if (height <= 0) return false;

    const scaled = this.getScaledImage(layer, layer.img, Math.round(height));
    const drawH = scaled.height;

    const animX = (layer.animSpeed || 0) * (time || 0);
    const scrollX = cameraX * (layer.factorX || 0) + animX;

    let drawY = 0;
    if (layer.alignBottom) {
      const camOffsetY = ((cameraY || 500) - 500) * (layer.factorY || 0.06);
      drawY = Math.round(height - drawH - camOffsetY);
    } else {
      const camOffsetY = ((cameraY || 500) - 500) * (layer.factorY || 0.02);
      drawY = Math.round(-camOffsetY + (layer.offsetY || 0));
    }

    this.drawTiledRow(ctx, scaled, width, scrollX, drawY);
    return true;
  }

  // Rich Multi-Layered Parallax Background adapted to each Level's Universe Theme!
  drawBackground(ctx, width, height, cameraX, cameraY, level, time) {
    const theme = level.theme || 'forest';
    const bgSet = level.bgSet || 'game_background_2';
    const bgMode = GAMEPLAY_CONFIG.backgroundMode || 'parallax';

    this.releaseScaledBackgrounds(bgSet);

    // ECO MODE: a single pre-composited image with gentle parallax
    if (bgMode === 'eco') {
      const comp = this.parallaxComposites ? this.parallaxComposites[bgSet] : null;
      if (comp && comp.loaded && comp.img && comp.img.naturalWidth > 0 && height > 0) {
        const scaled = this.getScaledImage(comp, comp.img, Math.round(height));
        this.drawTiledRow(ctx, scaled, width, cameraX * 0.12, 0);
        return;
      }
    }

    const pack = this.parallaxPacks ? this.parallaxPacks[bgSet] : null;
    const hasSkyImage = pack && pack.length > 0 && pack[0].file === 'sky.png' && pack[0].loaded;

    // 1. Sky Gradient base: only draw if sky.png is NOT loaded (eliminates 100% redundant overdraw!)
    if (!hasSkyImage) {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, level.skyTop);
      grad.addColorStop(1, level.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    let drawnAnyParallax = false;

    // 2. Sky Parallax Layer
    if (pack && pack.length > 0 && pack[0].file === 'sky.png') {
      if (this.drawParallaxLayer(ctx, pack[0], width, height, cameraX, cameraY, time)) {
        drawnAnyParallax = true;
      }
    }

    // 3. Sun / Magical Glow & Sunbeams
    if (bgMode !== 'minimal') {
      ctx.save();
      ctx.fillStyle = theme === 'mushroom' ? 'rgba(220, 190, 255, 0.40)' : 'rgba(255, 250, 200, 0.40)';
      // No sun disk under the forest canopy (the painted backdrop has its own light)
      if (bgSet !== 'ancient_forest') {
        ctx.beginPath();
        ctx.arc(width * 0.82, height * 0.18, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 253, 215, 0.14)';
      for (let i = 0; i < 4; i++) {
        const bx = ((i * 480 - cameraX * 0.05) % (width + 500) + (width + 500)) % (width + 500) - 250;
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx + 120, 0);
        ctx.lineTo(bx + 320, height);
        ctx.lineTo(bx + 150, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Parallax Intermediate Layers (Curated, high-performance layers)
    if (pack && pack.length > 1) {
      for (let i = 1; i < pack.length; i++) {
        if (this.drawParallaxLayer(ctx, pack[i], width, height, cameraX, cameraY, time)) {
          drawnAnyParallax = true;
        }
      }
    }

    // 5. Procedural cartoon hills fallback if parallax images are still loading
    if (!drawnAnyParallax) {
      ctx.save();
      const farShift = cameraX * 0.12;
      const hillPalettes = {
        forest:       { fill: '#74c668', stroke: '#3b7a33', bush: '#4ca644' },
        garden:       { fill: '#80d472', stroke: '#418538', bush: '#52b548' },
        canopy:       { fill: '#58b368', stroke: '#276332', bush: '#3a8f49' },
        mushroom:     { fill: '#a29bfe', stroke: '#5f27cd', bush: '#6c5ce7' },
        marsh:        { fill: '#63cdda', stroke: '#106e7d', bush: '#3dc1d3' },
        hive:         { fill: '#f6b93b', stroke: '#b76e11', bush: '#e58e26' },
        picnic_easy:  { fill: '#f8a5c2', stroke: '#b33951', bush: '#e66767' },
        picnic_table: { fill: '#f2b880', stroke: '#b56e35', bush: '#e08e55' },
        picnic_chaos: { fill: '#e17055', stroke: '#8c2d19', bush: '#d63031' }
      };
      const pal = hillPalettes[theme] || hillPalettes.forest;

      ctx.fillStyle = pal.fill;
      ctx.strokeStyle = pal.stroke;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-50, height);
      for (let x = -50; x <= width + 100; x += 60) {
        const worldX = x + farShift;
        const hy = height * 0.62 + Math.sin(worldX * 0.003) * 55 + Math.cos(worldX * 0.007) * 28;
        ctx.lineTo(x, hy);
      }
      ctx.lineTo(width + 100, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mid-parallax silhouettes
      const midShift = cameraX * 0.24;
      for (let i = -1; i < 12; i++) {
        const tx = i * 340 - (midShift % 340);
        if (theme === 'forest' || theme === 'canopy') {
          ctx.fillStyle = 'rgba(107, 68, 35, 0.35)';
          ctx.fillRect(tx, height * 0.08, 68, height * 0.68);
          ctx.fillStyle = 'rgba(58, 125, 52, 0.38)';
          ctx.beginPath();
          ctx.arc(tx + 34, height * 0.15, 115, 0, Math.PI * 2);
          ctx.arc(tx - 30, height * 0.22, 82, 0, Math.PI * 2);
          ctx.arc(tx + 95, height * 0.22, 85, 0, Math.PI * 2);
          ctx.fill();
        } else if (theme === 'garden') {
          ctx.fillStyle = 'rgba(92, 148, 71, 0.32)';
          ctx.fillRect(tx, height * 0.15, 22, height * 0.6);
          ctx.fillStyle = 'rgba(235, 64, 52, 0.35)';
          ctx.beginPath();
          ctx.arc(tx + 45, height * 0.34, 42, 0, Math.PI * 2);
          ctx.arc(tx - 35, height * 0.44, 36, 0, Math.PI * 2);
          ctx.fill();
        } else if (theme === 'mushroom') {
          ctx.fillStyle = 'rgba(245, 230, 255, 0.42)';
          ctx.fillRect(tx + 18, height * 0.28, 36, height * 0.45);
          ctx.fillStyle = 'rgba(253, 121, 168, 0.36)';
          ctx.beginPath();
          ctx.arc(tx + 36, height * 0.28, 92, Math.PI, 0);
          ctx.fill();
        } else if (theme === 'marsh') {
          ctx.fillStyle = 'rgba(20, 110, 95, 0.32)';
          ctx.fillRect(tx + 20, height * 0.16, 12, height * 0.6);
          ctx.fillStyle = 'rgba(110, 65, 30, 0.40)';
          ctx.beginPath();
          ctx.roundRect(tx + 14, height * 0.20, 24, 65, 12);
          ctx.fill();
        } else if (theme === 'hive') {
          ctx.fillStyle = 'rgba(243, 156, 18, 0.28)';
          ctx.beginPath();
          ctx.arc(tx + 40, height * 0.28, 78, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(209, 73, 56, 0.25)';
          ctx.beginPath();
          ctx.roundRect(tx, height * 0.32, 95, 160, 18);
          ctx.fill();
        }
      }
      ctx.restore();

      // Bushy foliage
      ctx.save();
      const nearShift = cameraX * 0.38;
      ctx.fillStyle = pal.bush;
      ctx.strokeStyle = pal.stroke;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-60, height);
      for (let x = -60; x <= width + 120; x += 80) {
        const wx = x + nearShift;
        const by = height * 0.78 + Math.sin(wx * 0.008) * 32;
        ctx.quadraticCurveTo(x - 40, by - 28, x, by);
      }
      ctx.lineTo(width + 120, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawWorld(ctx, world, level, time, isVictory) {
    // 0. Draw Buoyant Water Zones (Forest Ponds & Deep Pools) behind terrain edges
    if (world.waterZones && world.waterZones.length > 0) {
      this.drawWaterZones(ctx, world, time);
    }

    // 0b. Backdrop props of the cup's world, planted behind the ground crust
    for (const dec of world.decorations) {
      if (dec.type.startsWith('bg_')) this.drawScenery(ctx, dec, time);
    }

    // 1. Draw Complete Filled Cartoon Terrain Masses
    for (const chain of world.terrainChains) {
      if (chain.isGroundMass) {
        this.drawCompleteTerrainMass(ctx, chain, time, level);
      }
    }

    // 1b. Slippery / sticky ground overlays in their own pass, so a neighbouring ground
    //     mass drawn later can't hide a sticky wall standing at its edge
    for (const chain of world.terrainChains) {
      if (!chain.isGroundMass) continue;
      const kind = surfaceKind(chain.material);
      if (kind !== 'normal') this.drawGroundKindOverlay(ctx, chain.points, kind, time);
    }

    // 2. Draw Background Scenic & Interactive Decorations
    for (const dec of world.decorations) {
      if (!dec.type.startsWith('bg_')) this.drawDecoration(ctx, dec, time, world);
    }

    // 3. Draw Elevated Structures (Branches, Tomato vines, Silk bridges, Mushroom caps, Reeds, Honeycombs, Straws, Cans, Forks)
    for (const chain of world.terrainChains) {
      if (!chain.isGroundMass) {
        this.drawElevatedStructure(ctx, chain, time);
      }
    }

    // 3b. Draw Golden Sap Cascades (Cascades de Sève)
    if (world.sapCascades && world.sapCascades.length > 0) {
      this.drawSapCascades(ctx, world, time);
    }

    // 4. Draw Dynamic Platforms (Leaves, Hoses, Lilypads, Silk Swings, Turnstiles)
    for (const plat of world.dynamicPlatforms) {
      this.drawDynamicPlatform(ctx, plat, time);
    }

    // 5. Draw Checkpoints
    for (const cp of world.checkpoints) {
      this.drawCheckpoint(ctx, cp, time);
    }

    // 6. Draw Sticky Traps (Jam, Sap, Honey, Web)
    for (const c of world.stickyCrumbs) {
      this.drawStickyCrumb(ctx, c, time);
    }

    // 6b. Draw Prickly Thorn Bushes (Ronces)
    if (world.thorns) {
      for (const thorn of world.thorns) {
        this.drawThorn(ctx, thorn, time);
      }
    }

    // 6c. Draw Periodic Water Drops & Falling Burning Embers
    if (world.waterDrops && world.waterDrops.length > 0) {
      this.drawWaterDrops(ctx, world, time);
    }

    // 7. Draw Bouncy Mushrooms
    for (const m of world.mushrooms) {
      this.drawMushroom(ctx, m, time);
    }

    // 8. Draw Soft Squishy Aphids
    for (const a of world.aphids) {
      this.drawAphid(ctx, a, time);
      this.drawEnemyHealthBar(ctx, a);
    }

    // 8b. Draw Hedgehogs (Hérissons)
    for (const h of world.hedgehogs) {
      this.drawHedgehog(ctx, h, time);
      this.drawEnemyHealthBar(ctx, h);
    }

    // 8c. Draw Warrior Ants (Fourmis Guerrières)
    if (world.ants) {
      for (const ant of world.ants) {
        this.drawAnt(ctx, ant, time);
        this.drawEnemyHealthBar(ctx, ant);
      }
    }

    // 8d. Draw Power-Up Collectibles
    if (world.powerUps) {
      for (const p of world.powerUps) {
        this.drawPowerUp(ctx, p, time);
      }
    }

    // 9. Draw Grabbable Dynamic Acorns (Glands) & Pinecones (Pommes de pin)
    for (const prop of world.props) {
      this.drawGrabbableProp(ctx, prop, time);
      if (prop.type === 'acorn') {
        this.drawEnemyHealthBar(ctx, prop);
      }
    }

    // 9b. Draw Bonus Apples (Red Heal +20 HP from acorns & Golden-Green +1 Segment from enemies!)
    if (world.apples) {
      for (const apple of world.apples) {
        if (!apple.collected) {
          this.drawBonusApple(ctx, apple, time);
        }
      }
    }

    // 10. Start & Finish Banners
    this.drawStartBanner(ctx, level.startX - 40, level.startY);
    this.drawFinishLine(ctx, level.finishX, level.finishY, time, isVictory);
  }

  drawWaterZones(ctx, world, time) {
    for (const wz of world.waterZones) {
      ctx.save();
      const grad = ctx.createLinearGradient(wz.x, wz.y, wz.x, wz.y + wz.height);
      grad.addColorStop(0, 'rgba(38, 222, 129, 0.52)');
      grad.addColorStop(0.25, 'rgba(0, 184, 148, 0.68)');
      grad.addColorStop(0.75, 'rgba(9, 132, 227, 0.78)');
      grad.addColorStop(1, 'rgba(6, 82, 221, 0.88)');

      // Water body with animated wavy surface
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(wz.x, wz.y + wz.height);
      ctx.lineTo(wz.x, wz.y);
      const waveStep = 28;
      for (let wx = wz.x; wx <= wz.x + wz.width; wx += waveStep) {
        const wy = wz.y + Math.sin(time * 3.6 + wx * 0.035) * 5.5 + Math.cos(time * 2.2 - wx * 0.02) * 3.0;
        ctx.lineTo(Math.min(wz.x + wz.width, wx), wy);
      }
      ctx.lineTo(wz.x + wz.width, wz.y + wz.height);
      ctx.closePath();
      ctx.fill();

      // Sunlit underwater caustic rays & rising air bubbles
      ctx.save();
      ctx.clip();
      ctx.fillStyle = 'rgba(184, 255, 240, 0.16)';
      for (let rx = wz.x + 40; rx < wz.x + wz.width - 40; rx += 130) {
        const sway = Math.sin(time * 1.5 + rx * 0.01) * 24;
        ctx.beginPath();
        ctx.moveTo(rx, wz.y - 10);
        ctx.lineTo(rx + 45, wz.y - 10);
        ctx.lineTo(rx + 85 + sway, wz.y + wz.height);
        ctx.lineTo(rx + 15 + sway, wz.y + wz.height);
        ctx.closePath();
        ctx.fill();
      }

      // Floating buoyancy bubbles
      ctx.fillStyle = 'rgba(220, 255, 255, 0.55)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      for (let bx = wz.x + 35; bx < wz.x + wz.width - 25; bx += 75) {
        const by = wz.y + wz.height - ((time * 42 + bx * 1.7) % (wz.height - 18));
        const br = 3.5 + (bx % 4);
        ctx.beginPath();
        ctx.arc(bx + Math.sin(time * 3 + by * 0.05) * 6, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Shimmering turquoise-white surface foam crest
      ctx.strokeStyle = '#a8fff0';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let wx = wz.x; wx <= wz.x + wz.width; wx += waveStep) {
        const wy = wz.y + Math.sin(time * 3.6 + wx * 0.035) * 5.5 + Math.cos(time * 2.2 - wx * 0.02) * 3.0;
        if (wx === wz.x) ctx.moveTo(wx, wy);
        else ctx.lineTo(Math.min(wz.x + wz.width, wx), wy);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  drawCompleteTerrainMass(ctx, chain, time, level) {
    const pts = chain.points;
    if (pts.length < 2) return;

    const first = pts[0];
    const last = pts[pts.length - 1];
    const bottomY = 1350;
    const theme = (level && level.theme) || 'forest';

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(first[0], bottomY);
    for (const p of pts) {
      ctx.lineTo(p[0], p[1]);
    }
    ctx.lineTo(last[0], bottomY);
    ctx.closePath();

    const pal = level && level.palette;
    const earthGrad = ctx.createLinearGradient(0, 350, 0, 950);
    if (pal) {
      earthGrad.addColorStop(0, pal.earth[0]);
      earthGrad.addColorStop(0.35, pal.earth[1]);
      earthGrad.addColorStop(1, pal.earth[2]);
    } else if (theme === 'mushroom') {
      earthGrad.addColorStop(0, '#6c4b82');
      earthGrad.addColorStop(0.35, '#4b3260');
      earthGrad.addColorStop(1, '#2c1b3d');
    } else if (theme === 'marsh') {
      earthGrad.addColorStop(0, '#4f6d5a');
      earthGrad.addColorStop(0.35, '#374f40');
      earthGrad.addColorStop(1, '#1e2e24');
    } else if (theme === 'hive') {
      earthGrad.addColorStop(0, '#9c6624');
      earthGrad.addColorStop(0.35, '#784b15');
      earthGrad.addColorStop(1, '#4a2c0a');
    } else {
      earthGrad.addColorStop(0, '#8c5828');
      earthGrad.addColorStop(0.35, '#6e421c');
      earthGrad.addColorStop(1, '#47290f');
    }
    ctx.fillStyle = earthGrad;
    ctx.fill();

    ctx.save();
    ctx.clip();

    // Rich organic sub-soil shadow band right under the crust
    ctx.strokeStyle = 'rgba(28, 14, 4, 0.42)';
    ctx.lineWidth = 34;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const px = pts[i][0];
      const py = pts[i][1] + 20;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Geological strata waves
    ctx.strokeStyle = 'rgba(35, 18, 6, 0.30)';
    ctx.lineWidth = 18;
    for (let band = 1; band <= 4; band++) {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const px = pts[i][0];
        const py = pts[i][1] + band * 75 + Math.sin(px * 0.015 + band) * 14;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    const minX = Math.min(first[0], last[0]);
    const maxX = Math.max(first[0], last[0]);
    for (let x = minX + 40; x < maxX - 30; x += 65) {
      const hash = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
      const hash2 = Math.abs(Math.cos(x * 78.233) * 19341.123) % 1;

      let surfY = 500;
      for (let i = 0; i < pts.length - 1; i++) {
        if (x >= pts[i][0] && x <= pts[i + 1][0]) {
          const t = (x - pts[i][0]) / ((pts[i + 1][0] - pts[i][0]) || 1);
          surfY = pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
          break;
        }
      }

      const pebbleY = surfY + 42 + hash * 140;
      const pebbleR = 8 + hash2 * 13;

      ctx.fillStyle = hash > 0.5 ? 'rgba(255,235,205,0.14)' : 'rgba(0,0,0,0.24)';
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(x, pebbleY, pebbleR * 1.25, pebbleR * 0.85, (hash - 0.5) * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Subterranean root tendrils woven into the soil
      if (hash > 0.62) {
        ctx.strokeStyle = 'rgba(92, 52, 22, 0.45)';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(x - 14, surfY + 14);
        ctx.quadraticCurveTo(x + (hash2 - 0.5) * 30, surfY + 48, x + (hash - 0.5) * 40, surfY + 85);
        ctx.stroke();
      }
    }

    ctx.restore();

    // 2. Top Surface Crust. Physics reads at a glance whatever the theme:
    //    slippery = wet teal & dew, sticky = honey amber & drips, normal = the cup's own crust
    const kind = surfaceKind(chain.material);
    const isMoss = kind === 'slippery';
    const isAmber = kind === 'sticky';
    const isBark = !pal && chain.material === 'root';

    let crustMain = '#4ec932';
    let crustRim = '#8cf562';
    if (isMoss) {
      crustMain = '#1dd1a1';
      crustRim = '#a8fff0';
    } else if (isAmber) {
      crustMain = '#f39c12';
      crustRim = '#ffeaa7';
    } else if (isBark) {
      crustMain = '#8c5223';
      crustRim = '#c98850';
    } else if (pal) {
      crustMain = pal.crust;
      crustRim = pal.rim;
    } else if (theme === 'mushroom') {
      crustMain = '#68d391';
      crustRim = '#b2f5ea';
    } else if (theme === 'hive') {
      crustMain = '#88d428';
      crustRim = '#d4ff70';
    }

    ctx.strokeStyle = '#261507';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();

    ctx.strokeStyle = crustMain;
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();

    ctx.strokeStyle = crustRim;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] - 4);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 4);
    ctx.stroke();

    // 3. Detailed Surface Micro-Vegetation & Material Markings
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const segDx = p2[0] - p1[0];
      const segDy = p2[1] - p1[1];
      const segLen = Math.hypot(segDx, segDy);
      if (segLen < 20 || Math.abs(segDx) < 20) continue;

      const steps = Math.floor(segLen / 42);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const gx = p1[0] + segDx * t;
        const gy = p1[1] + segDy * t - 10;
        const sway = Math.sin(time * 2.8 + gx * 0.04) * 3.2;

        if (isMoss) {
          // Fluffy moss cushion & shimmering dew drop
          ctx.fillStyle = '#10ac84';
          ctx.beginPath();
          ctx.arc(gx - 5, gy + 3, 6, Math.PI, 0);
          ctx.arc(gx + 4, gy + 3, 5, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = 'rgba(215, 255, 252, 0.90)';
          ctx.beginPath();
          ctx.arc(gx + sway * 0.4, gy - 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (isAmber) {
          // Golden resin facets & honey drips hanging off the crust
          ctx.fillStyle = 'rgba(255, 242, 175, 0.78)';
          ctx.beginPath();
          ctx.roundRect(gx - 8, gy + 1, 16, 5, 2.5);
          ctx.fill();
          if (s % 2 === 0) {
            const drip = 8 + ((gx * 7) % 11) + Math.sin(time * 1.6 + gx) * 2;
            ctx.fillStyle = '#f0a020';
            ctx.beginPath();
            ctx.moveTo(gx - 4, gy + 18);
            ctx.quadraticCurveTo(gx - 3, gy + 18 + drip, gx, gy + 20 + drip);
            ctx.quadraticCurveTo(gx + 3, gy + 18 + drip, gx + 4, gy + 18);
            ctx.fill();
          }
        } else if (pal && pal.grass === 'none') {
          // Bare crust (stone, wax…): small surface marks only
          if (s % 2 === 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.beginPath();
            ctx.ellipse(gx, gy + 8, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (pal && pal.grass === 'clover' && s % 2 === 0) {
          ctx.fillStyle = pal.blade || '#3fbf8f';
          for (const [ox, oy] of [[-3, -2], [3, -2], [0, -6]]) {
            ctx.beginPath();
            ctx.arc(gx + ox + sway * 0.3, gy + oy, 3.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isBark) {
          // Wood grain notches along the bark ridge
          ctx.strokeStyle = '#3d200a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(gx - 8, gy + 4);
          ctx.quadraticCurveTo(gx, gy + 1, gx + 8, gy + 5);
          ctx.stroke();
        } else {
          // Animated swaying grass blades & occasional mini clover
          ctx.strokeStyle = (pal && pal.blade) || '#2d8a18';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(gx, gy + 3);
          ctx.quadraticCurveTo(gx - 3, gy - 4, gx - 6 + sway, gy - 9);
          ctx.moveTo(gx, gy + 3);
          ctx.quadraticCurveTo(gx + 2, gy - 5, gx + 5 + sway, gy - 10);
          ctx.stroke();

          if ((s % 3) === 0) {
            ctx.fillStyle = '#7bed9f';
            ctx.beginPath();
            ctx.arc(gx + sway, gy - 11, 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    ctx.restore();
  }

  // Draw Elevated Structures (root, stem, silk, mushroom_cap, reed, honeycomb, moss, straw, can, plastic, fork)
  // Always thick (caterpillar-scale branches: 48..64px), richly textured and visually unmistakable!
  // Small deterministic PRNG so decorations vary per chain but never flicker
  seededRandom(seed) {
    let a = (seed * 2654435761) >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Polyline offset along per-vertex normals that point "up" (toward the light)
  offsetPolyline(pts, d) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const tx = b[0] - a[0];
      const ty = b[1] - a[1];
      const len = Math.hypot(tx, ty) || 1;
      let nx = ty / len;
      let ny = -tx / len;
      if (ny > 0 || (Math.abs(ny) < 0.05 && nx > 0)) { nx = -nx; ny = -ny; }
      out.push([pts[i][0] + nx * d, pts[i][1] + ny * d]);
    }
    return out;
  }

  strokePolyline(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }

  // Bark branch with volume lit from above, longitudinal grain, knots, cut ends,
  // patchy moss and a soft contact shadow. W is the full drawn width (= collision width).
  drawBarkBranch(ctx, chain, pts, W, time, isMostlyHorizontal) {
    const rand = this.seededRandom(chain.id || 1);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Soft contact shadow cast below
    ctx.strokeStyle = 'rgba(20, 10, 0, 0.16)';
    ctx.lineWidth = W * 0.75;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + W * 0.6);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + W * 0.6);
    ctx.stroke();

    // Outline and base wood
    ctx.strokeStyle = '#2a1608';
    ctx.lineWidth = W;
    this.strokePolyline(ctx, pts);
    ctx.strokeStyle = '#6b3d1a';
    ctx.lineWidth = W - 7;
    this.strokePolyline(ctx, pts);

    // Shaded underside and lit top (offset along the normal, so it works on slopes too)
    ctx.strokeStyle = '#4b2810';
    ctx.lineWidth = W * 0.4;
    this.strokePolyline(ctx, this.offsetPolyline(pts, -W * 0.2));
    ctx.strokeStyle = '#94592a';
    ctx.lineWidth = W * 0.34;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.16));
    ctx.strokeStyle = 'rgba(232, 170, 104, 0.55)';
    ctx.lineWidth = 3;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.33));

    // Longitudinal bark grain: broken lines following the branch
    ctx.strokeStyle = 'rgba(42, 20, 6, 0.42)';
    ctx.lineWidth = 1.6;
    for (const off of [-0.24, -0.08, 0.06, 0.22]) {
      const dash = 18 + rand() * 30;
      ctx.setLineDash([dash, 8 + rand() * 18, dash * 0.4, 6 + rand() * 10]);
      ctx.lineDashOffset = rand() * 60;
      this.strokePolyline(ctx, this.offsetPolyline(pts, W * off));
    }
    ctx.setLineDash([]);

    // Knots
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const count = Math.floor(len / 170 + rand());
      for (let k = 0; k < count; k++) {
        const t = 0.15 + rand() * 0.7;
        const side = (rand() - 0.5) * W * 0.35;
        const kx = x1 + (x2 - x1) * t - Math.sin(ang) * side;
        const ky = y1 + (y2 - y1) * t + Math.cos(ang) * side;
        const kr = W * (0.1 + rand() * 0.07);
        ctx.fillStyle = '#3a1f0a';
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr * 1.6, kr, ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(160, 104, 52, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr * 2.2, kr * 1.45, ang, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Cut ends: show the pale wood rings where a branch stops in mid-air
    const ends = [[pts[0], pts[1]], [pts[pts.length - 1], pts[pts.length - 2]]];
    for (const [end, prev] of ends) {
      const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
      ctx.save();
      ctx.translate(end[0], end[1]);
      ctx.rotate(ang);
      ctx.fillStyle = '#d6a66a';
      ctx.strokeStyle = '#2a1608';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(W * 0.08, 0, W * 0.2, W * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(122, 76, 34, 0.75)';
      ctx.lineWidth = 1.3;
      for (const f of [0.68, 0.4]) {
        ctx.beginPath();
        ctx.ellipse(W * 0.08, 0, W * 0.2 * f, W * 0.44 * f, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Patchy moss on top of horizontal branches (grip cue) + leafy twigs
    if (isMostlyHorizontal) {
      const top = this.offsetPolyline(pts, W * 0.42);
      for (let i = 0; i < top.length - 1; i++) {
        const [x1, y1] = top[i];
        const [x2, y2] = top[i + 1];
        const len = Math.hypot(x2 - x1, y2 - y1);
        let t = rand() * 0.1;
        while (t < 1) {
          const patch = Math.min(1 - t, (40 + rand() * 90) / len);
          const ax = x1 + (x2 - x1) * t;
          const ay = y1 + (y2 - y1) * t;
          const bx = x1 + (x2 - x1) * (t + patch);
          const by = y1 + (y2 - y1) * (t + patch);
          ctx.strokeStyle = '#3e8f2a';
          ctx.lineWidth = 9 + rand() * 4;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
          ctx.strokeStyle = '#7bd34f';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(ax, ay - 2);
          ctx.lineTo(bx, by - 2);
          ctx.stroke();
          t += patch + (30 + rand() * 120) / len;
        }
        // Leafy twig now and then
        if (len > 120 && rand() < 0.7) {
          const tt = 0.2 + rand() * 0.6;
          const lx = x1 + (x2 - x1) * tt;
          const ly = y1 + (y2 - y1) * tt;
          const sway = Math.sin(time * 2.4 + lx * 0.03) * 0.12;
          const dir = rand() < 0.5 ? -1 : 1;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(dir * (0.5 + rand() * 0.4) + sway);
          ctx.strokeStyle = '#4a2a10';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(dir * 6, -14, dir * 4, -26);
          ctx.stroke();
          for (const [ly2, sz] of [[-14, 0.8], [-26, 1]]) {
            ctx.fillStyle = rand() < 0.5 ? '#5bc43b' : '#48a92f';
            ctx.strokeStyle = '#1d4a15';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(dir * 10 * sz, ly2, 11 * sz, 5 * sz, dir * -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  drawElevatedStructure(ctx, chain, time) {
    const look = chain.look || chain.material;
    if (look === 'waxbeam') this.drawWaxBeam(ctx, chain, time);
    else if (look === 'stone') this.drawStoneSlab(ctx, chain, time);
    else this.drawElevatedLook(ctx, chain, time);
    const kind = surfaceKind(chain.material);
    if (kind === 'slippery' && look !== 'moss') this.drawWetOverlay(ctx, chain, time);
    if (kind === 'sticky' && look !== 'honeycomb') this.drawHoneyOverlay(ctx, chain, time);
  }

  // Ground crust overlay for slippery / sticky ground, drawn along every segment so
  // vertical walls read as clearly as floors
  drawGroundKindOverlay(ctx, pts, kind, time) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (kind === 'sticky') {
      ctx.strokeStyle = '#9a5a08';
      ctx.lineWidth = 30;
      this.strokePolyline(ctx, pts);
      ctx.strokeStyle = '#f0a020';
      ctx.lineWidth = 24;
      this.strokePolyline(ctx, pts);
      ctx.strokeStyle = 'rgba(255, 228, 140, 0.9)';
      ctx.lineWidth = 2;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, y2 - y1);
        for (let d = 10; d < len - 6; d += 20) {
          const cx = x1 + (x2 - x1) * (d / len);
          const cy = y1 + (y2 - y1) * (d / len);
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k;
            if (k === 0) ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
            else ctx.lineTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    } else {
      ctx.strokeStyle = '#0f6b78';
      ctx.lineWidth = 28;
      this.strokePolyline(ctx, pts);
      ctx.strokeStyle = '#3ec1d3';
      ctx.lineWidth = 22;
      this.strokePolyline(ctx, pts);
      ctx.strokeStyle = 'rgba(235, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      this.strokePolyline(ctx, this.offsetPolyline(pts, 6));
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, y2 - y1);
        for (let d = 18; d < len; d += 34) {
          const cx = x1 + (x2 - x1) * (d / len);
          const cy = y1 + (y2 - y1) * (d / len);
          const r = 3 + Math.sin(time * 2.5 + d) * 0.5;
          ctx.fillStyle = 'rgba(210, 250, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(cx, cy - 2, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // Backdrop props (no physics): each cup's world gets its own silhouettes
  drawScenery(ctx, dec, time) {
    const s = dec.scale || 1;
    const sway = Math.sin(time * 1.2 + dec.x * 0.01) * 0.04;
    ctx.save();
    ctx.translate(dec.x, dec.y);
    ctx.scale(s, s);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const leafy = (cx, cy, rx, ry, rot, fill, line) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = line;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    switch (dec.type) {
      case 'bg_lettuce': {
        const shades = ['#3f8f2c', '#4fa83a', '#62c046', '#7fd65a'];
        for (let k = 0; k < 7; k++) {
          const a = -Math.PI + (k / 6) * Math.PI;
          leafy(Math.cos(a) * 46, -40 + Math.sin(a) * 30, 46, 34, a + sway, shades[k % 4], '#1f4d16');
        }
        leafy(0, -62, 40, 36, sway, '#9be27a', '#1f4d16');
        ctx.strokeStyle = 'rgba(31, 77, 22, 0.5)';
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.quadraticCurveTo(k * 18, -60, k * 30, -90);
          ctx.stroke();
        }
        break;
      }
      case 'bg_tomato_plant': {
        ctx.strokeStyle = '#7a5230';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(14, 10);
        ctx.lineTo(14, -260);
        ctx.stroke();
        ctx.strokeStyle = '#2f7a24';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        for (let y = -20; y > -250; y -= 40) ctx.quadraticCurveTo(-26, y + 20, 0 + Math.sin(time + y) * 2, y);
        ctx.stroke();
        for (let y = -40; y > -240; y -= 55) {
          leafy(-24, y, 22, 10, -0.4 + sway, '#3f9a2f', '#1f4d16');
          leafy(22, y - 20, 20, 9, 0.5 - sway, '#4fae3a', '#1f4d16');
        }
        for (const [tx, ty, r] of [[-14, -90, 17], [10, -150, 15], [-8, -205, 13], [18, -110, 12]]) {
          ctx.fillStyle = '#e8402f';
          ctx.strokeStyle = '#7a1a10';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(tx, ty, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.beginPath();
          ctx.arc(tx - r * 0.35, ty - r * 0.35, r * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2f7a24';
          ctx.beginPath();
          ctx.arc(tx, ty - r, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'bg_carrot': {
        ctx.fillStyle = '#f08a24';
        ctx.strokeStyle = '#7a3a08';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-26, 0);
        ctx.lineTo(26, 0);
        ctx.lineTo(18, -30);
        ctx.lineTo(-18, -30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#3f9a2f';
        ctx.lineWidth = 4;
        for (let k = -3; k <= 3; k++) {
          ctx.beginPath();
          ctx.moveTo(k * 3, -30);
          ctx.quadraticCurveTo(k * 14, -80, k * 20 + sway * 60, -120 - Math.abs(k) * -6);
          ctx.stroke();
        }
        break;
      }
      case 'bg_trunk': {
        ctx.fillStyle = '#3a2512';
        ctx.strokeStyle = '#1b1008';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-90, 20);
        ctx.quadraticCurveTo(-60, -20, -55, -120);
        ctx.lineTo(-50, -900);
        ctx.lineTo(50, -900);
        ctx.lineTo(55, -120);
        ctx.quadraticCurveTo(60, -20, 95, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(120, 80, 40, 0.45)';
        ctx.lineWidth = 3;
        for (const off of [-30, -8, 16, 34]) {
          ctx.beginPath();
          ctx.moveTo(off, -20);
          ctx.quadraticCurveTo(off + 6, -400, off - 4, -880);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(70, 140, 50, 0.55)';
        ctx.beginPath();
        ctx.ellipse(-30, -300, 26, 60, 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bg_big_fern': {
        ctx.strokeStyle = '#1f5a20';
        for (let k = -3; k <= 3; k++) {
          const ang = -Math.PI / 2 + k * 0.32 + sway * 2;
          const len = 150 - Math.abs(k) * 18;
          const ex = Math.cos(ang) * len;
          const ey = Math.sin(ang) * len;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(ex * 0.4, ey * 0.7, ex, ey);
          ctx.stroke();
          ctx.lineWidth = 3;
          for (let t = 0.2; t < 1; t += 0.12) {
            const px = ex * t;
            const py = ey * t + (1 - t) * ey * 0.15;
            const lf = 22 * (1 - t) + 6;
            ctx.strokeStyle = t > 0.5 ? '#3f8f2c' : '#2f7a24';
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - lf, py - lf * 0.4);
            ctx.moveTo(px, py);
            ctx.lineTo(px + lf, py - lf * 0.4);
            ctx.stroke();
          }
        }
        break;
      }
      case 'bg_glow_cluster': {
        for (const [mx, h, r, col] of [[-30, 60, 22, '#5ff2d6'], [0, 90, 28, '#7cf7ff'], [30, 50, 18, '#b48cff']]) {
          const glow = 0.5 + Math.sin(time * 2 + mx) * 0.2;
          ctx.fillStyle = `rgba(150, 255, 240, ${0.18 * glow})`;
          ctx.beginPath();
          ctx.arc(mx, -h, r * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e8e0c8';
          ctx.fillRect(mx - 4, -h, 8, h);
          ctx.fillStyle = col;
          ctx.strokeStyle = '#1c3b3a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(mx, -h, r, r * 0.6, 0, Math.PI, 0);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }
      case 'bg_comb': {
        const R = 20;
        const w = R * Math.sqrt(3);
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 4; col++) {
            const cx = (col - 1.5) * w + (row % 2) * w * 0.5;
            const cy = -30 - row * R * 1.5;
            const filled = ((row * 7 + col * 3 + Math.round(dec.x)) % 5) < 2;
            ctx.fillStyle = filled ? '#f0a020' : '#f6dc94';
            ctx.strokeStyle = '#9a6418';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              const a = Math.PI / 6 + (Math.PI / 3) * k;
              if (k === 0) ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
              else ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (filled) {
              ctx.fillStyle = 'rgba(255, 245, 200, 0.6)';
              ctx.beginPath();
              ctx.arc(cx - 5, cy - 5, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        break;
      }
      case 'bg_bee': {
        const bx = Math.sin(time * 0.9 + dec.x) * 60;
        const by = -170 + Math.sin(time * 2.1 + dec.x) * 25;
        ctx.translate(bx, by);
        const flap = Math.sin(time * 40) * 0.5;
        ctx.fillStyle = 'rgba(230, 245, 255, 0.8)';
        ctx.strokeStyle = '#5a6b7a';
        ctx.lineWidth = 1.5;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(side * 6, -12, 8, 13, side * (0.5 + flap), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = '#f6c21a';
        ctx.strokeStyle = '#2a1a05';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2a1a05';
        ctx.fillRect(-5, -10, 4, 20);
        ctx.fillRect(4, -10, 4, 20);
        break;
      }
      case 'bg_night_flower': {
        ctx.strokeStyle = '#3f7a2a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.quadraticCurveTo(-14, -80, 4 + sway * 80, -170);
        ctx.stroke();
        const glow = 0.6 + Math.sin(time * 1.5 + dec.x) * 0.2;
        ctx.fillStyle = `rgba(220, 230, 255, ${0.2 * glow})`;
        ctx.beginPath();
        ctx.arc(4, -172, 46, 0, Math.PI * 2);
        ctx.fill();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k + time * 0.1;
          leafy(4 + Math.cos(a) * 16, -172 + Math.sin(a) * 16, 15, 8, a, '#e8ecff', '#6a74a8');
        }
        ctx.fillStyle = '#ffe28a';
        ctx.beginPath();
        ctx.arc(4, -172, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bg_fireflies': {
        for (let k = 0; k < 7; k++) {
          const fx = Math.sin(time * 0.7 + k * 1.7 + dec.x) * 70;
          const fy = -60 - k * 25 + Math.cos(time * 0.9 + k) * 18;
          const blink = Math.max(0, Math.sin(time * 3 + k * 2.1));
          ctx.fillStyle = `rgba(255, 245, 140, ${0.25 * blink})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255, 250, 190, ${0.4 + 0.6 * blink})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'bg_cairn': {
        for (const [cx, cy, rx, ry] of [[0, -16, 44, 20], [-6, -48, 34, 16], [4, -74, 24, 12], [0, -92, 14, 8]]) {
          ctx.fillStyle = '#6c7588';
          ctx.strokeStyle = '#2b3140';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(210, 220, 235, 0.35)';
          ctx.beginPath();
          ctx.ellipse(cx - rx * 0.3, cy - ry * 0.4, rx * 0.35, ry * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }
    ctx.restore();
  }

  // Slippery reads as wet in every theme: glossy streak + beading dew drops
  drawWetOverlay(ctx, chain, time) {
    const pts = chain.points;
    const W = chain.thickness || 40;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(120, 225, 255, 0.35)';
    ctx.lineWidth = W * 0.55;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.05));
    ctx.strokeStyle = 'rgba(235, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.3));
    const rand = this.seededRandom((chain.id || 1) * 7);
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      for (let d = 20 + rand() * 30; d < len; d += 35 + rand() * 40) {
        const t = d / len;
        const top = this.offsetPolyline([[x1, y1], [x2, y2]], W * 0.5);
        const dx = top[0][0] + (top[1][0] - top[0][0]) * t;
        const dy = top[0][1] + (top[1][1] - top[0][1]) * t;
        const r = 2.5 + rand() * 2.5 + Math.sin(time * 3 + d) * 0.4;
        ctx.fillStyle = 'rgba(200, 245, 255, 0.85)';
        ctx.strokeStyle = 'rgba(40, 120, 150, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(dx, dy - r * 0.6, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Sticky reads as honey in every theme: amber coating + drips underneath
  drawHoneyOverlay(ctx, chain, time) {
    const pts = chain.points;
    const W = chain.thickness || 40;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(240, 160, 32, 0.55)';
    ctx.lineWidth = W * 0.6;
    this.strokePolyline(ctx, pts);
    ctx.strokeStyle = 'rgba(255, 235, 160, 0.85)';
    ctx.lineWidth = 3;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.28));
    const rand = this.seededRandom((chain.id || 1) * 13);
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      for (let d = 15 + rand() * 25; d < len; d += 40 + rand() * 50) {
        const t = d / len;
        const bot = this.offsetPolyline([[x1, y1], [x2, y2]], -W * 0.5);
        const dx = bot[0][0] + (bot[1][0] - bot[0][0]) * t;
        const dy = bot[0][1] + (bot[1][1] - bot[0][1]) * t;
        const drip = 6 + rand() * 12 + Math.sin(time * 1.4 + d) * 2.5;
        ctx.fillStyle = '#f0a020';
        ctx.strokeStyle = '#9a5a08';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(dx - 4, dy - 2);
        ctx.quadraticCurveTo(dx - 3, dy + drip, dx, dy + drip + 3);
        ctx.quadraticCurveTo(dx + 3, dy + drip, dx + 4, dy - 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Pale wax beam with hexagon imprints (the hive's plain, normal-grip surface)
  drawWaxBeam(ctx, chain) {
    const pts = chain.points;
    const W = chain.thickness || 40;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(60, 30, 0, 0.15)';
    ctx.lineWidth = W * 0.7;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + W * 0.6);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + W * 0.6);
    ctx.stroke();
    ctx.strokeStyle = '#7a4c12';
    ctx.lineWidth = W;
    this.strokePolyline(ctx, pts);
    ctx.strokeStyle = '#f3d27a';
    ctx.lineWidth = W - 6;
    this.strokePolyline(ctx, pts);
    ctx.strokeStyle = '#d9ad4e';
    ctx.lineWidth = W * 0.35;
    this.strokePolyline(ctx, this.offsetPolyline(pts, -W * 0.2));
    ctx.strokeStyle = 'rgba(255, 250, 220, 0.9)';
    ctx.lineWidth = 3;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.3));
    ctx.strokeStyle = 'rgba(150, 100, 30, 0.45)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      for (let d = 14; d < len - 8; d += 22) {
        const t = d / len;
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          const px = cx + Math.cos(a) * W * 0.18;
          const py = cy + Math.sin(a) * W * 0.18;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Flat river stone slabs (night garden): rounded grey stone with speckles
  drawStoneSlab(ctx, chain) {
    const pts = chain.points;
    const W = chain.thickness || 40;
    const rand = this.seededRandom((chain.id || 1) * 3);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = W * 0.7;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + W * 0.6);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + W * 0.6);
    ctx.stroke();
    ctx.strokeStyle = '#2b3140';
    ctx.lineWidth = W;
    this.strokePolyline(ctx, pts);
    ctx.strokeStyle = '#7d8799';
    ctx.lineWidth = W - 7;
    this.strokePolyline(ctx, pts);
    ctx.strokeStyle = '#5c6577';
    ctx.lineWidth = W * 0.38;
    this.strokePolyline(ctx, this.offsetPolyline(pts, -W * 0.2));
    ctx.strokeStyle = 'rgba(210, 220, 235, 0.8)';
    ctx.lineWidth = 3;
    this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.3));
    ctx.fillStyle = 'rgba(40, 45, 60, 0.45)';
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      for (let d = rand() * 20; d < len; d += 18 + rand() * 25) {
        const t = d / len;
        ctx.beginPath();
        ctx.arc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + (rand() - 0.5) * W * 0.5, 1.5 + rand() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawElevatedLook(ctx, chain, time) {
    const pts = chain.points;
    if (pts.length < 2) return;
    // Drawn width (thick + the ~12-14 px outline every material adds) must match the
    // collision thickness, otherwise caterpillars look sunk into the wood.
    const thick = Math.max(16, (chain.thickness || 50) - 12);
    // 'look' is purely visual; physics only ever reads the material kind
    const look = chain.look || chain.material;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (look === 'root') {
      const spanX = Math.abs(pts[pts.length - 1][0] - pts[0][0]);
      const spanY = Math.abs(pts[pts.length - 1][1] - pts[0][1]);
      const isMostlyHorizontal = spanX > spanY * 1.15;

      // Draw sturdy wooden support boughs or hanging lianas so branches never look like floating bars
      if (isMostlyHorizontal && spanX > 160) {
        const midIdx = Math.floor(pts.length / 2);
        const supportPt = pts[midIdx];
        if (supportPt[1] > 230 && chain.subtype !== 'hanging') {
          ctx.fillStyle = '#4a2810';
          ctx.strokeStyle = '#221104';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(supportPt[0] - 26, supportPt[1]);
          ctx.lineTo(supportPt[0] + 26, supportPt[1]);
          ctx.lineTo(supportPt[0] + 40, supportPt[1] + 260);
          ctx.lineTo(supportPt[0] - 40, supportPt[1] + 260);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = 'rgba(38, 21, 7, 0.55)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(supportPt[0] - 9, supportPt[1] + 12);
          ctx.lineTo(supportPt[0] - 15, supportPt[1] + 240);
          ctx.moveTo(supportPt[0] + 9, supportPt[1] + 24);
          ctx.lineTo(supportPt[0] + 15, supportPt[1] + 230);
          ctx.stroke();
        } else {
          // High canopy roof branch: draw vertical liana ties going up into the forest canopy!
          for (const anchorPt of [pts[0], pts[pts.length - 1]]) {
            ctx.strokeStyle = '#1e4d1b';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(anchorPt[0], anchorPt[1]);
            ctx.lineTo(anchorPt[0], anchorPt[1] - 240);
            ctx.stroke();
          }
        }
      }

      this.drawBarkBranch(ctx, chain, pts, thick + 14, time, isMostlyHorizontal);
    } else if (look === 'stem') {
      // Thick Juicy Botanical Stalk / Vine (very high grip)
      ctx.strokeStyle = '#143814';
      ctx.lineWidth = thick + 12;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#2d8a27';
      ctx.lineWidth = thick + 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] + 2);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + 2);
      ctx.stroke();

      ctx.strokeStyle = '#44bd32';
      ctx.lineWidth = thick - 4;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#8cf562';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - thick * 0.26);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - thick * 0.26);
      ctx.stroke();

      // Botanical node rings & pairs of leaflets along the stalk
      for (let i = 0; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) * 0.5;
        const my = (pts[i][1] + pts[i + 1][1]) * 0.5;
        const sway = Math.sin(time * 3 + mx * 0.05) * 0.12;
        ctx.save();
        ctx.translate(mx, my - thick * 0.48);
        ctx.rotate(-0.4 + sway);
        ctx.fillStyle = '#58d64c';
        ctx.strokeStyle = '#143814';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(8, -5, 13, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (look === 'silk') {
      // Braided silk cord: pale twisted fibres, drawn exactly at collision width
      const W = thick + 12;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = W * 0.7;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] + W * 0.7);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + W * 0.7);
      ctx.stroke();

      ctx.strokeStyle = '#6f6a5c';
      ctx.lineWidth = W;
      this.strokePolyline(ctx, pts);
      ctx.strokeStyle = '#e9e3cf';
      ctx.lineWidth = W - 6;
      this.strokePolyline(ctx, pts);
      ctx.strokeStyle = '#c9c1a6';
      ctx.lineWidth = W * 0.35;
      this.strokePolyline(ctx, this.offsetPolyline(pts, -W * 0.18));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      this.strokePolyline(ctx, this.offsetPolyline(pts, W * 0.26));

      // Twist: diagonal fibre strokes across the cord
      ctx.strokeStyle = 'rgba(120, 110, 86, 0.55)';
      ctx.lineWidth = 2;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        const half = (W - 8) * 0.5;
        for (let d = 6; d < len - 6; d += 11) {
          const cx = x1 + ux * d;
          const cy = y1 + uy * d;
          ctx.beginPath();
          ctx.moveTo(cx - uy * half - ux * 5, cy + ux * half - uy * 5);
          ctx.lineTo(cx + uy * half + ux * 5, cy - ux * half + uy * 5);
          ctx.stroke();
        }
      }

      // Knotted anchors at both ends and dew drops hanging underneath
      for (const p of [pts[0], pts[pts.length - 1]]) {
        ctx.fillStyle = '#d8cfb4';
        ctx.strokeStyle = '#6f6a5c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p[0], p[1], W * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p[0], p[1], W * 0.28, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const count = Math.max(1, Math.floor(segLen / 90));
        for (let k = 1; k <= count; k++) {
          const t = k / (count + 1);
          const dx = p1[0] + (p2[0] - p1[0]) * t;
          const dy = p1[1] + (p2[1] - p1[1]) * t + W * 0.5;
          const pulse = 1 + Math.sin(time * 3 + dx * 0.1) * 0.15;
          ctx.strokeStyle = 'rgba(233, 227, 207, 0.8)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(dx, dy - 3);
          ctx.lineTo(dx, dy + 4);
          ctx.stroke();
          ctx.fillStyle = 'rgba(190, 240, 255, 0.9)';
          ctx.strokeStyle = 'rgba(40, 90, 110, 0.8)';
          ctx.beginPath();
          ctx.ellipse(dx, dy + 8, 3.6 * pulse, 4.6 * pulse, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    } else if (look === 'honeycomb') {
      // BRANCHE MIELLEUSE & ALVÉOLES D'AMBRE (Ultra-Adhérente : miel doré coulant + alvéoles !)
      // 1. Dark amber-bark outline
      ctx.strokeStyle = '#3d1e03';
      ctx.lineWidth = thick + 14;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      // 2. Warm honey-wood & royal wax core
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = thick + 4;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] + 2);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] + 2);
      ctx.stroke();

      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = thick - 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      // 3. Thick glossy golden honey glaze on the top surface
      ctx.strokeStyle = '#ffeaa7';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - thick * 0.28);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - thick * 0.28);
      ctx.stroke();

      // 4. Etched honeycomb cells & animated dripping honey droplets underneath!
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const steps = Math.max(1, Math.floor(segLen / 55));
        for (let s = 1; s <= steps; s++) {
          const t = s / (steps + 1);
          const hx = p1[0] + (p2[0] - p1[0]) * t;
          const hy = p1[1] + (p2[1] - p1[1]) * t;

          // Honeycomb cell facet in the core
          ctx.fillStyle = 'rgba(160, 64, 0, 0.45)';
          ctx.strokeStyle = '#ffeaa7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(hx, hy + 2, thick * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Glossy dripping honey droplet hanging under the honeyed branch
          const dripStretch = Math.sin(time * 2.8 + hx * 0.07) * 3.5;
          const dripY = hy + thick * 0.52 + Math.max(0, dripStretch);
          ctx.fillStyle = '#f1c40f';
          ctx.strokeStyle = '#5c3306';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(hx, dripY, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    } else if (look === 'moss') {
      // BRANCHE DE MOUSSE GLISSANTE SAVONNEUSE (Très glissante : coussin turquoise humide + gouttelettes !)
      ctx.strokeStyle = '#073b3a';
      ctx.lineWidth = thick + 14;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#10ac84';
      ctx.lineWidth = thick + 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      // Icy-cyan wet slippery sheen on top
      ctx.strokeStyle = '#a8fff0';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - thick * 0.28);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - thick * 0.28);
      ctx.stroke();

      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const steps = Math.max(1, Math.floor(segLen / 55));
        for (let s = 1; s <= steps; s++) {
          const t = s / (steps + 1);
          const mx = p1[0] + (p2[0] - p1[0]) * t;
          const my = p1[1] + (p2[1] - p1[1]) * t;
          ctx.fillStyle = 'rgba(220, 255, 255, 0.90)';
          ctx.beginPath();
          ctx.arc(mx, my - thick * 0.34, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (look === 'mushroom_cap') {
      // Giant Mushroom Terrace with gills & sturdy stalk
      const midX = (pts[0][0] + pts[pts.length - 1][0]) * 0.5;
      const midY = (pts[0][1] + pts[pts.length - 1][1]) * 0.5;
      ctx.fillStyle = '#fff5e4';
      ctx.strokeStyle = '#2d1b36';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(midX - 28, midY, 56, 220, 14);
      ctx.fill();
      ctx.stroke();

      // Mushroom gill lines on stalk top
      ctx.strokeStyle = 'rgba(180, 140, 110, 0.45)';
      ctx.lineWidth = 2.2;
      for (let gx = -16; gx <= 16; gx += 8) {
        ctx.beginPath();
        ctx.moveTo(midX + gx, midY + 6);
        ctx.lineTo(midX + gx, midY + 46);
        ctx.stroke();
      }

      ctx.strokeStyle = '#2d1b36';
      ctx.lineWidth = thick + 12;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#fd79a8';
      ctx.lineWidth = thick + 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#ffeaa7';
      ctx.lineWidth = 9;
      ctx.setLineDash([16, 22]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - thick * 0.24);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - thick * 0.24);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (look === 'reed') {
      // Aquatic Reed / Bamboo Stalk
      ctx.strokeStyle = '#0d3b2e';
      ctx.lineWidth = thick + 12;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#26de81';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      for (const p of pts) {
        ctx.fillStyle = '#145a32';
        ctx.beginPath();
        ctx.arc(p[0], p[1], thick * 0.58, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (look === 'straw') {
      // Hollow Bamboo / Reed Cane Platform
      ctx.strokeStyle = '#2b1d0e';
      ctx.lineWidth = thick + 12;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#e58e26';
      ctx.lineWidth = thick + 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#f8c291';
      ctx.lineWidth = thick * 0.42;
      ctx.setLineDash([24, 16]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - 4);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (look === 'can') {
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = dy / len;
        const ny = -dx / len;

        ctx.fillStyle = '#e63946';
        ctx.strokeStyle = '#2b1d24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p2[0] - nx * 110, p2[1] - ny * 110);
        ctx.lineTo(p1[0] - nx * 110, p1[1] - ny * 110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(p1[0] - nx * 40, p1[1] - ny * 40);
        ctx.lineTo(p2[0] - nx * 40, p2[1] - ny * 40);
        ctx.stroke();

        ctx.strokeStyle = '#dce6ed';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
    } else if (look === 'plastic') {
      ctx.strokeStyle = '#1f4e5f';
      ctx.lineWidth = thick + 10;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#72efdd';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    } else if (look === 'fork') {
      const s = { x1: pts[0][0], y1: pts[0][1], x2: pts[1][0], y2: pts[1][1] };
      ctx.strokeStyle = '#222831';
      ctx.lineWidth = thick + 8;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#d3dde6';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      const topX = s.y2 < s.y1 ? s.x2 : s.x1;
      const topY = Math.min(s.y1, s.y2);
      ctx.fillStyle = '#e6eef5';
      ctx.strokeStyle = '#222831';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(topX - 24, topY - 10, 48, 16, 5);
      ctx.fill();
      ctx.stroke();

      for (let t = -18; t <= 18; t += 12) {
        ctx.beginPath();
        ctx.moveTo(topX + t - 3, topY - 8);
        ctx.lineTo(topX + t, topY - 36);
        ctx.lineTo(topX + t + 3, topY - 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Draw Grabbable Acorns (Glands) & Pinecones (Pommes de pin)
  drawGrabbableProp(ctx, prop, time) {
    ctx.save();
    ctx.translate(prop.x, prop.y);
    ctx.rotate(prop.angle);

    const r = prop.radius;

    if (prop.type === 'acorn') {
      const maxHp = prop.maxHp || 100;
      const curHp = prop.hp !== undefined ? prop.hp : maxHp;
      const damageRatio = Math.max(0, Math.min(1, 1 - (curHp / maxHp)));

      const nutGrad = ctx.createRadialGradient(-r * 0.25, r * 0.05, r * 0.1, 0, r * 0.2, r * 0.95);
      nutGrad.addColorStop(0, '#f0a353');
      nutGrad.addColorStop(0.65, '#c97b32');
      nutGrad.addColorStop(1, '#8c4f19');

      ctx.fillStyle = nutGrad;
      ctx.strokeStyle = '#2b1608';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.84, -r * 0.12);
      ctx.quadraticCurveTo(-r * 0.88, r * 0.55, 0, r * 1.06);
      ctx.quadraticCurveTo(r * 0.88, r * 0.55, r * 0.84, -r * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 245, 215, 0.52)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.34, r * 0.22, r * 0.2, r * 0.36, -0.22, 0, Math.PI * 2);
      ctx.fill();

      if (damageRatio > 0.10) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'miter';

        const drawCrack = (pts, width = 2.2) => {
          ctx.strokeStyle = 'rgba(255, 235, 190, 0.45)';
          ctx.lineWidth = width + 1.2;
          ctx.beginPath();
          ctx.moveTo(pts[0][0] + 0.8, pts[0][1] + 0.8);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p][0] + 0.8, pts[p][1] + 0.8);
          }
          ctx.stroke();

          ctx.strokeStyle = '#220d04';
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p][0], pts[p][1]);
          }
          ctx.stroke();
        };

        const t1 = Math.min(1.0, (damageRatio - 0.10) / 0.32);
        const p1 = [
          [0, r * 1.04],
          [-r * 0.08, r * 0.88],
          [-r * 0.03, r * 0.74],
          [-r * 0.18, r * 0.58],
          [-r * 0.12, r * 0.44],
          [-r * 0.24, r * 0.30]
        ];
        const sliceLen1 = Math.max(2, Math.floor(t1 * p1.length));
        drawCrack(p1.slice(0, sliceLen1), 2.4);

        if (damageRatio > 0.40) {
          const t2 = Math.min(1.0, (damageRatio - 0.40) / 0.30);
          const p2 = [
            [r * 0.78, r * 0.15],
            [r * 0.58, r * 0.28],
            [r * 0.42, r * 0.22],
            [r * 0.26, r * 0.38],
            [0, r * 0.56]
          ];
          const sliceLen2 = Math.max(2, Math.floor(t2 * p2.length));
          drawCrack(p2.slice(0, sliceLen2), 2.2);
        }

        ctx.restore();
      }

      ctx.fillStyle = '#4a280d';
      ctx.beginPath();
      ctx.roundRect(-r * 0.1, -r * 1.08, r * 0.2, r * 0.35, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#6e3f19';
      ctx.beginPath();
      ctx.moveTo(-r * 0.96, -r * 0.20);
      ctx.quadraticCurveTo(-r * 0.85, -r * 0.88, 0, -r * 0.90);
      ctx.quadraticCurveTo(r * 0.85, -r * 0.88, r * 0.96, -r * 0.20);
      ctx.quadraticCurveTo(0, -r * 0.02, -r * 0.96, -r * 0.20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#42230b';
      ctx.lineWidth = 2.2;
      for (let row = 0; row < 2; row++) {
        const ry = -r * 0.58 + row * (r * 0.24);
        const count = row === 0 ? 4 : 6;
        for (let k = 0; k < count; k++) {
          const rx = ((k - (count - 1) * 0.5) / count) * r * 1.45;
          ctx.beginPath();
          ctx.moveTo(rx - r * 0.11, ry - r * 0.06);
          ctx.lineTo(rx, ry + r * 0.09);
          ctx.lineTo(rx + r * 0.11, ry - r * 0.06);
          ctx.stroke();
        }
      }
    } else {
      // GIANT SPIKY PINECONE
      ctx.fillStyle = '#3b1e0a';
      ctx.strokeStyle = '#241104';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.76, r * 0.86, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (prop.localPoints && prop.localPoints.length > 3) {
        const pts = prop.localPoints;
        const n = pts.length - 1;
        for (let i = 0; i < n; i += 2) {
          const prev = pts[(i - 1 + n) % n];
          const tip = pts[i];
          const next = pts[(i + 1) % n];

          const bx1 = prev[0] * 0.82;
          const by1 = prev[1] * 0.82;
          const bx2 = next[0] * 0.82;
          const by2 = next[1] * 0.82;

          ctx.fillStyle = (i % 4 === 0) ? '#7a4419' : '#663712';
          ctx.strokeStyle = '#261204';
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.moveTo(bx1, by1);
          ctx.quadraticCurveTo((bx1 + tip[0]) * 0.54, (by1 + tip[1]) * 0.54, tip[0], tip[1]);
          ctx.quadraticCurveTo((bx2 + tip[0]) * 0.54, (by2 + tip[1]) * 0.54, bx2, by2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#d49b63';
          ctx.beginPath();
          ctx.moveTo(tip[0] * 0.82 + bx1 * 0.18, tip[1] * 0.82 + by1 * 0.18);
          ctx.lineTo(tip[0] * 0.97, tip[1] * 0.97);
          ctx.lineTo(tip[0] * 0.82 + bx2 * 0.18, tip[1] * 0.82 + by2 * 0.18);
          ctx.closePath();
          ctx.fill();
        }
      }

      const tiers = [
        { y: r * 0.55,  count: 4, spread: r * 0.55, w: r * 0.26, h: r * 0.32, col: '#5e3210' },
        { y: r * 0.25,  count: 5, spread: r * 0.72, w: r * 0.28, h: r * 0.34, col: '#753f16' },
        { y: -r * 0.06, count: 5, spread: r * 0.74, w: r * 0.28, h: r * 0.34, col: '#874a1c' },
        { y: -r * 0.36, count: 4, spread: r * 0.60, w: r * 0.25, h: r * 0.30, col: '#753f16' },
        { y: -r * 0.62, count: 3, spread: r * 0.38, w: r * 0.22, h: r * 0.26, col: '#8f5122' }
      ];

      for (const tier of tiers) {
        for (let k = 0; k < tier.count; k++) {
          const norm = tier.count > 1 ? (k / (tier.count - 1)) * 2 - 1 : 0;
          const sx = norm * tier.spread;
          const sy = tier.y + Math.abs(norm) * r * 0.06;
          const splayAngle = norm * 0.48;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(splayAngle);

          ctx.fillStyle = tier.col;
          ctx.strokeStyle = '#261204';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(0, -tier.h * 0.45);
          ctx.lineTo(tier.w, 0);
          ctx.lineTo(0, tier.h * 0.68);
          ctx.lineTo(-tier.w, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#cfa06e';
          ctx.beginPath();
          ctx.moveTo(-tier.w * 0.42, tier.h * 0.18);
          ctx.lineTo(0, tier.h * 0.58);
          ctx.lineTo(tier.w * 0.42, tier.h * 0.18);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  drawDecoration(ctx, dec, time, world) {
    ctx.save();
    ctx.translate(dec.x, dec.y);
    ctx.scale(dec.scale, dec.scale);

    // Interactive bending when a caterpillar passes nearby!
    let catBend = 0;
    if (world && world.caterpillars && world.caterpillars.length > 0) {
      for (const cat of world.caterpillars) {
        if (!cat || !cat.head) continue;
        const dx = cat.head.x - dec.x;
        const dy = cat.head.y - dec.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 75) {
          const factor = 1 - (dist / 75);
          catBend += (dx >= 0 ? -0.35 : 0.35) * factor;
        }
      }
    }

    if (dec.type === 'flower') {
      const sway = Math.sin(time * 2.2 + dec.x * 0.05) * 0.09 + catBend;
      ctx.rotate(sway);
      ctx.strokeStyle = '#2d7a22';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -32, 0, -64);
      ctx.stroke();

      // Stem leaflets
      ctx.fillStyle = '#4ec932';
      ctx.strokeStyle = '#1b4332';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-8, -28, 8, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(9, -38, 8, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2a1b0e';
      ctx.lineWidth = 2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 12, -64 + Math.sin(a) * 12, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd93b';
      ctx.beginPath();
      ctx.arc(0, -64, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (dec.type === 'fern') {
      const sway = Math.sin(time * 2.4 + dec.x * 0.04) * 0.07 + catBend * 0.8;
      ctx.rotate(sway);
      ctx.strokeStyle = '#24691c';
      ctx.lineWidth = 5;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(dir * 25, -45, dir * 52, -30);
        ctx.stroke();

        // Frond leaflets along the fern curve
        ctx.fillStyle = '#4ec932';
        for (let f = 1; f <= 4; f++) {
          const ft = f / 5;
          const fx = dir * (25 * ft + 27 * ft * ft);
          const fy = -45 * ft * (1 - ft * 0.35);
          ctx.beginPath();
          ctx.arc(fx, fy - 3, 4.5 - f * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (dec.type === 'amber_crystal') {
      // Glowing Golden Amber Resin Cluster
      const pulse = 1 + Math.sin(time * 3.5 + dec.x) * 0.08;
      ctx.fillStyle = 'rgba(243, 156, 18, 0.28)';
      ctx.beginPath();
      ctx.arc(0, -24, 34 * pulse, 0, Math.PI * 2);
      ctx.fill();

      const drawShard = (ox, oy, w, h, rot, col) => {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(rot);
        ctx.fillStyle = col;
        ctx.strokeStyle = '#4a2306';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, 0);
        ctx.lineTo(-w * 0.65, -h * 0.65);
        ctx.lineTo(0, -h);
        ctx.lineTo(w * 0.65, -h * 0.65);
        ctx.lineTo(w * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 248, 210, 0.55)';
        ctx.beginPath();
        ctx.moveTo(-w * 0.25, -h * 0.2);
        ctx.lineTo(0, -h * 0.88);
        ctx.lineTo(w * 0.15, -h * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      drawShard(-12, 0, 14, 34, -0.28, '#e67e22');
      drawShard(12, 0, 13, 30, 0.32, '#d35400');
      drawShard(0, 2, 18, 46, 0.02, '#f39c12');
    } else if (dec.type === 'glowing_shroom') {
      // Bioluminescent Forest / Cavern Mushroom with floating spores
      const sway = Math.sin(time * 2.0 + dec.x * 0.03) * 0.05 + catBend * 0.6;
      ctx.rotate(sway);

      const glow = 1 + Math.sin(time * 4 + dec.x) * 0.12;
      ctx.fillStyle = 'rgba(0, 210, 211, 0.26)';
      ctx.beginPath();
      ctx.arc(0, -34, 30 * glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f7f1e3';
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-6, -34, 12, 34, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00d2d3';
      ctx.beginPath();
      ctx.arc(0, -32, 22, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c8d6e5';
      ctx.beginPath();
      ctx.arc(-8, -40, 3.5, 0, Math.PI * 2);
      ctx.arc(5, -43, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Floating luminescent spore motes
      ctx.fillStyle = 'rgba(129, 236, 236, 0.85)';
      for (let s = 0; s < 3; s++) {
        const sy = -48 - ((time * 18 + s * 14) % 32);
        const sx = Math.sin(time * 3 + s * 2) * 14;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (dec.type === 'hanging_vine') {
      // Animated hanging moss / vine
      const sway = Math.sin(time * 1.8 + dec.x * 0.03) * 0.08 + catBend * 0.5;
      ctx.rotate(sway);
      ctx.strokeStyle = '#1e5631';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, 45, -4, 95);
      ctx.stroke();

      ctx.fillStyle = '#4ec932';
      ctx.strokeStyle = '#143814';
      ctx.lineWidth = 1.8;
      for (let v = 1; v <= 4; v++) {
        const vy = v * 20;
        const side = (v % 2 === 0) ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(side * 9, vy, 8, 4.5, side * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (dec.type === 'bracket_fungus') {
      // Layered bark shelf mushroom (Amadouvier)
      ctx.fillStyle = '#e58e26';
      ctx.strokeStyle = '#3d1e05';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(-6, -8, 22, 9, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fa983a';
      ctx.beginPath();
      ctx.ellipse(8, -2, 18, 7.5, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (dec.type === 'clover_patch') {
      const sway = Math.sin(time * 2.5 + dec.x) * 0.07 + catBend;
      ctx.rotate(sway);
      ctx.strokeStyle = '#218c74';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -24);
      ctx.stroke();

      ctx.fillStyle = '#33d9b2';
      ctx.strokeStyle = '#143814';
      ctx.lineWidth = 2;
      for (let a = 0; a < 3; a++) {
        const ang = (a * Math.PI * 2) / 3 - Math.PI * 0.5;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 7, -26 + Math.sin(ang) * 7, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (dec.type === 'ant_arch') {
      // Sculpted wooden & amber colony totem arch marking royal zones
      ctx.strokeStyle = '#2d1404';
      ctx.fillStyle = '#6e3b14';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-28, -68, 12, 68, 5);
      ctx.roundRect(16, -68, 12, 68, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.roundRect(-34, -78, 68, 16, 6);
      ctx.fill();
      ctx.stroke();

      // Golden amber emblem in the center of the arch
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(0, -70, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (dec.type === 'bark_shelter') {
      // Mossy curved bark canopy shelter ("Excroissance d'écorce")
      ctx.fillStyle = '#4a2c11';
      ctx.strokeStyle = '#1e0f04';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-58, 8);
      ctx.quadraticCurveTo(0, -26, 58, 8);
      ctx.quadraticCurveTo(0, -6, -58, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Thick lush green moss cap on top of the shelter
      ctx.fillStyle = '#4cd137';
      ctx.beginPath();
      ctx.moveTo(-52, 2);
      ctx.quadraticCurveTo(0, -28, 52, 2);
      ctx.quadraticCurveTo(0, -14, -52, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (dec.type === 'golden_chrysalis') {
      // Radiant Golden Chrysalis suspended inside the Finish Hollow
      const pulse = 1 + Math.sin(time * 3.5) * 0.06;
      const sway = Math.sin(time * 1.8) * 0.08;
      ctx.rotate(sway);

      const aura = ctx.createRadialGradient(0, -42, 4, 0, -42, 48 * pulse);
      aura.addColorStop(0, 'rgba(255, 234, 167, 0.85)');
      aura.addColorStop(0.5, 'rgba(253, 203, 110, 0.35)');
      aura.addColorStop(1, 'rgba(253, 203, 110, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -42, 48 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Golden silk suspension cord
      ctx.strokeStyle = '#fff5d6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -88);
      ctx.lineTo(0, -66);
      ctx.stroke();

      // Sculpted golden chrysalis shell
      const chrysalisGrad = ctx.createLinearGradient(-16, -66, 16, -18);
      chrysalisGrad.addColorStop(0, '#fff2a3');
      chrysalisGrad.addColorStop(0.5, '#f1c40f');
      chrysalisGrad.addColorStop(1, '#d35400');
      ctx.fillStyle = chrysalisGrad;
      ctx.strokeStyle = '#4a2504';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -68);
      ctx.bezierCurveTo(20, -58, 18, -28, 0, -14);
      ctx.bezierCurveTo(-18, -28, -20, -58, 0, -68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ribbed segments on the chrysalis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2;
      for (const ry of [-52, -42, -32]) {
        ctx.beginPath();
        ctx.arc(0, ry, 11, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    } else if (dec.type === 'effroyeur_boss') {
      // Giant menacing Fire-Bird predator ("L'Effroyeur")
      const fireAura = ctx.createRadialGradient(0, -55, 10, 0, -55, 105);
      fireAura.addColorStop(0, 'rgba(255, 121, 63, 0.55)');
      fireAura.addColorStop(0.6, 'rgba(211, 84, 0, 0.22)');
      fireAura.addColorStop(1, 'rgba(192, 57, 43, 0)');
      ctx.fillStyle = fireAura;
      ctx.beginPath();
      ctx.arc(0, -55, 105, 0, Math.PI * 2);
      ctx.fill();

      const flap = Math.sin(time * 4.2) * 14;
      // Great fiery wings
      ctx.fillStyle = '#2c0b0e';
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.quadraticCurveTo(-55, -110 + flap, -95, -75 + flap);
      ctx.quadraticCurveTo(-50, -35, 0, -30);
      ctx.moveTo(0, -50);
      ctx.quadraticCurveTo(55, -115 - flap, 95, -70 - flap);
      ctx.quadraticCurveTo(50, -35, 0, -30);
      ctx.fill();
      ctx.stroke();

      // Head & hooked predator beak
      ctx.beginPath();
      ctx.arc(8, -58, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff9f1a';
      ctx.beginPath();
      ctx.moveTo(26, -64);
      ctx.lineTo(48, -52);
      ctx.lineTo(24, -46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing yellow predator eye
      ctx.fillStyle = '#fff200';
      ctx.beginPath();
      ctx.arc(16, -62, 5.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (dec.type === 'sign') {
      // Wooden tutorial sign: post + board with short lines of text
      const lines = String(dec.text || '').split('\n');
      ctx.font = 'bold 13px Fredoka, Nunito, sans-serif';
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 22;
      const h = lines.length * 16 + 14;
      const boardY = -62 - h;
      ctx.fillStyle = '#5a3416';
      ctx.strokeStyle = '#2a1608';
      ctx.lineWidth = 3;
      ctx.fillRect(-4, boardY + h - 4, 8, 66);
      ctx.strokeRect(-4, boardY + h - 4, 8, 66);
      ctx.fillStyle = '#c89255';
      ctx.beginPath();
      ctx.roundRect(-w / 2, boardY, w, h, 7);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(90, 52, 22, 0.35)';
      ctx.lineWidth = 1.2;
      for (let gy = boardY + 6; gy < boardY + h - 3; gy += 7) {
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 6, gy);
        ctx.lineTo(w / 2 - 6, gy + 1);
        ctx.stroke();
      }
      ctx.fillStyle = '#2a1608';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      lines.forEach((l, i) => ctx.fillText(l, 0, boardY + 15 + i * 16));
    } else if (dec.type === 'rock') {
      ctx.fillStyle = '#8d99ae';
      ctx.strokeStyle = '#2b2d42';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -12, 26, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (dec.type === 'tomato') {
      ctx.fillStyle = '#ff3838';
      ctx.strokeStyle = '#2a1b0e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.arc(-7, -7, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCheckpoint(ctx, cp, time) {
    ctx.save();
    ctx.translate(cp.x, cp.y);

    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-8, -50, 12, -92);
    ctx.stroke();

    ctx.strokeStyle = cp.activated ? '#4cd137' : '#8c7ae6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-8, -50, 12, -92);
    ctx.stroke();

    const glowR = cp.activated ? 22 + Math.sin(time * 6) * 4 : 14;
    if (cp.activated) {
      ctx.fillStyle = 'rgba(76, 209, 55, 0.35)';
      ctx.beginPath();
      ctx.arc(12, -92, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = cp.activated ? '#ffd93b' : '#dcdde1';
    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(12, -92, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = cp.activated ? '#38d84e' : '#7f8fa6';
    ctx.beginPath();
    ctx.roundRect(18, -108, 92, 26, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cp.activated ? `✓ ${cp.label}` : cp.label, 64, -91);

    ctx.restore();
  }

  drawDynamicPlatform(ctx, plat, time) {
    ctx.save();

    ctx.fillStyle = '#5c3a1e';
    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(plat.pivotX, plat.pivotY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const segs = plat.worldSegments;
    if (segs.length === 0) {
      ctx.restore();
      return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pThick = Math.max(38, plat.thickness || 40);

    if (plat.type === 'leaf' || plat.type === 'lilypad') {
      // Draw lush leaf, wooden log, or honeyed seesaw platform at caterpillar scale
      const isWood = plat.material === 'root' || plat.material === 'honeycomb';
      const isHoney = plat.material === 'honeycomb';
      ctx.strokeStyle = isWood ? '#241205' : '#183d16';
      ctx.lineWidth = pThick + 10;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = isWood ? (isHoney ? '#8c5223' : '#78441c') : (plat.type === 'lilypad' ? '#26de81' : '#58c93a');
      ctx.lineWidth = pThick;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      if (isHoney) {
        // Thick golden honey glaze along the top of the seesaw
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = pThick * 0.45;
        ctx.beginPath();
        ctx.moveTo(segs[0].x1, segs[0].y1 - pThick * 0.22);
        for (const s of segs) ctx.lineTo(s.x2, s.y2 - pThick * 0.22);
        ctx.stroke();

        ctx.strokeStyle = '#ffeaa7';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(segs[0].x1, segs[0].y1 - pThick * 0.34);
        for (const s of segs) ctx.lineTo(s.x2, s.y2 - pThick * 0.34);
        ctx.stroke();
      } else {
        ctx.strokeStyle = isWood ? '#c48347' : '#c7ff96';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(segs[0].x1, segs[0].y1 - pThick * 0.22);
        for (const s of segs) ctx.lineTo(s.x2, s.y2 - pThick * 0.22);
        ctx.stroke();
      }

      if (plat.type === 'lilypad') {
        // Cute pink lotus flower in the center of the lilypad
        ctx.fillStyle = '#fd79a8';
        ctx.strokeStyle = '#2d1b36';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(plat.pivotX, plat.pivotY - pThick * 0.48, 12, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (plat.type === 'turnstile') {
      // 360° Rotating Twig Turnstile ("Le Tourniquet de Brindilles")
      for (const s of segs) {
        ctx.strokeStyle = '#241205';
        ctx.lineWidth = pThick + 10;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        ctx.strokeStyle = '#78441c';
        ctx.lineWidth = pThick;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        ctx.strokeStyle = '#b5723b';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }

      // Liana vine knot at the central axle
      ctx.fillStyle = '#4cd137';
      ctx.strokeStyle = '#183d16';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(plat.pivotX, plat.pivotY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(plat.pivotX, plat.pivotY, 95, plat.angle, plat.angle + 0.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(plat.pivotX, plat.pivotY, 95, plat.angle + Math.PI, plat.angle + Math.PI + 0.65);
      ctx.stroke();
    } else if (plat.type === 'silk_swing') {
      // Hanging wooden-liana swing with braided forest vines
      ctx.strokeStyle = '#2d6a4f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      ctx.lineTo(plat.pivotX, plat.pivotY - 120);
      ctx.moveTo(segs[segs.length - 1].x2, segs[segs.length - 1].y2);
      ctx.lineTo(plat.pivotX, plat.pivotY - 120);
      ctx.stroke();

      ctx.strokeStyle = '#221104';
      ctx.lineWidth = pThick + 10;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#8c5223';
      ctx.lineWidth = pThick;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#52b788';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1 - pThick * 0.25);
      for (const s of segs) ctx.lineTo(s.x2, s.y2 - pThick * 0.25);
      ctx.stroke();
    } else if (plat.type === 'hose') {
      ctx.strokeStyle = '#0c382c';
      ctx.lineWidth = pThick + 8;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#1dd1a1';
      ctx.lineWidth = pThick;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#83ffdf';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1 - 4);
      for (const s of segs) ctx.lineTo(s.x2, s.y2 - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  drawSapCascades(ctx, world, time) {
    for (const sap of world.sapCascades) {
      ctx.save();
      const halfW = sap.width * 0.5;
      const h = sap.bottomY - sap.topY;

      // Translucent golden amber waterfall column
      const grad = ctx.createLinearGradient(sap.x - halfW, sap.topY, sap.x + halfW, sap.topY);
      grad.addColorStop(0, 'rgba(211, 84, 0, 0.45)');
      grad.addColorStop(0.3, 'rgba(243, 156, 18, 0.72)');
      grad.addColorStop(0.55, 'rgba(255, 234, 167, 0.85)');
      grad.addColorStop(0.8, 'rgba(243, 156, 18, 0.72)');
      grad.addColorStop(1, 'rgba(211, 84, 0, 0.45)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(sap.x - halfW, sap.topY, sap.width, h, 16);
      ctx.fill();

      // Animated downward viscous sap streaks
      ctx.strokeStyle = 'rgba(255, 250, 210, 0.65)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const streakOffset = (time * sap.flowSpeed) % 70;
      for (let y = sap.topY + streakOffset; y < sap.bottomY - 25; y += 70) {
        ctx.beginPath();
        ctx.moveTo(sap.x - halfW * 0.4, y);
        ctx.lineTo(sap.x - halfW * 0.4, y + 28);
        ctx.moveTo(sap.x + halfW * 0.35, y + 22);
        ctx.lineTo(sap.x + halfW * 0.35, y + 52);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawWaterDrops(ctx, world, time) {
    for (const drop of world.waterDrops) {
      ctx.save();
      // Draw source leaf drip / warning condensation at emitter top
      if (drop.kind !== 'ember') {
        ctx.fillStyle = 'rgba(72, 219, 251, 0.78)';
        ctx.beginPath();
        ctx.arc(drop.x, drop.startY, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 107, 53, 0.78)';
        ctx.beginPath();
        ctx.arc(drop.x, drop.startY, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!drop.active) {
        ctx.restore();
        continue;
      }

      ctx.translate(drop.x, drop.y);
      const r = drop.radius || 22;

      if (drop.kind === 'ember') {
        // Falling burning pinecone / fire ember
        const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.45);
        glow.addColorStop(0, '#fff200');
        glow.addColorStop(0.5, '#ff6b35');
        glow.addColorStop(1, 'rgba(235, 59, 90, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5c2308';
        ctx.strokeStyle = '#ff9f1a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Giant Heavy Water Drop
        const waterGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.1, r * 0.1, 0, 0, r);
        waterGrad.addColorStop(0, '#ffffff');
        waterGrad.addColorStop(0.35, '#70d6ff');
        waterGrad.addColorStop(1, '#0984e3');

        ctx.fillStyle = waterGrad;
        ctx.strokeStyle = '#0652dd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.35);
        ctx.bezierCurveTo(r * 1.05, -r * 0.2, r * 0.95, r * 0.95, 0, r);
        ctx.bezierCurveTo(-r * 0.95, r * 0.95, -r * 1.05, -r * 0.2, 0, -r * 1.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glossy cartoon reflection highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.1, r * 0.18, r * 0.38, -0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawThorn(ctx, thorn, time) {
    ctx.save();
    ctx.translate(thorn.x, thorn.y);
    const r = thorn.radius || 28;

    // Dark thorny bramble dome
    ctx.fillStyle = '#3d1e38';
    ctx.strokeStyle = '#1a0918';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 4, r * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp crimson-tipped spikes radiating upward
    const spikeCount = 7;
    for (let i = 0; i < spikeCount; i++) {
      const a = Math.PI + (i + 0.5) * (Math.PI / spikeCount);
      const bx1 = Math.cos(a - 0.18) * (r * 0.65);
      const by1 = Math.sin(a - 0.18) * (r * 0.65);
      const bx2 = Math.cos(a + 0.18) * (r * 0.65);
      const by2 = Math.sin(a + 0.18) * (r * 0.65);
      const tx = Math.cos(a) * (r * 1.25);
      const ty = Math.sin(a) * (r * 1.25);

      ctx.fillStyle = '#eb3b5a';
      ctx.strokeStyle = '#1a0918';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.lineTo(tx, ty);
      ctx.lineTo(bx2, by2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawMushroom(ctx, m, time) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.angle || 0);

    const sx = 1 + Math.sin(m.squash * Math.PI) * 0.35;
    const sy = 1 - Math.sin(m.squash * Math.PI) * 0.28;
    ctx.scale(sx, sy);

    const r = m.radius;

    ctx.fillStyle = '#fff3d6';
    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-r * 0.38, -r * 0.1, r * 0.76, r * 0.95, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff3864';
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r, Math.PI, 0);
    ctx.bezierCurveTo(r * 1.1, r * 0.18, -r * 1.1, r * 0.18, -r, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.48, -r * 0.45, r * 0.18, 0, Math.PI * 2);
    ctx.arc(0, -r * 0.65, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.48, -r * 0.42, r * 0.17, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Bonus Apple (Collectible Item — keeps sprite support!):
  // - kind === 'segment' : Golden-Emerald Apple (+1 Segment)
  // - kind === 'heal' (from enemies & acorns): Healing Apple (+20 HP)
  drawBonusApple(ctx, apple, time) {
    ctx.save();
    const bob = Math.sin(time * 5 + apple.x * 0.1) * 3.5;
    ctx.translate(apple.x, apple.y + bob);

    const r = apple.radius || 14;
    const isSegment = apple.kind === 'segment';

    // Aura glow
    const pulse = 1.0 + Math.sin(time * 6 + apple.x) * 0.15;
    ctx.fillStyle = isSegment ? 'rgba(46, 213, 115, 0.42)' : 'rgba(255, 107, 129, 0.38)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.85 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const appleImg = isSegment
      ? this.getSprite('collectibles/golden_apple.png')
      : null; // Heal apples are drawn procedurally (no red_apple sprite exists)
    if (appleImg) {
      const size = r * 2.5;
      ctx.drawImage(appleImg, -size * 0.5, -size * 0.55, size, size);
    } else {
      // Stem
      ctx.strokeStyle = '#4a2810';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.quadraticCurveTo(r * 0.2, -r * 1.25, r * 0.45, -r * 1.35);
      ctx.stroke();

      // Leaf
      ctx.fillStyle = isSegment ? '#ffd32a' : '#2ecc71';
      ctx.strokeStyle = '#1b4332';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r * 0.2, -r * 1.1);
      ctx.quadraticCurveTo(r * 0.8, -r * 1.45, r * 1.05, -r * 1.15);
      ctx.quadraticCurveTo(r * 0.65, -r * 0.85, r * 0.2, -r * 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Apple Body
      ctx.fillStyle = isSegment ? '#2ed573' : '#e74c3c';
      ctx.strokeStyle = isSegment ? '#145a32' : '#962d22';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.65);
      ctx.bezierCurveTo(r * 0.8, -r * 1.1, r * 1.25, -r * 0.2, r * 1.05, r * 0.6);
      ctx.bezierCurveTo(r * 0.8, r * 1.15, r * 0.2, r * 1.1, 0, r * 0.8);
      ctx.bezierCurveTo(-r * 0.2, r * 1.1, -r * 0.8, r * 1.15, -r * 1.05, r * 0.6);
      ctx.bezierCurveTo(-r * 1.25, -r * 0.2, -r * 0.8, -r * 1.1, 0, -r * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Specular Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(-r * 0.4, -r * 0.35, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating mini label above apple so player immediately knows its effect
    ctx.font = '900 10px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isSegment ? '#b8ffcf' : '#ffe0e6';
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 3;
    const label = isSegment ? '+1 SEG' : '+20 ❤️';
    ctx.strokeText(label, 0, -r * 1.55);
    ctx.fillText(label, 0, -r * 1.55);

    ctx.restore();
  }

  drawEnemyHealthBar(ctx, enemy) {
    if (!enemy || enemy.maxHp === undefined) return;
    if (enemy.hp >= enemy.maxHp) return;

    ctx.save();
    if (enemy.isDefeated && enemy.deathTimer !== undefined) {
      ctx.globalAlpha = Math.max(0, Math.min(1, enemy.deathTimer / 0.8));
    }
    const barW = Math.max(34, enemy.radius * 1.5);
    const barH = 5;
    const barX = enemy.x - barW * 0.5;
    const barY = enemy.y - enemy.radius - 14;

    ctx.fillStyle = 'rgba(20, 20, 20, 0.78)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3);
    ctx.fill();
    ctx.stroke();

    const ratio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
    const fillW = Math.max(0, barW * ratio);

    if (fillW > 0) {
      const fillColor = ratio > 0.55 ? '#2ed573' : (ratio > 0.25 ? '#ffa502' : '#ff4757');
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, 2);
      ctx.fill();
    }

    if (enemy.isDefeated) {
      ctx.font = 'bold 9px "Fredoka", sans-serif';
      ctx.fillStyle = '#ff4757';
      ctx.textAlign = 'center';
      ctx.fillText('K.O.', enemy.x, barY - 3);
    }

    ctx.restore();
  }

  drawAphid(ctx, a, time) {
    ctx.save();
    let alpha = 1.0;
    let floatY = 0;
    if (a.isDefeated && a.deathTimer !== undefined) {
      alpha = Math.max(0, Math.min(1, a.deathTimer / 0.8));
      floatY = -Math.sin(((0.8 - a.deathTimer) / 0.8) * Math.PI) * 12;
    }
    ctx.globalAlpha = alpha;
    ctx.translate(a.x, a.y + floatY);
    if (a.isDefeated) {
      ctx.rotate(Math.sin(time * 6) * 0.15);
    }
    ctx.scale(a.squashX * a.facing, a.squashY);

    const r = a.radius;
    const isPanicking = a.isHeld || a.isFlying;

    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 3;
    const legFreq = isPanicking ? 24 : 8;
    const legAmp = isPanicking ? 5.5 : 3;
    for (let lx = -10; lx <= 10; lx += 10) {
      const legBob = Math.sin(time * legFreq + lx) * legAmp;
      ctx.beginPath();
      ctx.moveTo(lx, r * 0.6);
      ctx.lineTo(lx + legBob, r + 4);
      ctx.stroke();
    }

    ctx.fillStyle = '#a3f76d';
    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (a.isDefeated) {
      ctx.strokeStyle = '#1b4332';
      ctx.lineWidth = 2.5;
      const eyeX = r * 0.40;
      const eyeY = -r * 0.20;
      ctx.beginPath();
      ctx.moveTo(eyeX - 4, eyeY - 4);
      ctx.lineTo(eyeX + 4, eyeY + 4);
      ctx.moveTo(eyeX + 4, eyeY - 4);
      ctx.lineTo(eyeX - 4, eyeY + 4);
      ctx.stroke();
    } else if (isPanicking) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.35, -r * 0.25, 7.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.arc(r * 0.35, -r * 0.25, 2.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(r * 0.75, 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.45, -r * 0.2, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.arc(r * 0.55, -r * 0.2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Power-Up Collectible (Collectible Item — keeps sprite support!)
  drawPowerUp(ctx, p, time) {
    if (p.collected) return;
    ctx.save();

    const bob = Math.sin(time * 3.8 + p.x * 0.05) * 6;
    const px = p.x;
    const py = p.y + bob;
    const r = p.radius || 18;

    const conf = {
      speed: { bg: '#00d2d3', rim: '#48dbfb', glow: 'rgba(0, 210, 211, 0.45)', icon: '⚡', sprite: 'powerups/powerup_speed.png' },
      strength: { bg: '#ff9f43', rim: '#feca57', glow: 'rgba(255, 159, 67, 0.45)', icon: '💪', sprite: 'powerups/powerup_strength.png' },
      giant: { bg: '#ee5253', rim: '#ff6b6b', glow: 'rgba(238, 82, 83, 0.45)', icon: '🎈', sprite: 'powerups/powerup_shield.png' },
      length: { bg: '#10ac84', rim: '#1dd1a1', glow: 'rgba(16, 172, 132, 0.45)', icon: '📏', sprite: 'powerups/powerup_shield.png' },
      feather: { bg: '#54a0ff', rim: '#70a1ff', glow: 'rgba(84, 160, 255, 0.45)', icon: '🪶', sprite: 'powerups/powerup_feather.png' }
    }[p.type] || { bg: '#ffd93b', rim: '#ffeaa7', glow: 'rgba(255, 217, 59, 0.45)', icon: '⭐', sprite: 'powerups/powerup_shield.png' };

    const pulse = 1.0 + Math.sin(time * 6.0 + p.x) * 0.12;
    ctx.fillStyle = conf.glow;
    ctx.beginPath();
    ctx.arc(px, py, r * 1.55 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const pImg = this.getSprite(conf.sprite);
    if (pImg) {
      const size = r * 2.55;
      ctx.drawImage(pImg, px - size * 0.5, py - size * 0.5, size, size);
      ctx.restore();
      return;
    }

    ctx.fillStyle = conf.bg;
    ctx.strokeStyle = '#222f3e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = conf.rim;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, r - 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(px - r * 0.35, py - r * 0.35, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${Math.round(r * 1.15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(conf.icon, px, py + 1);

    ctx.restore();
  }

  drawHedgehog(ctx, h, time) {
    ctx.save();
    let alpha = 1.0;
    let floatY = 0;
    if (h.isDefeated && h.deathTimer !== undefined) {
      alpha = Math.max(0, Math.min(1, h.deathTimer / 0.8));
      floatY = -Math.sin(((0.8 - h.deathTimer) / 0.8) * Math.PI) * 12;
    }
    ctx.globalAlpha = alpha;
    ctx.translate(h.x, h.y + floatY);
    if (h.isDefeated) {
      ctx.rotate(Math.sin(time * 6) * 0.15);
    }
    ctx.scale(h.squashX * (h.facing || 1), h.squashY);

    const r = h.radius;
    const isPanicking = h.isHeld || h.isFlying;

    ctx.fillStyle = '#4a2810';
    ctx.strokeStyle = '#241206';
    ctx.lineWidth = 2.5;

    const numQuills = 15;
    const startA = -1.15;
    const endA = -4.25;

    for (let i = 0; i < numQuills; i++) {
      const t = i / (numQuills - 1);
      const a = startA + t * (endA - startA);
      const spread = 0.14;
      const base1X = Math.cos(a - spread) * (r * 0.92);
      const base1Y = Math.sin(a - spread) * (r * 0.92);
      const base2X = Math.cos(a + spread) * (r * 0.92);
      const base2Y = Math.sin(a + spread) * (r * 0.92);

      const tipLen = r * 1.50 + (i % 2 === 0 ? 4 : 0);
      const tipX = Math.cos(a) * tipLen;
      const tipY = Math.sin(a) * tipLen;

      ctx.beginPath();
      ctx.moveTo(base1X, base1Y);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(base2X, base2Y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#8d5b32';
    ctx.strokeStyle = '#241206';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 2, r * 1.05, r * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e8c99b';
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.5);
    ctx.quadraticCurveTo(r * 1.25, -r * 0.1, r * 1.35, r * 0.15);
    ctx.quadraticCurveTo(r * 0.9, r * 0.65, r * 0.2, r * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e8c99b';
    ctx.strokeStyle = '#241206';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(r * 0.15, -r * 0.42, 4.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e1108';
    ctx.beginPath();
    ctx.arc(r * 1.35, r * 0.15, 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (h.isDefeated) {
      ctx.strokeStyle = '#1e1108';
      ctx.lineWidth = 2.5;
      const eyeX = r * 0.65;
      const eyeY = -r * 0.12;
      ctx.beginPath();
      ctx.moveTo(eyeX - 4, eyeY - 4);
      ctx.lineTo(eyeX + 4, eyeY + 4);
      ctx.moveTo(eyeX + 4, eyeY - 4);
      ctx.lineTo(eyeX - 4, eyeY + 4);
      ctx.stroke();
    } else if (isPanicking) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.65, -r * 0.12, 6.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e1108';
      ctx.beginPath();
      ctx.arc(r * 0.65, -r * 0.12, 2.0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.65, -r * 0.12, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e1108';
      ctx.beginPath();
      ctx.arc(r * 0.72, -r * 0.14, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#e8c99b';
    ctx.strokeStyle = '#241206';
    ctx.lineWidth = 2.5;
    const pawSwing = isPanicking ? Math.sin(time * 24) * 5 : Math.sin(time * 10) * 3;
    ctx.beginPath();
    ctx.arc(r * 0.6 + pawSwing, r * 0.75, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-r * 0.3 - pawSwing, r * 0.75, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draw Procedural JS Warrior Ant (Fourmi Rouge Guerrière) with articulated gait, breathing gaster & snapping mandibles!
  drawAnt(ctx, ant, time) {
    ctx.save();
    let alpha = 1.0;
    let floatY = 0;
    if (ant.isDefeated && ant.deathTimer !== undefined) {
      alpha = Math.max(0, Math.min(1, ant.deathTimer / 0.8));
      floatY = -Math.sin(((0.8 - ant.deathTimer) / 0.8) * Math.PI) * 12;
    }
    ctx.globalAlpha = alpha;

    const isWindup = ant.aiState === 'windup' && !ant.isHeld && !ant.isDefeated;
    const isPanicking = ant.isHeld || ant.isFlying;
    const r = ant.radius || 25;
    const legPhase = ant.legPhase !== undefined ? ant.legPhase : time * 14;
    const bodyBob = isPanicking ? Math.sin(time * 28) * 2.2 : Math.abs(Math.sin(legPhase)) * 2.6;
    const windupJitterX = isWindup ? Math.sin(time * 55) * 2.2 : 0;

    ctx.translate(ant.x + windupJitterX, ant.y + floatY - bodyBob);

    // Draw Alert Badge & Counter-Grab Ring BEFORE flipping horizontally so text is never mirrored!
    if (isWindup) {
      const windupRatio = Math.min(1, (ant.windupTimer || 0) / 0.68);
      const pulse = 1 + Math.sin(time * 24) * 0.14;

      // Counter-grab target ring around the ant
      ctx.save();
      ctx.strokeStyle = windupRatio > 0.65 ? '#ff4757' : '#ffa502';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, (r + 12) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Exclamation mark bubble above head
      const alertY = -r - 24 - Math.abs(Math.sin(time * 18)) * 5;
      ctx.fillStyle = windupRatio > 0.65 ? '#ff4757' : '#ff9f43';
      ctx.strokeStyle = '#2d0c09';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, alertY, 13 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, alertY + 1);
      ctx.restore();
    } else if (ant.isHeld) {
      // Neutralized indicator while held by the player's suction cup
      ctx.save();
      ctx.fillStyle = '#2ed573';
      ctx.strokeStyle = '#145a32';
      ctx.lineWidth = 3;
      ctx.font = '900 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText('SAISIE ✓', 0, -r - 18);
      ctx.fillText('SAISIE ✓', 0, -r - 18);
      ctx.restore();
    }

    if (ant.isDefeated) {
      ctx.rotate(Math.sin(time * 6) * 0.22);
    } else if (ant.isFlying) {
      ctx.rotate(time * 9);
    } else if (isWindup) {
      // Rear up aggressively while preparing the suplex grab!
      ctx.rotate(-0.22 * (ant.facing || 1));
    }
    ctx.scale(ant.squashX * (ant.facing || 1), ant.squashY);

    const legAmp = isPanicking ? 8.5 : (isWindup ? 6.0 : 5.2);
    const legLiftAmp = isPanicking ? 7.0 : 4.2;

    // Helper for drawing 3 articulated 2-segment legs (femur + tibia + claw)
    const drawLegSet = (isBackLayer) => {
      const anchors = [-r * 0.36, -r * 0.04, r * 0.28];
      const baseSpread = [-r * 0.48, -r * 0.02, r * 0.44];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < 3; i++) {
        const phaseOffset = i * 2.1 + (isBackLayer ? Math.PI : 0);
        const swing = Math.sin(legPhase + phaseOffset) * legAmp;
        const lift = Math.max(0, Math.cos(legPhase + phaseOffset)) * legLiftAmp;

        const hipX = anchors[i];
        const hipY = isBackLayer ? r * 0.08 : r * 0.16;
        const footX = baseSpread[i] + swing;
        const footY = (isBackLayer ? r * 0.88 : r * 0.98) - lift;
        const kneeX = (hipX + footX) * 0.5 + (i === 2 ? 4 : -4);
        const kneeY = hipY - r * 0.24 - lift * 0.45;

        ctx.strokeStyle = isBackLayer ? '#240804' : '#3d0e07';
        ctx.lineWidth = isBackLayer ? 3.2 : 4.2;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        if (!isBackLayer) {
          ctx.strokeStyle = '#c0392b';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(kneeX, kneeY);
          ctx.stroke();

          // Tiny tarsal claw at foot tip
          ctx.fillStyle = '#240804';
          ctx.beginPath();
          ctx.arc(footX + 1.5, footY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // 1a. Back layer legs (3 legs on the far side)
    drawLegSet(true);

    // 2. Segmented Body: Gaster (Rear Abdomen), Petiole (Waist node), Thorax (Armored middle), Head (Warrior front)
    const gasterPulse = Math.sin(time * (isWindup ? 18 : 5.5)) * 0.07;
    ctx.save();
    ctx.translate(-r * 0.66, -r * 0.14);
    ctx.rotate(-0.24 + gasterPulse);

    const abdGrad = ctx.createRadialGradient(-r * 0.1, -r * 0.15, r * 0.08, 0, 0, r * 0.65);
    abdGrad.addColorStop(0, '#ff793f');
    abdGrad.addColorStop(0.55, '#c0392b');
    abdGrad.addColorStop(1, '#4a0e07');

    ctx.fillStyle = abdGrad;
    ctx.strokeStyle = '#240804';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.58, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden-amber warrior war-bands across the gaster
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3.2;
    for (const bx of [-r * 0.18, r * 0.08]) {
      ctx.beginPath();
      ctx.arc(bx, 0, r * 0.37, -1.15, 1.15);
      ctx.stroke();
    }

    // Sharp rear stinger tip
    ctx.fillStyle = '#240804';
    ctx.beginPath();
    ctx.moveTo(-r * 0.54, -4);
    ctx.lineTo(-r * 0.74, 0);
    ctx.lineTo(-r * 0.54, 4);
    ctx.closePath();
    ctx.fill();

    // Glossy chitin highlight on gaster
    ctx.fillStyle = 'rgba(255, 240, 220, 0.48)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.10, -r * 0.22, r * 0.24, r * 0.09, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2b. Petiole node (narrow waist joint between gaster and thorax)
    ctx.fillStyle = '#781e14';
    ctx.strokeStyle = '#240804';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(-r * 0.28, r * 0.02, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2c. Armored Thorax with dorsal warrior spines
    const thoraxGrad = ctx.createLinearGradient(0, -r * 0.26, 0, r * 0.26);
    thoraxGrad.addColorStop(0, '#e55039');
    thoraxGrad.addColorStop(1, '#6e180f');
    ctx.fillStyle = thoraxGrad;
    ctx.strokeStyle = '#240804';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.03, r * 0.36, r * 0.25, 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dorsal warrior spikes on thorax
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, -r * 0.18);
    ctx.lineTo(-r * 0.06, -r * 0.36);
    ctx.lineTo(0, -r * 0.19);
    ctx.moveTo(r * 0.06, -r * 0.18);
    ctx.lineTo(r * 0.14, -r * 0.34);
    ctx.lineTo(r * 0.20, -r * 0.17);
    ctx.fill();
    ctx.stroke();

    // 1b. Front layer legs (3 legs on the near side)
    drawLegSet(false);

    // 2d. Sculpted Warrior Head
    const headTilt = isWindup ? -0.15 : Math.sin(time * 5) * 0.05;
    ctx.save();
    ctx.translate(r * 0.50, -r * 0.06);
    ctx.rotate(headTilt);

    const headGrad = ctx.createRadialGradient(-r * 0.05, -r * 0.12, r * 0.06, 0, 0, r * 0.50);
    headGrad.addColorStop(0, '#ff5252');
    headGrad.addColorStop(0.65, '#b33939');
    headGrad.addColorStop(1, '#4a100a');

    ctx.fillStyle = headGrad;
    ctx.strokeStyle = '#240804';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.42, r * 0.36, 0.10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden-amber warrior crest on forehead
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.24);
    ctx.quadraticCurveTo(0, -r * 0.42, r * 0.16, -r * 0.22);
    ctx.quadraticCurveTo(0, -r * 0.28, -r * 0.18, -r * 0.24);
    ctx.fill();
    ctx.stroke();

    // 3. Expressive Segmented Antennae with glowing sensory tips
    const antWiggle = Math.sin(time * (isWindup ? 30 : (isPanicking ? 24 : 9))) * 0.26;
    ctx.strokeStyle = '#240804';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(r * 0.12, -r * 0.28);
    ctx.lineTo(r * 0.28, -r * 0.66);
    ctx.lineTo(r * (0.56 + antWiggle), -r * 0.78);
    ctx.moveTo(-r * 0.02, -r * 0.30);
    ctx.lineTo(r * 0.06, -r * 0.70);
    ctx.lineTo(r * (0.30 - antWiggle), -r * 0.86);
    ctx.stroke();

    ctx.fillStyle = isWindup ? '#fff200' : '#ff9f43';
    ctx.beginPath();
    ctx.arc(r * (0.56 + antWiggle), -r * 0.78, 3.2, 0, Math.PI * 2);
    ctx.arc(r * (0.30 - antWiggle), -r * 0.86, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Giant Serrated Pincer Mandibles (Clack rhythmically & open wide during windup!)
    const jawOpen = isWindup
      ? (0.48 + Math.sin(time * 36) * 0.18)
      : (isPanicking ? (0.34 + Math.sin(time * 26) * 0.10) : (0.14 + Math.abs(Math.sin(time * 6)) * 0.12));
    ctx.fillStyle = '#f39c12';
    ctx.strokeStyle = '#240804';
    ctx.lineWidth = 2.6;

    // Upper serrated mandible
    ctx.save();
    ctx.translate(r * 0.32, -r * 0.06);
    ctx.rotate(-jawOpen);
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(r * 0.38, -r * 0.28, r * 0.52, -2);
    ctx.lineTo(r * 0.34, 2);
    ctx.lineTo(r * 0.24, -2);
    ctx.lineTo(r * 0.14, 2);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Lower serrated mandible
    ctx.save();
    ctx.translate(r * 0.32, r * 0.10);
    ctx.rotate(jawOpen);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(r * 0.14, -2);
    ctx.lineTo(r * 0.24, 2);
    ctx.lineTo(r * 0.34, -2);
    ctx.lineTo(r * 0.52, 2);
    ctx.quadraticCurveTo(r * 0.38, r * 0.28, 0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Expressive Eyes
    const eyeX = r * 0.10;
    const eyeY = -r * 0.08;
    if (ant.isDefeated) {
      ctx.strokeStyle = '#1e1108';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(eyeX - 4, eyeY - 4);
      ctx.lineTo(eyeX + 4, eyeY + 4);
      ctx.moveTo(eyeX + 4, eyeY - 4);
      ctx.lineTo(eyeX - 4, eyeY + 4);
      ctx.stroke();
    } else if (isPanicking) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e1108';
      ctx.beginPath();
      ctx.arc(eyeX + Math.cos(time * 20) * 2, eyeY + Math.sin(time * 20) * 2, 2.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = isWindup ? '#fff200' : '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isWindup ? '#eb2f06' : '#1e1108';
      ctx.beginPath();
      ctx.arc(eyeX + 1.8, eyeY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Fierce warrior brow ridge
      ctx.strokeStyle = '#240804';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(eyeX - 6, eyeY - 6);
      ctx.lineTo(eyeX + 6, eyeY - 2);
      ctx.stroke();
    }
    ctx.restore(); // End head transform

    // 6. Spinning Dizzy Stars when held or flying!
    if (isPanicking && !ant.isDefeated) {
      ctx.fillStyle = '#ffd32a';
      ctx.strokeStyle = '#240804';
      ctx.lineWidth = 1.8;
      for (let s = 0; s < 3; s++) {
        const sa = time * 6 + (s * Math.PI * 2) / 3;
        const sx = r * 0.45 + Math.cos(sa) * 14;
        const sy = -r * 0.72 + Math.sin(sa) * 5;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawStickyCrumb(ctx, c, time) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const pulse = 1 + Math.sin(time * 3 + (c.wobble || 0)) * 0.06;
    ctx.scale(pulse, 1 / pulse);

    const kind = c.kind || 'jam';
    const styles = {
      jam:   { puddle: 'rgba(255, 42, 109, 0.88)', stroke: '#4a0e23', blob: '#f4a261' },
      sap:   { puddle: 'rgba(230, 126, 34, 0.88)', stroke: '#4a2306', blob: '#f39c12' },
      honey: { puddle: 'rgba(241, 196, 15, 0.90)', stroke: '#5c3c05', blob: '#fff200' },
      web:   { puddle: 'rgba(236, 240, 241, 0.88)', stroke: '#2c3e50', blob: '#bdc3c7' }
    };
    const st = styles[kind] || styles.jam;

    ctx.fillStyle = st.puddle;
    ctx.strokeStyle = st.stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 4, c.radius * 1.15, c.radius * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = st.blob;
    ctx.beginPath();
    ctx.arc(-8, -2, c.radius * 0.42, 0, Math.PI * 2);
    ctx.arc(7, 0, c.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawStartBanner(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#8d5524';
    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 3.5;
    ctx.fillRect(-6, -85, 12, 85);
    ctx.strokeRect(-6, -85, 12, 85);

    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.roundRect(-48, -115, 96, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2a1b0e';
    ctx.font = '900 15px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DÉPART ▶', 0, -92);

    ctx.restore();
  }

  drawFinishLine(ctx, x, y, time, isVictory) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#6b4226';
    ctx.strokeStyle = '#2a1b0e';
    ctx.lineWidth = 4;
    ctx.fillRect(-6, -165, 12, 165);
    ctx.strokeRect(-6, -165, 12, 165);

    const wave = Math.sin(time * 5) * 5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-6, -162, 110, 36, 6);
    ctx.fill();
    ctx.stroke();

    const cols = 6;
    const sqW = 110 / cols;
    const sqH = 18;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#2a1b0e';
          ctx.fillRect(-6 + c * sqW, -162 + r * sqH, sqW, sqH);
        }
      }
    }

    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.arc(0, -172 + wave * 0.3, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (const bug of this.spectators) {
      const jumpSpeed = isVictory ? 12 : 4.5;
      const jumpHeight = isVictory ? 34 : 8;
      const bounce = Math.abs(Math.sin(time * jumpSpeed + bug.phase)) * jumpHeight;
      const bx = bug.offsetX;
      const by = (bug.flying ? -95 : -bug.size) - bounce;

      ctx.save();
      ctx.translate(bx, by);
      if (isVictory) {
        ctx.rotate(Math.sin(time * 14 + bug.phase) * 0.22);
      }

      ctx.fillStyle = bug.color;
      ctx.strokeStyle = '#1e1b18';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, 0, bug.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (bug.type === 'bee') {
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(-5, -bug.size * 0.8, 4, bug.size * 1.6);
        ctx.fillRect(3, -bug.size * 0.8, 4, bug.size * 1.6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const wingY = Math.sin(time * 35) * 4;
        ctx.beginPath();
        ctx.ellipse(-3, -bug.size - 4 + wingY, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(5, -bug.size - 4 - wingY, 8, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (bug.type === 'ladybug') {
        ctx.fillStyle = '#1e1b18';
        ctx.beginPath();
        ctx.arc(-4, -3, 3, 0, Math.PI * 2);
        ctx.arc(4, 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-bug.size * 0.45, -3, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(-bug.size * 0.52, -3, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }
}
