module.exports = {
  port: 8080,
  publicUrl: 'http://localhost:8080',
  kid: 'simple-directory',
  secret: {
    public: './security/simple-directory.key.pub',
    private: './security/simple-directory.key'
  },
  jwtDurations: {
    initialToken: '15m',
    exhangedToken: '30d',
    invitationToken: '10d'
  },
  admins: ['admin@test.com'],
  contact: 'contact@test.com',
  storage: {
    // One of 'file' and 'mongo'
    type: 'mongo',
    file: {
      users: './data/users.json',
      organizations: './data/organizations.json'
    },
    mongo: {
      url: 'mongodb://mongo:27017/simple-directory-' + (process.env.NODE_ENV || 'development')
    }
  },
  info: {
    termsOfService: 'https://koumoul.com/term-of-service',
    contact: {
      name: 'Koumoul',
      url: 'https://koumoul.com',
      email: 'support@koumoul.com'
    }
  },
  webhooks: {
    updateEntityNames: []
  },
  theme: {
    logo: null,
    dark: false,
    colors: {
      // standard vuetify colors
      primary: '#1E88E5', // blue.darken1
      secondary: '#42A5F5', // blue.lighten1,
      accent: '#FF9800', // orange.base
      error: 'FF5252', // red.accent2
      info: '#2196F3', // blue.base
      success: '#4CAF50', // green.base
      warning: '#E91E63' // pink.base
    },
    cssUrl: null,
    cssText: ''
  },
  defaultLocale: 'fr',
  mails: {
    from: 'no-reply@test.com',
    // transport is a full configuration object for createTransport of nodemailer
    // cf https://nodemailer.com/smtp/
    transport: {
      port: 1025,
      ignoreTLS: true,
      default: 'localhost'
    }
  },
  maildev: {
    active: false,
    smtp: 1025,
    web: 1080
  }
}
