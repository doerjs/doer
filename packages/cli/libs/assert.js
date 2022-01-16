import semver from 'semver'
import helper from './helper.js'
import print from './print.js'

const MIN_NODE_VERSION = '14.18.2'

function assertNodeVersion() {
  const nodeVersion = helper.getNodeVersion()

  const isUnValidNodeVersion = semver.lt(nodeVersion, MIN_NODE_VERSION)
  if (isUnValidNodeVersion) {
    print.printUnValidNodeVersion(MIN_NODE_VERSION)
    process.exit()
  }
}

export default {
  assertNodeVersion,
}
