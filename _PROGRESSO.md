# PONTO DE RETOMADA — R6 HUB

> Arquivo de trabalho entre sessões. **NÃO faz parte do site** e não precisa ser
> copiado para o VS Code. Pode apagar quando a entrega terminar.

## ESTADO: EM ANDAMENTO — entrega do código por partes

O usuário pediu explicitamente que a entrega continuasse ("continua" + "continue if you have
next steps"). Partes já emitidas:

- **Parte 1**: `README.md`, `index.html`, `assets/js/config.js` — OK
- **Parte 2**: `assets/css/styles.css` (686 linhas, 2 blocos) — OK
- **Parte 3**: `assets/js/app.js` (1003 linhas, 3 blocos) — OK, **com 1 correção avisada**:
  na linha 370 usar `E o que separa este operador...` (a versão emitida tinha texto em inglês)

Próxima: **Parte 4 — `assets/js/data/operators.js`** (761 linhas / ~50 KB, 4 blocos).

## Correção de typos aplicada em 2026-09-29 (validação: 3 testes verdes)

Dois typos reais estavam no dataset e foram corrigidos na origem:

- `operators.js` Montagne: `em ẍar rush` -> `em um rush`
- `operators.js` Dokkaebi: `marcam emium pings` -> `marcam inimigos`

Como o `operators.js` já foi corrigido no disco, a **Parte 4 deve ser emitida a partir da
versão corrigida**. Não reemitir a versão antiga.

## Como retomar

Na primeira mensagem da próxima sessão, leia este arquivo inteiro. Depois depende do que o
usuário pedir:

- `continua` -> retomar a próxima parte pendente da lista (não repetir as anteriores).
- `preciso mudar X` / `arrumar Y` -> aplicar a mudança pedida, rodar os 3 testes da secao 7 e
  atualizar este arquivo.
- `ajuda com imagens` -> os hooks já mapeados estão na secao "imagens" mais abaixo.

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

**Próximo passo imediato: ESPERAR.** A entrega está pausada. A Parte 2 (`assets/css/styles.css`)
está pronta para sair, mas só quando o usuário mandar.

O usuário ainda tem a Parte 1 na mão (`README.md`, `index.html`, `assets/js/config.js`). Se ele
disser que não colou, reemitir.

## 4._(renomeado)_ Decisão sobre os `.js` gerados

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
- **Não emitir a Parte 2 sem o usuário pedir.** A entrega está pausada (ver seção 0).

---

## 9. Contexto para o trabalho com IMAGENS (pedido previsto)

O usuário já avisou que vai pedir ajuda com imagens. Estado atual, medido no código:

**Hoje o projeto não usa nenhuma imagem.** Verificado: zero `<img>` e zero `background-image` em
todo o repositório. `assets\img\` existe mas está **vazia**. Isso é intencional — o site foi feito
para funcionar offline e completo sem assets binários.

Consequência boa: **incluir imagens é puramente aditivo**, não é refatoração. Não existe código
que quebre ao adicionar arquivos.

Os pontos de inserção já existentes (todos textuais hoje):

| Onde | Trecho | Uso hoje |
| --- | --- | --- |
| `assets/js/app.js:30` | `function initials(name)` | Gera 2 letras maiúsculas a partir do nome |
| `assets/js/app.js:143` | `.avatar` + `initials(op.n)` | Card de operador na lista |
| `assets/js/app.js:348` | `.avatar` + `initials(op.n)` | Avatar no detalhe do operador |
| `assets/js/app.js:525` | `.avatar` + `initials(w.n)` | Card de arma |
| `assets/js/app.js:725` | `.team-logo` + `initials(t.name)` | Time na tabela de rankings |
| `assets/js/app.js:773` | `.team-logo` + `initials(p.tag)` | Jogador na aba solo |
| `index.html:21` | `.brand-mark` com texto `R6` | Marca da logo no header |
| `assets/css/styles.css:85` | regra `.brand-mark` | Estilo da marca |
| `assets/css/styles.css:593` | regra `.team-logo` | Estilo do logo de time |

O caminho mais limpo para imagens: alterar `initials()` para devolver um `<img>` quando o
arquivo existir e cair no texto quando não existir. Assim os 5 usos se resolvem de uma vez e
nenhum dado precisa ganhar campo novo.

Cuidados a levar em conta quando o tema de imagens aparecer:

- Manter o `alt` e o `loading="lazy"` nos cards.
- Não quebrar o `initials()`: ele é usado como fallback e os testes contam `.team-logo` /
  `.avatar`. Rodar a secao 7 depois de mexer.
- Times e jogadores têm logotipo oficial com direitos de uso da Ubisoft; avise antes de
  embutir logo de terceiros no site.
- Nomes de arquivo devem ser normalizados (sem acento, minusculo, hifen) para casar com uma
  chave de lookup em `operators.js` / `weapons.js`.
