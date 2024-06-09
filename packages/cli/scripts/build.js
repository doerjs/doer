import Doer from '../lib/Doer.js'

export default function () {
  process.env.NODE_ENV = 'production'
  if (!process.env.ENV) {
    process.env.ENV = 'prod'
  }

  const doer = new Doer()
  doer.build()
}
