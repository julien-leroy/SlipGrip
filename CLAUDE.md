# SlipGrip — carte du code

Jeu de course multijoueur en physique molle (chenilles Verlet). Vision et état réel : `concept.md` (la section 5 liste les bugs connus).
Branche de travail : jamais directement sur `main`.

## Lancer & vérifier

```bash
node server.js            # http://localhost:8090 (PORT=xxxx pour changer)
for f in server.js js/*.js; do node --check "$f"; done
```

- Aucune dépendance npm. Chromium et Playwright sont disponibles dans l'environnement cloud. Le jeu s'expose sur `window.slipGripGame` : on peut piloter une partie (`ui.showScreen`, `startSoloMode()`, `network.createRoom()`…) et mesurer (`update(dt)`, `draw()`).
- **Après toute modif** : `node tools/smoke-test.js`.
- Physique de la chenille : `node tools/fuzz-branch.js [parties] [secondes]` (entrées aléatoires autour d'une branche, compte les images où le corps la traverse ; `SEED=n` pour varier). `node tools/species-bench.js` mesure reptation, saut et marche en boucles par espèce. Le script lance son propre serveur et vérifie la reptation, le fouet, le coût d'une image, le multi à 2, les réglages de room, la reconnexion et le popup d'arrivée.
- Test multijoueur manuel : 2 contextes navigateur ; l'un appelle `network.createRoom(...)`, l'autre `network.joinRoom(code, ...)`, puis l'hôte appelle `network.updateRoomConfig({cupId})` et `network.startCup()`.

## Pièges connus (à lire avant toute modif)

- **Imports** : ne jamais ajouter de suffixe `?v=` aux imports. `./x.js?v=1` et `./x.js?v=2` créent deux instances de module distinctes, donc un `GAMEPLAY_CONFIG` en double et deux moteurs audio. Le serveur envoie déjà `no-store`.
- `GAMEPLAY_CONFIG` est un objet mutable partagé, persisté en localStorage.
  - En multi, `applyRoomGameplayConfig` repart des défauts, applique les réglages de room et met la config perso de côté.
  - `restoreSoloGameplayConfig` remet la config perso de côté en place (dans `startSoloMode`).
  - `saveGameplayConfig` ne sauvegarde rien tant qu'une config de room est active.
- Dégâts des projectiles : c'est la **victime** qui les applique, en rejouant le lancer reçu par `entity_throw`. Ne jamais aussi envoyer de `pvp_action` pour un projectile, sinon les dégâts sont doublés.
- Reconnexion : le serveur donne un `resumeToken` (stocké dans sessionStorage) et garde la place 30 s (`RECONNECT_GRACE_MS`). Côté serveur, `handleWsMessage` peut renvoyer un autre objet client après une reprise de session.
- Physique de la chenille : 6 sous-étapes à pas variable (`dt` limité à 1/30 dans `Caterpillar.update`, 0,05 dans `main.loop`). Beaucoup de coefficients sont appliqués par sous-étape sans `dt`. Le monde (`PhysicsWorld.update`) n'a pas de sous-étapes.
- Espèces : toujours passer par `getSpecies()` (= `CATERPILLAR_CLASSES[bodyType]`). Les champs sont documentés en tête de `CATERPILLAR_CLASSES`. `contractStyle: 'omega'` active `applyOmegaLoop` (géométridé).
- Anti-traversée : `keepBodyOutsideSegments` en fin de chaque sous-pas, et `updateAnchor` lâche une ventouse plutôt que de recoller le pied à travers une branche. Tout code qui déplace des nœuds doit passer avant `handleWorldCollisions`.
- Après un saut ou un champignon, `noGripTimer` empêche les ventouses (touches encore tenues) de se raccrocher pendant `JUMP_NO_GRIP_TIME`.
- Rendu des branches : largeur dessinée = épaisseur de collision (`drawElevatedStructure`, `drawBarkBranch`). Ne pas ajouter de minimum.
- Progression : ne regarde que X.
- Checkpoints : X dépassé, et la tête au plus 160 px sous le point (`CHECKPOINT_BELOW_TOLERANCE`).
- Arrivée : même règle, et au plus 150 px au-dessus (`FINISH_ABOVE_TOLERANCE`).
- Décoration `sign` : panneau de tutoriel. `world.addDecoration('sign', x, y, 1, 0, 'ligne1\nligne2')`.
- Constantes codées en dur dans `main.js` : mort sous `com.y > 1280`, caméra Y bornée à [-680, 480]. Les props sont réinitialisés sous y = 1250 (`physics.js`).

## Fichiers

| Fichier | Rôle | Points d'entrée |
|---|---|---|
| `server.js` | HTTP statique + WebSocket maison + rooms/coupes/draft | `handleWsMessage` (switch sur `msg.type`), `launchRoomRace`, `concludeRoomRace`, `startRoomDraftTimer`, `CUPS_CATALOG` (contient 4 alias dupliqués), `ALL_MODIFIER_IDS` |
| `js/main.js` | Classe `SlipGripGame` : boucle, entrées clavier, caméra, HUD, checkpoints, sync multijoueur | `update`, `draw`, `loop`, `loadLevel`, `startSoloMode`, `startMultiplayerRace`, `serializeWorldState` / `applyRemoteWorldSync` (sync des entités par l'hôte, 12 Hz), `applyRemoteEntityThrow`, `bindMultiplayerWorldCallbacks`, `checkCheckpoints`, `triggerVictory`, `pauseGameLoop` / `resumeGameLoop` |
| `js/caterpillar.js` | Chenille : physique Verlet, ventouses, saut, fouet, lancers, rendu, sérialisation réseau | `update` (entrées, charge, sous-étapes), `onReleaseSpace` (saut / détente / fouet), `stepPhysics` (~1 400 lignes), `handleWorldCollisions`, `updateAnchor`, `releaseAnchor` (lancers), `checkWhipMeleeCollisions`, `takeDamage`, `applyBodyClass` / `getModifierStats`, `draw` + `draw*`, `serializeState` / `applyRemoteState` / `updateRemote` |
| `js/physics.js` | `MATERIALS`, `PhysicsWorld` : segments statiques, plateformes dynamiques, champignons, ennemis (puceron / hérisson / fourmi), props, pommes, bonus, eau, sève, projectiles | `addPolyline`, `addDynamicPlatform`, `addAphid` / `addHedgehog` / `addAnt`, `addProp`, `update`, `damageEnemy`, `findClosestSurface`, `getAllSegmentsNear` (scan linéaire) |
| `js/levels.js` | `LEVEL_DEFINITIONS` (12 niveaux, fonctions `build(world)` impératives) + `LevelRenderer` | `drawBackground` / `initParallaxPacks` / `drawParallaxLayer` (calques pré-redimensionnés via `getScaledImage`, cache libéré par `releaseScaledBackgrounds`), `drawWorld`, dessins d'ennemis et de structures |
| `js/gameplayConfig.js` | `CATERPILLAR_CLASSES`, `BODY_SHAPES`, `GAMEPLAY_CONFIG` / `GAMEPLAY_PRESETS`, `RACE_MODIFIERS`, `CUPS_DEFINITIONS`, `COSMETICS_CATALOG` + déblocage (localStorage) | |
| `js/uiManager.js` | Écrans (home / lobbies / room / game), atelier, salon, HUD de course multi, draft, podium | `showScreen`, `bindUIEvents`, handlers `network.on(...)` dans le constructeur, `escapeHtml` |
| `js/network.js` | Client WebSocket + bus d'événements `on` / `emit` | `handleMessage`, `send*` |
| `js/audio.js` | Sons synthétisés (Web Audio), singleton `sound` | |
| `js/particles.js` | Particules + popups texte | `spawnPopup`, `spawnConfetti` |
| `tools/smoke-test.js`, `tools/fuzz-branch.js`, `tools/species-bench.js` | Tests headless (Playwright) : bout en bout, anti-traversée, mesures par espèce | |
| `index.html` / `styles.css` | DOM de l'application d'une seule page (ancien modal cosmétique + labo de réglages encore présents) | |

## Modèle multijoueur actuel

- Le serveur relaie les messages sans les vérifier : il n'a pas d'autorité sur la physique.
- Chaque client simule sa chenille, plus une copie complète du monde.
- La chenille locale est diffusée à 25 Hz (`player_state`). Les chenilles distantes sont lissées vers le dernier état reçu.
- L'hôte diffuse ennemis, props et plateformes à 12 Hz (`world_sync`). Les autres clients l'écrasent localement, sans jamais renvoyer leurs propres dégâts.
- Messages : `create_room`, `join_room`, `update_profile`, `update_room_config`, `start_cup`, `player_state`, `world_sync`, `entity_throw`, `pvp_action`, `player_finished`, `select_modifier`, `next_cup_race`, `return_to_lobby`.

## Assets

- Seuls les fichiers réellement chargés sont conservés :
  - `assets/backgrounds/` : calques de fond par pack, composites du mode éco, `ancient_forest_1920x1080.jpg` ;
  - `assets/sprites/game/` : 4 icônes de bonus et la pomme dorée.
- Tout le reste du rendu (terrain, ennemis, chenilles, décor) est procédural, en Canvas.
- Les anciennes sources (sprites, maquettes) sont dans l'historique git de `main`.
