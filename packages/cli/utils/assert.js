import compareVersion from 'compare-versions'
import helper from './helper.js'
import print from './print.js'

const MIN_NODE_VERSION = '14.18.2'

function assertNodeVersion() {
  const nodeVersion = helper.getNodeVersion()

  const isUnValidNodeVersion = compareVersion(nodeVersion, MIN_NODE_VERSION) < 0
  if (isUnValidNodeVersion) {
    print.printUnValidNodeVersion(MIN_NODE_VERSION)
    process.exit()
  }
}

export default {
  assertNodeVersion,
}
