module.exports = `
import { useRef, useEffect } from 'react'
import { createHashHistory } from 'history'

import { getLayoutName } from './Layout'

import { isFunction } from './helper'

const history = createHashHistory()
history.getLayout = getLayoutName()
export function useHistoryChange(handler) {
  const listener = useRef(handler)
  listener.current = handler

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

window.doer.history = history

export default history
`
