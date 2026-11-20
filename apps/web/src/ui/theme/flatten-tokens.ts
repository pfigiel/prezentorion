type TokenTree<Leaf extends string> = {
  readonly [segment: string]: Leaf | TokenTree<Leaf>
}

const isBranch = <Leaf extends string>(node: Leaf | TokenTree<Leaf>): node is TokenTree<Leaf> =>
  typeof node === 'object'

export const flattenTokens = <Leaf extends string>(
  tree: TokenTree<Leaf>,
  path: readonly string[] = [],
): Record<string, Leaf> =>
  Object.fromEntries(
    Object.entries(tree).flatMap(([segment, node]) =>
      isBranch(node)
        ? Object.entries(flattenTokens(node, [...path, segment]))
        : [[[...path, segment].join('-'), node]],
    ),
  )
