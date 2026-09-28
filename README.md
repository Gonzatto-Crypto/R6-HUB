# R6 HUB

Hub de comunidade sobre **Tom Clancy's Rainbow Six Siege**: operadores, armas e peças de arma, notícias, histórico de balanceamento e rankings.

Site 100% estático — HTML, CSS e JavaScript puro, **sem build, sem dependências e sem servidor**. Abre direto no navegador por `file://`.

- Projeto não oficial, sem vínculo com a Ubisoft.
- Interface em pt-BR; snapshot de dados em `2026-09-28`, temporada `Y11S3 — Operation Split Fire`.

---

## Como abrir

Clique duas vezes em `index.html`, ou abra no navegador com a URL `file://`:

```
file:///C:/Users/User/OneDrive/%C3%81rea%20de%20Trabalho/R6%20HUB/index.html
```

Não precisa de servidor local, Node, npm ou internet. Se as fontes do Google não carregarem (sem rede), o site cai nas fontes do sistema sem quebrar.

### Requisitos

- Qualquer navegador moderno com suporte a `fetch` e `Promise`: Edge, Chrome, Firefox ou Safari atuais.
- Opcional: **Windows PowerShell 5.1+** apenas para rodar `tools\build-data.ps1`.

---

## Estrutura

```
index.html                     estrutura da pagina, header, busca, nav, footer e ordem dos scripts
assets/css/styles.css          tema escuro (preto/dourado, ATK vermelho, DEF azul), responsivo
assets/js/config.js            snapshot, fontes, config da API opcional de rankings
assets/js/app.js               roteador por hash + toda a renderizacao e interacao
assets/js/data/operators.js    window.R6HUB.operators, .roles, .gadgetPool
assets/js/data/weapons.js      window.R6HUB.weapons, .attachmentEffects, .metaGlobal + helpers
assets/js/data/rankings.js     window.R6HUB.rankings (times, timesMore, solo, disclaimers)
assets/js/data/patchnotes.js   GERADO a partir de data/patchnotes.json
assets/js/data/news.js         GERADO a partir de data/news.json
data/patchnotes.json           fonte de verdade dos balanceamentos
data/news.json                 fonte de verdade das noticias
tools/build-data.ps1           regenera patchnotes.js e news.js a partir dos JSONs
tools/abrir-ordem.ps1          abre o projeto no VS Code com as abas na ordem de leitura
_selftest.html                 suite de integridade, rotas e interacoes
_selftest-api.html             testes da API de rankings (sucesso e falha)
assets/img/                    reservado para imagens (vazio; o layout funciona sem elas)
ORDEM.md                       indice do projeto: ordem de leitura, de execucao e de montagem
```

Os scripts são carregados em ordem no fim do `index.html`. `config.js` vem primeiro porque `app.js` lê `window.R6HUB_CONFIG` no carregamento. Se mover um script, mantenha essa ordem.

---

## Rotas

Navegação por hash, com query string compartilhável. O estado dos filtros vive na URL, então dá para copiar e colar um link já filtrado.

| Rota | Conteúdo |
| --- | --- |
| `#/` | Home: temporada, destaques, últimos balanceamentos, notícias e top times |
| `#/agentes` | Lista dos 78 operadores + pool de gadgets secundários |
| `#/agente/<id>` | Detalhe do operador, com passagem anterior e próxima |
| `#/armas` | Catálogo de armas, peças e meta global |
| `#/arma/<nome>` | Detalhe da arma, slots de peça e efeitos |
| `#/noticias` | Notícias com filtro por categoria |
| `#/noticias?tab=balanceamentos` | Histórico de patches, expansível |
| `#/rankings` | Ranking profissional de times |
| `#/rankings?tab=solo` | Jogadores individuais mais titulados |

IDs e nomes com caracteres especiais são percent-encoded: `#/agente/ra%5Bu%5Dora`, `#/arma/M249%20SAW`.

Rota desconhecida mostra o estado "Página não encontrada" com link de volta para a home.

### Parâmetros de query

**`#/agentes`** — `side` (`ATK` \| `DEF`), `role`, `ctu`, `speed` (1/2/3), `health` (100/110/125), `year`, `q`.

- `role` aceita: `entrada`, `frag`, `suporte`, `intel`, `antifrag`, `flex`, `ancora`, `roamer`, `zona`, `armadilha`, `construcao`, `negacao`, `antigadget`, `antidrone`.
- Exemplo: `#/agentes?side=ATK&q=ram` → 2 operadores.

**`#/armas`** — `type`, `q`, `only=meta`.

- `type` aceita: `AR`, `SMG`, `LMG`, `SHOTGUN`, `MARKSMAN`, `SNIPER`, `PISTOL`, `SHIELD`, `MELEE`, `LAUNCHER`.
- `only=meta` filtra só as armas marcadas como meta. O parâmetro funciona pela URL, mas não há atalho na interface para ele.

**`#/noticias`** — `tab` (`noticias` \| `balanceamentos`), `cat` (categoria da notícia).

**`#/rankings`** — `tab` (`times` \| `solo`).

Trocar query re-renderiza sem mexer na posição do scroll. O cursor e o foco do campo de busca são preservados durante a digitação.

---

## Objetos de dados

Todos os dados são globais em `window.R6HUB`, montados por IIFE e sem dependências.

| Objeto | Onde | Conteúdo |
| --- | --- | --- |
| `R6HUB.operators` | `data/operators.js` | 78 operadores (39 ATK / 39 DEF) |
| `R6HUB.roles` | `data/operators.js` | 14 funções com `id` e `label` |
| `R6HUB.gadgetPool` | `data/operators.js` | Pool de gadgets secundários por lado |
| `R6HUB.weapons` | `data/weapons.js` | 116 armas com stats, slots e notas |
| `R6HUB.attachmentEffects` | `data/weapons.js` | Efeito de cada peça, por slot |
| `R6HUB.metaGlobal` | `data/weapons.js` | Percentuais de meta por arma |
| `R6HUB.weaponIndex` | `data/weapons.js` | Índice auxiliar por nome normalizado |
| `R6HUB.operatorWeapons` | `data/weapons.js` | Armas por operador |
| `R6HUB.weaponOperators` | `data/weapons.js` | Operadores que usam cada arma |
| `R6HUB.rankings` | `data/rankings.js` | `teams`, `teamsMore`, `solo`, `disclaimer` |
| `R6HUB.patchnotes` | `data/patchnotes.js` (gerado) | `patches`, `operatorReleases` |
| `R6HUB.news` | `data/news.js` (gerado) | `items` |

Volumes no snapshot `2026-09-28`: 24 patches (16 com tabela de balanceamento, 8 sem mudanças) e 7 lançamentos de operador; 15 times no ranking principal, 12 na lista complementar e 7 jogadores na aba solo.

`tools\build-data.ps1` só regenera `patchnotes.js` e `news.js`. Os outros quatro arquivos de dados são escritos à mão e não têm fonte JSON equivalente.

---

## Atualizando os dados

`data\patchnotes.json` e `data\news.json` são a fonte de verdade. Depois de editar qualquer um deles, regenere os wrappers:

```powershell
cd "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB"
powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-data.ps1
```

O script escreve `assets/js/data/patchnotes.js` e `assets/js/data/news.js` no formato:

```js
/* Gerado a partir de data/patchnotes.json - nao editar aqui */
window.R6HUB = window.R6HUB || {};
window.R6HUB.patchnotes = { ... };
```

Para conferir que a regeneration preservou o conteúdo:

```powershell
foreach ($f in @("patchnotes","news")) {
  $w   = [IO.File]::ReadAllText("assets\js\data\$f.js")
  $m   = "window.R6HUB.$f = "
  $json = $w.Substring($w.IndexOf($m) + $m.Length).Trim().TrimEnd(';')
  "  {0,-12} ok={1}" -f $f, [bool]($json | ConvertFrom-Json)
}
```

Ao acrescentar um patch, inclua `newOperators` e `newMaps` como arrays de strings (podem vir vazios). Se `balance` vier vazio, a interface mostra um aviso de que não houve mudanças de balanceamento.

**NÃO edite** `patchnotes.js` e `news.js` manualmente — o próximo `build-data.ps1` sobrescreve.

---

## API de rankings ao vivo (opcional)

Por padrão `rankingApiUrl` está vazio e o site usa **somente o snapshot local**. Preenchendo a URL em `assets/js/config.js`, a aba de rankings tenta um `fetch` e cai no snapshot local se a chamada falhar:

```js
window.R6HUB_CONFIG = {
  // ...
  rankingApiUrl: "https://exemplo.com/r6/rankings.json",
  rankingApiHeaders: { "Authorization": "Bearer ..." }
};
```

Formato esperado — mesmos campos de `assets/js/data/rankings.js`:

```json
{
  "teams": [
    { "pos": 1, "name": "DarkZero", "region": "América do Norte", "rolling": 3,
      "rollingPts": 424, "si": 1890, "titles": ["..."], "team": "...",
      "coach": "...", "source": "https://..." }
  ],
  "solo": [
    { "pos": 1, "tag": "cyber", "real": "Jaime Pereira Ramos", "country": "Brasil",
      "team": "FaZe Clan", "mmu": null, "note": "...", "source": "https://..." }
  ]
}
```

Qualquer array vazio ou ausente mantém o snapshot local para essa aba. O badge no topo mostra `API ao vivo`, `consultando API...` ou `snapshot local (API indisponível: ...)` — nunca deixa a página quebrada.

**Dois avisos práticos:**

- A API precisa responder com CORS liberado para origem `null` (é o que o navegador envia ao abrir por `file://`). Sem isso, o `fetch` falha e o site usa o snapshot.
- `rankings.js` é carregado por `<script>` e depende de ordem de execução; a API é a única forma de atualizar os dados sem rebuild.

Cuidado com o campo `si`, que tem **significado diferente nas duas listas**:

| Lista | Coluna | `si` significa | Render |
| --- | --- | --- | --- |
| `teams` | `Pts SI` | pontuação acumulada | `1890` |
| `teamsMore` | `Pos. pontos SI` | posição no ranking de pontos | `#26` |

`rolling` é sempre posição (`#3`) e `rollingPts` é a pontuição (`424 pts`). Nas listas completas (`teams`, `solo`), a posição é o campo `pos`.

---

## Fontes e avisos

Dados compilados a partir de fontes oficiais e de comunidade (lista completa em `assets/js/config.js`):

| Fonte | URL |
| --- | --- |
| Operadores (Ubisoft) | `https://www.ubisoft.com/en-gb/game/rainbow-six/siege/game-info/operators` |
| Operadores (wiki) | `https://rainbowsix.fandom.com/wiki/Operators_(Siege)` |
| Patch notes | `https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates` |
| Standings globais | `https://www.ubisoft.com/en-us/esports/rainbow-six/siege/global-standings` |
| Rankings de times | `https://sixstats.cc/team-rankings` |
| Attachments (wiki) | `https://rainbowsix.fandom.com/wiki/Weapon_Attachments` |

Limitações que o site assume em voz alta, em vez de inventar número:

- **Percentual de peça não existe publicamente.** A Ubisoft não publica telemetria de uso de attachments. Todos os percentuais de peça são estimativas de consenso da comunidade, com confiança indicada por item.
- **Ranked 3.0 removeu o MMR oculto** (lançado em `2026-06-02`, Operation System Override). Não existe MMR público nem ranking ranqueado de times dentro do jogo. A aba *times* mostra o ranking profissional oficial; a aba *solo* lista jogadores reais com títulos documentados e avisa que não há MMR público para exibir.
- **Gadgets secundários mudam por temporada.** A página de operadores orienta consultar o patch atual.
- **Os títulos e resumos das notícias estão em inglês**, preservando o texto original das fontes. Os rótulos da interface estão em pt-BR.

---

## Testes

Duas páginas de autoteste rodam a aplicação inteira em um navegador headless e imprimem o resultado em `<pre id="selftest-output">`. Nenhum teste depende de rede, exceto o caso explícito de API inválida.

> **Atenção:** nesta instalação o Edge se desanexa ao ser chamado, então `& msedge --dump-dom` **não** captura a saída. Use `Start-Process` com redirecionamento para arquivo.

```powershell
cd "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$udd  = "$env:TEMP\r6-edge-profile"

function Test-R6([string]$page, [string]$query) {
  $u = (New-Object System.Uri((Join-Path $PWD $page))).AbsoluteUri + $query
  $o = "$env:TEMP\r6-$($page -replace '[^a-z0-9]','').$($query -replace '[^a-z0-9]','').dom.html"
  Start-Process -FilePath $edge -NoNewWindow -Wait `
    -RedirectStandardOutput $o -RedirectStandardError "$env:TEMP\r6-edge.err.txt" `
    -ArgumentList "--headless=new","--disable-gpu","--no-sandbox","--user-data-dir=$udd",
                  "--virtual-time-budget=40000","--allow-file-access-from-files","--dump-dom",$u
  $html = [IO.File]::ReadAllText($o)
  [Net.WebUtility]::HtmlDecode(
    [regex]::Match($html, '(?s)<pre id="selftest-output">(.*?)</pre>').Groups[1].Value).Trim()
}

Test-R6 "_selftest.html" ""
Test-R6 "_selftest-api.html" ""
Test-R6 "_selftest-api.html" "?modo=bad"
```

`--allow-file-access-from-files` é obrigatório: sem ele o navegador bloqueia os `<script>` locais ao abrir por `file://`. O `user-data-dir` separado evita conflito com um Edge já aberto. O Edge headless escreve alguns erros internos em stderr (`task_manager`, `sync`); são inofensivos e o redirecionamento acima apenas os descarta.

O que cada suíte cobre:

- **`_selftest.html`** — contagem e integridade cruzada dos dados (campos, gadgets, referências de armas, IDs e nomes sem duplicados), 26 rotas das quais 4 exercitam o estado de "não encontrado" (agente, arma, categoria e rota inexistentes), filtros combinados com hash, foco e cursor preservados, busca global, busca de armas, abas de ranking, acordeões de patch (expandir/recolher tudo) e contagem de barras de peça.
- **`_selftest-api.html`** — API válida substituindo o snapshot, e API indisponível preservando o snapshot local, o aviso de fallback e a aba solo.

Resultado da última execução, depois da regeneração dos dados:

```
_selftest.html          JS-ERROS(0)  FALHAS(0)
_selftest-api.html      JS-ERROS(0)  FALHAS(0)   (modo=ok)
_selftest-api.html      JS-ERROS(0)  FALHAS(0)   (modo=bad)
```

Ambas as páginas ficam no repositório; são estáticas e podem ser abertas manualmente para inspecionar o log.

---

## Notas de manutenção

- **Bug conhecido e já corrigido:** em `patchList()`, o corpo de cada patch era montado com `+=` sobre o HTML externo e acabava anexado ao template. Hoje o corpo é montado localmente e inserido no `.patch` correspondente. Se mexer nessa função, confira se os 24 patches abrem com o conteúdo no lugar certo — 16 devem mostrar tabela, 8 devem mostrar o aviso de "sem mudanças de balanceamento".
- **Acentuação:** os arquivos de dados são UTF-8. Se o PowerShell exibir `Ã§` no console, é só codificação do terminal, não corrupção no arquivo. Para conferir o arquivo, leia com `[IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)`.
- **`newOperators` e `newMaps`** são arrays de strings, não objetos.
- **Rotas com acento, espaço ou colchete** passam pelo helper `enc()`, que é `encodeURIComponent(String(v))`. Os links de arma usam `encodeURIComponent` direto. Não remover isso ao gerar links.
- **Layout sem imagens:** `assets/img` está vazio de propósito. Nenhum componente depende de arquivo de imagem, então o site funciona offline e completo.
