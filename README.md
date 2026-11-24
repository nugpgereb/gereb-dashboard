
# Painel de Projetos GEREB

Dashboard React/Vite. A entrada é `src/main.jsx`; `src/App.jsx` mantém os
filtros e calcula o recorte compartilhado pelos indicadores, gráficos e tabela.
`src/data/projectCsv.js` importa o CSV raiz e normaliza os registros. Edições
locais, quando existentes, são carregadas do localStorage e também normalizadas.
`src/data/projects.js` é uma base legada e não alimenta o painel atual.

## Revisão: carteira e filtros

### Atualização da base recebida em 24/11/2026

Branch: `update/base-projetos-2026-11-24`.

O dashboard usa agora os **179 projetos** do novo anexo, incluindo **15 acordos
de execução de projetos**. Foram incluídos 3 projetos e retirados os 13 que não
constam do novo conjunto enviado. Os textos e valores do anexo foram preservados;
datas foram convertidas para ISO e moedas para números decimais sem arredondamento.

| Indicador | Valor da nova base |
| --- | ---: |
| Valor total contratado | R$ 1.471.582.314,16 |
| Recurso liberado | R$ 787.107.605,35 |
| Recurso a receber | R$ 730.285.129,27 |
| Total realizado | R$ 601.644.961,48 |
| Total comprometido | R$ 57.232.272,36 |
| Saldo total atual | R$ 128.230.371,51 |

O identificador `GEREB 111 AEP 26` contém espaços na origem e foi mantido assim.
O nome `ACORDO DE EXECUÇÃO DE PROJETO - AEP` é apresentado no painel como
`ACORDO DE EXECUÇÃO DE PROJETOS`; a descrição extensa de SCD é normalizada para SCD.
A nova chave de armazenamento impede que uma cópia local da base anterior substitua
os dados recebidos. A cópia antiga não é apagada durante o carregamento.

Importação reproduzível: `python scripts/import-projects.py "caminho/do/anexo.txt"`.
SHA-256 do CSV atual: `ED5CF318E2BCCE3174C5D8FF693315576B70CC72C2E4A2EB5A84DA050DD37427`.
Validados todos os 179 registros e 21 campos contra o anexo, os seis totais em centavos,
lint, smoke test, build e testes de navegador (filtros, gráficos, tabela, XLSX e
responsividade). Os artefatos de publicação foram regenerados.

### Histórico da revisão anterior (base de 20/10/2026)

As quantidades e a inconsistência descritas abaixo referem-se à base anterior,
substituída pela atualização acima.

Branch: `fix/carteira-projetos-gereb`.

- Filtros permanentemente visíveis, sem estado, botões ou estilos de recolhimento.
- Título único: **Carteira de Projetos da GEREB**.
- Campos e botões Aplicar/Limpar preservados. Os filtros continuam atualizando o
  painel imediatamente; Aplicar submete o formulário sem navegar ou recolhê-lo.
- Normalização compartilhada de instrumentos no carregamento do CSV, das edições
  e dos dados salvos: espaços, caracteres invisíveis, caixa, acentos dos tipos
  conhecidos, `EMENDAS` e `AEP`. Categorias novas continuam aceitas e as opções
  continuam sendo geradas a partir dos registros, sem lista de exclusão.
- Cálculos financeiros e componentes de gráficos, tabela e exportação preservados.

### Inconsistência da base

O CSV local de 20/10/2026 contém 189 projetos e **nenhum registro com tipo
ACORDO DE EXECUÇÃO DE PROJETOS ou AEP**. Há 12 identificadores contendo `-AEP-`,
todos explicitamente classificados como `EMENDA PARLAMENTAR` na coluna
`tipo_instrumento_contratual`. A ausência da opção decorre desse conteúdo da base,
e não de uma lista fixa no seletor ou de dependência dos demais filtros.

Não se deduz o tipo pelo identificador: é necessário confirmar e corrigir a
classificação na origem. Quando houver registros classificados como AEP ou pelo
nome completo, a opção aparecerá automaticamente e filtrará os registros reais.
Nenhum registro ou valor financeiro foi criado ou alterado nesta revisão.

SHA-256 do CSV preservado:
`5F72F16DB32ABE65FBA7C92DE72B071D12BD54710C3987E5CD53125BCE5301E3`.

### Validação

```powershell
npm run lint
npm test
npm run build
python -m http.server 5183 --bind 127.0.0.1
# Em outro terminal, com Playwright e Edge disponíveis:
node scripts/browser-test.mjs
```

O teste do navegador aceita `PLAYWRIGHT_MODULE` (caminho de uma instalação
existente), `BROWSER_CHANNEL` e `BASE_URL`. O endereço padrão é
`http://127.0.0.1:5183/docs/`.

Validados: carregamento da produção em subdiretório, título, ausência de controles
de recolhimento, todas as categorias reais, combinação de filtros, recorte vazio,
Aplicar/Limpar, oito indicadores, totais financeiros, gráficos, tabela e conteúdo
do XLSX filtrado. AEP foi validado com fixtures isoladas no navegador, sem modificar
o CSV. Resoluções: 320, 390, 768, 1024 e 1440 px, sem cortes nos controles,
rolagem horizontal da página ou erros de console. Capturas em `tmp/filtros-*.png`.

Lint, smoke test, teste do navegador e build passaram na branch baseada em origin/main.

### Publicação e escopo

O build gera `dist/` e sincroniza `docs/` e `index.html` pelo script existente,
preservando os caminhos relativos e a configuração do GitHub Pages. Artefatos
regenerados estão preparados para revisão; nenhuma publicação foi executada.

Arquivos desta revisão: `src/App.jsx`, `src/data/projectCsv.js`,
`src/styles/dashboard.css`, `src/styles/layout-preview.css`, `scripts/smoke-test.mjs`, `scripts/browser-test.mjs`,
este README e os artefatos gerados em `docs/` e `index.html`.
A branch de envio parte de origin/main e preserva os componentes, estilos e a base ja presentes no GitHub.
