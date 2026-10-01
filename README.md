# R6 HUB

Site de comunidade sobre o jogo Rainbow Six Siege. Tem Operadores, armas, notícias, histórico de balanceamento e rankings.

Projeto não oficial, sem vínculo com a Ubisoft.

## Como abrir

Dê dois cliques no arquivo `index.html`. É isso — não precisa instalar nada nem subir servidor.

Precisa de um navegador atual (Edge, Chrome, Firefox ou Safari). Funciona sem internet: o site abre offline.

## O que tem no site

| Página | O que mostra |
| --- | --- |
| Início | Temporada atual, destaques, últimas notícias e os times no topo |
| Agentes | Os 78 Operadores, com filtro por lado, função, CTU, vida, velocidade e ano |
| Armas | As 116 armas, com dano, cadência, carregador e as peças mais usadas |
| Notícias | Notícias do jogo com filtro por categoria |
| Balanceamentos | As patch notes oficiais, com o que foi buffado ou nerfrado |
| Rankings | Times profissionais e jogadores individuais mais titulados |

## Onde ficam as coisas

```
index.html                    a página do site
README.md                     este arquivo
_selftest.html                teste automático (veja "Testar" abaixo)
_selftest-api.html            teste automático da parte de rankings

assets/css/styles.css         as cores e o visual
assets/js/config.js           o que pode ser mudado sem mexer no código
assets/js/app.js              o site em si: mostra as páginas e trata o clique
assets/js/data/operators.js   a lista de Operadores
assets/js/data/weapons.js     a lista de armas
assets/js/data/rankings.js    a lista de times e jogadores
assets/js/data/patchnotes.js  os balanceamentos  (gerado, não editar)
assets/js/data/news.js        as notícias         (gerado, não editar)

assets/img/operators/         um desenho SVG por Operador
assets/img/operators/LEIA-ME.md  de onde veio e a licença dos desenhos

data/patchnotes.json          a fonte dos balanceamentos
data/news.json                a fonte das notícias
tools/build-data.ps1          script que regera os dois arquivos "gerado"
```

## Mudar alguma informação

Quase tudo o que aparece na tela está em `assets\js\data\`. Abra o arquivo, ache a linha que quer mudar, edite e salve. Depois é só dar F5 no navegador.

- Quer mudar cores ou textos fixos? Editar `assets\js\config.js`.
- Quer mudar os links de origem (Ubisoft, wiki, etc.)? Editar `assets\js\config.js`.
- Quer ver um ranking que vem de um servidor externo? Editar `rankingApiUrl` em `assets\js\config.js`. Se deixar vazio, o site usa a lista que está no arquivo.

**Atenção:** `patchnotes.js` e `news.js` são gerados. Para mudar balanceamentos ou notícias, edite os `.json` da pasta `data/` e rode o script abaixo.

## Gerar os arquivos automáticos

Abra o PowerShell na pasta do projeto e rode:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-data.ps1
```

O script lê `data\patchnotes.json` e `data\news.json` e reescreve os dois arquivos `.js` correspondentes. Se algum JSON estiver com erro de escrita, o script avisa e não gera.

## Testar

Dê dois cliques no `_selftest.html`. Ele abre o site inteiro, passa por todas as páginas e escreve o resultado no fim da tela.

- Aba do navegador mostrando **SELFTEST-OK** = tudo certo.
- Mostrando **SELFTEST-FALHOU** = algo quebrou; role até o fim da tela, na parte `FALHAS(n)`, e veja o que foi apontado.

Para testar a parte de rankings, abra também o `_selftest-api.html`. Ele carrega um ranking falso de propósito, para conferir que o site sabe trocar os dados quando recebe e manter os dados salvos quando a internet falha.

## Regras do projeto

- Interface em português; notícias e patch notes no idioma original da Ubisoft.
- Sem build, sem dependências, sem servidor. Só HTML, CSS e JavaScript.
- Os percentuais de uso de peças são **estimativas da comunidade** — a Ubisoft não publica esse número. Isso está avisado no próprio site.
- Desde o Ranked 3.0 (junho de 2026) não existe MMR público, então o site não mostra esse valor em lugar nenhum.
