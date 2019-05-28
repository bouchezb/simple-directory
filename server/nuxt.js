const nuxtBuildCache = require('@koumoul/nuxt-build-cache')

const nuxtConfig = require('../nuxt.config.js')
const version = process.env.VERSION || require('../package.json').version

module.exports = async () => {
  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    // in dev mode the nuxt dev server is already running, we re-expose it
    return require('http-proxy-middleware')({ target: 'http://localhost:3000' })
  } else {
    // Prepare nuxt for rendering and serving UI
    const nuxt = await nuxtBuildCache.prepare('simple-directory', version, nuxtConfig)
    return async (req, res, next) => {
      // re-apply the prefix that was removed by our reverse proxy in prod configs
      req.url = (nuxtConfig.router.base + req.url).replace('//', '/')
      nuxt.render(req, res)
    }
  }
}
