import type { TSESTree } from '@typescript-eslint/utils'
import type { Rule } from './rule'

type MessageIds = 'repeated'

type SourcedNode =
  TSESTree.ImportDeclaration | TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration

/** Extensions stay on: `./Alert.module.css` is not the `Alert/` folder. */
function repeatedSegment(specifier: string): string | null {
  const segments = specifier.split('/')
  if (segments.length < 2) return null

  const last = segments[segments.length - 1]
  const parent = segments[segments.length - 2]
  if (last !== parent) return null
  if (parent === '.' || parent === '..') return null

  return last ?? null
}

const rule: Rule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a folder to be imported through its barrel rather than by naming it twice',
    },
    schema: [],
    messages: {
      repeated:
        "'{{segment}}' names the folder and the file. Import '{{folder}}' through its barrel.",
    },
  },
  create(context) {
    function check(node: SourcedNode): void {
      if (!node.source) return

      const specifier = node.source.value
      if (typeof specifier !== 'string' || !specifier.startsWith('.')) return

      const segment = repeatedSegment(specifier)
      if (segment === null) return

      context.report({
        node: node.source,
        messageId: 'repeated',
        data: { segment, folder: specifier.slice(0, -(segment.length + 1)) },
      })
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    }
  },
}

export default rule
