const paths = require('./Paths')
const env = require('./Env')
const config = require('./Config')
const plugin = require('./Plugin')

env.parse()
config.parse()

module.exports = { paths, env, config, plugin }
