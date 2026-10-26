// js/levels.js — 9 Inédits Levels across 3 Themed Cups (Easy -> Medium -> Hard per Cup) + Cartoon Renderer

export const LEVEL_DEFINITIONS = [
  // ============================================================================
  // COUPE 1 : COUPE DES BOURGEONS (Facile)
  // Course 1 (id: 0) | Course 2 (id: 1) | Course 3 (id: 2)
  // ============================================================================

  // --------------------------------------------------------------------------
  // NIVEAU 0 : L'Orée des Pousses (Facile)
  // --------------------------------------------------------------------------
  {
    id: 0,
    cupId: 'coupe_bourgeons',
    difficulty: 'Facile',
    theme: 'forest',
    bgSet: 'game_background_2',
    name: 'Bourgeons 1 — L’Orée des Pousses (Facile)',
    subtitle: 'Initiation douce : collines d’herbe, racines basses, premiers pucerons et arche en raccourci !',
    skyTop: '#ffefc2',
    skyBottom: '#b8f59e',
    accentBg: '#2d5a27',
    startX: 160,
    startY: 500,
    finishX: 4400,
    finishY: 460,
    coachHint: '💡 <strong>Facile — L’Orée des Pousses :</strong> Rampez avec souplesse. Cassez les <strong>Glands 🌰</strong> pour du soin (+20 ❤️) et projetez les <strong>Pucerons 🐛</strong> pour gagner <strong>+1 Segment 🍏</strong> ! Empruntez la racine haute pour survoler le premier fossé.',
    build(world) {
      // SECTION 1 : Collines herbeuses douces & Initiation
      world.addPolyline([
        [-200, 260], [-200, 560], [0, 560], [350, 560], [600, 520], [900, 550],
        [1150, 500], [1400, 500], [1650, 540]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Branche basse d'initiation à l'escalade
      world.addPolyline([
        [750, 480], [950, 430], [1150, 430], [1350, 490]
      ], 'root', { thickness: 26, isGroundMass: false });

      world.addProp('acorn', 450, 520, 1.0);
      world.addAphid(700, 520, 22, 580, 820);
      world.addProp('acorn', 1050, 400, 1.0);
      world.addPowerUp(1050, 320, 'speed');

      world.addDecoration('flower', 250, 560, 1.1);
      world.addDecoration('fern', 620, 530, 1.2);
      world.addDecoration('flower', 1250, 500, 1.0);

      // CHECKPOINT 1
      world.addCheckpoint(1550, 520, 'Checkpoint 1');

      // SECTION 2 : Le Petit Fossé & Arche Racinaire (Raccourci aérien)
      // Fossé de boue au sol avec champignon tremplin de secours
      world.addPolyline([
        [1650, 540], [1780, 630], [2020, 630], [2150, 520], [2750, 520]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Champignon pour s'éjecter du fossé
      world.addMushroom(1900, 595, 42, 390, 0.05);

      // Arche haute (raccourci propre pour chenille habile)
      world.addPolyline([
        [1680, 490], [1820, 420], [1980, 420], [2120, 480]
      ], 'root', { thickness: 24, isGroundMass: false });

      // Feuille oscillante douce au-dessus du plateau
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 2350,
        pivotY: 440,
        moveX: 65,
        moveY: 10,
        moveSpeed: 0.9,
        localPoints: [[-110, 0], [-35, -5], [35, -5], [110, 0]],
        baseAngle: 0,
        stiffness: 20,
        damping: 3.0,
        thickness: 20
      });

      world.addProp('acorn', 2480, 490, 1.0);
      world.addAphid(2620, 495, 22, 2520, 2720);
      world.addDecoration('rock', 1720, 560, 1.0);
      world.addDecoration('fern', 2680, 520, 1.2);

      // CHECKPOINT 2
      world.addCheckpoint(2800, 510, 'Checkpoint 2');

      // SECTION 3 : Pont de Lianes Souples & Ligne Droite Finale
      world.addPolyline([
        [2750, 520], [3000, 470], [3250, 530], [3600, 530], [3900, 470],
        [4150, 480], [4800, 480], [4800, 200]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Pont de soie au-dessus de la dépression
      world.addPolyline([
        [3000, 465], [3280, 435], [3580, 465], [3880, 470]
      ], 'silk', { thickness: 22, isGroundMass: false });

      world.addMushroom(3420, 495, 40, 360, 0.05);
      world.addProp('acorn', 3280, 400, 1.0);
      world.addAphid(3750, 450, 22, 3620, 3860);
      world.addPowerUp(3280, 320, 'feather');

      world.addDecoration('flower', 4050, 480, 1.2);
      world.addDecoration('fern', 4280, 480, 1.3);
    }
  },

  // --------------------------------------------------------------------------
  // NIVEAU 1 : Les Ponts de Lianes (Facile)
  // --------------------------------------------------------------------------
  {
    id: 1,
    cupId: 'coupe_bourgeons',
    difficulty: 'Facile',
    theme: 'garden',
    bgSet: 'game_background_1',
    name: 'Bourgeons 2 — Les Ponts de Lianes (Facile)',
    subtitle: 'Tiges de jardin, feuille oscillante, champignons rebondissants et ponts de soie suspendus !',
    skyTop: '#d4fcff',
    skyBottom: '#ffe596',
    accentBg: '#236937',
    startX: 160,
    startY: 540,
    finishX: 4600,
    finishY: 420,
    coachHint: '💡 <strong>Facile — Les Ponts de Lianes :</strong> Les <strong>Champignons 🍄</strong> vous propulsent dans les airs. Utilisez-les pour atteindre les lianes de soie supérieures et contourner les bosses de boue !',
    build(world) {
      // SECTION 1 : Tiges montantes & Premières lianes
      world.addPolyline([
        [-200, 280], [-200, 580], [0, 580], [400, 580], [650, 540], [850, 590],
        [1100, 590], [1350, 510], [1650, 510]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Rampe de racine à grimper
      world.addPolyline([
        [500, 560], [700, 470], [900, 470], [1100, 530]
      ], 'stem', { thickness: 24, isGroundMass: false });

      world.addProp('acorn', 420, 545, 1.0);
      world.addAphid(750, 445, 22, 650, 850);
      world.addDecoration('tomato', 880, 450, 1.1);

      // CHECKPOINT 1
      world.addCheckpoint(1500, 500, 'Checkpoint 1');

      // SECTION 2 : Ravin & Feuille Mobile + Rebond Champignon
      world.addPolyline([
        [1650, 510], [1800, 640], [2150, 640], [2300, 500], [2850, 500]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Plateforme feuille mobile au-dessus du ravin
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 1980,
        pivotY: 490,
        moveX: 75,
        moveY: 12,
        moveSpeed: 1.0,
        localPoints: [[-120, 0], [-40, -6], [40, -6], [120, 0]],
        baseAngle: 0,
        stiffness: 18,
        damping: 2.8,
        thickness: 22
      });

      // Champignon tremplin au fond du creux
      world.addMushroom(1980, 605, 44, 400, 0.06);

      // Treille en tige en raccourci aérien
      world.addPolyline([
        [1850, 390], [2050, 350], [2250, 390]
      ], 'stem', { thickness: 22, isGroundMass: false });

      world.addPowerUp(2050, 270, 'strength');
      world.addProp('acorn', 2450, 470, 1.0);
      world.addAphid(2650, 475, 22, 2500, 2780);

      // CHECKPOINT 2
      world.addCheckpoint(2900, 490, 'Checkpoint 2');

      // SECTION 3 : Double Pont de Soie & Arrivée
      world.addPolyline([
        [2850, 500], [3150, 440], [3450, 520], [3800, 520], [4050, 430],
        [4300, 440], [5000, 440], [5000, 220]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Ponts suspendus de soie
      world.addPolyline([
        [3120, 435], [3420, 400], [3750, 435]
      ], 'silk', { thickness: 22, isGroundMass: false });

      world.addPolyline([
        [3760, 435], [4030, 400], [4280, 435]
      ], 'silk', { thickness: 22, isGroundMass: false });

      world.addPowerUp(3420, 320, 'feather');
      world.addProp('acorn', 3900, 480, 1.0);
      world.addAphid(4150, 415, 22, 4060, 4260);

      world.addDecoration('flower', 3300, 520, 1.1);
      world.addDecoration('fern', 4450, 440, 1.3);
    }
  },

  // --------------------------------------------------------------------------
  // NIVEAU 2 : Le Verger Fleuri (Facile)
  // --------------------------------------------------------------------------
  {
    id: 2,
    cupId: 'coupe_bourgeons',
    difficulty: 'Facile',
    theme: 'canopy',
    bgSet: 'game_background_3',
    name: 'Bourgeons 3 — Le Verger Fleuri (Facile)',
    subtitle: 'Terrasses en caisses de bois, nénuphars flottants et grand fil de soie aérien !',
    skyTop: '#e8f5e9',
    skyBottom: '#fff9c4',
    accentBg: '#1e4620',
    startX: 160,
    startY: 520,
    finishX: 4700,
    finishY: 400,
    coachHint: '💡 <strong>Facile — Le Verger Fleuri :</strong> Les marches en caisses de bois se montent marche après marche. Au niveau de la mare aux nénuphars, hissez-vous sur le grand fil de soie pour planer jusqu’à l’arrivée !',
    build(world) {
      // SECTION 1 : Marches de caisses de bois
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 540], [800, 540],
        [800, 470], [1150, 470], [1150, 400], [1550, 400], [1700, 480]
      ], 'root', { thickness: 24, isGroundMass: true });

      world.addProp('acorn', 450, 545, 1.0);
      world.addAphid(980, 445, 22, 850, 1100);
      world.addProp('acorn', 1350, 370, 1.0);

      // CHECKPOINT 1
      world.addCheckpoint(1600, 470, 'Checkpoint 1');

      // SECTION 2 : La Mare aux Nénuphars & Fil Céleste
      world.addPolyline([
        [1700, 480], [1820, 620], [2600, 620], [2720, 480], [3150, 480]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Nénuphars flottants (plateformes oscillantes douces)
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 2020,
        pivotY: 570,
        localPoints: [[-90, 0], [90, 0]],
        stiffness: 22,
        damping: 3.2,
        thickness: 20
      });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'leaf',
        pivotX: 2380,
        pivotY: 570,
        localPoints: [[-90, 0], [90, 0]],
        stiffness: 22,
        damping: 3.2,
        thickness: 20
      });

      // Fil de soie suspendu au sommet (Raccourci aérien)
      world.addPolyline([
        [1680, 370], [2150, 310], [2680, 370]
      ], 'silk', { thickness: 20, isGroundMass: false });

      world.addPowerUp(2150, 230, 'feather');
      world.addProp('acorn', 2850, 450, 1.0);
      world.addAphid(3000, 455, 22, 2880, 3100);

      // CHECKPOINT 2
      world.addCheckpoint(3180, 470, 'Checkpoint 2');

      // SECTION 3 : Allée de Pommiers & Podium
      world.addPolyline([
        [3150, 480], [3450, 420], [3800, 490], [4150, 410], [4450, 420],
        [5100, 420], [5100, 200]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addMushroom(3620, 455, 42, 380, 0.05);
      world.addPowerUp(4150, 330, 'speed');
      world.addProp('acorn', 4280, 390, 1.0);

      world.addDecoration('flower', 3350, 450, 1.2);
      world.addDecoration('fern', 4550, 420, 1.3);
    }
  },

  // ============================================================================
  // COUPE 2 : COUPE DES VENTS (Moyen)
  // Course 1 (id: 3) | Course 2 (id: 4) | Course 3 (id: 5)
  // ============================================================================

  // --------------------------------------------------------------------------
  // NIVEAU 3 : La Grotte aux Spores (Moyen)
  // --------------------------------------------------------------------------
  {
    id: 3,
    cupId: 'coupe_vents',
    difficulty: 'Moyen',
    theme: 'mushroom',
    bgSet: 'game_background_3',
    name: 'Vents 1 — La Grotte aux Spores (Moyen)',
    subtitle: 'Plafond rocheux avec varappe inversée, premier hérisson patrouilleur et plateformes mobiles !',
    skyTop: '#3a1c71',
    skyBottom: '#d76d77',
    accentBg: '#5f27cd',
    startX: 160,
    startY: 520,
    finishX: 4900,
    finishY: 440,
    coachHint: '💡 <strong>Moyen — La Grotte aux Spores :</strong> Agrippez-vous au <strong>Plafond</strong> pour progresser la tête en bas et éviter le hérisson au sol, ou attrapez le hérisson par le museau avant pour l’éjecter !',
    build(world) {
      // SECTION 1 : Entrée de la Caverne & Premier Hérisson
      world.addPolyline([
        [-200, 300], [-200, 560], [300, 560], [600, 520], [900, 560],
        [1250, 560], [1450, 490], [1700, 490]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Plafond de grotte pour varappe inversée
      world.addPolyline([
        [200, 280], [600, 250], [1000, 270], [1400, 240], [1750, 280]
      ], 'root', { thickness: 22, isGroundMass: false });

      world.addProp('acorn', 450, 525, 1.0);
      world.addHedgehog(1050, 540, 28, 920, 1200);

      // CHECKPOINT 1
      world.addCheckpoint(1650, 480, 'Checkpoint 1');

      // SECTION 2 : Fosse de Ronces & Plateformes Mobiles Synchronisées
      world.addPolyline([
        [1700, 490], [1820, 640], [2550, 640], [2680, 480], [3150, 480]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Ronces au fond du gouffre
      world.addThorn(2000, 625, 28);
      world.addThorn(2200, 625, 28);
      world.addThorn(2400, 625, 28);

      // 2 Plateformes mobiles horizontales au-dessus des ronces
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 1980,
        pivotY: 480,
        moveX: 90,
        moveY: 0,
        moveSpeed: 1.1,
        localPoints: [[-90, 0], [90, 0]],
        stiffness: 22,
        damping: 3.0,
        thickness: 20
      });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 2380,
        pivotY: 480,
        moveX: -90,
        moveY: 0,
        moveSpeed: 1.1,
        localPoints: [[-90, 0], [90, 0]],
        stiffness: 22,
        damping: 3.0,
        thickness: 20
      });

      // Plafond suspendu (shortcut continu)
      world.addPolyline([
        [1800, 270], [2150, 230], [2550, 270]
      ], 'silk', { thickness: 20, isGroundMass: false });

      world.addPowerUp(2150, 160, 'strength');
      world.addProp('acorn', 2850, 450, 1.0);
      world.addAphid(2980, 455, 22, 2850, 3100);

      // CHECKPOINT 2
      world.addCheckpoint(3200, 470, 'Checkpoint 2');

      // SECTION 3 : Sortie de Grotte & Champignons Éclatants
      world.addPolyline([
        [3150, 480], [3450, 420], [3750, 520], [4100, 520], [4400, 440],
        [4650, 440], [5300, 440], [5300, 200]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addMushroom(3900, 485, 44, 410, 0.05);
      world.addHedgehog(4250, 500, 28, 4120, 4380);
      world.addProp('acorn', 4500, 410, 1.0);

      world.addDecoration('rock', 3300, 460, 1.1);
      world.addDecoration('fern', 4750, 440, 1.3);
    }
  },

  // --------------------------------------------------------------------------
  // NIVEAU 4 : Le Gouffre Poids-Plume (Moyen) — SIGNATURE USER REQUEST!
  // --------------------------------------------------------------------------
  {
    id: 4,
    cupId: 'coupe_vents',
    difficulty: 'Moyen',
    theme: 'marsh',
    bgSet: 'game_background_4',
    name: 'Vents 2 — Le Gouffre Poids-Plume (Moyen)',
    subtitle: 'L’épreuve phare : Canyon vertigineux, boost Poids-Plume 🪶 et slalom aérien entre graines piquantes !',
    skyTop: '#74ebd5',
    skyBottom: '#acb6e5',
    accentBg: '#0984e3',
    startX: 160,
    startY: 480,
    finishX: 5200,
    finishY: 440,
    coachHint: '💡 <strong>Moyen — Le Gouffre Poids-Plume :</strong> Prenez la <strong>Plume 🪶</strong> au bord de la falaise, détendez votre corps à pleine charge et planez à travers le gouffre en évitant les graines piquantes suspendues ! En cas de chute, rebondissez sur les champignons au fond du canyon.',
    build(world) {
      // SECTION 1 : Rampe d'élan vers la falaise
      world.addPolyline([
        [-200, 260], [-200, 520], [200, 520], [500, 480], [800, 520],
        [1100, 460], [1400, 400], [1600, 360]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addProp('acorn', 650, 485, 1.0);
      world.addAphid(950, 495, 22, 850, 1050);
      world.addProp('acorn', 1300, 395, 1.0);

      // CHECKPOINT 1 (Juste avant le saut dans le vide !)
      world.addCheckpoint(1520, 350, 'Tremplin');

      // LE BOOST POIDS-PLUME SUR LE BORD DE LA FALAISE
      world.addPowerUp(1620, 310, 'feather');

      // SECTION 2 : LE GRAND GOUFFRE (1400px de vide !) & GRAINES PIQUANTES AÉRIENNES
      // Falaise de réception à l'autre bout du gouffre
      world.addPolyline([
        [3000, 380], [3300, 440], [3650, 440]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // GRAINES PIQUANTES AÉRIENNES EN PLEIN AIR (Slalom de vol)
      world.addThorn(1900, 350, 26);
      world.addThorn(2150, 280, 26);
      world.addThorn(2400, 380, 26);
      world.addThorn(2650, 310, 26);
      world.addThorn(2880, 360, 26);

      // FOND DU CANYON (Voie de secours pour ceux qui ratent le vol)
      world.addPolyline([
        [1600, 360], [1700, 680], [2900, 680], [3000, 380]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Hérissons de garde au fond
      world.addHedgehog(2000, 660, 28, 1850, 2200);
      world.addHedgehog(2550, 660, 28, 2400, 2750);

      // Champignons tremplins pour remonter du fond
      world.addMushroom(1850, 645, 44, 440, 0.08);
      world.addMushroom(2300, 645, 44, 440, 0.08);
      world.addMushroom(2750, 645, 44, 460, 0.08);

      // Fil de secours intermédiaire
      world.addPolyline([
        [2200, 500], [2500, 500]
      ], 'silk', { thickness: 20, isGroundMass: false });

      // CHECKPOINT 2
      world.addCheckpoint(3600, 430, 'Checkpoint 2');

      // SECTION 3 : Crêtes Rocheuses & Balancier vers l'Arrivée
      world.addPolyline([
        [3650, 440], [3950, 380], [4250, 480], [4550, 480], [4800, 440],
        [5600, 440], [5600, 200]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 4400,
        pivotY: 420,
        moveX: 85,
        moveY: 15,
        moveSpeed: 1.2,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 20,
        damping: 2.8,
        thickness: 20
      });

      world.addProp('acorn', 4100, 440, 1.0);
      world.addPowerUp(4400, 320, 'speed');
      world.addAphid(4700, 420, 22, 4580, 4800);

      world.addDecoration('flower', 4950, 440, 1.2);
      world.addDecoration('fern', 5100, 440, 1.3);
    }
  },

  // --------------------------------------------------------------------------
  // NIVEAU 5 : La Falaise des Cimes (Moyen)
  // --------------------------------------------------------------------------
  {
    id: 5,
    cupId: 'coupe_vents',
    difficulty: 'Moyen',
    theme: 'forest',
    bgSet: 'game_background_2',
    name: 'Vents 3 — La Falaise des Cimes (Moyen)',
    subtitle: 'Ascension verticale à 80°, ronces latérales, balancier pendulaire géant et rampe de lancement !',
    skyTop: '#2b5876',
    skyBottom: '#4e4376',
    accentBg: '#2d3436',
    startX: 160,
    startY: 560,
    finishX: 5100,
    finishY: 360,
    coachHint: '💡 <strong>Moyen — La Falaise des Cimes :</strong> La paroi est abrupte ! Progressez en alternant tête et queue pour grimper sans glisser. Embarquez sur le balancier géant pour survoler les ronces.',
    build(world) {
      // SECTION 1 : L'Escalade de la Grande Falaise (80° d'inclinaison !)
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 580],
        [750, 380], [850, 240], [1200, 240], [1450, 360]
      ], 'root', { thickness: 26, isGroundMass: true });

      // Ronces latérales sur la paroi pour contraindre la trajectoire
      world.addThorn(720, 450, 26);
      world.addThorn(800, 310, 26);

      world.addProp('acorn', 400, 555, 1.0);
      world.addPowerUp(1000, 170, 'strength');
      world.addAphid(1050, 220, 22, 920, 1180);

      // CHECKPOINT 1
      world.addCheckpoint(1400, 340, 'Checkpoint 1');

      // SECTION 2 : Grand Balancier Pendulaire au-dessus du Vide
      world.addPolyline([
        [1450, 360], [1600, 580], [2500, 580], [2650, 360]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addThorn(1900, 560, 30);
      world.addThorn(2200, 560, 30);

      // Grand balancier pendulaire (ascenseur aérien)
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 2050,
        pivotY: 300,
        moveX: 120,
        moveY: 35,
        moveSpeed: 1.25,
        localPoints: [[-130, 0], [130, 0]],
        stiffness: 22,
        damping: 3.2,
        thickness: 24
      });

      // Liane haute en raccourci
      world.addPolyline([
        [1550, 220], [1850, 180], [2150, 220]
      ], 'silk', { thickness: 20, isGroundMass: false });

      world.addPowerUp(1850, 120, 'speed');
      world.addMushroom(2050, 545, 44, 420, 0.06);

      // CHECKPOINT 2
      world.addCheckpoint(2750, 350, 'Checkpoint 2');

      // SECTION 3 : Canopée des Cimes & Hérisson Perché
      world.addPolyline([
        [2650, 360], [3000, 360], [3300, 440], [3650, 360], [4000, 360],
        [4300, 440], [4600, 360], [5500, 360], [5500, 160]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addHedgehog(3150, 340, 28, 3020, 3280);
      world.addMushroom(3480, 405, 42, 380, 0.05);
      world.addProp('pinecone', 3850, 320, 0.9);
      world.addAphid(4450, 415, 22, 4320, 4560);

      world.addDecoration('flower', 4750, 360, 1.2);
      world.addDecoration('fern', 4950, 360, 1.4);
    }
  },

  // ============================================================================
  // COUPE 3 : COUPE DES TITANS (Difficile)
  // Course 1 (id: 6) | Course 2 (id: 7) | Course 3 (id: 8)
  // ============================================================================

  // --------------------------------------------------------------------------
  // NIVEAU 6 : Le Tronc des Titans (Difficile)
  // --------------------------------------------------------------------------
  {
    id: 6,
    cupId: 'coupe_titans',
    difficulty: 'Difficile',
    theme: 'canopy',
    bgSet: 'game_background_1',
    name: 'Titans 1 — Le Tronc des Titans (Difficile)',
    subtitle: 'Étagères d’écorce glissantes, plateformes en contre-phase et câble aérien ultra-fin !',
    skyTop: '#141e30',
    skyBottom: '#243b55',
    accentBg: '#6c5ce7',
    startX: 160,
    startY: 540,
    finishX: 5300,
    finishY: 380,
    coachHint: '💡 <strong>Difficile — Le Tronc des Titans :</strong> La <strong>Mousse</strong> est extrêmement glissante (adhérence quasi nulle). Synchronisez vos sauts entre les troncs en mouvement ou risquez le câble ultra-fin tout en haut !',
    build(world) {
      // SECTION 1 : Étagères de mousse glissante & Ravin de ronces
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 520], [800, 520]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      // Plateforme de mousse glissante
      world.addPolyline([
        [800, 520], [1050, 460], [1300, 460], [1500, 520]
      ], 'moss', { thickness: 24, isGroundMass: true });

      world.addThorn(1050, 560, 30);
      world.addThorn(1250, 560, 30);

      world.addProp('acorn', 450, 550, 1.0);
      world.addAphid(650, 500, 22, 560, 760);

      // CHECKPOINT 1
      world.addCheckpoint(1600, 500, 'Checkpoint 1');

      // SECTION 2 : Double Bûche Oscillante en Contre-Phase
      world.addPolyline([
        [1500, 520], [1650, 660], [2750, 660], [2900, 480]
      ], 'dirt', { thickness: 24, isGroundMass: true });

      world.addThorn(1950, 640, 30);
      world.addThorn(2200, 640, 30);
      world.addThorn(2450, 640, 30);

      // Bûche 1 (oscille vers la droite quand l'autre va vers la gauche)
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 1950,
        pivotY: 460,
        moveX: 100,
        moveY: 0,
        moveSpeed: 1.3,
        localPoints: [[-90, 0], [90, 0]],
        stiffness: 24,
        damping: 3.2,
        thickness: 22
      });

      // Bûche 2
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 2450,
        pivotY: 460,
        moveX: -100,
        moveY: 0,
        moveSpeed: 1.3,
        localPoints: [[-90, 0], [90, 0]],
        stiffness: 24,
        damping: 3.2,
        thickness: 22
      });

      // Câble aérien ultra-fin en raccourci vertigineux
      world.addPolyline([
        [1550, 240], [2150, 200], [2850, 240]
      ], 'silk', { thickness: 12, isGroundMass: false });

      world.addPowerUp(2150, 130, 'feather');
      world.addMushroom(2200, 625, 46, 440, 0.08);

      // CHECKPOINT 2
      world.addCheckpoint(3000, 460, 'Checkpoint 2');

      // SECTION 3 : Bûche Roulante & Arrivée
      world.addPolyline([
        [2900, 480], [3250, 400], [3650, 480], [4000, 400], [4400, 440],
        [4750, 380], [5600, 380], [5600, 160]
      ], 'root', { thickness: 26, isGroundMass: true });

      world.addProp('pinecone', 3350, 350, 1.1);
      world.addHedgehog(3850, 455, 28, 3700, 3980);
      world.addPowerUp(4400, 360, 'speed');
      world.addAphid(4600, 395, 22, 4480, 4720);

      world.addDecoration('flower', 4900, 380, 1.2);
      world.addDecoration('fern', 5150, 380, 1.4);
    }
  },

  // --------------------------------------------------------------------------
  // NIVEAU 7 : La Ruche & les Cires (Difficile)
  // --------------------------------------------------------------------------
  {
    id: 7,
    cupId: 'coupe_titans',
    difficulty: 'Difficile',
    theme: 'hive',
    bgSet: 'game_background_3',
    name: 'Titans 2 — La Ruche & les Cires (Difficile)',
    subtitle: 'Alvéoles hexagonales, mares de miel collantes, bascules d’ambre et conduit de gelée royale !',
    skyTop: '#ff9900',
    skyBottom: '#ffe259',
    accentBg: '#b86b11',
    startX: 160,
    startY: 520,
    finishX: 5500,
    finishY: 400,
    coachHint: '💡 <strong>Difficile — La Ruche & les Cires :</strong> Le <strong>Miel</strong> vous immobilise ! Bandez votre chenille à fond (>50%) pour vous libérer d’un coup sec. Le conduit de ventilation supérieur est le raccourci des champions.',
    build(world) {
      // SECTION 1 : Entrée de la Ruche & Alvéoles Hexagonales
      world.addPolyline([
        [-200, 300], [-200, 560], [300, 560], [550, 500], [800, 560],
        [1100, 560], [1350, 480], [1650, 480]
      ], 'honeycomb', { thickness: 26, isGroundMass: true });

      // Plafond d'alvéoles
      world.addPolyline([
        [200, 260], [600, 220], [1000, 260], [1400, 220], [1700, 260]
      ], 'honeycomb', { thickness: 24, isGroundMass: false });

      // Flaques de miel collant au sol
      world.addStickyCrumb(680, 545, 32, 'honey');
      world.addStickyCrumb(950, 545, 32, 'honey');

      world.addProp('acorn', 420, 535, 1.0);
      world.addHedgehog(1220, 535, 28, 1120, 1320);

      // CHECKPOINT 1
      world.addCheckpoint(1550, 470, 'Checkpoint 1');

      // SECTION 2 : Mer de Miel & Bascules d'Ambre
      world.addPolyline([
        [1650, 480], [1800, 640], [2800, 640], [2950, 460]
      ], 'honeycomb', { thickness: 24, isGroundMass: true });

      world.addStickyCrumb(2000, 625, 36, 'honey');
      world.addStickyCrumb(2300, 625, 36, 'honey');
      world.addStickyCrumb(2600, 625, 36, 'honey');
      world.addThorn(2150, 625, 26);
      world.addThorn(2450, 625, 26);

      // Plateformes bascules d'ambre instables
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'honeycomb',
        pivotX: 2050,
        pivotY: 460,
        localPoints: [[-110, 0], [110, 0]],
        stiffness: 14,
        damping: 2.2,
        maxAngle: 0.55,
        thickness: 22
      });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'honeycomb',
        pivotX: 2550,
        pivotY: 460,
        localPoints: [[-110, 0], [110, 0]],
        stiffness: 14,
        damping: 2.2,
        maxAngle: 0.55,
        thickness: 22
      });

      // Conduit de gelée royale supérieur (Raccourci ultra-rapide)
      world.addPolyline([
        [1650, 200], [2300, 160], [2950, 200]
      ], 'silk', { thickness: 20, isGroundMass: false });

      world.addPowerUp(2300, 90, 'speed');
      world.addMushroom(2300, 605, 46, 440, 0.08);

      // CHECKPOINT 2
      world.addCheckpoint(3050, 450, 'Checkpoint 2');

      // SECTION 3 : Labyrinthe d'Alvéoles & Ligne d'Arrivée
      world.addPolyline([
        [2950, 460], [3300, 400], [3650, 480], [4000, 400], [4400, 460],
        [4800, 400], [5800, 400], [5800, 160]
      ], 'honeycomb', { thickness: 26, isGroundMass: true });

      world.addStickyCrumb(3480, 420, 28, 'honey');
      world.addHedgehog(3850, 455, 28, 3700, 3980);
      world.addProp('acorn', 4150, 380, 1.0);
      world.addPowerUp(4400, 380, 'strength');
      world.addAphid(4650, 415, 22, 4520, 4780);

      world.addDecoration('flower', 5050, 400, 1.2);
      world.addDecoration('fern', 5300, 400, 1.4);
    }
  },

  // --------------------------------------------------------------------------
  // NIVEAU 8 : Le Festin des Tempêtes (Grand Finale)
  // --------------------------------------------------------------------------
  {
    id: 8,
    cupId: 'coupe_titans',
    difficulty: 'Difficile',
    theme: 'picnic_chaos',
    bgSet: 'game_background_4',
    name: 'Titans 3 — Le Festin des Tempêtes (Grand Finale)',
    subtitle: 'L’apothéose : Canettes métalliques glissantes, couteau à bascule, lac de confiture et fil céleste à 140px !',
    skyTop: '#232526',
    skyBottom: '#414345',
    accentBg: '#c0392b',
    startX: 160,
    startY: 540,
    finishX: 5800,
    finishY: 380,
    coachHint: '💡 <strong>Grand Finale — Le Festin des Tempêtes :</strong> La course reine ! Traversez les canettes glissantes, gardez l’équilibre sur le couteau à bascule, planez au-dessus du gouffre de confiture et osez le câble céleste à 140px d’altitude pour triompher ! 🏆',
    build(world) {
      // SECTION 1 : Table de pique-nique & Canettes métalliques
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 520], [800, 520]
      ], 'plastic', { thickness: 26, isGroundMass: true });

      // Canette renversée très glissante
      world.addPolyline([
        [800, 520], [1050, 440], [1300, 440], [1500, 520]
      ], 'can', { thickness: 28, isGroundMass: true });

      world.addProp('acorn', 450, 555, 1.0);
      world.addAphid(650, 500, 22, 560, 750);
      world.addStickyCrumb(1180, 425, 28, 'jam');

      // Grand Couteau à bascule (Seesaw)
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'fork',
        pivotX: 1650,
        pivotY: 480,
        localPoints: [[-140, 0], [140, 0]],
        stiffness: 12,
        damping: 2.0,
        maxAngle: 0.60,
        inertia: 22000,
        thickness: 24
      });

      // CHECKPOINT 1
      world.addCheckpoint(1800, 460, 'Checkpoint 1');

      // SECTION 2 : Le Gouffre de Confiture Géant & Câble Céleste
      world.addPolyline([
        [1800, 480], [1950, 680], [3250, 680], [3400, 460]
      ], 'plastic', { thickness: 24, isGroundMass: true });

      // Mer de confiture gluante et pointes au fond
      world.addStickyCrumb(2200, 660, 36, 'jam');
      world.addStickyCrumb(2600, 660, 36, 'jam');
      world.addStickyCrumb(3000, 660, 36, 'jam');
      world.addThorn(2400, 660, 28);
      world.addThorn(2800, 660, 28);

      // Tremplin et plume au bord du gouffre
      world.addPowerUp(1880, 420, 'feather');

      // Pailles de boisson flottantes à mi-hauteur
      world.addPolyline([
        [2200, 480], [2500, 480]
      ], 'straw', { thickness: 22, isGroundMass: false });

      world.addPolyline([
        [2700, 480], [3000, 480]
      ], 'straw', { thickness: 22, isGroundMass: false });

      // Graines piquantes en suspension dans le gouffre
      world.addThorn(2350, 360, 26);
      world.addThorn(2850, 360, 26);

      // CÂBLE CÉLESTE À 140PX D'ALTITUDE (Raccourci suprême pour speedrunners)
      world.addPolyline([
        [1750, 160], [2550, 140], [3450, 160]
      ], 'silk', { thickness: 12, isGroundMass: false });

      world.addPowerUp(2550, 80, 'speed');
      world.addMushroom(2600, 645, 46, 450, 0.08);

      // CHECKPOINT 2
      world.addCheckpoint(3500, 440, 'Checkpoint 2');

      // SECTION 3 : La Grande Boucle du Panier & Arrivée Triomphale
      world.addPolyline([
        [3400, 460], [3750, 380], [4100, 480], [4450, 380], [4800, 460],
        [5150, 380], [6100, 380], [6100, 140]
      ], 'root', { thickness: 28, isGroundMass: true });

      world.addProp('pinecone', 3900, 340, 1.25);
      world.addHedgehog(4250, 455, 28, 4120, 4380);
      world.addHedgehog(4950, 435, 28, 4820, 5080);
      world.addPowerUp(4700, 380, 'strength');
      world.addAphid(5350, 355, 22, 5220, 5480);

      world.addDecoration('flower', 5550, 380, 1.3);
      world.addDecoration('fern', 5750, 380, 1.5);
    }
  },

  // ============================================================================
  // COUPE 4 : COUPE DE LA FOURMILIÈRE ROYALE (MAÎTRE) — Verticalité, Multi-Chemins & Mécaniques Concept Art
  // ============================================================================
  {
    id: 9,
    cupId: 'coupe_fourmiliere',
    difficulty: 'Maître',
    name: 'Fourmilière 1 — La Branche aux Gouttes & L’Arbre Creux',
    subtitle: 'Abri sous les excroissances d’écorce contre les gouttes géantes, puis choix entre Canopée de Soie et Galerie des Fourmis !',
    theme: 'canopy',
    bgSet: 'game_background_2',
    skyTop: '#1a2618',
    skyBottom: '#2d4c2b',
    startX: 150,
    startY: 250,
    finishX: 4380,
    finishY: 360,
    coachHint: '💡 BRANCHE AUX GOUTTES & FOURMIS : Abrite-toi sous l’écorce quand une goutte tombe (2s), et attrape les fourmis dès qu’elles affichent ❗ !',
    build(world) {
      // Mur arrière de départ (Haut du tronc)
      world.addPolyline([[40, 80], [40, 680]], 'root', { thickness: 28 });

      // =========================================================================
      // ZONE 1 : POINT DE DÉPART HAUT & LA BRANCHE AUX GOUTTES (X=40 -> 1320)
      // (Inspiré du Concept Art 1 : saut en contrebas, gouttes toutes les 2s, abris d'écorce & zone glissante en bas)
      // =========================================================================
      world.addPolyline([[40, 270], [290, 270]], 'root', { thickness: 26, isGroundMass: true });
      world.addDecoration('fern', 120, 270, 1.3);

      // La Branche aux Gouttes (Palier principal Y=400..420)
      world.addPolyline([
        [270, 410], [640, 410], [960, 420], [1280, 410]
      ], 'root', { thickness: 26 });

      // Excroissances d'écorce (Abris naturels bloquant les gouttes d'eau !)
      world.addPolyline([[450, 310], [560, 305]], 'root', { thickness: 20 });
      world.addDecoration('bark_shelter', 505, 310, 1.2);
      world.addPolyline([[800, 315], [910, 310]], 'root', { thickness: 20 });
      world.addDecoration('bark_shelter', 855, 315, 1.2);

      // 3 Émetteurs de Gouttes Géantes (tombent toutes les 2 secondes du feuillage supérieur)
      world.addWaterDropEmitter(380, 90, 680, 2.0, 0.0, 'water');
      world.addWaterDropEmitter(690, 90, 680, 2.0, 0.65, 'water');
      world.addWaterDropEmitter(1040, 90, 680, 2.0, 1.30, 'water');

      // Zone de récupération glissante en contrebas (si une goutte fait glisser la chenille)
      world.addPolyline([
        [240, 630], [720, 650], [1180, 610], [1340, 540]
      ], 'moss', { thickness: 28, isGroundMass: true });
      world.addAnt(620, 615, 25, 420, 820);
      world.addMushroom(1240, 560, 44, 430, -0.12); // Remontée rapide vers le carrefour

      // Première Fourmi sentinelle à la sortie de la Branche aux Gouttes + Gland
      world.addProp('acorn', 980, 380, 1.0);
      world.addAnt(1150, 380, 25, 1020, 1250);

      // =========================================================================
      // ZONE 2 : GRANDE BIFURCATION MULTI-CHEMINS (X=1320 -> 2520)
      // - VOIE HAUTE (Y=250..310) : Canopée Suspendue, Ponts de Soie & Plume (3s max)
      // - VOIE BASSE (Y=740) : Galerie Racinaire des Fourmis & Unique Pomme Verte (+1 Segment)
      // =========================================================================
      world.addMushroom(1260, 398, 42, 420, 0.08);

      // --- VOIE HAUTE : Canopée & Soie ---
      world.addPolyline([[1360, 270], [1680, 250]], 'mushroom_cap', { thickness: 24 });
      world.addPowerUp(1540, 195, 'feather'); // Plume (3s max de plané précis !)
      world.addPolyline([[1760, 250], [2080, 230]], 'silk', { thickness: 18 });
      world.addPolyline([[2140, 260], [2460, 310]], 'root', { thickness: 24 });
      world.addAphid(2280, 255, 22, 2160, 2420);

      // --- VOIE BASSE : Galerie Racinaire Souterraine ---
      world.addPolyline([
        [1340, 540], [1540, 740], [2080, 740], [2440, 620]
      ], 'dirt', { thickness: 28, isGroundMass: true });
      // Plafond d'écorce du tunnel bas (permet aussi de marcher au plafond en Ω !)
      world.addPolyline([[1480, 510], [2140, 510]], 'root', { thickness: 24 });
      world.addAnt(1680, 710, 25, 1550, 1820);
      world.addBonusApple(1840, 690, 'segment'); // UNIQUE Pomme Verte (+1 Segment) du Niveau 9 !
      world.addAnt(2020, 710, 25, 1880, 2150);
      world.addPowerUp(1750, 680, 'strength');
      world.addMushroom(2380, 635, 46, 445, -0.14);

      world.addDecoration('glowing_shroom', 1620, 740, 1.3);
      world.addDecoration('amber_crystal', 1960, 735, 1.25);

      // =========================================================================
      // ZONE 3 : CHECKPOINT 1 & LE TOURNIQUET DU TRONC CREUX (X=2500 -> 3600)
      // =========================================================================
      world.addPolyline([[2480, 480], [2860, 480]], 'dirt', { thickness: 28, isGroundMass: true });
      world.addCheckpoint(2580, 465, 'Cœur du Tronc');
      world.addDecoration('ant_arch', 2720, 480, 1.3);

      // Tourniquet de Brindilles à 4 pales au-dessus de la fosse médiane
      world.addDynamicPlatform({
        type: 'turnstile',
        pivotX: 3080,
        pivotY: 410,
        localPoints: [[-135, 0], [135, 0], [0, 0], [0, -135], [0, 135]],
        material: 'root',
        thickness: 20,
        spinSpeed: 1.15
      });

      // Filet de sécurité sous le tourniquet avec ronces et tremplin de secours
      world.addPolyline([[2860, 660], [3340, 660], [3580, 520]], 'dirt', { thickness: 28, isGroundMass: true });
      world.addThorn(3080, 650, 30);
      world.addMushroom(3480, 550, 44, 430, -0.12);

      // Palier haut après le tourniquet
      world.addPolyline([[3260, 360], [3620, 360]], 'root', { thickness: 24 });
      world.addAnt(3440, 330, 26, 3290, 3580);

      // =========================================================================
      // ZONE 4 : SANCTUAIRE FINAL & CHRYSALIDE DORÉE (X=3640 -> 4550)
      // =========================================================================
      world.addPolyline([
        [3640, 360], [4560, 360], [4560, 140]
      ], 'dirt', { thickness: 28, isGroundMass: true });
      world.addCheckpoint(3720, 345, 'Cime Royale');

      // Plafond de soie optionnel pour esquiver la dernière fourmi par le haut
      world.addPolyline([[3860, 195], [4220, 195]], 'silk', { thickness: 18 });
      world.addAnt(4040, 330, 26, 3880, 4200);
      world.addBonusApple(4040, 150, 'heal');

      world.addDecoration('golden_chrysalis', 4320, 360, 1.35);
      world.addDecoration('amber_crystal', 4180, 360, 1.3);
      world.addDecoration('fern', 4420, 360, 1.4);
    }
  },
  {
    id: 10,
    cupId: 'coupe_fourmiliere',
    difficulty: 'Maître',
    name: 'Fourmilière 2 — Le Labyrinthe des Sèves et des Ombres',
    subtitle: 'Branche aux Gouttes, Couloir des Ouvrières en Ω, Tourniquet 360°, Cascade de Sève et Tanière des Feuilles !',
    theme: 'hive',
    bgSet: 'game_background_3',
    skyTop: '#142218',
    skyBottom: '#d48817',
    startX: 150,
    startY: 210,
    finishX: 4460,
    finishY: 360,
    coachHint: '💡 CASCADE DE SÈVE : La sève dorée te tire vers le bas ! Enchaîne vite les sauts muraux (Q/D) sur la paroi d’écorce en évitant les épines !',
    build(world) {
      // Mur arrière
      world.addPolyline([[40, 60], [40, 640]], 'root', { thickness: 28 });

      // =========================================================================
      // 1. POINT DE DÉPART HAUT & LA BRANCHE AUX GOUTTES (X=40 -> 1220)
      // =========================================================================
      world.addPolyline([[40, 230], [280, 230]], 'root', { thickness: 26, isGroundMass: true });
      world.addDecoration('glowing_shroom', 110, 230, 1.2);

      // Saut en contrebas sur la Branche aux Gouttes (Y=380)
      world.addPolyline([[260, 380], [720, 380], [1180, 380]], 'root', { thickness: 26 });

      // Excroissances d'écorce (abris contre les gouttes)
      world.addPolyline([[430, 275], [545, 270]], 'root', { thickness: 20 });
      world.addDecoration('bark_shelter', 485, 275, 1.2);
      world.addPolyline([[790, 275], [905, 270]], 'root', { thickness: 20 });
      world.addDecoration('bark_shelter', 845, 275, 1.2);

      // Gouttes d'eau géantes toutes les 2 secondes
      world.addWaterDropEmitter(360, 80, 620, 2.0, 0.0, 'water');
      world.addWaterDropEmitter(660, 80, 620, 2.0, 0.7, 'water');
      world.addWaterDropEmitter(1020, 80, 620, 2.0, 1.4, 'water');

      // Zone glissante inférieure si touché par une goutte
      world.addPolyline([[240, 590], [820, 610], [1220, 520]], 'moss', { thickness: 28, isGroundMass: true });
      world.addMushroom(1140, 535, 42, 420, -0.10);

      // =========================================================================
      // 2. LE COULOIR DES CHENILLES OUVRIÈRES (X=1220 -> 2120)
      // Plafond bas d'écorce permettant l'accroche inversée Ω + patrouilles de Fourmis au sol
      // =========================================================================
      world.addPolyline([[1200, 480], [1680, 480], [2100, 460]], 'dirt', { thickness: 28, isGroundMass: true });
      // Plafond du Couloir des Ouvrières (Y=295) : idéal pour passer au plafond ou sur le toit !
      world.addPolyline([[1240, 295], [1680, 295], [2060, 295]], 'root', { thickness: 24 });

      world.addAnt(1440, 450, 25, 1280, 1600);
      world.addAnt(1840, 440, 26, 1680, 2020);
      world.addProp('acorn', 1290, 445, 1.0);
      world.addBonusApple(1660, 240, 'heal'); // Récompense sur le toit du couloir

      world.addDecoration('hanging_vine', 1380, 295, 1.3);
      world.addDecoration('hanging_vine', 1760, 295, 1.4);
      world.addDecoration('glowing_shroom', 1560, 480, 1.25);

      // =========================================================================
      // 3. LE TOURNIQUET DE BRINDILLES (X=2120 -> 2680)
      // Structure en croix tournant à 360° au-dessus d'une fosse à épines
      // =========================================================================
      world.addCheckpoint(2060, 445, 'Le Tourniquet');

      world.addDynamicPlatform({
        type: 'turnstile',
        pivotX: 2390,
        pivotY: 390,
        localPoints: [[-155, 0], [155, 0], [0, 0], [0, -155], [0, 155]],
        material: 'root',
        thickness: 22,
        spinSpeed: 1.35
      });

      // Pomme Verte secrète (+1 Segment) au sommet du Tourniquet !
      world.addBonusApple(2390, 195, 'segment');

      // Fosse sous le tourniquet avec épines & champignon de sauvetage
      world.addPolyline([[2100, 680], [2680, 680]], 'dirt', { thickness: 28, isGroundMass: true });
      world.addThorn(2310, 670, 28);
      world.addThorn(2470, 670, 28);
      world.addMushroom(2610, 668, 46, 455, -0.10);

      // =========================================================================
      // 4. LA CASCADE DE SÈVE & LE MUR D'ESCALADE ÉPINEUX (X=2680 -> 3260)
      // Cascade verticale de sève dorée qui ralentit et tire vers le bas + cheminée verticale
      // =========================================================================
      world.addPolyline([[2660, 470], [2920, 470]], 'honeycomb', { thickness: 26, isGroundMass: true });

      // La Cascade de Sève (X=2965, de Y=150 à Y=660)
      world.addSapCascade(2965, 150, 660, 72, 230);

      // Paroi gauche (avec quelques ronces à esquiver) & Paroi droite d'écorce pour le Wall-Jump (Q/D)
      world.addPolyline([[2890, 470], [2890, 190]], 'root', { thickness: 24 });
      world.addThorn(2908, 350, 22);
      world.addPolyline([[3045, 560], [3045, 170]], 'root', { thickness: 26 });
      world.addThorn(3028, 430, 22);
      world.addThorn(3028, 270, 22);

      // Tremplin d'amorce en bas de la cascade au cas où le joueur est entraîné tout en bas
      world.addPolyline([[2860, 650], [3120, 650]], 'honeycomb', { thickness: 26, isGroundMass: true });
      world.addMushroom(2965, 638, 46, 465, 0.04);

      // Palier supérieur au sommet de la Cascade de Sève (Y=170)
      world.addPolyline([[3045, 170], [3320, 190]], 'honeycomb', { thickness: 26 });
      world.addCheckpoint(3180, 155, 'Haut des Sèves');
      world.addPowerUp(3260, 130, 'feather'); // Plume (3s) pour aider sur la Tanière de l'Araignée !

      // =========================================================================
      // 5. LA TANIÈRE DE L'ARAIGNÉE — LES 3 FEUILLES SUSPENDUES (X=3320 -> 4080)
      // 3 feuilles oscillantes au-dessus d'un lit d'épines (ou route de soie haute)
      // =========================================================================
      world.addDynamicPlatform({
        type: 'leaf',
        pivotX: 3480,
        pivotY: 290,
        points: [[-105, 0], [0, 8], [105, 0]],
        material: 'leaf',
        thickness: 20,
        stiffness: 18,
        damping: 1.8,
        maxAngle: 0.48
      });
      world.addDynamicPlatform({
        type: 'leaf',
        pivotX: 3740,
        pivotY: 320,
        points: [[-105, 0], [0, 8], [105, 0]],
        material: 'leaf',
        thickness: 20,
        stiffness: 18,
        damping: 1.8,
        maxAngle: 0.48
      });
      world.addDynamicPlatform({
        type: 'leaf',
        pivotX: 4000,
        pivotY: 340,
        points: [[-105, 0], [0, 8], [105, 0]],
        material: 'leaf',
        thickness: 20,
        stiffness: 18,
        damping: 1.8,
        maxAngle: 0.48
      });

      // Lit d'épines au fond de la Tanière + Champignon de sauvetage
      world.addPolyline([[3300, 620], [4120, 620]], 'dirt', { thickness: 28, isGroundMass: true });
      world.addThorn(3480, 610, 30);
      world.addThorn(3680, 610, 30);
      world.addThorn(3880, 610, 30);
      world.addMushroom(4040, 608, 48, 465, -0.10);

      // =========================================================================
      // 6. L'ARRIVÉE — LE TRONC CREUX & LA CHRYSALIDE DORÉE (X=4120 -> 4650)
      // =========================================================================
      world.addPolyline([
        [4120, 360], [4680, 360], [4680, 120]
      ], 'root', { thickness: 28, isGroundMass: true });
      // Arche supérieure de la racine creuse (exactement comme sur le plan Niveau 2 !)
      world.addPolyline([[4260, 180], [4520, 160], [4680, 220]], 'root', { thickness: 26 });

      world.addAnt(4260, 330, 26, 4150, 4360);
      world.addBonusApple(4390, 310, 'heal');
      world.addDecoration('golden_chrysalis', 4420, 360, 1.45);
      world.addDecoration('amber_crystal', 4200, 360, 1.3);
      world.addDecoration('glowing_shroom', 4510, 360, 1.35);
    }
  },
  {
    id: 11,
    cupId: 'coupe_fourmiliere',
    difficulty: 'Maître',
    name: 'Fourmilière 3 — L’Éveil de l’Effroyeur & Le Toboggan de Sève',
    subtitle: 'Fuis l’Effroyeur de feu, esquive les braises tombantes, freine sur le Toboggan de Sève et franchis les Feuilles !',
    theme: 'picnic_chaos',
    bgSet: 'game_background_4',
    skyTop: '#24080b',
    skyBottom: '#d35400',
    startX: 160,
    startY: 260,
    finishX: 4560,
    finishY: 320,
    coachHint: '💡 TOBOGGAN DE SÈVE : Utilise ton ancre arrière (Q) pour freiner dans la grande descente avant les ronces, puis saute en Ω au bout du tremplin !',
    build(world) {
      // Mur arrière
      world.addPolyline([[40, 80], [40, 620]], 'root', { thickness: 28 });

      // =========================================================================
      // ZONE 1 : L'ÉVEIL DE L'EFFROYEUR & LA FUITE SUR LES BRANCHES (X=40 -> 1080)
      // Silhouette géante de l'oiseau de feu "L'Effroyeur" + branches escarpées
      // =========================================================================
      world.addDecoration('effroyeur_boss', 110, 250, 1.45);

      world.addPolyline([
        [40, 280], [340, 280], [640, 360], [980, 380]
      ], 'root', { thickness: 26, isGroundMass: true });

      // Braises ardentes de l'Effroyeur qui tombent du ciel !
      world.addWaterDropEmitter(460, 70, 620, 1.85, 0.2, 'ember');
      world.addWaterDropEmitter(780, 70, 620, 1.85, 1.1, 'ember');

      world.addAnt(820, 350, 25, 680, 950);

      // =========================================================================
      // ZONE 2 : LES OBSTACLES TOMBANTS & DOUBLE ROUTE (X=1020 -> 2020)
      // Pommes de pin enflammées tombantes + Route Haute (Soie) vs Route Basse (Fourmis)
      // =========================================================================
      // Route Médiane / Basse : Ponts d'écorce bombardés par les braises
      world.addPolyline([
        [980, 380], [1340, 440], [1720, 440], [2020, 360]
      ], 'root', { thickness: 26, isGroundMass: true });
      world.addWaterDropEmitter(1220, 80, 650, 1.9, 0.0, 'ember');
      world.addWaterDropEmitter(1540, 80, 650, 1.9, 0.95, 'ember');
      world.addWaterDropEmitter(1820, 80, 650, 1.9, 0.45, 'ember');

      // Pommes de pin physiques et Fourmis Guerrières
      world.addProp('pinecone', 1120, 390, 1.15);
      world.addAnt(1420, 410, 26, 1280, 1580);
      world.addAnt(1760, 410, 26, 1620, 1900);

      // Abri d'écorce au milieu de la zone de bombardement + Route Haute en Soie
      world.addPolyline([[1380, 290], [1560, 285]], 'root', { thickness: 20 });
      world.addDecoration('bark_shelter', 1470, 290, 1.25);
      world.addPolyline([[1140, 210], [1520, 190], [1880, 210]], 'silk', { thickness: 18 });
      world.addBonusApple(1520, 145, 'segment'); // UNIQUE Pomme Verte (+1 Segment) sur la route haute périlleuse !

      // =========================================================================
      // ZONE 3 : LE TOBOGGAN DE SÈVE GLISSANTE (X=2020 -> 3120)
      // Grande descente ultra-rapide avec épines à esquiver, freinage d'ancre Q et saut Ω au bout !
      // =========================================================================
      world.addCheckpoint(2000, 345, 'Le Toboggan');
      world.addPowerUp(2080, 300, 'speed');

      // La grande rampe descendante en mousse & sève glissante (Y=360 -> Y=700 -> Tremplin Y=630)
      world.addPolyline([
        [2020, 360], [2320, 490], [2620, 640], [2840, 700], [3020, 630]
      ], 'moss', { thickness: 30, isGroundMass: true });

      // Cascade de sève au milieu du toboggan + Ronces à sauter ou freiner avant !
      world.addSapCascade(2480, 160, 610, 64, 210);
      world.addThorn(2640, 630, 28);
      world.addThorn(2850, 690, 28);

      // Tremplin d'éjection au bout du Toboggan de Sève
      world.addMushroom(2995, 618, 48, 470, 0.16);

      // Branche haute alternative (au-dessus du toboggan) pour ceux qui grimpent à la sève
      world.addPolyline([[2520, 260], [2920, 280]], 'root', { thickness: 22 });
      world.addBonusApple(2720, 220, 'heal');

      // =========================================================================
      // ZONE 4 : LA TRAVERSÉE DES FEUILLES TOMBANTES & TOURNIQUET (X=3120 -> 4040)
      // =========================================================================
      world.addDynamicPlatform({
        type: 'leaf',
        pivotX: 3240,
        pivotY: 420,
        points: [[-115, 0], [0, 8], [115, 0]],
        material: 'leaf',
        thickness: 20,
        stiffness: 17,
        damping: 1.7,
        maxAngle: 0.52
      });

      world.addDynamicPlatform({
        type: 'turnstile',
        pivotX: 3540,
        pivotY: 380,
        localPoints: [[-140, 0], [140, 0], [0, 0], [0, -140], [0, 140]],
        material: 'root',
        thickness: 20,
        spinSpeed: -1.30
      });

      world.addDynamicPlatform({
        type: 'leaf',
        pivotX: 3840,
        pivotY: 350,
        points: [[-115, 0], [0, 8], [115, 0]],
        material: 'leaf',
        thickness: 20,
        stiffness: 17,
        damping: 1.7,
        maxAngle: 0.52
      });
      world.addPowerUp(3540, 200, 'feather'); // Plume (3s max) au-dessus du tourniquet

      // Filet de sécurité inférieur avec fourmi et grand champignon de remontée
      world.addPolyline([[3120, 720], [3980, 720]], 'dirt', { thickness: 28, isGroundMass: true });
      world.addAnt(3540, 690, 26, 3320, 3760);
      world.addMushroom(3920, 708, 48, 475, -0.10);

      // =========================================================================
      // ZONE 5 : LE TRONC CREUX SÉCURISÉ & LA CHRYSALIDE DORÉE (X=4020 -> 4750)
      // =========================================================================
      world.addPolyline([
        [4020, 320], [4760, 320], [4760, 90]
      ], 'honeycomb', { thickness: 28, isGroundMass: true });
      world.addCheckpoint(4080, 305, 'Tronc Sécurisé');

      // Barricade de branches protectrices & Toit du Tronc Creux (comme sur le Concept Art 3)
      world.addPolyline([[4180, 150], [4580, 140], [4760, 200]], 'root', { thickness: 28 });
      world.addDecoration('ant_arch', 4180, 320, 1.4);

      // Ultime Garde Royale devant la Chrysalide Dorée
      world.addAnt(4340, 290, 27, 4200, 4460);
      world.addProp('acorn', 4140, 285, 1.0);

      world.addDecoration('golden_chrysalis', 4480, 320, 1.5);
      world.addDecoration('amber_crystal', 4400, 320, 1.35);
      world.addDecoration('flower', 4620, 320, 1.4);
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

    this.parallaxPacks = {};
    this.initParallaxPacks();
  }

  // Initialize and preload the 4 multi-layered parallax background packs from assets
  initParallaxPacks() {
    const basePath = 'assets/parallax%20backgrounds/';
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

    // Preload single pre-composited backgrounds for ultra-fast Eco Mode (1 single drawImage call, saving 90% GPU fillrate!)
    this.parallaxComposites = {};
    const compositeFiles = {
      game_background_1: 'game_background_1.png',
      game_background_2: 'game_background_2.png',
      game_background_3: 'game_background_3.1.png',
      game_background_4: 'game_background_4.png'
    };
    for (const [packName, file] of Object.entries(compositeFiles)) {
      const img = new Image();
      img.src = `${basePath}${packName}/${file}`;
      const item = { img, loaded: false };
      img.onload = () => { item.loaded = true; };
      this.parallaxComposites[packName] = item;
    }
  }

  // Draw an individual parallax image layer with horizontal wrapping and camera offsets
  drawParallaxLayer(ctx, layer, width, height, cameraX, cameraY, time) {
    if (!layer.loaded || !layer.img || layer.img.naturalWidth === 0) return false;

    const img = layer.img;
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawH = height;
    const drawW = Math.round(drawH * aspect);

    if (drawW <= 0 || drawH <= 0) return false;

    const animX = (layer.animSpeed || 0) * (time || 0);
    const scrollX = (cameraX * (layer.factorX || 0) + animX) % drawW;

    let drawY = 0;
    if (layer.alignBottom) {
      const camOffsetY = ((cameraY || 500) - 500) * (layer.factorY || 0.06);
      drawY = Math.round(height - drawH - camOffsetY);
    } else {
      const camOffsetY = ((cameraY || 500) - 500) * (layer.factorY || 0.02);
      drawY = Math.round(-camOffsetY + (layer.offsetY || 0));
    }

    let startX = -scrollX;
    while (startX > 0) startX -= drawW;
    while (startX + drawW < 0) startX += drawW;

    for (let x = startX; x < width + drawW; x += drawW - 1) {
      ctx.drawImage(img, Math.floor(x), drawY, drawW + 1, drawH);
    }

    return true;
  }

  // Rich Multi-Layered Parallax Background adapted to each Level's Universe Theme!
  drawBackground(ctx, width, height, cameraX, cameraY, level, time) {
    const theme = level.theme || 'forest';
    const bgSet = level.bgSet || 'game_background_2';
    const bgMode = (typeof GAMEPLAY_CONFIG !== 'undefined' && GAMEPLAY_CONFIG.backgroundMode) ? GAMEPLAY_CONFIG.backgroundMode : 'parallax';

    // ECO MODE: 1 single drawImage call with gentle parallax, saving 90% GPU fillrate!
    if (bgMode === 'eco') {
      const comp = this.parallaxComposites ? this.parallaxComposites[bgSet] : null;
      if (comp && comp.loaded && comp.img && comp.img.naturalWidth > 0) {
        const aspect = comp.img.naturalWidth / comp.img.naturalHeight;
        const drawH = height;
        const drawW = Math.round(drawH * aspect);
        const scrollX = (cameraX * 0.12) % drawW;
        let startX = -scrollX;
        while (startX > 0) startX -= drawW;
        while (startX + drawW < 0) startX += drawW;
        for (let x = startX; x < width + drawW; x += drawW - 1) {
          ctx.drawImage(comp.img, Math.floor(x), 0, drawW + 1, drawH);
        }
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
      ctx.beginPath();
      ctx.arc(width * 0.82, height * 0.18, 75, 0, Math.PI * 2);
      ctx.fill();

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
    // 1. Draw Complete Filled Cartoon Terrain Masses
    for (const chain of world.terrainChains) {
      if (chain.isGroundMass) {
        this.drawCompleteTerrainMass(ctx, chain, time, level);
      }
    }

    // 2. Draw Background Scenic & Interactive Decorations
    for (const dec of world.decorations) {
      this.drawDecoration(ctx, dec, time, world);
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

    // 2. Top Surface Crust (Distinct texture per material: moss, honeycomb/amber, root, dirt)
    const isMoss = chain.material === 'moss';
    const isAmber = chain.material === 'honeycomb';
    const isBark = chain.material === 'root';

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
          // Golden resin facets & honeyed shine
          ctx.fillStyle = 'rgba(255, 242, 175, 0.78)';
          ctx.beginPath();
          ctx.roundRect(gx - 8, gy + 1, 16, 5, 2.5);
          ctx.fill();
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
          ctx.strokeStyle = '#2d8a18';
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

  // Draw Elevated Structures (root, stem, silk, mushroom_cap, reed, honeycomb, straw, can, plastic, fork)
  drawElevatedStructure(ctx, chain, time) {
    const pts = chain.points;
    if (pts.length < 2) return;
    const thick = chain.thickness || 24;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (chain.material === 'root') {
      const isMostlyHorizontal = Math.abs(pts[pts.length - 1][0] - pts[0][0]) > Math.abs(pts[pts.length - 1][1] - pts[0][1]);
      if (isMostlyHorizontal) {
        const midIdx = Math.floor(pts.length / 2);
        const supportPt = pts[midIdx];
        ctx.fillStyle = '#523015';
        ctx.strokeStyle = '#261507';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(supportPt[0] - 18, supportPt[1]);
        ctx.lineTo(supportPt[0] + 18, supportPt[1]);
        ctx.lineTo(supportPt[0] + 28, supportPt[1] + 240);
        ctx.lineTo(supportPt[0] - 28, supportPt[1] + 240);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bark vertical striations on support trunk
        ctx.strokeStyle = 'rgba(38, 21, 7, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(supportPt[0] - 6, supportPt[1] + 12);
        ctx.lineTo(supportPt[0] - 10, supportPt[1] + 220);
        ctx.moveTo(supportPt[0] + 7, supportPt[1] + 24);
        ctx.lineTo(supportPt[0] + 11, supportPt[1] + 210);
        ctx.stroke();
      }

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

      // Detailed bark rings, knots & tiny sprouting leaves along the branch!
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const steps = Math.max(1, Math.floor(segLen / 75));
        for (let s = 1; s <= steps; s++) {
          const t = s / (steps + 1);
          const bx = p1[0] + (p2[0] - p1[0]) * t;
          const by = p1[1] + (p2[1] - p1[1]) * t;
          ctx.strokeStyle = '#4a260b';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(bx, by + 2, thick * 0.24, 0, Math.PI);
          ctx.stroke();
        }
      }
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

      // Botanical nodes & mini leaflets along the vine
      for (let i = 0; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) * 0.5;
        const my = (pts[i][1] + pts[i + 1][1]) * 0.5;
        const sway = Math.sin(time * 3 + mx * 0.05) * 0.12;
        ctx.save();
        ctx.translate(mx, my - thick * 0.45);
        ctx.rotate(-0.4 + sway);
        ctx.fillStyle = '#58d64c';
        ctx.strokeStyle = '#143814';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(6, -4, 9, 4.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (chain.material === 'silk') {
      // Caterpillar Silk Bridge (Fil de soie lumineux avec gouttes de rosée perlées)
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

      // Pearly dew droplets glistening under the silk strand
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const count = Math.max(1, Math.floor(segLen / 65));
        for (let k = 1; k <= count; k++) {
          const t = k / (count + 1);
          const dx = p1[0] + (p2[0] - p1[0]) * t;
          const dy = p1[1] + (p2[1] - p1[1]) * t + thick * 0.55;
          const pulse = 1 + Math.sin(time * 4 + dx * 0.1) * 0.18;
          ctx.fillStyle = 'rgba(178, 245, 234, 0.88)';
          ctx.strokeStyle = '#319795';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(dx, dy, 3.8 * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    } else if (chain.material === 'mushroom_cap') {
      // Giant Mushroom Terrace with gills & sturdy stalk
      const midX = (pts[0][0] + pts[pts.length - 1][0]) * 0.5;
      const midY = (pts[0][1] + pts[pts.length - 1][1]) * 0.5;
      ctx.fillStyle = '#fff5e4';
      ctx.strokeStyle = '#2d1b36';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(midX - 24, midY, 48, 220, 12);
      ctx.fill();
      ctx.stroke();

      // Mushroom gill lines on stalk top
      ctx.strokeStyle = 'rgba(180, 140, 110, 0.45)';
      ctx.lineWidth = 2;
      for (let gx = -14; gx <= 14; gx += 7) {
        ctx.beginPath();
        ctx.moveTo(midX + gx, midY + 6);
        ctx.lineTo(midX + gx, midY + 42);
        ctx.stroke();
      }

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

      for (const p of pts) {
        ctx.fillStyle = '#145a32';
        ctx.beginPath();
        ctx.arc(p[0], p[1], thick * 0.58, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (chain.material === 'honeycomb') {
      // Golden Honeycomb & Royal Amber Resin Ramp
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
      ctx.setLineDash([12, 10]);
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
      // Animated hanging vine with alternating leaves
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
      // Mossy curved bark canopy shelter ("Excroissance d'écorce" from Concept Art 1 & 2)
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
      // Radiant Golden Chrysalis suspended inside the Finish Hollow ("Chrysalide Dorée" from Concept Art 2 & 3)
      const pulse = 1 + Math.sin(time * 3.5) * 0.06;
      const sway = Math.sin(time * 1.8) * 0.08;
      ctx.rotate(sway);

      const aura = ctx.createRadialGradient(0, -42, 4, 0, -42, 46 * pulse);
      aura.addColorStop(0, 'rgba(255, 234, 167, 0.85)');
      aura.addColorStop(0.5, 'rgba(253, 203, 110, 0.35)');
      aura.addColorStop(1, 'rgba(253, 203, 110, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -42, 46 * pulse, 0, Math.PI * 2);
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
      // Giant menacing Fire-Bird predator silhouette ("L'Effroyeur" from Concept Art 3 Zone 1)
      const flap = Math.sin(time * 4.2) * 14;
      const fireAura = ctx.createRadialGradient(0, -55, 10, 0, -55, 95);
      fireAura.addColorStop(0, 'rgba(255, 121, 63, 0.55)');
      fireAura.addColorStop(0.6, 'rgba(211, 84, 0, 0.22)');
      fireAura.addColorStop(1, 'rgba(192, 57, 43, 0)');
      ctx.fillStyle = fireAura;
      ctx.beginPath();
      ctx.arc(0, -55, 95, 0, Math.PI * 2);
      ctx.fill();

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
    } else if (plat.type === 'turnstile') {
      // 360° Rotating Twig Turnstile ("Le Tourniquet de Brindilles" from Concept Art 2)
      for (const s of segs) {
        ctx.strokeStyle = '#241205';
        ctx.lineWidth = plat.thickness + 7;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        ctx.strokeStyle = '#78441c';
        ctx.lineWidth = plat.thickness;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

        ctx.strokeStyle = '#a86832';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }

      // Liana vine knot at the central axle + subtle rotational wind arcs
      ctx.fillStyle = '#4cd137';
      ctx.strokeStyle = '#183d16';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(plat.pivotX, plat.pivotY, 16, 0, Math.PI * 2);
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
      ctx.fillStyle = drop.kind === 'ember' ? 'rgba(255, 107, 53, 0.75)' : 'rgba(72, 219, 251, 0.75)';
      ctx.beginPath();
      ctx.arc(drop.x, drop.startY, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.fill();

      if (!drop.active) {
        ctx.restore();
        continue;
      }

      ctx.translate(drop.x, drop.y);
      const r = drop.radius || 22;

      if (drop.kind === 'ember') {
        // Falling burning pinecone / fire ember ("Obstacles Tombants" from Concept Art 3)
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
        // Giant Heavy Water Drop ("La Branche aux Gouttes" from Concept Art 1 & 2)
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

  // Draw Warrior Ant (Fourmi Rouge Guerrière) with animated 6 legs, mandibles, and counter-grab alert!
  drawAnt(ctx, ant, time) {
    ctx.save();
    let alpha = 1.0;
    let floatY = 0;
    if (ant.isDefeated && ant.deathTimer !== undefined) {
      alpha = Math.max(0, Math.min(1, ant.deathTimer / 0.8));
      floatY = -Math.sin(((0.8 - ant.deathTimer) / 0.8) * Math.PI) * 12;
    }
    ctx.globalAlpha = alpha;
    ctx.translate(ant.x, ant.y + floatY);

    const isWindup = ant.aiState === 'windup' && !ant.isHeld && !ant.isDefeated;
    const isPanicking = ant.isHeld || ant.isFlying;
    const r = ant.radius || 25;

    // Draw Alert Badge & Counter-Grab Ring BEFORE flipping horizontally so text is never mirrored!
    if (isWindup) {
      const windupRatio = Math.min(1, (ant.windupTimer || 0) / 0.68);
      const pulse = 1 + Math.sin(time * 24) * 0.14;

      // Counter-grab target ring around the ant
      ctx.save();
      ctx.strokeStyle = windupRatio > 0.65 ? '#ff4757' : '#ffa502';
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, (r + 11) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Exclamation mark bubble above head
      const alertY = -r - 22 - Math.abs(Math.sin(time * 18)) * 5;
      ctx.fillStyle = windupRatio > 0.65 ? '#ff4757' : '#ff9f43';
      ctx.strokeStyle = '#2d0c09';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, alertY, 12 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, alertY + 1);
      ctx.restore();
    } else if (ant.isHeld) {
      // Neutralized indicator while held by the player's suction cup
      ctx.save();
      ctx.fillStyle = 'rgba(46, 213, 115, 0.9)';
      ctx.font = '900 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TENUE ✓', 0, -r - 16);
      ctx.restore();
    }

    if (ant.isDefeated) {
      ctx.rotate(Math.sin(time * 6) * 0.18);
    } else if (isWindup) {
      // Rear up slightly while preparing the suplex grab!
      ctx.rotate(-0.18 * (ant.facing || 1));
    }
    ctx.scale(ant.squashX * (ant.facing || 1), ant.squashY);

    // 1. Six Articulated Chitinous Legs
    const legPhase = ant.legPhase !== undefined ? ant.legPhase : time * 14;
    const legAmp = isPanicking ? 7.5 : (isWindup ? 5.5 : 4.2);
    ctx.strokeStyle = '#38100a';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const legAnchors = [-r * 0.35, 0, r * 0.32];
    for (let i = 0; i < 3; i++) {
      const lx = legAnchors[i];
      const swing = Math.sin(legPhase + i * 2.1) * legAmp;
      const lift = Math.max(0, Math.cos(legPhase + i * 2.1)) * (isPanicking ? 6 : 3);
      ctx.beginPath();
      ctx.moveTo(lx, r * 0.18);
      ctx.lineTo(lx + swing * 0.5, r * 0.58 - lift * 0.5);
      ctx.lineTo(lx + swing, r * 0.96 - lift);
      ctx.stroke();
    }

    // 2. Segmented Body: Gaster (Rear Abdomen), Thorax (Middle), Head (Front)
    // 2a. Gaster (Abdomen with dark stripes & glossy highlight)
    const abdGrad = ctx.createRadialGradient(-r * 0.65, -r * 0.25, r * 0.1, -r * 0.58, -r * 0.08, r * 0.72);
    abdGrad.addColorStop(0, '#ff6b4a');
    abdGrad.addColorStop(0.55, '#c0392b');
    abdGrad.addColorStop(1, '#58110a');

    ctx.fillStyle = abdGrad;
    ctx.strokeStyle = '#2b0905';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(-r * 0.62, -r * 0.10, r * 0.56, r * 0.44, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Chitin stripes on abdomen
    ctx.strokeStyle = 'rgba(43, 9, 5, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-r * 0.62, -r * 0.10, r * 0.36, -1.1, 0.9);
    ctx.stroke();

    // Glossy specular shine on abdomen
    ctx.fillStyle = 'rgba(255, 235, 220, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.72, -r * 0.28, r * 0.22, r * 0.10, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // 2b. Thorax (Slender middle segment)
    ctx.fillStyle = '#a93226';
    ctx.strokeStyle = '#2b0905';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(-r * 0.02, r * 0.04, r * 0.36, r * 0.26, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2c. Head (Front segment)
    const headGrad = ctx.createRadialGradient(r * 0.45, -r * 0.18, r * 0.08, r * 0.48, -r * 0.05, r * 0.52);
    headGrad.addColorStop(0, '#e74c3c');
    headGrad.addColorStop(0.7, '#922b21');
    headGrad.addColorStop(1, '#4a120c');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(r * 0.50, -r * 0.06, r * 0.42, r * 0.36, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Expressive Antennae
    const antWiggle = Math.sin(time * (isWindup ? 28 : 10)) * 0.22;
    ctx.strokeStyle = '#2b0905';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(r * 0.62, -r * 0.34);
    ctx.lineTo(r * 0.78, -r * 0.72);
    ctx.lineTo(r * (1.05 + antWiggle), -r * 0.82);
    ctx.moveTo(r * 0.48, -r * 0.36);
    ctx.lineTo(r * 0.55, -r * 0.76);
    ctx.lineTo(r * (0.78 - antWiggle), -r * 0.90);
    ctx.stroke();

    // 4. Giant Pincer Mandibles (Open wide & vibrate during windup!)
    const jawOpen = isWindup ? (0.42 + Math.sin(time * 32) * 0.15) : (isPanicking ? 0.30 : 0.12);
    ctx.fillStyle = '#f39c12';
    ctx.strokeStyle = '#2b0905';
    ctx.lineWidth = 2.6;

    // Upper mandible
    ctx.save();
    ctx.translate(r * 0.82, -r * 0.10);
    ctx.rotate(-jawOpen);
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(r * 0.36, -r * 0.24, r * 0.46, -2);
    ctx.quadraticCurveTo(r * 0.24, 3, 0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Lower mandible
    ctx.save();
    ctx.translate(r * 0.82, r * 0.06);
    ctx.rotate(jawOpen);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(r * 0.24, -3, r * 0.46, 2);
    ctx.quadraticCurveTo(r * 0.36, r * 0.24, 0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Eyes (Fierce yellow/white during windup, dizzy X when defeated, wide when held)
    const eyeX = r * 0.58;
    const eyeY = -r * 0.14;
    if (ant.isDefeated) {
      ctx.strokeStyle = '#1e1108';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(eyeX - 4, eyeY - 4);
      ctx.lineTo(eyeX + 4, eyeY + 4);
      ctx.moveTo(eyeX + 4, eyeY - 4);
      ctx.lineTo(eyeX - 4, eyeY + 4);
      ctx.stroke();
    } else if (isPanicking) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e1108';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = isWindup ? '#fff200' : '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e1108';
      ctx.beginPath();
      ctx.arc(eyeX + 1.5, eyeY, 2.3, 0, Math.PI * 2);
      ctx.fill();

      // Angry brow line
      ctx.strokeStyle = '#2b0905';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(eyeX - 5, eyeY - 6);
      ctx.lineTo(eyeX + 5, eyeY - 3);
      ctx.stroke();
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
