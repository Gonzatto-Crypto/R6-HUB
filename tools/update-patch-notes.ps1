<#
  R6 HUB - atualiza data/patchnotes.json com as patch notes oficiais.

  O QUE FAZ
    1. Baixa o feed de noticias do jogo (r6news, que espelha o site da Ubisoft).
    2. Filtra so o que for patch note de verdade (titulo com "patch notes").
    3. Compara com o que ja esta salvo e adiciona apenas as notas MAIS NOVAS
       que a mais recente ja registrada. Nada antigo e backfillado.
    4. Escreve o JSON acrescentando as entradas novas no comeco de "patches".

  IMPORTANTE
    O JSON e editado como TEXTO, nunca reserializado. Assim a formatacao que
    voce escolheu e preservada e nao existe "mudanca" falsa a cada rodada
    (o ConvertTo-Json muda de formato entre as versoes do PowerShell).

    Se nao houver patch note nova, o arquivo nao e tocado.

  USO
      powershell -ExecutionPolicy Bypass -File tools\update-patch-notes.ps1

    O script NAO regera os .js. Depois dele, rode tools\build-data.ps1.
#>
[CmdletBinding()]
param(
  [string]$DataFile,       # data\patchnotes.json
  [string]$OperatorsFile,  # assets\js\data\operators.js
  [string]$FeedUrl = "https://raw.githubusercontent.com/danielwerg/r6news/master/news.min.json"
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

$raizProjeto = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
if (-not $DataFile)      { $DataFile      = Join-Path $raizProjeto 'data\patchnotes.json' }
if (-not $OperatorsFile) { $OperatorsFile = Join-Path $raizProjeto 'assets\js\data\operators.js' }

# ---------------------------------------------------------------
# Escapa uma string como valor JSON (com aspas em volta).
# ---------------------------------------------------------------
function Escapar-Json([string]$texto) {
  if ($null -eq $texto) { return '""' }
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  foreach ($c in $texto.ToCharArray()) {
    switch ($c) {
      '"'  { [void]$sb.Append('\"') }
      '\'  { [void]$sb.Append('\\') }
      "`b" { [void]$sb.Append('\b') }
      "`f" { [void]$sb.Append('\f') }
      "`n" { [void]$sb.Append('\n') }
      "`r" { [void]$sb.Append('\r') }
      "`t" { [void]$sb.Append('\t') }
      default {
        if ([int]$c -lt 32) { [void]$sb.Append('\u' + ([int]$c).ToString('x4')) }
        else { [void]$sb.Append($c) }
      }
    }
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}

# ---------------------------------------------------------------
# Tira a marcacao de markdown de uma linha.
# ---------------------------------------------------------------
function Limpar-Markdown([string]$s) {
  if ($null -eq $s) { return '' }
  return ($s -replace '\*\*', '' -replace '__', '' -replace '`', '').Trim()
}

# ---------------------------------------------------------------
# Decide se uma mudanca e buff, nerf ou incerta.
# Regra: descobre se o numero subiu ou desceu (pelo verbo) e se, nesse
# atributo, subir e bom ou ruim. Sem IA - so palavras-chave.
# ---------------------------------------------------------------
function Get-Direcao([string]$mudanca) {
  $s = ' ' + $mudanca.ToLower() + ' '

  $subiu = $null
  if ($s -match '\b(increased|raised|boosted|buffed|extended|improved|added)\b') { $subiu = $true }
  elseif ($s -match '\b(decreased|reduced|lowered|nerfed|shortened|weakened|removed|cut)\b') { $subiu = $false }

  # Ordem importa: as frases de "subir e ruim" vem primeiro.
  $piorSeSubir = @(
    'recoil', 'reload', 'swing time', 'melee hits', 'cooldown', 'delay',
    'recovery', 'spread', 'switch time', 'aim time', 'ads time',
    'deploy time', 'activation time', 'windup', 'arm time', 'time to',
    'cost', 'price', 'penalty', 'falloff', 'vertical', 'horizontal', 'kick'
  )
  $melhorSeSubir = @(
    'ammo', 'magazine', 'capacity', 'damage', 'health', 'fire rate',
    'rate of fire', 'rounds', 'blast', 'protection', 'resistance',
    'duration', 'regen', 'speed', 'mobility', 'radius', 'clip'
  )

  $polaridade = $null
  foreach ($k in $piorSeSubir)  { if ($s -match [regex]::Escape($k)) { $polaridade = 'pior'; break } }
  if (-not $polaridade) { foreach ($k in $melhorSeSubir) { if ($s -match [regex]::Escape($k)) { $polaridade = 'melhor'; break } } }

  if ($null -eq $subiu -or $null -eq $polaridade) { return $null }
  if ($polaridade -eq 'melhor') { return $(if ($subiu) { 'buff' } else { 'nerf' }) }
  else                          { return $(if ($subiu) { 'nerf' } else { 'buff' }) }
}

# ---------------------------------------------------------------
# Nomes dos Operadores que existem no cadastro (para reconhecer os
# titulos "### BUCK" como sendo de operador).
# ---------------------------------------------------------------
function Get-NomesDeOperador([string]$arquivo) {
  $mapa = @{}
  if (-not (Test-Path -LiteralPath $arquivo)) { return $mapa }
  $t = [System.IO.File]::ReadAllText($arquivo, [System.Text.Encoding]::UTF8)
  foreach ($m in [regex]::Matches($t, '\{\s*id:\s*"[^"]+",\s*name:\s*"([^"]+)"')) {
    $nome = $m.Groups[1].Value
    $mapa[$nome.ToLower()] = $nome
  }
  return $mapa
}

# Titulos genericos que NAO sao um alvo de balanceamento.
$titulosGenericos = @(
  'refinement changes', 'balancing', 'balance', 'weapons', 'weapon',
  'gadgets', 'gadget', 'operators', 'operator', 'game balancing',
  'map balancing', 'maps', 'quality of life', 'bug fixes', 'fixes',
  'general', 'misc', 'ui', 'new features', 'features'
)

# ---------------------------------------------------------------
# Converte o content (markdown) em highlights + balance[].
# ---------------------------------------------------------------
function Convert-Conteudo {
  param(
    [string]$Conteudo,
    [hashtable]$NomesDeOperador
  )
  $linhas = ($Conteudo -split "`n")
  $highlights = New-Object System.Collections.Generic.List[string]
  $balance = New-Object System.Collections.Generic.List[object]

  $operadorAtual = $null
  $secaoAtual = $null
  $gadgetAtual = $null

  foreach ($linha in $linhas) {
    $semEspaco = $linha.Trim()
    if ($semEspaco -eq '') { continue }

    # Titulo markdown (#, ##, ###...)
    $h = [regex]::Match($semEspaco, '^#{1,6}\s+(.+)$')
    if ($h.Success) {
      $titulo = Limpar-Markdown $h.Groups[1].Value
      $gadgetAtual = $null
      if ($NomesDeOperador.ContainsKey($titulo.ToLower())) {
        $operadorAtual = $NomesDeOperador[$titulo.ToLower()]
        $secaoAtual = $null
      } else {
        $operadorAtual = $null
        $secaoAtual = if ($titulosGenericos -contains $titulo.ToLower()) { $null } else { $titulo }
      }
      continue
    }

    # Negrito sozinho na linha vira o "gadget" atual:  **SKELETON KEY**
    $g = [regex]::Match($semEspaco, '^\*\*(.+)\*\*$')
    if ($g.Success) { $gadgetAtual = Limpar-Markdown $g.Groups[1].Value; continue }

    # Item de lista: - alguma coisa
    $b = [regex]::Match($semEspaco, '^[-*]\s+(.+)$')
    if ($b.Success) {
      $texto = Limpar-Markdown $b.Groups[1].Value
      if ($texto.Length -lt 4) { continue }

      if ($highlights.Count -lt 8 -and -not $highlights.Contains($texto)) { $highlights.Add($texto) }

      $alvo = if ($operadorAtual) { $operadorAtual } else { $secaoAtual }
      $pareceMudanca = ($texto -match '(?i)\b(was|increased|decreased|reduced|lowered|raised|added|removed|changed)\b')
      if ($alvo -and $pareceMudanca -and $balance.Count -lt 60) {
        # Ordem dos campos: operator/target, gadget, change, direction.
        $ordem = [ordered]@{}
        if ($operadorAtual) { $ordem['operator'] = $operadorAtual } else { $ordem['target'] = $alvo }
        if ($gadgetAtual)   { $ordem['gadget'] = $gadgetAtual }
        $ordem['change'] = $texto
        $direcao = Get-Direcao $texto
        if ($direcao) { $ordem['direction'] = $direcao }
        $balance.Add([pscustomobject]$ordem)
      }
    }
  }

  return [pscustomobject]@{ highlights = $highlights; balance = $balance }
}

# ---------------------------------------------------------------
# Monta o texto (linhas) de uma entrada de patch, no mesmo estilo do arquivo.
# ---------------------------------------------------------------
function New-EntradaPatch {
  param($Item, [hashtable]$NomesDeOperador)

  $title = [string]$Item.title
  $m = [regex]::Match($title, '(?i)\bY(\d+)S(\d+)(?:\.(\d+))?\b')
  if (-not $m.Success) { return $null }

  $ano = $m.Groups[1].Value
  $temp = $m.Groups[2].Value
  $sub = $m.Groups[3].Value
  $season = "Y${ano}S${temp}"
  if ($sub) { $label = "$season.$sub"; $version = "$ano.$temp.$sub"; $type = 'patch' }
  else      { $label = "$season.0";   $version = "$ano.$temp.0";   $type = 'season' }

  $data = ([string]$Item.date).Substring(0, 10)

  $headline = Limpar-Markdown ([string]$Item.abstract)
  if (-not $headline) {
    foreach ($l in (([string]$Item.content) -split "`n")) {
      $t = $l.Trim()
      if ($t -and -not $t.StartsWith('#') -and -not $t.StartsWith('-') -and -not $t.StartsWith('*')) {
        $headline = Limpar-Markdown $t; break
      }
    }
  }
  if (-not $headline) {
    $h = [regex]::Match(([string]$Item.content), '(?m)^#{1,6}\s+(.+)$')
    if ($h.Success) { $headline = Limpar-Markdown $h.Groups[1].Value }
  }
  if (-not $headline) { $headline = $title }

  $conv = Convert-Conteudo -Conteudo ([string]$Item.content) -NomesDeOperador $NomesDeOperador
  $highlights = $conv.highlights
  $balance = $conv.balance

  $L = New-Object System.Collections.Generic.List[string]
  $L.Add('    {')
  $L.Add('      "label": ' + (Escapar-Json $label) + ',')
  $L.Add('      "version": ' + (Escapar-Json $version) + ',')
  $L.Add('      "date": ' + (Escapar-Json $data) + ',')
  $L.Add('      "season": ' + (Escapar-Json $season) + ',')
  $L.Add('      "type": ' + (Escapar-Json $type) + ',')
  $L.Add('      "headline": ' + (Escapar-Json $headline) + ',')

  if ($highlights.Count) {
    $L.Add('      "highlights": [')
    for ($i = 0; $i -lt $highlights.Count; $i++) {
      $virg = if ($i -lt $highlights.Count - 1) { ',' } else { '' }
      $L.Add('        ' + (Escapar-Json $highlights[$i]) + $virg)
    }
    $L.Add('      ],')
  }

  if ($balance.Count) {
    $L.Add('      "balance": [')
    for ($i = 0; $i -lt $balance.Count; $i++) {
      $b = $balance[$i]
      $campos = New-Object System.Collections.Generic.List[string]
      foreach ($p in $b.PSObject.Properties) {
        if ($p.Name -eq 'direction' -and -not $p.Value) { continue }
        $campos.Add('"' + $p.Name + '": ' + (Escapar-Json ([string]$p.Value)))
      }
      $virg = if ($i -lt $balance.Count - 1) { ',' } else { '' }
      $L.Add('        { ' + ($campos -join ', ') + ' }' + $virg)
    }
    $L.Add('      ],')
  }

  $L.Add('      "sourceUrl": ' + (Escapar-Json ([string]$Item.url)))
  $L.Add('    }')
  return $L.ToArray()
}

# ===============================================================
# Execucao
# ===============================================================
if (-not (Test-Path -LiteralPath $DataFile)) { throw "Nao encontrei: $DataFile" }

$textoJson = [System.IO.File]::ReadAllText($DataFile, [System.Text.Encoding]::UTF8)
$dados = $textoJson | ConvertFrom-Json
$nomesOperador = Get-NomesDeOperador $OperatorsFile

$existentes = @($dados.patches | ForEach-Object { ([string]$_.label).ToLower() })
$datas = @($dados.patches | ForEach-Object { [datetime]$_.date })
$maisNova = if ($datas.Count) { ($datas | Sort-Object -Descending)[0] } else { [datetime]'1970-01-01' }

Write-Host ("Patches ja registrados: {0}; mais recente: {1:yyyy-MM-dd}" -f $dados.patches.Count, $maisNova)

Write-Host "Baixando feed..."
$feed = Invoke-RestMethod -Uri $FeedUrl -TimeoutSec 60 -Headers @{ 'User-Agent' = 'R6HUB-updater' }

$candidatos = $feed | Where-Object {
  ($_.categories -contains 'patch-notes') -and
  ($_.title -match '(?i)patch notes') -and
  ($_.title -match '(?i)\bY\d+S\d+')
}

$novos = New-Object System.Collections.Generic.List[object]
foreach ($item in $candidatos) {
  $m = [regex]::Match([string]$item.title, '(?i)\bY(\d+)S(\d+)(?:\.(\d+))?\b')
  $season = "Y$($m.Groups[1].Value)S$($m.Groups[2].Value)"
  $label = if ($m.Groups[3].Value) { "$season.$($m.Groups[3].Value)" } else { "$season.0" }
  $d = [datetime]([string]$item.date).Substring(0, 10)

  if ($existentes -contains $label.ToLower()) { continue }
  if ($d -le $maisNova) { continue }

  $linhas = New-EntradaPatch -Item $item -NomesDeOperador $nomesOperador
  if ($linhas) {
    $novos.Add([pscustomobject]@{ label = $label; data = $d; linhas = $linhas })
    Write-Host ("  nova: {0}  ({1:yyyy-MM-dd})  {2}" -f $label, $d, $item.title)
  }
}

if ($novos.Count -eq 0) {
  Write-Host "Nada novo. Arquivo nao foi alterado."
  exit 0
}

# Ordena as novas da mais recente para a mais antiga (mesmo padrao do arquivo).
$novos = $novos | Sort-Object { $_.data } -Descending

$blocos = @($novos | ForEach-Object { ($_.linhas -join "`n") })
$insercao = "`n" + ($blocos -join ",`n") + ","

$ancora = '"patches": ['
$pos = $textoJson.IndexOf($ancora)
if ($pos -lt 0) { throw 'Nao achei "patches": [ no JSON.' }
$corte = $pos + $ancora.Length
$resto = $textoJson.Substring($corte).TrimStart()
if ($resto.StartsWith(']')) { throw 'O array "patches" esta vazio; ajuste o script para o primeiro item.' }

$textoJson = $textoJson.Insert($corte, $insercao)

# Atualiza generatedAt para o dia de hoje (so quando houve mudanca).
$hoje = (Get-Date).ToString('yyyy-MM-dd')
$textoJson = [regex]::Replace($textoJson, '("generatedAt":\s*")[^"]*(")', ('${1}' + $hoje + '${2}'), 1)

if (-not ($textoJson | ConvertFrom-Json)) { throw 'O JSON resultante ficou invalido.' }

[System.IO.File]::WriteAllText($DataFile, $textoJson, $utf8SemBom)
Write-Host ("OK - {0} patch note(s) adicionada(s). Agora rode tools\build-data.ps1." -f $novos.Count)
