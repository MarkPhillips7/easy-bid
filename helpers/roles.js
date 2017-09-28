export const getRoleObject = (roleId) => {
  let name;
  switch (roleId) {
    case Config.roles.systemAdmin:
      name = 'System Admin';
      break;
    case Config.roles.manageTemplates:
      name = 'Manage Templates';
      break;
    case Config.roles.manageUsers:
      name = 'Manage Users';
      break;
    case Config.roles.user:
      name = 'User';
      break;
    case Config.roles.customer:
      name = 'Customer';
      break;
    case Config.roles.guest:
      name = 'Guest';
      break;
    default:
      name = '[Invalid]';
      break;
  }
  return {
    id: roleId,
    name,
  };
};

export const getRoleObjects = () => {
  return _.map(_.values(Config.roles), (roleId) => getRoleObject(roleId));
};

RolesHelper = {
  getRoleObject,
  getRoleObjects,
};
