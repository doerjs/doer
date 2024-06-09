import * as is from '@doerjs/utils/is.js'

function parseSpecifier(node) {
  return node.exported.name
}

function parseFunctionDeclaration(node) {
  return node.id && node.id.name
}

function parseVariableDeclaration(node) {
  if (is.isArray(node.declarations)) {
    return (node.declarations[0] || {}).id.name
  }
}

function parseExportNamedDeclaration(node) {
  if (node.specifiers.length) {
    return node.specifiers.reduce((result, item) => {
      const name = parseSpecifier(item)
      name && result.push(name)
      return result
    }, [])
  }

  if (!node.declaration) {
    return []
  }

  if (node.declaration.type === 'FunctionDeclaration') {
    return parseFunctionDeclaration(node.declaration)
  }

  if (node.declaration.type === 'VariableDeclaration') {
    return parseVariableDeclaration(node.declaration)
  }
}

// 解析导出的变量情况
// 仅解析导出名称，不解析导出内容
// TODO 后续可以优化检测导出的是否符合要求
export function parseExports(astTree) {
  const nodes = astTree.program.body

  const exportNames = nodes
    .reduce((result, node) => {
      switch (node.type) {
        case 'ExportNamedDeclaration':
          return result.concat(parseExportNamedDeclaration(node))
        case 'ExportDefaultDeclaration':
          result.push('default')
          break
      }

      return result
    }, [])
    .filter(Boolean)

  return exportNames.reduce((result, name) => {
    result[name] = true
    return result
  }, {})
}
