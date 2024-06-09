import Doer from '../lib/Doer.js'

export default function () {
  process.env.NODE_ENV = 'development'
  if (!process.env.ENV) {
    process.env.ENV = 'dev'
  }

  const doer = new Doer()
  doer.dev()
}
