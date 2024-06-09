import signale from 'signale'

export default new signale.Signale({
  scope: 'Doer',
  types: {
    note: {
      badge: '👣',
      color: 'cyan',
      logLevel: 'info',
    },
    success: {
      badge: '✅',
      color: 'green',
    },
    error: {
      badge: '❌',
      color: 'red',
      logLevel: 'error',
    },
  },
})
