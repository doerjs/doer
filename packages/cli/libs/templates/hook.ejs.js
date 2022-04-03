module.exports = `
import { useRef, useCallback, useEffect, useMemo } from 'react'

import { getLayoutName } from './helper'

export function useGlobalEvent(eventName, eventHandler, options) {
  const handler = useRef(eventHandler)

  useEffect(() => {
    function callback(event) {
      if (typeof handler.current === 'function') {
        handler.current(event)
      }
    }

    if (eventName) {
      window.addEventListener(eventName, callback, options)
    }

    return () => {
      if (eventName) {
        window.removeEventListener(eventName, callback, options)
      }
    }
  }, [eventName, options])
}

export function useLayoutName() {
  return useMemo(() => {
    return getLayoutName()
  }, [window.location.hash])
}
`
