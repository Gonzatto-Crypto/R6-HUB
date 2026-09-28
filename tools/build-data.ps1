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
  [string]$DataDir = (Join-Path $PSScriptRoot '..\data'),
  [string]$OutDir  = (Join-Path $PSScriptRoot '..\assets\js\data')
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

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

  # Reindenta com 2 espacos e remove o BOM, se houver.
  $obj = $raw | ConvertFrom-Json
  $json = ($obj | ConvertTo-Json -Depth 20) -replace "`r`n", "`n"
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
