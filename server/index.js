const config = require('config')
const app = require('./app')

app.run().then(() => {
  console.log('Listening on http://localhost:%s', config.port)
}, err => {
  console.error(err)
  process.exit(-1)
})

process.on('SIGTERM', function onSigterm () {
  console.info('Received SIGTERM signal, shutdown gracefully...')
  app.stop().then(() => {
    console.log('shutting down now')
    process.exit()
  }, err => {
    console.error(err)
    process.exit(-1)
  })
})
