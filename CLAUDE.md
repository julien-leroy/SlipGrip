# SlipGrip — carte du code

Jeu de course multijoueur en physique molle (chenilles Verlet). Vision et état réel : `concept.md` (la section 5 liste les bugs connus).
`GEMINI.md` est périmé et partiellement faux : ne pas s'y fier.

## Lancer & vérifier

```bash
node server.js            # http://localhost:8090 (PORT=xxxx pour changer)
for f in server.js js/*.js; do node --check "$f"; done
```

- Aucune dépendance npm. Chromium et Playwright sont disponibles dans l'environnement cloud. Le jeu s'expose sur `window.slipGripGame` : on peut piloter une partie (`ui.showScreen`, `startSoloMode()`, `network.createRoom()`…) et mesurer (`update(dt)`, `draw()`).
- Test multijoueur : 2 contextes navigateur ; l'un appelle `network.createRoom(...)`, l'autre `network.joinRoom(code, ...)`, puis l'hôte appelle `network.updateRoomConfig({cupId})` et `network.startCup()`.

## Pièges connus (à lire avant toute modif)

- **Imports** : tous les imports d'un même fichier doivent utiliser **exactement la même URL**. `./x.js?v=73` et `./x.js?v=106` créent deux instances de module distinctes, donc un `GAMEPLAY_CONFIG` en double et deux moteurs audio. Les en-têtes `no-store` du serveur rendent les `?v=` inutiles.
- `GAMEPLAY_CONFIG` est un objet mutable partagé, persisté en localStorage. `startMultiplayerRace` y écrit les réglages de room sans les restaurer ensuite en solo.
- Physique de la chenille : 6 sous-étapes à pas variable (`dt` limité à 1/30 dans `Caterpillar.update`, 0,05 dans `main.loop`). Beaucoup de coefficients sont appliqués par sous-étape sans `dt`. Le monde (`PhysicsWorld.update`) n'a pas de sous-étapes.
- La progression, l'arrivée (`head.x >= finishX`) et les checkpoints ne regardent que X.
- Constantes codées en dur dans `main.js` : mort sous `com.y > 1280`, caméra Y bornée à [-680, 480]. Les props sont réinitialisés sous y = 1250 (`physics.js`).

## Fichiers

| Fichier | Rôle | Points d'entrée |
|---|---|---|
| `server.js` | HTTP statique + WebSocket maison + rooms/coupes/draft | `handleWsMessage` (switch sur `msg.type`), `launchRoomRace`, `concludeRoomRace`, `startRoomDraftTimer`, `CUPS_CATALOG` (contient 4 alias dupliqués), `ALL_MODIFIER_IDS` |
| `js/main.js` | Classe `SlipGripGame` : boucle, entrées clavier, caméra, HUD, checkpoints, sync multijoueur | `update`, `draw`, `loop`, `loadLevel`, `startSoloMode`, `startMultiplayerRace`, `serializeWorldState` / `applyRemoteWorldSync` (sync des entités par l'hôte, 12 Hz), `applyRemoteEntityThrow`, `bindMultiplayerWorldCallbacks`, `checkCheckpoints`, `triggerVictory`, `pauseGameLoop` / `resumeGameLoop` |
| `js/caterpillar.js` | Chenille : physique Verlet, ventouses, saut, fouet, lancers, rendu, sérialisation réseau | `update` (entrées, charge, sous-étapes), `onReleaseSpace` (saut / détente / fouet), `stepPhysics` (~1 400 lignes), `handleWorldCollisions`, `updateAnchor`, `releaseAnchor` (lancers), `checkWhipMeleeCollisions`, `takeDamage`, `applyBodyClass` / `getModifierStats`, `draw` + `draw*`, `serializeState` / `applyRemoteState` / `updateRemote` |
| `js/physics.js` | `MATERIALS`, `PhysicsWorld` : segments statiques, plateformes dynamiques, champignons, ennemis (puceron / hérisson / fourmi), props, pommes, bonus, eau, sève, projectiles | `addPolyline`, `addDynamicPlatform`, `addAphid` / `addHedgehog` / `addAnt`, `addProp`, `update`, `damageEnemy`, `findClosestSurface`, `getAllSegmentsNear` (scan linéaire) |
| `js/levels.js` | `LEVEL_DEFINITIONS` (12 niveaux, fonctions `build(world)` impératives) + `LevelRenderer` | `drawBackground` / `initParallaxPacks` / `drawParallaxLayer` (goulot de perf), `drawWorld`, dessins d'ennemis et de structures |
| `js/gameplayConfig.js` | `CATERPILLAR_CLASSES`, `BODY_SHAPES`, `GAMEPLAY_CONFIG` / `GAMEPLAY_PRESETS`, `RACE_MODIFIERS`, `CUPS_DEFINITIONS`, `COSMETICS_CATALOG` + déblocage (localStorage) | |
| `js/uiManager.js` | Écrans (home / lobbies / room / game), atelier, salon, HUD de course multi, draft, podium | `showScreen`, `bindUIEvents`, handlers `network.on(...)` dans le constructeur, `escapeHtml` |
| `js/network.js` | Client WebSocket + bus d'événements `on` / `emit` | `handleMessage`, `send*` |
| `js/audio.js` | Sons synthétisés (Web Audio), singleton `sound` | |
| `js/particles.js` | Particules + popups texte | `spawnPopup`, `spawnConfetti` |
| `index.html` / `styles.css` | DOM de l'application d'une seule page (ancien modal cosmétique + labo de réglages encore présents) | |

## Modèle multijoueur actuel

- Le serveur relaie les messages sans les vérifier : il n'a pas d'autorité sur la physique.
- Chaque client simule sa chenille, plus une copie complète du monde.
- La chenille locale est diffusée à 25 Hz (`player_state`). Les chenilles distantes sont lissées vers le dernier état reçu.
- L'hôte diffuse ennemis, props et plateformes à 12 Hz (`world_sync`). Les autres clients l'écrasent localement, sans jamais renvoyer leurs propres dégâts.
- Messages : `create_room`, `join_room`, `update_profile`, `update_room_config`, `start_cup`, `player_state`, `world_sync`, `entity_throw`, `pvp_action`, `player_finished`, `select_modifier`, `next_cup_race`, `return_to_lobby`.

## Assets

- Utilisés : `assets/parallax backgrounds/game_background_*/layers/*.png`, `ancient_forest_1920x1080.jpg`, quelques sprites `assets/sprites/game/powerups` et `collectibles`.
- Le reste (`assets/Raw`, `assets/sprites/hires`, `maquettes/`, la plupart de `sprites/game`) n'est jamais chargé.
