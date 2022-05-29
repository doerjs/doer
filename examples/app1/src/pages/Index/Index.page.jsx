import React, { useEffect } from 'react'
import test, { test2 } from 'remote:app2/tool'

import styles from './Index.module.less'

const App2Demo = React.lazy(() => import('remote:app2/Demo'))

export default function Index() {
  useEffect(() => {
    test()
    test2()
  }, [])

  return (
    <div className={styles.index}>
      <p>App 1Home Page</p>
      <App2Demo />
    </div>
  )
}
