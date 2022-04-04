module.exports = `
import { useRef, useEffect } from 'react'
import { createHashHistory } from 'history'
export * from 'react-router-dom'

import { isFunction } from './helper'

const history = createHashHistory()

export function useHistoryChange(handler) {
  const listener = useRef(handler)

  useEffect(() => {
    function callback(params) {
      if (isFunction(listener.current)) {
        listener.current(params)
      }
    }

    const unListen = history.listen(callback)

    return () => {
      unListen()
    }
  }, [])
}

export default history
`
