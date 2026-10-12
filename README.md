# R6 HUB

Community site about the game Rainbow Six Siege. It has Operators, weapons, news, balance history and rankings.

Unofficial project, with no affiliation with Ubisoft.

## How to open

Double-click the file `index.html`. That's it — no need to install anything or run a server.

You need a current browser (Edge, Chrome, Firefox or Safari). It works without internet: the site opens offline.

## What's on the site

| Page | What it shows |
| --- | --- |
| Home | Current season, the key numbers and the latest news |
| Operators | The 78 Operators, with a filter by side, role, CTU, health, speed and year |
| Weapons | The 116 weapons, with damage, rate of fire, magazine and the most used attachments |
| News | Game news with a filter by category |
| Balance | The official patch notes, with what was buffed or nerfed |
| Rankings | Professional teams and the most decorated individual players |
| Meta | The strongest operators, in tiers, with a filter for attackers or defenders |

## Where things are

```
index.html                    the site page
README.md                     this file
_selftest.html                automated test (see "Test" below)
_selftest-api.html            automated test for the rankings part

assets/css/styles.css         the colors and the visual
assets/js/config.js           what can be changed without touching the code
assets/js/helpers.js          small pure functions (text, dates, URL)
assets/js/ui.js               reusable pieces of screen (cards, badges)
assets/js/pages.js            one function per page (builds the HTML)
assets/js/app.js              the router: picks the page, wires the clicks
assets/js/data/operators.js   the list of Operators
assets/js/data/weapons.js     the list of weapons
assets/js/data/rankings.js    the list of teams and players
assets/js/data/tiers.js       the operator meta (S/A/B/C)
assets/js/data/patchnotes.js  the balance changes  (generated, do not edit)
assets/js/data/news.js        the news             (generated, do not edit)

assets/img/operators/         one SVG drawing per Operator
assets/img/operators/LEIA-ME.md  where the drawings came from and their license

data/patchnotes.json          the source of the balance changes
data/news.json                the source of the news
tools/build-data.ps1          script that regenerates the two "generated" files
tools/update-patch-notes.ps1  script that downloads and merges the new patch notes

.github/workflows/pages.yml               publishes the site on GitHub Pages
.github/workflows/update-patch-notes.yml  runs every day and updates the patch notes
```

## Changing some information

Almost everything that appears on screen is in `assets\js\data\`. Open the file, find the line you want to change, edit it and save. Then just press F5 in the browser.

- Want to change colors or fixed texts? Edit `assets\js\config.js`.
- Want to change the source links (Ubisoft, wiki, etc.)? Edit `assets\js\config.js`.
- Want to see a ranking that comes from an external server? Edit `rankingApiUrl` in `assets\js\config.js`. If you leave it empty, the site uses the list in the file.

**Warning:** `patchnotes.js` and `news.js` are generated. To change balance changes or news, edit the `.json` files in the `data/` folder and run the script below.

## Generating the automatic files

Open PowerShell in the project folder and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-data.ps1
```

The script reads `data\patchnotes.json` and `data\news.json` and rewrites the two corresponding `.js` files. If any JSON has a writing error, the script warns you and does not generate.

## Publishing and updating automatically

The site stays online through **GitHub Pages** and the patch notes update by themselves.

- **Publish:** the one that takes care of this is the `pages.yml` workflow. It puts online only the `index.html` and the `assets/` folder (the tests and the `tools/` folder stay out). It runs whenever something new arrives on the `main` branch.
- **Update the patch notes:** the `update-patch-notes.yml` workflow runs every day. It downloads the official feed, merges **only the newer notes** than the last one already saved, regenerates the `.js` files and commits. If there is no new note, it does nothing.
- Both can also be run by hand: on GitHub, the **Actions** tab, choose the workflow and click **Run workflow**.

The first time you need to turn on publishing: **Settings → Pages → Source → GitHub Actions**.

### Running the patch notes update by hand

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\update-patch-notes.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-data.ps1
```

**How buff/nerf is decided:** the script **does not use artificial intelligence**. It sees whether the number went up or down (by the verb: *increased*, *reduced*, etc.), checks what that means for the attribute (more ammo is good; more recoil is bad) and marks **Buff** or **Nerf**. When it can't be sure, it leaves it blank — and the site shows **Mixed**.

## Test

Double-click `_selftest.html`. It opens the whole site, goes through all the pages and writes the result at the bottom of the screen.

- Browser tab showing **SELFTEST-OK** = all good.
- Showing **SELFTEST-FALHOU** = something broke; scroll to the bottom of the screen, in the `FALHAS(n)` part, and see what was pointed out.

To test the rankings part, also open `_selftest-api.html`. It loads a fake ranking on purpose, to check that the site knows how to replace the data when it receives it and to keep the saved data when the internet fails.

## Project rules

- Interface in English; news and patch notes in Ubisoft's original language.
- No build, no dependencies, no server. Just HTML, CSS and JavaScript.
- The attachment usage percentages are **community estimates** — Ubisoft does not publish this number. This is warned about on the site itself.
- Since Ranked 3.0 (June 2026) there is no public MMR, so the site does not show this value anywhere.
