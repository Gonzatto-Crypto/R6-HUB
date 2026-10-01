# Desenhos dos Operadores

Uma imagem SVG para cada um dos 78 Operadores, dentro desta pasta.

## De onde veio

Estes desenhos foram feitos para o R6 HUB. Nenhum arquivo aqui veio do
jogo, da Ubisoft ou de qualquer outro projeto. São formas geométricas
simples (capacete, visor e ombros) sobre um fundo em degradê.

A cor segue o lado do Operador: tons quentes para os atacantes e tons
frios para os defensores. Pequenos detalhes (tom, ângulo das linhas de
fundo, largura dos ombros e formato do visor) variam a partir do `id` do
Operador, então o resultado é sempre o mesmo ao rodar o gerador de novo.

## Licença

São parte do R6 HUB e seguem a licença do projeto. Pode usar, alterar e
redistribuir à vontade junto com o site. Não há restrição de terceiros
aqui.

## Como o site usa

O `assets/js/app.js` monta o quadradinho do Operador assim:

- um `<span>` com as iniciais do nome, sempre presente;
- um `<img>` com o arquivo `assets/img/operators/<nome-normalizado>.svg`,
  com `alt` e `loading="lazy"`.

Os dois ficam na mesma célula da grade do CSS, e a imagem fica por cima.
Se o SVG não carregar, o `onerror` remove a imagem e as iniciais aparecem
no lugar. Por isso nunca aparece um quadrado vazio.

O nome do arquivo é o nome do Operador em minúsculas, sem acento e sem
caractere fora de `a-z` e `0-9` (`-` no lugar). Exemplos:

| Operador | Arquivo |
| --- | --- |
| Ash | `ash.svg` |
| Capitão | `capitao.svg` |
| Jäger | `jager.svg` |
| Nøkk | `n-kk.svg` |
| Skopós | `skopos.svg` |

## Se precisar regerar

O gerador não fica no repositório, mas é um script de PowerShell simples.
Lê `assets/js/data/operators.js`, monta o nome do arquivo com a mesma
regra do `app.js` e escreve um SVG por Operador. Se você acrescentar um
Operador novo nos dados, gere o arquivo dele com o mesmo padrão.
