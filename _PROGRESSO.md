# PONTO DE RETOMADA — R6 HUB

> Arquivo de trabalho entre sessões. **NÃO faz parte do site** e não precisa ser
> copiado para o VS Code. Pode apagar quando a entrega terminar.

## Como retomar

Amanhã, na primeira mensagem, escreva apenas:

```
continuar entrega do R6 HUB
```

Leia este arquivo inteiro antes de gerar qualquer código.

---

## 1. Situação: o site está PRONTO e VALIDADO

Não há nenhuma pendência técnica. Os três testes passam:

```
_selftest.html            JS-ERROS=0  FALHAS=0
_selftest-api.html        JS-ERROS=0  FALHAS=0   (modo=ok)
_selftest-api.html        JS-ERROS=0  FALHAS=0   (modo=bad)
```

Validações já feitas e aprovadas:

- Gerador `tools/build-data.ps1` reescreveu os wrappers; ambos batem **idênticos** ao JSON de origem
  (`identicoAoFonte=True`, 24 patches / 7 releases / 14 notícias).
- Integridade cruzada dos dados: 78 operadores (39 ATK / 39 DEF), 116 armas, sem IDs duplicados,
  sem nomes de arma duplicados, todas as referências de arma resolvem.
- 26 rotas exercitadas, sendo 4 de "não encontrado" (agente, arma, categoria, rota).
- 16 patches com tabela de balanceamento, 8 com aviso de "sem mudanças".
- Todos os arquivos em UTF-8 **sem BOM** e sem caractere de substituição (`U+FFFD`).
- Snapshot de dados: `2026-09-28`, temporada `Y11S3 — Operation Split Fire`.

Desligar o PC **não perde nada**: todos os arquivos já estão no disco em
`C:\Users\User\OneDrive\Área de Trabalho\R6 HUB`.

---

## 2. Decisões fechadas com o usuário

1. **Notícias permanecem em inglês.** Títulos e resumos preservam o texto original das fontes.
   Só os rótulos/menus da interface estão em pt-BR. **Não traduzir** `data/news.json` nem
   `assets/js/data/news.js`.
2. **Entrega completa, parte por parte.** O usuário quer o conteúdo de todos os arquivos para
   colar manualmente no VS Code. Nada de resumir, nada de "gere isso com script".
3. O usuário dispensou o guia de VS Code no meio do caminho e pediu o código. Não voltar a
   empurrar aquele guia; `ORDEM.md` e `tools\abrir-ordem.ps1` já existem e ficam para o fim.

---

## 3. Onde a entrega parou

| Parte | Conteúdo | Estado |
| --- | --- | --- |
| 1 | `README.md` + `index.html` + `assets/js/config.js` | **ENTREGUE** |
| 2 | `assets/css/styles.css` (2 blocos) | pendente |
| 3 | `assets/js/app.js` (3 blocos) | pendente |
| 4 | `assets/js/data/operators.js` | pendente |
| 5 | `assets/js/data/weapons.js` | pendente |
| 6 | `assets/js/data/rankings.js` | pendente |
| 7 | `data/news.json` | pendente |
| 8 | `data/patchnotes.json` (2 blocos) | pendente |
| 9 | `tools/build-data.ps1` | pendente |
| 10 | `_selftest.html` + `_selftest-api.html` | pendente |

**Próximo passo imediato: emitir a Parte 2 — `assets/css/styles.css`.**

O usuário já tem a Parte 1 na mão. Ao retomar, **não repita a Parte 1**; apenas diga que está
indo para a Parte 2 e emita o CSS. Se o usuário disser que não colou a Parte 1, reemitir.

## 4.(decisões) sobre os `.js` gerados

`assets/js/data/patchnotes.js` (87889 bytes) e `assets/js/data/news.js` (11642 bytes) são
**byte-equivalentes ao conteúdo** dos JSONs correspondentes, embrulhados em
`window.R6HUB.<nome> = { ... };`.

Entregar **um** dos dois de cada par:

- Entregar o `.json` e o `tools/build-data.ps1` (Parte 9), deixando o script gerar o `.js`.
- **OU** entregar o `.js` pronto e pular o `.json`.

Isso economiza ~100 KB de cola. A ordem planejada (Partes 7 e 8) entregava o `.json`; manter
essa escolha e deixar o script gerar os `.js`.

---

## 5. Tamanhos reais dos arquivos (para dividir os blocos)

```
    15544  _selftest.html
     5619  _selftest-api.html
    28755  assets\css\styles.css
    49687  assets\js\app.js
     1081  assets/js/config.js
    11642  assets/js/data/news.js
    50249  assets/js/data/operators.js
    87889  assets/js/data/patchnotes.js
    11824  assets/js/data/rankings.js
    30575  assets/js/data/weapons.js
    11508  data/news.json
    87743  data/patchnotes.json
     3317  index.html
     7201  ORDEM.md
    14377  README.md
     2208  tools/abrir-ordem.ps1
     2451  tools/build-data.ps1
```

Ao dividir um arquivo em vários blocos, **anunciar claramente onde o bloco corta**, para o
usuário não colar duas vezes a mesma linha nem perder nenhuma:

```
### styles.css — bloco 1 de 2 (linhas 1 a N)
### styles.css — bloco 2 de 2 (linhas N+1 ao fim)
```

Regra de ouro: **ler o arquivo com a ferramenta `read` antes de reemitir qualquer trecho.** Nunca
digitar de memória — os dados têm 4 dígitos de diferença e erro de transcrição quebra o site.

---

## 6. Pegadinhas conhecidas (não repetir)

1. **O Edge se desanexa nesta máquina.** `& msedge --dump-dom` não captura stdout e
   `$LASTEXITCODE` fica vazio. Usar `Start-Process -NoNewWindow -Wait -RedirectStandardOutput`.
2. **O elemento de resultado dos testes é `<pre id="selftest-output">`**, não `id="out"`.
3. **Bug já corrigido em `patchList()`:** o corpo de cada patch era montado com `+=` sobre o HTML
   externo e acabava anexado ao template. Hoje é montado localmente e inserido no `.patch`.
   **Nunca reintroduzir isso.** Confirmação: 16 patches com tabela, 8 com aviso.
4. **`si` tem dois significados:** em `teams` é pontuação (`1890`, coluna "Pts SI"); em
   `teamsMore` é posição (`#26`, coluna "Pos. pontos SI"). `rolling` é sempre posição, e a posição
   nas listas completas é o campo `pos`.
5. **IDs com colchete/braco:** `ra[u]ora` vira `ra%5Bu%5Dora`; `M249 SAW` vira `M249%20SAW`.
   Nunca remover o `enc()` (`encodeURIComponent(String(v))`).
6. **`newOperators` e `newMaps` são arrays de strings**, não objetos.
7. **Gadgets secundários mudam por temporada** — a página avisa para consultar o patch atual.
8. **Não inventar D-Bolt, Throwing Knife nem Observation Tool.** O gadget correto é
   *Observation Blocker*.
9. **Não existe telemetria pública de attachments** nem MMR público após o Ranked 3.0. Os
   percentuais de peça são estimativas de comunidade, com confiança indicada.
10. **Apis testadas e falhando por DNS:** `api.ubisoft.com`, `r6.ubisoft.com`, `r6.tracker.gg`,
    `api.servicehub.ubisoft.com`. Não tentar de novo como se fosse falha do código.
11. **Ambiente sem `node`, `npm` e `git`.**

---

## 7. Como rodar os testes (receita que funciona)

```powershell
cd "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$udd  = "$env:TEMP\r6-edge-profile"
foreach ($t in @(@("_selftest.html",""), @("_selftest-api.html",""), @("_selftest-api.html","?modo=bad"))) {
  $u = (New-Object System.Uri((Join-Path $PWD $t[0]))).AbsoluteUri + $t[1]
  $o = "$env:TEMP\r6-final.dom.html"
  Start-Process -FilePath $edge -NoNewWindow -Wait `
    -RedirectStandardOutput $o -RedirectStandardError "$env:TEMP\r6-edge.err.txt" `
    -ArgumentList "--headless=new","--disable-gpu","--no-sandbox","--user-data-dir=$udd",
                  "--virtual-time-budget=40000","--allow-file-access-from-files","--dump-dom",$u
  $html = [IO.File]::ReadAllText($o)
  $v = [Net.WebUtility]::HtmlDecode([regex]::Match($html,'(?s)<pre id="selftest-output">(.*?)</pre>').Groups[1].Value)
  $e = [regex]::Match($v,'JS-ERROS\((\d+)\)').Groups[1].Value
  $f = [regex]::Match($v,'FALHAS\((\d+)\)').Groups[1].Value
  "{0}{1,-10} JS-ERROS={2} FALHAS={3}" -f $t[0], $t[1], $e, $f
}
```

Saída esperada: as três linhas com `JS-ERROS=0 FALHAS=0`.

Verificar que os wrappers batem com o JSON (o erro do `ConvertFrom-Json` enche a tela; extraia
pelo marcador, nunca por `IndexOf("{")`, que acha o `{}` da linha 1):

```powershell
foreach ($f in @("patchnotes","news")) {
  $w = [IO.File]::ReadAllText("assets\js\data\$f.js", [Text.Encoding]::UTF8)
  $m = "window.R6HUB.$f = "
  $json = $w.Substring($w.IndexOf($m) + $m.Length).Trim().TrimEnd(';')
  $a = [IO.File]::ReadAllText("data\$f.json", [Text.Encoding]::UTF8) | ConvertFrom-Json
  $b = $json | ConvertFrom-Json
  "{0,-12} identico={1}" -f $f, (($a | ConvertTo-Json -Depth 30 -Compress) -ceq ($b | ConvertTo-Json -Depth 30 -Compress))
}
```

---

## 8. O que NÃO fazer ao retomar

- Não recriar, reescrever ou "melhorar" nenhum arquivo: o site já está pronto e testado.
  A única edição feita depois dos testes foi acrescentar `ORDEM.md` e `tools/abrir-ordem.ps1`
  na lista de estrutura do `README.md` (conteúdo inalterado, sem risco).
- Não reexecutar `build-data.ps1` sem necessidade (ele é idempotente, mas não faz sentido).
- Não repetir a Parte 1 da entrega.
- Não voltar a sugerir o guia de VS Code.
