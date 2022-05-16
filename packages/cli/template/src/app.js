/**
 * 本文件用于注册全局回调勾子，如果你不需要这些勾子函数，可以删除本文件
 */

/**
 * 获取应用的远程地址
 * 可以通过静态注册写死各个应用的远程资源地址
 * 也可以通过服务端动态获取应用的远程资源地址
 * @return <Object> 应用的远程地址注册表
 */
export function remoteUrls() {
  return {}
}

/**
 * 路由切换时的回调函数
 * @return
 */
export function onRouteChange(params) {}

/**
 * 页面渲染前的回调函数，可以控制页面的渲染
 * 使用场景一：延迟渲染
 * function onRender(render) {
 *  setTimeout(() => {
 *    render()
 *  }, 500)
 * }
 *
 * 使用场景二: 包裹其他Provider，比如国际化的Provider
 * function onRender(render) {
 *  render((children) => {
 *    return (
 *      <LocaleProvider>
 *        {children}
 *      </LocaleProvider>
 *    )
 *  })
 * }
 * @return
 */
export function onRender(render) {
  // 注册渲染回调函数，在需要渲染时，一定要调用这个render
  // 否则页面无法渲染出来
  render()
}

export function bootstrap() {}

export function mount() {}

export function unmount() {}
