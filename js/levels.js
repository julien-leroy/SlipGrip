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
