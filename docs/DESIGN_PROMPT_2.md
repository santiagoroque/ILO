# ILO design brief, delivery 2: a bigger, livelier world

Copy everything below the line into your design tool or send it to a designer. It continues the first brief (DESIGN_PROMPT.md) and the Direction 06 delivery. **Every style and technical rule from the first brief still applies** (Parts 3, 4 and 14 there): SVG, 1280 x 720 rooms, bottom-center anchors, the `#2b2d42` outline, light from the top left, no text inside images, and placeholder colors `#FF00FF` / `#FF80FF` for Ilo's body.

---

# ILO: art brief for delivery 2

## Part 1. What this delivery is for

ILO already has a world (Plaza, Forest, Savannah, Arctic), Ilo, clothing, pets, a house, furniture and six physics lessons. Kids can walk, chat with preset phrases, dance and throw snowballs. Today the world is pretty but **still**: nothing moves unless Ilo moves.

This delivery has four goals:

1. **A new tropical area**, the Coast, south of the Plaza.
2. **A world that feels alive:** animals and residents that move and react, plants and water that move, evenings with lit windows, weather, and physics toys kids can play with anywhere.
3. **Houses you can buy**, each with its own outside and inside, plus many more furniture pieces, wallpapers and floors.
4. **More reasons to come back:** new hangout rooms, seasonal parties, new clothes, new pets and new stamps.

It also finishes the art still missing from delivery 1 (Part 12).

## Part 2. Inspiration and originality

ILO is inspired by the cozy virtual-world genre that Club Penguin made famous. We want what made that game fun, **not what it looked like**.

**Take these ideas, in ILO's own look:**
- Hangout rooms with something to do, like a juice bar, a stage and a museum.
- Friendly resident characters who stand in places and say things.
- Seasonal parties that redecorate the world for a few weeks.
- Houses to buy and decorate, sold from a catalog.
- Toys and secrets hidden in rooms.
- Pets that follow you.

**Never take any of these:**
- Penguins, puffles or any round fluffball pet.
- Igloos as houses.
- Copied room layouts (a town center, beach with lighthouse, dock, ski hill, pizza parlor, night club, coffee shop and so on, as they appear in that game).
- Copied minigames, the names of any of these things, logos, fonts or color schemes.

The previous rule still holds: everything is **created new for ILO** and licensed **CC0 or CC BY 4.0**.

**Cultural tone:** Mexico and Latin America first, warm and respectful, never stereotyped. In this brief that means:
- A kiosco (bandstand) and a tianguis (street market) in the Plaza.
- Talavera, papel picado and textile patterns.
- Cempasúchil (marigolds) and jacaranda.
- Axolotls and guacamayas (macaws).
- Mangroves and coral reefs like those of the Mexican coasts.

## Part 3. The Coast, a new tropical area

### 3.1 Palette and ground

| Ground | Look | Approx. color |
|---|---|---|
| `sand` | Warm pale sand with tiny shell flecks and soft ripples | `#f3dfae` |
| `jungle` | Lush deep-green grass with big leaf shadows | `#3f9a5a` |
| Path | Wooden boardwalk planks on sand and over water (thick rounded line, 60 to 70 px, plank texture across it) | warm wood `#c99a5e` |

**Mood:** bright midday, turquoise water, coral and hibiscus pinks as accents. A seamless **256 x 256** texture for each ground, plus a soft edge where sand meets jungle and where sand meets the Plaza stone.

### 3.2 Water (new kinds)

| id | Description | Size and frames |
|---|---|---|
| `sea-edge` | The shoreline: turquoise sea along one edge of a room, with a foamy white wave line that slides up and back. Delivered as a tileable strip so the game can lay it along the bottom or right edge. | Strip 256 wide x 160 tall, 4-frame wave loop |
| `lagoon` | A calm turquoise oval pool with a pale rim, a highlight and small ripples. Same scaling rule as `pond` (radius 80 to 210, 9-slice or simple shape). | 2-frame shimmer |
| `shallows` | Green-blue shallow water texture for under the mangrove boardwalk, with roots and little fish shadows. | Seamless 256 x 256 |
| `waterfall` | A waterfall falling from a rocky jungle cliff into a pool, with white foam at the bottom and mist. A standing object. | About 260 x 320, 4-frame loop |

### 3.3 The four rooms

Describe the kit pieces; the game assembles the rooms from data. One painted **concept illustration** of the area is welcome, as in delivery 1.

1. **Palm beach** (`palm-beach`). The arrival room, south of the Plaza. Wide sand, the sea along the bottom with waves, tall palms, a striped beach umbrella and towels, a sandcastle, shells and starfish. The **Boathouse** (Part 3.5) stands on short stilts at the water's edge. Exits: north to the Plaza, west to the Mangrove boardwalk, east to Waterfall cove.
2. **Mangrove boardwalk** (`mangrove-boardwalk`). A wooden boardwalk that zigzags over shallow green water between mangrove trees with arching roots. A canoe is tied to a post, a heron stands in the water, and fish jump. The path continues south to the Coral lookout.
3. **Coral lookout** (`coral-lookout`). A rocky point with tide pools and a round **glass-floor viewing deck** over the reef. Through the glass you see coral, fish and a sea turtle swimming. The **Reef hut** (Part 3.5) stands here. It is a dead end, peaceful and blue.
4. **Waterfall cove** (`waterfall-cove`). A jungle clearing with a waterfall into a lagoon, giant leaves, bromeliads and stepping stones across the water. It has a **water wheel** that kids can spin (Part 5). Toucans and a macaw sit in the trees. The mood is magical, like Mushroom hollow.

### 3.4 Decorations

The footprint is the circle Ilo cannot walk into; "walkable" means Ilo walks over it.

| id | Footprint | Art size (w x h) | Description |
|---|---|---|---|
| `palm` | 18 (trunk) | 90 x 150 | A tall curved coconut palm with a ring-patterned trunk, fronds and coconuts. 3-frame sway. |
| `palm-short` | 16 | 70 x 90 | A short bushy palm. 3-frame sway. |
| `banana` | 20 | 70 x 90 | A banana plant with big torn leaves and a green bunch. |
| `monstera` | 22 | 80 x 60 | A clump of giant split leaves. |
| `bromeliad` | walkable | 34 x 28 | A spiky rosette plant with a red center. |
| `hibiscus` | walkable | 28 x 20 | Pink and red tropical flowers. |
| `mangrove` | 30 | 120 x 110 | A mangrove tree on arching stilt roots, standing in water. |
| `shell` | walkable | 18 x 12 | A spiral shell. Give 3 color variants. |
| `starfish` | walkable | 18 x 18 | An orange starfish. |
| `sandcastle` | 20 | 50 x 44 | A small sandcastle with a little flag (no text). |
| `beach-umbrella` | 14 | 90 x 100 | A coral-and-cream striped umbrella with a towel under it. |
| `towel` | walkable | 70 x 30 | A beach towel with a textile pattern. 3 color variants. |
| `canoe` | 30 | 120 x 40 | A wooden canoe with a paddle, floating (2-frame bob). |
| `driftwood` | 18 | 60 x 20 | A pale twisted log. |
| `tide-pool` | walkable | 80 x 50 | A small rock pool with a tiny crab or anemone. |
| `stepping-stone` | walkable | 40 x 22 | A flat round stone in water. |
| `glass-deck` | walkable | 300 x 180 | The round glass viewing floor with a wooden rim. It shows the reef below: coral, swaying sea grass, small fish (3-frame loop) and a sea turtle (Part 4). |
| `rock-cliff` | 40 | 160 x 120 | A mossy jungle cliff, used next to the waterfall. |

### 3.5 Buildings (outdoor)

Same rules as delivery 1: footprint 170 x 120, art about 220 x 260, a blank name plate, and the states normal, highlighted and coming soon.

| id | Name | Description |
|---|---|---|
| `boathouse` | Boathouse | A wooden boat workshop on short stilts, with a palm-thatch roof, a half-built boat on a rack, ropes and a wooden anchor emblem. It is the home of a future floating-and-sinking lesson, so it starts as "coming soon". |
| `reef-hut` | Reef hut | A small turquoise hut with a round porthole window, snorkels and flippers hanging outside, and a shell emblem. "Coming soon" at first. |

Each building also needs a **night** version with warm lit windows (Part 6).

## Part 4. A world that feels alive

### 4.1 Wild animals (ambient life)

These animals wander, fly or pop up on their own in each area. Most of them **react when Ilo comes close**: they fly away, hide or wave. They are scenery, not pets: smaller and simpler than pets, and they never follow Ilo.

Every animal faces right; the game mirrors it to face left. Frames loop at 8 to 12 fps, and the anchor is at the bottom center (flying animals: the center of the body, documented).

| id | Area | Size | Frames needed |
|---|---|---|---|
| `butterfly` | Forest, Coast | 20 x 16 | fly 2 (flap); 3 color variants (blue, yellow, orange) |
| `songbird` | Forest, Plaza | 24 x 22 | hop 2, peck 2, fly 3 |
| `squirrel` | Forest | 34 x 30 | run 4, sit and nibble 2 |
| `firefly` | Forest (evening) | 10 x 10 | glow 3 (dim, bright, dim) |
| `meerkat` | Savannah | 26 x 36 | pop up out of a burrow 3, look around 2, duck down 2 (and the `burrow` hole itself) |
| `bird-flock` | Savannah | 120 x 40 | fly 3 (a V of small birds seen from below) |
| `elephant` | Savannah (Waterhole edge) | 160 x 120 | walk 4, drink 2 (a gentle family walking past now and then) |
| `snow-hare` | Arctic | 30 x 30 | hop 3, sit 2 (white with dark ear tips) |
| `seal` | Arctic (Frozen lake) | 50 x 36 | pop out of an ice hole 3, look 2, dive 2 (and the `ice-hole`) |
| `crab` | Coast | 26 x 18 | walk sideways 3, snap 2 |
| `toucan` | Coast | 30 x 36 | perch blink 2, fly 3 |
| `macaw` | Coast | 36 x 46 | perch 2, fly 3 (scarlet, yellow and blue) |
| `heron` | Coast (Mangroves) | 40 x 60 | stand 2, step 2, fly 3 |
| `jumping-fish` | ponds, lagoon, sea | 30 x 40 | arc out of the water and splash 4 |
| `sea-turtle` | Coast (under the glass deck) | 60 x 44 | swim 4 (seen from above) |
| `pigeon` | Plaza | 22 x 20 | peck 2, flutter away 3 |
| `duck` | Forest pond, Plaza fountain | 28 x 22 | swim 2 (seen floating) |

Also a small **"spotted" sparkle** (24 x 24, 3 frames) that the game shows the first time a kid finds each animal. See the Field guide in Part 10.

### 4.2 Plants and water that move

Add a **3-frame idle loop** (a gentle sway, a ripple or a flicker) to these existing pieces: `tree`, `pine`, `acacia`, `bush`, `grass`, `flowers`, `pond` (shimmer), `ice-lake` (glint), the shop's awning flag, and the drone post's antenna light. Keep the first frame identical to today's art, so nothing jumps when animation is off.

### 4.3 Residents (friendly characters)

These are ILO's own residents: animals that live in the world, are about Ilo's size and are clearly different from pets. Each stands in one place. When Ilo walks up, they wave and say a short line in a speech bubble (the game writes the text). They give tips, point to lessons and hint at secrets.

**Views and frames:** front view only. Idle 2, wave 3, talk 2. About **90 x 110** at 1x, anchor at the bottom center, and a 96 x 96 portrait icon for their speech bubble.

| id | Name idea | Species | Where | Look |
|---|---|---|---|---|
| `profe` | Profe Vera | Owl | Drone post | Round glasses, a lab coat, a clipboard. Kind and curious. |
| `tendero` | Don Tito | Tortoise | Shop | An apron and a straw hat. Slow, warm, funny. |
| `ranger` | Luma | Capybara | Forest trail | A ranger vest and binoculars. Calm, knows every animal. |
| `boatbuilder` | Coco | Manatee | Boathouse (Coast) | A captain's cap and a tool belt. Cheerful. |
| `musician` | Lala | Hummingbird | Plaza kiosco | Tiny, fast, holds a marimba mallet. Hosts the parties. |
| `snow-guide` | Nuk | Snowy owl | Snowy ridge | A wool hat and a scarf. Loves snowball fights. |

The names are suggestions: they must not match any existing character, so check them.

### 4.4 Evening and weather

ILO follows the computer's clock. Morning and midday look as today; from 6 pm the game tints the world toward a warm dusk (in code). The art needed:

- **Night versions** of every outdoor building (`<id>-night.svg`): the same art with warm lit windows and a soft glow at the door.
- **Lamp glow** sprite (a warm round light, 120 x 120, semi-transparent) to place over lamps and lanterns.
- **Northern lights** overlay for the Arctic in the evening: soft green and violet ribbons, 1280 x 240, 3-frame slow shimmer, semi-transparent.
- **Weather particles**, tiny sprites the game scatters: snowflake (8 x 8), autumn leaf (12 x 10, 3 colors), jacaranda petal (8 x 8, purple), raindrop (4 x 10), cempasúchil petal (8 x 8, orange).

## Part 5. Physics toys in the world

Small toys kids can use anywhere. They make the world playful, and quietly show the ideas from the lessons. Each needs the frames listed, a highlighted state when Ilo is close, and an anchor at the bottom center.

| id | Where | Size | What it does | Frames |
|---|---|---|---|---|
| `ball` | Plaza, Savannah, Beach | 26 x 26 | Ilo kicks it. It rolls and slows down faster on grass and sand than on stone or ice (friction). | roll 4; and a `goal` (100 x 70, a small wooden goal frame with a net) |
| `seesaw` | Plaza | 160 x 50 | Ilo sits on one end; a sandbag or a friend's weight lifts it (lever). | tilt left, level, tilt right |
| `swing` | Forest trail | 90 x 110 | Ilo sits and swings (pendulum). | swing 5 |
| `bounce-mushroom` | Mushroom hollow | 70 x 60 | A giant springy mushroom. Ilo bounces higher with each jump. | idle, squash, stretch |
| `sled-hill` | Snowy ridge | 200 x 100 | A short slope. Ilo rides a sled down and slides on (friction on snow). | a slope piece, plus a sled under Ilo, side view, 2 frames |
| `water-wheel` | Waterfall cove | 120 x 140 | Click it to open the sluice; water turns the wheel faster. | turn 4, and a splash |
| `marimba-stones` | Waterfall cove | 160 x 50 | Five stones of different sizes; each plays a note when Ilo steps on it. | each stone: idle, pressed |
| `paper-boat` | ponds, lagoon | 30 x 24 | Drop it in and it floats away with a small wake. | float 2 |
| `magnet-rock` | Arctic | 60 x 50 | A strange dark rock that pulls metal items (like a lost spoon) toward it (magnetism). | idle, glow 2 |
| `kite` | Savannah (windy) | 50 x 60, plus string | Ilo flies a kite. | fly 3 |

## Part 6. Houses you can buy

Today every kid has one house: a yellow building in the Plaza whose inside can switch between three wall styles. In this delivery **each house is a full style**: a different building outside, a matching inside, and a catalog card. When a kid buys and picks a style, the house door in the Plaza shows that building.

**For each house style, deliver:**
- An **exterior** building: normal, highlighted and night versions. The footprint is 170 x 120, with art up to about 240 x 280. The **premium** styles may be wider, with a footprint up to 220 x 140.
- A **back wall** (1280 x 220, with a trim band), a **window** (160 x 110), a **floor** texture (256 x 256) and a **door mat** at the bottom center.
- A **catalog card illustration** (320 x 200): the house in its setting.

| id | Name | Price idea | Outside | Inside |
|---|---|---|---|---|
| `cabin` | Forest cabin (free, exists) | 0 | **New exterior** in the cabin style: logs, a green door, a stone chimney with smoke (3-frame loop) | Exists |
| `adobe` | Adobe house (exists) | 150 | **New exterior**: terracotta walls, a flat roof with wooden beams sticking out, a blue door, potted cacti | Exists |
| `icecabin` | Ice cabin (exists) | 150 | **New exterior**: blue-white ice blocks in a lodge shape (**not** a dome or igloo), wooden door, icicles | Exists |
| `bungalow` | Beach bungalow | 250 | A wooden bungalow on stilts with a palm-thatch roof, a porch hammock and steps down to the sand | Bamboo walls, a sea view in the window, light wood floor |
| `treehouse` | Treehouse | 300 | A wooden cabin in a big tree, with a rope ladder and a little flag | Round wooden room, a branch growing through the wall, leaf shadows on the floor |
| `hacienda` | Courtyard house | 350 | Terracotta tile roof, white walls with arches, talavera-tile trim, bougainvillea flowers | Arched walls with niches, talavera tile floor |
| `mushroom-house` | Mushroom cottage | 300 | A giant red-cap mushroom with a round door and windows | Curved cream walls with spots, mossy carpet floor |
| `observatory` | Observatory (premium) | 500 | A white dome that slides open to show a telescope, on a small round building | Dark blue round room with star-chart walls, a starry ceiling band, a metal floor |

**Wallpapers and floors on their own:** separate from the house style, kids can buy **wallpapers** (1280 x 220 wall art, each with its own trim) and **floors** (256 x 256 textures) to change any house:

- **Wallpapers:** stripes, stars, jungle leaves, papel picado pattern, ocean waves, chalkboard with formulas drawn as pictures (no letters).
- **Floors:** checkerboard, grass carpet, ocean blue tiles, talavera, rustic stone, honey parquet.

## Part 7. Furniture (36 new pieces in 6 sets)

Rules as in delivery 1: an anchor at the bottom center, a stated footprint, a 96 x 96 icon, and a ghost version. Items marked **(anim)** need a short idle loop (3 frames). Items marked **(use)** react when Ilo clicks them.

| Set | id | Footprint | Height | Description |
|---|---|---|---|---|
| **Coast** | `hammock` | 150 x 50 | 70 | A woven hammock between two posts. (use: Ilo lies in it, needs an Ilo-in-hammock overlay, 2 frames sway) |
| | `bamboo-chair` | 54 x 36 | 80 | A bamboo armchair. |
| | `shell-lamp` | 30 x 24 | 60 | A table lamp with a shell shade. (use: on/off) |
| | `fishbowl` | 50 x 30 | 50 | A round glass bowl with two small fish. (anim) |
| | `surfboard` | wall | 120 | A surfboard hung on the wall, with a wave pattern. |
| | `bird-of-paradise` | 44 x 24 | 90 | A potted orange-and-blue flower plant. |
| **Science lab** | `lab-bench` | 140 x 56 | 80 | A bench with flasks that bubble in colors. (anim) |
| | `newton-cradle` | 50 x 24 | 40 | Five steel balls on strings. (use: they click back and forth, 4 frames) |
| | `pendulum-clock` | 50 x 30 | 150 | A tall clock with a swinging pendulum. (anim) |
| | `model-rocket` | 40 x 40 | 100 | A rocket on a launch stand. (use: a puff of smoke and a small hop) |
| | `solar-mobile` | ceiling | 80 | Planets hanging from the ceiling that slowly turn. (anim) |
| | `microscope` | 36 x 24 | 50 | A microscope on a small table. |
| **Crafts** | `talavera-vase` | 34 x 30 | 60 | A blue-and-white talavera-style vase with flowers. |
| | `alebrije` | 50 x 40 | 60 | A colorful fantasy animal statue in alebrije style (an original creature). |
| | `papel-picado` | wall | 60 | A garland of cut-paper flags across the wall, in 5 colors. (anim: flutter) |
| | `textile-cushion` | 60 x 40 | 30 | A floor cushion with a woven textile pattern. |
| | `cempasuchil-pot` | 40 x 30 | 50 | A clay pot of orange marigolds. |
| | `pinata` | ceiling | 70 | A star-shaped piñata hanging from the ceiling. (use: it swings) |
| **Cozy** | `sofa` | 160 x 60 | 70 | A soft two-seat sofa. 3 color variants. (use: Ilo sits) |
| | `fireplace` | wall, 140 wide | 120 | A stone fireplace with fire. (anim) |
| | `bunk-bed` | 110 x 60 | 160 | A wooden bunk bed with a ladder. |
| | `record-player` | 50 x 40 | 50 | A record player on a stand. (use: plays the house music, and a spinning record, 3 frames) |
| | `wall-clock` | wall | 50 | A round wall clock. |
| | `window-seat` | 140 x 60 | 70 | A cushioned bench to put under the window. |
| **Play** | `trampoline` | 100 x 70 | 40 | A small round trampoline. (use: Ilo bounces, 3 frames) |
| | `toy-box` | 70 x 44 | 50 | A painted wooden toy chest. (use: the lid opens) |
| | `mini-slide` | 120 x 60 | 90 | A small indoor slide. |
| | `ball-pit` | 130 x 90 | 40 | A low ball pit with colorful balls. |
| | `ping-pong` | 160 x 90 | 60 | A small ping-pong table. |
| | `arcade-mini` | 60 x 40 | 110 | A small decorative arcade cabinet (blank glowing screen, no brand). (anim) |
| **Garden and outdoor** | `potted-cactus` | 34 x 30 | 60 | A cactus in a painted pot. |
| | `hanging-plants` | ceiling | 70 | Plants hanging in woven holders. |
| | `aquarium-big` | 180 x 50 | 120 | A large aquarium with a sea turtle and coral. (anim) |
| | `bird-cage-open` | 50 x 30 | 90 | An open, empty birdhouse-style stand where a songbird sometimes visits. (anim) |
| | `lantern` | 26 x 26 | 50 | A punched-tin lantern that throws star-shaped light. (anim: flicker) |
| | `fountain-small` | 80 x 50 | 60 | A small tiled indoor fountain. (anim) |

## Part 8. New hangout rooms (Plaza)

**Change while coding:** to keep the Plaza easy to read, these buildings and the Plaza additions stand on a new **Market street** (`market-street`), reached from the Plaza's north-west corner.

Three new buildings around the Plaza, each with an interior. Exteriors use the usual building rules (normal, highlighted, soon, night). Interiors need a back wall, a floor and a window like the house styles, plus the special pieces listed.

| Building id | Name | Outside | Inside and special pieces |
|---|---|---|---|
| `juice-bar` | Juice bar | A bright stall-like building with a fruit-striped awning and a giant orange on the roof | A counter with blenders (anim), stools, fruit crates, a chalkboard drawn with fruit pictures (no words). A **juice cup** hand item (Part 9) is sold here. |
| `stage` | Fiesta hall | A round hall with string lights and a carved wooden door | A **stage** (400 x 120) with curtains; a **light-up dance floor** of tiles (each tile 64 x 40, 4 colors, lights in patterns, anim); speakers; a **marimba** (use: plays notes). Dancing here makes the floor light up under Ilo. |
| `museum` | Science museum | A columned building with a dome and a big pendulum swinging inside a glass front (anim) | A **giant magnet** with paper clips stuck to it, a **Foucault-style pendulum** (anim), **planet models**, a **lever display**, a **sled exhibit**, and a **trophy wall** (empty frames where the game places the kid's stamps). |

**Plaza additions (outdoor):**
- `kiosco`: a Mexican-style bandstand with a domed roof, wrought-iron railings and string lights, about 260 x 240. The musician resident stands here, and it is the stage for parties.
- `market-stall`: a tianguis stall with a striped awning, about 120 x 120. Three variants: fruit, toys, crafts.
- `paleta-cart`: an ice-pop cart with an umbrella, about 90 x 90.
- `balloon-seller`: a balloon bundle on a stand, about 60 x 120. The balloons sway (anim).
- A **south exit** sign toward the Coast.

## Part 9. Clothing and pets

**Clothing**, 14 new items. Each one is needed in **every avatar frame**, exactly like delivery 1 (`clothing/animated/<id>-<view>-<anim>-<n>.svg`: 3 views x idle 2, walk 4, sit 1, plus front dance 4, which makes 25 frames), plus a shop icon.

| Slot | id | Description |
|---|---|---|
| head | `sun-hat` | A woven palm sun hat with a coral band |
| head | `party-hat` | A paper party cone with a pompom |
| head | `marigold-crown` | A crown of orange cempasúchil flowers |
| head | `headlamp` | A miner-style headlamp that glows (glow in the night version) |
| face | `snorkel` | A snorkel mask with a tube |
| face | `star-glasses` | Star-shaped glasses |
| neck | `shell-necklace` | A string of small shells |
| neck | `bandana` | A bandana with a textile pattern |
| body | `rash-guard` | A short-sleeved swim shirt with a wave stripe |
| body | `poncho` | A woven striped poncho |
| feet | `sandals` | Simple sandals |
| feet | `rain-boots` | Yellow rain boots |
| hand | `butterfly-net` | A butterfly net (also used for the Field guide, Part 10) |
| hand | `juice-cup` | A juice cup with a straw, from the Juice bar |

**Pets**, 3 new ones. Same frames as delivery 1: idle 2, hop 3, happy 2, sad 1, plus an icon.

| id | Description |
|---|---|
| `axolotl` | A pink axolotl with frilly gills and a big smile, walking on land in ILO's playful way. It is native to Mexico. |
| `macaw` | A small scarlet macaw that hops beside Ilo and flutters on the happy frames. |
| `armadillo` | A small armadillo that rolls into a ball on the hop frames. |

## Part 10. Field guide, parties and stamps

**Field guide** (Bitácora de naturaleza). A small book where each wild animal from Part 4.1 gets a card once the kid spots it. It turns exploring into collecting, and every card has a one-line fact (the game writes it).

Deliver:
- A **card illustration for each animal** (160 x 160, a cozy portrait in its habitat). The book itself is drawn by the game's interface, so no frame is needed.
- A "not found yet" silhouette version of each card.

**Seasonal parties.** For a few weeks a year, the game swaps in decorations and offers one free item. Each party kit needs:
- 6 to 10 decorations, using the decoration rules.
- A Plaza banner (blank plate).
- One free clothing item (all 25 frames) or one furniture piece.
- One stamp.

| Party | When | Decorations | Free item |
|---|---|---|---|
| Día de Muertos | Late Oct to Nov 2 | Papel picado strings between lamps, cempasúchil arches and petal paths, candles in jars, sugar-skull-pattern tiles. Celebratory and respectful: no scary skeletons and no religious altar. | `marigold-crown` |
| Posadas and winter | December | Star piñatas hanging from trees, farolitos (paper bag lanterns), poinsettias in pots, string lights, a decorated pine in the Plaza | `party-hat` in red and green |
| Spring | March | Jacaranda trees in bloom (a purple variant of `tree`), kites, flower garlands | `butterfly-net` |
| Science fair | May | Blank banners, balloons, a big model volcano (anim: puff), project stands with tri-fold boards drawn as pictures | `headlamp` |

**New stamps** (both versions, earned and locked, like delivery 1):
- `beachcomber`: visit every Coast room.
- `naturalist`: spot every animal in the Field guide.
- `half-guide`: spot half of them.
- `homeowner`: buy a second house style.
- `interior-designer`: place 20 pieces of furniture.
- `party-goer`: join a party.
- `toy-tester`: use 5 physics toys.
- `goal-kicker`: kick the ball into the goal.
- `night-owl`: visit in the evening.
- `museum-friend`: visit the museum.

## Part 11. Interface pieces

- **House catalog:** a booklet look with a cover, page frames, tabs (houses, wallpapers, floors, furniture sets), a price tag shape with the coin icon, and a "you own this" ribbon.
- **Resident speech bubble:** a variant of Ilo's bubble with a portrait circle on the left.
- **"Something to do here" marker:** a small bouncing sparkle over a toy or resident that Ilo hasn't tried yet.
- **New map**, 1000 x 625, replacing the current one. It keeps the same paper-card look. The Forest is on the left, the Arctic at the top right, the Savannah at the bottom right, the **Coast along the bottom left and center with the sea at the bottom edge**, and the Plaza in the middle. It shows small landmarks for every room (19 outdoor and hangout spots) and dotted paths. We will send the exact spot list from the room data before you start the map.

## Part 12. Still missing from delivery 1

1. **Arcade screens** for the three newer lessons (normal, highlighted and a 3-frame screen loop), like the existing ones:
   - `arcade-heat`: a block being rubbed and a thermometer rising.
   - `arcade-magnets`: a crane magnet lifting a paper clip.
   - `arcade-magnet-poles`: two magnets, N and S drawn as red and blue halves (no letters), pulling together.
2. **Minigame scene for the magnet crane** (800 x 450 plus 40 px of ground):
   - The crane with a rail, a cable and a magnet with red and blue halves.
   - Objects, each about 50 x 50: steel paper clip, aluminum can, iron nail, brass key, steel bottle cap, plastic spoon, aluminum foil ball, iron nut, copper wire coil, wooden pencil, steel screw, glass jar, and a wooden box with a magnet inside.
   - A recycling bin and a workshop background.
3. **Minigame scene for rubbing:**
   - Four surface strips (glass, wood, carpet, sandpaper), each 500 x 40.
   - A wooden block that wobbles while rubbed (3 frames).
   - A thermometer (40 x 260) with a target band.
   - Warm "heat wiggle" lines over the block.
   - A cozy workshop background.
4. **Stamp `applied-scientist`:** a flask with a gear, or a lightbulb inside a magnifier (earned and locked).
5. **Warm-up pictures** for the lesson questions, 240 x 160 each, in a picture-book style. One per question:
   - Two balls falling side by side.
   - Ilo on the Moon dropping a ball.
   - A box sliding on ice next to one on sand.
   - A ball rolling to a stop on grass.
   - Hands being rubbed with warm lines.
   - A block on sandpaper next to one on glass.
   - A magnet with a paper clip, a spoon and a pencil.
   - An aluminum can and a magnet.
   - Two magnets with opposite poles facing.
   - Two magnets with the same poles facing.
   - A seesaw with a big and a small character.
   - A plank and log lifting a rock.

### 12.6 Exact file names for Part 12

The game already looks for these names (it draws shapes until they exist):

| Piece | File |
|---|---|
| Arcade screens | `world/stations/arcade-<lesson>.svg`, `-highlight.svg`, `-1.svg` to `-3.svg`, for `heat`, `magnets`, `magnet-poles` |
| Magnet crane | Delivered in round A: `background.svg`, `ground.svg`, `rail.svg`, `carriage.svg`, `cable.svg`, `magnet.svg` (horseshoe), `recycling-bin.svg`. Still needed for the poles lesson: `magnet-n-down.svg`, `magnet-s-down.svg` (Part 15) |
| Magnet objects | Delivered in round A with descriptive names (`steel-paper-clip.svg` and so on), drawn at 50 x 50. Still needed: `magnet-box-n.svg`, `magnet-box-s.svg` (Part 15) |
| Rubbing | `minigames/heat/background.svg`, `surface-glass.svg`, `surface-wood.svg`, `surface-carpet.svg`, `surface-sandpaper.svg` (each stretched to 400 x 16), `block-1.svg` to `block-3.svg` (stretched to 80 x 44; the game tints it red as it warms), `heat-lines-1.svg` to `-3.svg` (anchor bottom center), `thermometer.svg` (only the glass tube; the level and goal band are drawn by the game) |
| Stamp | `stamps/applied-scientist.svg` and `stamps/applied-scientist-locked.svg` |
| Warm-up pictures | `warmups/<lesson>-<question id>.svg`: `gravity-heavy-light`, `gravity-weak-gravity`, `friction-ice-sand`, `friction-what-stops`, `heat-cold-hands`, `heat-rough-smooth`, `magnets-what-sticks`, `magnets-can`, `magnet-poles-opposite`, `magnet-poles-same`, `lever-seesaw`, `lever-pry-rock` |

Animals use `world/critters/<type>-<animation>-<n>.svg` with the animation names from Part 4.1 (`fly`, `glow`, `hop`, `peck`, `run`, `sit`, `up`, `look`, `down`, `swim`, `jump`, `walk`, `drink`), plus `burrow.svg` and `ice-hole.svg`. Animated decorations use `world/decorations/<id>-<n>.svg` next to the still `<id>.svg`.

## Part 13. Delivery format

Add to the delivery 1 folder structure. Use exactly the ids in this brief.

```
assets/
  world/
    textures/        sand, jungle, shallows
    water/           sea-edge-<n>, lagoon, waterfall-<n>
    decorations/     <id>.svg (and <id>-<n>.svg for animated ones)
    buildings/       <id>.svg, -highlight, -soon, -night
    critters/        <id>-<animation>-<n>.svg
    residents/       <id>-<animation>-<n>.svg, <id>-portrait.svg
    toys/            <id>-<state or frame>.svg
    effects/         lamp-glow, aurora-<n>, snowflake, leaf-<color>, petal-<kind>, raindrop, spotted-<n>
    walls/           <style>-wall.svg, <style>-window.svg, wallpaper-<id>.svg
    textures/        indoor-<style>.svg, floor-<id>.svg
    parties/         <party>/<id>.svg
  houses/            <style>-exterior(-highlight|-night).svg, <style>-card.svg
  furniture/         <id>.svg, ghost/<id>.svg, icons/
  clothing/animated/ <id>-<view>-<anim>-<n>.svg, icons/
  pets/              <id>-<animation>-<n>.svg, icons/
  guide/             book.svg, <critter>.svg, <critter>-unknown.svg
  stamps/            <icon>.svg, <icon>-locked.svg
  minigames/         magnets/, heat/
  warmups/           <lesson>-<warmup id>.svg
  ui/                catalog/, resident-bubble.svg, todo-sparkle-<n>.svg
  map/               world-map-v2.svg
```

## Part 14. Rounds and priorities

This is a big delivery, roughly 900 to 1,100 files, mostly animation frames. Please work in this order, with our approval after each round:

| Round | What | Why first |
|---|---|---|
| **A** | Part 12 (missing from delivery 1), the Coast kit (Part 3), and the animals for the existing areas (Part 4.1, without the Coast ones) | Finishes what lessons already use, and makes today's world feel alive soonest |
| **B** | Residents, plant and water loops, evening and weather (Parts 4.2 to 4.4), physics toys (Part 5), Coast animals | The "alive" layer |
| **C** | House styles, wallpapers, floors, furniture sets and the catalog (Parts 6, 7 and 11) | Lots of value for coins |
| **D** | Hangout rooms, Plaza additions, clothing, pets, Field guide, stamps, new map (Parts 8 to 11) | Builds on everything before |
| **E** | Party kits (Part 10), one at a time, at least 6 weeks before each date | Seasonal |

**Final checklist before delivery:**
- [ ] Nothing resembles Club Penguin or any other game, brand or character (no penguins, puffles, igloos or copied rooms).
- [ ] No text inside any image.
- [ ] Every file uses the exact id, size and bottom-center anchor from this brief; animated pieces keep the anchor still across frames.
- [ ] The first frame of every newly animated existing piece matches today's art.
- [ ] Every clothing item lines up in all 25 avatar frames.
- [ ] Cultural pieces are respectful (Día de Muertos is celebratory, with no stereotypes).
- [ ] Everything is readable at 50% size on a cheap screen.
- [ ] Optimized SVG within the delivery 1 size budget.
- [ ] Every file is CC0 or CC BY 4.0, and the README lists the license.

## Part 15. Feedback on round A (received 2026-10-28)

Thank you: round A is in the game. All 209 pictures load, and the game uses your file names as they are.

**What the game does with it:**
- The magnet room and the rubbing room are drawn at their own size, with the floor line 350 px down the picture. The lessons are 6 m tall instead of 9 m, so the top of each room is cropped.
- The crane rail runs along the top. The carriage is shown at 80% and the horseshoe magnet at 75%, so the magnet fits under the rail at the crane's highest point.
- The objects are drawn at their own 50 x 50 size.
- The block is tinted red by the game as it warms. The thermometer glass is stretched to the game's scale, and the game draws the level and the goal band itself (the goal band changes per lesson).
- The wave strips are laid in one straight row along the Palm beach shore. The Coral lookout shore turns too steeply for them, so it keeps a drawn foam line. The sea's color was changed to match your strips.

**Please add or change in round B:**
1. **Pole versions for the magnet-poles lesson.** That lesson asks which pole of the crane faces down, so it needs a **bar magnet** with one pole facing down (`magnet-n-down.svg`, `magnet-s-down.svg`) and the **box with a magnet** showing which pole faces up (`magnet-box-n.svg`, `magnet-box-s.svg`). Until then that lesson keeps its drawn bar magnet and box. The horseshoe magnet is used in the magnet crane lesson.
2. **Warm-up pictures that do not show the answer.** These are asked before the kid answers, so a picture should set up the question without solving it. Five give the answer away:
   - Rubbing hands, and the two blocks: heat lines show which one warms. Please remove the heat lines.
   - Both magnet-pair pictures: the arrows show pull or push. Please remove the arrows.
   - Plank and log: the log is already near the rock. Please show the rock and the plank with no log, or the log away from the plank.

   Also check the ice-and-sand picture: its speed lines hint at the answer. Please send these as new files under the same names.
3. **The elephant calf.** The brief describes a family. The game can draw a smaller copy of the adult if you prefer, so this is optional.

## Part 16. Every file name the game looks for

The game is already coded for everything in this brief. It draws simple shapes until each file below exists, then uses the picture by itself (after `npm run import-art`). Use these names exactly. Paths are inside `assets/`. Anchors are bottom center unless the row says otherwise.

| What | Files |
|---|---|
| Wild animals (Part 4.1) | butterfly: `world/critters/butterfly-blue-fly-1..2.svg`, `world/critters/butterfly-yellow-fly-1..2.svg`, `world/critters/butterfly-orange-fly-1..2.svg`; firefly: `world/critters/firefly-glow-1..3.svg`; songbird: `world/critters/songbird-hop-1..2.svg`, `world/critters/songbird-peck-1..2.svg`, `world/critters/songbird-fly-1..3.svg`; pigeon: `world/critters/pigeon-peck-1..2.svg`, `world/critters/pigeon-flutter-away-1..3.svg`; squirrel: `world/critters/squirrel-run-1..4.svg`, `world/critters/squirrel-sit-nibble-1..2.svg`; snow-hare: `world/critters/snow-hare-hop-1..3.svg`, `world/critters/snow-hare-sit-1..2.svg`; meerkat: `world/critters/meerkat-pop-up-1..3.svg`, `world/critters/meerkat-look-around-1..2.svg`, `world/critters/meerkat-duck-down-1..2.svg`; seal: `world/critters/seal-pop-1..3.svg`, `world/critters/seal-look-1..2.svg`, `world/critters/seal-dive-1..2.svg`; duck: `world/critters/duck-swim-1..2.svg`; jumping-fish: `world/critters/jumping-fish-jump-1..4.svg`; elephant: `world/critters/elephant-walk-1..4.svg`, `world/critters/elephant-drink-1..2.svg`; bird-flock: `world/critters/bird-flock-fly-1..3.svg`; crab: `world/critters/crab-walk-1..3.svg`, `world/critters/crab-snap-1..2.svg`; heron: `world/critters/heron-stand-1..2.svg`, `world/critters/heron-step-1..2.svg`, `world/critters/heron-fly-1..3.svg`; toucan: `world/critters/toucan-perch-1..2.svg`, `world/critters/toucan-fly-1..3.svg`; macaw: `world/critters/macaw-perch-1..2.svg`, `world/critters/macaw-fly-1..3.svg`; sea-turtle: `world/critters/sea-turtle-swim-1..4.svg`; holes: `world/critters/burrow.svg`, `world/critters/ice-hole.svg` |
| Animated decorations (Part 4.2) | `world/decorations/tree-1..3.svg`, `world/decorations/pine-1..3.svg`, `world/decorations/acacia-1..3.svg`, `world/decorations/bush-1..3.svg`, `world/decorations/grass-1..3.svg`, `world/decorations/flowers-1..3.svg`, `world/decorations/palm-1..3.svg`, `world/decorations/palm-short-1..3.svg`, `world/decorations/canoe-1..3.svg`; `world/water/waterfall-1..4.svg`, `world/decorations/glass-deck-1..3.svg`; water: `world/water/pond-1..3.svg`, `world/water/ice-lake-1..3.svg`, `world/water/lagoon-1..3.svg`. Frame 1 must match the still picture. |
| Buildings: loops and evening | `world/buildings/<id>-1..3.svg` (a flag, a blinking light) and `world/buildings/<id>-night.svg` (lit windows) for every building |
| Residents (Part 4.3) | `profe`, `tendero`, `ranger`, `boatbuilder`, `musician`, `snow-guide`; each: `<id>-idle-1..2.svg`, `<id>-wave-1..3.svg`, `<id>-talk-1..2.svg` and `<id>-portrait.svg`, in `world/residents/` |
| Effects (Part 4.4) | `world/effects/lamp-glow.svg (120 x 120, anchor at the bottom center of the glow)`, `world/effects/aurora-1..3.svg (1280 x 240, stretched)`, `world/effects/snowflake.svg`, `world/effects/leaf-red.svg`, `world/effects/leaf-orange.svg`, `world/effects/leaf-yellow.svg`, `world/effects/petal-jacaranda.svg`, `world/effects/petal-cempasuchil.svg`, `world/effects/raindrop.svg`, `world/effects/spotted-1..3.svg`, `ui/todo-sparkle-1..3.svg` |
| Physics toys (Part 5) | `world/toys/ball-1..4.svg`, `world/toys/goal.svg`, `world/toys/seesaw-left.svg`, `world/toys/seesaw-level.svg`, `world/toys/seesaw-right.svg`, `world/toys/swing-1..5 (1 = far left, 3 = still, 5 = far right).svg`, `world/toys/bounce-mushroom-idle.svg`, `world/toys/bounce-mushroom-squash.svg`, `world/toys/bounce-mushroom-stretch.svg`, `world/toys/sled-hill.svg`, `world/toys/sled-1..2.svg`, `world/toys/water-wheel-1..4.svg`, `world/toys/water-wheel-splash.svg`, `world/toys/marimba-stone-1..5.svg`, `world/toys/marimba-stone-1..5-pressed.svg`, `world/toys/paper-boat-1..2.svg`, `world/toys/magnet-rock.svg`, `world/toys/magnet-rock-glow-1..2.svg`, `world/toys/magnet-spoon.svg`, `world/toys/kite-1..3.svg` |
| Houses (Part 6) | `cabin`, `adobe`, `icecabin`, `bungalow`, `treehouse`, `hacienda`, `mushroom-house`, `observatory`; each: `houses/<id>-exterior.svg`, `-exterior-highlight.svg`, `-exterior-night.svg`, `houses/<id>-card.svg` (320 x 200), `world/walls/<id>-wall.svg`, `world/walls/<id>-window.svg`, `world/textures/indoor-<id>.svg` |
| Wallpapers and floors | `world/walls/wallpaper-stripes.svg`, `world/walls/wallpaper-stars.svg`, `world/walls/wallpaper-jungle.svg`, `world/walls/wallpaper-papel-picado.svg`, `world/walls/wallpaper-waves.svg`, `world/walls/wallpaper-chalkboard.svg`; `world/textures/floor-checkerboard.svg`, `world/textures/floor-grass-carpet.svg`, `world/textures/floor-ocean-tiles.svg`, `world/textures/floor-talavera.svg`, `world/textures/floor-stone.svg`, `world/textures/floor-parquet.svg` |
| Furniture (Part 7) | `hammock`, `bamboo-chair`, `shell-lamp`, `fishbowl`, `surfboard`, `bird-of-paradise`, `lab-bench`, `newton-cradle`, `pendulum-clock`, `model-rocket`, `solar-mobile`, `microscope`, `talavera-vase`, `alebrije`, `papel-picado`, `textile-cushion`, `cempasuchil-pot`, `pinata`, `sofa`, `fireplace`, `bunk-bed`, `record-player`, `wall-clock`, `window-seat`, `trampoline`, `toy-box`, `mini-slide`, `ball-pit`, `ping-pong`, `arcade-mini`, `potted-cactus`, `hanging-plants`, `aquarium-big`, `bird-cage-open`, `lantern`, `fountain-small`: each `furniture/<id>.svg`, `furniture/ghost/<id>.svg`, plus `furniture/<id>-1..3.svg` if it loops, `furniture/<id>-on.svg` if it switches on, `furniture/<id>-play-1..n.svg` while it moves |
| Hangout rooms (Part 8) | buildings `world/buildings/juice-bar.svg`, `world/buildings/stage.svg`, `world/buildings/museum.svg` (and `-highlight`, `-night`); interiors `world/walls/juice-wall.svg`, `world/walls/fiesta-wall.svg`, `world/walls/museum-wall.svg` with `indoor-<style>.svg` floors; room pieces `furniture/juice-counter.svg`, `furniture/stool.svg`, `furniture/fruit-crate.svg`, `furniture/fruit-board.svg`, `furniture/stage.svg`, `furniture/dance-floor.svg`, `furniture/speaker.svg`, `furniture/marimba.svg`, `furniture/trophy-wall.svg`, `furniture/giant-magnet.svg`, `furniture/museum-pendulum.svg`, `furniture/planet-models.svg`, `furniture/lever-display.svg`, `furniture/sled-exhibit.svg`; Market street decorations `world/decorations/kiosco.svg`, `world/decorations/market-stall.svg`, `world/decorations/market-stall-toys.svg`, `world/decorations/market-stall-crafts.svg`, `world/decorations/paleta-cart.svg`, `world/decorations/balloon-seller.svg` |
| Clothing and pets (Part 9) | clothing `sun-hat`, `party-hat`, `marigold-crown`, `headlamp`, `snorkel`, `star-glasses`, `shell-necklace`, `bandana`, `rash-guard`, `poncho`, `sandals`, `rain-boots`, `butterfly-net`, `juice-cup` with all 25 frames in `clothing/animated/`; pets `axolotl`, `macaw`, `armadillo` with the usual `pets/<id>-<animation>-<n>.svg` |
| Field guide (Part 10) | `guide/book.svg`; for each animal `guide/<type>.svg` and `guide/<type>-unknown.svg` (120 x 120 boxes, stretched) |
| Party decorations (Part 10) | dia-de-muertos: `world/decorations/papel-picado-string.svg`, `world/decorations/marigold-arch.svg`, `world/decorations/candles.svg`, `world/decorations/marigold-petals.svg`, `world/decorations/sugar-skull-tiles.svg`; posadas: `world/decorations/decorated-pine.svg`, `world/decorations/star-pinata.svg`, `world/decorations/farolito.svg`, `world/decorations/poinsettia.svg`, `world/decorations/string-lights.svg`; spring: `world/decorations/jacaranda.svg`, `world/decorations/party-kites.svg`, `world/decorations/flower-garland.svg`; science-fair: `world/decorations/fair-banner.svg`, `world/decorations/balloons.svg`, `world/decorations/model-volcano.svg`, `world/decorations/project-stand.svg` |
| Stamps (Part 10) | `stamps/shell.svg`, `stamps/shell-locked.svg`, `stamps/leaf.svg`, `stamps/leaf-locked.svg`, `stamps/book.svg`, `stamps/book-locked.svg`, `stamps/key.svg`, `stamps/key-locked.svg`, `stamps/sofa.svg`, `stamps/sofa-locked.svg`, `stamps/party.svg`, `stamps/party-locked.svg`, `stamps/ball.svg`, `stamps/ball-locked.svg`, `stamps/goal.svg`, `stamps/goal-locked.svg`, `stamps/moon.svg`, `stamps/moon-locked.svg`, `stamps/column.svg`, `stamps/column-locked.svg` |

**The new map** is `map/world-map-v2.svg`, 1000 x 625. Draw each room's landmark at these spots (x, y):

| Room | Spot |
|---|---|
| `plaza` | 480, 330 |
| `forest-trail` | 300, 330 |
| `lever-glade` | 130, 290 |
| `mushroom-hollow` | 290, 170 |
| `savannah-trail` | 650, 390 |
| `drone-post` | 830, 380 |
| `waterhole` | 690, 500 |
| `snowy-ridge` | 660, 200 |
| `ice-slide` | 840, 170 |
| `frozen-lake` | 660, 70 |
| `house` | 360, 410 |
| `palm-beach` | 480, 500 |
| `mangrove-boardwalk` | 300, 520 |
| `coral-lookout` | 140, 560 |
| `waterfall-cove` | 560, 585 |
| `market-street` | 440, 210 |
