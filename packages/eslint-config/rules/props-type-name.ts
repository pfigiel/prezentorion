import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'
import type { Rule } from './rule'

type MessageIds = 'prefixed'

const PREFIXED_PROPS = /^(.+)Props$/

/** The statement itself, or what an `export` wraps. */
function declarationOf(statement: TSESTree.ProgramStatement): TSESTree.Node | null {
  if (statement.type === AST_NODE_TYPES.ExportNamedDeclaration) return statement.declaration
  return statement
}

function declaredNames(program: TSESTree.Program): Set<string> {
  const names = new Set<string>()

  for (const statement of program.body) {
    const node = declarationOf(statement)
    if (!node) continue

    if (node.type === AST_NODE_TYPES.VariableDeclaration) {
      for (const declarator of node.declarations) {
        if (declarator.id.type === AST_NODE_TYPES.Identifier) names.add(declarator.id.name)
      }
      continue
    }
    if ('id' in node && node.id?.type === AST_NODE_TYPES.Identifier) names.add(node.id.name)
  }

  return names
}

const rule: Rule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Require a component's props type to be named Props",
    },
    schema: [],
    messages: {
      prefixed: 'Name this `Props`. The file already says it belongs to `{{component}}`.',
    },
  },
  create(context) {
    const program = context.sourceCode.ast
    const propsTypes = program.body
      .map(declarationOf)
      .filter(
        (node): node is TSESTree.TSTypeAliasDeclaration | TSESTree.TSInterfaceDeclaration =>
          (node?.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
            node?.type === AST_NODE_TYPES.TSInterfaceDeclaration) &&
          node.id.name.endsWith('Props'),
      )

    if (propsTypes.length !== 1) return {}

    const [propsType] = propsTypes
    if (!propsType) return {}

    const prefix = PREFIXED_PROPS.exec(propsType.id.name)?.[1]
    if (!prefix) return {}
    if (!declaredNames(program).has(prefix)) return {}

    return {
      Program() {
        context.report({
          node: propsType.id,
          messageId: 'prefixed',
          data: { component: prefix },
        })
      },
    }
  },
}

export default rule
