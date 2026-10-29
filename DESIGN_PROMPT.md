# ILO design brief

Copy everything below the line into your design tool or send it to a designer. It is written as one complete brief and can be pasted as-is.

---

# ILO: complete art and design brief

## Part 1. What ILO is and who it is for

ILO is a free, browser-based virtual world where kids aged 8 to 13 learn physics. It is built by three university students as a social project for schools in Latin America, many of which have old computers, slow internet and shared devices. It runs in any web browser with nothing to install.

A kid creates no account. They arrive in a cartoon world as **Ilo**, a small round mascot, and walk through rooms in a **Forest**, a **Savannah**, an **Arctic** and a central **Plaza**. Inside some buildings there are **arcade machines**. Each machine opens a physics minigame where the kid snaps together code blocks (like Scratch) to control a small simulation:

- **Gravity:** choose a planet so a drone's package lands in a delivery zone.
- **Friction:** choose a track surface so a sled stops at a station.
- **Levers:** move a fulcrum so a light sandbag can lift a heavy rock.

Winning gives coins. With coins, kids buy clothes for Ilo, adopt a pet, and buy furniture to decorate their own house. They also collect stamps, find hidden gems, throw snowballs in the Arctic, dance, sit, and chat using preset phrases and emotes (no typing, for safety).

The game already works, but everything is currently drawn with simple shapes in code. **We need you to create the complete visual identity and every asset**, so the game looks finished, warm and memorable, and kids want to come back.

The interface is in **Spanish first** and **English second**. All words are drawn by the game, so no text should be inside images.

## Part 2. The feeling we want

When a 10-year-old opens ILO, they should feel:
- **Welcome:** a soft, friendly place, never scary or noisy.
- **Curious:** every room has something to look at, a path leading somewhere, something hidden.
- **Ownership:** "this is my Ilo, my pet, my house."
- **Smart:** the science parts look as fun as the playful parts, not like homework.

**Visual keywords:** cozy, rounded, bright but not neon, handmade, storybook, toy-like, clean.

**Genre:** cozy kids' virtual worlds, the kind of game where you walk an avatar between illustrated rooms, play minigames, collect items and decorate a home. **ILO is inspired by that genre but must be 100% original.**

**Strict rules on originality:**
- Do not use, trace or imitate **Club Penguin** or any other existing game. That means no penguins, no puffles or similar round pets, no igloos as homes, no copied room layouts (town, plaza, dock, ski hill and so on, as they appear in that game), no similar logos or fonts, and no recognizable color schemes or UI.
- No real brands, logos or copyrighted characters.
- All work must be created new for ILO and licensed to the project under **CC0 or CC BY 4.0**.

**Cultural tone:** Latin American, warm and local, without stereotypes. Good touches include woven textile patterns on a rug or awning, terracotta and adobe in the Savannah house style, papel picado-like garlands for party decorations, and native plants (agave, bromeliads, ceibo-like flowers) mixed with the area's own plants. Keep it subtle and respectful.

## Part 3. Visual style rules (apply to everything)

**Perspective.** A gentle top-down 3/4 view, as if the camera is above and in front. Ground is seen from above, and objects stand up with their front face visible. Roofs show their front slope. Do not use strict isometric grids.

**Outlines.** Every character, object and building has a dark outline. Use one shared outline color (currently `#2b2d42`, a deep blue-grey, never pure black) at about **2.5 px** at 1x for objects and **3 px** for buildings. Interior detail lines are thinner (1.5 px) and can be a darker shade of the fill instead of the outline color.

**Shapes.** Rounded everywhere. No sharp spikes except where they mean something (crown tips, star points, pine branches). Corners of buildings and furniture are softened. Proportions are chunky and toy-like.

**Color.** Flat fills with one soft shade (darker, same hue) and one highlight (lighter) per surface. No gradients except the sky and glowing screens. Saturation is medium-high but never neon. Each area has its own palette (see Part 6).

**Light and shadow.** Light comes from the **top left**. Every standing object casts a soft oval shadow on the ground directly under it (black at about 15 to 18% opacity, no blur needed). Do not draw long cast shadows.

**Readability.** Assets must read clearly at 50% size on a cheap laptop screen. Test silhouettes by filling them black: you should still recognize them. Characters must always stand out from the ground; the outline helps.

**Text.** No words inside any image. Where a sign or plate needs text, leave a blank plate; the game writes the text in the kid's language.

**Animation style.** Squash and stretch, small bounces, 2 to 4 frames per loop, about 8 to 12 frames per second. Snappy, not floaty.

## Part 4. Technical rules (so assets plug straight into the game)

**File format.** SVG for every asset, flattened and optimized (no embedded bitmaps, no heavy filters, no masks unless necessary). Also export PNG at 1x and 2x.

**File size.** Single objects under 15 KB as SVG. Ground textures under 60 KB. The full set must stay light enough for slow school internet.

**Coordinates.** Every room is **1280 x 720** logical pixels. 1 SVG unit equals 1 pixel at 1x. Sizes in this brief are at 1x.

**Anchor point.** The game places each standing object by the point where it **touches the ground, at its bottom center**. In each SVG, that point must be at the **horizontal center and the very bottom of the viewBox**. If an asset must break this rule, document its anchor.

**Depth.** The game draws objects from back to front by their ground position. Shadows should stay close under the object, and nothing should hang far below the anchor.

**Recoloring.** Ilo's body color is changed in code. Fill the recolorable areas with placeholder colors: **`#FF00FF`** for the main body and ears, and **`#FF80FF`** for the belly. The game replaces them. Keep the outline as a separate stroke.

**Layers.** Clothing, pets and props are separate files that sit on top of Ilo, all on the same canvas size and anchor, so they line up in every frame.

**Naming.** Use exactly the ids in this brief: lowercase, words joined with dashes. Frames are numbered from 1, for example `ilo-side-walk-1.svg`.

**Fonts.** One free web font with full Spanish support (á é í ó ú ü ñ ¿ ¡). State its name and license.

## Part 5. Ilo, the avatar

### Personality

Ilo is curious, kind, a little clumsy and always excited to try again. Ilo is not a boy or a girl, and not any real animal; it is its own small creature, so every kid can see themselves in it.

### Shape

- **Body:** a soft egg shape, slightly wider at the bottom, about **36 px wide and 40 px tall**. The body is the head; there is no neck.
- **Belly:** a lighter oval on the lower front, about 22 px wide.
- **Ears:** two small round ears on top, slightly apart (about 12 px each). They can wiggle when Ilo is happy.
- **Eyes:** big, oval, white with large dark pupils and a tiny white shine, placed in the upper half of the body. In side view, both eyes shift toward the facing direction.
- **Cheeks:** soft pink ovals under the eyes.
- **Mouth:** a small curved smile. Wider and open when laughing or dancing.
- **Feet:** two tiny oval feet, a darker shade of the body, peeking out at the bottom.
- **Total size:** about 44 px wide and 52 px tall including ears and feet.

**Canvas:** each frame is a **64 x 64 viewBox** with the feet touching the ground at (32, 62).

**Body colors** (the shop sells these; the game recolors your placeholders): teal `#2bb3a3` (free default), coral `#f2765b`, sun `#f4c430`, grape `#8e6bd6`, sky `#4aa3e8`, leaf `#6cbf4b`. Check that the outline, eyes and cheeks look good on all six.

### Views

1. **Side** (facing right; the game mirrors it to face left): body slightly turned, eyes and belly shifted toward the front, one ear slightly overlapping the other.
2. **Front** (walking toward the camera): symmetrical, both eyes centered, belly centered.
3. **Back** (walking away): no face, no belly. Show the back of the body, both ears from behind, and a tiny round tail low on the back.

### Animations (each view)

- **Idle (2 frames, about 2 fps):** a slow breath. Frame 2 squashes the body 2% shorter and wider.
- **Walk (4 frames, about 10 fps):** a waddle. The body tilts about 5 degrees left and right and bobs up 3 px. Feet alternate lifting about 4 px.
- **Dance (4 frames, about 8 fps, front view only is enough):** a happy bounce up to 8 px, a body tilt of about 12 degrees side to side, ears flapping, a big open smile and eyes closed in joy on frames 2 and 4. Also small music notes floating up beside Ilo (separate file, 3 frames).
- **Sit (1 frame per view):** Ilo sits on the ground, body lower by about 7 px, feet sticking out in front, a relaxed face.

### Speech bubble and emotes

- **Speech bubble:** a white rounded rectangle (16 px corner radius) with a dark outline and a small tail pointing down to Ilo. Deliver it as 9-slice pieces (corners, edges, center and tail) so the game can stretch it to fit any phrase.
- **Emotes** (about 34 x 34, shown inside the bubble): `happy` (a yellow smiling face), `laugh` (squinting eyes, wide open mouth), `heart` (red, chubby), `star` (gold, 5 points, rounded), `idea` (a glowing yellow light bulb with rays), `question` (a blue circle with a white question mark drawn as a shape, not as a font), `coin` (a gold coin with an inner ring), `wave` (an open hand with motion lines).
- **Action icons** for the menu: **dance** (music notes) and **sit** (a small stool or cushion).

## Part 6. Clothing (18 items in 6 slots)

Each item is a separate file in the same 64 x 64 canvas, aligned with Ilo, for each view: `<id>-side.svg`, `<id>-front.svg`, `<id>-back.svg`. Feet items also need versions for the 4 walk frames. Every item also needs a **96 x 96 shop icon** showing it worn by a teal Ilo.

| Slot | id | Description |
|---|---|---|
| Head | `cap` | A red baseball cap. The brim points the way Ilo faces: forward in side view, toward the camera in front view. |
| Head | `flower` | A big pink five-petal flower with a yellow center, tucked beside one ear. |
| Head | `beanie` | A knitted blue beanie with a white fold and a fluffy white pompom. |
| Head | `explorer` | A tan safari or explorer hat with a wide brim and a dark band. |
| Head | `crown` | A small gold crown with three rounded points and a red gem. Rare, the most expensive head item. |
| Face | `glasses` | Round thin-framed glasses that make Ilo look studious. |
| Face | `sunglasses` | Dark, cool, slightly rounded sunglasses. |
| Face | `goggles` | Snow goggles: a strap around the head and one wide blue-tinted lens. |
| Neck | `scarf` | A red knitted scarf, with one end hanging down on the back side. |
| Neck | `bowtie` | A small red bow tie, centered at the front. |
| Neck | `medal` | A gold medal on a blue ribbon: the "science champion" look. |
| Body | `hoodie` | An orange-red hoodie covering the lower half of the body, with a front pocket and white drawstrings. |
| Body | `labcoat` | A white lab coat with a V collar, front line and a blue pen in the pocket. |
| Body | `vest` | A khaki safari vest, open at the front, with two pockets. |
| Feet | `sneakers` | White sneakers with a red stripe. |
| Feet | `boots` | Brown snow boots with a fluffy white cuff. |
| Hand | `magnifier` | A magnifying glass held at Ilo's side: wooden handle, glass lens with a shine. |
| Hand | `wrench` | A grey wrench held at the side. |

**Rules:**
- Hidden in the back view: face items. The scarf end, cap back, beanie and crown are still visible from behind.
- Body items must hug the round body shape; nothing should stick out past the outline except hoods and pockets.
- Every combination of 6 items must look good together. Test the explorer hat, glasses, scarf, vest, boots and magnifier at once.

## Part 7. Pets

Three original baby animals, one per area. They are small (about **40 px tall**), cute, with big eyes and simple shapes. They must not be round fluffballs or look like any existing game's pets.

| id | Animal | Look and personality |
|---|---|---|
| `fox` | Fox kit (Forest) | Orange with a white chest, a white tail tip, pointy ears and a bushy tail. Curious and playful. |
| `meerkat` | Meerkat pup (Savannah) | Sandy tan, stands upright like a lookout, dark eye patches, tiny arms held in front. Alert and funny. |
| `hare` | Arctic hare (Arctic) | Snow white, long ears with pink insides, a round fluffy tail, a pink nose. Gentle and bouncy. |

**Canvas:** a **48 x 48 viewBox**, with the feet at the bottom center. Draw the side view facing right; the game mirrors it.

**Animations:**
- **Idle (2 frames):** a blink or ear twitch.
- **Hop (3 frames):** crouch, jump up 6 px, land. Pets follow Ilo by hopping.
- **Happy (2 frames):** a little jump with a heart above. Shown after the kid wins a lesson.
- **Sad (1 frame):** droopy ears, for when happiness is low (it never reaches zero).

Also deliver a **96 x 96 shop icon** per pet, a **pet food** icon (a small bowl), and a **happiness bar** style (a pink fill in a rounded bar).

## Part 8. The world

The world is made of **rooms**. Each room is a single screen of **1280 x 720**. Kids walk to a glowing edge to go to the next room. Rooms are assembled by the game from a **modular kit** (ground, paths, water, decorations, buildings), because their layout is stored as data and checked automatically. **Please design the kit, not full painted backgrounds.** We would also love one painted **concept illustration** per area to show how the kit should look when assembled.

### 8.1 Area palettes and ground

| Area | Ground | Details | Path | Sky / mood |
|---|---|---|---|---|
| Forest | Fresh green grass (around `#64a84a`) | Darker grass tufts, tiny flowers, clover | Warm dirt or sand path | Dappled, cool shade, birdsong feeling |
| Savannah | Golden dry grass and earth (around `#e6c66e`) | Dry grass strokes, small pebbles | Reddish-tan dirt | Warm afternoon, heat haze feeling |
| Arctic | Soft blue-white snow (around `#eef6fb`) | Snow sparkles, footprints, small drifts | Packed blue-grey snow trail | Crisp, quiet, sparkly |
| Plaza | Warm stone tiles in a circle (around `#dccdb0`) | Concentric rings, tile joints | (it is the path hub) | Lively, sunny, the heart of town |
| Indoor | Wooden floor boards | Board lines, knots | (none) | Cozy, lamp-lit |

**Deliver:** a seamless **256 x 256** texture per ground type, a path style (paths are drawn as thick rounded lines 60 to 70 px wide; give a fill color, an edge color and optional pebbles), and a **soft edge** treatment for where two areas meet.

**Water:** `pond` (blue, with a lighter rim, a highlight and lily pads in the forest) and `ice-lake` (pale blue ice with white cracks and a snowy rim). Both are ovals that must scale from **80 to 210 px** radius, so give a 9-slice version or a simple shape style.

**Exits:** a gentle glowing patch at the room edge (pale yellow, semi-transparent, pulsing) and an **arrow sign** (white rounded arrow with outline) placed 70 px inside the edge. The sign has a blank plate for the next room's name.

### 8.2 The rooms (what is in each one)

Positions are in pixels from the top-left of the 1280 x 720 room.

1. **Plaza** (`plaza`), the heart of ILO. A large circular stone plaza (radius 270, centered at 640, 430) with a stone **fountain** in the middle. The **shop** building stands at the top center, and the kid's **house** at the top left. There are four lamp posts, a **notice board** to the right and two **benches**. Paths leave to the west (Forest), the east (Savannah) and the north-east (Arctic). Grass with trees and flowers surrounds the plaza. It should feel like a small, friendly town square.
2. **Forest trail** (`forest-trail`). A crossroads in a green forest: paths to the Plaza (east), the Lever glade (west) and the Mushroom hollow (north). A small pond in the lower left. Many round trees, bushes, mushrooms and wildflowers.
3. **Lever glade** (`lever-glade`). A sunny clearing with the **lever workshop** (a wooden cabin) in the middle-left, and a path from the east. Flowers and a few mushrooms. It feels like a hidden inventor's spot.
4. **Mushroom hollow** (`mushroom-hollow`). A magical dead end full of red-capped mushrooms of different sizes, a pond in the upper right and dense trees. The path comes in from the south. Slightly darker, enchanted mood.
5. **Savannah trail** (`savannah-trail`). Open golden grassland with flat-topped acacia trees, rocks and dry grass. Paths to the Plaza (west), the Drone post (east) and the Waterhole (south).
6. **Drone post** (`drone-post`). The **drone delivery tower** stands right of center, with a path from the west. Wide open sky feeling.
7. **Waterhole** (`waterhole`). A large waterhole (radius 150) in the lower right, with acacias, bushes and rocks around it. The path comes from the north. A calm place where animals would drink.
8. **Snowy ridge** (`snowy-ridge`). A snowy crossroads with snow-capped pines, icebergs and snow piles. Paths south (Plaza), east (Ice slide) and north (Frozen lake). Two **snowball targets** stand here.
9. **Ice slide** (`ice-slide`). The **ice slide lodge** in the middle, with a curving slide. One snowball target. Pines around it.
10. **Frozen lake** (`frozen-lake`). A big frozen lake (radius 210) filling the center, with pines and icebergs at the edges. Two targets near the shore. The path comes from the south. Quiet and beautiful.
11. **My house** (`house`). An interior: a back wall (top 220 px) with a window, and a wooden floor where the kid places furniture. The door is at the bottom center.
12. **Inside the shop** (`shop-inside`). A warm store with the **counter** in the middle, two bookshelves, plants, a rug, a lamp, an aquarium and a poster.
13. **Inside the drone post** (`drone-post-inside`). A clean, techy control room with the gravity **arcade machine**, a table and chair, a globe, a telescope and a planet poster.
14. **Inside the ice slide** (`ice-slide-inside`). A cozy ice lodge with the friction arcade machine, beanbags, a rug, a lamp and a plant.
15. **Inside the workshop** (`lever-workshop-inside`). A wooden inventor's workshop with the lever arcade machine, a workbench table, a chair, a bookshelf and tools.

### 8.3 Interior walls and floors (5 styles)

Each style has a **back wall** (1280 wide, 220 tall, with a trim band at the bottom), a **floor** texture, and a **window** (160 x 110, showing a bit of sky):

| Style | Used in | Look |
|---|---|---|
| `cabin` | Forest house option, workshop | Warm wood planks on the wall, darker wood trim, honey floorboards |
| `adobe` | Savannah house option | Smooth terracotta and peach adobe walls, woven textile trim, light tile floor |
| `icecabin` | Arctic house option, ice lodge | Pale blue ice-block walls with white seams, frosty trim, light floor |
| `shop` | Shop interior | Cream walls with a coral trim and striped wallpaper, warm wood floor |
| `tower` | Drone post interior | Light grey-blue panels, a blue trim with small lights, a clean grey floor |

### 8.4 Decorations (standing objects)

The footprint is the circle the avatar cannot walk into. Keep the art's base close to that size, so the collisions feel right.

| id | Area | Footprint radius | Art size (w x h) | Description |
|---|---|---|---|---|
| `tree` | Forest | 26 | 70 x 90 | A round leafy tree, with a canopy of 2 to 3 overlapping blobs and a short brown trunk. |
| `pine` | Arctic | 24 | 64 x 100 | A layered pine with snow on each layer's tip. |
| `acacia` | Savannah | 18 (trunk) | 100 x 75 | A flat-topped umbrella tree, with a thin forked trunk and a wide canopy. |
| `bush` | All | 16 | 44 x 34 | A rounded leafy bush. |
| `rock` | All | 22 | 48 x 30 | A grey rock with a highlight facet. |
| `iceberg` | Arctic | 32 | 70 x 55 | A pale blue crystal chunk with a white highlight. |
| `lamp` | Plaza | 8 | 22 x 65 | A street lamp with a dark post and a warm glowing light. |
| `fountain` | Plaza | 44 | 100 x 70 | A round stone basin with water, a central spout and a water arc. Animated water in 3 frames is welcome. |
| `board` | Plaza | 18 | 70 x 72 | A wooden notice board on two posts, with colorful pinned papers (no text). |
| `bench` | Plaza | 22 | 84 x 46 | A wooden park bench with a backrest. |
| `target` | Arctic | 24 | 50 x 76 | A round red-and-white target on a wooden stand. Needs a hit reaction (2 frames, wobble). |
| `grass` | Savannah | walkable | 20 x 18 | A tuft of dry grass. |
| `flowers` | Forest | walkable | 24 x 16 | Three small flowers (pink, yellow, white). |
| `mushroom` | Forest | walkable | 22 x 20 | A red cap with white dots on a white stem. |
| `snowpile` | Arctic | walkable | 30 x 16 | A soft mound of snow. |

**Collectibles and effects:**
- **Gem** (about 24 x 28): a purple crystal that floats and sparkles. Idle loop of 3 frames, plus a collect burst effect (3 frames).
- **Snowball** (14 x 14) and its ground shadow.
- **Splat** (30 x 12): a white snow burst on the ground.
- **"+1" hit pop** (no text: use a star burst).
- **Walk target ring:** a small pulsing white ellipse where the kid clicked.

### 8.5 Buildings (outdoor)

Each building's footprint is **170 x 120**. With the roof and details the art is about **220 x 260**, and the anchor is the **bottom center of the footprint**. The door is a rounded arch about 40 x 52 at the bottom center. Leave room above the roof for a blank **name plate** (rounded white pill).

| id | Name | Description |
|---|---|---|
| `shop` | Shop | A cheerful general store: cream walls, a scalloped red-and-white striped awning, a round coin emblem and a display window. It must be the most inviting building. |
| `house` | My house | A cozy small home: soft yellow walls, a blue roof, two windows with crossbars, a chimney and a welcome mat. |
| `tower` | Drone post | A white and coral delivery building with a tall square tower on one side, an antenna with a red light on top, and a package emblem. A small drone on the roof would be lovely. |
| `cabin` | Lever workshop | A wooden cabin with a dark roof, plank walls, a lever or seesaw emblem, and maybe a gear over the door. |
| `slide` | Ice slide lodge | An ice-block lodge with a pale blue roof and a curving ice slide coming off the right side down to the ground. A small flag on top. |

**States:**
- **Normal.**
- **Highlighted:** a soft yellow glow around the door when Ilo is close.
- **Coming soon:** the door blocked by crossed wooden planks, slightly faded.
- **Completed:** a small gold star badge that can sit next to the name plate.

### 8.6 Indoor stations

- **Arcade machine** (`arcade`, about **100 x 160**, anchor at the bottom center): a friendly blue cabinet with a rounded top, a glowing screen, a red joystick and two round buttons. The **screen art changes per minigame**: gravity (a planet with a falling package), friction (a sled on ice), lever (a seesaw with a rock). The screen glows in a 3-frame loop. Add a highlighted state (yellow outline glow).
- **Shop counter** (`counter`, about **260 x 100**): a wooden counter with a coral top edge, a cash box, a coin and maybe a little bell. It needs a highlighted state.

### 8.7 Furniture (12 pieces)

The anchor is at the bottom center. "Footprint" is the floor area the piece blocks (width x depth).

| id | Footprint | Art height | Description |
|---|---|---|---|
| `rug` | 180 x 90 | flat | An oval woven rug, red with a yellow inner ring. Walkable. Could use a Latin American textile pattern. |
| `plant` | 44 x 24 | 70 | A potted leafy plant in a terracotta pot. |
| `poster` | 100 wide | 70 | Hangs on the **back wall**: a dark blue poster showing the sun and planets. |
| `lamp` | 34 x 20 | 92 | A floor lamp with a warm yellow shade. |
| `chair` | 54 x 36 | 80 | A wooden chair. |
| `table` | 110 x 56 | 56 | A wooden table. |
| `beanbag` | 70 x 44 | 52 | A purple beanbag. |
| `globe` | 48 x 30 | 72 | A desk globe on a wooden stand. |
| `bookshelf` | 110 x 34 | 132 | A tall wooden shelf full of colorful books. |
| `bed` | 150 x 84 | 112 | A cozy bed with a headboard, a pillow and a blue blanket. |
| `telescope` | 64 x 40 | 92 | A white telescope on a tripod, pointing up. |
| `aquarium` | 120 x 40 | 102 | A fish tank on a wooden stand, with orange fish and a plant (fish can animate). |

Each piece also needs a **96 x 96 icon** for the shop and the decorate box, plus a **"can't place here"** overlay (red circle with a slash) and a **ghost** style (60% opacity) for dragging.

### 8.8 World map (800 x 500)

An illustrated overview map, like a treasure map drawn on a nice paper card. The Forest is a green island on the left, the Arctic a white-blue area at the top right, the Savannah a golden area at the bottom right, and the Plaza a stone circle in the center. Draw a small landmark at each room's spot (do not write names; the game adds them):

| Room | Spot (x, y) | Landmark |
|---|---|---|
| `plaza` | (400, 270) | fountain |
| `forest-trail` | (250, 290) | signpost |
| `lever-glade` | (110, 250) | cabin |
| `mushroom-hollow` | (250, 150) | big mushroom |
| `savannah-trail` | (560, 340) | acacia |
| `drone-post` | (700, 330) | tower |
| `waterhole` | (560, 450) | pond |
| `snowy-ridge` | (530, 180) | pine |
| `ice-slide` | (690, 150) | slide |
| `frozen-lake` | (530, 60) | frozen lake |
| `house` | (330, 380) | little house |

Add dotted paths between connected rooms, and a **"you are here"** pin (a small Ilo head).

## Part 9. Minigame scenes (inside the lesson screen)

The lesson screen has a mission card and a code block editor on the left, and a **game canvas** on the right. The scene is drawn at **50 px per meter**, with y measured up from the ground. Deliver each scene as separate layers (background, ground, moving objects), because the game moves objects with real physics.

### 9.1 Gravity: "Delivery on another planet" (16 x 9 m, 800 x 450 px, plus 40 px of ground)

**Story:** a drone flies right carrying a package and lets go; the kid chooses which planet the delivery happens on.

- **Four skies** (800 x 410 gradients with a few details): **Moon** (deep navy with stars and a far Earth), **Mars** (dusty orange with a pale sun), **Earth** (friendly blue with clouds), **Jupiter** (tan and cream bands with a hint of the red spot).
- **Ground strip** for each planet: grey dust (Moon), red soil (Mars), grass (Earth), swirly tan (Jupiter), with **ruler tick marks** every meter (labels are drawn by the game).
- **Drone** (about 60 x 24): a friendly delivery drone with two rotors (spinning in 2 frames) and a hook.
- **Package** (30 x 30): a cardboard box with tape.
- **Delivery zone:** a soft green glowing column (70 px wide) with a landing pad on the ground.
- **Landing marker:** a dashed line plus a small flag where the package lands.

### 9.2 Friction: "The braking sled" (16 x 9 m)

**Story:** a sled leaves an ice slide at 5 m/s, and the kid picks the surface of the braking track so it stops at the station.

- **Sky:** a crisp arctic sky with mountains.
- **Ice slide ramp** on the left edge, curving down to the track.
- **Sled** (50 x 25): red, with curled metal runners. A small Ilo-like rider is optional but lovely.
- **Four track textures** (a strip 12 px tall across the ground): **ice** (shiny pale blue with streaks), **snow** (white and soft), **wood** (plank boards), **sand** (dotted golden). Each must be clearly different at a glance, since the lesson depends on it.
- **Station zone:** a little station platform with a green glow.
- **Speed lines** behind the moving sled (optional, 2 frames).

### 9.3 Levers: "Lift the rock" (12 x 7 m)

**Story:** a 30 kg rock sits on one end of a plank. The kid moves the fulcrum and drops a 10 kg sandbag on the other end to lift the rock.

- **Background:** a sunny forest clearing.
- **Plank** (400 x 10): a wooden beam that tilts. It is drawn rotated by the game, so deliver it level.
- **Fulcrum** (40 x 30): a solid wooden or stone triangle.
- **Fulcrum position markers:** small dots on the ground at 4, 5, 6, 7 and 8 m. The selected one is highlighted.
- **Rock** (40 x 30, about 30 kg): a heavy grey boulder. Leave a blank area where the game prints "30 kg".
- **Sandbag** (30 x 25): a tied burlap sack, with a blank area for "10 kg".
- **Rope and hook bar** at the top, holding the sandbag before it is dropped.
- **Success effect:** sparkles when the rock lifts.

## Part 10. Stamps (14 badges)

Round badges about **96 x 96** with a scalloped edge, like postage or passport stamps, with a gold rim when earned. Each needs an **earned** version (full color) and a **locked** version (soft grey, faded icon).

| Icon id | Stamp | Icon idea |
|---|---|---|
| `package` | First delivery (win gravity) | cardboard box |
| `sled` | Perfect stop (win friction) | sled |
| `lever` | Lever pro (win levers) | seesaw on a triangle |
| `flask` | Young scientist (win all) | science flask with bubbles |
| `map` | Explorer (8 places) | folded map with a pin |
| `globe` | World traveler (all places) | globe |
| `paw` | Pet friend | paw print |
| `house` | Decorator (5 furniture) | small house |
| `bubble` | Chatterbox (10 phrases) | speech bubble |
| `music` | Dancer | music note |
| `snowball` | Snow champion (5 hits) | snowball |
| `gem` | Gem finder (5 gems) | gem |
| `crown` | Gem master (all gems) | crown with a gem |
| `shirt` | Stylish (3 clothes) | t-shirt |

Also a **"new stamp!" celebration** (a stamp slamming down with sparkles, 4 frames) and the **stamp book page** design (a booklet with a grid of 14 spaces).

## Part 11. Interface (screens and components)

Deliver mockups at **1366 x 768** (school laptop) and **375 x 812** (phone), plus a **component sheet**.

### 11.1 Components

- **Buttons:** primary (blue fill, white label), secondary (white fill, outline), small, and icon buttons. Each has default, hover, pressed, disabled and selected states. Rounded (about 12 px), with a 3 px outline and a small bottom shadow, so they feel like chunky toy buttons.
- **Coin counter pill:** a gold coin icon plus a number, on a white pill with an outline.
- **Toggles:** ES/EN segmented control, and Sound on/off.
- **Panels and dialogs:** white, 18 px corners, 3 px outline, a soft bottom shadow, a title row and a close button.
- **Cards:** shop item card (preview, name, price button, "wearing" state with a green border), stamp card, lesson card.
- **Tabs:** for the shop (Colors, Head, Face, Neck, Body, Feet, Hand, Pets, Furniture). The selected tab is filled.
- **Prompt card:** appears at the bottom when Ilo is near a building: name, a "completed" badge, a description and a big action button (Play / Go in / Open shop / Coming soon).
- **Toast:** a dark rounded pill at the top for messages ("Forest", "You found a gem! +5 coins").
- **Menus:** the phrase menu (a 2-column list of 16 phrases) and the emote menu (a 4 x 2 grid of emote icons plus Dance and Sit buttons).
- **Icons:** coin, map, speech, emote, stamp, snowball, decorate, sound on, sound off, close, back, hint, run, reset.

### 11.2 Screens

1. **World (Plaza).** The HUD sits in the top corners: logo and coins (left); sound, "All lessons" and ES/EN (right). The toolbar sits at the bottom right: Snowball (Arctic only), Stamps, Map, Say, Emotes, and Decorate (house only). A small help line at the bottom left, and the prompt card at the bottom center.
2. **Shop dialog** with tabs and item grids, the coin balance in the header, and the adopt-a-pet name chooser (a grid of name buttons).
3. **Stamp book dialog.**
4. **World map dialog.**
5. **House in decorate mode:** the room shrinks above a bottom panel with house-style buttons and a scrolling "box" of furniture icons with counts. Show a piece being dragged (valid and invalid).
6. **Lesson screen:** "Back to the map", the title and concept, a mission card, a "What you will learn" disclosure, the block editor (we use Blockly; please suggest block colors and a workspace background), the game canvas, Run / Reset / Hint buttons, and success (green), retry (orange) and hint (yellow) message styles.
7. **Loading screen** and a friendly **error screen** ("The lesson could not be opened").

### 11.3 Accessibility

- Text contrast at least WCAG AA (4.5:1 for body text) on every panel and button.
- Never rely on color alone. Selected states also change their shape or border, and locked stamps are both faded and outlined differently.
- Touch targets at least 44 x 44 px.
- Readable at 125% browser zoom.
- A visible keyboard focus style: a thick yellow outline.

## Part 12. Logo and identity

- **ILO wordmark:** rounded, friendly, bold letters. The "O" could be Ilo's face or a planet. It must work on light and dark backgrounds and in one color.
- **App icon:** Ilo's face on a colored rounded square, at 512 x 512, 192 x 192 and a 32 x 32 favicon.
- **Tagline** (the game draws the text): "Aprende física construyendo juegos con bloques" / "Learn physics by building games with blocks".

## Part 13. Sound (optional, nice to have)

Today the game makes its sounds with code. If you also make audio, deliver short original effects as OGG and MP3 (step, coin, door, pop, stamp, throw, splat, hit, click) and a 20 to 30 second seamless music loop for each area (forest, savannah, arctic, plaza, indoor). All must be original and CC0 or CC BY.

## Part 14. Delivery format

```
assets/
  README.md          every file with its viewBox, anchor point and frame count
  tokens.json        colors, fonts, radii, shadows, spacing
  style-sheet.pdf
  logo/
  ui/                component sheet, mockups, icons/
  avatar/            ilo-<view>-<animation>-<frame>.svg, emotes/, bubble/
  clothing/          <id>-<view>.svg (feet: <id>-<view>-<frame>.svg), icons/
  pets/              <id>-<animation>-<frame>.svg, icons/
  world/
    textures/        forest, savannah, arctic, plaza, indoor-<style>
    walls/           <style>-wall.svg, <style>-window.svg
    decorations/     <id>.svg
    buildings/       <id>.svg, <id>-highlight.svg, <id>-soon.svg
    stations/        arcade-<lesson>.svg, counter.svg
    effects/         gem, snowball, splat, exit-glow, exit-arrow, target-ring
    concept/         one painted concept per area
  furniture/         <id>.svg, icons/
  minigames/         gravity/, friction/, lever/
  stamps/            <icon>.svg, <icon>-locked.svg
  map/               world-map.svg, you-are-here.svg
```

## Part 15. How we will work together

**Round 1, for approval before anything else:**
1. The style sheet and `tokens.json`.
2. Ilo in all three views (idle), in all six colors.
3. One concept illustration per area (Forest, Savannah, Arctic, Plaza).
4. One building (the shop) and one decoration per area.
5. The world screen mockup.

**Round 2:** the full avatar animations, all clothing and pets.

**Round 3:** all decorations, buildings, interiors, furniture and the world map.

**Round 4:** minigame scenes, stamps, the remaining UI and the logo.

**Final checklist before delivery:**
- [ ] Nothing resembles Club Penguin or any other game, brand or character.
- [ ] No text inside any image.
- [ ] Every file uses the exact id, size, viewBox and bottom-center anchor from this brief.
- [ ] Ilo recolors correctly with the two placeholder colors.
- [ ] All 6 clothing slots line up together in every view and walk frame.
- [ ] Everything is readable at 50% size on a cheap screen.
- [ ] Text contrast passes WCAG AA.
- [ ] Files are optimized SVG within the size budget.
- [ ] Every file and font is CC0 or CC BY 4.0, and the README lists the license.
