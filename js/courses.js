// js/courses.js — Cup races. A cup is 3 races played in a row (catch-up bonuses between
// races, a cosmetic for the cup winner), so each race is a standalone ~60-90 s course,
// not a step in a progression. Each cup has its own world and its own gameplay identity.
//
// Surfaces only have 3 physical behaviours ('normal' | 'slippery' | 'sticky', see
// MATERIALS in physics.js). Everything else is look: every cup dresses them its own way,
// but slippery always reads wet and sticky always reads as honey.

// Visual worlds. palette drives the ground mass, branchLook the floating platforms.
export const THEMES = {
  potager: {
    bgSet: 'game_background_2', theme: 'garden', branchLook: 'stem',
    skyTop: '#ffefc2', skyBottom: '#b8f59e', accentBg: '#2d5a27',
    palette: { earth: ['#8c5828', '#6e421c', '#47290f'], crust: '#4ec932', rim: '#8cf562', blade: '#2d8a18', grass: 'grass' }
  },
  sousbois: {
    bgSet: 'ancient_forest', theme: 'canopy', branchLook: 'root',
    skyTop: '#1e3d24', skyBottom: '#4c7a3d', accentBg: '#1e3d24',
    palette: { earth: ['#5b3a1e', '#3f2712', '#24160a'], crust: '#3f9b3a', rim: '#7ed36b', blade: '#25601f', grass: 'grass' }
  },
  ruche: {
    bgSet: 'hive_amber', theme: 'hive', branchLook: 'waxbeam',
    skyTop: '#ffd27a', skyBottom: '#f39c12', accentBg: '#7a4c12',
    palette: { earth: ['#c58a2e', '#9a6418', '#5a360a'], crust: '#e9c46a', rim: '#fff1b8', grass: 'none' }
  },
  rosee: {
    bgSet: 'game_background_3', theme: 'night', branchLook: 'stone',
    skyTop: '#1b2340', skyBottom: '#3b4a6b', accentBg: '#151b2c',
    palette: { earth: ['#3b4a6b', '#28324d', '#151b2c'], crust: '#5a9a3a', rim: '#a4d97a', blade: '#3f7a2a', grass: 'clover' }
  },
  initiation: {
    bgSet: 'game_background_1', theme: 'forest', branchLook: 'root',
    skyTop: '#ffefc2', skyBottom: '#b8f59e', accentBg: '#2d5a27',
    palette: { earth: ['#8c5828', '#6e421c', '#47290f'], crust: '#4ec932', rim: '#8cf562', blade: '#2d8a18', grass: 'grass' }
  }
};

// Small level-building kit: keeps every race on the same standard dimensions
function kit(world, T) {
  return {
    // Solid ground (filled down to the bottom of the world)
    ground(points, material = 'normal') {
      world.addPolyline(points, material, { thickness: 36, isGroundMass: true });
    },
    // Floating two-sided platform / branch / wall
    plat(points, material = 'normal', { thick = 42, look, hanging } = {}) {
      const defaultLook = material === 'sticky' ? 'honeycomb' : T.branchLook;
      world.addPolyline(points, material, {
        thickness: thick, isGroundMass: false, look: look || defaultLook, subtype: hanging ? 'hanging' : undefined
      });
    },
    // Leaf on a pivot: tilts under the caterpillar's weight
    leaf(x, y, halfWidth = 110, drift = 0) {
      world.addDynamicPlatform({
        type: 'leaf', material: 'leaf', pivotX: x, pivotY: y,
        moveX: drift, moveY: 0, moveSpeed: 0.8,
        localPoints: [[-halfWidth, 0], [-halfWidth * 0.3, -5], [halfWidth * 0.3, -5], [halfWidth, 0]],
        baseAngle: 0, stiffness: 20, damping: 3.0, thickness: 36
      });
    },
    // Bounce mushroom standing on ground at groundY
    mush(x, groundY, power = 440) {
      world.addMushroom(x, groundY - 36, 40, power, 0);
    },
    cp(x, groundY, label) {
      world.addCheckpoint(x, groundY - 20, label);
    },
    deco(type, x, y, scale = 1) {
      world.addDecoration(type, x, y, scale);
    },
    sign(x, y, text) {
      world.addDecoration('sign', x, y, 1, 0, text);
    }
  };
}

// Backdrop props of each world, planted on the ground behind the track (no physics)
const SCENERY = {
  potager: ['bg_lettuce', 'bg_tomato_plant', 'bg_carrot', 'bg_lettuce', 'bg_tomato_plant'],
  sousbois: ['bg_trunk', 'bg_big_fern', 'bg_glow_cluster', 'bg_big_fern'],
  ruche: ['bg_comb', 'bg_comb', 'bg_bee', 'bg_comb'],
  rosee: ['bg_night_flower', 'bg_fireflies', 'bg_cairn', 'bg_night_flower', 'bg_fireflies'],
  initiation: ['bg_big_fern', 'bg_lettuce', 'bg_trunk']
};

// Ground height (top-most ground mass surface) at x, or null over a gap
function groundYAt(world, x) {
  let best = null;
  for (const chain of world.terrainChains) {
    if (!chain.isGroundMass) continue;
    const pts = chain.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      if (Math.abs(x2 - x1) < 1 || x < Math.min(x1, x2) || x > Math.max(x1, x2)) continue;
      const y = y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
      if (best === null || y < best) best = y;
    }
  }
  return best;
}

function plantScenery(world, worldName, endX, seed) {
  const kinds = SCENERY[worldName] || [];
  let a = seed * 9301 + 49297;
  const rand = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  for (let x = 120 + rand() * 120; x < endX + 300; x += 170 + rand() * 190) {
    const y = groundYAt(world, x);
    if (y === null) continue;
    const type = kinds[Math.floor(rand() * kinds.length)];
    world.addDecoration(type, x, y + 14, 0.8 + rand() * 0.5);
  }
}

function course(def) {
  const T = THEMES[def.world];
  return {
    theme: T.theme, bgSet: T.bgSet, skyTop: T.skyTop, skyBottom: T.skyBottom, accentBg: T.accentBg, palette: T.palette,
    startX: 160,
    ...def,
    build(world) {
      def.layout(kit(world, T), world);
      plantScenery(world, def.world, def.finishX, def.id + 1);
    }
  };
}

export const LEVEL_DEFINITIONS = [
  // ===========================================================================
  // 🥬 COUPE DU POTAGER — jardin en plein jour.
  // Identité : feuilles mouillées qui servent de toboggans, feuilles qui basculent,
  // tiges de tomates en escalier.
  // ===========================================================================
  course({
    id: 0, cupId: 'coupe_potager', world: 'potager',
    name: 'Potager 1 — Les Rangs de Laitues',
    subtitle: 'Sillons de terre et grandes feuilles de laitue mouillées : on glisse vite en descente !',
    startY: 500, finishX: 3450, finishY: 520,
    coachHint: '💡 <strong>Les Rangs de Laitues :</strong> les feuilles <strong>mouillées</strong> (reflets bleus) font glisser : parfait en descente, piégeux en montée.',
    layout(k, world) {
      k.ground([[-200, 260], [-200, 540], [450, 540], [600, 500], [750, 540], [900, 500], [1050, 540], [1180, 480]]);
      k.ground([[1180, 480], [1550, 610]], 'slippery');
      k.ground([[1550, 610], [1700, 610], [1880, 520], [2080, 520]]);
      k.deco('clover_patch', 300, 540); k.deco('flower', 820, 520, 1.1); k.deco('tomato', 1010, 530, 0.9);
      world.addAphid(950, 495, 22, 880, 1040);
      k.cp(1950, 520, 'Checkpoint 1');

      // Lettuce pit: tilting leaves over it, mushroom to climb back out
      k.ground([[2080, 520], [2160, 680], [2520, 680], [2600, 520], [2700, 520]]);
      k.leaf(2230, 480, 100);
      k.leaf(2450, 480, 100);
      k.mush(2340, 680, 470);
      world.addProp('acorn', 2650, 490, 1.0);
      k.cp(2740, 520, 'Checkpoint 2');

      // Final stretch: a wet leaf slide down to the finish, stem shortcut above
      k.ground([[2700, 520], [2900, 470], [3000, 470]]);
      k.ground([[3000, 470], [3250, 540]], 'slippery');
      k.ground([[3250, 540], [3700, 540], [3700, 200]]);
      k.plat([[2950, 390], [3150, 400]]);
      world.addBonusApple(3060, 350, 'segment');
      k.deco('tomato', 3350, 540, 1.1); k.deco('flower', 3550, 540, 1.2);
    }
  }),
  course({
    id: 1, cupId: 'coupe_potager', world: 'potager',
    name: 'Potager 2 — La Tonnelle aux Tomates',
    subtitle: 'Un escalier de tiges de tomates, puis des feuilles basculantes au-dessus du compost.',
    startY: 500, finishX: 3500, finishY: 470,
    coachHint: '💡 <strong>La Tonnelle aux Tomates :</strong> grimpez l’escalier de tiges, ou restez en bas… mais le chemin du bas est plus long.',
    layout(k, world) {
      k.ground([[-200, 260], [-200, 540], [700, 540], [760, 480], [1000, 480], [1300, 560], [1600, 560], [1700, 470], [1900, 470]]);
      // Stem staircase (faster high route)
      k.plat([[820, 420], [960, 410]]);
      k.plat([[1040, 360], [1180, 350]]);
      k.plat([[1260, 330], [1480, 340], [1640, 410]]);
      world.addBonusApple(1350, 290, 'segment');
      k.deco('tomato', 500, 540, 1.2); k.deco('fern', 1450, 560, 1.1);
      world.addAphid(1450, 535, 22, 1340, 1580);
      k.cp(1850, 470, 'Checkpoint 1');

      // Compost pit with tilting leaves
      k.ground([[1900, 470], [1980, 680], [2560, 680], [2640, 470], [2800, 470]]);
      k.leaf(2080, 440, 95);
      k.leaf(2300, 430, 95, 30);
      k.leaf(2520, 440, 95);
      k.mush(2200, 680, 480);
      k.mush(2440, 680, 480);
      k.cp(2760, 470, 'Checkpoint 2');

      // Wet leaf hill: climb the stems, slide down the other side
      k.ground([[2800, 470], [3000, 470], [3080, 430], [3160, 430]]);
      k.ground([[3160, 430], [3380, 500]], 'slippery');
      k.ground([[3380, 500], [3700, 500], [3700, 200]]);
      world.addHedgehog(3530, 470, 26, 3450, 3640);
      k.deco('flower', 3600, 500, 1.2); k.deco('clover_patch', 2900, 470);
    }
  }),
  course({
    id: 2, cupId: 'coupe_potager', world: 'potager',
    name: 'Potager 3 — Le Carré de Fraises',
    subtitle: 'De la confiture renversée : le sol collant ralentit, mais il permet d’escalader les parois.',
    startY: 500, finishX: 3500, finishY: 480,
    coachHint: '💡 <strong>Le Carré de Fraises :</strong> le sol <strong>collant</strong> (coulures dorées) ralentit la reptation… mais on peut y grimper les murs et rester accroché.',
    layout(k, world) {
      k.ground([[-200, 260], [-200, 540], [600, 540]]);
      k.ground([[600, 540], [1000, 540]], 'sticky');
      k.ground([[1000, 540], [1200, 540]]);
      // Faster stem route above the jam
      k.plat([[620, 450], [980, 450]]);
      k.deco('flower', 300, 540, 1.1); k.deco('tomato', 1100, 540, 1.0);

      // A sticky jam wall to climb (or a mushroom to bounce)
      k.ground([[1200, 540], [1200, 420]], 'sticky');
      k.ground([[1200, 420], [1600, 420]]);
      k.mush(1140, 540, 520);
      k.cp(1500, 420, 'Checkpoint 1');

      k.ground([[1600, 420], [1900, 520]], 'slippery');
      k.ground([[1900, 520], [2000, 520], [2060, 650], [2340, 650], [2400, 520], [2500, 520]]);
      k.plat([[2050, 470], [2350, 470]], 'sticky');
      k.mush(2200, 650, 460);
      world.addAphid(2440, 495, 22, 2410, 2490);
      k.cp(2560, 520, 'Checkpoint 2');

      k.ground([[2500, 520], [2800, 520], [2800, 400]], 'normal');
      k.ground([[2800, 400], [2830, 400]]);
      k.ground([[2830, 400], [3100, 480]], 'slippery');
      k.ground([[3100, 480], [3700, 480], [3700, 200]]);
      k.mush(2740, 520, 520);
      world.addProp('acorn', 3300, 450, 1.0);
      k.deco('flower', 3400, 480, 1.2); k.deco('tomato', 3600, 480, 1.1);
    }
  }),

  // ===========================================================================
  // 🌳 COUPE DU SOUS-BOIS — forêt profonde.
  // Identité : réseaux de branches à passer dessus ou dessous, bûches moussues
  // glissantes, deux étages de parcours.
  // ===========================================================================
  course({
    id: 3, cupId: 'coupe_sousbois', world: 'sousbois',
    name: 'Sous-Bois 1 — Les Racines Mêlées',
    subtitle: 'Des racines en arches au-dessus du chemin : par-dessus, par-dessous, à vous de choisir.',
    startY: 500, finishX: 3500, finishY: 520,
    coachHint: '💡 <strong>Les Racines Mêlées :</strong> les bûches <strong>moussues</strong> glissent. Passez par-dessus les racines… ou faufilez-vous dessous.',
    layout(k, world) {
      // Mossy logs are humps of the ground itself: no thin gap to wedge a body into
      k.ground([[-200, 200], [-200, 540], [1150, 540]]);
      k.ground([[1150, 540], [1200, 490], [1350, 490], [1400, 540]], 'slippery');
      k.ground([[1400, 540], [1500, 540]]);
      k.plat([[500, 450], [700, 380], [900, 380], [1100, 450]]);
      k.deco('fern', 300, 540, 1.2); k.deco('bracket_fungus', 800, 540, 1.0);
      world.addAnt(1000, 520, 25, 900, 1100);
      k.cp(1550, 540, 'Checkpoint 1');

      k.ground([[1500, 540], [1700, 540], [1780, 470], [2300, 470], [2380, 540], [2420, 540]]);
      k.ground([[2420, 540], [2460, 490], [2540, 490], [2580, 540]], 'slippery');
      k.ground([[2580, 540], [2600, 540]]);
      k.plat([[1850, 370], [2050, 330], [2250, 370]], 'normal', { hanging: true });
      world.addBonusApple(2050, 290, 'segment');
      k.deco('glowing_shroom', 2000, 470, 1.0); k.deco('hanging_vine', 2150, 300, 1.0);
      k.cp(2680, 540, 'Checkpoint 2');

      k.ground([[2600, 540], [2830, 540], [2930, 485], [3000, 455], [3100, 455], [3170, 485], [3280, 540], [3700, 540], [3700, 200]]);
      world.addHedgehog(3150, 515, 26, 3050, 3300);
      k.deco('bark_shelter', 3400, 540, 1.0); k.deco('fern', 3600, 540, 1.3);
    }
  }),
  course({
    id: 4, cupId: 'coupe_sousbois', world: 'sousbois',
    name: 'Sous-Bois 2 — Le Pont des Branches',
    subtitle: 'Un étage de branches au-dessus d’un ravin. Tomber n’élimine pas : le fond est juste plus lent.',
    startY: 450, finishX: 3550, finishY: 470,
    coachHint: '💡 <strong>Le Pont des Branches :</strong> restez en hauteur ! En bas, le ravin est lent et il faut rebondir sur les champignons pour remonter.',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 490], [600, 490], [700, 760]]);
      // Ravine floor: slower route with mushrooms back up
      k.ground([[700, 760], [2900, 760]]);
      k.mush(1100, 760, 560); k.mush(1900, 760, 560); k.mush(2600, 760, 560); k.mush(2840, 760, 660);
      // Branch level
      k.plat([[620, 480], [900, 470]]);
      k.plat([[990, 460], [1250, 440], [1400, 460]]);
      k.plat([[1490, 470], [1700, 470]], 'slippery', { thick: 46 });
      k.cp(1600, 470, 'Checkpoint 1');
      k.plat([[1790, 460], [2050, 430], [2250, 460]]);
      world.addAnt(2050, 400, 24, 1900, 2200);
      k.plat([[2340, 470], [2620, 470]]);
      k.cp(2550, 470, 'Checkpoint 2');
      k.plat([[2710, 460], [2900, 450]]);
      k.ground([[2900, 760], [2900, 490], [3800, 490], [3800, 200]]);
      k.deco('hanging_vine', 1300, 300, 1.1); k.deco('glowing_shroom', 1500, 760, 1.2);
      k.deco('bracket_fungus', 3100, 490, 1.0); k.deco('fern', 3400, 490, 1.3);
    }
  }),
  course({
    id: 5, cupId: 'coupe_sousbois', world: 'sousbois',
    name: 'Sous-Bois 3 — La Clairière aux Champignons',
    subtitle: 'Rebondir de champignon en champignon jusqu’aux hautes branches, puis redescendre sur la mousse.',
    startY: 500, finishX: 3500, finishY: 540,
    coachHint: '💡 <strong>La Clairière aux Champignons :</strong> les champignons propulsent haut. Visez les branches !',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 540], [900, 540]]);
      k.mush(700, 540, 560);
      k.plat([[760, 360], [1100, 340]]);
      k.ground([[900, 540], [1300, 540]]);
      k.plat([[1180, 300], [1450, 290]]);
      k.mush(1250, 540, 600);
      k.deco('glowing_shroom', 400, 540, 1.3); k.deco('fern', 1000, 540, 1.1);
      k.cp(1350, 540, 'Checkpoint 1');

      // High branches, then a mossy slope down
      k.ground([[1300, 540], [1500, 540], [1520, 420], [1800, 420]]);
      k.ground([[1800, 420], [2150, 560]], 'slippery');
      k.ground([[2150, 560], [2400, 560]]);
      k.plat([[1600, 290], [1900, 270]], 'normal', { hanging: true });
      world.addBonusApple(1750, 230, 'segment');
      k.mush(1460, 540, 520);
      k.cp(2350, 560, 'Checkpoint 2');

      k.ground([[2400, 560], [2480, 700], [2900, 700], [2980, 540], [3700, 540], [3700, 200]]);
      k.mush(2600, 700, 560); k.mush(2800, 700, 560);
      k.plat([[2550, 450], [2850, 450]], 'slippery', { thick: 46 });
      world.addHedgehog(3200, 515, 26, 3100, 3350);
      k.deco('glowing_shroom', 3300, 540, 1.2); k.deco('bracket_fungus', 3500, 540, 1.0);
    }
  }),

  // ===========================================================================
  // 🍯 COUPE DE LA RUCHE — cire et miel.
  // Identité : murs de miel collants à escalader (et où l'on peut s'arrêter),
  // pentes de cire glissantes.
  // ===========================================================================
  course({
    id: 6, cupId: 'coupe_ruche', world: 'ruche',
    name: 'Ruche 1 — Les Alvéoles',
    subtitle: 'Des murs de miel à escalader, des pentes de cire pour redescendre.',
    startY: 500, finishX: 3500, finishY: 500,
    coachHint: '💡 <strong>Les Alvéoles :</strong> les murs de <strong>miel</strong> sont collants : on y grimpe sans glisser. La cire mouillée, elle, fait déraper.',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 540], [600, 540]]);
      k.ground([[600, 540], [600, 400]], 'sticky');
      k.ground([[600, 400], [950, 400]]);
      k.ground([[950, 400], [1250, 520]], 'slippery');
      k.ground([[1250, 520], [1400, 520]]);
      k.mush(540, 540, 520);
      k.deco('amber_crystal', 300, 540, 1.0); k.deco('amber_crystal', 800, 400, 0.8);
      k.cp(1350, 520, 'Checkpoint 1');

      k.ground([[1400, 520], [1400, 360]], 'sticky');
      k.ground([[1400, 360], [1700, 360]]);
      k.ground([[1700, 360], [1700, 250]], 'sticky');
      k.ground([[1700, 250], [2000, 250]]);
      k.ground([[2000, 250], [2400, 470]], 'slippery');
      k.ground([[2400, 470], [2600, 470]]);
      k.mush(1340, 520, 540); k.mush(1640, 360, 520);
      world.addBonusApple(1850, 210, 'segment');
      k.cp(2520, 470, 'Checkpoint 2');

      k.ground([[2600, 470], [2700, 600], [3000, 600], [3000, 500], [3700, 500], [3700, 200]], 'normal');
      k.plat([[2700, 420], [2950, 420]], 'sticky');
      k.mush(2850, 600, 500);
      world.addAnt(3250, 475, 25, 3100, 3400);
      k.deco('amber_crystal', 3400, 500, 1.1);
    }
  }),
  course({
    id: 7, cupId: 'coupe_ruche', world: 'ruche',
    name: 'Ruche 2 — Le Plafond de Miel',
    subtitle: 'Un pont de miel en hauteur : lent mais sûr. En dessous, des alvéoles et des rebonds.',
    startY: 500, finishX: 3550, finishY: 500,
    coachHint: '💡 <strong>Le Plafond de Miel :</strong> le pont collant est lent mais on ne tombe pas. Le chemin de cire, en dessous, est plus rapide… et plus glissant.',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 540], [700, 540]]);
      k.ground([[700, 540], [700, 380]], 'sticky');
      // Wide ledge (wider than any body, so nobody can straddle it), then either the high
      // sticky bridge (slow, safe) or a drop into the low wax route
      k.ground([[700, 380], [1000, 380], [1000, 760], [1200, 760], [1300, 640], [1500, 640]]);
      k.mush(640, 540, 520);
      k.plat([[1100, 380], [1800, 380]], 'sticky', { thick: 44 });
      k.ground([[1500, 640], [1650, 720]], 'slippery');
      k.ground([[1650, 720], [1800, 720], [1880, 540]]);
      k.mush(1730, 720, 520);
      k.cp(1900, 540, 'Checkpoint 1');

      k.ground([[1880, 540], [2300, 540], [2300, 420]], 'normal');
      k.ground([[2300, 420], [2650, 420]]);
      k.ground([[2650, 420], [2900, 520]], 'slippery');
      k.mush(2240, 540, 520);
      world.addAnt(2000, 515, 25, 1900, 2200);
      k.cp(2950, 520, 'Checkpoint 2');

      k.ground([[2900, 520], [3800, 500], [3800, 200]]);
      k.plat([[3100, 390], [3400, 390]], 'sticky');
      world.addBonusApple(3250, 380, 'segment');
      k.deco('amber_crystal', 3500, 500, 1.2);
    }
  }),
  course({
    id: 8, cupId: 'coupe_ruche', world: 'ruche',
    name: 'Ruche 3 — La Coulée de Cire',
    subtitle: 'Une grande descente de cire glissante, puis il faut tout remonter par les murs de miel.',
    startY: 330, finishX: 3500, finishY: 320,
    coachHint: '💡 <strong>La Coulée de Cire :</strong> profitez de la glissade… puis remontez par les murs collants avant l’arrivée.',
    layout(k, world) {
      k.ground([[-200, 100], [-200, 370], [500, 370]]);
      k.ground([[500, 370], [1300, 660]], 'slippery');
      k.ground([[1300, 660], [1600, 660]]);
      k.deco('amber_crystal', 300, 370, 1.0);
      world.addAphid(1450, 635, 22, 1350, 1550);
      k.cp(1550, 660, 'Checkpoint 1');

      k.ground([[1600, 660], [1600, 530]], 'sticky');
      k.ground([[1600, 530], [1900, 530]]);
      k.ground([[1900, 530], [1900, 420]], 'sticky');
      k.ground([[1900, 420], [2300, 420]]);
      k.mush(1540, 660, 560); k.mush(1840, 530, 520);
      k.plat([[2000, 320], [2200, 320]], 'sticky');
      world.addBonusApple(2100, 280, 'segment');
      k.cp(2250, 420, 'Checkpoint 2');

      k.ground([[2300, 420], [2450, 540], [2800, 540]]);
      k.ground([[2800, 540], [2800, 360]], 'sticky');
      k.ground([[2800, 360], [3800, 360], [3800, 100]]);
      k.mush(2740, 540, 560);
      world.addAnt(3200, 335, 25, 3050, 3350);
      k.deco('amber_crystal', 3400, 360, 1.2);
    }
  }),

  // ===========================================================================
  // 🌙 COUPE DE LA ROSÉE — jardin la nuit.
  // Identité : galets mouillés glissants, champignons lumineux qui propulsent haut,
  // tout se joue en rebonds.
  // ===========================================================================
  course({
    id: 9, cupId: 'coupe_rosee', world: 'rosee',
    name: 'Rosée 1 — Les Galets Mouillés',
    subtitle: 'Un gué de galets humides : chaque pierre glisse, il faut sauter juste.',
    startY: 500, finishX: 3500, finishY: 520,
    coachHint: '💡 <strong>Les Galets Mouillés :</strong> les pierres <strong>mouillées</strong> glissent. Un champignon au fond permet de remonter si l’on tombe.',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 540], [700, 540], [760, 700]]);
      k.ground([[760, 700], [1700, 700]]);
      k.mush(1000, 700, 520); k.mush(1450, 700, 520);
      k.plat([[780, 520], [900, 515]], 'slippery');
      k.plat([[980, 500], [1100, 495]]);
      k.plat([[1180, 510], [1300, 505]], 'slippery');
      k.plat([[1380, 500], [1500, 500]]);
      k.plat([[1570, 510], [1660, 510]], 'slippery');
      k.ground([[1700, 700], [1760, 540], [2000, 540]]);
      k.deco('glowing_shroom', 400, 540, 1.2); k.deco('rock', 600, 540, 1.0);
      k.cp(1900, 540, 'Checkpoint 1');

      k.ground([[2000, 540], [2300, 480], [2500, 480]]);
      k.ground([[2500, 480], [2800, 580]], 'slippery');
      k.ground([[2800, 580], [3000, 580], [3080, 520], [3700, 520], [3700, 200]]);
      k.plat([[2550, 400], [2780, 410]]);
      world.addBonusApple(2660, 360, 'segment');
      k.cp(2950, 580, 'Checkpoint 2');
      world.addHedgehog(3300, 495, 26, 3150, 3450);
      k.deco('glowing_shroom', 3200, 520, 1.1); k.deco('clover_patch', 3500, 520);
    }
  }),
  course({
    id: 10, cupId: 'coupe_rosee', world: 'rosee',
    name: 'Rosée 2 — Le Champ de Trèfles',
    subtitle: 'Des feuilles de trèfle qui basculent au-dessus d’un fossé, sous la lune.',
    startY: 500, finishX: 3500, finishY: 520,
    coachHint: '💡 <strong>Le Champ de Trèfles :</strong> les feuilles basculent sous votre poids. Restez au centre !',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 540], [600, 540], [680, 720], [1800, 720], [1880, 540], [2100, 540]]);
      k.leaf(780, 500, 100);
      k.leaf(1010, 490, 100, 20);
      k.leaf(1240, 500, 100);
      k.leaf(1470, 490, 100, 20);
      k.leaf(1660, 500, 100);
      k.mush(900, 720, 540); k.mush(1350, 720, 540); k.mush(1750, 720, 560);
      k.deco('clover_patch', 300, 540); k.deco('glowing_shroom', 500, 540, 1.0);
      k.cp(2000, 540, 'Checkpoint 1');

      k.ground([[2100, 540], [2400, 540], [2400, 450], [2700, 450]]);
      k.ground([[2700, 450], [2950, 540]], 'slippery');
      k.ground([[2950, 540], [3700, 520], [3700, 200]]);
      k.mush(2340, 540, 500);
      world.addAphid(2550, 425, 22, 2450, 2650);
      k.cp(3000, 540, 'Checkpoint 2');
      k.plat([[3150, 430], [3400, 440]], 'slippery');
      world.addHedgehog(3350, 495, 26, 3200, 3500);
      k.deco('clover_patch', 3200, 530); k.deco('glowing_shroom', 3550, 520, 1.2);
    }
  }),
  course({
    id: 11, cupId: 'coupe_rosee', world: 'rosee',
    name: 'Rosée 3 — Les Grands Rebonds',
    subtitle: 'Une tour de champignons lumineux à gravir de rebond en rebond.',
    startY: 500, finishX: 3550, finishY: 330,
    coachHint: '💡 <strong>Les Grands Rebonds :</strong> les champignons envoient très haut. Accrochez-vous aux pierres plates entre deux rebonds.',
    layout(k, world) {
      k.ground([[-200, 200], [-200, 540], [1000, 540]]);
      k.mush(700, 540, 560);
      k.plat([[760, 400], [950, 395]]);
      k.mush(1060, 540, 600);
      k.ground([[1000, 540], [1500, 540]]);
      k.plat([[1100, 330], [1350, 320]]);
      k.deco('glowing_shroom', 400, 540, 1.3); k.deco('rock', 1200, 540, 1.0);
      k.cp(1400, 540, 'Checkpoint 1');

      k.ground([[1500, 540], [1500, 430], [1800, 430]]);
      k.mush(1440, 540, 520);
      k.ground([[1800, 430], [1800, 330], [2100, 330]], 'normal');
      k.mush(1740, 430, 520);
      k.plat([[1900, 230], [2150, 220]], 'slippery');
      world.addBonusApple(2020, 180, 'segment');
      k.ground([[2100, 330], [2400, 420]], 'slippery');
      k.ground([[2400, 420], [2600, 420]]);
      k.cp(2550, 420, 'Checkpoint 2');

      k.ground([[2600, 420], [2600, 330], [2900, 330]]);
      k.mush(2540, 420, 520);
      k.ground([[2900, 330], [3000, 470], [3200, 470], [3300, 370], [3800, 370], [3800, 100]]);
      k.mush(3100, 470, 520);
      world.addAnt(3500, 345, 25, 3350, 3650);
      k.deco('glowing_shroom', 3600, 370, 1.3);
    }
  }),

  // ===========================================================================
  // 🎓 INITIATION — hors coupe, en entraînement solo. Un geste par section,
  // enseigné par un panneau avant d'être demandé.
  // ===========================================================================
  course({
    id: 12, cupId: null, world: 'initiation',
    name: 'Initiation — L’Orée des Pousses',
    subtitle: 'Chaque panneau enseigne un geste avant de le demander.',
    startY: 520, finishX: 4100, finishY: 520,
    coachHint: '💡 <strong>Initiation :</strong> suivez les panneaux en bois ! Flèches pour ramper, <strong>Q / D</strong> pour agripper la queue / la tête, <strong>Espace</strong> maintenu puis relâché pour bondir.',
    layout(k, world) {
      k.ground([[-200, 260], [-200, 560], [0, 560], [700, 560], [760, 500], [1150, 500], [1520, 510]]);
      k.sign(330, 560, 'Flèches →\npour ramper');
      k.sign(620, 560, 'Marche !\nMaintiens Q puis D\npour te hisser');
      k.sign(960, 500, 'D (tête accrochée)\n+ Espace relâché\n= coup de fouet');
      world.addAphid(1250, 480, 22, 1150, 1380);
      k.cp(1440, 510, 'Checkpoint 1');

      k.ground([[1520, 510], [1640, 510], [1680, 640], [1840, 640], [1880, 500], [2050, 500]]);
      k.sign(1585, 510, 'Espace maintenu…\npuis relâché :\nsaut chargé !');
      k.mush(1760, 640, 440);

      k.ground([[2050, 500], [2400, 500]]);
      k.ground([[2400, 500], [2700, 500]], 'slippery');
      k.ground([[2700, 500], [2800, 500]]);
      k.sign(2300, 500, 'Reflets bleus :\nça GLISSE');
      k.ground([[2800, 500], [3100, 500]], 'sticky');
      k.sign(2860, 500, 'Coulures dorées :\nça COLLE\n(lent mais sûr)');
      k.cp(3150, 500, 'Checkpoint 2');

      k.ground([[3100, 500], [3200, 520], [3280, 640], [3620, 640], [3700, 520], [4500, 520], [4500, 200]]);
      k.sign(3230, 520, 'Fais le tour\nde la branche :\nQ et D alternés');
      k.plat([[3300, 470], [3600, 470]], 'normal', { thick: 44, hanging: true });
      k.mush(3450, 640, 440);
      k.deco('flower', 3900, 520, 1.1); k.deco('fern', 4100, 520, 1.3);
    }
  })
];

export const TRAINING_LEVEL_INDEX = 12;
