import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const gameData = [
  {
    title: "Elden Ring",
    publisher: "Bandai Namco Entertainment",
    description: "FromSoftware and George R.R. Martin together crafted an open-world masterpiece that redefines the action RPG genre. Set in the vast Lands Between, players explore a shattered realm filled with ancient ruins, haunting dungeons, and breathtaking vistas. The game offers unprecedented freedom — you can tackle areas in any order, discover hidden bosses, and piece together a fragmented narrative through environmental storytelling. Combat is methodical and punishing yet immensely satisfying, with a vast arsenal of weapons, spells, and abilities at your disposal. The world is interconnected in clever ways, rewarding exploration with secrets around every corner. With its haunting atmosphere, challenging encounters, and deep lore, Elden Ring stands as a landmark achievement in game design.",
    highlights: [
      "Massive open world with 6 distinct regions to explore freely",
      "Over 200 unique boss encounters and enemy types",
      "Deep RPG customization with 8 starting classes and hundreds of weapons",
      "Seamless multiplayer with cooperative and invasion mechanics",
      "George R.R. Martin's mythic world-building woven into every corner",
      "Multiple endings based on your choices throughout the journey"
    ]
  },
  {
    title: "The Legend of Zelda: Breath of the Wild",
    publisher: "Nintendo",
    description: "Nintendo reimagined the beloved Zelda franchise as a breathtaking open-air adventure that shattered conventions. Hyrule is a living, breathing playground where every mountain is climbable, every puzzle solvable in multiple ways, and every moment holds the potential for discovery. The chemistry engine allows for creative problem-solving — set grass on fire to create updrafts, use metal weapons as lightning rods during storms, or simply cook meals to survive the harsh wilderness. The story follows Link awakening from a century-long slumber to defeat Calamity Ganon, but the journey is entirely yours to define. From the gentle piano melodies to the painterly art style, every element works in harmony to create an unforgettable sense of wonder.",
    highlights: [
      "Seamless open world with complete freedom of exploration",
      "Innovative chemistry engine enables limitless creative solutions",
      "Over 100 Shrines offering unique physics-based puzzles",
      "Dynamic weather and climate system affects gameplay",
      "Every surface is climbable and every direction is accessible",
      "Masterful soundtrack that adapts to your journey"
    ]
  },
  {
    title: "Cyberpunk 2077",
    publisher: "CD Projekt Red",
    description: "Night City is a sprawling dystopian metropolis brought to life with incredible detail and density. You play as V, a mercenary navigating a world where technology has blurred the line between human and machine. The main storyline offers branching narratives with meaningful choices, while countless side quests reveal the stories of the city's colorful inhabitants. Combat is versatile — hack enemy cybernetics, unleash devastating smart weapons, or rely on stealth and social engineering. The recent 2.0 update and Phantom Liberty expansion have transformed the experience, fixing launch issues and adding deep new systems. The writing is sharp, the world is immersive, and the atmosphere is unmatched in modern gaming.",
    highlights: [
      "Dense, vertical open world with six distinct districts",
      "Deep character customization with three life paths",
      "Advanced cyberware system with unique augmentations",
      "Branching narrative with multiple endings",
      "Stunning ray-traced visuals and immersive first-person perspective",
      "Phantom Liberty expansion adds a spy-thriller campaign"
    ]
  },
  {
    title: "God of War Ragnarök",
    publisher: "Sony Interactive Entertainment",
    description: "The epic Norse saga reaches its stunning conclusion in this masterfully crafted action-adventure. Kratos and his son Atreus journey through all Nine Realms, each visually distinct and filled with secrets, to prevent the prophesied end of the world. The combat has been refined with new weapons, elemental abilities, and a deeper focus on Atreus as a playable character. The story tackles themes of destiny, parenthood, and redemption with surprising emotional depth. The Leviathan Axe and Blades of Chaos return with expanded movesets, and the new Draupnir Spear adds fresh tactical options. Every realm is handcrafted with jaw-dropping art direction, making this one of the most visually stunning games ever released.",
    highlights: [
      "All Nine Realms explorable with unique environments and lore",
      "Refined combat with three signature weapons and elemental powers",
      "Playable Atreus segments with distinct magical abilities",
      "Deep cinematic storytelling with emotional character arcs",
      "Accessible difficulty options without sacrificing challenge",
      "Stunning visual fidelity pushing PS5 hardware to its limits"
    ]
  },
  {
    title: "Baldur's Gate 3",
    publisher: "Larian Studios",
    description: "Larian Studios has delivered what many consider the greatest CRPG ever made, faithfully adapting Dungeons & Dragons 5th Edition rules into an interactive masterpiece. The game begins with a mind flayer tadpole implanted in your brain, setting you on a quest for a cure that spirals into an epic conflict spanning the Sword Coast. Every decision matters — dialogue choices, combat approaches, and even your class and race open or close countless possibilities. The companion system is extraordinary, with fully voiced characters who have their own agendas, romances, and moral compasses. The turn-based combat is deep and tactical, with environmental interactions, verticality, and creative spell combinations. With hundreds of hours of content and player freedom that borders on the absurd, BG3 is a landmark achievement.",
    highlights: [
      "Full D&D 5E ruleset with 12 classes and 46 subclasses",
      "Deep companion system with 10 unique origin characters",
      "Unprecedented player freedom with countless branching paths",
      "Turn-based tactical combat with environmental interactions",
      "Over 174 hours of cinematics and fully voiced dialogue",
      "Split-screen and online co-op for up to 4 players"
    ]
  },
  {
    title: "Hogwarts Legacy",
    publisher: "Warner Bros. Games",
    description: "The Wizarding World comes to life in this expansive open-world RPG set in 1800s Hogwarts. Players create their own witch or wizard, attend classes, learn spells, and uncover a hidden threat to the magical world. The castle itself is a marvel of design — every painting, secret passage, and moving staircase from the books is recreated with loving detail. Beyond the castle walls, the Scottish highlands offer villages, forests, and caves to explore on foot or by broomstick. The spell system is satisfying, with combat requiring quick reflexes and smart combinations. Room of Requirement customization, magical beast collection, and relationship quests provide hundreds of hours of content for Harry Potter fans.",
    highlights: [
      "Faithfully recreated Hogwarts castle with every iconic location",
      "Learn and master over 30 spells with distinct combat applications",
      "Explore the Scottish highlands, Hogsmeade, and forbidden forests",
      "Customizable Room of Requirement with crafting and gardening",
      "Broomstick flight and magical beast mounting for traversal",
      "Morality system with choices affecting your house and reputation"
    ]
  },
  {
    title: "The Witcher 3: Wild Hunt",
    publisher: "CD Projekt Red",
    description: "Geralt of Rivia's final chapter is widely celebrated as one of the greatest RPGs of all time. The war-torn Northern Realms are brought to life with moral complexity, where monster contracts often involve difficult choices between lesser evils. The main quest to find Ciri intersects with dozens of memorable side stories, each written with novelistic quality. Combat blends swordplay with signs (magic) and alchemy, rewarding preparation and adaptability. The Blood and Wine expansion alone rivals full games in scope, introducing the sun-drenched land of Toussaint. With its rich characters, grey morality, and world that reacts to your choices, The Witcher 3 set a new standard for narrative-driven RPGs.",
    highlights: [
      "Vast open world spanning war-torn regions and untouched wilderness",
      "Over 100 hours of main and side content with novel-quality writing",
      "Two massive expansions: Hearts of Stone and Blood and Wine",
      "Deep alchemy and preparation system for monster hunting",
      "Meaningful choices with consequences that ripple through the world",
      "Gwent — the beloved collectible card game within the game"
    ]
  },
  {
    title: "Red Dead Redemption 2",
    publisher: "Rockstar Games",
    description: "Rockstar's magnum opus is a peerless open-world Western that sets a new benchmark for immersion and storytelling. You play as Arthur Morgan, an outlaw grappling with his morality as the Wild West fades into modernity. The world is alive in ways no game has matched — animals have their own ecosystems, NPCs follow daily routines, and the weather shapes gameplay naturally. The camp system creates genuine emotional bonds with your gang members, making every loss hit hard. The Honor system subtly shifts dialogue, missions, and even the ending based on your actions. From the snow-capped mountains of Ambarino to the humid swamps of Lemoyne, every inch of this world tells a story. It is a patient, detail-obsessed masterpiece.",
    highlights: [
      "Unmatched open-world detail with dynamic animal ecosystems",
      "Deep honor system affecting dialogue, missions, and ending",
      "Camp system with 20+ gang members featuring individual story arcs",
      "Cinematic storytelling with motion-captured performances",
      "Vast map spanning 5 distinct states with unique biomes",
      "Over 200 species of animals with realistic behavior patterns"
    ]
  },
  {
    title: "Ghost of Tsushima",
    publisher: "Sony Interactive Entertainment",
    description: "Sucker Punch's love letter to samurai cinema is a stunning open-world action game set during the first Mongol invasion of Japan. You play as Jin Sakai, a samurai who must abandon his noble code to defend his homeland using unconventional tactics. The world of Tsushima is breathtaking — fields of pampas grass sway in the wind, cherry blossoms drift through the air, and the guiding wind mechanic replaces cluttered waypoints with elegant navigation. Combat is precise and lethal, with standoffs that capture the tension of a samurai duel. The Kurosawa Mode filters the entire game into black and white, complete with film grain, as a tribute to classic cinema. The Iki Island expansion deepens Jin's backstory with emotional weight.",
    highlights: [
      "Stunning open world inspired by classic samurai cinema",
      "Innovative guiding wind navigation system replaces mini-maps",
      "Dual combat styles: honorable samurai and stealthy ghost",
      "Standoff mechanic for dramatic, high-stakes duels",
      "Kurosawa Mode — full game playable in black and white",
      "Haiku writing, hot springs, and bamboo cutting as meditative side activities"
    ]
  },
  {
    title: "Final Fantasy XVI",
    publisher: "Square Enix",
    description: "The latest mainline Final Fantasy trades turn-based combat for intense real-time action in a dark fantasy epic. Set in the troubled land of Valisthea, the story follows Clive Rosfield on a decades-spanning quest for revenge and redemption. The Eikon battles are spectacular kaiju-sized conflicts that rival God of War set pieces in scale. Combat blends swordplay with magical abilities from each Eikon, allowing for creative combos and devastating special moves. The narrative is mature and politically complex, dealing with themes of slavery, tyranny, and the cost of power. The Active Time Lore system lets you pause to read about characters, locations, and events — a brilliant innovation for complex storytelling.",
    highlights: [
      "Real-time action combat with Eikon-powered abilities",
      "Spectacular kaiju-sized Eikon vs Eikon boss battles",
      "Decades-spanning narrative following Clive Rosfield's journey",
      "Active Time Lore system for instant world-building context",
      "Mature political storyline with dark fantasy themes",
      "Stunning visuals powered by the PS5 hardware"
    ]
  },
  {
    title: "Starfield",
    publisher: "Bethesda Softworks",
    description: "Bethesda's first new universe in 25 years delivers a massive space-faring RPG with over 1,000 planets to explore. Create your character, build your ship, and join the constellation faction to uncover humanity's greatest mystery. The main quest is compelling, but the real magic lies in the emergent stories — pirate encounters, faction politics, and random events across the settled systems. Ship building is surprisingly deep, allowing you to design everything from tiny fighters to massive cargo haulers. Outpost construction lets you establish bases for resource extraction and research. While the exploration can feel procedural at times, the hand-crafted content in major cities like New Atlantis and Neon is superb.",
    highlights: [
      "Over 1,000 explorable planets across 100 star systems",
      "Deep ship customization with modular building system",
      "Outpost construction for resource gathering and research",
      "Four major factions with their own questlines and politics",
      "Jetpack traversal with varied gravity environments",
      "NG+ mechanic with unique narrative justification for replaying"
    ]
  },
  {
    title: "Palworld",
    publisher: "Pocketpair",
    description: "The gaming phenomenon that took the world by storm combines creature collecting, survival crafting, and third-person shooting into a wildly addictive package. Capture Pals using special spheres, then assign them to build your base, farm resources, or fight alongside you. The world is filled with dangerous creatures and hostile factions, requiring strategic base placement and resource management. What sets Palworld apart is the sheer variety of activities — ride flying Pals to explore, use them to automate production, or even... employ them in morally questionable ways. The cooperative multiplayer lets friends build together, and the constant content updates keep the experience fresh. It's unpolished in places, but its ambition and fun factor are undeniable.",
    highlights: [
      "Capture and train over 100 unique Pal creatures",
      "Base building with automated Pal labor systems",
      "Open world with dungeons, bosses, and secret areas",
      "Multiplayer co-op for up to 32 players",
      "Weapon crafting from primitive tools to advanced firearms",
      "Rideable Pals for land, air, and sea traversal"
    ]
  },
  {
    title: "Dragon's Dogma 2",
    publisher: "Capcom",
    description: "Capcom's long-awaited sequel expands on the original's innovative pawn system and creature combat. The world is a seamless fantasy realm where emergent encounters constantly surprise — a simple road trip can turn into a battle against a griffin, a cyclops, or a dragon. The pawn system remains the star: AI companions learn from your playstyle and offer genuinely useful advice during quests. Vocations (classes) range from classic Fighter and Mage to the unique Mystic Spearhand and Trickster. The physics-based combat means you can climb monsters, target specific body parts, and even launch enemies into each other. The reactive world remembers your actions, with NPCs commenting on your exploits and quests evolving based on your choices.",
    highlights: [
      "Enhanced pawn system with AI learning and cross-player summoning",
      "10 vocations with unique weapons and playstyles",
      "Physics-based combat with climbable monsters and destructible environments",
      "Seamless open world with dynamic encounters",
      "Multiple travel methods including oxcarts and portcrystals",
      "Ng+ with scaling difficulty and new enemy placements"
    ]
  },
  {
    title: "Helldivers 2",
    publisher: "Sony Interactive Entertainment",
    description: "Arrowhead's co-op shooter became a cultural phenomenon by delivering intense, chaotic, and hilarious squad-based combat. As Helldivers, players are dropped into hostile planets to complete objectives while fighting off alien swarms. Friendly fire is always on, leading to moments of panic and laughter as stratagem beacons land on teammates. The galactic war system creates a persistent meta where player actions determine which planets are liberated or lost. Stratagems — orbital strikes, supply drops, turrets, and mechs — add strategic depth to every mission. The community is remarkable, working together toward shared goals. Regular updates add new enemies, biomes, and equipment, keeping the war effort feeling fresh and meaningful.",
    highlights: [
      "Intense 4-player co-op with permanent friendly fire",
      "Galactic war meta where player actions shape the frontlines",
      "Dozens of stratagems from orbital lasers to mech exosuits",
      "Procedural mission objectives across unique biomes",
      "Three enemy factions with distinct behaviors and weaknesses",
      "Cross-play between PS5 and PC"
    ]
  },
  {
    title: "Tekken 8",
    publisher: "Bandai Namco Entertainment",
    description: "The King of Iron Fist Tournament returns with a visually stunning and mechanically deep entry in the legendary fighting series. The new Heat system adds aggressive offensive options, rewarding players who press the attack with enhanced abilities and recoverable health. The roster balances returning favorites like Jin and Kazuya with exciting newcomers, each with unique playstyles. The story mode is bombastic and cinematic, concluding the long-running Mishima saga with spectacular fights. Online play features excellent netcode with cross-play support. The customization system lets you personalize your fighter's appearance and even create custom move sets. Tekken 8 proves 3D fighters can still innovate while honoring their roots.",
    highlights: [
      "New Heat system adds aggressive offensive mechanics",
      "32-character roster with diverse fighting styles",
      "Rollback netcode with cross-platform online play",
      "Cinematic story mode concluding the Mishima saga",
      "Deep customization with cosmetic and move-set options",
      "Practice mode with frame data display and punishment training"
    ]
  },
  {
    title: "Final Fantasy VII Remake",
    publisher: "Square Enix",
    description: "One of the most beloved JRPGs of all time is reborn with stunning visuals, real-time combat, and expanded storytelling. The game covers the Midgar section of the original, but expands it into a full-length epic with new characters, deeper lore, and surprising narrative twists. Combat blends real-time action with strategic command menus, allowing you to issue orders to your party while dodging and attacking. The summons are spectacular set pieces, and the weapon upgrade system adds meaningful customization. The voice acting is superb, and the soundtrack reimagines Nobuo Uematsu's classic compositions with modern orchestration. It honors the original while boldly charting its own path.",
    highlights: [
      "Real-time hybrid combat with strategic ATB commands",
      "Expanded Midgar with new areas, quests, and characters",
      "Spectacular summon sequences with cinematic flair",
      "Weapon upgrade and materia customization systems",
      "Reimagined soundtrack blending classic themes with modern arrangements",
      "New story elements that expand the original narrative"
    ]
  },
  {
    title: "Dark Souls III",
    publisher: "Bandai Namco Entertainment",
    description: "The culmination of FromSoftware's Souls series delivers refined combat, interconnected worlds, and unforgettable boss encounters. Set in the dying world of Lothric, players must link the First Flame by defeating the Lords of Cinder. The level design is masterful, with shortcuts that loop back on themselves in satisfying ways. Combat is faster and more fluid than previous entries, with weapon arts adding tactical depth to each moveset. The boss roster is among the best in gaming history — from the tragic Yhorm the Giant to the breathtaking Sister Friede. The atmosphere is thick with melancholy beauty, and the cryptic storytelling invites endless interpretation. It is a fitting, triumphant finale to a legendary series.",
    highlights: [
      "Interconnected world design with masterful shortcut placement",
      "Weapon arts system adds unique skills to each weapon",
      "15+ of the best boss fights in gaming history",
      "Deep lore delivered through item descriptions and environment",
      "Extensive equipment with fashion and function options",
      "PvP arenas and covenant-based multiplayer systems"
    ]
  },
  {
    title: "Bloodborne",
    publisher: "Sony Interactive Entertainment",
    description: "FromSoftware traded medieval castles for Victorian Gothic horror in this masterpiece of cosmic terror. Set in the cursed city of Yharnam, players hunt nightmarish beasts while uncovering a conspiracy that reaches into the realm of eldritch gods. Combat is aggressive and risk-reward based — the regain mechanic encourages trading blows, and the trick weapons transform mid-combo for devastating attacks. The art direction is unparalleled, with every corner of Yharnam telling a story of a civilization undone by forbidden knowledge. The Chalice Dungeons offer infinite procedural challenges, while the Old Hunters DLC adds some of the best boss fights ever created. The atmosphere of dread and discovery is unmatched.",
    highlights: [
      "Aggressive combat with the risk-reward regain mechanic",
      "Transformable trick weapons with dual movesets",
      "Gothic Victorian art direction with cosmic horror themes",
      "Chalice Dungeons with procedural co-op exploration",
      "The Old Hunters DLC with legendary boss encounters",
      "Rich Lovecraftian lore hidden in item descriptions"
    ]
  },
  {
    title: "Monster Hunter: World",
    publisher: "Capcom",
    description: "The franchise that broke into the mainstream delivers the ultimate monster hunting experience. Each hunt is a multi-stage battle against colossal creatures with unique behaviors, weaknesses, and ecosystems. The fourteen weapon types offer dramatically different playstyles, from the methodical Great Sword to the agile Insect Glaive. The environments are living ecosystems — monsters hunt, eat, sleep, and fight each other, creating emergent moments that feel unscripted. The crafting loop is addictive: carve materials, forge better equipment, and take on bigger challenges. The Iceborne expansion doubles the content with Master Rank, new monsters, and the Clutch Claw mechanic. The cooperative multiplayer is seamless and rewarding.",
    highlights: [
      "14 weapon types with completely unique combat mechanics",
      "Living ecosystems with monster interactions and turf wars",
      "Deep crafting and armor skill customization system",
      "Seamless 4-player co-op hunts",
      "Iceborne expansion with Master Rank and new mechanics",
      "Event quests with crossover content from other franchises"
    ]
  },
  {
    title: "Metal Gear Solid V: The Phantom Pain",
    publisher: "Konami",
    description: "Hideo Kojima's final Metal Gear game is a masterpiece of emergent stealth gameplay. The open-world design gives players unprecedented freedom in approaching missions — infiltrate at night with silenced weapons, create distractions, call in airstrikes, or simply never be seen at all. The buddy system offers unique allies like DD the wolf pup who grows into a combat companion or Quiet the sniper with supernatural abilities. The base building and staff management systems add strategic depth between missions. The Fox Engine delivers stunning visuals and buttery smooth performance. While the story remains unfinished due to Kojima's departure, the gameplay systems are so refined that the journey itself becomes the destination.",
    highlights: [
      "Emergent sandbox stealth with unlimited creative approaches",
      "Mother Base development with staff recruitment and management",
      "Unique buddy companions each with special abilities",
      "Seamless open-world missions with dynamic weather and time",
      "Robust weapon and equipment customization system",
      "Online FOB infiltration mode for endgame challenges"
    ]
  },
  {
    title: "Death Stranding",
    publisher: "Sony Interactive Entertainment",
    description: "Hideo Kojima's boldest and most divisive game is a genre-defying journey about connection in a fractured world. As Sam Porter Bridges, you must traverse a post-apocalyptic America delivering cargo to isolated settlements. The traversal mechanics are deceptively deep — balance your load, choose your route, and manage your equipment to survive treacherous terrain. The social strand system lets you build structures (roads, zip-lines, bridges) that appear in other players' worlds, creating a unique asynchronous co-op experience. The story is pure Kojima: bizarre, heartfelt, and overflowing with ideas about life, death, and human connection. The soundtrack by Low Roan is perfect, and the performances by Norman Reedus, Mads Mikkelsen, and Lea Seydoux are outstanding.",
    highlights: [
      "Innovative traversal mechanics with deep route planning",
      "Social strand system for asynchronous player collaboration",
      "Stunning Icelandic-inspired landscapes and weather effects",
      "Celebrity cast including Norman Reedus and Mads Mikkelsen",
      "Build roads, ziplines, and structures shared across worlds",
      "Haunting soundtrack by Low Roan and Chvrches"
    ]
  },
  {
    title: "Persona 5",
    publisher: "Atlus",
    description: "The most stylish JRPG ever created fuses dungeon crawling with high school life simulation into an unforgettable 100-hour experience. By day, you're a Tokyo student building relationships, studying for exams, and joining clubs. By night, you're a Phantom Thief, infiltrating the distorted palaces of corrupt adults to steal their hearts. The turn-based combat is the genre's best, with stylish all-out attacks, negotiation with demons, and baton pass mechanics. The soundtrack is a masterclass in jazz fusion that will live in your head rent-free. Every menu, transition, and animation drips with impossible cool. The story tackles heavy themes of rebellion, justice, and systemic corruption with surprising maturity. Persona 5 Royal expands everything with new characters and an additional semester.",
    highlights: [
      "100-hour RPG blending life simulation with dungeon crawling",
      "Stylish turn-based combat with all-out attack finishers",
      "Deep social link system with romance options",
      "Award-winning jazz fusion soundtrack by Shoji Meguro",
      "Persona fusion and customization for strategic depth",
      "Royal edition adds 20+ hours of new story content"
    ]
  },
  {
    title: "Devil May Cry 5",
    publisher: "Capcom",
    description: "The stylish action genre returns to its throne with the most technically accomplished character action game ever made. Three playable characters — Dante, Nero, and the enigmatic V — each offer completely unique combat systems. Nero's mechanical Devil Breaker arms provide a rotating arsenal of special attacks. Dante returns with four fighting styles and a ludicrous weapon inventory. V controls three demon familiars in a playstyle that's entirely unique. The combo potential is infinite, with a deep skill ceiling that rewards creativity. The RE Engine delivers gorgeous visuals at a silky 60fps. The story is pure over-the-top DMC charm, balancing ridiculous action with genuinely touching moments between the Sparda family.",
    highlights: [
      "Three playable characters with completely distinct combat systems",
      "Infinite combo potential with deep mechanical skill ceiling",
      "Dante's 4 fighting styles and arsenal of iconic weapons",
      "Nero's customizable Devil Breaker prosthetic arms",
      "V's unique puppet-master combat with demon familiars",
      "RE Engine visuals at smooth 60fps with ray tracing"
    ]
  },
  {
    title: "Resident Evil 4 Remake",
    publisher: "Capcom",
    description: "Capcom's greatest survival horror game is reborn with modern gameplay while preserving everything that made the original legendary. The over-the-shoulder shooting is tighter than ever, with knife parries adding new defensive options. The Spanish village setting is expanded with more areas to explore and secrets to uncover. The story of Leon Kennedy's rescue mission is presented with new gravitas, with improved voice acting and deeper character moments. The Merchant returns with more upgrades, and the attaché case inventory management is as satisfying as ever. The Separate Ways DLC adds Ada Wong's perspective with unique missions. It honors the original while confidently standing on its own.",
    highlights: [
      "Reimagined classic with modern over-the-shoulder controls",
      "Knife parry and stealth mechanics add new tactical depth",
      "Expanded village and castle areas with new secrets",
      "Improved story presentation with deeper character work",
      "Separate Ways DLC with Ada Wong's complete campaign",
      "Mercenaries mode returns with arcade-style scoring"
    ]
  },
  {
    title: "Street Fighter 6",
    publisher: "Capcom",
    description: "Capcom revitalizes the fighting game genre with the most feature-rich and accessible entry yet. The Drive System is a masterpiece of design — a single resource pool that powers parries, ex moves, dashes, and the devastating Drive Impact. World Tour mode is an open-world RPG where you create your character and learn from master fighters across Metro City. Battle Hub is a digital arcade where players gather to compete, watch matches, and play classic Capcom arcade games. The modern control scheme makes special moves accessible with one button, lowering the barrier to entry without sacrificing depth. The rollback netcode is flawless, and the launch roster of 18 characters is excellent. This is the complete fighting game package.",
    highlights: [
      "Drive System with 5 mechanics from a single resource bar",
      "World Tour open-world RPG mode with character creator",
      "Battle Hub digital arcade with classic Capcom games",
      "Modern controls for accessibility without compromising depth",
      "Flawless rollback netcode for competitive online play",
      "Cross-play across all platforms"
    ]
  },
  {
    title: "Mortal Kombat 1",
    publisher: "Warner Bros. Games",
    description: "NetherRealm reboots the timeline again, and this time the results are spectacular. The story reimagines familiar characters with new backstories and relationships, creating fresh dynamics while honoring MK lore. The Kameo fighter system adds a second character who assists during combat, opening new combo and defensive options. The combat is visceral and weighty, with hits that feel genuinely impactful. The visuals are gorgeous, with detailed character models and brutal finishers. Invasions mode offers a board game-style single-player experience with modifiers and rewards. The roster combines classic characters like Scorpion and Sub-Zero with exciting newcomers. It's the most polished and content-rich MK entry yet.",
    highlights: [
      "Rebooted timeline with reimagined character backstories",
      "Kameo fighter system adds strategic assist options",
      "Invasions mode with seasonal content and rewards",
      "Gore system with detailed flesh and bone damage",
      "Cross-play with rollback netcode",
      "Tutorial system that teaches high-level fighting game concepts"
    ]
  },
  {
    title: "NBA 2K24",
    publisher: "2K Sports",
    description: "The long-running basketball sim returns with refined gameplay and deep career modes. The ProPLAY technology translates real NBA footage into authentic animations, making player movements more realistic than ever. MyCAREER mode lets you build a legacy from rookie to Hall of Famer, with off-court decisions affecting your on-court performance. The City is a massive online hub where you can compete, shop, and hang out with other players. MyTEAM is the addictive card-collecting mode that keeps building your dream squad. While microtransactions remain a sore point, the on-court action has never been better, with improved dribbling, shooting, and defensive mechanics.",
    highlights: [
      "ProPLAY animation technology from real NBA footage",
      "MyCAREER with deep RPG progression and storylines",
      "The City online hub with competitive events",
      "MyTEAM card collecting with challenges and rewards",
      "Improved dribbling and shot stick mechanics",
      "WNBA integration with full league and player models"
    ]
  },
  {
    title: "FC 24",
    publisher: "EA Sports",
    description: "EA's football franchise enters a new era with Hypermotion V technology that captures real match data for authentic animations. The gameplay balance between attacking flair and defensive solidity is the best in years. Ultimate Team remains the most popular mode, with new Evolutions system letting you upgrade your favorite players throughout the season. Career mode receives meaningful updates with improved tactical systems and transfer negotiations. Clubs and Pro Clubs offer deep cooperative experiences. The Frostbite engine delivers lifelike player models and stadium atmospheres. While microtransactions in FUT remain controversial, the on-pitch product is excellent. Cross-play support brings the community together across platforms.",
    highlights: [
      "Hypermotion V with real match data animation capture",
      "Ultimate Team Evolutions system for player progression",
      "Enhanced career mode with deep tactical customization",
      "Cross-play across PlayStation, Xbox, and PC",
      "Frostbite engine with lifelike player models",
      "Women's football integration with leagues and tournaments"
    ]
  },
  {
    title: "Gran Turismo 7",
    publisher: "Sony Interactive Entertainment",
    description: "Polyphony Digital's legendary racing sim returns as a love letter to automotive culture. Over 400 cars, from affordable classics to hypercars, are rendered with obsessive detail both inside and out. The driving physics strike a perfect balance between simulation and accessibility, with a progressive difficulty curve that rewards skill development. The Livery Editor is incredibly deep, allowing for near-infinite customization. The dynamic weather and time-of-day system dramatically affects handling and strategy. The campaign structure, built around the Café menus, introduces players to different car categories and racing disciplines. The Music Rally mode is a creative rhythmic driving experience. GT7 is not just a game but an interactive museum of automotive history.",
    highlights: [
      "Over 400 meticulously detailed cars from 60+ manufacturers",
      "Dynamic weather and time-of-day with real-time transitions",
      "Deep livery editor with community-created designs",
      "Brand Central with historical car exhibitions",
      "PSVR2 support for immersive cockpit driving",
      "DualSense haptic feedback through brake and throttle"
    ]
  },
  {
    title: "Forza Motorsport",
    publisher: "Xbox Game Studios",
    description: "Turn 10's reboot of the flagship racing sim delivers unparalleled realism and technical sophistication. The new tire model simulates 8 contact points per tire, providing unprecedented feedback about grip and temperature. The career mode is built around building affinity with individual cars through practice and races. Dynamic time-of-day and weather create ever-changing track conditions. The ray-traced visuals at 60fps are stunning, with damage modeling that affects both aesthetics and performance. The AI, while still imperfect, races more naturally with the new Drivatar system. The car progression system rewards driving skill rather than grind, making each upgrade feel earned. It's a technical showcase for Xbox Series X.",
    highlights: [
      "8-point tire contact model for realistic handling feedback",
      "Ray-traced visuals at 60fps during gameplay",
      "Dynamic time-of-day and weather on every track",
      "Car leveling system rewards practice and skill",
      "Over 500 cars with detailed interior views",
      "20 meticulously scanned real-world tracks"
    ]
  },
  {
    title: "Alan Wake 2",
    publisher: "Epic Games Publishing",
    description: "Remedy's long-awaited sequel is a genre-defying survival horror masterpiece that blends psychological terror with meta-narrative brilliance. Play as FBI agent Saga Anderson investigating ritualistic murders in the Pacific Northwest, and as Alan Wake himself, trapped in the Dark Place, writing his way out of a nightmare. The dual-campaign structure allows you to switch between characters, with each story informing the other in clever ways. The combat is tense and resource-starved, with light as your primary weapon against the Taken. The live-action sequences are seamless, blending FMV with gameplay in ways only Remedy can pull off. The soundtrack, including a full musical chapter, is unforgettable. It's a singular creative vision executed flawlessly.",
    highlights: [
      "Dual-campaign narrative switching between Saga and Alan",
      "Survival horror combat with light-based weapon mechanics",
      "Live-action FMV sequences blending seamlessly with gameplay",
      "Musical chapter that rivals the best of TV production",
      "Mind Place and Writer's Room investigation mechanics",
      "Entanglement with remedies connected universe"
    ]
  },
  {
    title: "Star Wars Jedi: Survivor",
    publisher: "Electronic Arts",
    description: "Cal Kestis continues his journey in this vastly expanded action-adventure sequel. Five years after Fallen Order, Cal is a more powerful Jedi facing new threats across multiple planets. The combat has been refined with five stances — single blade, double blade, dual wield, blaster, and crossguard — each with unique movesets. The worlds are larger and more open, with optional areas, puzzles, and secrets to discover. The customization is deep, with thousands of combinations for Cal's appearance, lightsaber parts, and BD-1 skins. The story bridges the gap between the prequel and original trilogies with reverence for Star Wars lore. The performance, while improved, still has room for optimization, but the game is a worthy follow-up that expands everything from the original.",
    highlights: [
      "Five lightsaber stances with unique combat movesets",
      "Expanded planets with open exploration and secrets",
      "Deep customization for Cal, lightsaber, and BD-1",
      "NPC companions with their own combat abilities",
      "Starfighter segments for space combat",
      "Connects prequel and original trilogy eras with new lore"
    ]
  },
  {
    title: "Minecraft",
    publisher: "Mojang Studios",
    description: "The best-selling game of all time remains a limitless canvas for creativity and adventure. Its blocky aesthetic has become iconic, but beneath the simple visuals lies a world of staggering depth. Survival mode tasks players with gathering resources, building shelters, and fighting monsters as day turns to night. Creative mode gives god-like powers to build anything imaginable. The Redstone system is essentially a digital logic engine, allowing players to build working computers and complex machinery. Updates have added entire dimensions (the Nether and the End), new biomes, and the deepslate layer. The community has built everything from replicas of fictional cities to functional calculators. Minecraft transcends gaming — it's a platform for creativity.",
    highlights: [
      "Infinite procedurally generated worlds to explore",
      "Creative and Survival modes for different playstyles",
      "Redstone engineering for complex automated systems",
      "Cross-platform play across every device",
      "Constant free updates adding biomes and mechanics",
      "Thriving modding community with endless content"
    ]
  },
  {
    title: "Fortnite",
    publisher: "Epic Games",
    description: "More than a game, Fortnite is a cultural phenomenon that has redefined live-service entertainment. The battle royale mode drops 100 players onto an island where building and shooting skills determine the winner. But Fortnite is also a concert venue, a movie theater, and a social platform. The constant content updates keep the island fresh, with new weapons, vehicles, and mechanics arriving weekly. The collaboration events are unmatched — Marvel characters, Star Wars icons, and real-world musicians like Travis Scott and Ariana Grande have all appeared. The Zero Build mode removed building for players who prefer pure shooting. Save the World's co-op PvE mode offers a different experience. It's free, constantly evolving, and impossible to ignore.",
    highlights: [
      "100-player battle royale with unique building mechanics",
      "Zero Build mode for traditional shooting gameplay",
      "Cross-over events with Marvel, Star Wars, DC and more",
      "Live concerts and in-game events with millions attending",
      "Creative mode for custom game creation and sharing",
      "Seasonal content with battle pass progression"
    ]
  },
  {
    title: "Call of Duty: Modern Warfare III",
    publisher: "Activision",
    description: "The direct sequel to 2022's Modern Warfare II continues the rebooted storyline with mixed results. The campaign is notably short at 3-4 hours, focusing on open combat missions that offer player choice but lack the cinematic polish of previous entries. The real value lies in multiplayer, which launches with all 16 maps from the original Modern Warfare 2 (2009), updated with modern graphics and gameplay. Zombies makes its return as an open-world extraction mode, a fresh take on the beloved co-op format. The gunplay remains the best in the business, with weapons that feel weighty and responsive. While the campaign disappoints, the multiplayer package is robust and will keep fans engaged for months.",
    highlights: [
      "16 remastered MW2 (2009) multiplayer maps at launch",
      "Open-world Zombies extraction mode with co-op",
      "Best-in-class gunplay with responsive weapon handling",
      "War mode returns with objective-based large-scale battles",
      "Deep gunsmith customization with aftermarket parts",
      "Cross-progression across all platforms"
    ]
  },
  {
    title: "Grand Theft Auto V",
    publisher: "Rockstar Games",
    description: "More than a decade after release, GTA V remains a technical marvel and a cultural touchstone. Los Santos is one of the most detailed and believable open worlds ever created, a satirical take on Los Angeles that feels alive with activity. The three-protagonist structure lets you switch between Michael, Franklin, and Trevor on the fly, experiencing heists and missions from multiple perspectives. The writing is sharp and hilarious, skewering modern American culture with surgical precision. GTA Online has evolved into a massive persistent world with heists, businesses, races, and constant content updates. The modding community keeps the single-player experience fresh with everything from graphics overhauls to total conversions. It's a game that refuses to age.",
    highlights: [
      "Three-protagonist system with on-the-fly character switching",
      "Los Santos — a satirical open world still unmatched in detail",
      "GTA Online with constant free updates for a decade",
      "Heists with cooperative multi-stage planning and execution",
      "Modding community with total conversion mods and enhancements",
      "Ray tracing and performance upgrades on current-gen consoles"
    ]
  },
  {
    title: "League of Legends",
    publisher: "Riot Games",
    description: "The world's most played PC game remains a titan of competitive gaming after over a decade. The core 5v5 MOBA gameplay is deceptively simple: destroy the enemy Nexus. But with over 160 champions, each with four unique abilities, the strategic depth is infinite. The constant balance updates and seasonal changes keep the meta evolving. The esports scene is unparalleled, with the World Championship drawing millions of viewers annually. Riot has expanded the universe into other genres with Arcane (the award-winning animated series), Teamfight Tactics (auto-battler), Legends of Runeterra (card game), and VALORANT (tactical shooter). The community is passionate, the competition is fierce, and the gameplay loop remains addictive after thousands of hours.",
    highlights: [
      "160+ champions with completely unique abilities and playstyles",
      "Deep strategic 5v5 gameplay with infinite skill ceiling",
      "Thriving esports scene with massive international tournaments",
      "Expanded universe through Arcane and spin-off games",
      "Regular seasonal updates with new champions and reworks",
      "Free-to-play model with cosmetic-only monetization"
    ]
  },
  {
    title: "Dota 2",
    publisher: "Valve Corporation",
    description: "The deepest and most complex MOBA ever created, Dota 2 rewards mastery with virtually unlimited strategic depth. 120+ heroes each have unique abilities, and the item shop offers hundreds of combinations that can dramatically alter your hero's role. The turn-based strategy elements — creep denying, pulling, stacking, and Roshan control — separate casual players from professionals. The International tournament boasts the biggest prize pools in esports history, crowning world champions each year. The gameplay changes dramatically with each patch, keeping the meta fresh even for veteran players. The learning curve is brutal but the satisfaction of mastering this game is unmatched. It demands everything but rewards dedication like no other.",
    highlights: [
      "120+ heroes with unique abilities and playstyle roles",
      "Deep mechanics: denying, pulling, stacking, and rune control",
      "Hundreds of items enabling creative build paths",
      "The International with record-breaking prize pools",
      "Custom games and arcade mode for varied experiences",
      "Dota Plus subscription with gameplay insights and coaching"
    ]
  },
  {
    title: "Counter-Strike 2",
    publisher: "Valve Corporation",
    description: "The legendary tactical shooter receives its most significant technical upgrade yet, rebuilt on the Source 2 engine. The core 5v5 bomb defusal gameplay remains unchanged — it's the same tense, skill-based competition that has defined competitive FPS for two decades. The new smoke grenade technology is revolutionary: smokes now interact with lighting, fill spaces dynamically, and can be temporarily cleared by explosions or gunfire. The sub-tick netcode promises more precise hit registration than ever. The maps have been updated with improved lighting and readability. While content is sparse compared to competitors, the gameplay purity is unmatched. CS2 proves that when the core is perfect, you don't need gimmicks.",
    highlights: [
      "Source 2 engine with improved visuals and performance",
      "Dynamic smoke grenades that interact with light and explosions",
      "Sub-tick netcode for precise hit registration",
      "Classic 5v5 bomb defusal with refined mechanics",
      "Updated maps with better readability and lighting",
      "Inventory system with tradable skins and community market"
    ]
  },
  {
    title: "Valorant",
    publisher: "Riot Games",
    description: "Riot's tactical shooter blends precise Counter-Strike-style gunplay with hero abilities to create a fresh competitive experience. Each agent brings unique abilities that can smoke, flash, heal, or provide information, adding strategic layers beyond raw aim. The gunplay is crisp and consistent, with damage models that reward headshots. The anti-cheat system (Vanguard) is aggressive but effective, keeping the competitive integrity high. The map design emphasizes both mechanical skill and tactical coordination. Riot's support has been exemplary, with regular balance patches, new agents every few months, and a thriving esports ecosystem. The ranked system is punishing but fair, and the progression feels rewarding. It has carved its own identity in a saturated genre.",
    highlights: [
      "Precision gunplay combined with unique agent abilities",
      "Vanguard anti-cheat for competitive integrity",
      "Thriving esports scene with global tournaments",
      "Regular content updates with new agents and maps",
      "Deep tactical gameplay with information-based abilities",
      "Cross-region play and console beta launch"
    ]
  },
  {
    title: "Overwatch 2",
    publisher: "Blizzard Entertainment",
    description: "Blizzard's hero shooter transitioned to free-to-play with a shift to 5v5 format. Removing one tank per team has made matches faster and more dynamic, with individual impact more pronounced than ever. The new heroes — Sojourn, Kiriko, Junker Queen, Ramattra, Lifeweaver, Illari, Mauga — each bring fresh mechanics to the roster. Push and Flashpoint game modes add variety beyond the classic payload and capture point. The visual updates are stunning, with improved lighting and character models. The battle pass system has been controversial but provides steady content. The PvE missions, while scaled back from original promises, offer cooperative gameplay with story elements. For quick, team-based FPS action, OW2 is still excellent.",
    highlights: [
      "5v5 format for faster, more impactful matches",
      "30+ heroes with distinct roles and abilities",
      "Free-to-play with seasonal battle pass content",
      "Push, Flashpoint and Clash game modes",
      "Cross-play across all platforms",
      "Regular seasonal events with themed cosmetics"
    ]
  },
  {
    title: "Apex Legends",
    publisher: "Electronic Arts",
    description: "Respawn Entertainment's battle royale stands apart with its movement mechanics and squad-based design. The ping system revolutionized non-verbal communication, allowing effective teamwork without voice chat. Each Legend has unique abilities that create distinct team compositions and strategies. The gunplay is the best in the battle royale genre — weapons have distinct recoil patterns, sound profiles, and damage models that reward mastery. The movement system — sliding, wall jumping, zipline surfing — adds a skill gap that separates good players from great ones. Seasonal updates consistently shake up the meta with map rotations, new Legends, and weapon changes. The competitive scene is strong, with ALGS offering substantial prize pools. Despite EA's monetization, the core game is exceptional.",
    highlights: [
      "Revolutionary ping communication system",
      "Unique Legends with game-changing abilities",
      "Best-in-class battle royale gunplay and movement",
      "Ranked competitive mode with ALGS esports circuit",
      "Map rotations with diverse environments",
      "Team-based respawn mechanics for intense comebacks"
    ]
  },
  {
    title: "Warframe",
    publisher: "Digital Extremes",
    description: "The free-to-play looter shooter that refuses to die has grown into one of the most content-rich games available. You play as a Tenno, ancient warriors controlling powerful Warframes — each with unique abilities and playstyles. The movement system is blisteringly fast, with wall-running, bullet-jumping, and sliding that make traversal as fun as combat. The crafting system is deep, requiring resources from different planets and factions. The story, while initially obscure, has developed into a compelling narrative about identity and sacrifice. The community is notably welcoming, and the monetization is fair — almost everything can be earned through gameplay. After a decade of updates, Warframe offers hundreds of hours of content, all free.",
    highlights: [
      "40+ Warframes with completely unique abilities",
      "Parkour movement system with bullet-jumping and wall-running",
      "Deep crafting with research and resource management",
      "Open-world zones on different planets",
      "Railjack space combat and Necramech ground vehicles",
      "Fair free-to-play with cosmetic-only monetization"
    ]
  },
  {
    title: "Path of Exile",
    publisher: "Grinding Gear Games",
    description: "The free-to-play action RPG that respects your intelligence offers unparalleled character customization. The passive skill tree is a massive web of over 1,300 nodes, allowing for virtually any build imaginable. The gem system lets you socket skill gems into equipment, linking them with support gems to dramatically alter how abilities work. Each league (three-month season) introduces a new mechanic that fundamentally changes gameplay, keeping the experience fresh for a decade. The endgame mapping system provides infinite replayability with customizable difficulty via atlas progression. The economy is player-driven with no gold — bartering uses orbs that modify items. It's complex, unforgiving, and deeply rewarding. The learning curve is vertical, but Path of Exile rewards investment like no other ARPG.",
    highlights: [
      "Over 1,300 node passive skill tree for infinite builds",
      "Gem system with linked support gems for skill customization",
      "Quarterly challenge leagues with unique mechanics",
      "Deep endgame atlas mapping system",
      "Player-driven economy with currency orbs",
      "Free-to-play with stash tabs as only required purchase"
    ]
  },
  {
    title: "Lost Ark",
    publisher: "Amazon Games",
    description: "The Korean MMORPG sensation brings Diablo-style isometric combat to a massive persistent world. The combat is the star — each class feels distinct with flashy animations, satisfying sound effects, and impactful hits. The game is generous with rewards, constantly showering players with loot and progression materials. The guardian raid system offers challenging boss fights that require coordination and pattern recognition. The island exploration and mokoko seed collecting provide hundreds of hours of optional content. The visuals are stunning for an isometric game, with detailed environments and spectacular skill effects. The western version has been well-supported with regular content updates. While the daily grind can feel overwhelming, the core gameplay loop is exceptionally polished.",
    highlights: [
      "Action combat with 15+ unique classes and subclasses",
      "Guardian raids with challenging boss mechanics",
      "Massive world with hidden islands and secrets",
      "Collectible mokoko seeds and adventurer's tome completion",
      "PvP with equalized gear for fair competition",
      "Marine-themed events and stronghold customization"
    ]
  },
  {
    title: "New World",
    publisher: "Amazon Games",
    description: "Amazon's MMO has transformed significantly since launch, now offering a compelling sandbox experience set in 17th century colonial America. The action combat with target-lock-free mechanics sets it apart from traditional tab-target MMOs. The crafting system is the most engaging in any MMO — gathering resources feels meaningful, and the crafting mini-game adds skill expression to item creation. The faction system drives open-world PvP with territory control wars that are genuinely exciting. The Aeternum setting is beautiful, with dense forests, ancient ruins, and haunted swamps to explore. The recent Rise of the Angry Earth expansion added mounts, a new zone, and a level cap increase. While endgame content still needs work, the journey from 1-65 is excellent.",
    highlights: [
      "Action combat with active blocking and dodging",
      "Deep crafting with mini-game mechanics",
      "Faction vs faction open-world PvP and territory wars",
      "Beautiful Aeternum setting with diverse biomes",
      "Housing and decoration systems",
      "Rise of the Angry Earth expansion with mounts"
    ]
  },
  {
    title: "Final Fantasy XIV",
    publisher: "Square Enix",
    description: "The MMO that rose from the ashes of its failed 1.0 launch is now widely considered the best MMORPG on the market. The main scenario quest line is a 200+ hour RPG that rivals single-player Final Fantasy games in quality. A Realm Reborn, Heavensward, Stormblood, Shadowbringers, Endwalker, and Dawntrail each bring expansions that somehow get better than the last. The job system lets you play all classes on a single character, encouraging experimentation. The community is remarkably welcoming, with veteran players actively helping newcomers. The crafting and gathering system is a fully fleshed-out game within a game. The music by Masayoshi Soken is exceptional. The housing, glamour, and social features create a world you want to live in.",
    highlights: [
      "200+ hour main scenario with award-winning storytelling",
      "Six expansions spanning over a decade of content",
      "One character can play all combat and crafting jobs",
      "Player housing with full furnishing customization",
      "Golden Saucer casino with mini-games and chocobo racing",
      "Consistently the most welcoming MMO community"
    ]
  },
  {
    title: "World of Warcraft",
    publisher: "Blizzard Entertainment",
    description: "The MMO that defined a generation continues to evolve with its latest expansion, The War Within. The core gameplay loop of questing, dungeons, and raiding remains as satisfying as ever, refined by two decades of iteration. The class design is in a great state, with each specialization feeling distinct and viable. Mythic+ dungeons provide endless endgame challenge, scaling in difficulty and rewarding coordination. The open-world content with dynamic flying and world quests makes daily activities feel less chore-like. The Dragonflight expansion set a new direction with better storytelling and player agency. The community, while sometimes toxic, still offers the unique thrill of being part of a living world. WoW's best days might be behind it, but it's still unmatched in its genre.",
    highlights: [
      "Raid content with 10-30 player cooperative challenges",
      "Mythic+ dungeon system with scaling difficulty",
      "13 classes with 36 specializations",
      "Extensive transmogrification and mount collection",
      "Player housing coming in Midnight expansion",
      "Cross-faction play for guilds and dungeons"
    ]
  },
  {
    title: "Halo Infinite",
    publisher: "Xbox Game Studios",
    description: "343 Industries' latest Halo entry delivers the best multiplayer the franchise has seen in years, even if the launch was rocky. The grappling hook transforms the sandbox, adding verticality and creative movement options to combat. The weapon variants on the map create dynamic encounters where power positions shift throughout matches. The campaign is open-world, offering freedom to approach objectives in any order while uncovering Forerunner secrets. The art style returns to classic Halo's colorful, sleek aesthetic after Halo 5's darker direction. The Forge mode is incredible — a full-fledged level editor that has produced community content rivaling official maps. The multiplayer is free-to-play, and the core gameplay loop is as satisfying as ever. Season updates have steadily improved the content situation.",
    highlights: [
      "Grappling hook adds unparalleled vertical mobility",
      "Open-world campaign with non-linear mission structure",
      "Free-to-play multiplayer with classic arena gameplay",
      "Forge mode with scripting, AI, and object editing",
      "Weapon variants change power dynamics on maps",
      "Split-screen co-op for campaign"
    ]
  },
  {
    title: "Assassin's Creed: Mirage",
    publisher: "Ubisoft",
    description: "Ubisoft returns to the series' roots with a focused, stealth-driven adventure set in 9th century Baghdad. The city is dense and vertical, designed for parkour and rooftop assassinations. The stealth tools return to prominence — smoke bombs, throwing knives, and blowdarts are essential, not optional. The investigation system requires following clues and tailing targets rather than following waypoints. Basim's story connects to Valhalla's larger narrative, giving context to one of that game's most mysterious characters. The historical setting is meticulously researched, with a Codex that teaches about Abbasid-era culture and science. While smaller in scope than Origins/Odyssey/Valhalla, the focused design makes every mission feel intentional. It's a love letter to fans of the original Assassin's Creed.",
    highlights: [
      "Return to focused stealth and assassination gameplay",
      "Dense 9th century Baghdad designed for parkour",
      "Classic Assassin tools: smoke bombs, throwing knives, blowdarts",
      "Investigation-based mission structure",
      "Historical Codex exploring Abbasid Golden Age",
      "Connects to Valhalla's narrative with Basim"
    ]
  },
  {
    title: "Spider-Man 2",
    publisher: "Sony Interactive Entertainment",
    description: "Insomniac's sequel doubles everything from the original — two Spider-Men, a larger New York, and significantly improved combat. Switching between Peter Parker and Miles Morales on the fly adds variety, with each having unique abilities and playstyles. The web-swinging has been enhanced with web wings that allow for gliding, making traversal faster and more dynamic. The story balances Peter's responsibility with the symbiote, Miles's search for identity, and the introduction of Kraven and Venom as threats. The side missions are substantial, with each district having its own story arc. The visuals are stunning, with fast-travel loading in literal seconds. The combat improvements, including parrying and dual-character takedowns, make encounters more cinematic. It's the definitive superhero game.",
    highlights: [
      "Two playable Spider-Men with unique abilities",
      "Web wings for gliding across expanded New York",
      "Symbiote powers add aggressive combat options",
      "Venom and Kraven as dual antagonists",
      "Instant fast travel with no loading screens",
      "Substantial district-specific side missions"
    ]
  }
];

async function updateGames() {
  try {
    await connectDB();

    let updated = 0;
    for (const data of gameData) {
      const result = await Game.findOneAndUpdate(
        { title: data.title },
        {
          $set: {
            description: data.description,
            publisher: data.publisher,
            highlights: data.highlights,
          },
        },
        { new: true }
      );

      if (result) {
        console.log(`✓ ${result.title} — updated (${data.highlights.length} highlights, publisher: ${data.publisher})`);
        updated++;
      } else {
        console.log(`✗ ${data.title} — not found in database`);
      }
    }

    console.log(`\nUpdated ${updated}/${gameData.length} games successfully`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateGames();
