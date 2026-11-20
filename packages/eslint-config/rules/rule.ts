import type { LanguageOptions, RuleDefinition, RuleVisitor, TextSourceCode } from '@eslint/core'
import type { TSESTree } from '@typescript-eslint/utils'

/** `getText` is the JavaScript language's, not language-agnostic `SourceCode`'s. */
type RuleSourceCode = TextSourceCode<{
  LangOptions: LanguageOptions
  RootNode: TSESTree.Program
  SyntaxElementWithLoc: TSESTree.Node
  ConfigNode: unknown
}> & { getText(node?: TSESTree.Node): string }

/**
 * ESLint leaves parsed nodes as `unknown`; TSESTree here buys the TS-only syntax
 * without typescript-eslint's `RuleModule`, which ESLint's `Plugin` rejects.
 */
export type Rule<MessageIds extends string> = RuleDefinition<{
  LangOptions: LanguageOptions
  Code: RuleSourceCode
  RuleOptions: []
  Visitor: RuleVisitor
  Node: TSESTree.Node
  MessageIds: MessageIds
  ExtRuleDocs: Record<string, unknown>
}>
