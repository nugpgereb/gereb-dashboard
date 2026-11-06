import { readFile } from 'node:fs/promises'

const csvSource = await readFile(new URL('../projetos_fiotec_dashboard.csv', import.meta.url), 'utf8')
const parserSource = await readFile(new URL('../src/data/projectCsv.js', import.meta.url), 'utf8')
const moduleSource = parserSource.replace(/^import csvSource[^\n]*\n/, `const csvSource = ${JSON.stringify(csvSource)};\n`)
const { csvProjects: projects } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`)

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const cssSource = await readFile(new URL('../src/styles/dashboard.css', import.meta.url), 'utf8')
const normalizedInstrumentTypes = new Set(
  projects.map((project) =>
    project.instrumentType === 'EMENDAS' ? 'EMENDA PARLAMENTAR' : project.instrumentType,
  ),
)

assert(projects.length === 179, 'A base atualizada em 05/11/2026 deve conter exatamente 179 projetos.')
assert(new Set(projects.map(project => project.id)).size === projects.length, 'Os identificadores devem ser unicos.')
for (const [field, expected] of Object.entries({ total: 1471582314.16, released: 787107605.35, receivable: 730285129.27, realized: 601644961.48, committed: 57232272.36, currentBalance: 128230371.51 })) {
  const actual = projects.reduce((sum, project) => sum + Math.round(project[field] * 100), 0)
  assert(actual === Math.round(expected * 100), `O total de ${field} deve corresponder a planilha.`)
}
assert(projects.every(project => /^\d{4}-\d{2}-\d{2}$/.test(project.start) && /^\d{4}-\d{2}-\d{2}$/.test(project.end)), 'As vigencias devem estar no formato ISO.')
assert(appSource.includes('Dados atualizados em 05/11/2026'), 'O painel deve indicar a data de atualizacao.')
assert(appSource.includes('const storageKey = "gereb-projects-editable-2026-11-05"'), 'O navegador deve carregar a nova base sem reutilizar os dados antigos.')
const newProject = projects.find(project => project.id === 'GEREB-101-AEP-26')
assert(newProject?.released === 75000 && newProject?.receivable === 175000, 'O novo AEP deve preservar os recursos enviados.')
assert(!projects.some(project => project.id === 'GEREB-008-FIO-20'), 'Projetos ausentes da nova base nao devem permanecer no painel.')
assert(projects.find(project => project.id === 'GEREB-047-FIO-26')?.axis === 'Geração de Informação em Saúde', 'O eixo com quebra de linha na origem deve ser importado por inteiro.')
assert(normalizedInstrumentTypes.has('EMENDA PARLAMENTAR'), 'EMENDAS deve entrar em EMENDA PARLAMENTAR.')
assert(appSource.includes('normalizeInstrumentType(project.instrumentType) === filters.modality'), 'Filtro de instrumento deve usar o valor normalizado.')
assert(!appSource.includes('realizedProjectRanking'), 'Ranking de realizado nao deve ser fixo.')
assert(appSource.includes('ResourceDistribution'), 'O painel deve renderizar a distribuicao de recursos.')
assert(appSource.includes('filter-shell'), 'Os filtros compactos devem estar presentes.')
assert(appSource.includes('Consulta de TEDs'), 'A consulta inferior deve filtrar por TEDs.')
assert(appSource.includes('filters.ted'), 'A consulta por TED deve usar um filtro proprio.')
assert(appSource.includes('filters.tedCategory'), 'A consulta por TED deve filtrar por categoria de TED.')
assert(appSource.includes('filters.tedYear'), 'A consulta por TED deve filtrar por ano do TED.')
assert(appSource.includes('filters.tedFunder'), 'A consulta por TED deve filtrar por orgao concedente.')
assert(cssSource.includes('project-card-list'), 'A visualizacao mobile em cards deve estar estilizada.')

console.log('Smoke test passed.')
