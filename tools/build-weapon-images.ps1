<# =================================================================
   R6 HUB - build-weapon-images.ps1
   -----------------------------------------------------------------
   Generates one SVG drawing per weapon into assets/img/weapons/,
   reading the weapon list from assets/js/data/weapons.js.

   The drawings are ORIGINAL simple silhouettes made for R6 HUB.
   No file here comes from the game, from Ubisoft or from any other
   project. They are meant to be recognizable at a glance by weapon
   class (rifle, SMG, LMG, shotgun, marksman, sniper, pistol, shield,
   melee, launcher), not to be copies of the real models.

   The drawing also reflects each weapon's real data: a scope is drawn
   when the weapon has a sight slot, a foregrip when it has a grip slot
   and a laser when it has an under-barrel slot. That keeps the picture
   both informative and consistent with the site.

   Run it from the project root:
     powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-weapon-images.ps1
   ================================================================= #>
$ErrorActionPreference = 'Stop'

$root       = Split-Path -Parent $PSScriptRoot
$weaponsJs  = Join-Path $root 'assets\js\data\weapons.js'
$outDir     = Join-Path $root 'assets\img\weapons'
if (-not (Test-Path -LiteralPath $weaponsJs)) { throw "weapons.js not found: $weaponsJs" }
if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$text = Get-Content -Raw -LiteralPath $weaponsJs
$code = [regex]::Replace($text, '(?s)/\*.*?\*/', '')   # drop comments (doc examples)
$rx = [regex]'(?m)^\s*W\("(?<name>[^"]+)",\s*"(?<type>[A-Z]+)",\s*"(?<damage>[^"]*)",\s*"?(?<rpm>[\d-]+)"?,\s*"(?<mag>[^"]*)",\s*\[(?<slots>[^\]]*)\]'
$found = $rx.Matches($code)
if ($found.Count -eq 0) { throw "no weapons found in weapons.js" }

function Escape-Xml([string]$s) {
  return $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&#39;')
}

# Slug rule, same as helpers.operatorImage / weaponImage in the site.
function Get-Slug([string]$name) {
  $n = $name.Normalize([System.Text.NormalizationForm]::FormD)
  $n = ($n -replace '\p{Mn}', '').ToLower()
  $n = $n -replace '[^a-z0-9]+', '-'
  return $n.Trim('-')
}

function Get-Hue([string]$type) {
  switch ($type) {
    'SMG'      { 165 }
    'LMG'      { 24 }
    'SHOTGUN'  { 3 }
    'MARKSMAN' { 278 }
    'SNIPER'   { 190 }
    'PISTOL'   { 48 }
    'SHIELD'   { 200 }
    'MELEE'    { 220 }
    'LAUNCHER' { 32 }
    default    { 212 }  # AR and anything else
  }
}

# All the little parts are built from these shared shapes so every
# drawing looks like it belongs to the same family.
function Get-Silhouette([string]$type, [bool]$mira, [bool]$grip, [bool]$under, [int]$seed, [string]$accent) {
  $b  = 'url(#body)'
  $st = 'hsl(210 7% 44%)'
  $dk = 'hsl(212 10% 20%)'

  $len = switch ($type) {
    'SMG'      { 16 }
    'MARKSMAN' { 38 }
    'SNIPER'   { 46 }
    'SHOTGUN'  { 38 }
    'LMG'      { 28 }
    default    { 22 + ($seed % 10) }
  }
  $mx = 100 + $len

  $barrel = '<rect x="100" y="43.5" width="' + $len + '" height="4.5" rx="2" fill="' + $b + '"/>'
  $muzzle = '<rect x="' + $mx + '" y="42.5" width="7" height="6.5" rx="1.5" fill="' + $dk + '"/>'
  $tubemag = '<rect x="100" y="50" width="' + $len + '" height="4" rx="2" fill="' + $dk + '"/>'
  $stock = '<path d="M16 41 L30 38.5 L30 55 L20 56 Z" fill="' + $b + '"/>'
  $foldstock = '<path d="M20 40 L30 38.5 L30 52 L22 51 Z" fill="' + $b + '"/>'
  $receiver = '<rect x="30" y="37" width="42" height="15" rx="2.5" fill="' + $b + '"/>'
  $rail = '<rect x="33" y="34" width="38" height="3" rx="1.5" fill="' + $st + '"/>'
  $handguard = '<rect x="72" y="39.5" width="28" height="10.5" rx="2.5" fill="' + $b + '"/>'
  $mag = '<path d="M44 52 L58 52 L56 72 L46 72 L42 62 Z" fill="' + $b + '"/>'
  $shortMag = '<path d="M46 52 L58 52 L56 64 L47 64 L43 59 Z" fill="' + $b + '"/>'
  $boxMag = '<rect x="46" y="52" width="16" height="20" rx="2" fill="' + $b + '"/>'
  $gripShape = '<path d="M34 52 L46 52 L43 67 L33 65 Z" fill="' + $b + '"/>'
  $guard = '<path d="M46 52 q11 7 2 12" fill="none" stroke="' + $st + '" stroke-width="2.5"/>'
  $accentLine = '<rect x="31" y="39" width="40" height="2" rx="1" fill="' + $accent + '" fill-opacity="0.55"/>'
  $scope = '<rect x="50" y="26.5" width="27" height="9.5" rx="4.5" fill="' + $b + '"/><rect x="57" y="24" width="5" height="4" rx="1.5" fill="' + $st + '"/><circle cx="76" cy="31.2" r="2.2" fill="' + $accent + '" fill-opacity="0.7"/>'
  $bigScope = '<rect x="46" y="24" width="34" height="11" rx="5" fill="' + $b + '"/><rect x="56" y="21" width="6" height="4" rx="1.5" fill="' + $st + '"/><circle cx="78" cy="29.5" r="2.6" fill="' + $accent + '" fill-opacity="0.7"/>'
  $ironsight = '<rect x="94" y="35.5" width="4" height="7.5" rx="1" fill="' + $st + '"/>'
  $foregrip = '<rect x="77" y="50" width="7" height="13" rx="2.5" fill="' + $b + '"/>'
  $laser = '<rect x="87" y="50" width="10" height="6" rx="1.5" fill="' + $b + '"/><circle cx="96.5" cy="53" r="1.7" fill="' + $accent + '"/>'
  $bipod = '<path d="M' + (100 + $len - 8) + ' 52 L' + (100 + $len - 14) + ' 74 M' + (100 + $len - 8) + ' 52 L' + (100 + $len) + ' 74" stroke="' + $st + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  $pump = '<rect x="74" y="50.5" width="20" height="6" rx="2" fill="' + $b + '"/>'

  $sight = if ($mira) { $scope } else { $ironsight }
  $gripOpt = if ($grip) { $foregrip } else { '' }
  $underOpt = if ($under) { $laser } else { '' }
  $bipodOpt = if ($under) { $bipod } else { '' }

  switch ($type) {
    'SMG' {
      return $foldstock + $receiver + $rail + $handguard + $barrel + $muzzle + $shortMag + $gripShape + $guard + $accentLine + $sight + $gripOpt + $underOpt
    }
    'LMG' {
      return $stock + $receiver + $rail + $handguard + $barrel + $muzzle + $boxMag + $gripShape + $guard + $accentLine + $sight + $gripOpt + $bipod
    }
    'SHOTGUN' {
      return $stock + $receiver + $rail + $handguard + $barrel + $muzzle + $tubemag + $pump + $gripShape + $guard + $accentLine + $sight
    }
    'MARKSMAN' {
      return $stock + $receiver + $rail + $handguard + $barrel + $muzzle + $mag + $gripShape + $guard + $accentLine + $bigScope + $gripOpt + $underOpt
    }
    'SNIPER' {
      return $stock + $receiver + $rail + $handguard + $barrel + $muzzle + $mag + $gripShape + $guard + $accentLine + $bigScope + $bipod
    }
    'PISTOL' {
      return '<rect x="58" y="34" width="52" height="11" rx="2" fill="' + $b + '"/>' +
        '<rect x="108" y="36" width="6" height="6.5" rx="1" fill="' + $dk + '"/>' +
        '<path d="M62 45 L78 45 L74 72 L60 72 Z" fill="' + $b + '"/>' +
        '<path d="M78 45 q6 8 0 11" fill="none" stroke="' + $st + '" stroke-width="2.5"/>' +
        '<rect x="104" y="31" width="3" height="4.5" rx="1" fill="' + $st + '"/>' +
        '<rect x="62" y="31" width="3" height="4.5" rx="1" fill="' + $st + '"/>' +
        '<rect x="59" y="36.5" width="46" height="2" rx="1" fill="' + $accent + '" fill-opacity="0.55"/>'
    }
    'SHIELD' {
      return '<rect x="48" y="13" width="64" height="64" rx="10" fill="' + $b + '"/>' +
        '<rect x="56" y="24" width="33" height="9" rx="3" fill="' + $dk + '"/>' +
        '<rect x="56" y="24" width="33" height="9" rx="3" fill="' + $accent + '" fill-opacity="0.28"/>' +
        '<rect x="56" y="54" width="48" height="2.5" rx="1" fill="' + $st + '" fill-opacity="0.6"/>' +
        '<circle cx="56" cy="20" r="1.8" fill="' + $st + '"/><circle cx="104" cy="20" r="1.8" fill="' + $st + '"/>' +
        '<circle cx="56" cy="70" r="1.8" fill="' + $st + '"/><circle cx="104" cy="70" r="1.8" fill="' + $st + '"/>' +
        '<rect x="112" y="44" width="10" height="16" rx="3" fill="' + $dk + '"/>'
    }
    'MELEE' {
      return '<path d="M70 36 Q122 38 140 45 L140 49 Q120 56 70 56 Z" fill="' + $b + '"/>' +
        '<path d="M70 45 Q120 45 140 45" stroke="' + $accent + '" stroke-width="1.4" fill="none" stroke-opacity="0.6"/>' +
        '<rect x="64" y="32" width="6" height="28" rx="2" fill="' + $dk + '"/>' +
        '<rect x="42" y="40" width="24" height="13" rx="4" fill="' + $b + '"/>' +
        '<rect x="48" y="40" width="2" height="13" fill="' + $accent + '" fill-opacity="0.5"/>' +
        '<rect x="54" y="40" width="2" height="13" fill="' + $accent + '" fill-opacity="0.5"/>'
    }
    'LAUNCHER' {
      return '<rect x="30" y="37" width="92" height="17" rx="6" fill="' + $b + '"/>' +
        '<rect x="120" y="35.5" width="10" height="20" rx="3" fill="' + $dk + '"/>' +
        '<rect x="44" y="31" width="22" height="6" rx="2" fill="' + $b + '"/>' +
        '<path d="M56 54 L68 54 L64 72 L52 70 Z" fill="' + $b + '"/>' +
        '<path d="M68 54 q8 7 2 12" fill="none" stroke="' + $st + '" stroke-width="2.5"/>' +
        '<rect x="32" y="41" width="86" height="2.5" rx="1" fill="' + $accent + '" fill-opacity="0.5"/>'
    }
    default {
      return $stock + $receiver + $rail + $handguard + $barrel + $muzzle + $mag + $gripShape + $guard + $accentLine + $sight + $gripOpt + $underOpt
    }
  }
}

$count = 0
foreach ($m in $found) {
  $name = $m.Groups['name'].Value
  $type = $m.Groups['type'].Value
  $slots = $m.Groups['slots'].Value
  $mira  = $slots -match 'mira'
  $grip  = $slots -match 'grip'
  $under = $slots -match 'under'

  $seed = 0
  foreach ($ch in $name.ToCharArray()) { $seed += [int]$ch }
  $hue = Get-Hue $type
  $accent = "hsl($hue 66% 60%)"
  $bgA = "hsl($hue 30% 16%)"
  $bgB = "hsl($hue 28% 8%)"

  $bars = "<g fill='none' stroke='$accent' stroke-opacity='0.12' stroke-width='6' stroke-linecap='round'>" +
          "<path d='M-14 30 L174 4'/><path d='M6 80 L156 22'/></g>"

  $shapes = Get-Silhouette $type $mira $grip $under $seed $accent

  $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" role="img" aria-label="' + (Escape-Xml $name) + '">' +
    '<defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="' + $bgA + '"/><stop offset="1" stop-color="' + $bgB + '"/></linearGradient>' +
      '<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(210 8% 32%)"/><stop offset="1" stop-color="hsl(212 11% 14%)"/></linearGradient>' +
    '</defs>' +
    '<rect width="160" height="90" fill="url(#bg)"/>' +
    $bars + $shapes +
  '</svg>' + "`n"

  $slug = Get-Slug $name
  $path = Join-Path $outDir ($slug + '.svg')
  [System.IO.File]::WriteAllText($path, $svg, (New-Object System.Text.UTF8Encoding($false)))
  $count++
}

Write-Output ("weapon images written: " + $count)
