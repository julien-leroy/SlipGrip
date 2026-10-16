// js/gameplayConfig.js — Configuration centralisée du Gameplay & Physique de SlipGrip
// Vous pouvez modifier directement les valeurs ci-dessous ou utiliser le panneau ⚙️ en jeu !

export const CATERPILLAR_CLASSES = {
  classique: {
    id: 'classique',
    name: 'Chenille Classique',
    subtitle: 'L’Équilibrée',
    desc: 'L’archétype idéal pour apprendre et maîtriser tous les terrains.',
    pro: 'Polyvalence absolue, maniement stable, équilibre parfait.',
    con: 'Aucun domaine extrême (stats standards moyennes).',
    badge: '⚖️ Équilibrée',
    numNodes: 7,
    extendedSegLen: 23,
    contractedSegLen: 12,
    radii: [13.5, 15.5, 17.0, 17.8, 17.0, 16.0, 17.5],
    massMult: 1.0,
    reachMult: 1.0,
    jumpMult: 1.0,
    chargeSpeedMult: 1.0,
    agilityMult: 1.0,
    gripExtraDistance: 0
  },
  arpenteuse: {
    id: 'arpenteuse',
    name: 'Arpenteuse Élastique',
    subtitle: 'La Longue Portée',
    desc: 'Corps longiligne et souple capable de franchir de gigantesques gouffres.',
    pro: '+35% de Portée d’extension, s’étire très loin pour agripper.',
    con: 'Corps plus léger (-25% masse), plus instable sur la mousse.',
    badge: '📏 Longue Portée',
    numNodes: 9,
    extendedSegLen: 24,
    contractedSegLen: 11,
    radii: [12.0, 13.5, 14.5, 15.0, 15.0, 14.5, 14.0, 13.5, 15.0],
    massMult: 0.75,
    reachMult: 1.35,
    jumpMult: 0.92,
    chargeSpeedMult: 1.15,
    agilityMult: 1.15,
    gripExtraDistance: 8
  },
  dodue: {
    id: 'dodue',
    name: 'Larve Dodue (Colosse)',
    subtitle: 'L’Ancre Inébranlable',
    desc: 'Grosse larve bien rembourrée, lourde et puissante comme un sumo.',
    pro: '+45% de Masse, ancrage rocheux solide, propulse fort les objets.',
    con: 'Portée raccourcie (-25%), hissage vertical plus pesant.',
    badge: '🦣 Colosse / Sumo',
    numNodes: 6,
    extendedSegLen: 19,
    contractedSegLen: 11,
    radii: [17.0, 20.0, 22.5, 23.0, 21.0, 22.0],
    massMult: 1.45,
    reachMult: 0.75,
    jumpMult: 1.25,
    chargeSpeedMult: 0.85,
    agilityMult: 0.85,
    gripExtraDistance: 2
  },
  voltigeuse: {
    id: 'voltigeuse',
    name: 'Voltigeuse Aérienne',
    subtitle: 'L’Acrobate Vif',
    desc: 'Chenille nerveuse et aérodynamique conçue pour les figures et les lancers rapides.',
    pro: '+35% Vitesse de charge saut, rotation vive et levage instantané.',
    con: 'Tolérance d’accroche plus étroite (-2px), rebonds plus vifs.',
    badge: '⚡ Acrobate Nerveux',
    numNodes: 7,
    extendedSegLen: 22,
    contractedSegLen: 11,
    radii: [13.0, 14.5, 15.8, 16.2, 15.8, 15.0, 16.0],
    massMult: 0.88,
    reachMult: 0.95,
    jumpMult: 1.18,
    chargeSpeedMult: 1.35,
    agilityMult: 1.30,
    gripExtraDistance: -2
  }
};

export const GAMEPLAY_PRESETS = {
  arcade_dynamique: {
    name: 'Arcade Dynamique (Recommandé)',
    desc: 'Tête ultra-réactive, gravité franche et lourde qui plaque vite, saut orienté équilibré avec Espace.',
    gravity: 550,
    groundSnapping: 1.8,
    orientationUpForce: 1350,
    orientationResponsiveness: 1.4,
    orientationHeadSpan: 4,
    orientationRearSpan: 4,
    jumpBoost: 1.05,
    jumpUpAngleBonus: 1.45,
    jumpChargeTime: 4.8,
    gripDistance: 24,
    gripAngleTolerance: -0.15,
    omegaArchVisual: 1.0,
    wigglePhysicsAmount: 24,
    clawScale: 1.35,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 0.50,
    unbendExtensionSpeed: 8.0,
    groundPushForce: 1.05,
    airborneExtensionOnly: true,
    unbendReachBonus: 1.0,
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
    jumpChargeTime: 4.5,
    gripDistance: 18,
    gripAngleTolerance: -0.22,
    omegaArchVisual: 0.25,
    wigglePhysicsAmount: 36,
    clawScale: 1.15,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 0.8,
    unbendExtensionSpeed: 6.0,
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
    jumpChargeTime: 4.5,
    gripDistance: 26,
    gripAngleTolerance: -0.15,
    omegaArchVisual: 1.6,
    wigglePhysicsAmount: 22,
    clawScale: 1.45,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 1.25,
    unbendExtensionSpeed: 10.0,
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
    jumpChargeTime: 4.5,
    gripDistance: 32,
    gripAngleTolerance: -0.10,
    omegaArchVisual: 0.9,
    wigglePhysicsAmount: 16,
    clawScale: 1.4,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 1.1,
    unbendExtensionSpeed: 9.0,
    groundPushForce: 1.2,
    airborneExtensionOnly: true,
    unbendReachBonus: 1.15,
    preserveShapeOnBend: true
  }
};

// Configuration active du gameplay (modifiable en temps réel)
export const GAMEPLAY_CONFIG = {
  // Gravité du monde (en px/s²) — plaque naturellement la chenille au sol avec du poids
  gravity: 550,

  // Force de plaquage / amortissement au sol
  groundSnapping: 1.8,

  // Force d'orientation vers le haut (s'oppose à la gravité pour dresser la tête)
  orientationUpForce: 1350,

  // Vitesse de réaction à l'orientation des flèches
  orientationResponsiveness: 1.4,

  // Nombre de segments avant mobilisés pour lever la tête (1 à 5)
  orientationHeadSpan: 4,

  // Nombre de segments arrière mobilisés pour lever la queue quand l'avant est accroché (1 à 5)
  orientationRearSpan: 4,

  // Multiplicateur général de puissance du bond au relâchement d'Espace
  jumpBoost: 1.05,

  // Bonus d'impulsion verticale quand on oriente vers le haut
  jumpUpAngleBonus: 1.45,

  // Durée maximale de chargement du saut avec Espace (en secondes, au moins 4s pleines)
  jumpChargeTime: 4.8,

  // Distance maximale d'accroche des ventouses/griffes aux surfaces (en px)
  gripDistance: 24,

  // Seuil angulaire (produit scalaire) déclenchant le retournement automatique sur saisie inversée
  gripAngleTolerance: -0.15,

  // Intensité de l'arche visuelle Oméga lors de la contraction (0 = tout plat, 1 = normal, 2 = très haut)
  omegaArchVisual: 1.0,

  // Amplitude de l'ondulation physique larvaire naturelle (0 = aucun wiggle, 40 = très ondulant)
  wigglePhysicsAmount: 24,

  // Échelle des paires de griffes en overflow (taille visuelle)
  clawScale: 1.35,

  // Affichage des aides visuelles Q et D en superposition sur le personnage
  showBadgesOverlay: true,

  // Autoriser l'orientation verticale (↑ / ↓) pendant la charge Espace
  bendCanOrientVertically: true,

  // Multiplicateur de puissance d'orientation pendant la charge Espace
  bendOrientationPower: 0.50,

  // Vitesse de déploiement / détente du corps au relâchement
  unbendExtensionSpeed: 8.0,

  // Poussée sur la surface au décollage
  groundPushForce: 1.05,

  // En l'air sans appui : déploiement élastique pur sans saut magique
  airborneExtensionOnly: true,

  // Bonus de portée d'extension maximale au déploiement
  unbendReachBonus: 1.0,

  // Préserver la posture et courbure du corps pendant la charge (ne pas écraser en barre droite)
  preserveShapeOnBend: true,

  // Nom du preset actuellement chargé
  activePreset: 'arcade_dynamique'
};

const STORAGE_KEY = 'slipgrip_gameplay_config_v27';
const USER_DEFAULT_KEY = 'slipgrip_user_default_config_v27';

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

// Initialise avec les réglages sauvegardés s'ils existent
loadSavedGameplayConfig();
