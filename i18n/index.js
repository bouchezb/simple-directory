const config = require('config')
const flatten = require('flat')
const unflatten = flatten.unflatten
const flatOpts = {delimiter: '_'}

exports.locales = config.i18n.locales.map(l => ({code: l}))

// Build a map of messages of this form
// {fr: {msg1: 'libellé 1'}, en: {msg1: 'label 1'}}
const messages = {}
config.i18n.locales.forEach(l => {
  messages[l] = require('./' + l)
})

const flatMessages = flatten(messages, flatOpts)

// Manage overriding by environment variables of this form
// 'I18N_en_msg1="another label"'
Object.keys(process.env).forEach(k => {
  if (k.startsWith('I18N_')) {
    flatMessages[k.replace('I18N_', '')] = process.env[k]
  }
})

exports.messages = unflatten(flatMessages, flatOpts)

// A subset of messages for UI separated for performance.
exports.publicMessages = unflatten(
  Object.keys(flatMessages)
    .filter(k => ['common', 'pages', 'doc'].includes(k.split('_')[1]))
    .reduce((a, k) => { a[k] = flatMessages[k]; return a }, {})
  , flatOpts)

exports.middleware = (req, res, next) => {
  const locale = req.get('Accept-Language') || config.i18n.defaultLocale
  req.messages = exports.messages[locale]
  next()
}
