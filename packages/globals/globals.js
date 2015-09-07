// A place to define global variables and global settings that can apply to multiple applications
// Global config settings go here. App specific config settings should go in model\02-config.js

Config = {};

Constants = {};

Schema = {};

Config.accessFlags = {
  public: 1, // 0001
  user: 2, // 0010
  admin: 4,  // 0100
  systemAdmin: 8 //1000
};

Config.accessLevels = {
  public: Config.accessFlags.public | Config.accessFlags.user | Config.accessFlags.admin | Config.accessFlags.systemAdmin,
  anonymous: Config.accessFlags.public,
  user: Config.accessFlags.user | Config.accessFlags.admin | Config.accessFlags.systemAdmin,
  admin: Config.accessFlags.admin | Config.accessFlags.systemAdmin,
  systemAdmin: Config.accessFlags.systemAdmin
};
