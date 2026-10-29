# 🍓 Novelinha das Frutas 3D

Estúdio para criar **vídeos animados em 3D de novelinhas de frutas**: você escreve o roteiro
(quem fala, o quê, expressão, gesto, câmera) e o estúdio monta a cena 3D com legendas,
efeitos dramáticos, trilha sonora e "vozinhas", e exporta o vídeo em **MP4**.

Já vem com 5 capítulos de exemplo (pasta `videos/`):

| Cap. | Título | Cenário | Elenco |
|---|---|---|---|
| 1 | O Segredo da Banana | sala | Moranguinha, Bruno Banana, Dona Maçã |
| 2 | A Herança do Abacaxi | mansão | Barão Abacaxi, Lara Laranja, Uvinha |
| 3 | Amor na Feira | feira | Mel Melancia, Marcos Maçã, Valentina Uva |
| 4 | A Amnésia do Limão | hospital | Léo Limão, Moranguinha, Dra. Uva |
| Frutas do Morro 1 | Fofoca na Laje | morro (laje na Rocinha) | Dona Maçã, Moranguinha, Bruno Banana, Vó Valentina |
| 5 | Cuidado com o Meio-Fio | rua_noite (começa com uma foto real) | Bruno Banana, Moranguinha e o hatch rebaixado |

## Como usar

### 1. Ver e gravar no navegador (sem instalar nada)
```bash
cd novelinhas-3d
npx serve .          # ou: python3 -m http.server 8080
```
Abra `http://localhost:8080`, escolha o capítulo e clique em **Play**.
O botão **Gravar com som** grava o vídeo em tempo real e baixa o arquivo
(MP4 no Safari/Chrome recentes, WebM nos demais).

### 2. Exportar MP4 em alta qualidade (quadro a quadro)
Requer Node 18+ e `ffmpeg`.
```bash
cd novelinhas-3d
npm install
npx playwright install chromium          # só na primeira vez
npm run render                           # todos os capítulos, vertical 720x1280
npm run render -- --ep amor-feira --hd   # um capítulo em 1080x1920
npm run render -- --formato horizontal   # 16:9 para YouTube
npm run render -- --roteiro minha-novela.json
```
Os vídeos saem na pasta `videos/`. Opções: `--ep id1,id2`, `--formato vertical|horizontal`,
`--hd`, `--fps 30`, `--saida pasta`.

## Criando a sua novelinha

Edite o roteiro direto na página (caixa **Roteiro** → **Aplicar roteiro** → **Baixar .json**)
ou adicione um item em `js/episodios.js`:

```js
{
  id: 'minha-novela', capitulo: 5,
  titulo: 'O Casamento do Kiwi', subtitulo: 'Vai ter bolo?',
  cenario: 'sala',                       // sala | mansao | feira | hospital | rua_noite | morro
  personagens: {
    maca:   { tipo: 'maca', nome: 'Marta Maçã', pos: [-1, 0.2], cilios: true, acessorios: ['laco'] },
    banana: { tipo: 'banana', nome: 'Beto Banana', pos: [1, 0.2], acessorios: ['gravata'] },
  },
  cenas: [
    { tipo: 'titulo' },
    { quem: 'banana', fala: 'Marta, quer casar comigo?', acoes: { banana: { expr: 'apaixonado', gesto: 'apontar' } }, efeito: 'coracoes:banana' },
    { camera: 'drama:maca', acoes: { maca: { expr: 'chocado' } } },
    { quem: 'maca', fala: 'SIM! Mil vezes sim!', acoes: { maca: { expr: 'feliz', gesto: 'comemorar' } }, efeito: 'confete' },
    { tipo: 'fim', legenda: 'Será que a sogra vai aprovar?' },
  ],
}
```

**Personagens**: `maca`, `laranja`, `morango`, `banana`, `abacaxi`, `uva`, `limao`, `melancia`
(opções: `cor`, `cilios`, `batom`, `voz` em Hz, `visivel: false` para entrar depois).

**Acessórios**: `cartola`, `bigode`, `monoculo`, `oculos`, `oculos_escuros`, `laco`, `colar`,
`gravata`, `avental`, `coroa`, `bone`, `papel` (na mão), `flor` (na mão).

**Cenas**
- `quem` + `fala`: quem fala e o texto (a duração é calculada; use `dur` para forçar).
- `camera`: `geral`, `close:id`, `dois:id1,id2`, `drama:id` (zoom + "dun dun dun").
- `acoes`: por personagem → `expr`, `gesto`, `ir: [x, z]`, `entrar: true` + `de: [x, z]`,
  `sair: [x, z]`, `alvo` (para o tapa), `olhar` (`id` ou `camera`), `atraso`, `tempo`.
- `efeito`: `coracoes:id`, `confete`, `tremor`, `flash`, `vinheta`, `dun` (ou uma lista).
- `texto`: onomatopeia grande na tela (ex.: `"SOCORRO!"`). `som`: `boing`, `susto`, `plaft`...
- `serie`: nome da série que aparece na tela (padrão: "Novelinha das Frutas").
- `tipo: 'foto'`: mostra a foto do roteiro (`foto: 'img/arquivo.jpg'`) com zoom de cinema (`zoom: [1, 1.4]`, `foco: [[x,y],[x,y]]` de 0 a 1).
- `camera` também pode ser livre: `{ pos: [x,y,z], ate: [x,y,z], olhar: [x,y,z] }`.
- `props`: anima objetos do cenário, ex.: `{ porta: 53 }` (graus da porta do carro no `rua_noite`), com `propsTempo` e `propsAtraso`.
- Ações extras: `sentado: true/false`, `virar` (ângulo fixo em radianos). No roteiro: `calcada: { x, altura }` sobe quem pisa na calçada.
- `tipo: 'titulo'` (abertura) e `tipo: 'fim'` (cartão "Continua...", com `texto` e `legenda`).

**Expressões**: neutro, feliz, triste, chorando, bravo, chocado, apaixonado, malvado, nervoso, tonto, desconfiado.

**Gestos**: acenar, apontar, comemorar, maos_rosto, cintura, tapa, pular, tremer, dancar, pensar,
abracar, segurar, desmaiar, caido.

O palco vai de `x = -3` a `3` (esquerda/direita) e `z = -1` a `1.5` (fundo/frente);
coloque os personagens a ~1,7 de distância entre si.

## Estrutura
- `index.html` — estúdio (player, gravação, editor de roteiro)
- `js/personagens.js` — frutas 3D, rostos, expressões, gestos e acessórios
- `js/cenarios.js` — sala, mansão, feira e hospital
- `js/motor.js` — linha do tempo, câmera, legendas e efeitos
- `js/audio.js` — trilha, vozinhas e efeitos sonoros sintetizados
- `js/episodios.js` — roteiros
- `render.mjs` — exportação MP4 (Playwright + ffmpeg)
