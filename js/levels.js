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
    subtitle: 'Initiation : chaque panneau enseigne un geste avant de le demander.',
    skyTop: '#ffefc2',
    skyBottom: '#b8f59e',
    accentBg: '#2d5a27',
    startX: 160,
    startY: 520,
    finishX: 4100,
    finishY: 520,
    coachHint: '💡 <strong>Initiation :</strong> suivez les panneaux en bois ! Flèches pour ramper, <strong>Q / D</strong> pour agripper la queue / la tête, <strong>Espace</strong> maintenu puis relâché pour bondir.',
    build(world) {
      // Each section teaches ONE gesture on safe ground before the next one asks for it.

      // 1. Ramper (flat, nothing to fail)
      world.addPolyline([
        [-200, 260], [-200, 560], [0, 560], [700, 560], [760, 500], [1150, 500], [1520, 510]
      ], 'dirt', { thickness: 36, isGroundMass: true });
      world.addDecoration('sign', 330, 560, 1, 0, 'Flèches →\npour ramper');
      world.addDecoration('flower', 520, 560, 1.0);

      // 2. Une marche : s’agripper et se hisser
      world.addDecoration('sign', 620, 560, 1, 0, 'Marche !\nMaintiens Q puis D\npour te hisser');
      world.addDecoration('fern', 820, 500, 1.1);

      // 3. Le coup de fouet, sur un puceron seul et du terrain plat
      world.addDecoration('sign', 960, 500, 1, 0, 'D (tête accrochée)\n+ Espace relâché\n= coup de fouet');
      world.addAphid(1250, 480, 22, 1150, 1380);
      world.addProp('acorn', 1450, 480, 1.0);

      world.addCheckpoint(1440, 490, 'Checkpoint 1');

      // 4. Saut chargé au-dessus d’un petit fossé (champignon de secours au fond)
      world.addPolyline([
        [1520, 510], [1640, 510], [1680, 640], [1840, 640], [1880, 500], [2050, 500]
      ], 'dirt', { thickness: 36, isGroundMass: true });
      world.addDecoration('sign', 1585, 510, 1, 0, 'Espace maintenu…\npuis relâché :\nsaut chargé !');
      world.addMushroom(1760, 605, 40, 400, 0.05);

      // 5. Faire le tour d’une branche (au-dessus, au bout, en dessous)
      world.addPolyline([
        [2050, 500], [2800, 500], [2900, 520]
      ], 'dirt', { thickness: 36, isGroundMass: true });
      world.addDecoration('sign', 2110, 500, 1, 0, 'Fais le tour\nde la branche :\nQ et D alternés');
      world.addPolyline([
        [2260, 400], [2420, 380], [2620, 395]
      ], 'root', { thickness: 46, isGroundMass: false, subtype: 'hanging' });
      world.addProp('acorn', 2420, 340, 1.0);
      world.addPowerUp(2700, 430, 'speed');

      world.addCheckpoint(2740, 480, 'Checkpoint 2');

      // 6. Pont de soie au-dessus d’un fossé, ligne droite finale
      world.addPolyline([
        [2900, 520], [2980, 640], [3420, 640], [3500, 520], [4500, 520], [4500, 200]
      ], 'dirt', { thickness: 36, isGroundMass: true });
      world.addDecoration('sign', 2860, 500, 1, 0, 'Pont de soie :\nça colle bien !');
      world.addPolyline([
        [2880, 500], [3200, 470], [3520, 500]
      ], 'silk', { thickness: 36, isGroundMass: false });
      world.addMushroom(3200, 605, 40, 420, 0.05);
      world.addPowerUp(3200, 400, 'feather');
      world.addAphid(3800, 500, 22, 3650, 3950);

      world.addDecoration('flower', 3620, 520, 1.1);
      world.addDecoration('fern', 3980, 520, 1.3);
      world.addDecoration('clover_patch', 3700, 520, 1.0);
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
    subtitle: 'Grosses tiges de jardin, feuille oscillante, champignons rebondissants et ponts de lianes suspendus !',
    skyTop: '#d4fcff',
    skyBottom: '#ffe596',
    accentBg: '#236937',
    startX: 160,
    startY: 540,
    finishX: 4600,
    finishY: 420,
    coachHint: '💡 <strong>Facile — Les Ponts de Lianes :</strong> Les <strong>Champignons 🍄</strong> vous propulsent dans les airs. Utilisez-les pour atteindre les grosses lianes supérieures et contourner les bosses de boue !',
    build(world) {
      // SECTION 1 : Tiges montantes & Premières lianes
      world.addPolyline([
        [-200, 280], [-200, 580], [0, 580], [400, 580], [650, 540], [850, 590],
        [1100, 590], [1350, 510], [1650, 510]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Grosse tige botanique à grimper
      world.addPolyline([
        [500, 555], [700, 465], [900, 465], [1100, 525]
      ], 'stem', { thickness: 50, isGroundMass: false });

      world.addProp('acorn', 420, 545, 1.0);
      world.addAphid(750, 430, 22, 650, 850);
      world.addDecoration('tomato', 880, 440, 1.1);

      // CHECKPOINT 1
      world.addCheckpoint(1500, 500, 'Checkpoint 1');

      // SECTION 2 : Ravin & Feuille Mobile + Rebond Champignon
      world.addPolyline([
        [1650, 510], [1800, 640], [2150, 640], [2300, 500], [2850, 500]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Plateforme feuille mobile épaisse au-dessus du ravin
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
        thickness: 38
      });

      // Champignon tremplin au fond du creux
      world.addMushroom(1980, 605, 44, 400, 0.06);

      // Grosse treille en tige en raccourci aérien
      world.addPolyline([
        [1850, 390], [2050, 350], [2250, 390]
      ], 'stem', { thickness: 50, isGroundMass: false });

      world.addPowerUp(2050, 270, 'strength');
      world.addProp('acorn', 2450, 470, 1.0);
      world.addAphid(2650, 475, 22, 2500, 2780);

      // CHECKPOINT 2
      world.addCheckpoint(2900, 490, 'Checkpoint 2');

      // SECTION 3 : Double Pont de Soie & Arrivée
      world.addPolyline([
        [2850, 500], [3150, 440], [3450, 520], [3800, 520], [4050, 430],
        [4300, 440], [5000, 440], [5000, 220]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Ponts suspendus de lianes & soie épais
      world.addPolyline([
        [3120, 435], [3420, 400], [3750, 435]
      ], 'silk', { thickness: 44, isGroundMass: false });

      world.addPolyline([
        [3760, 435], [4030, 400], [4280, 435]
      ], 'silk', { thickness: 44, isGroundMass: false });

      world.addPowerUp(3420, 320, 'feather');
      world.addProp('acorn', 3900, 480, 1.0);
      world.addAphid(4150, 405, 22, 4060, 4260);

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
    subtitle: 'Terrasses en bois massif, nénuphars flottants et grande liane de soie aérienne !',
    skyTop: '#e8f5e9',
    skyBottom: '#fff9c4',
    accentBg: '#1e4620',
    startX: 160,
    startY: 520,
    finishX: 4700,
    finishY: 400,
    coachHint: '💡 <strong>Facile — Le Verger Fleuri :</strong> Les marches en bois massif se montent marche après marche. Au niveau de la mare aux nénuphars, hissez-vous sur la grande liane de soie pour planer jusqu’à l’arrivée !',
    build(world) {
      // SECTION 1 : Marches de bois massif
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 540], [800, 540],
        [800, 470], [1150, 470], [1150, 400], [1550, 400], [1700, 480]
      ], 'root', { thickness: 38, isGroundMass: true });

      world.addProp('acorn', 450, 545, 1.0);
      world.addAphid(980, 445, 22, 850, 1100);
      world.addProp('acorn', 1350, 370, 1.0);

      // CHECKPOINT 1
      world.addCheckpoint(1600, 470, 'Checkpoint 1');

      // SECTION 2 : La Mare aux Nénuphars & Fil Céleste
      world.addPolyline([
        [1700, 480], [1820, 620], [2600, 620], [2720, 480], [3150, 480]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Nénuphars flottants épais (plateformes oscillantes douces)
      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 2020,
        pivotY: 570,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 22,
        damping: 3.2,
        thickness: 38
      });

      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 2380,
        pivotY: 570,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 22,
        damping: 3.2,
        thickness: 38
      });

      // Grande liane de soie suspendue au sommet (Raccourci aérien)
      world.addPolyline([
        [1680, 365], [2150, 305], [2680, 365]
      ], 'silk', { thickness: 46, isGroundMass: false });

      world.addPowerUp(2150, 225, 'feather');
      world.addProp('acorn', 2850, 450, 1.0);
      world.addAphid(3000, 455, 22, 2880, 3100);

      // CHECKPOINT 2
      world.addCheckpoint(3180, 470, 'Checkpoint 2');

      // SECTION 3 : Allée de Pommiers & Podium
      world.addPolyline([
        [3150, 480], [3450, 420], [3800, 490], [4150, 410], [4450, 420],
        [5100, 420], [5100, 200]
      ], 'dirt', { thickness: 36, isGroundMass: true });

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
    subtitle: 'Grosse branche de plafond pour varappe inversée, hérisson, fourmi et bûches mobiles !',
    skyTop: '#3a1c71',
    skyBottom: '#d76d77',
    accentBg: '#5f27cd',
    startX: 160,
    startY: 520,
    finishX: 4900,
    finishY: 440,
    coachHint: '💡 <strong>Moyen — La Grotte aux Spores :</strong> Agrippez-vous à la <strong>Grosse Branche du Plafond</strong> pour progresser la tête en bas et éviter le hérisson au sol !',
    build(world) {
      // SECTION 1 : Entrée de la Caverne & Premier Hérisson
      world.addPolyline([
        [-200, 300], [-200, 560], [300, 560], [600, 520], [900, 560],
        [1250, 560], [1450, 490], [1700, 490]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Grosse branche de plafond pour varappe inversée
      world.addPolyline([
        [200, 275], [600, 245], [1000, 265], [1400, 235], [1750, 275]
      ], 'root', { thickness: 54, isGroundMass: false });

      world.addProp('acorn', 450, 525, 1.0);
      world.addHedgehog(1050, 540, 28, 920, 1200);

      // CHECKPOINT 1
      world.addCheckpoint(1650, 480, 'Checkpoint 1');

      // SECTION 2 : Fosse de Ronces & Plateformes Mobiles Synchronisées
      world.addPolyline([
        [1700, 490], [1820, 640], [2550, 640], [2680, 480], [3150, 480]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Ronces au fond du gouffre
      world.addThorn(2000, 625, 28);
      world.addThorn(2200, 625, 28);
      world.addThorn(2400, 625, 28);

      // 2 Grosses bûches mobiles horizontales au-dessus des ronces
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 1980,
        pivotY: 480,
        moveX: 90,
        moveY: 0,
        moveSpeed: 1.1,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 22,
        damping: 3.0,
        thickness: 40
      });

      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 2380,
        pivotY: 480,
        moveX: -90,
        moveY: 0,
        moveSpeed: 1.1,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 22,
        damping: 3.0,
        thickness: 40
      });

      // Grande liane de plafond suspendue (shortcut continu)
      world.addPolyline([
        [1800, 265], [2150, 225], [2550, 265]
      ], 'silk', { thickness: 46, isGroundMass: false });

      world.addPowerUp(2150, 155, 'strength');
      world.addProp('acorn', 2850, 450, 1.0);
      world.addAphid(2980, 455, 22, 2850, 3100);

      // CHECKPOINT 2
      world.addCheckpoint(3200, 470, 'Checkpoint 2');

      // SECTION 3 : Sortie de Grotte & Champignons Éclatants
      world.addPolyline([
        [3150, 480], [3450, 420], [3750, 520], [4100, 520], [4400, 440],
        [4650, 440], [5300, 440], [5300, 200]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      world.addMushroom(3900, 485, 44, 410, 0.05);
      world.addAnt(3620, 490, 25, 3480, 3740);
      world.addHedgehog(4250, 500, 28, 4120, 4380);
      world.addProp('acorn', 4500, 410, 1.0);

      // Grosse branche de plafond final pour varappe inversée
      world.addPolyline([
        [3450, 235], [3950, 215], [4450, 245]
      ], 'root', { thickness: 56, isGroundMass: false });

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
    subtitle: 'L’épreuve phare : Canyon vertigineux, boost Poids-Plume 🪶, bassin flottant et slalom aérien !',
    skyTop: '#74ebd5',
    skyBottom: '#acb6e5',
    accentBg: '#0984e3',
    startX: 160,
    startY: 480,
    finishX: 5200,
    finishY: 440,
    coachHint: '💡 <strong>Moyen — Le Gouffre Poids-Plume :</strong> Prenez la <strong>Plume 🪶</strong> au bord de la falaise pour planer, ou plongez dans le <strong>Bassin d’Eau Flottante 💧</strong> au fond du canyon et rebondissez sur les champignons !',
    build(world) {
      // SECTION 1 : Rampe d'élan vers la falaise
      world.addPolyline([
        [-200, 260], [-200, 520], [200, 520], [500, 480], [800, 520],
        [1100, 460], [1400, 400], [1600, 360]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Grand toit de branches en forêt au-dessus du départ
      world.addPolyline([
        [250, 215], [750, 195], [1250, 175]
      ], 'root', { thickness: 56, isGroundMass: false });

      world.addProp('acorn', 650, 485, 1.0);
      world.addAphid(950, 495, 22, 850, 1050);
      world.addProp('acorn', 1300, 395, 1.0);

      // CHECKPOINT 1 (Juste avant le saut dans le vide !)
      world.addCheckpoint(1520, 350, 'Tremplin');

      // LE BOOST POIDS-PLUME SUR LE BORD DE LA FALAISE
      world.addPowerUp(1620, 310, 'feather');

      // SECTION 2 : LE GRAND GOUFFRE & BASSIN D'EAU FLOTTANTE EN CONTREBAS
      // Falaise de réception à l'autre bout du gouffre
      world.addPolyline([
        [3000, 380], [3300, 440], [3650, 440]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // GRAINES PIQUANTES AÉRIENNES EN PLEIN AIR (Slalom de vol)
      world.addThorn(1900, 350, 26);
      world.addThorn(2150, 280, 26);
      world.addThorn(2400, 380, 26);
      world.addThorn(2650, 310, 26);
      world.addThorn(2880, 360, 26);

      // FOND DU CANYON AVEC BASSIN D'EAU FLOTTANTE (Voie de secours aquatique !)
      world.addPolyline([
        [1600, 360], [1700, 680], [2900, 680], [3000, 380]
      ], 'dirt', { thickness: 36, isGroundMass: true });
      world.addWaterZone(1710, 560, 1180, 130);

      // Champignons tremplins pour remonter du fond
      world.addMushroom(1850, 645, 44, 440, 0.08);
      world.addMushroom(2300, 645, 44, 440, 0.08);
      world.addMushroom(2750, 645, 44, 460, 0.08);

      // Pont de lianes intermédiaire épais
      world.addPolyline([
        [2150, 480], [2550, 480]
      ], 'silk', { thickness: 48, isGroundMass: false });

      // CHECKPOINT 2
      world.addCheckpoint(3600, 430, 'Checkpoint 2');

      // SECTION 3 : Crêtes Rocheuses, Fourmi Guerrière & Balancier vers l'Arrivée
      world.addPolyline([
        [3650, 440], [3950, 380], [4250, 480], [4550, 480], [4800, 440],
        [5600, 440], [5600, 200]
      ], 'dirt', { thickness: 36, isGroundMass: true });

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
        thickness: 40
      });

      world.addAnt(3950, 350, 25, 3800, 4120);
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
    subtitle: 'Ascension verticale sur écorce, plafond forestier, fourmi sentinelle et balancier géant !',
    skyTop: '#2b5876',
    skyBottom: '#4e4376',
    accentBg: '#2d3436',
    startX: 160,
    startY: 560,
    finishX: 5100,
    finishY: 360,
    coachHint: '💡 <strong>Moyen — La Falaise des Cimes :</strong> Votre corps adhère naturellement aux parois ! Grimpez le long de la falaise d’écorce ou marchez à l’envers sous la grande branche surplombante.',
    build(world) {
      // SECTION 1 : L'Escalade de la Grande Falaise
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 580],
        [750, 380], [850, 240], [1200, 240], [1450, 360]
      ], 'root', { thickness: 40, isGroundMass: true });

      // Grande branche surplombante formant un toit au-dessus de la montée !
      world.addPolyline([
        [450, 315], [720, 115], [1250, 85]
      ], 'root', { thickness: 58, isGroundMass: false });

      world.addThorn(720, 450, 26);

      world.addProp('acorn', 400, 555, 1.0);
      world.addPowerUp(1000, 170, 'strength');
      world.addAphid(1050, 220, 22, 920, 1180);

      // CHECKPOINT 1
      world.addCheckpoint(1400, 340, 'Checkpoint 1');

      // SECTION 2 : Grand Balancier Pendulaire au-dessus du Vide
      world.addPolyline([
        [1450, 360], [1600, 580], [2500, 580], [2650, 360]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      world.addThorn(1900, 560, 30);
      world.addThorn(2200, 560, 30);

      // Grand balancier pendulaire en bois massif (ascenseur aérien)
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
        thickness: 42
      });

      // Liane haute épaisse en raccourci
      world.addPolyline([
        [1550, 195], [1850, 155], [2150, 195]
      ], 'silk', { thickness: 48, isGroundMass: false });

      world.addPowerUp(1850, 95, 'speed');
      world.addMushroom(2050, 545, 44, 420, 0.06);

      // CHECKPOINT 2
      world.addCheckpoint(2750, 350, 'Checkpoint 2');

      // SECTION 3 : Canopée des Cimes, Fourmi Guerrière & Hérisson Perché
      world.addPolyline([
        [2650, 360], [3000, 360], [3300, 440], [3650, 360], [4000, 360],
        [4300, 440], [4600, 360], [5500, 360], [5500, 160]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Toit de canopée forestière épais au-dessus de la ligne droite finale
      world.addPolyline([
        [2950, 175], [3500, 155], [4050, 175]
      ], 'root', { thickness: 56, isGroundMass: false });

      world.addHedgehog(3150, 340, 28, 3020, 3280);
      world.addMushroom(3480, 405, 42, 380, 0.05);
      world.addAnt(3820, 330, 25, 3680, 3980);
      world.addProp('pinecone', 4020, 320, 0.9);
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
    subtitle: 'Étagères de mousse glissantes, bûches en contre-phase, fourmis guerrières et pont de lianes !',
    skyTop: '#141e30',
    skyBottom: '#243b55',
    accentBg: '#6c5ce7',
    startX: 160,
    startY: 540,
    finishX: 5300,
    finishY: 380,
    coachHint: '💡 <strong>Difficile — Le Tronc des Titans :</strong> La <strong>Mousse</strong> glisse fort, mais la grosse branche d’écorce au plafond vous permet de progresser à l’envers en toute sécurité !',
    build(world) {
      // SECTION 1 : Étagères de mousse glissante & Plafond d'écorce
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 520], [800, 520]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      // Plateforme de mousse glissante
      world.addPolyline([
        [800, 520], [1050, 460], [1300, 460], [1500, 520]
      ], 'moss', { thickness: 36, isGroundMass: true });

      // Grosse branche de plafond au-dessus de la mousse glissante
      world.addPolyline([
        [750, 285], [1150, 265], [1500, 285]
      ], 'root', { thickness: 56, isGroundMass: false });

      world.addThorn(1050, 560, 30);
      world.addThorn(1250, 560, 30);

      world.addProp('acorn', 450, 550, 1.0);
      world.addAphid(650, 500, 22, 560, 760);

      // CHECKPOINT 1
      world.addCheckpoint(1600, 500, 'Checkpoint 1');

      // SECTION 2 : Double Bûche Oscillante en Contre-Phase
      world.addPolyline([
        [1500, 520], [1650, 660], [2750, 660], [2900, 480]
      ], 'dirt', { thickness: 36, isGroundMass: true });

      world.addThorn(1950, 640, 30);
      world.addThorn(2200, 640, 30);
      world.addThorn(2450, 640, 30);

      // Bûche 1 (épaisse et bien lisible)
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'root',
        pivotX: 1950,
        pivotY: 460,
        moveX: 100,
        moveY: 0,
        moveSpeed: 1.3,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 24,
        damping: 3.2,
        thickness: 42
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
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 24,
        damping: 3.2,
        thickness: 42
      });

      // Pont de lianes supérieur épais
      world.addPolyline([
        [1550, 235], [2150, 195], [2850, 235]
      ], 'silk', { thickness: 48, isGroundMass: false });

      world.addPowerUp(2150, 125, 'feather');
      world.addMushroom(2200, 625, 46, 440, 0.08);

      // CHECKPOINT 2
      world.addCheckpoint(3000, 460, 'Checkpoint 2');

      // SECTION 3 : Bûche Roulante, Fourmi Guerrière & Arrivée
      world.addPolyline([
        [2900, 480], [3250, 400], [3650, 480], [4000, 400], [4400, 440],
        [4750, 380], [5600, 380], [5600, 160]
      ], 'root', { thickness: 38, isGroundMass: true });

      world.addProp('pinecone', 3350, 350, 1.1);
      world.addHedgehog(3850, 455, 28, 3700, 3980);
      world.addAnt(4220, 410, 26, 4050, 4380);
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
    subtitle: 'Branches mielleuses d’alvéoles, mares de miel collantes, fourmis gardiennes et bascules d’ambre !',
    skyTop: '#ff9900',
    skyBottom: '#ffe259',
    accentBg: '#b86b11',
    startX: 160,
    startY: 520,
    finishX: 5500,
    finishY: 400,
    coachHint: '💡 <strong>Difficile — La Ruche & les Cires :</strong> Marchez au plafond sur les grosses branches mielleuses supérieures pour éviter les mares de miel et les fourmis au sol !',
    build(world) {
      // SECTION 1 : Entrée de la Ruche & Alvéoles Hexagonales
      world.addPolyline([
        [-200, 300], [-200, 560], [300, 560], [550, 500], [800, 560],
        [1100, 560], [1350, 480], [1650, 480]
      ], 'honeycomb', { thickness: 38, isGroundMass: true });

      // Grosse branche mielleuse au plafond
      world.addPolyline([
        [200, 255], [600, 215], [1000, 255], [1400, 215], [1700, 255]
      ], 'honeycomb', { thickness: 56, isGroundMass: false });

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
      ], 'honeycomb', { thickness: 38, isGroundMass: true });

      world.addStickyCrumb(2000, 625, 36, 'honey');
      world.addStickyCrumb(2300, 625, 36, 'honey');
      world.addStickyCrumb(2600, 625, 36, 'honey');
      world.addThorn(2150, 625, 26);
      world.addThorn(2450, 625, 26);

      // Plateformes bascules d'ambre épaisses
      world.addDynamicPlatform({
        type: 'leaf',
        material: 'honeycomb',
        pivotX: 2050,
        pivotY: 460,
        localPoints: [[-110, 0], [110, 0]],
        stiffness: 14,
        damping: 2.2,
        maxAngle: 0.55,
        thickness: 42
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
        thickness: 42
      });

      // Grande liane de soie supérieure
      world.addPolyline([
        [1650, 195], [2300, 155], [2950, 195]
      ], 'silk', { thickness: 48, isGroundMass: false });

      world.addPowerUp(2300, 85, 'speed');
      world.addMushroom(2300, 605, 46, 440, 0.08);

      // CHECKPOINT 2
      world.addCheckpoint(3050, 450, 'Checkpoint 2');

      // SECTION 3 : Labyrinthe d'Alvéoles, Fourmi & Ligne d'Arrivée
      world.addPolyline([
        [2950, 460], [3300, 400], [3650, 480], [4000, 400], [4400, 460],
        [4800, 400], [5800, 400], [5800, 160]
      ], 'honeycomb', { thickness: 38, isGroundMass: true });

      world.addStickyCrumb(3480, 420, 28, 'honey');
      world.addHedgehog(3850, 455, 28, 3700, 3980);
      world.addAnt(4220, 425, 26, 4040, 4380);
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
    subtitle: 'L’apothéose : Canettes métalliques glissantes, couteau à bascule, lac de confiture et pont céleste !',
    skyTop: '#232526',
    skyBottom: '#414345',
    accentBg: '#c0392b',
    startX: 160,
    startY: 540,
    finishX: 5800,
    finishY: 380,
    coachHint: '💡 <strong>Grand Finale — Le Festin des Tempêtes :</strong> La course reine ! Traversez les canettes glissantes, gardez l’équilibre sur le couteau à bascule, planez au-dessus du gouffre et grimpez jusqu’au pont de lianes supérieur ! 🏆',
    build(world) {
      // SECTION 1 : Table de pique-nique & Canettes métalliques
      world.addPolyline([
        [-200, 300], [-200, 580], [300, 580], [550, 520], [800, 520]
      ], 'plastic', { thickness: 36, isGroundMass: true });

      // Canette renversée très glissante
      world.addPolyline([
        [800, 520], [1050, 440], [1300, 440], [1500, 520]
      ], 'can', { thickness: 40, isGroundMass: true });

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
        thickness: 40
      });

      // CHECKPOINT 1
      world.addCheckpoint(1800, 460, 'Checkpoint 1');

      // SECTION 2 : Le Gouffre de Confiture Géant & Pont Céleste
      world.addPolyline([
        [1800, 480], [1950, 680], [3250, 680], [3400, 460]
      ], 'plastic', { thickness: 36, isGroundMass: true });

      // Mer de confiture gluante et pointes au fond
      world.addStickyCrumb(2200, 660, 36, 'jam');
      world.addStickyCrumb(2600, 660, 36, 'jam');
      world.addStickyCrumb(3000, 660, 36, 'jam');
      world.addThorn(2400, 660, 28);
      world.addThorn(2800, 660, 28);

      // Tremplin et plume au bord du gouffre
      world.addPowerUp(1880, 420, 'feather');

      // Grosses branches de bambou à mi-hauteur
      world.addPolyline([
        [2180, 480], [2520, 480]
      ], 'straw', { thickness: 50, isGroundMass: false });

      world.addPolyline([
        [2680, 480], [3020, 480]
      ], 'straw', { thickness: 50, isGroundMass: false });

      // Graines piquantes en suspension dans le gouffre
      world.addThorn(2350, 360, 26);
      world.addThorn(2850, 360, 26);

      // PONT DE LIANES CÉLESTE À 160PX D'ALTITUDE
      world.addPolyline([
        [1750, 170], [2550, 150], [3450, 170]
      ], 'silk', { thickness: 48, isGroundMass: false });

      world.addPowerUp(2550, 85, 'speed');
      world.addMushroom(2600, 645, 46, 450, 0.08);

      // CHECKPOINT 2
      world.addCheckpoint(3500, 440, 'Checkpoint 2');

      // SECTION 3 : La Grande Boucle du Panier & Arrivée Triomphale
      world.addPolyline([
        [3400, 460], [3750, 380], [4100, 480], [4450, 380], [4800, 460],
        [5150, 380], [6100, 380], [6100, 140]
      ], 'root', { thickness: 38, isGroundMass: true });

      world.addProp('pinecone', 3900, 340, 1.25);
      world.addHedgehog(4250, 455, 28, 4120, 4380);
      world.addAnt(4620, 420, 26, 4480, 4780);
      world.addHedgehog(4950, 435, 28, 4820, 5080);
      world.addPowerUp(4700, 340, 'strength');
      world.addAphid(5350, 355, 22, 5220, 5480);

      world.addDecoration('flower', 5550, 380, 1.3);
      world.addDecoration('fern', 5750, 380, 1.5);
    }
  },

  // ============================================================================
  // COUPE 4 : COUPE DE LA FOURMILIÈRE ROYALE (MAÎTRE)
  // Architecture Forestière Verticale : Toits d'arbres, Grands Troncs Creux à escalader,
  // Arbre Brisé Penché et Grand Plongeon dans un Bassin d'Eau Flottante !
  // ============================================================================
  {
    id: 9,
    cupId: 'coupe_fourmiliere',
    difficulty: 'Maître',
    name: 'Fourmilière 1 — L’Ascension du Grand Chêne Creux',
    subtitle: 'Départ au pied des racines (en bas à gauche), escalade d’un immense tronc creux peuplé d’ennemis et arrivée tout en haut dans la canopée !',
    theme: 'canopy',
    bgSet: 'ancient_forest',
    skyTop: '#1a2618',
    skyBottom: '#2d4c2b',
    startX: 160,
    startY: 750,
    finishX: 4320,
    finishY: 60,
    coachHint: '💡 <strong>L’Ascension du Grand Chêne Creux :</strong> Ce niveau commence tout en bas dans l’humus (Y=750) et se termine tout en haut de la canopée à droite (Y=60) ! Votre chenille adhère aux parois et aux plafonds : grimpez à l’intérieur du grand tronc creux en neutralisant les fourmis au centre !',
    build(world) {
      // Mur d'écorce arrière fermant le sous-bois à gauche
      world.addPolyline([[40, 220], [40, 820]], 'root', { thickness: 58 });

      // =========================================================================
      // ZONE 1 : LE SOUS-BOIS HUMIDE SOUS LA VOÛTE D'ARBRES (X=40 -> 1420, Y=780 -> 620)
      // Sol forestier bas avec un grand toit d'arbres surplombant (on peut marcher au sol OU au plafond !)
      // =========================================================================
      world.addPolyline([
        [40, 780], [420, 780], [780, 740], [1140, 720], [1460, 680]
      ], 'dirt', { thickness: 38, isGroundMass: true });

      // Grand toit d'arbre massif surplombant toute la Zone 1 (forme un vrai plafond de forêt à Y=440..480)
      world.addPolyline([
        [40, 455], [480, 435], [920, 445], [1340, 415]
      ], 'root', { thickness: 60, isGroundMass: false });

      // Abris d'écorce intermédiaires contre les gouttes de rosée (dégâts adoucis à 3 PV)
      world.addPolyline([[360, 615], [540, 610]], 'root', { thickness: 50 });
      world.addDecoration('bark_shelter', 450, 615, 1.3);
      world.addPolyline([[820, 585], [1000, 580]], 'root', { thickness: 50 });
      world.addDecoration('bark_shelter', 910, 585, 1.3);

      world.addWaterDropEmitter(640, 455, 760, 2.4, 0.0, 'water');
      world.addWaterDropEmitter(1120, 440, 730, 2.4, 1.2, 'water');

      world.addProp('acorn', 290, 745, 1.0);
      world.addAnt(680, 710, 25, 520, 860);
      world.addAphid(1080, 695, 22, 960, 1220);

      world.addDecoration('fern', 180, 780, 1.3);
      world.addDecoration('glowing_shroom', 560, 760, 1.3);
      world.addDecoration('hanging_vine', 320, 455, 1.3);
      world.addDecoration('hanging_vine', 760, 445, 1.35);

      // =========================================================================
      // ZONE 2 : LE GRAND TRONC CREUX VERTICAL À ESCALADER (X=1420 -> 2680, Y=680 -> Y=80)
      // Un tronc géant vertical avec paroi gauche, paroi droite, étages internes et ennemis au centre !
      // =========================================================================
      world.addCheckpoint(1360, 665, 'Pied du Chêne');

      // Base racinaire du Grand Chêne Creux (Y=680)
      world.addPolyline([
        [1460, 680], [2050, 680], [2620, 680], [2620, 950]
      ], 'root', { thickness: 42, isGroundMass: true });

      // PAROI GAUCHE DU GRAND TRONC (avec ouverture d'entrée en bas et sortie en haut à droite)
      world.addPolyline([
        [1420, 435], [1450, 180], [1520, -40], [2150, -60]
      ], 'root', { thickness: 64, isGroundMass: false });

      // PAROI DROITE DU GRAND TRONC (mur d'escalade vertical de Y=680 jusqu'à Y=195)
      world.addPolyline([
        [2580, 680], [2560, 420], [2540, 195]
      ], 'root', { thickness: 64, isGroundMass: false });

      // ÉTAGE 1 AU CŒUR DU TRONC (Y=510) — Grosse branche interne gardée par une Fourmi Guerrière
      world.addPolyline([
        [1640, 510], [2180, 510], [2380, 480]
      ], 'root', { thickness: 54, isGroundMass: false });
      world.addMushroom(1540, 665, 44, 430, 0.08);
      world.addAnt(1920, 472, 26, 1680, 2150);
      world.addProp('acorn', 2260, 455, 1.0);
      world.addDecoration('bracket_fungus', 1450, 380, 1.3);

      // ÉTAGE 2 AU CŒUR DU TRONC (Y=330) — Branche mielleuse gardée par un Hérisson et une Fourmi + Pomme Verte
      world.addPolyline([
        [1560, 330], [1880, 330], [2280, 330]
      ], 'honeycomb', { thickness: 54, isGroundMass: false });
      world.addMushroom(2460, 495, 44, 440, -0.10);
      world.addHedgehog(1740, 294, 28, 1600, 1880);
      world.addAnt(2100, 292, 26, 1940, 2240);
      world.addBonusApple(1920, 255, 'segment'); // Récompense au cœur du Grand Tronc !
      world.addPowerUp(1620, 255, 'strength');

      // ÉTAGE 3 SOMMET DU TRONC CREUX (Y=150) — Pont de lianes tressées vers la sortie haute du tronc
      world.addPolyline([
        [1680, 150], [2120, 140], [2540, 160]
      ], 'silk', { thickness: 48, isGroundMass: false });
      world.addMushroom(1560, 305, 44, 440, 0.10);
      world.addAphid(2020, 108, 22, 1820, 2220);
      world.addBonusApple(2320, 95, 'heal');

      // =========================================================================
      // ZONE 3 : LA HAUTE CANOPÉE ROYALE & CHRYSALIDE AU SOMMET (X=2540 -> 4480, Y=160 -> Y=60)
      // =========================================================================
      world.addPolyline([
        [2540, 160], [2960, 160]
      ], 'root', { thickness: 56, isGroundMass: false });
      world.addCheckpoint(2680, 138, 'Cime du Chêne');
      world.addPowerUp(2860, 95, 'speed');

      // Grand toit de feuillage supérieur couvrant toute la haute canopée (Y=-90)
      world.addPolyline([
        [2520, -85], [3150, -105], [3780, -105], [4000, -95]
      ], 'root', { thickness: 60, isGroundMass: false });

      // Tourniquet de Brindilles géant entre deux branches maîtresses de la canopée
      world.addDynamicPlatform({
        type: 'turnstile',
        pivotX: 3200,
        pivotY: 120,
        localPoints: [[-145, 0], [145, 0], [0, 0], [0, -145], [0, 145]],
        material: 'root',
        thickness: 40,
        spinSpeed: 1.15
      });

      // Branche de réception sous le tourniquet (filet de sécurité à Y=310)
      world.addPolyline([
        [2920, 310], [3480, 310], [3680, 140]
      ], 'silk', { thickness: 48, isGroundMass: false });
      world.addMushroom(3420, 288, 44, 430, -0.08);

      // Dernière montée vers le Sanctuaire de la Cime (Y=120 -> Y=60)
      world.addPolyline([
        [3460, 120], [3850, 60], [4520, 60], [4520, -120]
      ], 'root', { thickness: 42, isGroundMass: true });

      world.addAnt(3980, 30, 26, 3860, 4160);
      world.addProp('acorn', 3760, 45, 1.0);

      world.addDecoration('ant_arch', 3880, 60, 1.35);
      world.addDecoration('golden_chrysalis', 4260, 60, 1.45);
      world.addDecoration('amber_crystal', 4150, 60, 1.3);
      world.addDecoration('fern', 4380, 60, 1.4);
    }
  },
  {
    id: 10,
    cupId: 'coupe_fourmiliere',
    difficulty: 'Maître',
    name: 'Fourmilière 2 — L’Arbre Brisé Penché & Le Grand Plongeon',
    subtitle: 'Grimpe le long d’un géant arbre cassé penché jusqu’à la cime, puis saute dans le vide en évitant les pièges pour amerrir dans l’eau flottante !',
    theme: 'marsh',
    bgSet: 'ancient_forest',
    skyTop: '#142218',
    skyBottom: '#1e5f55',
    startX: 150,
    startY: 760,
    finishX: 4320,
    finishY: 420,
    coachHint: '💡 <strong>L’Arbre Brisé Penché & Le Grand Plongeon :</strong> Escaladez l’immense tronc penché jusqu’à sa cime brisée (Y=-40), puis élancez-vous dans le vide en esquivant les ronces aériennes pour plonger dans le <strong>Grand Bassin d’Eau Flottante 💧</strong> en bas avant de rejoindre la sortie !',
    build(world) {
      // Mur arrière au pied de la forêt
      world.addPolyline([[40, 380], [40, 840]], 'root', { thickness: 58 });

      // =========================================================================
      // ZONE 1 : LE PIED DE L'ARBRE GÉANT PENCHÉ (X=40 -> 680, Y=780)
      // =========================================================================
      world.addPolyline([
        [40, 780], [380, 780], [640, 720]
      ], 'dirt', { thickness: 38, isGroundMass: true });

      // Toit forestier bas massif au départ
      world.addPolyline([
        [40, 475], [360, 455], [620, 395]
      ], 'root', { thickness: 58, isGroundMass: false });

      world.addProp('acorn', 280, 745, 1.0);
      world.addAphid(480, 710, 22, 360, 600);
      world.addDecoration('fern', 160, 780, 1.3);
      world.addDecoration('glowing_shroom', 340, 780, 1.3);

      // =========================================================================
      // ZONE 2 : L'ASCENSION DU GRAND ARBRE CASSÉ PENCHÉ (X=640 -> 2240, Y=720 -> Y=-40)
      // Un tronc géant incliné à ~30° avec écorce inférieure ET voûte d'écorce supérieure :
      // on grimpe à l'intérieur du tronc penché avec des fourmis et hérissons au centre !
      // =========================================================================
      world.addCheckpoint(580, 705, 'Racines Penchées');

      // Paroi inférieure du Grand Arbre Penché (monte de Y=720 jusqu'à la cassure à Y=-40 !)
      world.addPolyline([
        [640, 720], [1040, 540], [1440, 350], [1840, 150], [2180, -40], [2260, -40]
      ], 'root', { thickness: 62, isGroundMass: false });

      // Voûte supérieure (Toit du Grand Arbre Penché : permet aussi de grimper au plafond à l'envers !)
      world.addPolyline([
        [620, 395], [1020, 215], [1420, 25], [1820, -165], [2180, -295]
      ], 'root', { thickness: 62, isGroundMass: false });

      // Paliers internes & Ennemis logés au centre du tronc penché
      // Palier 1 (X=860..1160, Y=410) — Branche mielleuse
      world.addPolyline([[860, 410], [1160, 410]], 'honeycomb', { thickness: 52, isGroundMass: false });
      world.addAnt(1010, 372, 25, 880, 1140);
      world.addProp('acorn', 920, 560, 1.0);

      // Palier 2 (X=1280..1620, Y=210) + Cascade de Sève traversant le tronc
      world.addSapCascade(1320, 40, 420, 68, 165);
      world.addPolyline([[1360, 210], [1680, 210]], 'root', { thickness: 52, isGroundMass: false });
      world.addHedgehog(1520, 174, 28, 1380, 1650);
      world.addBonusApple(1520, 115, 'segment'); // Pomme Verte (+1 Segment) au cœur de l'Arbre Penché !

      // Palier 3 (X=1740..2080, Y=10) — Dernière garde avant la cime brisée
      world.addPolyline([[1740, 10], [2060, 10]], 'silk', { thickness: 48, isGroundMass: false });
      world.addAnt(1900, -26, 26, 1760, 2040);
      world.addBonusApple(2020, -55, 'heal');

      // =========================================================================
      // ZONE 3 : LA CIME BRISÉE & LE GRAND PLONGEON DANS L'EAU FLOTTANTE (X=2180 -> 3420)
      // Depuis Y=-40, le joueur saute dans le vide, évite les obstacles aériens et amerrit à Y=720 !
      // =========================================================================
      world.addCheckpoint(2180, -65, 'Cime Brisée');
      world.addPowerUp(2250, -105, 'feather'); // Optionnel pour contrôler la descente

      // Toit de la forêt très haut au-dessus du gouffre de plongeon
      world.addPolyline([
        [2220, -295], [2850, -295], [3450, -245]
      ], 'root', { thickness: 60, isGroundMass: false });

      // Obstacles aériens à esquiver pendant la grande chute vers le bassin !
      world.addThorn(2460, 120, 28);
      world.addThorn(2680, 260, 28);
      world.addThorn(2480, 420, 28);
      world.addThorn(2820, 480, 28);

      // Tourniquet de brindilles au milieu de la chute pour rebondir ou esquiver
      world.addDynamicPlatform({
        type: 'turnstile',
        pivotX: 2660,
        pivotY: 80,
        localPoints: [[-130, 0], [130, 0], [0, 0], [0, -130], [0, 130]],
        material: 'root',
        thickness: 40,
        spinSpeed: 1.10
      });

      // Cuvette rocheuse et racinaire du Grand Bassin Forestier en bas (Y=720..920)
      world.addPolyline([
        [1850, 740], [2280, 720], [2360, 910], [3320, 910], [3420, 700]
      ], 'dirt', { thickness: 40, isGroundMass: true });

      // LE GRAND BASSIN D'EAU À HAUTE FLOTTABILITÉ (X=2300..3400, surface à Y=715)
      world.addWaterZone(2300, 715, 1100, 205);

      // Nénuphars flottants épais à la surface du bassin pour aider à traverser ou sauter
      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 2620,
        pivotY: 710,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 22,
        damping: 3.0,
        thickness: 38
      });
      world.addDynamicPlatform({
        type: 'lilypad',
        material: 'leaf',
        pivotX: 3060,
        pivotY: 710,
        localPoints: [[-95, 0], [95, 0]],
        stiffness: 22,
        damping: 3.0,
        thickness: 38
      });

      world.addBonusApple(2840, 665, 'heal'); // Pomme de soin flottant juste au-dessus de l'eau !

      // =========================================================================
      // ZONE 4 : LA BERGE DE SORTIE & LE SANCTUAIRE ROYAL (X=3420 -> 4520, Y=700 -> Y=420)
      // =========================================================================
      world.addPolyline([
        [3420, 700], [3680, 580], [3960, 420], [4560, 420], [4560, 180]
      ], 'root', { thickness: 40, isGroundMass: true });
      world.addCheckpoint(3520, 635, 'Berge du Lac');

      // Champignon sur la berge pour bondir hors de l'eau si besoin
      world.addMushroom(3450, 685, 46, 440, 0.12);

      // Toit du Sanctuaire Creux Final
      world.addPolyline([
        [3650, 315], [4020, 205], [4240, 205]
      ], 'root', { thickness: 58, isGroundMass: false });

      world.addAnt(4120, 390, 26, 3980, 4250);
      world.addProp('acorn', 3820, 480, 1.0);

      world.addDecoration('ant_arch', 3980, 420, 1.35);
      world.addDecoration('golden_chrysalis', 4280, 420, 1.45);
      world.addDecoration('glowing_shroom', 4400, 420, 1.35);
    }
  },
  {
    id: 11,
    cupId: 'coupe_fourmiliere',
    difficulty: 'Maître',
    name: 'Fourmilière 3 — La Citadelle des Racines & Le Lagon Englouti',
    subtitle: 'Esquive l’Effroyeur sous les toits d’écorce, traverse le Donjon du Tronc Creux, dévale le Toboggan de Sève dans le Lagon et grimpe vers la Couronne !',
    theme: 'picnic_chaos',
    bgSet: 'ancient_forest',
    skyTop: '#24080b',
    skyBottom: '#d35400',
    startX: 160,
    startY: 520,
    finishX: 4540,
    finishY: 120,
    coachHint: '💡 <strong>Finale Maître — La Citadelle & Le Lagon :</strong> Les braises et gouttes font peu de dégâts, mais utilisez les toits d’arbres pour grimper à l’abri ! Traversez le tronc-forteresse central, plongez dans le lagon au bout du toboggan de sève et escaladez la tour finale ! 🏆',
    build(world) {
      // Mur arrière
      world.addPolyline([[40, 180], [40, 680]], 'root', { thickness: 58 });

      // =========================================================================
      // ZONE 1 : L'ÉVEIL DE L'EFFROYEUR & LA GALERIE COUVERTE (X=40 -> 1180, Y=540)
      // =========================================================================
      world.addDecoration('effroyeur_boss', 120, 320, 1.45);

      world.addPolyline([
        [40, 540], [420, 540], [820, 580], [1180, 540]
      ], 'root', { thickness: 38, isGroundMass: true });

      // Grand toit d'arbre protecteur au-dessus de la Zone 1 avec ouvertures
      world.addPolyline([[320, 315], [640, 305]], 'root', { thickness: 56, isGroundMass: false });
      world.addDecoration('bark_shelter', 480, 315, 1.35);
      world.addPolyline([[860, 315], [1140, 305]], 'root', { thickness: 56, isGroundMass: false });
      world.addDecoration('bark_shelter', 1000, 315, 1.35);

      // Braises tombant dans les trouées du feuillage (dégâts adoucis à 8 PV)
      world.addWaterDropEmitter(260, 120, 620, 2.2, 0.2, 'ember');
      world.addWaterDropEmitter(750, 120, 620, 2.2, 1.1, 'ember');

      world.addAnt(620, 520, 25, 450, 780);
      world.addProp('acorn', 980, 520, 1.0);

      // =========================================================================
      // ZONE 2 : LE DONJON DU TRONC CREUX CENTRAL (X=1180 -> 2120, Y=540 -> Y=160)
      // Un énorme tronc-citadelle à deux niveaux avec ennemis au centre et toit forestier
      // =========================================================================
      world.addCheckpoint(1140, 525, 'Porte du Donjon');

      // Plancher bas du Donjon (Y=580)
      world.addPolyline([
        [1180, 540], [1420, 580], [1920, 580], [2120, 420]
      ], 'root', { thickness: 40, isGroundMass: true });

      // Cœur médian du Tronc (Y=360) — Grosse branche mielleuse : on peut passer dessous, dessus, ou marcher sous son plafond !
      world.addPolyline([
        [1320, 360], [1660, 360], [1980, 360]
      ], 'honeycomb', { thickness: 56, isGroundMass: false });

      // Toit supérieur du Tronc Creux (Y=135)
      world.addPolyline([
        [1220, 135], [1660, 115], [2100, 145]
      ], 'root', { thickness: 60, isGroundMass: false });

      // Ennemis logés au centre du Tronc Creux + Pomme Verte (+1 Segment)
      world.addAnt(1520, 550, 26, 1360, 1680);
      world.addHedgehog(1800, 552, 28, 1680, 1920);
      world.addAnt(1660, 322, 26, 1420, 1900);
      world.addBonusApple(1660, 270, 'segment');
      world.addPowerUp(1380, 285, 'strength');
      world.addMushroom(1240, 525, 44, 430, 0.08);

      // =========================================================================
      // ZONE 3 : LE TOBOGGAN DE SÈVE & LE LAGON FLOTTANT (X=2120 -> 3460)
      // Descente rapide qui plonge directement dans un lagon d'eau flottante sous une voûte de forêt !
      // =========================================================================
      world.addCheckpoint(2080, 405, 'Le Toboggan');
      world.addPowerUp(2150, 350, 'speed');

      // Voûte de branches au-dessus du toboggan et du lagon
      world.addPolyline([
        [2140, 155], [2680, 215], [3320, 175]
      ], 'root', { thickness: 58, isGroundMass: false });

      // Grande descente de mousse vers le Lagon (Y=420 -> Y=720)
      world.addPolyline([
        [2120, 420], [2380, 560], [2580, 720], [2640, 880], [3380, 880], [3460, 660]
      ], 'moss', { thickness: 38, isGroundMass: true });

      world.addSapCascade(2440, 220, 620, 68, 175);

      // LE LAGON D'EAU FLOTTANTE AU BAS DU TOBOGGAN (X=2580..3440, surface à Y=685)
      world.addWaterZone(2580, 685, 860, 200);

      // Pont de lianes tressées suspendu au-dessus du lagon (route aérienne alternative)
      world.addPolyline([
        [2620, 440], [3020, 420], [3400, 440]
      ], 'silk', { thickness: 48, isGroundMass: false });
      world.addBonusApple(3020, 365, 'heal');

      // =========================================================================
      // ZONE 4 : L'ASCENSION DE LA COURONNE ROYALE (X=3460 -> 4720, Y=660 -> Y=120)
      // Escalade finale d'un grand arbre vertical jusqu'à la Chrysalide Dorée à Y=120 !
      // =========================================================================
      world.addPolyline([
        [3460, 660], [3780, 560], [4040, 380], [4280, 120], [4750, 120], [4750, -110]
      ], 'honeycomb', { thickness: 40, isGroundMass: true });
      world.addCheckpoint(3540, 625, 'Pied de la Couronne');

      // Champignon sur la rive droite du lagon + Tourniquet d'ascension
      world.addMushroom(3500, 645, 46, 450, 0.12);

      world.addDynamicPlatform({
        type: 'turnstile',
        pivotX: 3860,
        pivotY: 340,
        localPoints: [[-140, 0], [140, 0], [0, 0], [0, -140], [0, 140]],
        material: 'root',
        thickness: 40,
        spinSpeed: -1.20
      });

      // Grand toit protecteur de la Couronne Royale tout en haut (Y=-90)
      world.addPolyline([
        [3680, 75], [4120, -85], [4380, -85]
      ], 'root', { thickness: 60, isGroundMass: false });

      // Ultime Garde Royale devant la Chrysalide Dorée
      world.addAnt(4400, 90, 27, 4290, 4510);
      world.addProp('acorn', 4220, 105, 1.0);

      world.addDecoration('ant_arch', 4300, 120, 1.4);
      world.addDecoration('golden_chrysalis', 4500, 120, 1.5);
      world.addDecoration('amber_crystal', 4420, 120, 1.35);
      world.addDecoration('flower', 4640, 120, 1.4);
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

    // Preload single pre-composited backgrounds for ultra-fast Eco Mode (1 single drawImage call, saving 90% GPU fillrate!)
    this.parallaxComposites = {};
    const compositeFiles = {
      game_background_1: 'game_background_1/game_background_1.png',
      game_background_2: 'game_background_2/game_background_2.png',
      game_background_3: 'game_background_3/game_background_3.1.png',
      game_background_4: 'game_background_4/game_background_4.png',
      ancient_forest: 'ancient_forest_1920x1080.jpg'
    };
    for (const [packName, file] of Object.entries(compositeFiles)) {
      const img = new Image();
      img.src = `${basePath}${file}`;
      const item = { img, loaded: false };
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
    const bgMode = (typeof GAMEPLAY_CONFIG !== 'undefined' && GAMEPLAY_CONFIG.backgroundMode) ? GAMEPLAY_CONFIG.backgroundMode : 'parallax';

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
    // 0. Draw Buoyant Water Zones (Forest Ponds & Deep Pools) behind terrain edges
    if (world.waterZones && world.waterZones.length > 0) {
      this.drawWaterZones(ctx, world, time);
    }

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
    const pts = chain.points;
    if (pts.length < 2) return;
    // Drawn width (thick + the ~12-14 px outline every material adds) must match the
    // collision thickness, otherwise caterpillars look sunk into the wood.
    const thick = Math.max(16, (chain.thickness || 50) - 12);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (chain.material === 'root') {
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
    } else if (chain.material === 'stem') {
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
    } else if (chain.material === 'silk') {
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
    } else if (chain.material === 'honeycomb') {
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
    } else if (chain.material === 'moss') {
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
    } else if (chain.material === 'mushroom_cap') {
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
    } else if (chain.material === 'reed') {
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
    } else if (chain.material === 'straw') {
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
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
    } else if (chain.material === 'plastic') {
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
    } else if (chain.material === 'fork') {
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
