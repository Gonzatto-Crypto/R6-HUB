# Weapon drawings

One SVG image per weapon, inside this folder.

## Where they come from

These drawings were made for R6 HUB. No file here comes from the game,
from Ubisoft or from any other project. They are simple original
silhouettes built from basic shapes (stock, receiver, barrel, magazine,
grip) over a gradient background.

They are meant to be recognizable at a glance by weapon class: rifle,
SMG, LMG, shotgun, marksman, sniper, pistol, shield, melee and
launcher. The color follows the class, so all rifles, all snipers and
so on share a hue.

The drawing also reflects the weapon's real data from
`assets/js/data/weapons.js`: a scope is drawn when the weapon has a
sight slot, a foregrip when it has a grip slot and a laser when it has
an under-barrel slot. That keeps the picture informative and consistent
with the site.

## License

They are part of R6 HUB and follow the project license. You may use,
change and redistribute them together with the site. There is no
third-party restriction here.

## How the site uses them

`assets/js/ui.js` builds the picture (`weaponArt`) like this:

- a `<span>` with the weapon type, always present;
- an `<img>` with the file `assets/img/weapons/<slug>.svg`, with `alt`
  and `loading="lazy"`.

Both sit in the same CSS grid cell and the image stays on top. If the
SVG fails to load, `onerror` removes the image and the weapon type
shows through. That is why a blank square never appears.

The file name is the weapon name lowercased, without accents and
without anything outside `a-z` and `0-9` (`-` in their place).
Examples:

| Weapon | File |
| --- | --- |
| M4 | `m4.svg` |
| M249 SAW | `m249-saw.svg` |
| SMG-11 | `smg-11.svg` |
| 5.7 USG | `5-7-usg.svg` |
| GONNE-6 | `gonne-6.svg` |

The rule matches `helpers.slug`, which is also used by `weaponImage`.

## How to regenerate

The generator lives in the repo at `tools/build-weapon-images.ps1`. It
reads `assets/js/data/weapons.js`, builds the file name with the same
rule as the site and writes one SVG per weapon. Run it from the project
root:

```
powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-weapon-images.ps1
```

It is offline and uses no external assets. If you add a new weapon to
the data, run it again to draw the new file.
