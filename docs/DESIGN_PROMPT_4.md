# ILO Animal Redesign Brief (brief 4)

Every animal in ILO looks like a first draft next to Ilo: flat shapes, thin uneven lines, single-dot eyes, no shine and no shadow. This brief asks you to redraw all of them in Ilo's finished style: the 17 wild animals and their 2 holes, the 6 residents and the 6 pets. That is 191 SVG files: 89 for wild animals, 48 for residents and 54 for pets (27 of them brand new). Everything keeps today's file names, sizes and ground points, so the new drawings go into the game with no code change.

## 1. Match Ilo: the style rules

Values measured from Ilo's own drawing (avatar/ilo-front-idle-1.svg).

- **Outline:** Color #2b2d42, round joins and round caps. Width in canvas units: 2.5 around the body and head, 2 around limbs, ears, tails and feet, 1.4 to 1.7 for inner lines (mouth, wing edges, shell plates), 0.9 around the eye whites. Use these same numbers on every animal, small or big: the game draws animals at the same scale as Ilo, so equal numbers give equal lines on screen. Only the butterfly, firefly and bird flock may go down to 1.2 for their outline, because they are tiny.
- **Shapes:** Soft, rounded, a little bottom-heavy, like Ilo's pear-shaped body. No shapes made of a plain ellipse with sticks attached: legs, necks and tails taper and bend. Characters (residents and pets) have big heads, about 40 % of their height. Wild animals can be more natural, but stay chunky and cute.
- **Eyes:** Build every eye like Ilo's: a tall cream oval (#fff7df) with a 0.9 outline, a dark pupil (#2b2d42) that fills most of it and leans toward where the animal looks, and a small white catchlight dot at the top. Never a single dot for an eye. On the tiniest animals (under about 24 px), keep the dark pupil and the white catchlight and drop the cream oval.
- **Shine:** One or two short white strokes at 40 % opacity (#ffffff66, width 1.2) on the upper left of the head or body, like the shine on Ilo. Shells, beaks and wet fur can take a small extra shine.
- **Belly and face:** A lighter tone of the body color for the belly, chest, muzzle or face disc, with no outline, like Ilo's belly.
- **Shading:** At most one darker tone of the body color, as a soft shape on the side away from the light (low right), with no outline. No gradients, no texture.
- **Cheeks and mouth:** Residents and pets: small warm cheek marks like Ilo's, and a small curved mouth (stroke 1.4). Wild animals: a small mouth only where the animal has one you would see.
- **Ground shadow:** An ellipse in black at 16 % opacity under the feet, as wide as the body, like Ilo's. Only on frames where the animal stands on the ground; none while flying, swimming or inside a hole.
- **Color:** Natural colors for each animal, as bright and warm as Ilo's colors (teal #2bb3a3, coral #f2765b, sun #f4c430, sky #4aa3e8, leaf #6cbf4b), with the game's earth tones (clay #c96847, ochre #dfb553, olive #73844b, teal #377e80) for clothes and props. Avoid the greyish, washed-out fills many animals have today.
- **Direction:** Side views face right; the game mirrors them for walking left. Residents and pet icons face the viewer, turned a quarter toward the right.
- **Never:** No text, letters or numbers in any picture. No outlines in other colors. No copied characters or brands. Artwork is CC0, as before.

## 2. What must stay the same

- The exact file names below, in the same folders (world/critters/, world/residents/, pets/, pets/icons/).
- The same canvas (viewBox) size and the same ground point (anchor) for every file, as listed. The game places each animal by that point, so a new drawing drops in with no code change. Draw inside the canvas; nothing may be cut at its edges.
- The same number of frames per animation. Each frame is a whole drawing, not a part.
- Flying and swimming frames keep their own ground point where it differs (listed): it is the middle of the body, not the feet.
- A manifest.json entry for every file (viewBox, anchor, frames, fps), as in every delivery, so `npm run import-art -- <folder> --add` reads it.

## 3. Residents

| Who | Where | Role | Files | Canvas | What to change |
|---|---|---|---|---|---|
| Professor Vera (owl) | Drone post | The scientist who invites kids into the drone post. | profe-idle-1..2, -talk-1..2, -wave-1..3, -portrait (8 files) | 90 x 110, ground point (45, 110); 96 x 96, ground point (48, 96) | Keep the round glasses and lab coat. Add Ilo eyes behind the glasses, feather tufts, a lighter face disc, wing-hands that can point. |
| Mr. Tito (tortoise) | Inside the shop | The calm shopkeeper. | tendero-idle-1..2, -talk-1..2, -wave-1..3, -portrait (8 files) | 90 x 110, ground point (45, 110); 96 x 96, ground point (48, 96) | Keep the straw hat and apron. Give the shell clear plates, an older friendly face with Ilo eyes and small eyebrows. |
| Luma (capybara) | Forest trail | The forest ranger who explains the animals. | ranger-idle-1..2, -talk-1..2, -wave-1..3, -portrait (8 files) | 90 x 110, ground point (45, 110); 96 x 96, ground point (48, 96) | Today she reads as a bear. A capybara has a big blunt square snout, small round ears high on the head, eyes high on the face, no visible tail. Keep the ranger vest and binoculars. |
| Coco (manatee) | Palm beach | Builds the boat at the boathouse. | boatbuilder-idle-1..2, -talk-1..2, -wave-1..3, -portrait (8 files) | 90 x 110, ground point (45, 110); 96 x 96, ground point (48, 96) | Keep the sailor cap. A soft round snout with whisker dots, a chubby grey body with a lighter belly, flipper-hands that can hold a tool. |
| Lala (hummingbird) | Market street (the kiosk) | Plays music at the kiosk; loves parties. | musician-idle-1..2, -talk-1..2, -wave-1..3, -portrait (8 files) | 90 x 110, ground point (45, 110); 96 x 96, ground point (48, 96) | A shiny green body with a ruby throat (use a highlight shape for the shine), a long thin beak, small fast wings. Talk frames can hover with blurred wings. |
| Nuk (snowy owl) | Snowy ridge | Teaches snowballs and the Arctic. | snow-guide-idle-1..2, -talk-1..2, -wave-1..3, -portrait (8 files) | 90 x 110, ground point (45, 110); 96 x 96, ground point (48, 96) | Today it reads as a penguin. A snowy owl is round and white with small dark speckles, yellow Ilo eyes (irises yellow, not cream), a small hooked beak, feathered feet. Keep the beanie and scarf. |

## 4. Pets

Pets follow Ilo, hop when walking, look happy when fed and sad when hungry. Icons are the shop cards.

| Pet | Status | Files | Canvas | What to draw |
|---|---|---|---|---|
| Fox kit (Zorrito) | Redraw | fox-idle-1..2, -hop-1..3, -happy-1..2, -sad-1, icons/fox (9 files) | 48 x 48, ground point (24, 48); 96 x 96, ground point (48, 96) | A fox kit: big ears with dark tips, a white muzzle and chest, a fluffy tail with a white tip. Today's mouth reads as a grin of teeth: use Ilo's small curve. |
| Meerkat pup (Suricata) | Redraw | meerkat-idle-1..2, -hop-1..3, -happy-1..2, -sad-1, icons/meerkat (9 files) | 48 x 48, ground point (24, 48); 96 x 96, ground point (48, 96) | A meerkat pup: rounder and younger than the wild meerkat, same eye patches. |
| Arctic hare (Liebre ártica) | Redraw | hare-idle-1..2, -hop-1..3, -happy-1..2, -sad-1, icons/hare (9 files) | 48 x 48, ground point (24, 48); 96 x 96, ground point (48, 96) | An arctic hare: white with blue-grey shading, pink ear insides, Ilo eyes. Must read on light floors. |
| Axolotl (Ajolote) | New, no art yet | axolotl-idle-1..2, -hop-1..3, -happy-1..2, -sad-1, icons/axolotl (9 files) | 48 x 48, ground point (24, 48); icon 96 x 96, ground point (48, 96) | Pink, with three feathery gills on each side of the head, a wide happy smile, tiny legs, a tail fin. Hops on land like the others. |
| Macaw (Guacamaya) | New, no art yet | macaw-idle-1..2, -hop-1..3, -happy-1..2, -sad-1, icons/macaw (9 files) | 48 x 48, ground point (24, 48); icon 96 x 96, ground point (48, 96) | A macaw chick: scarlet with blue and yellow wings, a big beak. Hop frames: little flaps. |
| Armadillo (Armadillo) | New, no art yet | armadillo-idle-1..2, -hop-1..3, -happy-1..2, -sad-1, icons/armadillo (9 files) | 48 x 48, ground point (24, 48); icon 96 x 96, ground point (48, 96) | Banded shell in warm grey-brown, a long snout, small ears, Ilo eyes. Happy frames can curl into a half ball. |

## 5. Wild animals

| Animal | Where | What it does | Files | Canvas | What to change |
|---|---|---|---|---|---|
| Elephant (Elefante) | Waterhole | Walks across the Waterhole in a herd of 3, 140 px apart, and stops to drink at the pond. | elephant-walk-1..4, elephant-drink-1..2 (6 files) | 160 x 120, ground point (80, 120) | The biggest animal: give it Ilo's soft pear body, a chunky trunk that curls, big round ears with a lighter inner tone, Ilo-style eyes with a catchlight, and a gentle smile. Toes as three light half-circles on each foot. Drinking frames: trunk down into the water. |
| Toucan (Tucán) | Palm beach, Waterfall cove | Sits on top of a palm; flies to another palm when Ilo comes close. | toucan-perch-1..2, toucan-fly-1..3 (5 files) | 30 x 36, ground point (15, 18) | Today it is a black blob with a beak. Make the beak big, banana-shaped and two-toned (orange and yellow, with a dark tip), a white or yellow bib, a blue eye ring around an Ilo eye, round body. IMPORTANT: name the sitting frames toucan-perch-1.svg and toucan-perch-2.svg (the last delivery used perch-blink, which the game never finds). |
| Macaw (Guacamaya) | Palm beach, Waterfall cove | Sits on top of a palm; flies to another palm when Ilo comes close. | macaw-perch-1..2, macaw-fly-1..3 (5 files) | 36 x 46, ground point (18, 23); 36 x 46, ground point (18, 46) | Bright scarlet body, blue and yellow wings, a long tail, a white face patch with an Ilo eye. Fly frames: wings fully spread, tail streaming. |
| Heron (Garza) | Mangrove boardwalk | Wades in the shallows of the Mangrove boardwalk; flies off when Ilo comes close. | heron-stand-1..2, heron-step-1..2, heron-fly-1..3 (7 files) | 40 x 60, ground point (20, 30); 40 x 60, ground point (20, 60) | Today an oval on two sticks. Draw an elegant S-shaped neck, a long orange beak, a small crest, folded wings with a lighter edge, and thin legs with real knees and feet (tapered, not straight lines). Keep it standing in water: the bottom of the legs can fade into a ripple. |
| Sea turtle (Tortuga marina) | Coral lookout | Swims in a circle in the Coral lookout's reef. | sea-turtle-swim-1..4 (4 files) | 60 x 44, ground point (30, 22) | A round friendly face with Ilo eyes, a domed shell with clear plates in two greens, flippers that change shape across the 4 swim frames. |
| Seal (Foca) | Frozen lake | Pops up from an ice hole on the Frozen lake, looks around, dives back. | seal-pop-1..3, seal-look-1..2, seal-dive-1..2 (7 files) | 50 x 36, ground point (25, 36) | Round grey body with a lighter belly, whiskers, Ilo eyes, a small smile. Pop frames rise out of the hole; dive frames sink head first. |
| Meerkat (Suricata) | Drone post, Savannah trail | Pops up from a burrow on the Savannah trail and the Drone post, looks around, ducks down. | meerkat-pop-up-1..3, meerkat-look-around-1..2, meerkat-duck-down-1..2 (7 files) | 26 x 36, ground point (13, 36) | Upright, slim but rounded, dark eye patches around Ilo eyes, a lighter belly, small paws held at the chest. Look-around frames turn the head left and right. |
| Songbird (Pajarito cantor) | Forest trail, Lever glade | Hops and pecks in the Forest trail and Lever glade; flies away when Ilo comes close. | songbird-hop-1..2, songbird-peck-1..2, songbird-fly-1..3 (7 files) | 24 x 22, ground point (11, 13); 24 x 22, ground point (12, 22) | A round little bird with a colored breast (orange or red), a short beak, Ilo eye with catchlight, tail up. Fly frames: wings up, middle, down. |
| Pigeon (Paloma) | Market street, Central plaza | Pecks on the ground in the Plaza and Market street; flutters away when Ilo comes close. | pigeon-peck-1..2, pigeon-flutter-away-1..3 (5 files) | 22 x 20, ground point (10, 12); 22 x 20, ground point (11, 20) | Plump grey-blue body, a green-purple shine on the neck (a highlight shape), coral feet, Ilo eye. The peck frames bob the head. |
| Squirrel (Ardilla) | Forest trail, Lever glade | Runs between trees in the Forest trail and Lever glade; sits and nibbles. | squirrel-run-1..4, squirrel-sit-nibble-1..2 (6 files) | 34 x 30, ground point (17, 30) | A big fluffy S-tail with a lighter inner stripe, round head, small ears with a light inner tone, Ilo eyes. Sit-nibble frames hold an acorn. |
| Snow hare (Liebre de las nieves) | Ice slide, Snowy ridge | Hops on the Snowy ridge and by the Ice slide; runs off when Ilo comes close. | snow-hare-hop-1..3, snow-hare-sit-1..2 (5 files) | 30 x 30, ground point (15, 30) | White with pale blue-grey shading (it must still read on snow), long ears with pink insides, Ilo eyes, a round tail. |
| Crab (Cangrejo) | Coral lookout, Mangrove boardwalk, Palm beach | Walks sideways along the shore of Palm beach, the boardwalk and the Coral lookout; snaps. | crab-walk-1..3, crab-snap-1..2 (5 files) | 26 x 18, ground point (13, 18) | Rounded shell in coral red with a lighter top highlight, eyes on short stalks (Ilo eyes, small), claws that open and close in the snap frames. |
| Duck (Pato) | Forest trail | Swims around the Forest trail's pond. | duck-swim-1..2 (2 files) | 28 x 22, ground point (14, 22) | Round body sitting on the water line, a green head with a white neck ring, an orange bill, a curled tail feather. A small ripple under it. |
| Jumping fish (Pez saltarín) | Coral lookout, Forest trail, Mangrove boardwalk, Mushroom hollow, Palm beach, Waterfall cove, Waterhole | Jumps out of ponds, lagoons and the sea, then splashes back. | jumping-fish-jump-1..4 (4 files) | 30 x 40, ground point (15, 40) | Rounded body with a lighter belly, a forked tail, an Ilo eye, a few scale marks. Frame 1 leaves the water, 4 lands. |
| Flock of birds (Bandada) | Drone post, Savannah trail, Waterhole | A flock that crosses the sky over the Savannah and Waterhole now and then. | bird-flock-fly-1..3 (3 files) | 120 x 40, ground point (60, 20) | Five to seven small birds, each a clear silhouette with a body and two wings, in a loose V. They are far away: simple, but not plain "m" shapes. |
| Butterfly (Mariposa) | Forest trail, Lever glade, Market street, Mushroom hollow, Central plaza, Waterfall cove | Flutters around flowers in six rooms, in blue, yellow and orange. | butterfly-blue-fly-1..2, butterfly-yellow-fly-1..2, butterfly-orange-fly-1..2 (6 files) | 20 x 16, ground point (10, 8) | Two pairs of rounded wings with a lighter spot on each, a small dark body, two antennae with dots. Same drawing in the three colors. |
| Firefly (Luciérnaga) | Mushroom hollow | Glows in the Mushroom hollow in the evening. | firefly-glow-1..3 (3 files) | 10 x 10, ground point (5, 5) | A tiny body with a warm yellow glow around its tail that grows and shrinks across the 3 frames. |

Holes: burrow.svg (the meerkat's, 28 x 12) and ice-hole.svg (the seal's, 48 x 18): a rim with an outline, a dark inside, a lighter edge on the far side.

## 6. Order of work

| Step | How much | Why first |
|---|---|---|
| 1. The six residents | 48 files | They are big, stand still and talk to the kid, so they are seen up close. Their portraits appear in every speech bubble. |
| 2. The six pets | 54 files (27 of them new) | A pet follows Ilo everywhere. The axolotl, macaw and armadillo are sold in the shop but have no picture at all yet. |
| 3. The big wild animals | elephant, toucan, macaw, heron, sea turtle, seal, meerkat | Large on screen and part of each area's identity. |
| 4. The small wild animals | songbird, pigeon, squirrel, snow hare, crab, duck, jumping fish | Seen often, small on screen. |
| 5. The rest | bird flock, butterflies, fireflies, burrow, ice hole | Tiny or far away. |

## 7. Checklist before sending

- [ ] Placed next to Ilo at the same scale, every animal looks like it comes from the same game.
- [ ] Outline widths are 2.5 / 2 / 1.4-1.7 / 0.9 as above, in #2b2d42.
- [ ] Every eye has a pupil and a catchlight; no single-dot eyes.
- [ ] Standing frames have the 16 % ground shadow; flying, swimming and hole frames do not.
- [ ] Every file name, canvas size and ground point matches the tables.
- [ ] toucan-perch-1.svg and toucan-perch-2.svg exist (not perch-blink).
- [ ] The capybara reads as a capybara, the snowy owl as an owl.
- [ ] The axolotl, macaw and armadillo pets have all 9 files each.
- [ ] No text in any picture; manifest.json lists every file.

Deliver as before: an assets folder with the SVGs and manifest.json, plus PNG previews if you like (the game does not use them).
