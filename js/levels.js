// js/levels.js — 9 Distinct Levels across 3 Themed Cups (Easy -> Medium -> Hard per Cup) + Cartoon Renderer

export const LEVEL_DEFINITIONS = [
  // ============================================================================
  // COUPE 1 : COUPE DU SOUS-BOIS & POTAGER (potager_geant)
  // Course 1 (id: 0) = FACILE | Course 2 (id: 1) = MOYEN | Course 3 (id: 2) = DIFFICILE
  // ============================================================================
  {
    id: 0,
    cupId: 'potager_geant',
    difficulty: 'Facile',
    theme: 'forest',
    name: 'Sous-Bois 1 — L’Orée des Chênes (Facile)',
    subtitle: 'Initiation douce : collines d’herbe, branches basses, glands de soin (+20 ❤️) & premiers pucerons (+1 Segment) !',
    skyTop: '#ffefc2',
    skyBottom: '#b8f59e',
    accentBg: '#2d5a27',
    startX: 160,
    startY: 500,
    finishX: 4800,
    finishY: 440,
    coachHint: '💡 <strong>Facile — L’Orée des Chênes :</strong> Cassez les <strong>Glands 🌰</strong> pour obtenir une <strong>Pomme de Soin (+20 ❤️)</strong>, et éliminez les <strong>Pucerons 🐛</strong> en les lançant pour gagner une <strong>Pomme +1 Segment 🍏</strong> !',
    build(world) {
      // SECTION 1 : Collines douces & Premiers Glands de soin
      world.addPolyline([
        [-200, 260], [-200, 560], [0, 560], [340, 560], [560, 520], [820, 550],
        [1080, 490], [1320, 490], [1500, 540], [1720, 480]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Branche basse facile à grimper
      world.addPolyline([
        [780, 470], [960, 420], [1160, 420], [1320, 490]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addProp('acorn', 450, 490, 1.0);
      world.addAphid(670, 520, 22, 560, 760);
      world.addProp('acorn', 1050, 390, 1.0);
      world.addPowerUp(1050, 310, 'speed');

      world.addDecoration('flower', 240, 560, 1.1);
      world.addDecoration('fern', 610, 540, 1.2);
      world.addDecoration('flower', 1240, 490, 1.0);

      // CHECKPOINT 1 (Rapproché)
      world.addCheckpoint(1580, 510, 'Checkpoint 1');

      // SECTION 2 : Le Petit Vallon & Feuille Portante
      world.addPolyline([
        [1710, 480], [1900, 580], [2280, 580], [2480, 460], [2980, 460]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addMushroom(2080, 545, 42, 380, 0.08);

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 2090,
        pivotY: 410,
        moveX: 85,
        moveY: 15,
        moveSpeed: 0.9,
        localPoints: [[-110, 0], [-35, -6], [35, -6], [110, 0]],
        baseAngle: 0,
        stiffness: 20,
        damping: 3.0,
        thickness: 20
      });

      world.addProp('acorn', 2580, 430, 1.0);
      world.addAphid(2740, 435, 22, 2620, 2880);
      world.addDecoration('rock', 1820, 520, 1.0);
      world.addDecoration('fern', 2840, 460, 1.2);

      // CHECKPOINT 2
      world.addCheckpoint(2900, 460, 'Checkpoint 2');

      // SECTION 3 : Pont de Soie & Dernière Colline vers l'Arrivée
      world.addPolyline([
        [2970, 460], [3220, 410], [3480, 490], [3850, 490], [4120, 420],
        [4420, 440], [5200, 440], [5200, 180]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Pont de soie de chenille au-dessus du creux
      world.addPolyline([
        [3200, 410], [3520, 385], [3840, 410], [4120, 420]
      ], 'silk', { thickness: 20, isGroundMass: false });

      world.addMushroom(3660, 455, 40, 370, 0.05);
      world.addProp('acorn', 3520, 355, 1.0);
      world.addAphid(3980, 395, 22, 3880, 4100);
      world.addPowerUp(3520, 275, 'feather');

      world.addDecoration('flower', 4320, 440, 1.2);
      world.addDecoration('fern', 4560, 440, 1.3);
    }
  },

  {
    id: 1,
    cupId: 'potager_geant',
    difficulty: 'Moyen',
    theme: 'garden',
    name: 'Sous-Bois 2 — Le Potager Suspendu (Moyen)',
    subtitle: 'Tiges de tomates à grimper, feuilles de chou oscillantes, tuyaux d’arrosage, ronces & premiers hérissons !',
    skyTop: '#d4fcff',
    skyBottom: '#ffe596',
    accentBg: '#236937',
    startX: 150,
    startY: 540,
    finishX: 5750,
    finishY: 380,
    coachHint: '💡 <strong>Moyen — Le Potager :</strong> Grimpez sur les tiges de tomates 🌱 pour éviter les ronces  thorny, et saisissez les <strong>Hérissons 🦔 par le museau avant (D)</strong> pour les projeter et gagner <strong>+1 Segment 🍏</strong> !',
    build(world) {
      // SECTION 1 : Les Buttes du Potager & Première Tige de Tomate
      world.addPolyline([
        [-200, 300], [-200, 580], [440, 580], [620, 540], [740, 640],
        [1220, 640], [1360, 380], [1860, 380]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addProp('acorn', 380, 550, 1.0);
      world.addAphid(520, 535, 22, 420, 610);

      // Buisson de ronces au fond du fossé + hérisson
      world.addThorn(860, 625, 28);
      world.addHedgehog(1040, 620, 28, 920, 1180);

      // Feuille de chou oscillante + Tige de tomate pour passer par le haut
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 780,
        pivotY: 500,
        localPoints: [[-130, 6], [-40, -8], [40, -8], [130, 6]],
        baseAngle: -0.04,
        stiffness: 18,
        damping: 2.8,
        maxAngle: 0.45,
        inertia: 16500,
        thickness: 22
      });

      world.addPolyline([
        [930, 490], [1060, 390], [1200, 340], [1360, 380]
      ], 'stem', { thickness: 26, isGroundMass: false });

      world.addProp('acorn', 1180, 310, 1.0);
      world.addPowerUp(1180, 230, 'strength');
      world.addDecoration('tomato', 1050, 370, 1.15);
      world.addDecoration('flower', 260, 580, 1.1);

      // CHECKPOINT 1
      world.addCheckpoint(1680, 380, 'Checkpoint 1');

      // SECTION 2 : Tuyaux d'Arrosage & Sève Collante
      world.addPolyline([
        [1850, 380], [1980, 600], [2680, 600], [2820, 420], [3420, 420]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addDynamicPlatform({
        type: 'hose',
        material: 'hose',
        pivotX: 2140,
        pivotY: 390,
        localPoints: [[-140, 6], [-45, -10], [45, -10], [140, 6]],
        baseAngle: 0,
        stiffness: 16,
        damping: 2.5,
        maxAngle: 0.45,
        wobbleFreq: 1.4,
        wobbleAmp: 0.08,
        thickness: 26
      });

      world.addDynamicPlatform({
        type: 'hose',
        material: 'hose',
        pivotX: 2500,
        pivotY: 400,
        moveX: 85,
        moveY: 18,
        moveSpeed: 1.0,
        localPoints: [[-140, 6], [-45, -10], [45, -10], [140, 6]],
        baseAngle: -0.03,
        stiffness: 16,
        damping: 2.5,
        maxAngle: 0.45,
        thickness: 26
      });

      world.addMushroom(2320, 565, 42, 390, 0.08);
      world.addStickyCrumb(2980, 404, 26, 'sap');
      world.addProp('pinecone', 3140, 380, 1.0);
      world.addAphid(3260, 395, 22, 3180, 3380);

      // CHECKPOINT 2
      world.addCheckpoint(3340, 420, 'Checkpoint 2');

      // SECTION 3 : Grande Ascension du Treillis & Sprint vers la Serre
      world.addPolyline([
        [3410, 420], [3620, 520], [4180, 520], [4350, 360], [4880, 360],
        [5120, 450], [5380, 380], [6150, 380], [6150, 150]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Tige de tomate en arche au-dessus des ronces
      world.addPolyline([
        [3450, 410], [3640, 290], [3920, 270], [4180, 330], [4350, 360]
      ], 'stem', { thickness: 26, isGroundMass: false });
      world.addDecoration('tomato', 3640, 260, 1.2);
      world.addDecoration('tomato', 3920, 240, 1.1);

      world.addThorn(3760, 505, 30);
      world.addHedgehog(3980, 500, 28, 3840, 4120);
      world.addProp('acorn', 3920, 240, 1.0);
      world.addPowerUp(3920, 165, 'speed');

      // CHECKPOINT 3
      world.addCheckpoint(4620, 360, 'Checkpoint 3');

      world.addStickyCrumb(4780, 344, 25, 'sap');
      world.addHedgehog(5240, 425, 28, 5100, 5360);
      world.addProp('acorn', 5520, 350, 1.0);
    }
  },

  {
    id: 2,
    cupId: 'potager_geant',
    difficulty: 'Difficile',
    theme: 'canopy',
    name: 'Sous-Bois 3 — La Canopée des Chênes (Difficile)',
    subtitle: 'Hautes branches superposées, ponts de soie, pentes de mousse glissante, pommes de pin géantes & ronces !',
    skyTop: '#ffeaa7',
    skyBottom: '#7bed9f',
    accentBg: '#1e4620',
    startX: 150,
    startY: 520,
    finishX: 6450,
    finishY: 320,
    coachHint: '💡 <strong>Difficile — La Canopée :</strong> Escaladez les hautes branches de chêne 🌳 et les fils de soie 🕸️ ! Attention à la mousse glissante, aux pommes de pin géantes 🌲 et aux fossés de ronces !',
    build(world) {
      // SECTION 1 : Montée sur les Racines & Pente de Mousse
      world.addPolyline([
        [-200, 280], [-200, 560], [380, 560], [640, 480], [880, 420]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [870, 420], [1160, 520], [1420, 610]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [1410, 610], [1820, 610], [1980, 430], [2340, 430]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Double étage de branches au-dessus de la pente de mousse et des ronces
      world.addPolyline([
        [840, 415], [1080, 330], [1380, 310], [1680, 350], [1980, 430]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addThorn(1560, 595, 30);
      world.addMushroom(1740, 575, 42, 410, 0.12);
      world.addProp('pinecone', 1360, 270, 1.05);
      world.addProp('acorn', 1080, 300, 1.0);
      world.addHedgehog(640, 460, 28, 500, 780);
      world.addAphid(1640, 325, 22, 1520, 1780);

      // CHECKPOINT 1
      world.addCheckpoint(2160, 430, 'Checkpoint 1');

      // SECTION 2 : Les Balançoires de Soie & Le Gouffre des Ronces
      world.addPolyline([
        [2330, 430], [2500, 640], [3480, 640], [3660, 390], [4120, 390]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addThorn(2720, 625, 32);
      world.addThorn(3180, 625, 32);
      world.addMushroom(2950, 605, 44, 430, 0.0);

      // Hamacs / Balançoires de soie suspendus en hauteur
      world.addDynamicPlatform({
        type: 'silk_swing',
        material: 'silk',
        pivotX: 2680,
        pivotY: 360,
        moveX: 110,
        moveY: 20,
        moveSpeed: 1.25,
        localPoints: [[-110, 10], [-35, -6], [35, -6], [110, 10]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.6,
        thickness: 20
      });

      world.addDynamicPlatform({
        type: 'silk_swing',
        material: 'silk',
        pivotX: 3220,
        pivotY: 330,
        moveX: -115,
        moveY: 25,
        moveSpeed: 1.3,
        localPoints: [[-110, 10], [-35, -6], [35, -6], [110, 10]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.6,
        thickness: 20
      });

      world.addPowerUp(2950, 210, 'strength');
      world.addProp('acorn', 3780, 360, 1.0);
      world.addHedgehog(3920, 370, 28, 3760, 4060);

      // CHECKPOINT 2
      world.addCheckpoint(4020, 390, 'Checkpoint 2');

      // SECTION 3 : Escalade de la Cime Géante
      world.addPolyline([
        [4110, 390], [4380, 490], [4680, 560]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [4670, 560], [5200, 560], [5450, 420], [5750, 320], [6850, 320], [6850, 120]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Grande structure de branches & fils de soie à 2 niveaux
      world.addPolyline([
        [4250, 380], [4520, 280], [4850, 280], [5120, 340]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addPolyline([
        [5080, 340], [5380, 250], [5680, 250], [5880, 320]
      ], 'silk', { thickness: 20, isGroundMass: false });

      world.addStickyCrumb(4700, 264, 27, 'sap');
      world.addProp('pinecone', 4820, 240, 1.1);
      world.addAphid(4960, 535, 22, 4780, 5120);
      world.addHedgehog(5560, 230, 28, 5420, 5660);
      world.addProp('acorn', 5380, 220, 1.0);

      // CHECKPOINT 3
      world.addCheckpoint(5460, 420, 'Checkpoint 3');

      world.addProp('pinecone', 6060, 280, 1.1);
      world.addStickyCrumb(6200, 304, 27, 'sap');
    }
  },

  // ============================================================================
  // COUPE 2 : COUPE DE LA VALLÉE FÉERIQUE (vallee_folle)
  // Course 1 (id: 3) = FACILE | Course 2 (id: 4) = MOYEN | Course 3 (id: 5) = DIFFICILE
  // ============================================================================
  {
    id: 3,
    cupId: 'vallee_folle',
    difficulty: 'Facile',
    theme: 'mushroom',
    name: 'Vallée 1 — La Clairière aux Champignons (Facile)',
    subtitle: 'Univers fongique féerique : terrasses de champignons géants, rebonds joyeux, glands de soin & pucerons !',
    skyTop: '#f3e7ff',
    skyBottom: '#b8fff9',
    accentBg: '#4a2c6d',
    startX: 160,
    startY: 500,
    finishX: 4900,
    finishY: 420,
    coachHint: '💡 <strong>Facile — Clairière aux Champignons :</strong> Rebondissez sur les champignons 🍄, grimpez sur les grands chapeaux fongiques et éliminez les pucerons pour grandir d’un segment 🍏 !',
    build(world) {
      // SECTION 1 : Terrasses Fongiques Douces
      world.addPolyline([
        [-200, 260], [-200, 550], [420, 550], [660, 490], [980, 550],
        [1360, 550], [1600, 470], [1920, 470]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Grand plateau de champignon géant facile d'accès
      world.addPolyline([
        [940, 440], [1160, 415], [1380, 440]
      ], 'mushroom_cap', { thickness: 28, isGroundMass: false });

      world.addMushroom(820, 515, 42, 380, 0.05);
      world.addProp('acorn', 540, 490, 1.0);
      world.addAphid(1160, 390, 22, 1020, 1300);
      world.addProp('acorn', 1480, 480, 1.0);

      world.addDecoration('flower', 280, 550, 1.2);
      world.addDecoration('fern', 1720, 470, 1.2);

      // CHECKPOINT 1
      world.addCheckpoint(1780, 470, 'Checkpoint 1');

      // SECTION 2 : La Vallée des Spores & Pont de Soie
      world.addPolyline([
        [1910, 470], [2120, 590], [2680, 590], [2900, 450], [3360, 450]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addMushroom(2260, 555, 44, 395, 0.08);
      world.addMushroom(2540, 555, 44, 395, -0.06);

      // Terrasse de champignon au milieu + fil de soie
      world.addPolyline([
        [2240, 390], [2560, 390]
      ], 'mushroom_cap', { thickness: 28, isGroundMass: false });

      world.addPowerUp(2400, 290, 'feather');
      world.addProp('acorn', 2400, 360, 1.0);
      world.addAphid(3080, 425, 22, 2960, 3220);

      // CHECKPOINT 2
      world.addCheckpoint(3240, 450, 'Checkpoint 2');

      // SECTION 3 : Les Escaliers de Champignons vers l'Arrivée
      world.addPolyline([
        [3350, 450], [3660, 520], [4120, 520], [4380, 420], [5300, 420], [5300, 180]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [3560, 410], [3820, 390], [4060, 410]
      ], 'mushroom_cap', { thickness: 28, isGroundMass: false });

      world.addMushroom(3480, 480, 40, 375, 0.06);
      world.addProp('acorn', 3820, 360, 1.0);
      world.addAphid(4240, 445, 22, 4120, 4340);
      world.addPowerUp(3820, 280, 'speed');

      // CHECKPOINT 3
      world.addCheckpoint(4460, 420, 'Checkpoint 3');
    }
  },

  {
    id: 4,
    cupId: 'vallee_folle',
    difficulty: 'Moyen',
    theme: 'marsh',
    name: 'Vallée 2 — Le Marais des Nénuphars (Moyen)',
    subtitle: 'Feuilles de nénuphar flottantes, grandes tiges de roseaux à grimper, mousse humide, toiles & hérissons !',
    skyTop: '#c7ecee',
    skyBottom: '#dff9fb',
    accentBg: '#136f63',
    startX: 150,
    startY: 510,
    finishX: 5850,
    finishY: 390,
    coachHint: '💡 <strong>Moyen — Le Marais :</strong> Traversez sur les <strong>Nénuphars flottants 🪷</strong>, escaladez les <strong>Roseaux 🎋</strong> et méfiez-vous des toiles gluantes et des hérissons sur les berges !',
    build(world) {
      // SECTION 1 : La Berge Brumeuse & Premier Étang de Nénuphars
      world.addPolyline([
        [-200, 280], [-200, 550], [440, 550], [640, 630], [1340, 630],
        [1520, 460], [1960, 460]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 820,
        pivotY: 515,
        moveX: 70,
        moveY: 12,
        moveSpeed: 1.0,
        localPoints: [[-125, 0], [-40, -6], [40, -6], [125, 0]],
        baseAngle: 0,
        stiffness: 20,
        damping: 3.0,
        thickness: 22
      });

      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 1180,
        pivotY: 495,
        moveX: -70,
        moveY: 12,
        moveSpeed: 1.05,
        localPoints: [[-125, 0], [-40, -6], [40, -6], [125, 0]],
        baseAngle: 0,
        stiffness: 20,
        damping: 3.0,
        thickness: 22
      });

      world.addThorn(990, 615, 28);
      world.addProp('acorn', 360, 520, 1.0);
      world.addAphid(820, 485, 22, 730, 910);
      world.addHedgehog(1680, 440, 28, 1540, 1820);

      // CHECKPOINT 1
      world.addCheckpoint(1860, 460, 'Checkpoint 1');

      // SECTION 2 : La Forêt de Roseaux & Pente de Mousse Humide
      world.addPolyline([
        [1950, 460], [2200, 540], [2440, 600]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [2430, 600], [3120, 600], [3320, 420], [3820, 420]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Grandes tiges de roseaux arquées à grimper au-dessus du marais
      world.addPolyline([
        [2040, 455], [2220, 320], [2520, 300], [2780, 360]
      ], 'reed', { thickness: 24, isGroundMass: false });

      world.addPolyline([
        [2740, 360], [3020, 290], [3260, 350], [3320, 420]
      ], 'reed', { thickness: 24, isGroundMass: false });

      world.addStickyCrumb(2520, 284, 26, 'web');
      world.addProp('acorn', 2380, 275, 1.0);
      world.addPowerUp(3020, 210, 'length');
      world.addAphid(2840, 575, 22, 2680, 3020);
      world.addProp('pinecone', 3520, 385, 1.05);

      // CHECKPOINT 2
      world.addCheckpoint(3700, 420, 'Checkpoint 2');

      // SECTION 3 : Le Grand Lagon aux Lotus
      world.addPolyline([
        [3810, 420], [4020, 620], [4920, 620], [5140, 390], [6250, 390], [6250, 160]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 4220,
        pivotY: 460,
        moveX: 95,
        moveY: 16,
        moveSpeed: 1.15,
        localPoints: [[-130, 0], [-40, -6], [40, -6], [130, 0]],
        baseAngle: 0,
        stiffness: 19,
        damping: 2.8,
        thickness: 22
      });

      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 4680,
        pivotY: 430,
        moveX: -95,
        moveY: 16,
        moveSpeed: 1.2,
        localPoints: [[-130, 0], [-40, -6], [40, -6], [130, 0]],
        baseAngle: 0,
        stiffness: 19,
        damping: 2.8,
        thickness: 22
      });

      world.addMushroom(4450, 585, 42, 410, 0.0);
      world.addThorn(4140, 605, 28);
      world.addThorn(4780, 605, 28);

      // CHECKPOINT 3
      world.addCheckpoint(5240, 390, 'Checkpoint 3');

      world.addStickyCrumb(5440, 374, 26, 'web');
      world.addHedgehog(5600, 370, 28, 5480, 5760);
      world.addProp('acorn', 5360, 360, 1.0);
    }
  },

  {
    id: 5,
    cupId: 'vallee_folle',
    difficulty: 'Difficile',
    theme: 'hive',
    name: 'Vallée 3 — La Ruche & Le Verger Doré (Difficile)',
    subtitle: 'Rayons d’alvéoles de cire à escalader, flaques de miel ultra-collantes, cocons suspendus & gardiens !',
    skyTop: '#fff3b0',
    skyBottom: '#ffbe76',
    accentBg: '#b86b11',
    startX: 150,
    startY: 520,
    finishX: 6550,
    finishY: 340,
    coachHint: '💡 <strong>Difficile — La Ruche Dorée :</strong> Escaladez les rayons de cire 🍯, arrachez-vous des flaques de miel avec <kbd>ESPACE</kbd> et utilisez les pommes de pin et ennemis pour nettoyer la route !',
    build(world) {
      // SECTION 1 : Les Alvéoles Basses & Le Miel Collant
      world.addPolyline([
        [-200, 280], [-200, 560], [420, 560], [680, 470], [980, 470],
        [1180, 620], [1780, 620], [1980, 420], [2380, 420]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Rampe d'alvéoles de cire
      world.addPolyline([
        [940, 465], [1180, 350], [1520, 350], [1760, 415]
      ], 'honeycomb', { thickness: 26, isGroundMass: false });

      world.addStickyCrumb(560, 502, 27, 'honey');
      world.addStickyCrumb(1350, 334, 28, 'honey');
      world.addThorn(1460, 605, 30);
      world.addProp('acorn', 820, 440, 1.0);
      world.addProp('pinecone', 1500, 310, 1.05);
      world.addHedgehog(1620, 600, 28, 1500, 1740);
      world.addAphid(2120, 395, 22, 2000, 2260);

      // CHECKPOINT 1
      world.addCheckpoint(2240, 420, 'Checkpoint 1');

      // SECTION 2 : La Grande Ascension de la Ruche Royale
      world.addPolyline([
        [2370, 420], [2580, 630], [3620, 630], [3860, 400], [4320, 400]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Double étage d'alvéoles de cire à grimper !
      world.addPolyline([
        [2420, 410], [2680, 290], [3020, 290]
      ], 'honeycomb', { thickness: 26, isGroundMass: false });

      world.addPolyline([
        [2960, 290], [3240, 190], [3580, 190], [3820, 310]
      ], 'honeycomb', { thickness: 26, isGroundMass: false });

      // Balançoire de soie en secours au milieu
      world.addDynamicPlatform({
        type: 'silk_swing',
        material: 'silk',
        pivotX: 3100,
        pivotY: 450,
        moveX: 120,
        moveY: 20,
        moveSpeed: 1.2,
        localPoints: [[-115, 8], [-35, -6], [35, -6], [115, 8]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.6,
        thickness: 20
      });

      world.addThorn(2820, 615, 30);
      world.addThorn(3380, 615, 30);
      world.addPowerUp(3400, 110, 'strength');
      world.addProp('acorn', 2840, 260, 1.0);
      world.addHedgehog(3420, 170, 28, 3260, 3550);
      world.addStickyCrumb(4020, 384, 28, 'honey');

      // CHECKPOINT 2
      world.addCheckpoint(4180, 400, 'Checkpoint 2');

      // SECTION 3 : Le Verger Glissant & Les Branches d'Or
      world.addPolyline([
        [4310, 400], [4600, 510], [4880, 580]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [4870, 580], [5420, 580], [5680, 340], [6950, 340], [6950, 140]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [4560, 390], [4860, 300], [5220, 300], [5520, 350]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addMushroom(5120, 545, 42, 410, 0.1);
      world.addProp('pinecone', 5040, 260, 1.1);
      world.addProp('acorn', 4880, 270, 1.0);
      world.addAphid(5280, 555, 22, 5160, 5390);

      // CHECKPOINT 3
      world.addCheckpoint(5740, 340, 'Checkpoint 3');

      world.addStickyCrumb(5960, 324, 28, 'honey');
      world.addHedgehog(6160, 320, 28, 6020, 6320);
      world.addProp('pinecone', 6340, 300, 1.05);
    }
  },

  // ============================================================================
  // COUPE 3 : COUPE DU PIQUE-NIQUE ROYAL (pique_nique_royal)
  // Course 1 (id: 6) = FACILE | Course 2 (id: 7) = MOYEN | Course 3 (id: 8) = DIFFICILE
  // ============================================================================
  {
    id: 6,
    cupId: 'pique_nique_royal',
    difficulty: 'Facile',
    theme: 'picnic_easy',
    name: 'Pique-Nique 1 — La Nappe à Carreaux (Facile)',
    subtitle: 'Entrée du pique-nique : petites canettes en escalier doux, pailles géantes, glands de soin & pucerons !',
    skyTop: '#ffecd2',
    skyBottom: '#fcb69f',
    accentBg: '#c0392b',
    startX: 160,
    startY: 500,
    finishX: 4950,
    finishY: 420,
    coachHint: '💡 <strong>Facile — La Nappe à Carreaux :</strong> Grimpez sur les canettes 🥫 et les pailles colorées 🥤 ! Cassez les glands pour vous soigner (+20 ❤️) et lancez les pucerons pour gagner +1 segment 🍏 !',
    build(world) {
      // SECTION 1 : La Pelouse & Première Canette Douce
      world.addPolyline([
        [-200, 260], [-200, 550], [460, 550], [740, 460], [1040, 460],
        [1280, 520], [1620, 470], [1940, 470]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [450, 548], [740, 458], [1040, 458]
      ], 'can', { thickness: 26, isGroundMass: false });

      world.addProp('acorn', 360, 520, 1.0);
      world.addAphid(880, 435, 22, 760, 1000);
      world.addStickyCrumb(1280, 502, 24, 'jam');
      world.addProp('acorn', 1480, 465, 1.0);

      // CHECKPOINT 1
      world.addCheckpoint(1800, 470, 'Checkpoint 1');

      // SECTION 2 : Le Pont de Paille Géante & Emballage Rebondissant
      world.addPolyline([
        [1930, 470], [2180, 570], [2740, 570], [2980, 450], [3420, 450]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Paille géante inclinée facile à grimper
      world.addPolyline([
        [2060, 465], [2380, 380], [2720, 380], [2980, 450]
      ], 'straw', { thickness: 24, isGroundMass: false });

      world.addMushroom(2450, 535, 42, 385, 0.0);
      world.addProp('acorn', 2520, 350, 1.0);
      world.addPowerUp(2520, 270, 'speed');
      world.addAphid(3160, 425, 22, 3020, 3300);

      // CHECKPOINT 2
      world.addCheckpoint(3320, 450, 'Checkpoint 2');

      // SECTION 3 : Les Marches du Panier vers l'Arrivée
      world.addPolyline([
        [3410, 450], [3680, 510], [3960, 450], [4260, 420], [5350, 420], [5350, 180]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [3410, 448], [3680, 508], [3960, 448]
      ], 'plastic', { thickness: 22, isGroundMass: false });

      world.addPolyline([
        [3960, 448], [4260, 418], [4560, 418]
      ], 'can', { thickness: 26, isGroundMass: false });

      world.addStickyCrumb(4120, 415, 25, 'jam');
      world.addProp('acorn', 4420, 390, 1.0);
      world.addAphid(4680, 395, 22, 4560, 4820);

      // CHECKPOINT 3
      world.addCheckpoint(4580, 420, 'Checkpoint 3');
    }
  },

  {
    id: 7,
    cupId: 'pique_nique_royal',
    difficulty: 'Moyen',
    theme: 'picnic_table',
    name: 'Pique-Nique 2 — La Table des Géants (Moyen)',
    subtitle: 'Fourchettes plantées à escalader, ponts de pailles, emballages froissés, confiture collante & hérissons !',
    skyTop: '#ffd6ba',
    skyBottom: '#fff2b2',
    accentBg: '#8c2d19',
    startX: 150,
    startY: 500,
    finishX: 5950,
    finishY: 400,
    coachHint: '💡 <strong>Moyen — La Table des Géants :</strong> Escaladez les fourchettes 🍴 et les pailles 🥤, dégagez les pommes de pin et utilisez <kbd>ESPACE</kbd> pour vous arracher de la confiture 🍓 !',
    build(world) {
      // SECTION 1 : Rampe de Canette & Première Fourchette
      world.addPolyline([
        [-200, 260], [-200, 550], [440, 550], [700, 440], [960, 370],
        [1140, 520], [1560, 520], [1760, 440], [2120, 440]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [430, 548], [700, 438], [960, 368]
      ], 'can', { thickness: 28, isGroundMass: false });

      // Fourchette plantée #1
      world.addPolyline([
        [740, 425], [740, 345]
      ], 'fork', { thickness: 15, isGroundMass: false });

      // Pont de paille au-dessus du creux de confiture
      world.addPolyline([
        [950, 368], [1340, 350], [1760, 440]
      ], 'straw', { thickness: 24, isGroundMass: false });

      world.addStickyCrumb(1260, 502, 28, 'jam');
      world.addHedgehog(1440, 500, 28, 1300, 1540);
      world.addProp('acorn', 1340, 320, 1.0);
      world.addAphid(480, 515, 22, 360, 580);

      // CHECKPOINT 1
      world.addCheckpoint(1960, 440, 'Checkpoint 1');

      // SECTION 2 : Les Emballages Froissés & Ronces sous la Table
      world.addPolyline([
        [2110, 440], [2360, 580], [3120, 580], [3360, 420], [3860, 420]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [2360, 578], [2620, 510], [2860, 578], [3120, 515]
      ], 'plastic', { thickness: 22, isGroundMass: false });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 2740,
        pivotY: 380,
        moveX: 110,
        moveY: 20,
        moveSpeed: 1.15,
        localPoints: [[-130, 6], [-40, -8], [40, -8], [130, 6]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.7,
        thickness: 22
      });

      world.addThorn(2480, 565, 28);
      world.addMushroom(2620, 480, 40, 390, 0.08);
      world.addPowerUp(2740, 260, 'strength');
      world.addProp('pinecone', 3480, 380, 1.05);
      world.addProp('acorn', 3620, 390, 1.0);

      // CHECKPOINT 2
      world.addCheckpoint(3740, 420, 'Checkpoint 2');

      // SECTION 3 : Les Deux Fourchettes & Le Plateau du Goûter
      world.addPolyline([
        [3850, 420], [4120, 350], [4440, 350], [4720, 480], [5160, 480],
        [5420, 400], [6350, 400], [6350, 160]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [3850, 418], [4120, 348], [4440, 348], [4720, 478]
      ], 'can', { thickness: 28, isGroundMass: false });

      world.addPolyline([
        [4280, 348], [4280, 265]
      ], 'fork', { thickness: 15, isGroundMass: false });

      world.addStickyCrumb(4160, 332, 27, 'jam');
      world.addHedgehog(4940, 460, 28, 4780, 5100);
      world.addAphid(4380, 325, 22, 4300, 4440);

      // CHECKPOINT 3
      world.addCheckpoint(5480, 400, 'Checkpoint 3');

      world.addPolyline([
        [5720, 400], [5720, 320]
      ], 'fork', { thickness: 15, isGroundMass: false });
      world.addProp('acorn', 5620, 370, 1.0);
    }
  },

  {
    id: 8,
    cupId: 'pique_nique_royal',
    difficulty: 'Difficile',
    theme: 'picnic_chaos',
    name: 'Pique-Nique 3 — Le Festin Ravagé (Difficile)',
    subtitle: 'Chaos final : grandes ascensions sur fourchettes et pailles, confiture, ronces, pommes de pin & hérissons !',
    skyTop: '#ff9a8b',
    skyBottom: '#ff6a88',
    accentBg: '#6e1423',
    startX: 150,
    startY: 520,
    finishX: 6650,
    finishY: 340,
    coachHint: '💡 <strong>Difficile — Le Festin Ravagé :</strong> L’épreuve reine ! Combinez escalade sur fourchettes 🍴, ponts de pailles 🥤, sauts par inertie et lancers de pommes de pin pour triompher !',
    build(world) {
      // SECTION 1 : L'Assaut des Canettes & Fourchettes Géantes
      world.addPolyline([
        [-200, 260], [-200, 560], [420, 560], [680, 440], [940, 440],
        [1140, 620], [1820, 620], [2040, 410], [2420, 410]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [410, 558], [680, 438], [940, 438]
      ], 'can', { thickness: 28, isGroundMass: false });

      world.addPolyline([
        [820, 438], [820, 335]
      ], 'fork', { thickness: 16, isGroundMass: false });

      // Pont de paille haut perché partant du sommet de la fourchette !
      world.addPolyline([
        [840, 335], [1220, 280], [1640, 280], [2020, 405]
      ], 'straw', { thickness: 24, isGroundMass: false });

      world.addThorn(1320, 605, 32);
      world.addStickyCrumb(1560, 602, 28, 'jam');
      world.addMushroom(1720, 585, 42, 420, 0.1);
      world.addProp('pinecone', 1420, 240, 1.1);
      world.addProp('acorn', 1180, 250, 1.0);
      world.addHedgehog(680, 420, 28, 540, 780);
      world.addAphid(2180, 385, 22, 2060, 2320);

      // CHECKPOINT 1
      world.addCheckpoint(2280, 410, 'Checkpoint 1');

      // SECTION 2 : La Nappe Déchirée & Les Balançoires Au-Dessus du Chaos
      world.addPolyline([
        [2410, 410], [2620, 640], [3760, 640], [3980, 380], [4420, 380]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [2620, 638], [2920, 560], [3200, 638], [3480, 560], [3760, 638]
      ], 'plastic', { thickness: 22, isGroundMass: false });

      world.addThorn(2780, 620, 30);
      world.addThorn(3340, 620, 30);
      world.addStickyCrumb(3060, 580, 28, 'jam');

      world.addDynamicPlatform({
        type: 'hose',
        material: 'hose',
        pivotX: 2820,
        pivotY: 360,
        moveX: 110,
        moveY: 22,
        moveSpeed: 1.25,
        localPoints: [[-135, 6], [-45, -10], [45, -10], [135, 6]],
        baseAngle: 0,
        stiffness: 17,
        damping: 2.5,
        thickness: 26
      });

      world.addDynamicPlatform({
        type: 'silk_swing',
        material: 'silk',
        pivotX: 3440,
        pivotY: 330,
        moveX: -115,
        moveY: 22,
        moveSpeed: 1.3,
        localPoints: [[-115, 8], [-35, -6], [35, -6], [115, 8]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.6,
        thickness: 20
      });

      world.addPowerUp(3130, 210, 'strength');
      world.addHedgehog(4140, 360, 28, 4000, 4280);
      world.addProp('acorn', 4040, 350, 1.0);

      // CHECKPOINT 2
      world.addCheckpoint(4300, 380, 'Checkpoint 2');

      // SECTION 3 : L'Ascension du Panier Royal
      world.addPolyline([
        [4410, 380], [4680, 490], [4960, 570]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addPolyline([
        [4950, 570], [5480, 570], [5760, 340], [7050, 340], [7050, 140]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Double rampe : Branche + Paille + Fourchette
      world.addPolyline([
        [4560, 370], [4880, 270], [5240, 270], [5560, 340]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addPolyline([
        [5120, 270], [5120, 185]
      ], 'fork', { thickness: 15, isGroundMass: false });

      world.addStickyCrumb(4960, 254, 28, 'jam');
      world.addProp('pinecone', 5240, 230, 1.15);
      world.addProp('acorn', 4860, 240, 1.0);
      world.addAphid(5220, 545, 22, 5060, 5380);

      // CHECKPOINT 3
      world.addCheckpoint(5820, 340, 'Checkpoint 3');

      world.addPolyline([
        [5920, 338], [6180, 270], [6420, 338]
      ], 'can', { thickness: 28, isGroundMass: false });

      world.addStickyCrumb(6180, 254, 28, 'jam');
      world.addHedgehog(6320, 315, 28, 6200, 6480);
      world.addProp('pinecone', 6080, 235, 1.1);
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

  // Rich Multi-Layered Parallax Background adapted to each Level's Universe Theme!
  drawBackground(ctx, width, height, cameraX, cameraY, level, time) {
    const theme = level.theme || 'forest';

    // 1. Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, level.skyTop);
    grad.addColorStop(1, level.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Sun / Magical Glow & Sunbeams
    ctx.save();
    ctx.fillStyle = theme === 'mushroom' ? 'rgba(220, 190, 255, 0.45)' : 'rgba(255, 250, 200, 0.45)';
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.18, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 253, 215, 0.16)';
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

    // 3. Far Parallax Layer: Rolling Hills & Universe Landmarks
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

    // Universe-specific mid-parallax silhouettes
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
        // Giant background pastel mushrooms
        ctx.fillStyle = 'rgba(245, 230, 255, 0.42)';
        ctx.fillRect(tx + 18, height * 0.28, 36, height * 0.45);
        ctx.fillStyle = 'rgba(253, 121, 168, 0.36)';
        ctx.beginPath();
        ctx.arc(tx + 36, height * 0.28, 92, Math.PI, 0);
        ctx.fill();
      } else if (theme === 'marsh') {
        // Giant background cattails / reeds
        ctx.fillStyle = 'rgba(20, 110, 95, 0.32)';
        ctx.fillRect(tx + 20, height * 0.16, 12, height * 0.6);
        ctx.fillStyle = 'rgba(110, 65, 30, 0.40)';
        ctx.beginPath();
        ctx.roundRect(tx + 14, height * 0.20, 24, 65, 12);
        ctx.fill();
      } else if (theme === 'hive') {
        // Giant honeycomb silhouettes
        ctx.fillStyle = 'rgba(243, 156, 18, 0.28)';
        ctx.beginPath();
        ctx.arc(tx + 40, height * 0.28, 78, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Giant picnic basket / thermos silhouette
        ctx.fillStyle = 'rgba(209, 73, 56, 0.25)';
        ctx.beginPath();
        ctx.roundRect(tx, height * 0.32, 95, 160, 18);
        ctx.fill();
      }
    }
    ctx.restore();

    // 4. Mid-Near Parallax Layer: Bushy Cartoon Foliage
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

  drawWorld(ctx, world, level, time, isVictory) {
    // 1. Draw Complete Filled Cartoon Terrain Masses
    for (const chain of world.terrainChains) {
      if (chain.isGroundMass) {
        this.drawCompleteTerrainMass(ctx, chain, time, level);
      }
    }

    // 2. Draw Background Scenic Decorations
    for (const dec of world.decorations) {
      this.drawDecoration(ctx, dec, time);
    }

    // 3. Draw Elevated Structures (Branches, Tomato vines, Silk bridges, Mushroom caps, Reeds, Honeycombs, Straws, Cans, Forks)
    for (const chain of world.terrainChains) {
      if (!chain.isGroundMass) {
        this.drawElevatedStructure(ctx, chain, time);
      }
    }

    // 4. Draw Dynamic Platforms (Leaves, Hoses, Lilypads, Silk Swings)
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

    // 8c. Draw Power-Up Collectibles
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

    const earthGrad = ctx.createLinearGradient(0, 350, 0, 950);
    if (theme === 'mushroom') {
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

    ctx.strokeStyle = 'rgba(35, 18, 6, 0.32)';
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

      ctx.fillStyle = hash > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.22)';
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(x, pebbleY, pebbleR * 1.25, pebbleR * 0.85, (hash - 0.5) * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // 2. Top Surface Crust
    const isMoss = chain.material === 'moss';
    let crustMain = '#4ec932';
    let crustRim = '#80ed58';
    if (isMoss) {
      crustMain = '#20cf9f';
      crustRim = '#a8fff0';
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
          ctx.fillStyle = 'rgba(200, 255, 250, 0.85)';
          ctx.beginPath();
          ctx.arc(gx, gy - 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
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

  // Draw Elevated Structures (root, stem, silk, mushroom_cap, reed, honeycomb, straw, can, plastic, fork)
  drawElevatedStructure(ctx, chain, time) {
    const pts = chain.points;
    if (pts.length < 2) return;
    const thick = chain.thickness || 24;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (chain.material === 'root') {
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
    } else if (chain.material === 'silk') {
      // Caterpillar Silk Bridge (Fil de soie lumineux)
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = thick + 6;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#f7fafc';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#b2f5ea';
      ctx.lineWidth = 5;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - 2);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (chain.material === 'mushroom_cap') {
      // Giant Mushroom Terrace with sturdy stalk
      const midX = (pts[0][0] + pts[pts.length - 1][0]) * 0.5;
      const midY = (pts[0][1] + pts[pts.length - 1][1]) * 0.5;
      ctx.fillStyle = '#fff5e4';
      ctx.strokeStyle = '#2d1b36';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(midX - 24, midY, 48, 220, 12);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#2d1b36';
      ctx.lineWidth = thick + 10;
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
      ctx.lineWidth = 7;
      ctx.setLineDash([14, 22]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - 4);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (chain.material === 'reed') {
      // Aquatic Reed / Bamboo Stalk
      ctx.strokeStyle = '#0d3b2e';
      ctx.lineWidth = thick + 8;
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

      // Bamboo / reed rings
      ctx.fillStyle = '#eb3b5a';
      for (const p of pts) {
        ctx.fillStyle = '#145a32';
        ctx.beginPath();
        ctx.arc(p[0], p[1], thick * 0.58, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (chain.material === 'honeycomb') {
      // Golden Honeycomb Wax Ramp
      ctx.strokeStyle = '#5c3306';
      ctx.lineWidth = thick + 10;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = thick + 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#ffeaa7';
      ctx.lineWidth = 7;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] - 4);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1] - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (chain.material === 'straw') {
      // Striped Picnic Drinking Straw
      ctx.strokeStyle = '#2c2c54';
      ctx.lineWidth = thick + 8;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();

      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = thick - 2;
      ctx.setLineDash([18, 18]);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (chain.material === 'can') {
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

  // Draw Grabbable Acorns (Glands) & Pinecones (Pommes de pin)
  drawGrabbableProp(ctx, prop, time) {
    ctx.save();
    ctx.translate(prop.x, prop.y);
    ctx.rotate(prop.angle);

    const r = prop.radius;

    if (prop.type === 'acorn') {
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

      const maxHp = prop.maxHp || 100;
      const curHp = prop.hp !== undefined ? prop.hp : maxHp;
      const damageRatio = Math.max(0, Math.min(1, 1 - (curHp / maxHp)));

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

  drawDecoration(ctx, dec, time) {
    ctx.save();
    ctx.translate(dec.x, dec.y);
    ctx.scale(dec.scale, dec.scale);

    if (dec.type === 'flower') {
      const sway = Math.sin(time * 2 + dec.x) * 0.08;
      ctx.rotate(sway);
      ctx.strokeStyle = '#2d7a22';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -32, 0, -64);
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

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (plat.type === 'leaf' || plat.type === 'lilypad') {
      ctx.strokeStyle = '#183d16';
      ctx.lineWidth = plat.thickness + 7;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = plat.type === 'lilypad' ? '#26de81' : '#68d84b';
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

      if (plat.type === 'lilypad') {
        // Cute pink lotus flower in the center of the lilypad
        ctx.fillStyle = '#fd79a8';
        ctx.strokeStyle = '#2d1b36';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(plat.pivotX, plat.pivotY - 14, 11, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (plat.type === 'silk_swing') {
      // Hanging caterpillar silk swing with suspension threads
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      ctx.lineTo(plat.pivotX, plat.pivotY - 120);
      ctx.moveTo(segs[segs.length - 1].x2, segs[segs.length - 1].y2);
      ctx.lineTo(plat.pivotX, plat.pivotY - 120);
      ctx.stroke();

      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = plat.thickness + 6;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = plat.thickness;
      ctx.beginPath();
      ctx.moveTo(segs[0].x1, segs[0].y1);
      for (const s of segs) ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    } else if (plat.type === 'hose') {
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

  // Draw Bonus Apple:
  // - kind === 'segment' (from enemies): Golden-Emerald Apple (+1 Segment)
  // - kind === 'heal' (from acorns): Red Healing Apple (+20 HP)
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

  drawPowerUp(ctx, p, time) {
    if (p.collected) return;
    ctx.save();

    const bob = Math.sin(time * 3.8 + p.x * 0.05) * 6;
    const px = p.x;
    const py = p.y + bob;
    const r = p.radius || 18;

    const conf = {
      speed: { bg: '#00d2d3', rim: '#48dbfb', glow: 'rgba(0, 210, 211, 0.45)', icon: '⚡' },
      strength: { bg: '#ff9f43', rim: '#feca57', glow: 'rgba(255, 159, 67, 0.45)', icon: '💪' },
      giant: { bg: '#ee5253', rim: '#ff6b6b', glow: 'rgba(238, 82, 83, 0.45)', icon: '🎈' },
      length: { bg: '#10ac84', rim: '#1dd1a1', glow: 'rgba(16, 172, 132, 0.45)', icon: '📏' },
      feather: { bg: '#54a0ff', rim: '#70a1ff', glow: 'rgba(84, 160, 255, 0.45)', icon: '🪶' }
    }[p.type] || { bg: '#ffd93b', rim: '#ffeaa7', glow: 'rgba(255, 217, 59, 0.45)', icon: '⭐' };

    const pulse = 1.0 + Math.sin(time * 6.0 + p.x) * 0.12;
    ctx.fillStyle = conf.glow;
    ctx.beginPath();
    ctx.arc(px, py, r * 1.55 * pulse, 0, Math.PI * 2);
    ctx.fill();

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
