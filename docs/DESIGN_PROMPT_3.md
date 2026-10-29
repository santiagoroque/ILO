# ILO design brief 3: the world redesign, round 2

Copy everything below the line into your design tool or send it to the design team. It follows the world redesign you delivered (`ilo-world-redesign.zip`, revision "distributed-room-redesign") and replaces its room list with the one the game actually uses. All rules from DESIGN_PROMPT.md (style, outline `#2b2d42`, light from the top left, no text in images, CC0) and DESIGN_PROMPT_2.md (file names, Part 16) still apply.

---

# ILO: world redesign, round 2 (complete instructions)

## Part 1. What we want, in one paragraph

We love the direction of your redesign: big landmarks around the edges, a wide open clearing in the middle where kids can gather, readable entrances, the closer camera and the framing trees in the corners. **Keep that look.** This round makes it fit the real game. The game has **23 rooms** (not 19), each with fixed connections to other rooms, buildings that must lead somewhere, and things that live in the rooms (animals, residents, toys, hidden gems, party decorations) that need space. Today's redesign has buildings that lead nowhere, missing arcade machines, a lost boardwalk, and no Market street. Most importantly, it arrives as **flattened pictures**: the game cannot light a window at night, highlight a door, show "coming soon" boards, change the kid's house style or let Ilo walk behind a tree in a flat picture. So this round, **please deliver every room in layers, with the walking and door data** described in Part 4.

## Part 2. What stays exactly the same

- Ilo, all clothing, pets and every existing asset file: do not redraw or rename them. The placeholder colors `#FF00FF` and `#FF80FF` stay in Ilo's files.
- The visual style of Direction 06 and of your redesign.
- Every file name and anchor already delivered. If you change an existing asset, give it a **new** name and tell us; never overwrite.
- Room size: **1280 x 720** logical pixels, (0, 0) at the top left, y going down.
- No words, numbers or letters in any image. The game writes every label in Spanish or English.

## Part 3. The camera and the size of everything

We keep your closer camera in **all 23 rooms** (including the four you have not drawn yet), so Ilo is the same size everywhere.

| What | Scale in the room | About this size on screen |
|---|---|---|
| Ilo (anchor (32, 62)) | **1.9** | 120 px tall, 70 px wide; stands on a footprint about 50 x 18 px |
| Pets | 1.9 | 60 to 90 px tall |
| Residents (Part 4.3 of brief 2) | 1.9 | about 170 x 210 px |
| Wild animals | 1.9 | a pigeon about 40 px, an elephant about 300 x 230 px |
| Outdoor buildings | **1.65** (as you did) | about 360 x 430 px, footprint 280 x 200 px |
| Arcade machines inside | 2.3 (as you did) | about 230 x 370 px |
| Furniture inside | 2.0 (as you did) | |
| Physics toys | 1.9 | sizes in Part 6 |
| Decorations | free, between 1.4 and 3.5 | |

**Walking speed:** Ilo crosses the whole room in about 5 seconds, so a room should have one wide clearing and short walks to each destination.

**Screen corners the game covers with buttons** (keep doors, exits, gems and toys out of these):

| Zone | Room area | What covers it |
|---|---|---|
| Top left | x 0 to 300, y 0 to 60 | ILO logo and coins |
| Top right | x 980 to 1280, y 0 to 60 | Sound and language buttons |
| Bottom left | x 0 to 380, y 670 to 720 | Help text |
| Bottom right | x 780 to 1280, y 660 to 720 | Toolbar: Stamps, Field guide, Map, Say, Emotes |

An exit can still be at the bottom center (x 520 to 760).

## Part 4. What to deliver for every room (the format)

For each of the 23 rooms, a folder `world/rooms-v2/<room id>/` with:

1. **`ground.svg`** (1280 x 720): everything flat and behind, meaning sky, hills, distant trees, terrain, paths, water, floor boards, walls of interiors, marks on the ground. **No** building, decoration, furniture, toy, character or foreground tree in it. This is drawn first, under everything.
2. **`foreground.svg`** (1280 x 720, transparent): only the framing pieces that are always in front of Ilo, such as the big trees, palms and pines cropped in the bottom corners. Optional if a room has none. Ilo must never need to walk where foreground covers the floor (mark it as not walkable).
3. **Placements** in one shared file, `world/redesign-layouts-v2.json` (format below): every building, decoration, furniture piece and arcade machine as a separate object with its asset file, anchor position and scale. The game draws these itself, sorted by their ground point, so Ilo can walk in front of and behind them.
4. **Walking data** in the same file: where Ilo can walk, what blocks, where the exits and doors are, and the spots listed per room in Part 5.
5. **`preview.png`** (1280 x 720, with an Ilo standing in the clearing) for review only. The game does not load it.

Also keep the flattened `stages/<room>.svg` you made for review; the game will not use it.

### 4.1 The layout file

```json
{
  "revision": "room-redesign-2",
  "rooms": {
    "plaza": {
      "ground": "world/rooms-v2/plaza/ground.svg",
      "foreground": "world/rooms-v2/plaza/foreground.svg",
      "avatarScale": 1.9,
      "start": [640, 560],
      "walk": [[60, 470], [1220, 470], [1240, 690], [40, 690]],
      "blocked": [{ "shape": "ellipse", "x": 235, "y": 560, "rx": 90, "ry": 34, "why": "fountain basin" }],
      "objects": [
        { "id": "shop", "asset": "world/buildings/shop.svg", "x": 1030, "y": 440, "scale": 1.65,
          "role": "building", "station": "shop", "door": [1030, 470], "footprint": [890, 330, 1170, 440] },
        { "id": "fountain", "asset": "world/decorations/fountain.svg", "x": 235, "y": 575, "scale": 1.6,
          "role": "decoration", "footprint": { "x": 235, "y": 565, "rx": 85, "ry": 30 } }
      ],
      "exits": [
        { "to": "forest-trail", "edge": "left", "rect": [0, 470, 40, 160], "arrive": [90, 550], "sign": [70, 520] }
      ],
      "spots": {
        "resident": [],
        "toys": { "ball": [760, 600], "goal": [1110, 600], "seesaw": [1120, 360] },
        "gems": [[1180, 640], [110, 650]],
        "critters": { "pigeon-ground": [[420, 470, 900, 650]] },
        "perches": [],
        "party": { "overhead": [[300, 330, 980, 360]], "ground": [[560, 600], [720, 600]] }
      }
    }
  }
}
```

**Field rules:**
- **Coordinates:** all are room coordinates. Rectangles are `[left, top, right, bottom]`.
- **`walk`:** one polygon (or a list of them) of the floor Ilo may stand on, at the feet.
- **`blocked`:** shapes inside `walk` that block feet, such as water, a fountain basin or a building's base. Building and decoration footprints can be given on the object instead.
- **`role`:** one of `building`, `decoration`, `furniture`, `arcade`, `counter`.
  - Buildings and arcades also need `station` (the id from Part 5) and `door`: the point in front of the door where Ilo stands to enter or play.
- **`footprint`:** the ground area the object blocks, never the whole picture. A tree blocks its trunk, not its canopy.
- **`exits`:** one per connection in Part 5, with the exact `to`. Each exit needs:
  - `rect`: the trigger strip at the room edge, at least 40 deep and 140 long.
  - `arrive`: where Ilo appears when coming from that room, inside the walkable area and at least 60 px from the strip.
  - `sign`: where the game draws its arrow and the destination name.
- **`spots`:** the places Part 5 asks for, in that room.
- **Water and other special shapes:** give `pond`, `ice-lake`, `lagoon`, `sea`, `shallows` and `boardwalk` as named polygons under `"water"`, so the game knows where the duck swims, where fish jump, where a heron wades, and where a boardwalk lets Ilo cross water.

### 4.2 Things the game draws on top of your rooms (leave room for them)

| Thing | When | What it needs from you |
|---|---|---|
| Building name plate (white pill above the roof) | Always | Clear sky or hills above each building's roof, about 160 x 40 |
| Door glow and highlight version | When Ilo is near | The door art from the existing `-highlight` files lines up at the same scale |
| Lit windows | Evening (6 pm to 6 am) | Each building's existing `-night` file (to come in round B) at the same scale |
| Exit arrow and destination name | Always | A clear patch at each `sign` point, about 160 x 60 |
| Speech bubbles | When chatting | About 320 x 120 free above the clearing |
| Evening tint, northern lights | Evening | Nothing; the Arctic rooms' top 240 px will show northern lights, so keep that strip as background |
| Falling snow, leaves, rain, petals | By room and party | Nothing |
| Party decorations | Party dates, Plaza and Market street only | The `party` spots in Part 5 |

## Part 5. The 23 rooms, one by one

The ids, names, connections and contents below are the game's real ones. **Exits must lead exactly where the table says.** The edge is a suggestion that matches the world map; if your composition works better with a different edge, keep the destination and tell us.

### 5.1 Plaza: `plaza` (Plaza central / Central plaza)

- **Mood:** the heart of town, sunny and busy. Keep your three-landmark composition, but the middle landmark changes (below).
- **Exits (5):**
  - Left → Sendero del bosque (`forest-trail`).
  - Right → Sendero de la sabana (`savannah-trail`).
  - Bottom center → Playa de palmeras (`palm-beach`).
  - **Top left → Calle del mercado (`market-street`).**
  - **Top right → Cresta nevada (`snowy-ridge`).**
  - The two top exits need visible paths going up and out of the room between or beside the buildings. Your current Plaza has buildings across the whole top; open two gaps.
- **Buildings (2):**
  - **Shop** (`station: "shop"`, asset `world/buildings/shop.svg`), its door leads inside.
  - **My house** (`station: "my-house"`). This building **changes** with the house style the kid buys: cabin, adobe, ice cabin, beach bungalow, treehouse, courtyard house, mushroom cottage and observatory (brief 2, Part 6). Draw its spot so all 8 fit the same footprint (280 x 200 at scale 1.65) and the same door point. The treehouse and the bungalow are raised, so leave about 120 px more height above this one.
  - **No cabin in the middle.** Use that space for the path to the Market street, or for the notice board and a planter.
- **Decorations to keep:** the fountain, notice board, 2 benches, 4 lamps (they glow in the evening), flowers, trees and bushes framing the edges.
- **Toys:**
  - A ball and a goal. The goal is 190 x 130; the ball needs a clear lane of stone about **650 px long** in front of the goal, because it rolls far on stone (it can bounce off a building at the end).
  - A seesaw, 300 x 100, in a side pocket.
- **Animals:** 4 pigeons walk on the stone (give an open stone area of at least 500 x 200) and 2 butterflies.
- **Gems:** 2 hidden spots: tucked behind a bench or near a planter, but reachable.
- **Party:** this room is decorated on party days. Give:
  - One overhead band about 700 px long: strings of papel picado, lights or flower garlands hang across it between two posts or lamps.
  - Ground spots for 6 to 8 small props (candles, farolitos, potted poinsettias, balloons, a model volcano, a project stand).
  - A spot for a Christmas tree (about 150 x 280).
  - An arch over the bottom exit.
- **Start point:** the game starts here; the kid arrives in the middle of the clearing.

### 5.2 Forest trail: `forest-trail` (Sendero del bosque / Forest trail)

- **Mood:** a crossroads in a green forest, cool shade.
- **Exits (3):**
  - Right → Plaza.
  - Left → Claro de las palancas (`lever-glade`).
  - Top → Hondonada de hongos (`mushroom-hollow`).
- **Buildings:** **none.** Remove the cabin from your version; the cabin belongs to the Lever glade.
- **Water:** a pond, as you drew it. A duck swims on it, a fish jumps out of it, and a paper boat sits on its bank (spot on the bank, walkable).
- **Toys:** a swing, about 170 x 210, hanging from a frame. Place it under or near a big tree, with 120 px of free space on both sides for the swing's arc.
- **Resident:** **Luma**, the capybara ranger, standing near the crossroads (`resident` spot, about 170 x 210 plus speech bubble space above).
- **Animals:** 2 songbirds and 1 squirrel on open grass, 3 butterflies.
- **Gems:** 2.

### 5.3 Lever glade: `lever-glade` (Claro de las palancas / Lever glade)

- **Mood:** a sunny clearing, a hidden inventor's spot.
- **Exits (1):** right → Sendero del bosque. It is a dead end.
- **Buildings (1):** the **lever workshop** (`station: "lever-workshop"`, asset `world/buildings/cabin.svg`). Its door leads to the workshop with the lever and heat machines.
- **Animals:** 3 butterflies, 1 songbird, 1 squirrel; give a flower meadow.
- **Gems:** 2.

### 5.4 Mushroom hollow: `mushroom-hollow` (Hondonada de hongos / Mushroom hollow)

- **Mood:** a magical, darker dead end full of mushrooms. Your giant mushrooms are lovely; keep them.
- **Exits (1):** bottom → Sendero del bosque.
- **Water:** a pond, with a fish and a paper boat on its bank.
- **Toys:** the **bouncy mushroom**, about 133 x 114, a toy Ilo jumps on. It must read as different from the decorative giant mushrooms: springy, a brighter red cap and a soft highlight, with **280 px of headroom** above it because Ilo bounces up to about 260 px.
- **Animals:** 6 fireflies (they glow in the evening), 1 butterfly.
- **Gems:** 2.

### 5.5 Savannah trail: `savannah-trail` (Sendero de la sabana / Savannah trail)

- **Mood:** open golden grassland with flat-topped acacias.
- **Exits (3):**
  - Left → Plaza.
  - Right → Puesto de drones (`drone-post`).
  - Bottom → Abrevadero (`waterhole`).
- **Buildings:** **none.** Remove the cabin from your version.
- **Toys:** a ball and a goal, with a lane of about 350 px (the ball rolls less on grass), and a kite lying on the ground at a `kite` spot. The kite flies about 320 px above Ilo, so keep the space above that spot as open background (sky, hills), with no tall tree.
- **Animals:**
  - **2 meerkat burrows**, small dark holes about 50 x 20 on open ground, away from paths.
  - A bird flock flies across the top 200 px.
- **Gems:** 2.

### 5.6 Drone post: `drone-post` (Puesto de drones / Drone post)

- **Mood:** wide open sky, a delivery station.
- **Exits (1):** left → Sendero de la sabana.
- **Buildings (1):** the **drone tower** (`station: "drone-post"`, asset `world/buildings/tower.svg`). Your version has a cabin here; please use the tower. Its door leads to the room with 3 arcade machines.
- **Resident:** **Profe Vera**, the owl, standing near the tower's door.
- **Animals:** 1 meerkat burrow, a bird flock.
- **Gems:** 2.

### 5.7 Waterhole: `waterhole` (Abrevadero / Waterhole)

- **Mood:** calm, a place where animals drink.
- **Exits (1):** top → Sendero de la sabana.
- **Water:** the waterhole, as big as you like (at least 350 x 200). A fish jumps in it.
- **Animals:**
  - An elephant family walks slowly all the way across the room every half minute, along a **clear band 1,280 px long and about 240 px tall** (the elephant is about 300 x 230). They stop at a `drink` point at the water's edge. The band can pass behind the corner foreground trees.
  - A bird flock flies across the top.
- **Gems:** 2.

### 5.8 Snowy ridge: `snowy-ridge` (Cresta nevada / Snowy ridge)

- **Mood:** a snowy crossroads with snow-capped pines.
- **Exits (3):**
  - Bottom → Plaza.
  - Right → Tobogán de hielo (`ice-slide`).
  - Top → Lago congelado (`frozen-lake`).
- **Buildings:** **none.** Remove the ice lodge from your version; it belongs to the Ice slide.
- **Toys:** the **sled hill**: a snowy slope in one upper corner where Ilo sits on a sled and slides down. The slide goes diagonally down and to the side: about 260 px down the slope, then it glides about **400 px on flat snow**. Keep that whole lane (about 660 x 150 px, diagonal) free of trees and rocks.
- **Snowball targets:** 2 (`world/decorations/target.svg`), with open snow in front of them for throwing.
- **Resident:** **Nuk**, the snowy owl, near the targets.
- **Animals:** 2 snow hares.
- **Gems:** 2.
- **Top 240 px:** background only (northern lights in the evening).

### 5.9 Ice slide: `ice-slide` (Tobogán de hielo / Ice slide)

- **Exits (1):** left → Cresta nevada.
- **Buildings (1):** the **ice slide lodge** (`station: "ice-slide"`, asset `world/buildings/slide.svg`), with its curving slide. The door leads to the friction machine.
- **Snowball target:** 1. **Animals:** 1 snow hare. **Gems:** 2. **Top 240 px:** background only.

### 5.10 Frozen lake: `frozen-lake` (Lago congelado / Frozen lake)

- **Mood:** quiet and beautiful.
- **Exits (1):** bottom → Cresta nevada.
- **Water:** a **big frozen lake** filling much of the room (at least 600 x 300). Ilo cannot walk on it.
- **Animals:** **2 seal ice holes**, about 60 x 26, on the lake (seals pop out of them).
- **Snowball targets:** 2, near the shore.
- **Toys:** the **magnet rock**, about 114 x 95, on the shore, and a lost spoon lying on open snow about **280 px** away from it. The spoon slides to the rock, so keep that strip clear.
- **Gems:** 2. **Top 240 px:** background only.

### 5.11 Palm beach: `palm-beach` (Playa de palmeras / Palm beach)

- **Mood:** bright midday, turquoise sea.
- **Exits (3):**
  - **Top → Plaza.** Your version has jungle across the top; open a sandy path up and out.
  - Left → Muelle del manglar (`mangrove-boardwalk`).
  - Right → Cascada escondida (`waterfall-cove`).
- **Buildings (1):** the **boathouse** (`station: "boathouse"`, coming soon, assets `boathouse-soon`, `-soon-night`).
  - Give it a short **wooden pier** from the boathouse into the sea. Ilo can walk on it; give it as a `boardwalk` polygon.
- **Sea:** along the **bottom** of the room, with the shoreline **almost straight across** (no more than 20 px up or down). The animated wave strips (`world/water/sea-edge-1..4.svg`, 256 px wide) are laid in one straight row along it.
- **Toys:** a ball and a goal on the sand. The lane can be shorter (250 px), because the ball stops quickly in sand.
- **Resident:** **Coco**, the manatee boat builder, near the boathouse.
- **Animals:**
  - 3 crabs on wet sand near the water.
  - A toucan and a macaw sit on top of tall palms. Give at least **3 tall palms**, and list each crown's point as a `perches` spot.
  - Two fish jump in the sea: give 2 spots in the water.
- **Gems:** 1.

### 5.12 Mangrove boardwalk: `mangrove-boardwalk` (Muelle del manglar / Mangrove boardwalk)

- **Please bring back the boardwalk.** Your version turned this room into a beach. This room is a **zigzag wooden walkway over shallow green water**, among mangrove trees on arching roots.
- **Exits (2):**
  - Right → Playa de palmeras: a strip of sand where you arrive.
  - Bottom → Mirador del arrecife (`coral-lookout`).
- **Walking:** Ilo can walk **only** on the sand strip and the boardwalk; everything else is shallow water (`shallows`). The boardwalk is about 70 px wide (at the 1.9 scale, make it about 110 px wide) and connects both exits.
- **Decorations:** mangroves standing in the water, and a canoe tied to a post (bobbing).
- **Animals:** 2 herons wade in open water (give 2 or 3 open water areas at least 200 x 120), 2 fish jump (2 spots in the water), 1 crab on the sand.
- **Gems:** 1, on the sand or on the boardwalk.

### 5.13 Coral lookout: `coral-lookout` (Mirador del arrecife / Coral lookout)

- **Exits (1):** top → Muelle del manglar.
- **Buildings (1):** the **reef hut** (`station: "reef-hut"`, coming soon).
- **The glass-floor deck:** make it a **main landmark**, about 420 x 250 at the 1.9 scale. Your version is too small (scale 1.3). It sits at the water's edge, and Ilo can walk on it. A sea turtle and fish swim under the glass: the game draws them in an oval in the middle of the deck.
- **Sea:** on two sides, with tide pools on the rocks and stepping stones in the water.
- **Animals:** 2 crabs, 2 fish jump in the sea.
- **Gems:** 1.

### 5.14 Waterfall cove: `waterfall-cove` (Cascada escondida / Waterfall cove)

- **Mood:** magical jungle clearing.
- **Exits (1):** left → Playa de palmeras.
- **Water:** the waterfall falls **into** a lagoon (at least 380 x 220); its foam meets the lagoon's edge.
- **Toys:**
  - The **water wheel**, about 230 x 266, at the lagoon's edge, ideally where a stream from the waterfall could reach it.
  - The **marimba stones**: a row of 5 flat stones about 65 px apart, on walkable ground, which play notes when Ilo steps on them.
- **Animals:** 2 toucans and a macaw on palm crowns (at least 3 tall palms; list the `perches`), 3 butterflies, a fish in the lagoon.
- **Gems:** 1.

### 5.15 Market street: `market-street` (Calle del mercado / Market street), new for you

- **Mood:** a lively Mexican street with a kiosco (bandstand), tianguis stalls and string lights; the town's hangout.
- **Exits (1):** bottom → Plaza (it connects to the Plaza's top-left exit).
- **Buildings (3)**, each with a door leading inside (assets from brief 2, Part 8; draw them now if they don't exist yet):
  - **Juice bar** (`station: "juice-bar"`).
  - **Fiesta hall** (`station: "stage"`).
  - **Science museum** (`station: "museum"`).
- **Decorations:**
  - The **kiosco**, about 260 x 240 at scale 1, as the centerpiece of the street; it should still leave a clearing.
  - 3 market stalls (fruit, toys, crafts), an ice-pop cart, a balloon seller, 2 lamps and a bench.
- **Resident:** **Lala**, the hummingbird musician, at the kiosco.
- **Animals:** 3 pigeons, 2 butterflies.
- **Gems:** 1.
- **Party:** decorated on party days like the Plaza: an overhead band across the street, ground spots for 4 small props, and a spot for an arch.

### 5.16 My house: `house` (Mi casa / My house)

- **This room starts empty.** The kid places all furniture, so draw **no furniture** in it. Your version has a bed and a plant baked in; please remove them.
- **Exits (1):** a door at the bottom center back to the Plaza.
- **Walls and floors:** the back wall must be a **flat band across the full width** (from the top down to the floor line), and the floor a **flat area**. The game lays the kid's bought wallpapers and floors on exactly those two areas, and the 8 house styles have their own wall and floor art (brief 2, Part 6). Side walls in perspective are welcome as a separate `foreground.svg` frame, as long as the wallpaper band stays flat.
- **Floor line:** tell us the y where the wall meets the floor (about 250 in today's game). The floor below it must be open for furniture.
- **Window:** keep one window on the back wall (the style's window art is placed there).

### 5.17 Inside the shop: `shop-inside` (Dentro de la tienda / Inside the shop)

- **Exits (1):** door at the bottom center back to the Plaza.
- **Counter:** the shop counter (`role: "counter"`, `station: "counter"`), with a clear spot in front where Ilo stands to open the shop.
- **Resident:** **Don Tito**, the tortoise shopkeeper, beside the counter.
- **Furniture (as live objects):** 2 bookshelves, 2 plants, a rug, a lamp, the aquarium and the poster.

### 5.18 Inside the drone post: `drone-post-inside` (Dentro del puesto de drones / Inside the drone post)

- **Three arcade machines, not one:**
  - Gravity (`station: "gravity-machine"`, `arcade-gravity.svg`).
  - Magnet crane (`station: "magnet-machine"`, `arcade-magnets.svg`).
  - Magnet poles (`station: "poles-machine"`, `arcade-magnet-poles.svg`).

  Place them side by side or in an arc, each with a clear standing spot in front, at least 230 px apart.
- **Exits (1):** door at the bottom center back to the Drone post.
- **Furniture:** table, chair, globe, telescope, planet poster, plant.

### 5.19 Inside the ice slide: `ice-slide-inside` (Dentro del tobogán de hielo / Inside the ice slide)

- **One arcade machine:** friction (`station: "friction-machine"`, `arcade-friction.svg`).
- **Exits (1):** door at the bottom center back to the Ice slide.
- **Furniture:** rug, 2 beanbags, lamp, plant. Ice-cabin walls.

### 5.20 Inside the workshop: `lever-workshop-inside` (Dentro del taller / Inside the workshop)

- **Two arcade machines, not one:** lever (`station: "lever-machine"`, `arcade-lever.svg`) and heat (`station: "heat-machine"`, `arcade-heat.svg`).
- **Exits (1):** door at the bottom center back to the Lever glade.
- **Furniture:** workbench table, bookshelf, chair, lamp, plant; tools on the wall.

### 5.21 Inside the juice bar: `juice-bar-inside` (Dentro de la juguería / Inside the juice bar), new for you

- **Exits (1):** door at the bottom center back to the Market street.
- **Furniture:**
  - A juice counter with blenders (about 260 x 90 at scale 1; animated blenders welcome).
  - 3 stools in front of it (Ilo can sit on them).
  - 2 fruit crates and a wall board with fruit pictures (no words).
  - 2 tables with chairs, 2 papel picado garlands and hanging plants.
- **Colors:** warm orange and cream.

### 5.22 Inside the fiesta hall: `stage-inside` (Dentro del salón de fiestas / Inside the fiesta hall), new for you

- **Exits (1):** door at the bottom center back to the Market street.
- **Furniture:**
  - A stage with curtains along the back (about 400 x 130 at scale 1).
  - A **dance floor** of light-up tiles, about 320 x 200 at scale 1, in the middle. It lights up under Ilo when the kid dances, so it must be fully walkable.
  - 2 speakers, a marimba (Ilo plays it), 2 papel picado garlands, 2 lanterns.
- **Colors:** a deep purple room with warm lights.

### 5.23 Inside the museum: `museum-inside` (Dentro del museo / Inside the museum), new for you

- **Exits (1):** door at the bottom center back to the Market street.
- **Furniture:**
  - A **trophy wall** on the back wall with **16 empty frames** in 2 rows of 8. The game puts the kid's stamps inside them, so keep each frame empty and about 44 x 52 at scale 1.
  - A giant horseshoe magnet with paper clips, a swinging pendulum, planet models, a lever display and a sled exhibit, each on a low plinth.
  - 2 plants.
- **Colors:** light stone and grey-blue, calm like a real museum.

## Part 6. Sizes of the toys at the 1.9 scale (for spacing)

| Toy | Room(s) | Picture size | Free space it needs |
|---|---|---|---|
| Ball | Plaza, Savannah trail, Palm beach | 50 x 50 | A lane toward the goal: 650 px on stone, 350 on grass, 250 on sand |
| Goal | Same | 190 x 130 | Open ground in front |
| Seesaw | Plaza | 300 x 95 | 60 px around |
| Swing | Forest trail | 170 x 210 | 120 px on both sides |
| Bouncy mushroom | Mushroom hollow | 133 x 114 | 280 px headroom |
| Sled hill | Snowy ridge | 380 x 190 | A 660 x 150 diagonal lane |
| Water wheel | Waterfall cove | 230 x 266 | At the lagoon's edge |
| Marimba stones | Waterfall cove | 5 stones in a row 300 px long | Walkable all along |
| Paper boat | Forest trail, Mushroom hollow | 57 x 46 | On the pond's bank |
| Magnet rock + spoon | Frozen lake | 114 x 95 | A clear 280 px strip to the spoon |
| Kite | Savannah trail | 95 x 115 when flying | Open background about 320 px above the spot |

The toy pictures themselves are round B of brief 2; draw your rooms so they fit these sizes.

## Part 7. The new world map

Draw `map/world-map-v2.svg` at **1000 x 625**, a paper-card look like today's map. Areas:
- The Forest on the left.
- The Arctic at the top right.
- The Savannah at the bottom right.
- The Coast along the bottom left and center, with the sea at the bottom edge.
- The Plaza and the Market street in the middle.

Draw one small **landmark** at each of these **16 spots** (the game puts the names; no text):

| Room | Spot (x, y) | Landmark |
|---|---|---|
| Plaza central | 480, 330 | fountain |
| Mi casa | 360, 410 | small house |
| Calle del mercado | 440, 210 | kiosco |
| Sendero del bosque | 300, 330 | signpost |
| Claro de las palancas | 130, 290 | cabin |
| Hondonada de hongos | 290, 170 | big mushroom |
| Sendero de la sabana | 650, 390 | acacia |
| Puesto de drones | 830, 380 | tower |
| Abrevadero | 690, 500 | waterhole |
| Cresta nevada | 660, 200 | pine |
| Tobogán de hielo | 840, 170 | slide |
| Lago congelado | 660, 70 | frozen lake |
| Playa de palmeras | 480, 500 | palm and umbrella |
| Muelle del manglar | 300, 520 | boardwalk |
| Mirador del arrecife | 140, 560 | glass deck |
| Cascada escondida | 560, 585 | waterfall |

Connect them with dotted paths along the room connections in Part 5. Also deliver:
- `map/you-are-here-v2.svg`, a small Ilo-head pin.
- **6 small machine markers**, `map/machine-<lesson>.svg`, about 28 x 28: gravity, magnets, magnet-poles, friction, lever and heat. They will sit beside the Puesto de drones (3), the Tobogán de hielo (1) and the Claro de las palancas (2), so kids can click a machine on the map and go straight to it.

Interiors are not on the map.

## Part 8. Night, parties and the existing animated pieces

You don't need a night version of the ground; the game tints it. Building night versions (`<id>-night.svg`), animated loops of trees, palms and water, and the party decorations are listed in brief 2 and come in their own rounds. Your ground and foreground layers should not include anything that animates (fountain water, waterfall, waves, flags): those are separate animated objects the game already has.

## Part 9. How many files, in total

| What | Count |
|---|---|
| `ground.svg` | 23 (one per room) |
| `foreground.svg` | about 15 (the outdoor rooms; interiors only if they have a front frame) |
| `preview.png` | 23 |
| `world/redesign-layouts-v2.json` | 1, with all 23 rooms |
| New buildings for the Market street (juice bar, fiesta hall, museum): normal, highlight, night | 9, if not drawn yet |
| Market street pieces (kiosco, 3 stalls, ice-pop cart, balloon seller) | 6, if not drawn yet |
| Hangout room furniture (brief 2, Part 8): juice counter, stool, fruit crate, fruit board, stage, dance floor, speaker, marimba, trophy wall, giant magnet, pendulum, planet models, lever display, sled exhibit | 14, if not drawn yet |
| Map, pin, machine markers | 8 |
| A contact sheet of all 23 previews | 1 |

## Part 10. Order of work (if the night runs short)

1. **The 19 rooms you already redesigned**, fixed as in Part 5, in layers with the layout file:
   - First the Plaza, Forest trail, Savannah trail and Snowy ridge (they connect everything).
   - Then the rest.
2. **The Market street and its three buildings.**
3. **The three hangout interiors.**
4. **The new map** with markers.

Please deliver whatever is finished, with a note listing what is not, rather than nothing.

## Part 11. Checklist before delivery

- [ ] 23 rooms, with the exact room ids, station ids and exit destinations from Part 5.
- [ ] No building that leads nowhere; no duplicate of another room's building.
- [ ] `ground.svg` has no objects; every building, decoration and furniture piece is in the layout file as its own object.
- [ ] Every exit has a trigger strip, an arrival point and a sign spot, and none sits in the screen corners of Part 3.
- [ ] Every door and machine has a standing point in front of it, inside the walkable area.
- [ ] The walkable area reaches every exit, door, toy, gem and resident from the start or arrival points.
- [ ] Water, the frozen lake and the shallows are outside the walkable area; the boardwalk and the pier are inside it.
- [ ] Footprints cover only the ground an object stands on.
- [ ] The house interior has no furniture, a flat wall band and a flat floor.
- [ ] Ilo is drawn at 1.9 in every preview.
- [ ] No text in any image; CC0 for new work; nothing resembling another game.
- [ ] Every new file is listed in `manifest.json` with its viewBox and anchor, as before.

## Part 12. What the game will do with your delivery

- **Import:** we import it with `npm run import-art -- <folder>/assets --add`, which keeps everything already imported.
- **Room data:** a tool turns your layout file into the game's room files.
- **Drawing order:** the game draws `ground.svg`, then your objects and every live thing (Ilo, pets, animals, residents, toys) sorted by their ground point, then `foreground.svg`.
- **Checks:** our checker proves that every exit, door, gem and toy can be reached on foot. If something cannot be reached, we will send you the room id and the point.
- **Review:** we will send screenshots of every integrated room, on a computer and a phone, for your review.
