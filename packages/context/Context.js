import Path from './Path.js'
import Env from './Env.js'
import Config from './Config.js'

class Context {
  static instance = null

  static create() {
    if (!Context.instance) {
      Context.instance = new Context()
    }

    return Context.instance
  }

  constructor() {
    // 路径相关
    this.path = Path.create()
    // 环境相关
    this.env = Env.create(this.path)
    // 配置相关
    this.config = Config.create(this.path)
  }

  async parse() {
    await this.path.parse()
    await this.env.parse()
    await this.config.parse()
  }
}

export default Context
