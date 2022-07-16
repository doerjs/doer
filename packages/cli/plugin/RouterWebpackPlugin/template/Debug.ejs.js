module.exports = `
import React, { useCallback, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { noop, isEnableEditDebug } from './helper'

import styles from './Debug.module.css'

function createContainerElement() {
  const containerElement = document.createElement('div')
  document.body.appendChild(containerElement)
  return containerElement
}

function Portal({ visible, children }) {
  const [containerElement, setContainerElement] = useState(null)

  useEffect(() => {
    if (visible && !containerElement) {
      const element = createContainerElement()
      setContainerElement(element)
    } else if (!visible && containerElement) {
      containerElement.remove()
      setContainerElement(null)
    }
  }, [visible, containerElement])

  return containerElement ? createPortal(children, containerElement) : null
}

function Container({ children }) {
  return (
    <div className={styles.modal}>
      <div className={styles.mask}></div>
      <div className={styles.container}>
        <div className={styles.wrap}>{children}</div>
      </div>
    </div>
  )
}

function getRemotes() {
  try {
    const localUrls = window.sessionStorage.getItem('<%= appName %>__doer_remotes__')
    if (localUrls) {
      return JSON.parse(localUrls)
    }
  } catch (e) {}

  return window.__doer_remotes__
}

function DebugContent({ onClose = noop }) {
  const remotes = useRef(getRemotes())

  const handleChange = useCallback(({ target: { value } }, name) => {
    remotes.current[name] = value
  }, [])

  const handleReset = useCallback(() => {
    window.sessionStorage.removeItem('<%= appName %>__doer_remotes__')
    onClose()
    window.location.reload()
  }, [])

  const handleConfirm = useCallback(() => {
    window.sessionStorage.setItem('<%= appName %>__doer_remotes__', JSON.stringify(remotes.current))
    onClose()
    window.location.reload()
  }, [onClose])

  return (
    <Container>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>调试地址{isEnableEditDebug() ? '(未生效)' : ''}</span>
          <button className={styles.button} onClick={onClose}>关闭</button>
        </div>
        <div className={styles.remotes}>
          <div></div>
          {Object.keys(remotes.current).map(name => {
            return (
              <div className={styles.remote} key={name}>
                <div className={styles.label}>{name}:</div>
                <input className={styles.value} defaultValue={remotes.current[name]} onChange={(event) => handleChange(event, name)} />
                <div className={styles.tip}>{window.__doer_remotes__[name]}(默认值)</div>
              </div>
            )
          })}
        </div>
        <div className={styles.footer}>
          <div className={styles.toolbar}>
            debug模式：debug='true'(生效) debug=''(未生效)
          </div>
          <div className={styles.actions}>
            <button className={styles.button} onClick={handleReset}>重置</button>
            <button className={styles.button} onClick={handleConfirm}>确认</button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default function Debug() {
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
  }, [])

  const handleClose = useCallback(() => {
    hide()
  }, [])

  const handleTriggerClick = useCallback(() => {
    visible ? hide() : show()
  }, [visible])

  return (
    <div className={styles.debug}>
      <button className={styles.trigger} onClick={handleTriggerClick}>调试模式{isEnableEditDebug() ? '(未生效)' : ''}</button>
      <Portal visible={visible}>
        <DebugContent onClose={handleClose} />
      </Portal>
    </div>
  )
}
`
