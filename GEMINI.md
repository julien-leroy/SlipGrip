# 📚 SLIPGRIP — GUIDE DE RÉFÉRENCE & CARTOGRAPHIE (GEMINI.md)

Ce document sert d'**index architectural haute densité** pour les assistants IA (Argon, Pro, Flash).
Il permet d'orienter immédiatement les interventions chirurgicales dans le code sans avoir à analyser l'intégralité des fichiers, garantissant une **économie massive de tokens** et une précision maximale.

---

## ⚡ 1. RÈGLES D'OR DU PROJET & WORKFLOW

1. **Branche Git Principale :**
   - Travailler **exclusivement sur la branche `main`**. Ne jamais changer de branche sans demande explicite de l'utilisateur.
2. **Cycle de Vie & Performance (Lazy Loading & Sommeil) :**
   - Le moteur physique et le rendu du monde (`#game-canvas`) sont **en veille** (`isGameRunning = false`, classe `.sleeping`) sur la page d'accueil, l'atelier et les salons.
   - Ils ne sont réveillés que pendant une partie active (`inGame` via `showScreen('game')`).
   - Dès qu'une course se termine ou que le joueur revient au menu, couper la boucle de jeu (`pauseGameLoop()`).
3. **Validation Systématique :**
   - Toujours exécuter `node -c server.js js/*.js` après toute modification pour garantir zéro erreur de syntaxe.
4. **Cache-Busting des Scripts :**
   - Les modules ES dans `index.html`, `js/main.js`, `js/uiManager.js` utilisent une chaîne de version (ex: `?v=99`). Incrémenter si un fichier importé est modifié.
5. **Technologie Pure Vanilla :**
   - Pure ES Modules côté client, Node.js + WebSocket (`ws`) côté serveur. Aucun bundler (Webpack, Vite), aucun framework externe.

---

## 🗺️ 2. CARTOGRAPHIE DES FICHIERS & RESPONSABILITÉS

```
SlipGrip/
├── GEMINI.md              # Ce document (guide d'orchestration et annuaire des fonctions)
├── index.html             # Structure DOM unique (Single Page App, HUD, modales, écrans)
├── styles.css             # Feuilles de style (thème cartoon bois/forêt, boutons, HUD, podiums)
├── server.js              # Serveur Node.js HTTP + WebSocket (salons, coupes, draft, synchronisation)
└── js/
    ├── main.js            # Orchestrateur client (classe SlipGripGame, cycle de vie, boucle de jeu, caméra)
    ├── caterpillar.js     # Simulation physique molle Verlet de la chenille (saut, grip, locomotion, inputs)
    ├── physics.js         # Moteur physique 2D, collisions polylines, plateformes dynamiques, entités
    ├── levels.js          # Définitions des niveaux (3 Coupes de 3 courses, parcours, obstacles)
    ├── gameplayConfig.js  # Presets de gameplay, constantes physiques, définitions des Coupes & backgrounds
    ├── uiManager.js       # Gestion des écrans (Accueil, Salons, Lobby, Atelier cosmétique, HUD, Draft)
    ├── network.js         # Client WebSocket (gestion des messages réseau, reconnexion, ping/latence)
    ├── particles.js       # Système de particules 2D (confettis, boue, plumes, étoiles, popups texte)
    └── audio.js           # Moteur audio synthétique Web Audio API (procédures sonores sans assets audio)
```

---

## 🔍 3. DÉTAIL DES FICHIERS & POINTS D'ENTRÉE

### `js/caterpillar.js` (~4970 lignes) — Le Cœur du Gameplay
*Physique molle Verlet, contrôle moteur et anatomie de la chenille.*
- **Constructor & Reset (`lines ~60-250`) :** Initialisation des $N$ nœuds, ancres avant/arrière, masses, longueurs au repos (`extendedSegLen`, `contractedSegLen`).
- **Ancrage & Adhérence (`lines ~600-750`) :** `setRearHold(hold)`, `setFrontHold(hold)`. Gestion du collage des segments aux parois d'accroche.
- **Barre d'Espace & Contraction (`lines ~1020-1130`) :**
  - **Charge de saut :** Nécessite $\ge 0.50\text{s}$ pour un saut réel (`canJump`).
  - **Anti-Spam Espace (<0.20s) :** Recul immédiat obligatoire de tous les segments (`nodes.x -= facingSign * recoil`) + minuteur de pénalité de 0,35s interdisant la vitesse avant.
- **Physique Sub-Steppée (`lines ~1500-2400`) :** `stepPhysics(dt)`. Verlet integration, amortissement visqueux, répulsion, maintien de la colonne dorsale (`naturalArchThrust`), propulsion au sol.
- **Lancer d'Objets & Ennemis (`lines ~715-810`) :** Éjection de pucerons, hérissons, glands et rivales avec inertie et visée directionnelle.
- **Rendu Visuel (`lines ~3800-4800`) :** Dessin des sphères corporelles, dégradés, yeux expressifs, pattes articulées, casquettes et chapeaux.

### `js/physics.js` (~1560 lignes) — Le Monde & Les Collisions
*Gestionnaire de collision polyline et entités dynamiques.*
- **`PhysicsWorld` :**
  - `addPolyline(points, material, opts)` : Ajout de segments de sol ou branches.
  - `addDynamicPlatform(config)` : Plateformes mobiles, balanciers pendulaires, feuilles oscillantes, couteaux à bascule (Seesaw).
  - `addMushroom(x, y, radius, bounceSpeed, angle)` : Champignons tremplins rebondissants.
  - `addAphid(x, y, radius, minX, maxX)` & `addHedgehog(...)` : Ennemis patrouilleurs.
  - `addProp(type, x, y, scale)` : Glands légers et pommes de pin lourdes.
  - `addPowerUp(x, y, type)` : Bonus (Plume, Vitesse, Force, Bouclier).
- **Résolution des Collisions (`lines ~400-800`) :** Calcul distance point-segment, projection normale, adhérence selon matériau (`friction`, `grip`).

### `js/main.js` (~1620 lignes) — L'Orchestrateur Principal
*Cycle de vie du client, boucle principale et caméra.*
- **Cycle de Vie (Lazy-Loading) (`lines ~80-100 & 1585-1610`) :**
  - `pauseGameLoop()` : Coupe `requestAnimationFrame` et efface `#game-canvas` hors partie.
  - `resumeGameLoop()` : Réveille la boucle de jeu uniquement quand l'écran est `'game'`.
  - `loop(now)` : Exécution sous condition `this.isGameRunning`.
- **Démarrage des Modes de Jeu (`lines ~400-520`) :**
  - `startSoloMode()` : Entraînement solo, charge le niveau à la demande.
  - `startMultiplayerRace(msg)` : Synchronise les joueurs, réinitialise la progression de coupe, lance la cinématique.
- **Caméra Intelligente (`lines ~1520-1560`) :** Caméra à zone morte (Deadzone) pour éviter les saccades lors des contractions de la chenille.

### `js/levels.js` (~2760 lignes) — Circuits & Coupes
*Définitions des parcours et décors.*
- **`CUPS_DEFINITIONS` :** 3 Coupes officielles (9 niveaux progressifs) :
  1. *Coupe Bourgeons (Facile)* : Sous-bois, jardin, ponts de soie.
  2. *Coupe Rosée (Moyen)* : Lianes oscillantes, pucerons, sauts champignons.
  3. *Coupe Écorce (Difficile)* : Ravins profonds, ronces, plateformes mobiles.
- **Backgrounds par Coupe :** Chaque coupe possède son propre jeu de décors (`bgSet` partagé par ses 3 maps).
- **Structure Déclarative :** Fonctions `extractDeclarativeMap(level)` et `buildFromDeclarative(world, data)`.

### `js/uiManager.js` (~1600 lignes) — L'Expérience Utilisateur
*Écrans, ateliers, modales et overlays.*
- **Gestionnaire d'Écrans (`showScreen(name)`) :** Gère la transition entre `'home'`, `'lobbies'`, `'room'`, `'game'`. Met automatiquement en veille ou réveille le canvas `#game-canvas`.
- **Atelier & Cosmétiques (`lines ~900-1250`) :** Palettes de couleurs, types de corps (larve, velue, épineuse), chapeaux déblocables.
- **Podium Prévisualisation (`drawPreviewCanvases`) :** Animation autonome et ultra-légère de la chenille sur le podium d'accueil, sans faire tourner le moteur physique lourd.
- **Draft de Modificateurs (`lines ~1400-1550`) :** Système de rattrapage entre les courses de coupe pour les joueurs en retard.

### `server.js` (~1040 lignes) — Serveur Multijoueur
*WebSocket et arbitrage des parties.*
- **Salons de Jeu (`RoomManager`) :** Création par code 4 chiffres, gestion de l'hôte, sélection de coupe.
- **Synchronisation en Course :** Diffusion des positions interpolées, états d'arrivée, lancers d'entités et actions PvP.
- **Fin de Coupe & Récompenses :** Podium final et attribution des cosmétiques débloqués.

---

## 🎯 4. MATRICE DE ROUTAGE TÂCHE $\to$ FICHIER $\to$ LIGNES

Pour toute demande de l'utilisateur, consulter directement le fichier et la zone indiqués :

| Demande Utilisateur | Fichier à Ouvrir | Fonctions / Variables Cibles | Lignes Indicatives |
| :--- | :--- | :--- | :--- |
| **Comportement de saut / charge Espace** | `js/caterpillar.js` | `update(dt)`, `onReleaseSpace` | `~1025 - 1140` |
| **Anti-spam Espace / Recul arrière** | `js/caterpillar.js` | Condition `pressTime < 0.20`, `spamPenaltyTimer` | `~1080 - 1105` |
| **Accroche / Adhérence des pattes (murs, sols)** | `js/caterpillar.js` | `findClosestGripCandidate`, `setFrontHold`, `setRearHold` | `~600 - 750` |
| **Vitesse de reptation / Ramper au sol** | `js/caterpillar.js` | `stepPhysics`, forces `crawlPush`, `vt` | `~1750 - 1775` |
| **Matériaux de sol (glisse, rebond, accroche)** | `js/physics.js` | Objet `MATERIALS` (`friction`, `grip`) | `~20 - 70` |
| **Création / Ajustement d'obstacles ou maps** | `js/levels.js` | `LEVEL_DEFINITIONS`, méthodes `build(world)` | `~50 - 2700` |
| **Variables physiques globales (gravité, raideur)** | `js/gameplayConfig.js`| `GAMEPLAY_CONFIG`, `GAMEPLAY_PRESETS` | `~10 - 150` |
| **Arrière-plans et Coupes** | `js/gameplayConfig.js` & `js/levels.js` | `CUPS_DEFINITIONS`, `bgSet` | `~160 - 230` |
| **Écrans du site, Menus, Popups, Boutons** | `js/uiManager.js` & `index.html` | `initDOM()`, `showScreen()`, listeners boutons | `~40 - 550` & HTML |
| **Performance d'accueil / Mise en veille du jeu** | `js/main.js` & `js/uiManager.js` | `pauseGameLoop()`, `resumeGameLoop()`, `showScreen()` | `main: 1590`, `ui: 845` |
| **Synchronisation réseau / Lag / Salles** | `server.js` & `js/network.js` | Protocoles WS, `Room`, `sendState()` | `server: 300+` |
| **Particules visuelles (confettis, boue, étincelles)**| `js/particles.js` | `spawnConfetti`, `spawnMud`, `draw` | `~50 - 250` |
| **Effets sonores procéduraux** | `js/audio.js` | `playGrip`, `playJump`, `playBounce` | `~60 - 280` |

---

## 🤖 5. STRATÉGIE D'ORCHESTRATION ARGON $\leftrightarrow$ FLASH

Pour préserver le contexte et réduire au maximum la consommation de tokens :

1. **Rôle du Modèle Principal (Argon / Pro) :**
   - Compréhension de l'intention utilisateur et stratégie globale.
   - Arbitrage d'architecture et de game design.
   - Synthèse claire et concise avec l'utilisateur.
2. **Délégation aux Sous-Agents Flash (`Model: 'flash'`) :**
   - **Recherches ciblées :** Trouver l'emplacement exact d'une variable ou fonction via `grep` ou inspection rapide.
   - **Lectures de petits blocs :** Vérifier une signature ou lire une vingtaine de lignes sans polluer le contexte principal.
   - **Vérification de syntaxe :** Lancer `node -c` en sous-agent et renvoyer le résultat concis.
3. **Règle de Localisation Précise :**
   - Ne **jamais** lire un fichier de 4000 lignes en entier. Toujours utiliser `StartLine` et `EndLine` avec `view_file` en se basant sur le tableau de la section 4.
