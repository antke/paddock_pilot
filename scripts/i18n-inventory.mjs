import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Candidate inventory, not proof of translation coverage: review data strings,
// grammar spanning JSX nodes, enums, and generated text separately.
const excluded =
  /(?:\.test\.[cm]?[jt]sx?$|routeTree\.gen|\/_generated\/|\/i18n\/|\/design\/|\/page-lab\/|\/dashboard-lab\/|\/landing-lab\/|(?:style|page|dashboard|landing)-lab\.)/
const ignoredAttributes =
  /^(?:className|class|id|key|name|value|type|to|href|src|srcSet|sizes|style|variant|size|width|height|role|data-.+|aria-(?:controls|describedby|labelledby|live|atomic|current|haspopup|expanded|hidden|pressed)|autoComplete|accept|target|rel|method|align|side|sideOffset)$/
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    if (excluded.test(file)) return []
    return entry.isDirectory()
      ? files(file)
      : /\.[jt]sx?$/.test(file)
        ? [file]
        : []
  })
}
const inventory = []
for (const file of ['src', 'shared', 'convex'].flatMap(files)) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const candidates = []
  function visit(node) {
    let text
    let kind
    if (ts.isJsxText(node)) {
      text = node.text.replace(/\s+/g, ' ').trim()
      kind = 'jsx'
    } else if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      const parent = node.parent
      if (
        ts.isImportDeclaration(parent) ||
        ts.isExportDeclaration(parent) ||
        ts.isLiteralTypeNode(parent)
      )
        return
      if (
        ts.isJsxAttribute(parent) &&
        ignoredAttributes.test(parent.name.getText(source))
      )
        return
      if (
        ts.isCallExpression(parent) &&
        /(?:^|\.)(t|useT|require|query|index|withIndex|literal|includes|startsWith|endsWith|getElementById|querySelector|querySelectorAll)$/.test(
          parent.expression.getText(source),
        )
      )
        return
      text = node.text
      kind = ts.isJsxAttribute(parent) ? 'attribute' : 'literal'
      if (!/^[A-Z][a-z]|\s[a-zA-Z]{2,}/.test(text)) return
      if (
        /^(?:#|\/|https?:|[a-z][\w-]*:)|(?:\b(?:flex|grid|rounded|border|text|bg|gap|items|justify|sm|md|lg)-)/.test(
          text,
        )
      )
        return
    } else if (ts.isTemplateExpression(node)) {
      const parts = [
        node.head.text,
        ...node.templateSpans.map((part) => part.literal.text),
      ]
      if (parts.some((part) => /[a-zA-Z]{2,}\s|\s[a-zA-Z]{2,}/.test(part))) {
        text = node.getText(source)
        kind = 'template'
      }
    }
    if (text && /[A-Za-z]/.test(text)) {
      const { line } = source.getLineAndCharacterOfPosition(
        node.getStart(source),
      )
      candidates.push({ line: line + 1, kind, text })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (candidates.length) inventory.push({ file, candidates })
}
const output = process.argv[2]
if (output) fs.writeFileSync(output, JSON.stringify(inventory, null, 2) + '\n')
console.log(
  `${inventory.reduce((sum, item) => sum + item.candidates.length, 0)} text candidates in ${inventory.length} files. Manual classification required.`,
)
