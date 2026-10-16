// js/levels.js — Complete Cartoon Terrain Renderer, Rich Scenery & Grabbable Acorns / Pinecones

export const LEVEL_DEFINITIONS = [
  {
    id: 0,
    name: 'Niveau 1 — Le Sous-bois Glissant',
    subtitle: 'Collines du sous-bois, glands & pommes de pin physiques à soulever/lancer, racines & mousse !',
    skyTop: '#ffefc2',
    skyBottom: '#b0f296',
    accentBg: '#2d5a27',
    startX: 160,
    startY: 500,
    finishX: 6200,
    finishY: 420,
    coachHint: '💡 Astuce : Vous pouvez agripper les Glands 🌰 et Pommes de pin 🌲 avec Q ou D, les soulever avec ↑ et les lancer en relâchant la touche !',
    build(world) {
      // ==================== SECTION 1 : Colline du Chêne & Premiers Glands ====================
      world.addPolyline([
        [-200, 260], [-200, 560], [0, 560], [260, 560], [440, 535], [600, 560],
        [780, 530], [950, 470], [1130, 420], [1220, 640], [1560, 640], [1640, 465]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Elevated gnarled tree branch over the hollow
      world.addPolyline([
        [1110, 420], [1240, 415], [1420, 425], [1575, 465]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addMushroom(1380, 605, 40, 380, 0.12);

      // Grabbable Acorns & Pinecones in Section 1!
      world.addProp('acorn', 490, 505, 1.0);
      world.addProp('pinecone', 860, 465, 1.05);
      world.addProp('acorn', 1310, 385, 1.0);

      // Scenic decorations
      world.addDecoration('flower', 220, 560, 1.1);
      world.addDecoration('fern', 640, 555, 1.2);
      world.addDecoration('rock', 1020, 450, 1.0);

      // ==================== CHECKPOINT 1 ====================
      world.addPolyline([
        [1565, 465], [1740, 460], [1900, 460]
      ], 'dirt', { thickness: 24, isGroundMass: true });
      world.addCheckpoint(1740, 460, 'Checkpoint 1');
      world.addDecoration('flower', 1820, 460, 1.0);

      // ==================== SECTION 2 : La Pente de Mousse & Pommes de Pin ====================
      world.addPolyline([
        [1890, 460], [2090, 530], [2290, 595]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addMushroom(2355, 580, 42, 410, 0.16);

      // Continuous forest floor & root canopy
      world.addPolyline([
        [2280, 595], [2450, 650], [2650, 515], [2950, 565], [3320, 565], [3430, 440]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // High gnarled branch bridge
      world.addPolyline([
        [2500, 455], [2700, 410], [2920, 425], [3120, 395], [3430, 440]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addMushroom(3120, 530, 38, 370, 0.1);

      // Acorns & Pinecones obstructing the branch & valley
      world.addProp('pinecone', 2740, 375, 1.1);
      world.addProp('acorn', 2980, 390, 1.0);
      world.addProp('acorn', 2820, 525, 1.05);

      world.addDecoration('fern', 2580, 520, 1.3);
      world.addDecoration('flower', 3250, 565, 1.1);

      // ==================== CHECKPOINT 2 ====================
      world.addPolyline([
        [3420, 440], [3600, 440], [3780, 440]
      ], 'dirt', { thickness: 24, isGroundMass: true });
      world.addCheckpoint(3600, 440, 'Checkpoint 2');

      // ==================== SECTION 3 : Les Racines Géantes & Vallon des Glands ====================
      world.addPolyline([
        [3770, 440], [3950, 375], [4130, 360]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [4120, 360], [4300, 425], [4480, 495]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [4470, 495], [4690, 505], [4870, 455], [5200, 455]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addMushroom(4670, 470, 42, 390, 0.15);

      // Cluster of Acorns & Pinecones to grab, lift or throw!
      world.addProp('pinecone', 3990, 335, 1.1);
      world.addProp('acorn', 4060, 330, 1.0);
      world.addProp('pinecone', 4800, 425, 1.05);

      world.addDecoration('rock', 3880, 405, 1.2);
      world.addDecoration('fern', 4550, 500, 1.2);

      // ==================== CHECKPOINT 3 ====================
      world.addCheckpoint(5030, 455, 'Checkpoint 3');

      // ==================== SECTION 4 : Le Sprint Final du Sous-bois ====================
      world.addPolyline([
        [5190, 455], [5380, 395], [5560, 385]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [5550, 385], [5740, 465], [5900, 490]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addMushroom(5955, 475, 42, 390, 0.15);

      world.addProp('acorn', 5440, 355, 1.05);
      world.addProp('pinecone', 5510, 350, 1.1);

      // Finish Plateau
      world.addPolyline([
        [5890, 490], [6030, 420], [6600, 420], [6600, 180]
      ], 'dirt', { thickness: 26, isGroundMass: true });

      world.addDecoration('flower', 6090, 420, 1.2);
      world.addDecoration('fern', 6320, 420, 1.3);
    }
  },

  {
    id: 1,
    name: 'Niveau 2 — Le Potager Suspendu',
    subtitle: 'Feuilles de chou oscillantes, tiges de tomates, glands, pommes de pin & pucerons !',
    skyTop: '#d4fcff',
    skyBottom: '#ffe596',
    accentBg: '#236937',
    startX: 150,
    startY: 540,
    finishX: 6400,
    finishY: 360,
    coachHint: '💡 Niveau 2 : Escaladez les tiges de tomates 🍅, soulevez les glands/pommes de pin 🌰 qui pèsent sur les feuilles de chou 🥬 et poussez les pucerons !',
    build(world) {
      // ==================== SECTION 1 : Les Buttes du Potager ====================
      world.addPolyline([
        [-200, 300], [-200, 590], [420, 590], [580, 560], [660, 650], [1150, 650], [1290, 340], [1560, 380], [1840, 380]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addAphid(340, 555, 22, 220, 450);
      world.addProp('acorn', 510, 530, 1.0);

      // Oscillating Cabbage Leaf #1 (with an Acorn sitting on it!)
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 730,
        pivotY: 545,
        localPoints: [[-140, 8], [-45, -8], [45, -8], [140, 8]],
        baseAngle: -0.04,
        stiffness: 18,
        damping: 2.8,
        maxAngle: 0.48,
        inertia: 16500,
        thickness: 22
      });
      world.addProp('acorn', 760, 515, 1.0);

      // Tomato Vine #1
      world.addPolyline([
        [865, 540], [960, 410], [1040, 340], [1290, 340]
      ], 'stem', { thickness: 26, isGroundMass: false });

      world.addAphid(1160, 305, 22, 1070, 1250);
      world.addProp('pinecone', 1450, 340, 1.05);

      world.addDecoration('tomato', 990, 380, 1.1);
      world.addDecoration('flower', 260, 590, 1.1);

      // ==================== CHECKPOINT 1 ====================
      world.addCheckpoint(1690, 380, 'Checkpoint 1');

      // ==================== SECTION 2 : Les Tuyaux d'Arrosage & Pommes de Pin ====================
      world.addDynamicPlatform({
        type: 'hose',
        material: 'hose',
        pivotX: 1980,
        pivotY: 395,
        localPoints: [[-145, 6], [-50, -12], [50, -12], [145, 6]],
        baseAngle: 0,
        stiffness: 16,
        damping: 2.4,
        maxAngle: 0.48,
        wobbleFreq: 1.5,
        wobbleAmp: 0.09,
        inertia: 15000,
        thickness: 28
      });

      world.addDynamicPlatform({
        type: 'hose',
        material: 'hose',
        pivotX: 2300,
        pivotY: 410,
        localPoints: [[-145, 6], [-50, -12], [50, -12], [145, 6]],
        baseAngle: -0.04,
        stiffness: 16,
        damping: 2.4,
        maxAngle: 0.48,
        wobbleFreq: 1.7,
        wobbleAmp: 0.1,
        inertia: 15000,
        thickness: 28
      });

      world.addPolyline([
        [1820, 380], [1900, 620], [2440, 620], [2540, 420], [2860, 420]
      ], 'dirt', { thickness: 24, isGroundMass: true });
      world.addMushroom(2140, 585, 42, 400, 0.1);

      world.addProp('acorn', 2580, 385, 1.0);

      // ==================== CHECKPOINT 2 ====================
      world.addCheckpoint(2680, 420, 'Checkpoint 2');

      // ==================== SECTION 3 : La Grande Tige de Tomate & Choux Suspendus ====================
      world.addPolyline([
        [2840, 420], [2920, 290], [2970, 180], [3220, 180]
      ], 'stem', { thickness: 26, isGroundMass: false });
      world.addDecoration('tomato', 2930, 250, 1.2);

      world.addAphid(3100, 145, 23, 3000, 3190);

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 3390,
        pivotY: 220,
        localPoints: [[-145, 8], [0, -10], [145, 8]],
        baseAngle: 0.05,
        stiffness: 18,
        damping: 2.6,
        maxAngle: 0.48,
        inertia: 16000,
        thickness: 22
      });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 3710,
        pivotY: 270,
        localPoints: [[-145, 8], [0, -10], [145, 8]],
        baseAngle: 0.04,
        stiffness: 18,
        damping: 2.6,
        maxAngle: 0.48,
        inertia: 16000,
        thickness: 22
      });

      world.addPolyline([
        [2850, 420], [3350, 480], [3850, 480], [3980, 340], [4330, 340]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addProp('pinecone', 3520, 445, 1.1);
      world.addProp('acorn', 3990, 305, 1.0);

      // ==================== CHECKPOINT 3 ====================
      world.addCheckpoint(4120, 340, 'Checkpoint 3');

      // ==================== SECTION 4 : La Serre Finale ====================
      world.addDynamicPlatform({
        type: 'hose',
        material: 'hose',
        pivotX: 4490,
        pivotY: 365,
        localPoints: [[-145, 6], [-50, -12], [50, -12], [145, 6]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.4,
        maxAngle: 0.48,
        wobbleFreq: 1.8,
        wobbleAmp: 0.1,
        inertia: 15000,
        thickness: 28
      });

      world.addPolyline([
        [4320, 340], [4450, 560], [4680, 420], [4920, 450], [5180, 350], [5450, 350], [5750, 540], [5900, 360], [6750, 360], [6750, 140]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addAphid(5310, 315, 22, 5210, 5410);
      world.addProp('pinecone', 5020, 390, 1.05);
      world.addProp('acorn', 5880, 325, 1.0);

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 5620,
        pivotY: 365,
        localPoints: [[-145, 8], [0, -10], [145, 8]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.6,
        maxAngle: 0.48,
        inertia: 16000,
        thickness: 22
      });
    }
  },

  {
    id: 2,
    name: 'Niveau 3 — Le Pique-nique Ravagé',
    subtitle: 'Canettes géantes, emballages froissés, miettes collantes, fourchettes, glands & pommes de pin !',
    skyTop: '#ffd6ba',
    skyBottom: '#fff2b2',
    accentBg: '#8c2d19',
    startX: 150,
    startY: 500,
    finishX: 6500,
    finishY: 420,
    coachHint: '💡 Niveau 3 : Franchissez les fourchettes 🍴, glissez sur les canettes 🥫, dégagez les pommes de pin 🌲 et arrachez-vous des miettes collantes 🍪 avec ESPACE !',
    build(world) {
      // ==================== SECTION 1 : La Pelouse du Pique-nique & Canette #1 ====================
      world.addPolyline([
        [-200, 260], [-200, 550], [440, 550], [680, 450], [920, 370], [1020, 450],
        [1160, 520], [1320, 455], [1480, 515], [1640, 450], [2220, 450]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addStickyCrumb(320, 532, 26);
      world.addProp('acorn', 390, 515, 1.0);

      // Soda Can overlay ramp
      world.addPolyline([
        [430, 548], [680, 448], [920, 368], [1020, 448]
      ], 'can', { thickness: 28, isGroundMass: false });

      // Planted Fork #1
      world.addPolyline([
        [720, 435], [720, 370]
      ], 'fork', { thickness: 14, isGroundMass: false });

      // Crumpled Plastic Wrapper overlay
      world.addPolyline([
        [1000, 448], [1160, 518], [1320, 453], [1480, 513], [1640, 448]
      ], 'plastic', { thickness: 22, isGroundMass: false });

      world.addStickyCrumb(1160, 500, 27);
      world.addProp('pinecone', 1320, 420, 1.05);

      // ==================== CHECKPOINT 1 ====================
      world.addCheckpoint(1810, 450, 'Checkpoint 1');

      // ==================== SECTION 2 : Fourchette #2 & Descente Métallique ====================
      world.addPolyline([
        [2080, 450], [2080, 380]
      ], 'fork', { thickness: 15, isGroundMass: false });

      world.addPolyline([
        [2210, 450], [2480, 530], [2740, 600], [2920, 460], [3120, 495], [3320, 440], [3690, 440]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [2210, 448], [2480, 528], [2740, 598]
      ], 'can', { thickness: 28, isGroundMass: false });

      world.addMushroom(2810, 585, 42, 410, 0.16);
      world.addProp('acorn', 2980, 430, 1.0);
      world.addStickyCrumb(3120, 478, 28);

      // ==================== CHECKPOINT 2 ====================
      world.addCheckpoint(3500, 440, 'Checkpoint 2');

      // ==================== SECTION 3 : La Table Renversée & Les Miettes ====================
      world.addPolyline([
        [3680, 440], [3920, 360], [4180, 360], [4420, 450], [4600, 530], [4780, 465], [4960, 520], [5140, 450], [5510, 450]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [3670, 438], [3920, 358], [4180, 358], [4420, 448]
      ], 'can', { thickness: 28, isGroundMass: false });

      world.addStickyCrumb(3980, 342, 26);
      world.addProp('pinecone', 4100, 325, 1.1);

      world.addPolyline([
        [4300, 405], [4300, 335]
      ], 'fork', { thickness: 14, isGroundMass: false });

      world.addMushroom(4600, 498, 38, 380, 0.12);
      world.addProp('acorn', 4820, 440, 1.0);

      // ==================== CHECKPOINT 3 ====================
      world.addCheckpoint(5320, 450, 'Checkpoint 3');

      // ==================== SECTION 4 : Le Panier Final ====================
      world.addPolyline([
        [5500, 450], [5740, 380], [5980, 450], [6220, 420], [6850, 420], [6850, 180]
      ], 'dirt', { thickness: 26, isGroundMass: true });

      world.addPolyline([
        [5490, 448], [5740, 378], [5980, 448], [6220, 418]
      ], 'can', { thickness: 26, isGroundMass: false });

      world.addStickyCrumb(5860, 408, 27);
      world.addProp('pinecone', 5740, 345, 1.05);

      world.addPolyline([
        [6080, 435], [6080, 365]
      ], 'fork', { thickness: 14, isGroundMass: false });
    }
  }
];

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
  }

  // Rich Multi-Layered Parallax Background (Trees, Hills, Giant Plants, Sunbeams)
  drawBackground(ctx, width, height, cameraX, cameraY, level, time) {
    // 1. Warm Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, level.skyTop);
    grad.addColorStop(1, level.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Soft Golden Sun & Sunbeams
    ctx.save();
    ctx.fillStyle = 'rgba(255, 250, 200, 0.45)';
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.18, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 253, 215, 0.18)';
    for (let i = 0; i < 5; i++) {
      const bx = ((i * 420 - cameraX * 0.05) % (width + 500) + (width + 500)) % (width + 500) - 250;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx + 120, 0);
      ctx.lineTo(bx + 320, height);
      ctx.lineTo(bx + 150, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Far Parallax Layer: Rolling Cartoon Hills & Giant Tree Trunks / Garden Fence
    ctx.save();
    const farShift = cameraX * 0.12;
    const hillColor = level.id === 0 ? '#74c668' : (level.id === 1 ? '#80d472' : '#f2b880');
    const hillBorder = level.id === 0 ? '#3b7a33' : (level.id === 1 ? '#418538' : '#b56e35');

    ctx.fillStyle = hillColor;
    ctx.strokeStyle = hillBorder;
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

    // Giant Background Trees / Garden Stakes / Picnic Items
    const midShift = cameraX * 0.24;
    for (let i = -1; i < 12; i++) {
      const tx = i * 340 - (midShift % 340);
      if (level.id === 0) {
        // Giant oak tree trunk & canopy in background
        ctx.fillStyle = 'rgba(107, 68, 35, 0.35)';
        ctx.fillRect(tx, height * 0.1, 64, height * 0.65);
        ctx.fillStyle = 'rgba(58, 125, 52, 0.38)';
        ctx.beginPath();
        ctx.arc(tx + 32, height * 0.15, 110, 0, Math.PI * 2);
        ctx.arc(tx - 30, height * 0.22, 80, 0, Math.PI * 2);
        ctx.arc(tx + 95, height * 0.22, 85, 0, Math.PI * 2);
        ctx.fill();
      } else if (level.id === 1) {
        // Giant garden trellis & hanging tomatoes
        ctx.fillStyle = 'rgba(92, 148, 71, 0.32)';
        ctx.fillRect(tx, height * 0.15, 22, height * 0.6);
        ctx.fillStyle = 'rgba(235, 64, 52, 0.35)';
        ctx.beginPath();
        ctx.arc(tx + 45, height * 0.34, 42, 0, Math.PI * 2);
        ctx.arc(tx - 35, height * 0.44, 36, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Giant checkered picnic thermos / basket silhouette
        ctx.fillStyle = 'rgba(209, 73, 56, 0.25)';
        ctx.beginPath();
        ctx.roundRect(tx, height * 0.32, 95, 160, 18);
        ctx.fill();
      }
    }
    ctx.restore();

    // 4. Mid-Near Parallax Layer: Bushy Cartoon Foliage & Giant Grass Blades
    ctx.save();
    const nearShift = cameraX * 0.38;
    const bushColor = level.id === 0 ? '#4ca644' : (level.id === 1 ? '#52b548' : '#e08e55');
    ctx.fillStyle = bushColor;
    ctx.strokeStyle = '#255220';
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

  drawWorld(ctx, world, level, time, isVictory) {
    // 1. Draw Complete Filled Cartoon Terrain Masses (Underground earth, pebbles, strata, grass & flowers!)
    for (const chain of world.terrainChains) {
      if (chain.isGroundMass) {
        this.drawCompleteTerrainMass(ctx, chain, time);
      }
    }

    // 2. Draw Background Scenic Decorations (Ferns, Flowers, Rocks, Tomatoes)
    for (const dec of world.decorations) {
      this.drawDecoration(ctx, dec, time);
    }

    // 3. Draw Elevated Structures (Gnarled branches, Tomato vines, Soda cans, Forks, Plastic wrappers)
    for (const chain of world.terrainChains) {
      if (!chain.isGroundMass) {
        this.drawElevatedStructure(ctx, chain, time);
      }
    }

    // 4. Draw Dynamic Oscillating Platforms (Cabbage Leaves & Unstable Garden Hoses)
    for (const plat of world.dynamicPlatforms) {
      this.drawDynamicPlatform(ctx, plat, time);
    }

    // 5. Draw Checkpoints
    for (const cp of world.checkpoints) {
      this.drawCheckpoint(ctx, cp, time);
    }

    // 6. Draw Sticky Crumbs
    for (const c of world.stickyCrumbs) {
      this.drawStickyCrumb(ctx, c, time);
    }

    // 7. Draw Bouncy Mushrooms
    for (const m of world.mushrooms) {
      this.drawMushroom(ctx, m, time);
    }

    // 8. Draw Soft Squishy Aphids
    for (const a of world.aphids) {
      this.drawAphid(ctx, a, time);
    }

    // 9. Draw Grabbable Dynamic Acorns (Glands) & Pinecones (Pommes de pin)!
    for (const prop of world.props) {
      this.drawGrabbableProp(ctx, prop, time);
    }

    // 10. Start & Finish Banners
    this.drawStartBanner(ctx, level.startX - 40, level.startY);
    this.drawFinishLine(ctx, level.finishX, level.finishY, time, isVictory);
  }

  // Draws a full, deep cartoon terrain mass with layered earth texture, pebbles, roots, and lush overhanging grass!
  drawCompleteTerrainMass(ctx, chain, time) {
    const pts = chain.points;
    if (pts.length < 2) return;

    const first = pts[0];
    const last = pts[pts.length - 1];
    const bottomY = 1350;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Main Closed Underground Polygon
    ctx.beginPath();
    ctx.moveTo(first[0], bottomY);
    for (const p of pts) {
      ctx.lineTo(p[0], p[1]);
    }
    ctx.lineTo(last[0], bottomY);
    ctx.closePath();

    // Rich warm cartoon earth gradient
    const earthGrad = ctx.createLinearGradient(0, 350, 0, 950);
    earthGrad.addColorStop(0, '#8c5828');
    earthGrad.addColorStop(0.35, '#6e421c');
    earthGrad.addColorStop(1, '#47290f');
    ctx.fillStyle = earthGrad;
    ctx.fill();

    // Clip to the underground polygon to draw cute procedural cartoon textures inside the earth!
    ctx.save();
    ctx.clip();

    // Wavy subterranean soil strata bands
    ctx.strokeStyle = 'rgba(54, 30, 10, 0.35)';
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

    // Cute cartoon pebbles, stones & rootlets embedded in the soil!
    const minX = Math.min(first[0], last[0]);
    const maxX = Math.max(first[0], last[0]);
    for (let x = minX + 40; x < maxX - 30; x += 65) {
      // Deterministic pseudo-random based on x coordinate
      const hash = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
      const hash2 = Math.abs(Math.cos(x * 78.233) * 19341.123) % 1;

      // Find approximate surface Y at this x
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

      ctx.fillStyle = hash > 0.5 ? '#a8703e' : '#613917';
      ctx.strokeStyle = '#361e09';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(x, pebbleY, pebbleR * 1.25, pebbleR * 0.85, (hash - 0.5) * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Little highlight on the pebble
      ctx.fillStyle = 'rgba(255, 235, 205, 0.35)';
      ctx.beginPath();
      ctx.arc(x - pebbleR * 0.3, pebbleY - pebbleR * 0.25, pebbleR * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // End underground clip

    // 2. Draw Top Surface Crust (Lush Cartoon Grass Turf or Glowing Slippery Moss!)
    const isMoss = chain.material === 'moss';

    // Dark cartoon outline under the grass/moss lip
    ctx.strokeStyle = '#261507';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();

    // Main grass / moss ribbon
    ctx.strokeStyle = isMoss ? '#20cf9f' : '#4ec932';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();

    // Bright top rim highlight + individual grass tufts / moss bubbles along the surface
    ctx.strokeStyle = isMoss ? '#a8fff0' : '#80ed58';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] - 4);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 4);
    ctx.stroke();

    // Cute grass blades & tiny daisies along the surface
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const segDx = p2[0] - p1[0];
      const segDy = p2[1] - p1[1];
      const segLen = Math.hypot(segDx, segDy);
      if (segLen < 20 || Math.abs(segDx) < 20) continue;

      const steps = Math.floor(segLen / 45);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const gx = p1[0] + segDx * t;
        const gy = p1[1] + segDy * t - 10;

        if (isMoss) {
          // Glossy dew drop on moss
          ctx.fillStyle = 'rgba(200, 255, 250, 0.85)';
          ctx.beginPath();
          ctx.arc(gx, gy - 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Little cartoon grass tuft
          ctx.strokeStyle = '#33991e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(gx, gy + 2);
          ctx.lineTo(gx - 5, gy - 7);
          ctx.moveTo(gx, gy + 2);
          ctx.lineTo(gx + 4, gy - 8);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  // Draw Elevated Structures (Gnarled wooden branches with supporting trunks, tomato vines, cans, forks)
  drawElevatedStructure(ctx, chain, time) {
    const pts = chain.points;
    if (pts.length < 2) return;
    const thick = chain.thickness || 24;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (chain.material === 'root') {
      // Draw wooden branch support pillars down into the ground so it looks like a real tree branch!
      const midIdx = Math.floor(pts.length / 2);
      const supportPt = pts[midIdx];
      ctx.fillStyle = '#523015';
      ctx.strokeStyle = '#261507';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(supportPt[0] - 18, supportPt[1]);
      ctx.lineTo(supportPt[0] + 18, supportPt[1]);
      ctx.lineTo(supportPt[0] + 28, supportPt[1] + 260);
      ctx.lineTo(supportPt[0] - 28, supportPt[1] + 260);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main Gnarled Branch with bark texture
      ctx.strokeStyle = '#261507';
      ctx.lineWidth = thick + 8;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#9c5e2b';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#c4834b';
      ctx.lineWidth = thick * 0.35;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - 5);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 5);
      ctx.stroke();
    } else if (chain.material === 'stem') {
      // Thick Tomato Vine with bristles & leaves
      ctx.strokeStyle = '#143814';
      ctx.lineWidth = thick + 8;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#38a832';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#78e060';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - 4);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 4);
      ctx.stroke();
    } else if (chain.material === 'can') {
      // Full 3D-shaded Cartoon Soda Can embedded in the ground
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

        // White soda wave stripe
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(p1[0] - nx * 40, p1[1] - ny * 40);
        ctx.lineTo(p2[0] - nx * 40, p2[1] - ny * 40);
        ctx.stroke();

        // Metallic silver rim
        ctx.strokeStyle = '#dce6ed';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
    } else if (chain.material === 'plastic') {
      ctx.strokeStyle = '#1f4e5f';
      ctx.lineWidth = thick + 6;
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
    } else if (chain.material === 'fork') {
      const s = { x1: pts[0][0], y1: pts[0][1], x2: pts[1][0], y2: pts[1][1] };
      ctx.strokeStyle = '#222831';
      ctx.lineWidth = thick + 6;
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

  // Draw Grabbable Acorns (Glands) & Pinecones (Pommes de pin)!
  drawGrabbableProp(ctx, prop, time) {
    ctx.save();
    ctx.translate(prop.x, prop.y);
    ctx.rotate(prop.angle);

    const r = prop.radius;

    if (prop.type === 'acorn') {
      // ==================== CARTOON ACORN (GLAND - Hitbox-Aligned) ====================
      // 1. Nut body (Glossy warm hazelnut brown with pointed bottom at (0, r*1.06))
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

      // Glossy highlight on nut
      ctx.fillStyle = 'rgba(255, 245, 215, 0.52)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.34, r * 0.22, r * 0.2, r * 0.36, -0.22, 0, Math.PI * 2);
      ctx.fill();

      // 2. Little woody stem at top
      ctx.fillStyle = '#4a280d';
      ctx.beginPath();
      ctx.roundRect(-r * 0.1, -r * 1.08, r * 0.2, r * 0.35, 4);
      ctx.fill();
      ctx.stroke();

      // 3. Textured Acorn Cap (Cupule) matching wide brim at (-r*0.96, -r*0.25)
      ctx.fillStyle = '#6e3f19';
      ctx.beginPath();
      ctx.moveTo(-r * 0.96, -r * 0.20);
      ctx.quadraticCurveTo(-r * 0.85, -r * 0.88, 0, -r * 0.90);
      ctx.quadraticCurveTo(r * 0.85, -r * 0.88, r * 0.96, -r * 0.20);
      ctx.quadraticCurveTo(0, -r * 0.02, -r * 0.96, -r * 0.20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pointed little cap scales on the cupule
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
      // ==================== GIANT SPIKY PINECONE (POMME DE PIN À ÉCAILLES POINTUES) ====================
      // 1. Woody central core
      ctx.fillStyle = '#3b1e0a';
      ctx.strokeStyle = '#241104';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.76, r * 0.86, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Outer ring of pointed protruding scales aligned with the physics polygon vertices!
      if (prop.localPoints && prop.localPoints.length > 3) {
        const pts = prop.localPoints;
        const n = pts.length - 1;
        for (let i = 0; i < n; i += 2) {
          const prev = pts[(i - 1 + n) % n];
          const tip = pts[i];
          const next = pts[(i + 1) % n];

          // Base pulled slightly inward so scales overlap organically
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

          // Lighter pointed spine/tip highlight at the outer end of each scale
          ctx.fillStyle = '#d49b63';
          ctx.beginPath();
          ctx.moveTo(tip[0] * 0.82 + bx1 * 0.18, tip[1] * 0.82 + by1 * 0.18);
          ctx.lineTo(tip[0] * 0.97, tip[1] * 0.97);
          ctx.lineTo(tip[0] * 0.82 + bx2 * 0.18, tip[1] * 0.82 + by2 * 0.18);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 3. Layered interior tiers of pointed pinecone scales (from bottom to top)
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
          // Each scale points outward and slightly downward/radially like a real pinecone!
          const splayAngle = norm * 0.48;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(splayAngle);

          ctx.fillStyle = tier.col;
          ctx.strokeStyle = '#261204';
          ctx.lineWidth = 3;

          // Pointed diamond/shield scale shape
          ctx.beginPath();
          ctx.moveTo(0, -tier.h * 0.45);
          ctx.lineTo(tier.w, 0);
          ctx.lineTo(0, tier.h * 0.68); // Sharp pointed tip!
          ctx.lineTo(-tier.w, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Light woody tip at the point of the scale
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

  drawDecoration(ctx, dec, time) {
    ctx.save();
    ctx.translate(dec.x, dec.y);
    ctx.scale(dec.scale, dec.scale);

    if (dec.type === 'flower') {
      const sway = Math.sin(time * 2 + dec.x) * 0.08;
      ctx.rotate(sway);
      // Stem
      ctx.strokeStyle = '#2d7a22';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -32, 0, -64);
      ctx.stroke();

      // Petals
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
      ctx.strokeStyle = '#24691c';
      ctx.lineWidth = 5;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(dir * 25, -45, dir * 52, -30);
        ctx.stroke();
      }
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

    if (plat.type === 'leaf') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = '#183d16';
      ctx.lineWidth = plat.thickness + 7;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#68d84b';
      ctx.lineWidth = plat.thickness;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#d4ffab';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    } else if (plat.type === 'hose') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = '#0c382c';
      ctx.lineWidth = plat.thickness + 8;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#1dd1a1';
      ctx.lineWidth = plat.thickness;
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

  drawAphid(ctx, a, time) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.scale(a.squashX * a.facing, a.squashY);

    const r = a.radius;

    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 3;
    for (let lx = -10; lx <= 10; lx += 10) {
      const legBob = Math.sin(time * 8 + lx) * 3;
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

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.45, -r * 0.2, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1b4332';
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawStickyCrumb(ctx, c, time) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const pulse = 1 + Math.sin(c.wobble) * 0.06;
    ctx.scale(pulse, 1 / pulse);

    ctx.fillStyle = 'rgba(255, 42, 109, 0.85)';
    ctx.strokeStyle = '#4a0e23';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 4, c.radius * 1.15, c.radius * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.arc(-8, -2, c.radius * 0.45, 0, Math.PI * 2);
    ctx.arc(7, 0, c.radius * 0.38, 0, Math.PI * 2);
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
