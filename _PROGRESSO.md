# PONTO DE RETOMADA — R6 HUB

> Arquivo de trabalho entre sessões. **NÃO faz parte do site.** Pode apagar quando quiser.

## ESTADO: PRONTO, TESTADO E REFATORADO

O site está completo e a refatoração de legibilidade terminou. Não há pendência técnica.

Commits (do mais recente para o mais antigo):

```
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
   `data\news.json` e rode `tools\build-data.ps1`. Não edite o `.js` na mão.

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
