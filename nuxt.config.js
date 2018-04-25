const config = require('config')
const fr = require('./i18n/fr')
const en = require('./i18n/en')

module.exports = {
  dev: process.env.NODE_ENV === 'development',
  srcDir: 'public/',
  build: {
    publicPath: config.publicUrl + '/_nuxt/',
    extractCSS: true
  },
  loading: { color: '#1e88e5' }, // Customize the progress bar color
  plugins: [
    {src: '~plugins/vuetify'},
    {src: '~plugins/moment'}
  ],
  router: {
    base: ('/' + config.publicUrl.split('//')[1].split('/').slice(1).join('/')).replace('//', '/')
  },
  modules: ['@nuxtjs/markdownit', '@nuxtjs/axios', ['nuxt-i18n', {
    locales: [
      { code: 'fr' },
      { code: 'en' }
    ],
    defaultLocale: config.defaultLocale,
    vueI18n: {
      fallbackLocale: config.defaultLocale,
      messages: {fr, en}
    }
  }]],
  axios: {
    browserBaseURL: config.publicUrl + '/',
    baseURL: `http://localhost:${config.port}/`
  },
  env: {
    publicUrl: config.publicUrl,
    brand: config.brand
  },
  head: {
    title: config.brand.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'application', name: 'application-name', content: config.brand.title },
      { hid: 'description', name: 'description', content: config.brand.description }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito:300,400,500,700,400italic|Material+Icons' }
    ]
  }
}