🐛 SLIPGRIP — BIBLE DE DESIGN & FICHE TECHNIQUE GLOBALE

Pitch rapide : SlipGrip est un *jeu de course et de plateforme multijoueur basé sur une physique molle (soft-body) où les joueurs incarnent des chenilles expressives. C'est un hybride nerveux et hilarant entre un jeu de plateforme physique d'escalade (façon Getting Over It / Heave Ho) et un party-game de course frénétique avec rattrapage et objets (façon Mario Kart).

🎯 1. CONCEPT & BUT DU JEU
Objectif principal : Dans des championnats en Coupes de 3 courses consécutives, les chenilles doivent franchir des parcours d'obstacles truffés de verticalité, d'ennemis patrouilleurs et de pièges naturels pour franchir la ligne d'arrivée en tête.
Ambiance : Cartoon, organique, forestier et potager géant (sous-bois, canopée, branchages colossaux, miel, rosée, pique-nique abandonné).
Format de compétition :
Points par course : Chaque arrivée attribue des points selon le classement (ex. 10 pts, 6 pts, 4 pts, 2 pts).
Catch-up / Draft de modificateurs : Entre chaque course, les joueurs ayant perdu ou fini en retard choisissent en priorité des cartes de modificateurs (ex. Super Forte, Voltigeuse Aérienne, Sauteuse, Allonge) pour équilibrer la compétition.
Persistance en coupe : Les segments supplémentaires gagnés en mangeant des Pommes Vertes et les bonus de draft restent d'une course à l'autre pendant toute la coupe. À la fin des 3 courses, les scores sont scellés, le podium final sacre le champion, et les récompenses cosmétiques sont débloquées. Seuls les cosmétiques et préférences sont conservés dans le profil ; les bonus de jeu sont réinitialisés pour la coupe suivante.
👥 2. JOUEURS & MULTIJOUEUR
Nombre de joueurs :
Mode Solo : Entraînement libre chronométré sur n'importe quel circuit des 4 Coupes.
Mode Multijoueur : De 1 à 4 joueurs (extensible jusqu'à 8) par salon.
Salons de jeu (Lobbies) :
Salons créés par un code à 4 chiffres (ou liste publique des salons disponibles).
Gestion d'un Hôte qui choisit la Coupe et lance la compétition.
Atelier cosmétique intégré pour choisir son pseudo, sa couleur, son chapeau, sa forme de corps et son style de ventouses.
Architecture Réseau :
Pur Node.js natif + WebSocket (ws RFC 6455), aucun framework lourd (ni Socket.io, ni bundler type Vite/Webpack).
Taux de rafraîchissement réseau à 20-30 Hz avec interpolation côté client.
Synchronisation temps réel des positions de tous les nœuds de la chenille, des objets projetés, des ennemis frappés, des dégâts PvP et des franchissements de ligne.
⚙️ 3. LE MOTEUR PHYSIQUE & LES INTERACTIONS (VERLET)

Le jeu ne repose pas sur une boîte de collision rigide standard : la chenille est une chaîne molle articulée (Verlet Integration) de 
𝑁
N nœuds (5 nœuds de base) reliés par des contraintes de distance élastiques, un maintien de colonne dorsale et des ventouses à adhérence dynamique.

A. La Locomotion & Les Commandes
Double Ventouse (Prises Avant / Arrière) :
Touche Q (ou A) : Verrouille la ventouse arrière (queue) sur la surface la plus proche.
Touche D : Verrouille la ventouse avant (tête / mâchoire) sur la surface la plus proche.
En relâchant la touche, la ventouse lâche prise.
Reptation & Déplacement :
Les flèches directionnelles permettent de faire avancer la tête, de hisser le corps et d'orienter le squelette.
Tension de la queue : Quand la tête avance librement, la queue ne flotte pas en l'air ; elle se laisse traîner naturellement et retombe au sol sous l'effet de la gravité.
Charge du Saut (Barre d'Espace) :
Maintenir Espace comprime le corps en accordéon (stockage d'énergie potentielle).
Charge progressive : Jusqu'à 3.0 secondes pour atteindre la détente maximale.
Anti-Spam Espace : Un appui furtif (< 0.20s) n'accorde aucun saut et inflige une légère pénalité de recul et de friction, empêchant d'avancer plus vite en spammant qu'en marchant.
Le Coup de Fouet (L'Arme de Mêlée Ultime) :
Si la chenille est ancrée par la tête (D maintenu) et qu'elle charge puis relâche Espace, elle ne se détache pas : la queue est catapultée en ligne droite dans la direction visée à plus de 2000 px/s.
C'est l'attaque la plus puissante du jeu : elle inflige 65 à 100+ dégâts, one-shot les pucerons, pulvérise les hérissons sans prendre de dégâts d'épines, interrompt les fourmis et hache les rivaux en multijoueur.
Détente vers la Queue & Correction Anti-Téléportation :
Si le joueur détend son corps vers l'arrière, la queue est projetée vers l'extérieur et vers le bas en pivotant sur la tête, sans jamais faire passer la tête par-dessus la queue ni provoquer de croisement ou téléportation de segments.
Orientation des Griffes & Verrouillage d'Adhérence :
Dès qu'une ventouse s'agrippe à une paroi (sol, tronc vertical, plafond sous une branche), le corps oriente instantanément son ventre et ses pattes face à la surface.
Règle absolue : Tant que la prise est maintenue, la chenille ne se retourne plus de manière intempestive ; elle reste verrouillée à la paroi jusqu'au lâcher-prise.
B. Les Surfaces & Matériaux du Monde

Chaque polyline ou branche du monde possède une friction et une adhérence spécifiques :

Terre & Herbe (dirt) : Sol standard, adhérence normale (friction: 0.90).
Écorce & Grosses Branches (root) : Branches épaisses (50–64px à l'échelle de la chenille), idéales pour grimper à 360°, à la verticale ou la tête en bas.
Branche Mielleuse / Sève Ambrée (honeycomb) : Surface dorée luisante avec gouttes de miel animées. Adhérence maximale (effet Velcro) : empêche totalement de glisser, même sur des pentes verticales ou des bascules instables.
Mousse Humide Glissante (moss) : Surface turquoise brillante avec gouttelettes d'eau. Piège savonneux (friction: 0.08) : même avec les touches Q/D enfoncées, les ventouses glissent le long de la pente !
Ponts de Soie & Lianes (silk) : Lianes tressées souples, légère restitution élastique, adhérence parfaite.
Tiges Botaniques (stem / straw) : Rampes végétales lisses et rapides menant vers les hauteurs.
Plateformes Dynamiques & Bascules (leaf, turnstile, seesaw) : Feuilles oscillantes, tourniquets de brindilles rotatifs et bascules à couteau qui penchent sous le poids des chenilles.
Champignons Tremplins (mushroom) : Dômes rouges rebondissants catapultant la chenille en hauteur.
Eau du Marais : Zones aquatiques à forte flottabilité permettant de nager et rebondir à la surface.
Cascades de Sève : Colonnes ambrées descendantes qui ralentissent la progression sans infliger de dégâts.
C. Interactions Objets, Ennemis & PvP
Joueurs 
↔
↔ Objets :
Glands (légers) : Peuvent être saisis par la tête ou la queue, soulevés avec aisance et projetés avec l'inertie du corps pour briser des obstacles ou frapper des rivaux.
Pommes de pin géantes (lourdes) : Masses imposantes qui roulent sur les pentes sous l'effet du poids des chenilles et peuvent écraser les ennemis sur leur passage.
Pommes Vertes Bonus : Récupérables sur les ennemis vaincus ou cachées sur le parcours : soignent la chenille et ajoutent un segment corporel permanent pour toute la coupe.
Joueurs 
↔
↔ Ennemis :
Pucerons (Aphids) : Petites créatures inoffensives et molles. Peuvent être attrapées, transportées et lancées comme projectiles.
Hérissons (Hedgehogs) : Dangereux de dos (pointes qui infligent 25 dégâts et repoussent), mais saisissables par leur museau inoffensif pour être projetés.
Fourmis (Ants) : Ennemis chasseurs territoriaux. Si une fourmi repère une chenille, elle charge et arme ses mandibules pendant 0,68s pour tenter une projection suplex en arrière (faisant perdre du temps précieux). Le joueur peut la contrer en l'attrapant avant qu'elle n'attaque pour la projeter à son tour.
Récompense de mort : Vaincre un ennemi fait apparaître une pomme verte de soin/croissance.
Joueurs 
↔
↔ Joueurs (PvP) :
En multijoueur, les chenilles peuvent s'agripper entre elles pour s'entraider (former un pont suspendu pour aider un ami) ou se gêner (tirer un adversaire en arrière, lui asséner un coup de fouet, ou lui lancer des ennemis à la figure).
Objets 
↔
↔ Ennemis ("Enemy Bowling") :
Lancer un gland ou une pomme de pin sur un ennemi lui inflige des dégâts d'impact.
Lancer un ennemi sur un autre ennemi déclenche une collision de quilles de bowling avec dégâts mutuels.
🏆 4. CIRCUITS & PROGRESSION (4 COUPES / 12 NIVEAUX)
Coupe des Bourgeons (Facile) : Découverte de l'écorce, ponts de soie, verger fleuri et premiers pucerons.
Coupe des Vents (Moyen) : Lianes suspendues, champignons tremplins, crevasses et hérissons.
Coupe des Titans (Difficile) : Troncs verticaux massifs, ruches de cire mielleuse, cascades de sève, bascules et fourmis agressives.
Coupe de la Canopée (Challenge Extrême) : Niveaux verticaux colossaux (jusqu'à 4500px de hauteur), passages étroits, mousses glissantes au-dessus d'abîmes, tourniquets de brindilles et chemins multiples.
✅ 5. CE QUI FONCTIONNE TRÈS BIEN AUJOURD'HUI
Architecture Pure Vanilla ultra-performante : Zéro bundler, zéro lag de build, pure ES Modules client + Node.js HTTP/WS.
Cycle de Vie & Performance : Le moteur physique et le rendu canvas se mettent automatiquement en veille (isGameRunning = false, CPU < 1%) sur l'accueil, les salons et l'atelier, et ne se réveillent que pendant la course.
Physique Molle & Locomotion : La reptation, la double accroche Q/D, la tension naturelle de la queue, la charge de saut 3s et l'anti-spam sont calibrés et robustes.
Le Coup de Fouet : Fonctionne à merveille comme attaque de mêlée dévastatrice en restant ancré par la tête.
Rendu Visuel Procédural Canvas : Branches épaisses à l'échelle des chenilles (50–64px), textures dynamiques de miel qui dégouline, mousse bleutée avec reflets, yeux expressifs animés, dégradés d'écorce et particules.
Netcode & Compétition : Salons multijoueurs, synchronisation WS, système de score, draft de modificateurs et podium final.
⚠️ 6. CE QUI EST INCOMPLET / CE QUI NE FONCTIONNE PAS ENCORE BIEN
Fonctionnalité des Espèces / Classes de Chenilles :
Dans le code (gameplayConfig.js), des classes existent (Classique, Arpenteuse Géante à 6 segments, Mastodonte Sumo incapable de sauter, Voltigeuse, Monarque).
Problème actuel : En jeu, le système de sélection de classe dans l'Atelier / Lobby n'applique pas de manière assez claire et équilibrée les mécaniques spécifiques (certains joueurs peuvent se retrouver bloqués avec une classe qui ne saute pas sur des maps verticales, et le retour visuel/UI de l'espèce choisie manque de netteté en multijoueur). Le système de classes mérite une refonte ou une intégration plus claire (ex. traits passifs clairs plutôt que pénalités bloquantes).
Sprites vs Rendu Canvas :
Des tentatives d'importation de sprites externes ont été faites, mais leur intégration découpée jurait avec le style fluide du jeu. Les sprites externes sont actuellement désactivés au profit du rendu procédural HTML5 Canvas (hormis les icônes d'items/pommes).
Équilibrage de la difficulté verticale :
Certains niveaux très hauts peuvent être punitifs si une chenille rate une prise et retombe tout en bas sans plateforme de rattrapage intermédiaire.
🚀 7. ROADMAP & CE QU'ON AIMERAIT AJOUTER PAR LA SUITE
Textures "Rubans" Réutilisables :
Remplacer les dégradés procéduraux par des textures illustrées transparentes et répétables horizontalement (format seamless 512x128) pour habiller l'écorce de chêne, la mousse givrée et les ponts de liane.
Mode Spectateur / Caméra Dynamique :
Quand un joueur termine la course en premier, sa caméra bascule automatiquement sur les joueurs encore en lice pour suivre la bataille pour la 2e et 3e place.
Refonte Claire des Espèces :
Rendre les espèces sélectionnables sous forme de compétences actives équilibrées (ex. une capacité spéciale utilisable une fois par course avec temps de recharge, plutôt que des malus bloquants).
Nouveaux Ennemis & Éléments Interactifs :
Des toiles d'araignées élastiques qui ralentissent, des gouttes de pluie/rosée lourdes qui tombent des feuilles, ou des courants d'air ascendants dans la canopée.
🛠️ 8. RAPPEL D'ARCHITECTURE TECHNIQUE
SlipGrip/
├── index.html             # Structure DOM unique (SPA : Accueil, Lobbies, Salon, Jeu, HUD)
├── styles.css             # Feuilles de style (Thème bois/forêt, boutons cartoon, overlays)
├── server.js              # Serveur HTTP + WebSocket natif (RFC 6455), gestion des rooms et coupes
└── js/
    ├── main.js            # Orchestrateur client (Boucle principale, entrées Q/D/Espace, caméra)
    ├── caterpillar.js     # Moteur physique Verlet de la chenille, locomotion, coup de fouet, lancers
    ├── physics.js         # Moteur physique 2D du monde, polylines, ennemis (fourmis, hérissons), items
    ├── levels.js          # Définitions des 4 Coupes (12 circuits) et moteur de rendu LevelRenderer
    ├── gameplayConfig.js  # Constantes physiques, presets, définitions des Coupes & cosmétiques
    ├── uiManager.js       # Gestionnaire d'écrans, atelier cosmétique, podiums et draft
    ├── network.js         # Client WebSocket, sérialisation et interpolation des paquets réseau
    ├── particles.js       # Système de particules 2D (bulles de sève, confettis, terre, étoiles)
    └── audio.js           # Moteur audio synthétique procédural (Web Audio API sans assets audio)

Règle absolue pour tout assistant IA intervenant sur le code : Travailler exclusivement sur la branche main, ne jamais réveiller le canvas du jeu hors d'une partie active, respecter le cache-busting des scripts (?v=XX) et toujours valider avec node -c server.js js/*.js.
