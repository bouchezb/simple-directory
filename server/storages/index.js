const config = require('config')
const shortid = require('shortid')
const userName = require('../utils/user-name')

exports.init = async () => {
  const factory = require('./' + config.storage.type)
  const storage = await factory.init(config.storage[config.storage.type])
  storage.readonly = factory.readonly

  // Create admins and their orga at startup
  if (!storage.readonly) {
    if (config.adminsOrg) {
      const adminsOrg = await storage.getOrganization(config.adminsOrg.id)
      if (!adminsOrg) {
        await storage.createOrganization(config.adminsOrg, { id: 'init', name: 'init' })
      }
    }
    for (let adminEmail of config.admins) {
      const admin = await storage.getUserByEmail(adminEmail)
      if (!admin) {
        const newAdmin = {
          email: adminEmail,
          id: shortid.generate(),
          maxCreatedOrgs: -1,
          organizations: []
        }
        newAdmin.name = userName(newAdmin)
        if (config.adminsOrg) {
          newAdmin.organizations.push({ ...config.adminsOrg, role: 'admin' })
        }
        await storage.createUser(newAdmin)
      }
    }
  }

  return storage
}

exports.readonly = () => require('./' + config.storage.type).readonly
