<#
  R6 HUB - abre o projeto no VS Code com as abas na ordem de leitura.

  Uso:
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\abrir-ordem.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\abrir-ordem.ps1 -Pasta
#>
[CmdletBinding()]
param(
  # Abre so a pasta, sem abrir as abas em sequencia.
  [switch]$Pasta,

  # Codigo do VS Code a usar. Padrao: procura no PATH.
  [string]$Code
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

if (-not $Code) {
  $cmd = Get-Command code -ErrorAction SilentlyContinue
  if ($cmd) {
    $Code = $cmd.Source
  } else {
    $falback = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd"
    if (-not (Test-Path -LiteralPath $falback)) {
      Write-Host "VS Code nao encontrado." -ForegroundColor Red
      Write-Host "Instale pelo site oficial ou passe o caminho com -Code." -ForegroundColor Yellow
      exit 1
    }
    $Code = $falback
  }
}

Write-Host "VS Code:   $Code" -ForegroundColor DarkGray
Write-Host "Projeto:   $root" -ForegroundColor DarkGray

# Abre a pasta como workspace.
& $Code $root

if ($Pasta) {
  Write-Host "Pasta aberta. Use -Pasta omitido para abrir tambem as abas em ordem." -ForegroundColor Green
  exit 0
}

Start-Sleep -Milliseconds 1500

# Ordem didatica de leitura. Nao e a ordem de execucao:
# veia ORDEM.md, secao "Ordem de carregamento real".
$ordem = @(
  'README.md',
  'index.html',
  'assets\js\config.js',
  'assets\js\data\operators.js',
  'assets\js\data\weapons.js',
  'assets\js\data\rankings.js',
  'assets\js\data\patchnotes.js',
  'assets\js\data\news.js',
  'assets\js\app.js',
  'assets\css\styles.css',
  'tools\build-data.ps1',
  '_selftest.html',
  '_selftest-api.html'
)

$falta = @()
foreach ($f in $ordem) {
  $full = Join-Path $root $f
  if (-not (Test-Path -LiteralPath $full)) {
    $falta += $f
    continue
  }
  & $Code -r $full
}

Write-Host ""
if ($falta.Count) {
  Write-Host "Nao encontrados: $($falta -join ', ')" -ForegroundColor Yellow
}

Write-Host "$($ordem.Count - $falta.Count) abas abertas na ordem de leitura." -ForegroundColor Green
Write-Host "Alterne com Ctrl+Tab ou Ctrl+P. Guia completo em ORDEM.md" -ForegroundColor Green
