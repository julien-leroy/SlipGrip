// js/gameplayConfig.js — Configuration centralisée du Gameplay & Physique de SlipGrip
// Vous pouvez modifier directement les valeurs ci-dessous ou utiliser le panneau ⚙️ en jeu !

export const CATERPILLAR_CLASSES = {
  classique: {
    id: 'classique',
    name: 'Chenille Classique',
    subtitle: 'L’Équilibrée',
    desc: 'Squelette anatomique 5 segments, maniement naturel de la tête, reptation souple.',
    pro: 'Corps organique fluide, tête agile, zéro tremblement.',
    con: 'Reptation passive au sol lente (privilégier l’arpentage).',
    badge: '⚖️ Équilibrée',
    numNodes: 5,
    extendedSegLen: 34,
    contractedSegLen: 20,
    radii: [8.5, 9.8, 10.2, 9.5, 10.2],
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
    desc: 'Corps longiligne et souple capable de franchir de grands gouffres.',
    pro: '+25% d’Extension, excellente portée pour saisir au loin.',
    con: 'Corps plus fin, glisse davantage sur la mousse.',
    badge: '📏 Longue Portée',
    numNodes: 5,
    extendedSegLen: 42,
    contractedSegLen: 20,
    radii: [7.5, 8.8, 9.2, 8.5, 9.2],
    massMult: 0.80,
    reachMult: 1.25,
    jumpMult: 0.95,
    chargeSpeedMult: 1.15,
    agilityMult: 1.15,
    gripExtraDistance: 8
  },
  dodue: {
    id: 'dodue',
    name: 'Larve Dodue (Colosse)',
    subtitle: 'L’Ancre Inébranlable',
    desc: 'Grosse chenille trapue bien rembourrée, lourde et stable.',
    pro: '+40% de Masse, ancrage rocheux solide, inertie puissante.',
    con: 'Portée raccourcie, levage de tête plus pesant.',
    badge: '🦣 Colosse / Sumo',
    numNodes: 5,
    extendedSegLen: 28,
    contractedSegLen: 18,
    radii: [12.0, 14.0, 14.8, 13.8, 14.5],
    massMult: 1.40,
    reachMult: 0.80,
    jumpMult: 1.10,
    chargeSpeedMult: 0.85,
    agilityMult: 0.85,
    gripExtraDistance: 2
  },
  voltigeuse: {
    id: 'voltigeuse',
    name: 'Voltigeuse Aérienne',
    subtitle: 'L’Acrobate Vif',
    desc: 'Chenille nerveuse et aérodynamique conçue pour l’orientation rapide.',
    pro: '+25% Vitesse de charge, orientation vive de la tête.',
    con: 'Plus légère, rebonds plus vifs.',
    badge: '⚡ Acrobate Vif',
    numNodes: 5,
    extendedSegLen: 34,
    contractedSegLen: 20,
    radii: [8.5, 9.5, 10.0, 9.2, 10.0],
    massMult: 0.90,
    reachMult: 1.0,
    jumpMult: 1.05,
    chargeSpeedMult: 1.30,
    agilityMult: 1.30,
    gripExtraDistance: -2
  }
};

export const GAMEPLAY_PRESETS = {
  arcade_dynamique: {
    name: 'Arcade Dynamique (Recommandé)',
    desc: 'Tête agile et réactive, corps suivant naturellement, contraction douce et zéro tremblement.',
    gravity: 740,
    groundSnapping: 1.5,
    orientationUpForce: 1650,
    orientationResponsiveness: 1.45,
    orientationHeadSpan: 2,
    orientationRearSpan: 2,
    jumpBoost: 1.10,
    jumpUpAngleBonus: 1.25,
    jumpChargeTime: 3.5,
    gripDistance: 26,
    gripAngleTolerance: -0.15,
    omegaArchVisual: 0.75,
    wigglePhysicsAmount: 4,
    maxGroundCrawl: 26,
    clawScale: 1.35,
    showBadgesOverlay: true,
    bendCanOrientVertically: true,
    bendOrientationPower: 0.55,
    bendContractSpeed: 11.0,
    unbendExtensionSpeed: 14.0,
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
  orientationUpForce: 1750,

  // Vitesse de réaction à l'orientation des flèches
  orientationResponsiveness: 1.45,

  // Nombre de segments avant mobilisés pour lever la tête (1 à 3)
  orientationHeadSpan: 2,

  // Nombre de segments arrière mobilisés pour lever la queue quand l'avant est accroché
  orientationRearSpan: 2,

  // Multiplicateur général de puissance du bond au relâchement d'Espace (avec vraie inertie)
  jumpBoost: 1.10,

  // Bonus d'impulsion verticale quand on oriente vers le haut
  jumpUpAngleBonus: 1.25,

  // Durée maximale de chargement du saut avec Espace (en secondes)
  jumpChargeTime: 3.5,

  // Distance maximale d'accroche des ventouses/griffes aux surfaces (en px)
  gripDistance: 26,

  // Seuil angulaire (produit scalaire) déclenchant le retournement automatique sur saisie inversée
  gripAngleTolerance: -0.15,

  // Intensité de l'arche visuelle Oméga lors de la contraction (0 = tout plat, 1 = normal, 2 = très haut)
  omegaArchVisual: 0.75,

  // Amplitude de l'ondulation physique larvaire naturelle (0 = aucun wiggle, très calme et doux)
  wigglePhysicsAmount: 4,

  // Vitesse maximale de reptation passive au sol avec les flèches seules (très lente, privilégie l'arpentage)
  maxGroundCrawl: 26,

  // Échelle des paires de griffes en overflow (taille visuelle)
  clawScale: 1.35,

  // Affichage des aides visuelles Q et D en superposition sur le personnage
  showBadgesOverlay: true,

  // Autoriser l'orientation verticale (↑ / ↓) pendant la charge Espace
  bendCanOrientVertically: true,

  // Multiplicateur de puissance d'orientation pendant la charge Espace
  bendOrientationPower: 0.55,

  // Vitesse de contraction douce du corps au clic Espace (marche d'arpenteuse)
  bendContractSpeed: 11.0,

  // Vitesse de déploiement / détente du corps au relâchement
  unbendExtensionSpeed: 14.0,

  // Poussée sur la surface au décollage avec bonne inertie physique
  groundPushForce: 1.10,

  // En l'air sans appui : déploiement élastique pur sans saut magique
  airborneExtensionOnly: true,

  // Bonus de portée d'extension maximale au déploiement (vrai détente du squelette pour attraper au loin)
  unbendReachBonus: 1.20,

  // Fenêtre de tolérance (sec) pour relâcher l'accroche et bénéficier de l'élan de détente
  anchorReleaseMomentumWindow: 0.30,

  // Préserver la posture et courbure du corps pendant la charge (ne pas écraser en barre droite)
  preserveShapeOnBend: true,

  // Nom du preset actuellement chargé
  activePreset: 'arcade_dynamique'
};

const STORAGE_KEY = 'slipgrip_gameplay_config_v42';
const USER_DEFAULT_KEY = 'slipgrip_user_default_config_v42';

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
