import {createInstance} from 'freshdom-utils'

import XMLNamespace from './types/xml-namespaces'
import SVGNodes from './types/svg-nodes'
import HTMLNodes from './types/html-nodes'
import {isElement} from './types/is-html'

const returnSelf = res => res

const NodeTypes = {
  Element: node => {
    if (isElement(node)) {
      return () => node
    }
  },

  Func: node => {
    if (typeof node === 'function') {
      return props => createInstance(node, props)
    }
  },

  Array: node => {
    if (Array.isArray(node)) {
      return () => {
        const container = document.createDocumentFragment()
        container.append(...node)
        return container
      }
    }
  },

  Text: node => {
    if (typeof node === 'string' || typeof node === 'number') {
      if (SVGNodes.includes(node)) {
        return () => document.createElementNS(XMLNamespace.SVG, node)
      }

      if (HTMLNodes.includes(node)) {
        return () => document.createElement(node)
      }

      return () => document.createTextNode(node)
    }
  }
}

const parseType = type => {
  let result = false
  Object.values(NodeTypes).forEach(checkType => {
    if (result === false) {
      result = checkType(type) || false
    }
  })
  return result || returnSelf
}

export default (parse = (type, props = {}) => {
  const node = parseType(type)(props)

  if (!isElement(node)) {
    return parse(node, props)
  }

  return node
})
