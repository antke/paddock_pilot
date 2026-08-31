import { readdirSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = resolve(process.cwd(), 'src')

const rawControlOwners = new Set([
  'components/dashboard/DashboardInlinePanel.tsx',
  'components/forms/FileUploadField.tsx',
  'components/forms/FormLayout.tsx',
  'components/horses/HorseCard.tsx',
  'components/onboarding/OnboardingStepper.tsx',
  'components/timeline/ActivityTimeline.tsx',
])

const lowLevelImportOwners = new Map([
  [
    "from '#/components/ui/card'",
    new Set(['components/dashboard/DashboardSectionCard.tsx']),
  ],
  ["from '#/components/ui/label'", new Set(['components/ui/field.tsx'])],
  [
    "from '#/components/ui/separator'",
    new Set([
      'components/dashboard/DashboardSectionCard.tsx',
      'components/ui/field.tsx',
      'components/ui/item.tsx',
    ]),
  ],
])

function getSourceFiles(directory: string): Array<string> {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)

    if (entry.isDirectory()) return getSourceFiles(path)
    return entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')
      ? [path]
      : []
  })
}

function sourcePath(file: string) {
  return relative(sourceRoot, file)
}

describe('design-system conformance', () => {
  const files = getSourceFiles(sourceRoot)

  it('keeps raw form controls inside canonical or specialized owners', () => {
    const violations = files.flatMap((file) => {
      const path = sourcePath(file)
      if (path.startsWith('components/ui/') || rawControlOwners.has(path)) {
        return []
      }

      const source = readFileSync(file, 'utf8')
      const matches = source.match(
        /<(button|input|select|textarea|label|table|dialog)\b/g,
      )

      return matches?.map((match) => `${path}: ${match}`) ?? []
    })

    expect(violations).toEqual([])
  })

  it('keeps low-level surface primitives behind their canonical owners', () => {
    const violations = files.flatMap((file) => {
      const path = sourcePath(file)
      const source = readFileSync(file, 'utf8')

      return [...lowLevelImportOwners.entries()].flatMap(
        ([importPath, owners]) =>
          source.includes(importPath) && !owners.has(path)
            ? [`${path}: ${importPath}`]
            : [],
      )
    })

    expect(violations).toEqual([])
  })
})
