<#
  R6 HUB - regenera os wrappers JS a partir dos JSON em data/

  Por que isso existe: o site precisa funcionar abrindo index.html direto do
  disco (protocolo file://), onde fetch() de arquivos locais e bloqueado pelo
  navegador. Entao os JSON sao embutidos como variaveis globais JS.

  Uso (a partir da raiz do projeto):
      powershell -ExecutionPolicy Bypass -File tools\build-data.ps1

  Ou, se preferir fazer na mao, o formato de cada arquivo e apenas:
      /* Gerado a partir de data/<arquivo>.json - nao editar aqui, editar o JSON. */
      window.R6HUB = window.R6HUB || {};
      window.R6HUB.<chave> = <conteudo do JSON, sem ponto e virgula final>;
#>

[CmdletBinding()]
param(
  [string]$DataDir,
  [string]$OutDir
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# $PSScriptRoot pode vir vazio dependendo de como o script foi chamado.
# Cai para a pasta atual (o script e rodado a partir da raiz do projeto).
$raizProjeto = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
if (-not $DataDir) { $DataDir = Join-Path $raizProjeto 'data' }
if (-not $OutDir)  { $OutDir  = Join-Path $raizProjeto 'assets\js\data' }

$map = [ordered]@{
  'patchnotes.json' = 'patchnotes'
  'news.json'       = 'news'
}

if (-not (Test-Path -LiteralPath $DataDir)) { throw "Pasta de dados nao encontrada: $DataDir" }
if (-not (Test-Path -LiteralPath $OutDir))  { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

# UTF-8 sem BOM: o <meta charset="utf-8"> do index.html faz o resto.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $map.Keys) {
  $src = Join-Path $DataDir $file
  if (-not (Test-Path -LiteralPath $src)) { Write-Warning "Ignorado (nao existe): $file"; continue }

  $raw = [System.IO.File]::ReadAllText($src, [System.Text.Encoding]::UTF8)

  try {
    $null = $raw | ConvertFrom-Json
  } catch {
    throw "JSON invalido em ${file}: $($_.Exception.Message)"
  }

  # Embutimos o JSON exatamente como esta no arquivo fonte, sem
  # reserializar. Isso e de proposito: o ConvertTo-Json muda de formato
  # conforme a versao do PowerShell (indentacao e escape de apostrofo),
  # o que faria o arquivo "mudar" a cada rodada mesmo sem dado novo.
  # Copiando o texto cru, o resultado e sempre o mesmo.
  $json = $raw.TrimEnd()
  $key  = $map[$file]
  $name = [System.IO.Path]::GetFileNameWithoutExtension($file)
  $out  = Join-Path $OutDir "$name.js"

  $content = "/* Gerado a partir de data/$file - nao editar aqui, editar o JSON. */`n" +
             "window.R6HUB = window.R6HUB || {};`n" +
             "window.R6HUB.$key = $json;`n"

  [System.IO.File]::WriteAllText($out, $content, $utf8NoBom)

  $bytes = (Get-Item -LiteralPath $out).Length
  Write-Host ("  OK  {0,-16} -> {1,-18} {2,8:N0} bytes" -f $file, (Split-Path $out -Leaf), $bytes)
}

Write-Host "`nWrappers atualizados. Recarregue o index.html no navegador."
