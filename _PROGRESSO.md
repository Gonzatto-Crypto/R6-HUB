# PONTO DE RETOMADA — R6 HUB

> Arquivo de trabalho entre sessões. **NÃO faz parte do site.** Pode apagar quando quiser.

## ESTADO: PRONTO, TESTADO, PUBLICADO E COM ATUALIZAÇÃO AUTOMÁTICA

O site está completo, a refatoração de legibilidade terminou e agora ele também está
publicado no **GitHub Pages**, com as patch notes se atualizando sozinhas todo dia.
Não há pendência técnica.

Commits (do mais recente para o mais antigo):

```
21c9ef6  corrige a acentuacao nos textos da interface
c0ce68a  automatiza a atualizacao de patch notes e o deploy no GitHub Pages
8cdf85c  adiciona um desenho SVG para cada operador
216a443  simplifica o CSS e padroniza os nomes das classes em portugues
26ecd3a  atualiza a documentacao interna com o estado atual do projeto
3cb1fee  atualiza os testes automaticos para os novos nomes de campo
8f6d5e4  refatora: troca nomes curtos de campos e variaveis por nomes claros
88cf3e3  docs: simplifica o README para linguagem do dia a dia
7bd4b36  chore: snapshot inicial antes da refatoracao
088fd61  R6 HUB - estado inicial
```

### O que a refatoração mudou

Nenhum valor de dado mudou — só os **nomes** dos campos e das variáveis. Antes existiam
nomes de uma ou duas letras (`n`, `ctu`, `si`, `dmg`); agora são palavras inteiras em português.
A página continua igual, com três avisos reescritos para tirar o jargão em inglês
("telemetria de uso de attachments" virou "o número de uso de peças").

---

## 1. Como rodar os testes

Os testes abrem no navegador e escrevem o resultado num bloco `<pre id="selftest-output">`.
Em modo headless (sem abrir janela):

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$raiz = 'file:///C:/Users/User/OneDrive/%C3%81rea%20de%20Trabalho/R6%20HUB/'
$udd  = "$env:TEMP\r6-edge-profile"
foreach ($t in @(@("_selftest.html",""), @("_selftest-api.html",""), @("_selftest-api.html","?modo=bad"))) {
  & $edge --headless=new --disable-gpu --no-sandbox --user-data-dir="$udd" `
          --virtual-time-budget=120000 --dump-dom ($raiz + $t[0] + $t[1]) 2>$null
}
```

O esperado é `JS-ERROS(0)` e `FALHAS(0)` nas três. Se preferir ver na tela, é só abrir
`_selftest.html` no Edge e rolar até o fim da página.

---

## 2. Pegadinhas conhecidas (não repetir)

1. **`siPoints` tem dois significados.** Em `teams` são os **pontos** do Six Invitational
   (1890, coluna "Pts SI"). Em `teamsMore` é a **posição** — e por isso o campo se chama
   `siPosition` (26 = vigésimo sexto lugar). `rollingPosition` é sempre posição.
2. **O filtro de CTU na URL se chama `ctu`, não `unit`.** O campo no arquivo é `unit`, mas a
   URL continua `?ctu=` para os links já salvos no navegador continuarem funcionando.
3. **IDs com colchete/chave:** `ra[u]ora` vira `ra%5Bu%5Dora`; `M249 SAW` vira `M249%20SAW`.
   Nunca remover o `codificarParaLink()` (`encodeURIComponent`).
4. **`newOperators` e `newMaps` são listas de texto**, não de objetos.
5. **Gadgets secundários mudam por temporada** — a página avisa para conferir o patch atual.
6. **Não existe telemetria pública de peças** nem MMR público após o Ranked 3.0. Os percentuais
   de peça são estimativas da comunidade, com confiança indicada.
7. **Não inventar D-Bolt, Throwing Knife nem Observation Tool.** O gadget correto é
   *Observation Blocker*.
8. **APIs que falham por DNS** (não é bug do código): `api.ubisoft.com`, `r6.ubisoft.com`,
   `r6.tracker.gg`, `api.servicehub.ubisoft.com`.
9. **`patchnotes.js` e `news.js` são gerados.** Para mudar, edite `data\patchnotes.json` ou
   `data\news.json` e rode `tools\build-data.ps1`. Não edite o `.js` na mão. As patch notes
   novas entram sozinhas por `tools\update-patch-notes.ps1` (veja a seção 6).

---

## 3. Ambiente

- `git` **está** instalado e o repositório já tem histórico — use `git status` antes de
  assumir que algo mudou.
- `node` e `npm` **não** existem nesta máquina. Para testar JavaScript, use o Edge headless
  como na seção 1.
- O shell é PowerShell 5.1: `&&` não funciona. Use `;` ou o parâmetro `workdir`.

---

## 4. Decisões fechadas com o usuário

1. **Notícias continuam em inglês** (título e resumo preservados da fonte). Só os menus e
   rótulos da interface são em pt-BR. Não traduzir `data\news.json` nem `news.js`.
2. **Site sem build e sem servidor:** HTML, CSS e JS puro, funciona por `file://`.
3. **Código para gente não técnica:** nomes longos em português, comentários explicando o
   "porquê", sem abstrações espertas. Ao mudar código, rode os 3 testes da seção 1.
4. **Commits simples e frequentes**, com mensagem curta e em português.
5. **Publicação no GitHub Pages** com **atualização 100% automática** das patch notes (o robô
   commita direto, sem revisão) e classificação **buff/nerf só por heurística, sem IA**
   (quando em dúvida, "Misto").

---

## 5. Contexto para o trabalho com IMAGENS (pedido previsto)

O projeto **não usa nenhuma imagem** hoje: zero `<img>` e zero `background-image`. A pasta
`assets\img\` existe, mas está **vazia**. Isso é proposital — o site funciona offline sem
arquivos binários.

Consequência: incluir imagens é puramente aditivo, não é refatoração.

Para adicionar logotipos, o caminho mais limpo é mexer em **uma** função só. Hoje ela gera as
duas letras do quadradinho, e é usada em 5 lugares:

| Onde | Classe CSS | Objeto |
| --- | --- | --- |
| `app.js` (lista de operadores) | `.avatar` | Operador |
| `app.js` (detalhe do operador) | `.avatar` | Operador |
| `app.js` (detalhe da arma) | `.avatar` | Arma |
| `app.js` (aba de times) | `.team-logo` | Time |
| `app.js` (aba solo) | `.team-logo` | Jogador |

A função que produz as iniciais é `iniciais(nome)`, perto do topo do `app.js`. Se ela passar a
devolver uma `<img>` quando o arquivo existir e o texto quando não existir, os 5 usos se
resolvem de uma vez e **nenhum arquivo de dado precisa ganhar campo novo**.

Cuidados:

- Manter `alt` e `loading="lazy"` nos cards.
- Não quebrar o fallback em texto: os testes contam `.avatar` e `.team-logo`.
- Logotipos de times e jogadores têm direitos de uso da Ubisoft — avisar antes de embutir
  logotipo de terceiros.
- Nomear arquivos sem acento, em minúsculas e com hífen, para casar com a chave de lookup.

---

## 6. Publicação e atualização automática (novo)

Dois workflows em `.github/workflows/`:

| Arquivo | Quando roda | O que faz |
| --- | --- | --- |
| `pages.yml` | push na `main`, fim do workflow de patch notes, ou manual | publica `index.html` + `assets/` no GitHub Pages |
| `update-patch-notes.yml` | 09:00 UTC todo dia, ou manual | baixa o feed, mescla patch notes novas, regera os `.js` e commita |

Detalhes que importam:

- **A publicação pelo GitHub Pages precisa ser ligada uma vez** em
  **Settings → Pages → Source → GitHub Actions**. Sem isso o `pages.yml` falha — e o primeiro
  push já rodou o workflow antes de estar ligado, então é preciso **Re-run** depois de ligar.
- **O commit do robô usa o `GITHUB_TOKEN`**, e commit feito com esse token **não dispara outros
  workflows** por push (regra do GitHub). Por isso o `pages.yml` escuta o evento `workflow_run`
  (o fim do workflow de patch notes), em vez de confiar no push do bot.
- O `pages.yml` publica **só** o `index.html` e a pasta `assets/` — os testes (`_selftest*.html`),
  a pasta `tools/` e a pasta `data/` ficam de fora do site.

### Como o `tools/update-patch-notes.ps1` funciona

1. Baixa `news.min.json` do `danielwerg/r6news` (espelho do site oficial).
2. Filtra só o que tem `categories` com `patch-notes` **e** título com "patch notes" — isso
   descarta "Designer's Notes" e "Streamer Charm", que vêm com a mesma categoria.
3. Compara com os `label`s já salvos e adiciona **apenas** as notas mais novas que a mais
   recente registrada — nunca faz backfill de nota antiga.
4. Grava o JSON **como texto**: insere as entradas novas logo após `"patches": [`, sem
   reserializar o resto. Se não houver nada novo, nem toca no arquivo (não gera commit vazio).
5. Atualiza `generatedAt` só quando há mudança.

**Buff/nerf é heurístico, sem IA:** o script descobre se o número subiu ou desceu pelo verbo
(`increased`, `reduced`, ...) e cruza com duas tabelas de palavras-chave (o que melhora vs. o
que piora ao subir). Sem verbo ou sem palavra-chave, a mudança fica **sem** `direction`, e o
site (`etiquetaDirecao`, em `app.js`) mostra **Misto**. Ao mexer nessas listas, teste com uma
nota real como na seção 1.
