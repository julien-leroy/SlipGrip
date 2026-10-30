# 🐛 SLIPGRIP — Bible de design

> **Comment lire ce document.** Les sections 1 à 4 décrivent la **vision** (ce que le jeu doit être).
> La section 5 décrit **l'état réel du code**, vérifié en exécutant le jeu (navigateur headless, partie solo et partie à 2 joueurs) et en lisant l'intégralité des sources le 30/10/2026.
> Chaque affirmation de la section 5 est vérifiable. Quand la vision et le code divergent, c'est le code qui fait foi pour l'état actuel.
> L'ancienne version de ce document présentait comme « fonctionnant très bien » plusieurs systèmes qui sont cassés ou absents. Ces écarts sont listés en 5.3.

---

## 1. Pitch

Course-plateforme multijoueur en physique molle (Verlet) : chaque joueur incarne une chenille qui avance par **reptation et ventouses**, saute en se comprimant comme un ressort, et peut **fouetter, attraper et lancer** ennemis, objets et rivaux.

- **Références de ressenti** : *Getting Over It* / *Heave Ho* (contrôle physique exigeant, chutes drôles) × party-game de course (rattrapage, objets, chaos entre amis).
- **Ambiance** : sous-bois cartoon à hauteur d'insecte (écorce, miel, rosée, mousse, champignons).

## 2. Format de compétition

- **Coupe = 3 courses consécutives.** Points par course : 10 / 6 / 4 / 3 / 2 / 1. Égalité départagée au temps cumulé.
- **Fin de course** : quand le premier joueur franchit l'arrivée, un compte à rebours de 20 s démarre pour les autres. Les non-arrivés sont classés par progression.
- **Draft de rattrapage** entre deux courses : tous les joueurs sauf le vainqueur choisissent 1 carte parmi 3 (15 s, choix automatique sinon).
- **Persistance pendant la coupe** : cartes draftées + segments gagnés via pommes « segment ». Tout est réinitialisé à la coupe suivante ; seuls les cosmétiques sont conservés dans le profil.
- **Modes** : Solo (entraînement chronométré, record local par niveau) et Multijoueur (salon à code 4 chiffres, hôte qui choisit la coupe et les réglages, 2 à 8 joueurs).

## 3. Contrôles & mécaniques de la chenille

| Entrée | Effet |
|---|---|
| **Q** (ou A) maintenu | Ventouse **arrière** (queue) s'accroche à la surface la plus proche ; relâcher = lâcher prise |
| **D** maintenu | Ventouse **avant** (tête) s'accroche |
| **Flèches** | Orientent / avancent la tête, hissent le corps |
| **Espace** maintenu puis relâché | Compression en accordéon puis détente (saut). Charge pleine en ~3 s. Un relâchement < 0,5 s ne déclenche pas de saut |
| **Espace** pendant que **D** tient la tête | **Coup de fouet** : la queue est projetée dans la direction visée (attaque de mêlée) |
| C / R | Retour au dernier checkpoint (R = recommencer le niveau en solo) |
| T / Tab | Labo de réglages physiques (outil de développement) |

- **Anti-spam** : taper Espace rapidement est plus lent que marcher (vérifié : ~16 px/s contre ~28 px/s).
- **Verrou d'orientation** : tant qu'une ventouse tient, la chenille ne se retourne pas.
- **Points de vie** : 100 PV ; à 0 PV ou en tombant dans le vide → retour au checkpoint (perte de temps, pas d'élimination).
- **Le corps ne traverse jamais une branche.** Une ventouse qui se retrouverait de l'autre côté lâche prise.

### 3bis. Espèces

Chaque espèce change réellement la physique. Les valeurs sont dans `CATERPILLAR_CLASSES` et mesurées par `tools/species-bench.js` sur sol plat :

| Espèce | Gabarit | Reptation | Saut chargé (haut. / dist.) | Particularité |
|---|---|---|---|---|
| **Classique** | 5 segments, référence | 90 px/s | 78 / 96 px | équilibrée |
| **Voltigeuse** | fine, légère (×0,6) | **160 px/s** | 71 / 83 px | ventouses de longue portée, gravité ×0,85, plane un peu en tombant ; projetée loin par les coups |
| **Mastodonte** | grosse et longue, 6 segments, lourde (×1,8) | 46 px/s | **107 / 130 px** | charge lente, encaisse les coups, plus lourde à hisser |
| **Arpenteuse** (géométridé) | longue et fine, 6 segments | 71 px/s | — | **se plie en boucle Ω** : ses segments ne raccourcissent pas, ses deux ventouses se rejoignent et le dos s'arque (pattes avant 47 px, boucle 101 px de haut). Elle avance par boucles à **~120 px/s** (voir ci-dessous) |
| **Monarque** | standard | 90 px/s | 77 / 92 px | ne glisse pas sur la mousse ; aussi rapide aux murs et au plafond qu'au sol |

**Marche de l'arpenteuse** : D (tête accrochée), Espace maintenu (la queue remonte sous la boucle), Q (queue accrochée), lâcher D puis Espace. Le corps se déroule loin devant. Avec la queue tenue, relâcher Espace déroule la boucle au lieu de bondir.

L'espèce est verrouillée pendant une coupe multijoueur. En solo, changer d'espèce relance le niveau.

## 4. Monde, ennemis, objets (vision)

- **Surfaces** : terre, écorce/racine, miel (adhérence maximale), mousse (glissante même en s'agrippant), soie/lianes, tiges ; plateformes dynamiques (feuilles oscillantes, bascules, tourniquets) ; champignons tremplins ; eau (flottaison) ; cascades de sève (ralentissent).
- **Ennemis** : pucerons (inoffensifs, projectiles), hérissons (piquants de dos, saisissables par le museau), fourmis (chargent puis tentent une projection après 0,68 s d'armement ; contrable en les attrapant d'abord).
- **Objets** : glands (légers, cassables, projectiles), pommes de pin (lourdes, roulent, écrasent), bonus temporaires (vitesse, force, plume, bouclier), pommes de soin et pommes « segment ».
- **Interactions** : lancer un ennemi ou un objet sur un ennemi ou un rival (« bowling »), s'agripper à un rival pour l'aider ou le gêner.
- **Coupes** (4 × 3 niveaux, 12 au total) :
  1. **Bourgeons** (facile) : L'Orée des Pousses, Les Ponts de Lianes, Le Verger Fleuri
  2. **Vents** (moyen) : La Grotte aux Spores, Le Gouffre Poids-Plume, La Falaise des Cimes
  3. **Titans** (difficile) : Le Tronc des Titans, La Ruche & les Cires, Le Festin des Tempêtes
  4. **Fourmilière Royale** (maître) : L'Ascension du Grand Chêne Creux, L'Arbre Brisé & le Grand Plongeon, La Citadelle des Racines

---

## 5. État réel du projet (audit du 30/10/2026)

Légende : ✅ fonctionne · ⚠️ partiel / fragile · ❌ cassé ou absent

### 5.1 Tableau de bord

| Domaine | Statut | Constat |
|---|---|---|
| Boucle course → résultats → draft → course → podium | ✅ | Testé à 2 joueurs de bout en bout |
| Salons, code à 4 chiffres, liste publique | ✅ | Pas de vérification des données reçues côté serveur |
| Anti-spam Espace | ✅ | Spammer est plus lent que marcher |
| Mise en veille du moteur hors course | ✅ | Boucle arrêtée sur l'accueil |
| Réglages de room de l'hôte (saut, accroche) | ✅ | Corrigé en phase 1. En multi, tout le monde joue avec la même physique (défauts + réglages de room) ; la config perso est restaurée en solo |
| Labo de réglages (T) | ✅ | Corrigé en phase 1. Effet immédiat en solo, verrouillé en multijoueur |
| Bouton muet | ✅ | Corrigé en phase 1 (un seul moteur audio) |
| Reconnexion réseau | ✅ | Corrigé en phase 1. La place est gardée 30 s et le joueur reprend avec le même identifiant ; au-delà, il est renvoyé à l'accueil avec un message |
| Ennemis / objets en multijoueur | ❌ | Un ennemi tué par un non-hôte est ressuscité par l'hôte ; les pommes peuvent être ramassées par tous ; les plateformes ne sont pas réellement synchronisées |
| Dégâts PvP par projectile | ⚠️ | Appliqués par la victime, qui rejoue le lancer reçu. Le code mort qui aurait doublé les dégâts a été retiré. Reste fragile : l'objet lancé est retrouvé par proximité, sans identifiant |
| Coup de fouet | ⚠️ | **Figeait le jeu** au premier fouet (variable inexistante dans le rendu) et durait ~6× trop longtemps : les deux sont corrigés en phase 1. Restent : la queue est téléportée et peut traverser les murs ; pas de protection contre les piquants de hérisson ; dégâts PvP 12–34 |
| Matériaux de surface | ❌ | Les valeurs de friction ne sont pas utilisées par la physique : terre, soie et miel se comportent pareil. Seule la mousse est un cas spécial, et elle ne glisse pas à plat |
| Champignons tremplins | ✅ | Le rebond était réduit à 58 % et étouffé par les ventouses ; c'est désormais un vrai tremplin |
| Fourmis | ⚠️ | Le minuteur d'armement tourne pendant l'approche, donc pas de fenêtre de contre réelle |
| Ennemis vaincus → pomme | ⚠️ | Toujours une pomme de **soin** ; les pommes **segment** ne sont que 3 secrets placés à la main |
| Espèces | ✅ | Refondues : chaque caractéristique est lue par la physique (section 3bis), boucle Ω pour l'arpenteuse, silhouette propre à chaque espèce, verrouillées pendant une coupe |
| Corps qui traverse une branche | ✅ | Corrigé : 0 traversée sur 600 parties aléatoires (`tools/fuzz-branch.js`), contre 16 sur 200 avant |
| Sauts | ✅ | Ils étaient étouffés : la ventouse se raccrochait au sol tant que Q restait enfoncé, et une vitesse maximale globale égalisait toutes les espèces. Les deux sont corrigés |
| Draft de bonus | ⚠️ | La même carte peut être prise plusieurs fois et les multiplicateurs se composent (ex. 2× « Petite & Ultra-Rapide » ≈ 2,8× la vitesse de saut) |
| Cadeau cosmétique du champion | ❌ | Tous les joueurs reçoivent un cadeau aléatoire, pas seulement le champion ; l'ancien modal permet d'équiper des cosmétiques verrouillés |
| Performance | ✅ | Corrigé en phase 1. Les calques du fond sont pré-redimensionnés une seule fois ; une image complète coûte ~1,5 ms (contre ~20 ms avant) |
| Mobile / tactile | ❌ | Seules les ventouses Q/D sont cliquables ; jeu jouable au clavier uniquement |
| Rendu procédural | ✅ | Le jeu dessine tout en Canvas ; les sprites ne servent qu'aux bonus et aux pommes |

### 5.2 Bugs prioritaires (par gravité)

> **Phase 1 appliquée** (branche `claude/audit-concept`). Points corrigés : 1, 2, 4 (nettoyage + modèle victime), 5, 6 (checkpoints : on ne valide plus un checkpoint en passant loin en dessous ; le plus avancé est conservé), 7.
> Corrigés en plus : le gel du jeu au premier coup de fouet, et le lien `red_apple.png` manquant.
> Vérification : `node tools/smoke-test.js`.

1. **Modules chargés en double.** `main.js` et `uiManager.js` importent avec `?v=106`, `caterpillar.js` et `physics.js` avec `?v=73`. Le navigateur charge alors deux instances distinctes de `gameplayConfig.js`, `physics.js` et `audio.js`. Conséquences : réglages de room ignorés, labo T inopérant, deux moteurs audio. Le serveur envoie déjà `Cache-Control: no-store`, donc ces suffixes ne servent à rien et doivent disparaître.
2. **Reconnexion** : à la reconnexion le serveur attribue un nouvel identifiant et a déjà retiré l'ancien de la room, alors que le client se croit toujours en partie.
3. **Autorité multijoueur des entités** : chaque client simule son propre monde. L'hôte écrase PV et position des ennemis, mais n'apprend jamais les dégâts infligés par les autres joueurs. Les objets lancés sont retrouvés « au plus proche » au lieu d'un identifiant.
4. **Projectiles PvP** : `physics.js` passe `proj.kind` (une chaîne) là où `main.js` attend l'objet projectile, donc `sendPvpAction` n'est jamais appelé.
5. ~~**Coup de fouet**~~ (corrigé) : `whipCrackTimer` est décrémenté du pas de sous-étape une seule fois par frame, ce qui fait durer le fouet ~6× trop longtemps.
6. **Arrivée et checkpoints basés sur X seulement** : un checkpoint s'active dès que la tête dépasse sa position horizontale, quelle que soit la hauteur. Sur les niveaux 10 et 12, marcher sur le « toit » permet probablement d'atteindre l'arrivée sans faire le parcours (à confirmer en jeu). La barre de progression stagne pendant les montées.
7. **Popup d'arrivée d'un rival** : affiche « termine undefinede » (le serveur envoie `finishOrder`, le client lit `rank`).
8. **Physique dépendante du framerate** : nombreux coefficients appliqués « par sous-étape » sans tenir compte de `dt` ; le monde n'a pas de sous-étapes, donc les objets rapides traversent les branches fines.
9. **Ennemis tombés dans le vide** : ils ne sont jamais supprimés ni réinitialisés.
10. **Serveur** : aucune limite de taille de trame WebSocket, pas de ping/heartbeat, cosmétiques et temps d'arrivée acceptés sans vérification. C'est acceptable entre amis en LAN, pas sur Internet.

### 5.3 Écarts entre l'ancienne version de ce document et le code

- « Niveaux verticaux colossaux jusqu'à 4500 px de hauteur » : faux. Les niveaux 1 à 9 font 4 300 à 6 000 px de **large** pour ~450 px de haut ; les niveaux 10 à 12 font ~1 100 px de haut.
- « Coupe de la Canopée » : la 4ᵉ coupe s'appelle Fourmilière Royale dans le code. Les troncs verticaux, cascades de sève et tourniquets attribués aux Titans n'existent que dans cette 4ᵉ coupe.
- « Bascules à couteau » : il n'existe pas de bascule. Ce sont des feuilles oscillantes avec un angle plus grand.
- « Mousses glissantes au-dessus d'abîmes » : la mousse n'est utilisée que sur 2 segments dans tout le jeu.
- « Le coup de fouet pulvérise les hérissons sans prendre de dégâts d'épines » : faux, voir 5.1.
- « Vaincre un ennemi fait apparaître une pomme verte de croissance » : la pomme ne fait que soigner.
- « Synchronisation des ennemis frappés et des dégâts PvP » : voir 5.2-3 et 5.2-4.
- « Interpolation côté client » : c'est un lissage vers la dernière position reçue, sans tampon d'interpolation.
- « Architecture vanilla ultra-performante » : le code est léger, mais le rendu du fond est le goulot d'étranglement principal.
- `GEMINI.md` décrit un format de niveaux déclaratif (`extractDeclarativeMap` / `buildFromDeclarative`) qui n'existe pas, 3 coupes au lieu de 4, et des numéros de ligne périmés. Ce fichier a été supprimé et remplacé par `CLAUDE.md`.

### 5.4 Dette technique (constat chiffré)

- `caterpillar.js` : 5 600 lignes, dont `stepPhysics` = 1 400 lignes. Environ la moitié est constituée de cas particuliers empilés (une douzaine de drapeaux comme `launchedFromHead`, `isTailDetente`, `isSteeredTowardTail`… qui expriment des variantes de la même chose) et de forces qui se contredisent.
- `levels.js` : 4 500 lignes ; le moteur de rendu (3 100 lignes) est mélangé aux données des niveaux.
- `physics.js` : logique pucerons / hérissons / fourmis copiée-collée à ~85 %.
- **Assets** : le dépôt contenait ~41 Mo d'images dont ~36 Mo jamais chargées. Le nettoyage de la phase 1 n'a gardé que les 28 fichiers réellement utilisés (4,8 Mo, dans `assets/backgrounds` et `assets/sprites/game`). Les sources restent dans l'historique git de `main`.

---

## 6. Critique du gameplay et du game design

### 6.1 Trous dans la raquette des contrôles (constatés dans le code, encore ouverts)

1. **Marcher aux flèches rend les ventouses facultatives.** Sans aucune ventouse, la flèche → fait ramper jusqu'à ~58 px/s par nœud. Sur le plat, Q et D ne servent à rien, alors qu'ils sont l'identité du jeu. Les ventouses ne deviennent utiles que sur les pentes, les murs et les plafonds.
   - *Proposition* : réduire fortement la reptation libre (un simple tortillement de secours) et récompenser le cycle ventouses + contraction par une vraie foulée. C'est déjà le cas pour l'arpenteuse, qui va 5 fois plus vite en boucles qu'aux flèches.
   - **C'est la décision de design la plus importante à prendre** : elle change tout le ressenti.
2. **Les flèches sont absolues à l'écran**, pas relatives au corps. La tête en bas sous une branche, ← reste « gauche de l'écran » et ↑ peut pousser dans la paroi.
   - *Proposition* : → = « vers la tête », ↑ = « loin de la surface ».
3. **↓ fait quatre choses différentes** selon l'état :
   - queue tenue : la tête se plaque ;
   - tête tenue : la queue descend ;
   - en l'air : rotation ;
   - libre : rien.
4. **Relâcher Espace (après 0,5 s de charge) la tête accrochée déclenche toujours un coup de fouet.** Il est impossible de sauter depuis une prise de tête.
5. **Adhérence sans ventouse** (lu dans le code, pas encore vérifié en jeu) : le corps colle aux murs et aux plafonds (gravité redirigée vers la surface) même sans tenir Q ou D. Grimper ne demande donc pas les ventouses.
6. **Aucun retour visuel** quand un saut échoue faute d'appui, ni sur la pénalité anti-spam, ni sur le seuil des 0,5 s de charge.
7. **Deux systèmes de saut se superposent** :
   - détente immédiate au relâchement d'Espace ;
   - « élan » si l'on lâche une ventouse dans les 0,3 s qui suivent.

   Le second donne les plus grands sauts mais il est invisible pour le joueur.

### 6.2 Game design

1. **Le rythme est trop lent pour un party-game.**
   - Un niveau de 4 300 à 5 800 px représente 1 à 3 minutes.
   - Le compte à rebours de 20 s après le premier arrivé coupe la plupart des joueurs.
   - *Proposition* : viser des courses de 60 à 90 s, avec un compte à rebours proportionnel à la durée de la course. Le nouveau niveau 1 fait 4 100 px.
2. **Le draft ne rattrape pas vraiment.** Tous les joueurs sauf le premier reçoivent des cartes de même puissance, et une même carte se cumule sans limite.
   - *Proposition* : une carte au plus par type, et une puissance qui dépend de l'écart de points.
3. **Les espèces** sont maintenant différenciées par leur physique (3bis). On pourrait aller plus loin avec une compétence active par espèce, sur une touche dédiée avec recharge. Par exemple :
   - le Mastodonte : un « Choc » au sol ;
   - la Voltigeuse : une détente aérienne.
4. **Le multijoueur a besoin d'un modèle d'autorité simple** :
   - chaque entité appartient à l'hôte, puis à celui qui la saisit ;
   - les événements circulent par identifiant ;
   - les dégâts PvP sont appliqués par la victime.
5. **Le classement des non-arrivés par position X** est injuste sur les niveaux verticaux. Il faut une progression le long d'un tracé.
6. **Niveaux 2 à 9 : même squelette**, avec un sol à strates, une cuvette, un champignon et un pont. La difficulté monte surtout en ajoutant des épines.
   - Chaque niveau devrait introduire **une** idée, enseignée sans danger avant d'être exigée, comme dans le nouveau niveau 1 avec ses panneaux.
   - Mécaniques jamais enseignées : épines (niveau 4), miettes collantes (niveau 8), tourniquets et cascades de sève (niveau 10).
7. **Le décor manque de profondeur.**
   - Pas de premier plan devant la chenille.
   - Le sol est une masse de strates identiques.
   - Les décorations sont espacées mécaniquement.
   - *Prochaines étapes* : un calque de premier plan, une palette par niveau plutôt que 4 thèmes, et du sol pré-rendu en cache.

## 7. Feuille de route proposée

**Phase 1 — Réparer les fondations** (aucun changement de ressenti voulu) :

- imports uniques sans `?v=` ;
- reconnexion avec reprise de session ;
- popup d'arrivée ;
- minuteur du fouet ;
- envoi des projectiles PvP ;
- checkpoints et arrivée avec contrôle de hauteur ;
- cache du fond parallaxe (objectif < 2 ms par image) ;
- `.gitignore` et nettoyage des assets inutilisés.

**Phase 2 — Multijoueur fiable** :

- identifiants d'entités partagés ;
- propriété des entités et événements de dégâts et de ramassage ;
- dégâts PvP côté victime ;
- interpolation à tampon ;
- validation et limites côté serveur ;
- ping/heartbeat.

**Phase 3 — Design** :

- ~~refonte des espèces~~ (fait) ;
- ~~niveau tutoriel~~ (fait : niveau 1) ;
- reptation libre réduite et contrôles relatifs au corps (6.1, à trancher) ;
- rythme des courses ;
- draft de rattrapage (6.2) ;
- matériaux réellement différenciés (friction utilisée par la physique) ;
- progression le long d'un tracé ;
- une idée nouvelle par niveau pour les niveaux 2 à 9.

**Phase 4 — Contenu et finition** :

- mode spectateur après l'arrivée ;
- contrôles tactiles ;
- nouveaux éléments (toiles élastiques, gouttes de rosée, courants ascendants) ;
- textures « rubans » pour les branches ;
- cadeau cosmétique réservé au champion.

**Refactor en continu**, à faire au fil des phases plutôt qu'en une fois :

- découper `caterpillar.js` (ancrages, locomotion, saut, fouet, collisions, réseau, rendu) ;
- remplacer les drapeaux par une machine à états unique ;
- un seul tableau de définition pour les ennemis ;
- séparer données de niveaux et rendu.

## 8. Architecture

Voir **`CLAUDE.md`** pour la carte détaillée des fichiers, les points d'entrée et les pièges connus.
Stack : Node.js natif (HTTP + WebSocket RFC 6455 maison), modules ES côté client, Canvas 2D, Web Audio procédural. Aucune dépendance, aucun bundler.
