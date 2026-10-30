// js/gameplayConfig.js — Configuration centralisée du Gameplay & Physique de SlipGrip
// Vous pouvez modifier directement les valeurs ci-dessous ou utiliser le panneau ⚙️ en jeu !

// Species. Every physical field below is read by caterpillar.js through getSpecies():
//   numNodes, extendedSegLen, contractedSegLen, radii   → body build & collisions
//   massMult        → inertia when pushing props / platforms, knockback resistance
//   crawlMult       → max wriggling speed with the arrows
//   jumpHeightFrac  → full-charge jump apex as a fraction of body length
//   jumpMult        → extra launch speed multiplier
//   chargeSpeedMult → how fast Space charges / contracts
//   agilityMult     → steering & air rotation responsiveness
//   gravityMult     → personal gravity (light species fall slower)
//   glide           → gentle gliding when falling with the arrows held
//   gripExtraDistance → extra suction reach (px)
//   mossGrip        → suction feet do not slide on moss
//   contractStyle   → 'accordion' (segments shorten) or 'omega' (ends meet, body loops: Geometridae)
//   visualScale     → drawn body thickness, matching the collision radii
export const CATERPILLAR_CLASSES = {
  classique: {
    id: 'classique',
    icon: '🐛',
    name: 'Chenille Classique',
    subtitle: 'L’Équilibrée',
    desc: '5 segments, ni lourde ni légère : elle fait tout correctement.',
    pro: 'Polyvalente, facile à prendre en main.',
    con: 'Aucun point fort marqué.',
    badge: '⚖️ Équilibrée',
    numNodes: 5,
    extendedSegLen: 34,
    contractedSegLen: 20,
    radii: [12.0, 13.8, 14.5, 13.8, 14.5],
    massMult: 1.0,
    crawlMult: 1.0,
    jumpHeightFrac: 0.67,
    jumpMult: 1.0,
    chargeSpeedMult: 1.0,
    agilityMult: 1.0,
    gravityMult: 1.0,
    gripExtraDistance: 0,
    contractStyle: 'accordion',
    visualScale: 1.0
  },
  voltigeuse: {
    id: 'voltigeuse',
    icon: '🪽',
    name: 'Voltigeuse',
    subtitle: 'Fine & Légère',
    desc: 'Corps fin et léger : rampe vite, s’accroche de loin et plane un peu en tombant.',
    pro: 'Rapide, agile, longue portée de ventouse, chute amortie.',
    con: 'Petits sauts, se fait projeter loin par les coups.',
    badge: '🪶 Légère',
    numNodes: 5,
    extendedSegLen: 32,
    contractedSegLen: 18,
    radii: [8.8, 10.0, 10.5, 10.0, 10.8],
    massMult: 0.6,
    crawlMult: 1.25,
    jumpHeightFrac: 0.42,
    jumpMult: 1.0,
    chargeSpeedMult: 1.35,
    agilityMult: 1.35,
    gravityMult: 0.85,
    glide: true,
    gripExtraDistance: 6,
    contractStyle: 'accordion',
    visualScale: 0.74
  },
  dodue: {
    id: 'dodue',
    icon: '🦣',
    name: 'Mastodonte',
    subtitle: 'Gros Sauteur',
    desc: 'Grosse, longue et lourde : sa détente puissante l’envoie plus loin que toutes les autres.',
    pro: 'Les plus grands sauts, encaisse les coups, écrase les obstacles.',
    con: 'Charge lente, rampe lentement, lourde à hisser sur les parois.',
    badge: '🦣 Gros Sauteur',
    numNodes: 6,
    extendedSegLen: 37,
    contractedSegLen: 24,
    radii: [15.5, 18.5, 19.5, 19.5, 18.5, 20.0],
    massMult: 1.8,
    crawlMult: 0.75,
    jumpHeightFrac: 0.82,
    jumpMult: 1.1,
    chargeSpeedMult: 0.8,
    agilityMult: 0.8,
    gravityMult: 1.1,
    gripExtraDistance: 0,
    contractStyle: 'accordion',
    visualScale: 1.35
  },
  arpenteuse: {
    id: 'arpenteuse',
    icon: '📏',
    name: 'Arpenteuse',
    subtitle: 'Géométridé (Ω)',
    desc: 'Longue et fine, elle ne se tasse pas : elle se plie en boucle Ω, ventouses avant et arrière réunies, puis se déroule loin devant.',
    pro: 'Énorme allonge, avance par grandes boucles (D → Espace → Q → lâcher D → lâcher Espace).',
    con: 'Se tortille très mal avec les flèches seules.',
    badge: '📏 Boucle Ω',
    numNodes: 6,
    extendedSegLen: 40,
    contractedSegLen: 38,
    radii: [8.5, 9.5, 10.0, 10.0, 9.5, 10.5],
    massMult: 0.85,
    crawlMult: 0.55,
    jumpHeightFrac: 0.6,
    jumpMult: 1.0,
    chargeSpeedMult: 1.1,
    agilityMult: 1.1,
    gravityMult: 1.0,
    gripExtraDistance: 8,
    contractStyle: 'omega',
    visualScale: 0.72
  },
  monarque: {
    id: 'monarque',
    icon: '🦋',
    name: 'Monarque',
    subtitle: 'La Grimpeuse',
    desc: 'Ventouses collantes : elle ne glisse pas sur la mousse et grimpe les parois sans ralentir.',
    pro: 'Tient sur la mousse, aussi rapide aux murs et au plafond qu’au sol.',
    con: 'Sauts un peu plus courts.',
    badge: '🦋 Grimpeuse',
    numNodes: 5,
    extendedSegLen: 34,
    contractedSegLen: 20,
    radii: [12.0, 13.5, 14.0, 13.5, 14.0],
    massMult: 1.05,
    crawlMult: 1.0,
    jumpHeightFrac: 0.58,
    jumpMult: 1.0,
    chargeSpeedMult: 0.95,
    agilityMult: 1.1,
    gravityMult: 1.0,
    gripExtraDistance: 4,
    mossGrip: true,
    wallClimber: true,
    contractStyle: 'accordion',
    visualScale: 1.0
  }
};

export const BODY_SHAPES = {
  larve: {
    id: 'larve',
    name: 'Tube Larvaire (Continu)',
    icon: '🐛',
    desc: 'Corps souple et lisse avec plis articulés de chenille véritable.'
  },
  spheres: {
    id: 'spheres',
    name: 'Boules Rétro (V1)',
    icon: '🟢',
    desc: 'Boules mignonnes connectées qui se chevauchent, style rétro des premières versions !'
  },
  fin: {
    id: 'fin',
    name: 'Filiforme Élancé',
    icon: '🪱',
    desc: 'Silhouette fine et gracile, profil mince et allongé.'
  },
  boudine: {
    id: 'boudine',
    name: 'Segments Renflés (Dodue)',
    icon: '🍡',
    desc: 'Segments bien bombés en accordéon, silhouette très cartoon.'
  }
};

export const GAMEPLAY_PRESETS = {
  arcade_dynamique: {
    name: 'Arcade Dynamique (Recommandé)',
    desc: 'Tête agile et réactive, corps suivant naturellement, contraction douce et zéro tremblement.',
    gravity: 740,
    groundSnapping: 1.5,
    orientationUpForce: 2200,
    orientationResponsiveness: 2.25,
    orientationHeadSpan: 2,
    orientationRearSpan: 2,
    jumpBoost: 1.00,
    maxJumpSpeed: 300,
    jumpUpAngleBonus: 1.25,
    jumpChargeTime: 3.0,
    gripDistance: 24,
    gripAngleTolerance: -0.15,
    omegaArchVisual: 0.75,
    wigglePhysicsAmount: 4,
    maxGroundCrawl: 50,
    clawScale: 1.35,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 1.0,
    bendContractSpeed: 11.0,
    unbendExtensionSpeed: 36.0,
    anchorReleaseMomentumWindow: 0.30,
    groundPushForce: 1.10,
    airborneExtensionOnly: true,
    unbendReachBonus: 1.20,
    preserveShapeOnBend: true
  },
  visqueux_larvaire: {
    name: 'Visqueux / Larvaire Pur',
    desc: 'Chenille ultra-souple et molle, gravité lourde, bonds réduits, ondulation accentuée.',
    gravity: 540,
    groundSnapping: 1.9,
    orientationUpForce: 780,
    orientationResponsiveness: 0.9,
    orientationHeadSpan: 3,
    orientationRearSpan: 3,
    jumpBoost: 0.85,
    jumpUpAngleBonus: 1.05,
    jumpChargeTime: 3.0,
    gripDistance: 18,
    gripAngleTolerance: -0.22,
    omegaArchVisual: 0.25,
    wigglePhysicsAmount: 36,
    clawScale: 1.15,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 0.8,
    unbendExtensionSpeed: 6.0,
    anchorReleaseMomentumWindow: 0.08,
    groundPushForce: 0.85,
    airborneExtensionOnly: true,
    unbendReachBonus: 0.95,
    preserveShapeOnBend: true
  },
  omega_bouncy: {
    name: 'Oméga Rebondissant',
    desc: 'Arche Oméga spectaculaire, ressort ultra-élastique et sauts gigantesques vers le ciel.',
    gravity: 420,
    groundSnapping: 1.2,
    orientationUpForce: 1400,
    orientationResponsiveness: 1.6,
    orientationHeadSpan: 4,
    orientationRearSpan: 4,
    jumpBoost: 1.75,
    jumpUpAngleBonus: 1.9,
    jumpChargeTime: 3.0,
    gripDistance: 24,
    gripAngleTolerance: -0.15,
    omegaArchVisual: 1.6,
    wigglePhysicsAmount: 22,
    clawScale: 1.45,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 1.25,
    unbendExtensionSpeed: 10.0,
    anchorReleaseMomentumWindow: 0.16,
    groundPushForce: 1.75,
    airborneExtensionOnly: true,
    unbendReachBonus: 1.1,
    preserveShapeOnBend: true
  },
  agile_grimpeur: {
    name: 'Agile Grimpeur',
    desc: 'Grande portée d’accroche magnétique, maniement aérien précis pour gravir les obstacles verticaux.',
    gravity: 450,
    groundSnapping: 1.3,
    orientationUpForce: 1300,
    orientationResponsiveness: 1.5,
    orientationHeadSpan: 4,
    orientationRearSpan: 4,
    jumpBoost: 1.2,
    jumpUpAngleBonus: 1.4,
    jumpChargeTime: 3.0,
    gripDistance: 28,
    gripAngleTolerance: -0.10,
    omegaArchVisual: 0.9,
    wigglePhysicsAmount: 16,
    clawScale: 1.4,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 1.1,
    unbendExtensionSpeed: 9.0,
    anchorReleaseMomentumWindow: 0.12,
    groundPushForce: 1.2,
    airborneExtensionOnly: true,
    unbendReachBonus: 1.15,
    preserveShapeOnBend: true
  }
};

// Configuration active du gameplay (modifiable en temps réel)
export const GAMEPLAY_CONFIG = {
  // Gravité du monde (en px/s²) — physique vive et ancrée, fin de la gravité lunaire
  gravity: 740,

  // Force de plaquage / amortissement au sol
  groundSnapping: 1.5,

  // Force d'orientation vers le haut (permet de dresser la tête facilement)
  orientationUpForce: 2200,

  // Vitesse de réaction à l'orientation des flèches (orientation vive et rapide)
  orientationResponsiveness: 2.25,

  // Nombre de segments avant mobilisés pour lever la tête (1 à 3)
  orientationHeadSpan: 2,

  // Nombre de segments arrière mobilisés pour lever la queue quand l'avant est accroché
  orientationRearSpan: 2,

  // Multiplicateur général de puissance du bond au relâchement d'Espace (avec vraie inertie)
  jumpBoost: 1.00,

  // Vitesse maximale de base du saut à pleine charge
  maxJumpSpeed: 300,

  // Bonus d'impulsion verticale quand on oriente vers le haut
  jumpUpAngleBonus: 1.25,

  // Durée maximale de chargement du saut avec Espace (en secondes)
  jumpChargeTime: 3.0,

  // Distance maximale d'accroche des ventouses/griffes aux surfaces (en px)
  gripDistance: 24,

  // Seuil angulaire (produit scalaire) déclenchant le retournement automatique sur saisie inversée
  gripAngleTolerance: -0.15,

  // Intensité de l'arche visuelle Oméga lors de la contraction (0 = tout plat, 1 = normal, 2 = très haut)
  omegaArchVisual: 0.75,

  // Amplitude de l'ondulation physique larvaire naturelle (0 = aucun wiggle, très calme et doux)
  wigglePhysicsAmount: 4,

  // Vitesse maximale de reptation passive au sol avec les flèches seules (marche avant base 50, arrière 30)
  maxGroundCrawl: 50,

  // Échelle des paires de griffes en overflow (taille visuelle)
  clawScale: 1.35,

  // Affichage des aides visuelles Q et D en superposition sur le personnage
  showBadgesOverlay: true,

  // Autoriser l'orientation verticale (↑ / ↓) pendant la charge Espace
  bendCanOrientVertically: true,

  // Multiplicateur de puissance d'orientation pendant la charge Espace
  bendOrientationPower: 1.0,

  // Vitesse de contraction douce du corps au clic Espace (marche d'arpenteuse)
  bendContractSpeed: 11.0,

  // Vitesse de déploiement / détente du corps au relâchement
  unbendExtensionSpeed: 36.0,

  // Poussée sur la surface au décollage avec bonne inertie physique
  groundPushForce: 1.00,

  // En l'air sans appui : déploiement élastique pur sans saut magique
  airborneExtensionOnly: true,

  // Bonus de portée d'extension maximale au déploiement (vrai détente du squelette pour attraper au loin)
  unbendReachBonus: 1.20,

  // Fenêtre de tolérance (sec) pour relâcher l'accroche et bénéficier de l'élan de détente
  anchorReleaseMomentumWindow: 0.30,

  // Préserver la posture et courbure du corps pendant la charge (ne pas écraser en barre droite)
  preserveShapeOnBend: true,

  // Mode de rendu des arrière-plans : 'parallax' (optimisé 4-5 couches), 'eco' (1 couche composite fluide), 'minimal' (dessin vectoriel pur)
  backgroundMode: 'parallax',

  // Nom du preset actuellement chargé
  activePreset: 'arcade_dynamique'
};

// Pristine defaults, captured before any localStorage override is applied
const DEFAULT_GAMEPLAY_CONFIG = JSON.parse(JSON.stringify(GAMEPLAY_CONFIG));
// Purely visual keys that stay under the player's control in multiplayer
const PERSONAL_DISPLAY_KEYS = ['backgroundMode', 'showBadgesOverlay'];

const STORAGE_KEY = 'slipgrip_gameplay_config_v72';
const USER_DEFAULT_KEY = 'slipgrip_user_default_config_v72';

export function loadSavedGameplayConfig() {
  try {
    const userDefault = localStorage.getItem(USER_DEFAULT_KEY);
    const saved = localStorage.getItem(STORAGE_KEY);
    const raw = saved || userDefault;
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(GAMEPLAY_CONFIG, parsed);
    }
  } catch (err) {
    console.warn('Impossible de charger la config gameplay:', err);
  }
  return GAMEPLAY_CONFIG;
}

export function saveGameplayConfig() {
  if (soloConfigSnapshot) return; // Room settings are temporary, never persist them
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(GAMEPLAY_CONFIG));
  } catch (err) {
    console.warn('Impossible de sauvegarder la config gameplay:', err);
  }
}

export function saveAsDefaultGameplayConfig() {
  try {
    localStorage.setItem(USER_DEFAULT_KEY, JSON.stringify(GAMEPLAY_CONFIG));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(GAMEPLAY_CONFIG));
    return true;
  } catch (err) {
    console.warn('Impossible de sauvegarder par défaut:', err);
    return false;
  }
}

let soloConfigSnapshot = null;

// Multiplayer races must run on identical physics for everyone: start from the
// defaults (ignoring each player's tuning-lab tweaks) and apply the room settings.
// The player's own config is kept aside and restored by restoreSoloGameplayConfig().
export function applyRoomGameplayConfig(roomSettings = {}) {
  if (!soloConfigSnapshot) {
    soloConfigSnapshot = JSON.parse(JSON.stringify(GAMEPLAY_CONFIG));
  }
  const personal = {};
  for (const key of PERSONAL_DISPLAY_KEYS) personal[key] = GAMEPLAY_CONFIG[key];
  Object.assign(GAMEPLAY_CONFIG, JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_CONFIG)), personal);
  for (const key of ['jumpBoost', 'gravity', 'gripDistance']) {
    if (typeof roomSettings[key] === 'number') GAMEPLAY_CONFIG[key] = roomSettings[key];
  }
}

export function restoreSoloGameplayConfig() {
  if (!soloConfigSnapshot) return;
  Object.assign(GAMEPLAY_CONFIG, soloConfigSnapshot);
  soloConfigSnapshot = null;
}

export function isUsingRoomGameplayConfig() {
  return soloConfigSnapshot !== null;
}

export function applyPreset(presetKey) {
  const preset = GAMEPLAY_PRESETS[presetKey];
  if (!preset) return false;
  Object.assign(GAMEPLAY_CONFIG, preset);
  GAMEPLAY_CONFIG.activePreset = presetKey;
  saveGameplayConfig();
  return true;
}

export function resetGameplayConfig() {
  localStorage.removeItem(USER_DEFAULT_KEY);
  applyPreset('arcade_dynamique');
}

// ==================== 6 MODIFICATEURS DE RATTRAPAGE (CUMULABLES ENTRE COURSES) ====================
export const RACE_MODIFIERS = {
  colosse: {
    id: 'colosse',
    name: 'Chenille Plus Grosse',
    subtitle: 'Colosse Indestructible',
    icon: '🦣',
    color: '#ee5253',
    desc: 'Taille +45%, Masse +60%, +50 PV Max ! Écrase et bouscule les rivaux sur son passage.',
    scaleMult: 1.42,
    massMult: 1.60,
    hpBonus: 50,
    speedMult: 0.92,
    jumpMult: 0.95,
    extraSegments: 0,
    reachMult: 1.05,
    gravityMult: 1.05,
    strengthMult: 1.50
  },
  micro_turbo: {
    id: 'micro_turbo',
    name: 'Petite & Ultra-Rapide',
    subtitle: 'Micro-Turbo Nerveuse',
    icon: '⚡',
    color: '#00d2d3',
    desc: 'Taille réduite (x0.70) mais vitesse de contraction, détente et reptation +45% !',
    scaleMult: 0.72,
    massMult: 0.75,
    hpBonus: 0,
    speedMult: 1.45,
    jumpMult: 1.15,
    extraSegments: 0,
    reachMult: 0.95,
    gravityMult: 0.92,
    strengthMult: 0.90
  },
  sauteuse: {
    id: 'sauteuse',
    name: 'Chenille Sauteuse',
    subtitle: 'Ressort bondissant',
    icon: '🦘',
    color: '#ff9f43',
    desc: 'Puissance de saut +45% et détente vers le haut explosive pour survoler la carte !',
    scaleMult: 1.0,
    massMult: 0.90,
    hpBonus: 10,
    speedMult: 1.12,
    jumpMult: 1.45,
    extraSegments: 0,
    reachMult: 1.10,
    gravityMult: 0.88,
    strengthMult: 1.10
  },
  longue: {
    id: 'longue',
    name: 'Chenille Plus Longue',
    subtitle: 'Méga-Arpenteuse',
    icon: '📏',
    color: '#10ac84',
    desc: '+2 segments supplémentaires et allonge accrue (+30%) pour franchir tous les gouffres !',
    scaleMult: 0.95,
    massMult: 1.10,
    hpBonus: 25,
    speedMult: 1.05,
    jumpMult: 1.05,
    extraSegments: 2,
    reachMult: 1.30,
    gravityMult: 1.0,
    strengthMult: 1.15
  },
  lune: {
    id: 'lune',
    name: 'Chenille sur la Lune',
    subtitle: 'Gravité Lunaire',
    icon: '🌙',
    color: '#a29bfe',
    desc: 'Gravité personnelle réduite de -45% ! Plane très loin dans les airs avec douceur.',
    scaleMult: 1.0,
    massMult: 0.80,
    hpBonus: 10,
    speedMult: 1.10,
    jumpMult: 1.22,
    extraSegments: 0,
    reachMult: 1.05,
    gravityMult: 0.55,
    strengthMult: 1.0
  },
  super_forte: {
    id: 'super_forte',
    name: 'Chenille Super Forte',
    subtitle: 'Hercule du Sous-Bois',
    icon: '💪',
    color: '#feca57',
    desc: 'Force x2.4 ! Soulève les pommes de pin géantes et projette objets/rivaux avec +75% de dégâts !',
    scaleMult: 1.12,
    massMult: 1.35,
    hpBonus: 30,
    speedMult: 1.08,
    jumpMult: 1.15,
    extraSegments: 0,
    reachMult: 1.08,
    gravityMult: 1.0,
    strengthMult: 2.40
  }
};

// ==================== COUPES (COMPÉTITIONS DE 3 COURSES PAR DIFFICULTÉ) ====================
export const CUPS_DEFINITIONS = {
  coupe_bourgeons: {
    id: 'coupe_bourgeons',
    name: 'Coupe des Bourgeons (Facile)',
    difficulty: 'Facile',
    icon: '🌱',
    desc: 'Initiation douce & sous-bois : 1. L’Orée des Pousses • 2. Les Ponts de Lianes • 3. Le Verger Fleuri !',
    levels: [0, 1, 2],
    cards: [
      { levelId: 0, title: '1. L’ORÉE DES POUSSES', icon: '🌱', bg: 'linear-gradient(135deg, #2d5a27, #8cf5ab)' },
      { levelId: 1, title: '2. LES PONTS DE LIANES', icon: '🌿', bg: 'linear-gradient(135deg, #236937, #74c668)' },
      { levelId: 2, title: '3. LE VERGER FLEURI', icon: '🌸', bg: 'linear-gradient(135deg, #1e4620, #ffeaa7)' }
    ]
  },
  coupe_vents: {
    id: 'coupe_vents',
    name: 'Coupe des Vents (Moyen)',
    difficulty: 'Moyen',
    icon: '🍃',
    desc: 'Aventure aérienne & caverne : 4. La Grotte aux Spores • 5. Le Gouffre Poids-Plume • 6. La Falaise des Cimes !',
    levels: [3, 4, 5],
    cards: [
      { levelId: 3, title: '4. LA GROTTE AUX SPORES', icon: '🍄', bg: 'linear-gradient(135deg, #5f27cd, #fd79a8)' },
      { levelId: 4, title: '5. LE GOUFFRE POIDS-PLUME', icon: '🪶', bg: 'linear-gradient(135deg, #0984e3, #81ecec)' },
      { levelId: 5, title: '6. LA FALAISE DES CIMES', icon: '🌲', bg: 'linear-gradient(135deg, #2d3436, #00b894)' }
    ]
  },
  coupe_titans: {
    id: 'coupe_titans',
    name: 'Coupe des Titans (Difficile)',
    difficulty: 'Difficile',
    icon: '⚡',
    desc: 'Défi expert & vertige : 7. Le Tronc des Titans • 8. La Ruche des Cires • 9. Le Festin des Tempêtes !',
    levels: [6, 7, 8],
    cards: [
      { levelId: 6, title: '7. LE TRONC DES TITANS', icon: '🪵', bg: 'linear-gradient(135deg, #6c5ce7, #d63031)' },
      { levelId: 7, title: '8. LA RUCHE DES CIRES', icon: '🍯', bg: 'linear-gradient(135deg, #b86b11, #fff3b0)' },
      { levelId: 8, title: '9. LE FESTIN DES TEMPÊTES', icon: '🌪️', bg: 'linear-gradient(135deg, #c0392b, #2c3e50)' }
    ]
  },
  coupe_fourmiliere: {
    id: 'coupe_fourmiliere',
    name: 'Coupe de la Fourmilière Royale (Maître)',
    difficulty: 'Maître',
    icon: '🐜',
    desc: 'Verticalité extrême, embranchements tactiques & fourmis guerrières : 10. L’Arbre Creux • 11. Jardins d’Ambre • 12. Citadelle des Mandibules !',
    levels: [9, 10, 11],
    cards: [
      { levelId: 9, title: '10. L’ARBRE CREUX MILLÉNAIRE', icon: '🌳', bg: 'linear-gradient(135deg, #4a2511, #d35400)' },
      { levelId: 10, title: '11. JARDINS SUSPENDUS D’AMBRE', icon: '🔶', bg: 'linear-gradient(135deg, #b7410e, #f39c12)' },
      { levelId: 11, title: '12. CITADELLE DES MANDIBULES', icon: '🐜', bg: 'linear-gradient(135deg, #641e16, #e74c3c)' }
    ]
  }
};
// Aliases de compatibilité avec les configurations existantes (non-énumérables pour éviter les doublons dans l'UI)
Object.defineProperty(CUPS_DEFINITIONS, 'potager_geant', { value: CUPS_DEFINITIONS.coupe_bourgeons, enumerable: false, writable: true, configurable: true });
Object.defineProperty(CUPS_DEFINITIONS, 'vallee_folle', { value: CUPS_DEFINITIONS.coupe_vents, enumerable: false, writable: true, configurable: true });
Object.defineProperty(CUPS_DEFINITIONS, 'pique_nique_royal', { value: CUPS_DEFINITIONS.coupe_titans, enumerable: false, writable: true, configurable: true });
Object.defineProperty(CUPS_DEFINITIONS, 'fourmiliere_royale', { value: CUPS_DEFINITIONS.coupe_fourmiliere, enumerable: false, writable: true, configurable: true });

// ==================== STYLES DE GRIPS / VENTOUSES ====================
export const GRIP_STYLES = {
  classic: {
    id: 'classic',
    name: 'Ventouses Classiques',
    icon: '🟢',
    rearColor: '#b84eff',
    frontColor: '#24bd4c',
    clawTint: '#fffce8'
  },
  neon_blue: {
    id: 'neon_blue',
    name: 'Ventouses Saphir',
    icon: '🔵',
    rearColor: '#00d2d3',
    frontColor: '#54a0ff',
    clawTint: '#dff9fb'
  },
  paw_gold: {
    id: 'paw_gold',
    name: 'Griffes Dorées',
    icon: '🐾',
    rearColor: '#ff9f43',
    frontColor: '#ffd32a',
    clawTint: '#fff200'
  },
  crimson_claw: {
    id: 'crimson_claw',
    name: 'Pattes Rubis',
    icon: '🦀',
    rearColor: '#ff4757',
    frontColor: '#ff6b81',
    clawTint: '#ffeaa7'
  },
  starlight: {
    id: 'starlight',
    name: 'Ventouses Cosmiques',
    icon: '✨',
    rearColor: '#a29bfe',
    frontColor: '#fd79a8',
    clawTint: '#f8efba'
  }
};

// ==================== CATALOGUE DES COSMÉTIQUES & SYSTÈME DE DÉBLOCAGE ====================
export const COSMETICS_CATALOG = [
  // Starter Skins (Unlocked by default)
  { category: 'palette', id: 'emerald', name: 'Vert Pomme', icon: '🍏', starter: true },
  { category: 'palette', id: 'pastel_blue', name: 'Bleu Lagon', icon: '💧', starter: true },
  { category: 'palette', id: 'axolotl', name: 'Rose Bonbon', icon: '🌸', starter: true },
  { category: 'palette', id: 'amber', name: 'Mandarine', icon: '🍊', starter: true },
  // Unlockable Skins (Won by winning Cups!)
  { category: 'palette', id: 'monarch', name: 'Monarque Zébré', icon: '🦋', starter: false, rarity: 'Rare' },
  { category: 'palette', id: 'cosmic', name: 'Nébuleuse Étoilée', icon: '🟣', starter: false, rarity: 'Épique' },
  { category: 'palette', id: 'solar', name: 'Soleil Doré', icon: '☀️', starter: false, rarity: 'Légendaire' },
  { category: 'palette', id: 'shadow', name: 'Ombre Nocturne', icon: '🌑', starter: false, rarity: 'Épique' },
  { category: 'palette', id: 'ruby', name: 'Rubis Flamme', icon: '🔥', starter: false, rarity: 'Rare' },

  // Starter Hats
  { category: 'hat', id: 'none', name: 'Aucun', icon: '🚫', starter: true },
  { category: 'hat', id: 'cap', name: 'Casquette Cool', icon: '🧢', starter: true },
  { category: 'hat', id: 'flower', name: 'Fleur des Champs', icon: '🌼', starter: true },
  { category: 'hat', id: 'hardhat', name: 'Casque Chantier', icon: '👷', starter: true },
  // Unlockable Hats
  { category: 'hat', id: 'pirate', name: 'Tricorne Pirate', icon: '🏴‍☠️', starter: false, rarity: 'Rare' },
  { category: 'hat', id: 'crown', name: 'Couronne Royale', icon: '👑', starter: false, rarity: 'Légendaire' },
  { category: 'hat', id: 'tophat', name: 'Haut-de-forme', icon: '🎩', starter: false, rarity: 'Rare' },
  { category: 'hat', id: 'mushroom', name: 'Champignon Magique', icon: '🍄', starter: false, rarity: 'Épique' },
  { category: 'hat', id: 'propeller', name: 'Casquette Hélice', icon: '🚁', starter: false, rarity: 'Rare' },
  { category: 'hat', id: 'alien', name: 'Antennes Alien', icon: '👽', starter: false, rarity: 'Épique' },

  // Starter Grips
  { category: 'grip', id: 'classic', name: 'Ventouses Vertes', icon: '🟢', starter: true },
  { category: 'grip', id: 'neon_blue', name: 'Ventouses Saphir', icon: '🔵', starter: true },
  // Unlockable Grips
  { category: 'grip', id: 'paw_gold', name: 'Griffes Dorées', icon: '🐾', starter: false, rarity: 'Légendaire' },
  { category: 'grip', id: 'crimson_claw', name: 'Pattes Rubis', icon: '🦀', starter: false, rarity: 'Rare' },
  { category: 'grip', id: 'starlight', name: 'Ventouses Cosmiques', icon: '✨', starter: false, rarity: 'Épique' },

  // Faces (All unlocked or some unlockable)
  { category: 'face', id: 'cute', name: 'Mignon', icon: '😊', starter: true },
  { category: 'face', id: 'cool', name: 'Lunettes Cool', icon: '😎', starter: true },
  { category: 'face', id: 'determined', name: 'Déterminé', icon: '😠', starter: true },
  { category: 'face', id: 'derpy', name: 'Rigolo', icon: '🤪', starter: true },
  { category: 'face', id: 'starry', name: 'Yeux Étoilés', icon: '🤩', starter: false, rarity: 'Épique' }
];

const UNLOCKS_STORAGE_KEY = 'slipgrip_unlocked_cosmetics_v1';

export function getUnlockedCosmeticsSet() {
  const unlocked = new Set();
  for (const item of COSMETICS_CATALOG) {
    if (item.starter) {
      unlocked.add(`${item.category}:${item.id}`);
    }
  }
  try {
    const raw = localStorage.getItem(UNLOCKS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach(k => unlocked.add(k));
      }
    }
  } catch (err) {
    // Ignore storage error
  }
  return unlocked;
}

export function isCosmeticUnlocked(category, id) {
  const set = getUnlockedCosmeticsSet();
  if (id === undefined && typeof category === 'string' && category.includes(':')) {
    return set.has(category);
  }
  return set.has(`${category}:${id}`);
}

export function getUnlockedCosmeticsCount() {
  const set = getUnlockedCosmeticsSet();
  let unlockedCount = 0;
  for (const item of COSMETICS_CATALOG) {
    if (set.has(`${item.category}:${item.id}`)) {
      unlockedCount++;
    }
  }
  return {
    unlocked: unlockedCount,
    total: COSMETICS_CATALOG.length
  };
}

export function unlockRandomCosmeticGift() {
  const unlocked = getUnlockedCosmeticsSet();
  const lockedItems = COSMETICS_CATALOG.filter(item => !unlocked.has(`${item.category}:${item.id}`));
  let chosen = null;
  let isNew = false;

  if (lockedItems.length > 0) {
    chosen = lockedItems[Math.floor(Math.random() * lockedItems.length)];
    isNew = true;
    unlocked.add(`${chosen.category}:${chosen.id}`);
    try {
      localStorage.setItem(UNLOCKS_STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
    } catch (err) {
      // Ignore
    }
  } else {
    // All cosmetics already unlocked: pick a legendary/epic reward to celebrate!
    const nonStarters = COSMETICS_CATALOG.filter(i => !i.starter);
    chosen = nonStarters[Math.floor(Math.random() * nonStarters.length)] || COSMETICS_CATALOG[0];
    isNew = false;
  }

  return { item: chosen, isNew };
}

// Initialise avec les réglages sauvegardés s'ils existent
loadSavedGameplayConfig();

