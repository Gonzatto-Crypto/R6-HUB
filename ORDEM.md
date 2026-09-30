# Ordem de abertura no VS Code

Este arquivo é o índice do projeto. Ele resolve dois problemas práticos:

1. **Em que ordem ler** cada arquivo para entender o site do zero.
2. **Em que ordem abrir** as abas no VS Code, e qual ordem importa se você for recriar o projeto em outro editor ou subir para um repositório.

Todos os caminhos são relativos à raiz do projeto (`R6 HUB`).

---

## 1. Ordem didática de leitura

É a ordem que faz sentido para quem nunca viu o código. Não é a ordem de execução.

| # | Arquivo | Papel | Tamanho |
| --- | --- | --- | --- |
| 1 | `README.md` | Documentação curta: o que é o site, como abrir, como testar | 4 KB |
| 2 | `index.html` | Página única. Define header, busca, nav, footer e a **ordem dos scripts** | 3 KB |
| 3 | `assets/js/config.js` | Configuração: snapshot, fontes, API de rankings | 1 KB |
| 4 | `assets/js/data/operators.js` | 78 operadores, 14 funções, pool de gadgets | 58 KB |
| 5 | `assets/js/data/weapons.js` | 116 armas, efeitos de peça, meta, índices | 34 KB |
| 6 | `assets/js/data/rankings.js` | Times, lista complementar, solo, disclaimers | 13 KB |
| 7 | `assets/js/data/patchnotes.js` | **Gerado.** Histórico de balanceamento | 86 KB |
| 8 | `assets/js/data/news.js` | **Gerado.** Notícias | 11 KB |
| 9 | `assets/js/app.js` | Roteador, todas as telas, busca, interações | 64 KB |
| 10 | `assets/css/styles.css` | Tema, componentes, responsivo | 28 KB |
| 11 | `tools/build-data.ps1` | Regenera os dois arquivos marcados como gerados | 2 KB |
| 12 | `_selftest.html` | Autoteste principal: dados, rotas, interações | 16 KB |
| 13 | `_selftest-api.html` | Autoteste da API de rankings (sucesso e falha) | 6 KB |

`app.js` e `styles.css` são os dois arquivos grandes de verdade. Todo o resto é dado ou configuração.

---

## 2. Ordem de carregamento real

Esta é a ordem que o navegador executa, e ela **importa**. Está definida pelas tags `<script>` no fim do `index.html`:

```
1. assets/js/config.js            -> define window.R6HUB_CONFIG (lido no carregamento do app.js)
2. assets/js/data/operators.js    -> window.R6HUB.operators / .roles / .gadgetPool
3. assets/js/data/weapons.js      -> window.R6HUB.weapons / .attachmentEffects / .metaGlobal
4. assets/js/data/rankings.js     -> window.R6HUB.rankings
5. assets/js/data/patchnotes.js   -> window.R6HUB.patchnotes
6. assets/js/data/news.js         -> window.R6HUB.news
7. assets/js/app.js               -> leem tudo acima e montam a pagina
```

Os arquivos de dados usam `window.R6HUB = window.R6HUB || {};`, então a ordem entre eles não causa erro — mas **o `config.js` precisa vir antes do `app.js`**, e o CSS precisa vir antes de qualquer render.

Se for recriar o projeto, copie nessa ordem e o site funciona na primeira tentativa.

---

## 3. Fontes de verdade (JSON)

Estes dois arquivos **não** são carregados pela página. São a fonte de verdade que alimenta o gerador:

| Arquivo | Gera | Itens |
| --- | --- | --- |
| `data/patchnotes.json` | `assets/js/data/patchnotes.js` | 24 patches, 7 lançamentos de operador |
| `data/news.json` | `assets/js/data/news.js` | 14 notícias |

Depois de editar qualquer um dos dois, rode:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-data.ps1
```

Se você está só **subindo** o projeto, não precisa mexer neles: copie os `.js` gerados diretamente. São eles que a página usa.

---

## 4. Abrindo no VS Code

O VS Code está instalado e o comando `code` já está no `PATH` nesta máquina.

### Abrir o projeto inteiro (o jeito normal)

```powershell
code "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB"
```

Abre a pasta como **workspace**. Todos os arquivos aparecem na barra lateral, com busca global funcionando de verdade (Ctrl+Shift+F). É isso que você quer usar.

### Abrir as abas na ordem, uma por vez

```powershell
$root = "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB"
$ordem = @(
  "README.md",
  "index.html",
  "assets\js\config.js",
  "assets\js\data\operators.js",
  "assets\js\data\weapons.js",
  "assets\js\data\rankings.js",
  "assets\js\data\patchnotes.js",
  "assets\js\data\news.js",
  "assets\js\app.js",
  "assets\css\styles.css",
  "tools\build-data.ps1",
  "_selftest.html",
  "_selftest-api.html"
)
foreach ($f in $ordem) { code -r (Join-Path $root $f) }
```

O `-r` reaproveita a janela já aberta do VS Code em vez de abrir 13 janelas separadas. As abas ficam na ordem da lista; para alternar entre elas use `Ctrl+Tab` ou `Ctrl+P` e digite o nome do arquivo.

### Abrir só um arquivo na janela atual

```powershell
code -r "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB\assets\js\app.js"
```

### Ver o site de dentro do VS Code

Com o arquivo `index.html` aberto, `Ctrl+Shift+P` → **Tasks: Run Task** não existe por padrão, então use o mais simples:

- `Ctrl+Shift+P` → **Simple Browser: Show** → cole `file:///C:/Users/User/OneDrive/%C3%81rea%20de%20Trabalho/R6%20HUB/index.html`
- ou clique com o botão direito no `index.html` na barra lateral → **Open in Simple Browser** (se a extensão estiver instalada).

Só funciona se a extensão **Simple Browser** estiver instalada. Se não, abra o `index.html` no Edge — o site não precisa de servidor.

---

## 5. Se for subir para outro editor (vscode.dev, Codespaces, GitHub)

O caminho mais rápido é compactar a pasta e enviar o `.zip`:

```powershell
$root  = "C:\Users\User\OneDrive\Área de Trabalho\R6 HUB"
$dest  = "$env:USERPROFILE\Desktop"
$zip   = Join-Path $dest "r6-hub.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $root "*") -DestinationPath $zip
"gerado: $zip  ({0:N0} KB)" -f ((Get-Item $zip).Length / 1KB)
```

Ao descompactar, a estrutura tem que ser preservada com as pastas `assets\css`, `assets\js\data`, `data` e `tools`. Se os `.js` ficarem na raiz em vez de `assets\js\data`, o `index.html` não acha os scripts e a página fica em branco.

Detalhe importante para ambiente online: a API de rankings só funciona se o servidor liberar CORS. Em `file://` e em `vscode.dev` a origem é diferente, então o esperado é o site cair no snapshot local — que é o comportamento correto e já testado.

---

## 6. Ordem de montagem, do zero

Se estiver criando a pasta e colando os arquivos na mão, siga esta sequência:

```
1.  criar as pastas:  assets\css  assets\js\data  data  tools
2.  colar  README.md
3.  colar  index.html
4.  colar  assets\css\styles.css
5.  colar  assets\js\config.js
6.  colar  assets\js\data\operators.js
7.  colar  assets\js\data\weapons.js
8.  colar  assets\js\data\rankings.js
9.  colar  data\patchnotes.json
10. colar  data\news.json
11. colar  assets\js\data\patchnotes.js
12. colar  assets\js\data\news.js
13. colar  assets\js\app.js
14. colar  tools\build-data.ps1
15. colar  _selftest.html
16. colar  _selftest-api.html
17. abrir index.html no navegador
```

O passo 9 e 10 podem ser pulados se você já vai colar os `.js` gerados (passos 11 e 12). Eles só existem para você conseguir regenerar os dados depois.

Depois de colar, abra `index.html`. Se a página carregar com 78 operadores, 116 armas, 24 balanceamentos e 15 times, a montagem está correta.
