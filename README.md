# ILO

ILO is a website where kids (ages 8 to 13) learn physics. They walk their avatar, Ilo, through rooms in a Forest, a Savannah, an Arctic and a central Plaza, and enter buildings that open minigames. In each minigame they snap code blocks together, and the game only works if they use the physics idea correctly. Winning earns coins to spend on clothes, a pet and furniture for their own house. The app is in Spanish first and English second.

It runs in any modern browser (Chrome, Edge, Firefox or Safari). It needs no accounts and no internet once it's running. Everything is free and open source.

This guide is written for people who don't program. Follow the steps in order.

---

## Part 1: Run ILO on your computer

### One-time setup

1. **Install Node.js.** Go to <https://nodejs.org>, download the version marked **LTS**, and install it like any other program. (Node.js is a free tool that runs the small local server ILO needs.)
2. **Open a terminal in the ILO folder.**
   - **Windows:** open the `ILO` folder in File Explorer, click the address bar, type `cmd` and press Enter.
   - **Mac:** open the Terminal app, type `cd ` (with a space after it), drag the `ILO` folder into the Terminal window, and press Enter.
3. **Install ILO's parts.** Type this and press Enter:

   ```bash
   npm install
   ```

   Wait until it finishes. It downloads the block editor (Blockly) and the physics engine (Matter.js) and copies them into the `vendor` folder. You only do this once.

### Every time you want to use ILO

1. Open a terminal in the ILO folder (step 2 above) and type:

   ```bash
   npm start
   ```

2. You'll see `ILO is running. Open http://localhost:8080 in your browser.`
3. Open your browser and go to **http://localhost:8080**.
4. When you're done, go back to the terminal and press **Ctrl + C** to stop ILO.

> **Why not just double-click `index.html`?** Browsers block web pages from reading lesson files straight from your disk. If you double-click it, ILO shows a message telling you to use `npm start`.

### Using the world

- The home page is the world. **Click** anywhere to walk there, or use the **arrow keys** or **W A S D**.
- Walk to a glowing edge with an arrow to go to the next **room**. The sign says where it leads.
- **Map** (bottom right) shows every room. Click one to go there.
- Walk up to a building and press **Go in**, or press **Enter**. Inside, walk up to the glowing **arcade machine** and press **Play** to start its minigame. There are six: gravity and both magnet games (Drone post, Savannah), friction (Ice slide, Arctic), and levers and heat (Lever glade, Forest).
- **Say** shows a list of phrases, and **Emotes** shows 8 emotes (also keys **1** to **8**). They appear in a bubble over the avatar. There is no typing. **9** dances and **0** sits.
- In the Arctic, **Snowball (F)** lets you click to throw snowballs. Hit the red-and-white targets.
- The **Coast** is south of the Plaza: a palm beach, a mangrove boardwalk over the water, a coral lookout with a glass floor, and a waterfall cove. Its Boathouse and Reef hut are "coming soon".
- **Wild animals** live in most rooms: pigeons in the Plaza, birds and squirrels in the Forest, meerkats and elephants in the Savannah, hares and seals in the Arctic, fish in the ponds and the sea. Walk up to them and most will hide or fly away.
- **Residents** (a professor owl, a tortoise shopkeeper, a capybara ranger and others) wave and give a tip when you walk up to them. A bouncing sparkle marks the ones you haven't met.
- **Field guide** (bottom right) collects every kind of animal you walk near (17), with a fact about each. Each new one gives 2 coins.
- **Toys** around the world: kick a ball into a goal (it rolls farther on snow than on sand), seesaw, swing, bouncy mushroom, sled hill, water wheel, marimba stones, paper boats, a magnet rock and a kite. Walk up and press **Use** (or **Enter**).
- **Market street** (north-west of the Plaza) has a juice bar, a fiesta hall with a dance floor that lights up when you dance (**9**), and a science museum that shows your stamps.
- From 6 pm the world turns to **evening**: lamps and windows glow, and the Arctic has northern lights. It snows in the Arctic, leaves fall in the Forest, and some days it drizzles at the Waterfall cove.
- **Parties** come on their dates (Día de Muertos, Posadas, a spring festival, a science fair) with decorations and a free gift.
- Shiny purple **gems** are hidden in every outdoor room (25 in all). Walk over one to collect it for 5 coins.
- **Stamps** opens your stamp book: 25 stamps for things like winning minigames, visiting every place, dancing or finding gems. Each one gives coins.
- Coins also come from a **daily reward** (20 coins the first time you play each day) and a 100-coin welcome gift.
- The **Shop** is inside the shop building in the Plaza. Walk to the counter. It sells colors, clothes for six body parts, six pets, house styles, wallpapers, floors and furniture in seven sets.
- **Sound** (top right) turns the music and sounds on or off. They start after your first click.
- **My house** is the house in the Plaza. Inside, press **Decorate** to drag furniture from your box into the house, move it, or drag it back down to the box. Buy new house styles (a treehouse, a beach bungalow, an observatory...) in the shop's **Houses** tab; the house in the Plaza changes to match. Walk up to a sofa, a lamp, a trampoline or a record player and press **Use**.
- **All lessons** (top right) opens the course path with every lesson, which is handy for teachers.

### Using a lesson (minigame)

- A lesson is a path of short steps, one at a time; the bar at the top shows how far you are. The steps: the mission, one or two **warm-up** questions, a **prediction**, **building and running** the program, a **"why?"** question, a **fair test** (some lessons), the **changed case**, and the **key idea**.
- On question steps, tap an answer and press **Check**. A panel slides up: green if right, orange with a tip if not, and you try again. Wrong answers never cost anything. **Continue** goes on. Enter also works the main button.
- On the building step, change the blocks under **"when Run is pressed"** and press **Run**. **Hint** shows one hint at a time. **Reset** puts the game back at the start. **Restore starting blocks** erases your program. **Continue** appears once you win.
- Steps you already reached can be opened again from the bar at the top. Leaving a lesson and coming back opens it at the same step; a finished lesson starts again from the top.
- Winning a lesson for the first time gives coins (50 unless the lesson says otherwise). Winning again gives none.
- **Back to the map** returns you next to the machine you played on.
- The **ES / EN** buttons switch the language. ILO remembers that choice.
- Progress (finished lessons, each kid's blocks, coins, clothes, pets, house and place in the world) is saved **only in this browser on this computer**.

---

## Part 2: Add a new lesson (no programming)

A lesson is **one text file** in the `lessons` folder. You only need a text editor: Notepad on Windows, TextEdit on Mac (choose *Format > Make Plain Text*), or the free [VS Code](https://code.visualstudio.com), which highlights mistakes.

### Step 1: Copy an existing lesson

Copy `lessons/gravity.json` and rename the copy, for example `lessons/gravity-moon.json`. Use only lowercase letters, numbers and dashes in the name.

### Step 2: Change the `id`

Open your new file. Change the `"id"` line so it matches the file name, without `.json`:

```json
"id": "gravity-moon",
```

### Step 3: Change the texts

Every text a kid sees has a Spanish and an English version, and both are required:

```json
"title": {
  "es": "Entrega en la Luna",
  "en": "Delivery on the Moon"
},
```

| Field | What it is |
|---|---|
| `concept` | The physics idea, shown above the title. |
| `title` | The lesson's name. |
| `intro` | The mission: what the kid has to do. |
| `learningGoal` | What the kid should understand. It's shown under "What you will learn". |
| `hints` | A list of hints, shown one at a time. Use four steps: what to notice, how to compare (change one thing only), the explanation, then a worked example. |
| `winCondition.feedback.tooShort` | Shown when the object lands **before** the target zone. |
| `winCondition.feedback.tooFar` | Shown when the object lands **past** the target zone. |
| `winCondition.feedback.notDropped` | Shown when the kid's program never drops the object. |
| `success` | Shown when the kid wins. |
| `reward` | Coins for winning the first time. Optional, and 50 if you leave it out. |

### Step 3a: Short goal, SEP link and "explain why"

- **`goal`** (required): the mission in about 20 words, shown big at the top. The longer story stays in `intro`, under "The full story".
- **`curriculum`** (required): how the lesson relates to Mexico's SEP program: `grade` (1 to 6), `phase`, `status` (`"direct"`, `"preparation"` or `"extension"`), `program` (the program and page, in ES and EN) and `books` (the SEP book pages a teacher can use, in ES and EN). The lesson list uses `grade` and `status` for its grade buttons.
- **`warmups`** (optional, recommended): one to three quick questions shown before the experiment, about everyday examples of the idea. Each has an `id`, a `question`, `options` (each with `id`, `label` and `feedback`) and the right one in `answer`. A `picture` (a file in `assets/`, like `"minigames/lever/rock.svg"`) is optional, on the question or on each option. Exactly one answer should be right.
- **`explain`** (optional, recommended): one "why?" question shown after a win, with answers (`id`, `label`, `feedback`) and the right one in `answer`. Wrong answers explain and let the kid try again. Never costs or pays coins.
- **`fairComparison`** (optional): after two runs, the kid ticks two runs that compare one setting fairly. `variable` is what should change (for example `"surface"`), `keep` lists what must stay the same (for example `["mass"]`).

### Step 3b: Prediction, changed case and teacher notes

These three parts help kids *understand*, not just win (docs/PLAN.md, Phase 10). Copy them from `gravity.json` and change the texts.

- **`prediction`** (optional): a question asked once before building, with 2 or 3 answers. Each answer lists the results it matches: `"won"`, or one of the `winCondition.feedback` names (`"tooShort"`, `"tooFar"`, `"tooHeavy"`). After the run ILO says whether the guess was right. It is never graded and pays no coins.
- **`challenges`** (optional, but every lesson should have one): the **changed case**. Same idea, new conditions, and a **different** right answer. It has its own `id`, `title`, `intro`, `success`, `reward` and `startingBlocks`. Under `world` and `winCondition`, write only the parts that change: they replace the same parts of the main lesson. For example, a new `zones` list moves the target, and a new `objects` list moves or changes the objects. It comes right after the main task in the lesson's path.
- **`teacher`** (required): notes for the teacher, shown on the **Teacher notes** page. Fields: `objective`, `decision` (what the kid decides), `evidence` (what shows understanding), `prerequisites`, `assumptions` (what the model simplifies), `vocabulary` (a list of words), `misconceptions` (a list), `opening` (question to start), `discussion` (question afterwards), `transfer` (a paper task with a new situation) and `meaning` (what "Solved" and "Applied" do and don't prove). All in ES and EN.

### Step 4: Change the game (optional)

All positions are in **meters**. `x` is measured from the left edge, and `y` is measured **up from the ground**. The screen is `width` meters wide and `height` meters tall.

| Field | What it changes |
|---|---|
| `world.gravity` | The gravity before the kid's blocks run (9.81 is Earth). |
| `objects` → `x`, `y` | Where the object starts. |
| `objects` → `velocityX` | How fast the drone flies to the right, in meters per second. |
| `objects` → `mass` | Starting mass in kilograms. |
| `objects` → `color` | Any web color, such as `"#c98a3d"` or `"red"`. |
| `zones` → `x`, `width` | Where the target zone starts and how wide it is. |
| `winCondition.timeLimit` | Seconds before the game stops. |

### Step 5: Choose the blocks

- `toolbox` lists the blocks the kid can drag in. You can use `"set_gravity"`, `"set_mass"` and `"drop"`, plus `"set_surface"` and `"push"` in friction lessons, `"move_fulcrum"` in lever lessons, `"magnet_pick"` and `"magnet_pole"` in magnet lessons, and `"set_rub_surface"` and `"rub"` in heat lessons.
- Lesson types (`world.model`): `"matter"` (falling, the default), `"slide"` (friction), `"lever"`, `"magnet"` (a crane with `crane.trips`, a `bin` and objects with a `material`: iron, steel, aluminum, copper, brass, wood, plastic, glass or magnet with a `pole`) and `"rub"` (`rub.surfaces`, `rub.timesOptions`, `rub.startTemperature`). Copy `magnets.json` or `heat.json` to start one of the new types.
- `startingBlocks` lists what's already placed under "when Run is pressed", top to bottom. Examples:

```json
"startingBlocks": [
  { "block": "set_gravity", "planet": "moon" },
  { "block": "drop", "object": "package" }
],
```

Planets you can use: `"moon"`, `"mars"`, `"earth"`, `"jupiter"`.

### Step 6: Add the lesson to the list

Open `lessons/catalog.json` and add your lesson's id. Lessons appear in this order. Mind the commas:

```json
{
  "lessons": ["gravity", "gravity-moon"]
}
```

### Step 7: Check your lesson

In a terminal in the ILO folder, run:

```bash
npm run check
```

- If you see `Everything is OK`, refresh the browser. Your lesson appears in **All lessons**. To put it on the map, do Step 9.
- If you see a `✗` line, it tells you the file and what's wrong. For a typing (JSON) error it gives a line number. The mistake is usually on that line or the line just before it, most often a missing comma or quote.

### Step 8: Make sure it can be won

Play your lesson and check that exactly the answer you intended wins. For example, if you move the zone, check which planet lands in it now. Do the same for the changed case: it must have one right answer, and a different one from the main task. A programmer can add your lesson to `tests/learning.test.js`, which checks this automatically for the three built-in lessons.

### Step 9: Put your lesson on a machine

Each room is one file in `world/rooms/`. Lessons are played on **arcade machines** inside buildings, for example `world/rooms/ice-slide-inside.json`. Find `"stations"` in an inside room and add a machine, or point an existing machine at your lesson:

```json
{
  "id": "moon-machine",
  "kind": "lesson",
  "lesson": "gravity-moon",
  "style": "arcade",
  "x": 360,
  "y": 330,
  "name": { "es": "Entrega en la Luna", "en": "Delivery on the Moon" },
  "description": { "es": "Minijuego de gravedad en la Luna.", "en": "Gravity minigame on the Moon." }
}
```

| Field | What it is |
|---|---|
| `kind` | `"lesson"` (opens a lesson), `"soon"` (closed, says "Coming soon"), `"shop"`, or `"room"` (a door into another room) |
| `lesson` | The lesson id, when `kind` is `"lesson"` |
| `style` | How it looks. Inside: `"arcade"` (a machine) or `"counter"`. Outside: `"tower"`, `"cabin"`, `"slide"`, `"shop"` or `"house"`. |
| `x`, `y` | Where it stands, in pixels. Every room is 1280 wide and 720 tall. Keep `y` at least 230 so its name sign fits. |

Run `npm run check` again. It warns you if the lesson doesn't exist, or if furniture or trees block the machine.

To make a **new building**: add a station with `"kind": "room"` and `"room": "<new inside room id>"` to an outdoor room. Then copy an inside room file (for example `lever-workshop-inside.json`), give it the new id, and make its exit lead back with `"to"` (the outdoor room) and `"toStation"` (the building's id). Add the new room to `world/world.json` without `mapX`/`mapY`, since inside rooms are not on the map. Inside rooms can list fixed furniture in `"furniture"`.

### Adding a new room (optional)

1. Copy a room file in `world/rooms/`, for example `waterhole.json`, and give the copy a new name and `"id"`.
2. Add it to `world/world.json`, with `mapX` and `mapY` (its spot on the world map picture, which is 800 by 500).
3. Connect it with **exits**. An exit is a rectangle at the edge of a room:
   - `to`: the room it leads to
   - `toExit`: the exit in that room where you appear
   - `spawn`: where you stand when you arrive through this exit

   Every exit needs a way back, so add a matching exit in the other room.
4. Run `npm run check`. It tells you about exits that lead nowhere, exits with no way back, and doors or exits blocked by trees or water.

**Water you can't walk on.** An area of type `"sea"` or `"shallows"` is water: Ilo can only cross it on a path with `"style": "boardwalk"` (see `mangrove-boardwalk.json`). The Coast's ground types are `"sand"` and `"jungle"`.

**Wild animals.** Add a `"critters"` list to a room. Animals that wander use `count`, for example `{ "type": "butterfly", "count": 3 }`. Animals with a home need its spot: `{ "type": "meerkat", "x": 360, "y": 570 }` (a burrow) or `{ "type": "seal", "x": 540, "y": 300 }` (an ice hole). Ducks and jumping fish find the room's pond or lagoon, or take a spot in the sea. Elephants walk along `y` and stop to drink at `x`. The kinds are: `butterfly`, `firefly`, `songbird`, `pigeon`, `squirrel`, `snow-hare`, `meerkat`, `seal`, `duck`, `jumping-fish`, `elephant`, `bird-flock`. Most of them run, hide or fly away when Ilo comes close.

**Residents and toys.** Add `"residents": [{ "id": "ranger", "x": 780, "y": 520 }]` to a room (names and tips are in `world/residents.json`), or `"toys": [{ "type": "swing", "x": 930, "y": 250 }]`. Toy types: `ball`, `goal`, `seesaw`, `swing`, `bounce-mushroom`, `sled-hill`, `water-wheel`, `marimba-stones`, `paper-boat`, `magnet-rock`, `kite`. `npm run check` makes sure they don't block anything.

**Parties.** `world/parties.json` lists each party's dates (`"start": "10-25"`, `"end": "11-03"`), falling petals, gift (a clothing id) and the decorations it adds to each room.

### Gems, stamps and targets

- **Gems:** an outdoor room lists its gems in `"collectibles"` with an `id` (unique in the whole world) and `x`, `y`.
- **Snowball targets:** add a decoration `{ "type": "target", "x": ..., "y": ... }` to an Arctic room.
- **Stamps:** `world/stamps.json` lists every stamp with its name, description, coin reward and condition. Condition types: `lesson`, `all_lessons`, `rooms` (with a `count`), `all_rooms`, `pet`, `furniture`, `said`, `danced`, `snowball_hits`, `gems`, `all_gems` and `clothing`. A new stamp `icon` needs a picture `assets/stamps/<icon>.svg` and `<icon>-locked.svg` from the designers.

### Changing shop items and prices

`world/items.json` lists every color, piece of clothing, pet and piece of furniture, with its price and its name in ES and EN. You can change prices and names freely. A **new** clothing item, pet or furniture piece also needs its pictures from the designers (see "Updating the art") and a shape version in `js/`, so `npm run check` warns you that a programmer must add it.

### Privacy: what ILO saves

ILO saves progress **only in this browser, on this computer** (`localStorage`, under the name `ilo.v1`). Nothing is sent anywhere: there are no accounts, no tracking, no ads and no chat with other people. What is saved: language, coins, lessons solved and applied (and when first solved), the step reached in each lesson, warm-up answers, the last 10 runs of each lesson, the avatar's look, pets, the house, stamps, where the avatar stands, and the sound setting. It does not save names (only the pet's name the kid picks from a list).

- To erase everything on a shared computer: **All lessons > Erase all my progress**.
- In private browsing, or if the browser blocks storage, ILO shows a warning: you can play, but nothing is kept.
- Before adding accounts, online hosting for real classes, or any sharing between kids, see the legal and safety notes in docs/PLAN.md (Phase 10, "Not in this phase").

### For teachers

**Showing the world:** `index.html?time=evening` (or `night`, `day`) shows that time of day, and `index.html?party=dia-de-muertos` (or `posadas`, `spring`, `science-fair`, `none`) shows a party on any date.

**Start of class:** open `lessons.html?grade=4` or `lessons.html?grade=5` to show that grade's lessons first, without walking through the world. After class, **Teacher summary for this computer** shows each lesson's runs, when the kid first won, hints used, warm-up answers, predictions, "why?" answers and fair comparisons, and downloads them as a spreadsheet. Erase progress between kids.

**All lessons** shows the lessons as a path per grade. Each round node fills as the kid moves through that lesson's steps; the next lesson to do glows. Nothing is locked. Each lesson has a **Teacher notes** link: the goal, what kids need to know first, what the model simplifies, key words in both languages, common wrong ideas, questions to open and close, a transfer task on paper, and what "Solved" and "Applied" mean. It prints cleanly. A lesson's progress shows as **Explored** (tried it), **Solved** (won the mission) or **Applied** (also won the changed case). To try ILO with a group of kids, follow [docs/PILOT.md](docs/PILOT.md).

### Publishing ILO

**On the web with GitHub Pages** (the repository must be public; the SEP books are never in it):

1. On github.com/santiagoroque/ILO, open **Settings**, then **General**, and under "Danger Zone" choose **Change visibility** > **Public**.
2. Open **Settings** > **Pages**. Under "Build and deployment" pick **Deploy from a branch**, branch **main**, folder **/ (root)**, and **Save**.
3. After a minute or two the game is at **https://santiagoroque.github.io/ILO/**. Every push to `main` updates it (the empty `.nojekyll` file makes GitHub serve every file as it is).

**On a USB stick or another host:** Run `npm run build-site`. The `dist/` folder is the whole game. Upload its contents to a static host (for example GitHub Pages, free for a non-commercial pilot), or copy it to a computer with Node.js and run `node tools/serve.js` inside it (see `dist/LEEME.txt`). Browsers do not run ILO from a double-clicked file, so it always needs a host or that small server. The SEP PDFs in `sources/` are never copied into `dist/`.

### Updating the art

All pictures, sounds and the font come from the design team's delivery and live in `assets/` (license in `assets/LICENSE.txt`: CC0 art and sounds, Nunito under the SIL Open Font License). When the designers send new files:

1. Find their `assets` folder (the one with `manifest.json` inside).
2. Run, with your own path:

   ```
   npm run import-art -- "/path/to/delivery/assets"
   ```

   Delivery 2 comes in rounds that only **add** pictures. For those, add `--add` at the end, or the pictures already imported would be removed:

   ```
   npm run import-art -- "/path/to/round/assets" --add
   ```

3. If the delivery has room layouts (`world/redesign-layouts-v3.json`, from the world redesign in `docs/DESIGN_PROMPT_3.md`), put them into the room files:

   ```
   npm run apply-layouts -- "/path/to/delivery/assets/world/redesign-layouts-v3.json"
   ```

   It moves doors, exits, residents, toys, animals, gems and furniture to the designers' spots and stops on any room that does not match the game's data.

4. Run `npm run check` and `npm test`. The check proves every door, exit and gem can be reached on foot; the tests list any picture the game needs that the new delivery is missing. `docs/DESIGN_PROMPT_2.md`, Part 16, lists every file name the game looks for.

File names matter: the game finds a picture by its name (for example `world/decorations/tree.svg` for a `"tree"` decoration). A new decoration, building style, clothing item, pet, furniture piece or stamp icon works as soon as a picture with the matching name exists. If a picture is missing, the game draws a simple shape instead, so nothing breaks.

### Common mistakes

| Message | Fix |
|---|---|
| `JSON error ... (line 12)` | Look at line 12 and the line before it: a comma, quote or bracket is missing or extra. |
| `needs text in Spanish ("es") and English ("en")` | Add the missing language. |
| `must be equal to one of the allowed values` | You used a block, planet or type ILO doesn't know. Check the spelling. |
| `"id" is "..." but should be "..."` | Make `"id"` match the file name. |
| `not in catalog.json` | Add the id to `lessons/catalog.json`. |
| `cannot be reached on foot` | Move the station or exit, or move the pond or decoration that blocks it. |
| `has no way back` | Add an exit in the other room that leads back. |

### What needs a programmer

Writing lessons with the existing blocks only takes JSON. A **new kind of block** (for example "push" or "set friction"), a **new kind of win condition**, or a **new building style** needs code changes in `js/` and in `schema/lesson.schema.json`. See the comments at the top of `js/blocks.js` and `js/win-conditions.js`.

---

## For programmers

| Command | What it does |
|---|---|
| `npm install` | Installs pinned dependencies and copies browser files to `vendor/` |
| `npm start` | Serves the app at http://localhost:8080 (`node tools/serve.js 3000` for another port) |
| `npm run check` | Validates lessons, `world/world.json`, every room, `items.json` and `phrases.json` against `schema/`; checks exits, ways back, reachability and that every item has a drawing |
| `npm run build-site` | Makes `dist/`: only what a browser needs, ready to publish or copy to a USB stick. Never includes `sources/` |
| `npm run import-art -- <folder>` | Copies a new art delivery into `assets/` (SVG pictures, OGG/MP3 sounds, font) and writes `assets/anchors.json` |
| `npm run apply-layouts -- <file>` | Puts the designers' layered room layouts into `world/rooms/*.json` (tools/apply-layouts.js) |
| `npm test` | Runs the physics (all three models against textbook formulas), lesson, room, path, save, pet, house and stamp tests with Node's built-in test runner |

On GitHub, the same check and tests run on every push (`.github/workflows/check.yml`). A green check next to a commit means they passed; a red cross means something to fix before sharing.

```
index.html                The world (home page)
lesson.html, lessons.html A lesson (a path of steps) / the course path
teacher.html              Teacher notes for a lesson (teacher.html?id=gravity)
summary.html              Teacher summary for this computer, with spreadsheet export
sources/                  SEP textbook PDFs (local only, never published)
css/style.css             Styles
js/                       App code (plain ES modules, no build step)
  world.js                  World page: rooms, walking, exits, menus, decorating, snowballs, gems, stamps, HUD
  world-data.js             Room logic: decorations, collisions, exits, path-finding (also used by tests)
  stamps.js                 Which stamps are earned, and stamp drawings
  sprites.js                Loads the art in assets/ and draws it (with the kid's avatar color)
  audio.js                  Recorded sound effects from assets/audio, and the area music composed for ILO (D18)
  world-draw.js             Drawing a room, exits, speech bubbles and emotes (and the Coast pieces)
  critters.js               Wild animals: how they wander, hide and flee (also used by tests)
  critter-draw.js           Drawing the wild animals
  field-guide.js            The Field guide panel
  residents.js, resident-draw.js   Residents, their tips and speech bubbles
  toys.js, toy-draw.js      Physics toys: ball, seesaw, swing, sled... (also used by tests)
  weather.js                Time of day and falling weather (also used by tests)
  parties.js                Seasonal parties by date (also used by tests)
  furniture-sets.js         The six new furniture sets and the hangout rooms' pieces
  world-map.js              The world map
  avatar.js, pet.js         Drawing the avatar (six clothing slots) and pets
  furniture.js, house.js    Furniture drawings and placement rules
  shop.js                   Shop panel
  home.js                   Course path page (lessons.html)
  steps.js                  Which steps a lesson has, in order (also used by tests)
  lesson.js                 Lesson page: the steps, Check/Continue, feedback sheet, blocks and simulator
  teacher.js                Teacher notes page
  summary.js                Teacher summary page
  lesson-loader.js          Loads and checks lesson files
  blocks.js                 Block definitions
  runner.js                 Blocks <-> steps (no eval)
  simulation.js             Physics models: Matter.js (gravity), slide (friction), lever (also run in tests)
  renderer.js               Canvas drawing
  win-conditions.js         Win condition types
  progress.js               The only file that saves data (localStorage)
  i18n.js                   Translations
locales/                  App text in es / en
lessons/                  Lesson files + catalog.json
assets/                   Art, sounds and font from the design delivery (npm run import-art)
world/                    world.json (room list), rooms/*.json, items.json (shop), phrases.json, stamps.json
schema/                   JSON Schemas for lessons, rooms, the world, items and phrases
tools/                    Local server, lesson checker, vendor copy step, art import, room layouts
tests/                    Tests
vendor/                   Copied libraries (do not edit)
docs/                     PLAN.md (decisions, roadmap), TASKS.md (task status), PILOT.md (trying it with kids),
                          ASSETS.md (where the art comes from), DESIGN_PROMPT*.md (briefs for the design team)
sources/                  SEP textbooks, only on this computer (not in git, not in the site)
```

Design decisions and the roadmap are in [docs/PLAN.md](docs/PLAN.md). Task status is in [docs/TASKS.md](docs/TASKS.md).

Libraries: [Blockly](https://github.com/RaspberryPiFoundation/blockly) 13.4.0 (Apache-2.0) and [Matter.js](https://github.com/liabru/matter-js) 0.20.0 (MIT). Their licenses are copied into `vendor/`.
