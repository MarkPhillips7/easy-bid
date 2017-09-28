import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'roles'
})
@View({
  templateUrl: () => 'client/users/views/roles.html'
})
@Inject('$state', '$stateParams', 'bootstrap.dialog', 'toastr')
@MeteorReactive
@LocalInjectables
class roles {
  constructor($state, $stateParams, bootstrapDialog, toastr) {
    this.bootstrapDialog = bootstrapDialog;
    this.companiesSelected = [];
    this.companyIdParam = this.$stateParams.c;
    this.rolesAvailable = RolesHelper.getRoleObjects();
    this.rolesCanAssign = [];
    this.roleIdsActive = [];
    this.toastr = toastr;
    this.userId = this.$stateParams.u;
    this.usersSelected = [];

    this.helpers({
      companies: this._companiesCollection,
      companiesForSelect: this._companiesForSelect,
      company: this._company,
      // roleIdsActive: this._roleIdsActive,
      user: this._user,
      users: this._users,
      isLoggedIn: this._isLoggedIn,
      updateDependencies: this._updateDependencies,
    });

    this.subscribe('companies', this._companiesSubscription.bind(this));
    this.subscribe('company', this._companySubscription.bind(this));
    this.userSubscriptionHandle = this.subscribe('user', this._userSubscription.bind(this));
  }

  _companiesCollection() {
    return Companies.find({}, {
        sort: {
          'nameLower': 1,
        }
      }
    );
  }

  _companiesSubscription() {
    return [
      {
        sort: {
          'nameLower': 1,
        }
      },
      ''
    ]
  }

  _companiesForSelect() {
    const companies = this.getReactively('companies', true);
    if (Roles.userIsInRole(Meteor.userId(), [Config.roles.systemAdmin], Roles.GLOBAL_GROUP)) {
      return [
        {name: '[ GLOBAL - ALL COMPANIES! ]', _id: Roles.GLOBAL_GROUP},
        ...companies
      ];
    }
    return companies;
  }

  _company() {
    return Companies.findOne({ _id: this.getReactively('companiesSelected[0]._id') });
  }

  _companySubscription() {
    return [
      this.getReactively('companiesSelected[0]._id')
    ];
  }

  _userSubscription() {
    return [this.userId];
  }

  _currentUserId() {
    return Meteor.userId();
  }

  isDirty() {
    return !_.isEqual(this.user, this.savedUser);
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }
  //
  // _roleIdsActive() {
  //   return Meteor.call('getRoleIdsForUserAndCompany', this.userId, this.getReactively('companiesSelected[0]._id'),
  //     function(err, result) {
  //     if (err) {
  //       console.log('failed to getRoleIdsForUserAndCompany', err);
  //       return [];
  //     } else {
  //       return result;
  //     }
  //   });
  // }

  _user() {
    // console.log(`about to get user ${this.userId}`);
    return Meteor.users.findOne({ _id: this.userId });
    // const user = Meteor.users.findOne({ _id: this.$stateParams.userId });
    // if (user) {
    //   const userAddress = user.profile.address || {};
    //   return {
    //     emailAddress: user.emails && user.emails.length && user.emails[0].address,
    //     firstName: user.profile.firstName,
    //     lastName: user.profile.lastName,
    //     address: {
    //       addressLines: userAddress.addressLines,
    //       city: userAddress.city,
    //       state: userAddress.state,
    //       zipCode: userAddress.zipCode
    //     },
    //     phoneNumber: user.profile.phoneNumber,
    //     notes: user.profile.notes
    //   };
    // }
  }

  _users() {
    const user = this.getReactively('user');
    return user ? [{
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      ticked: true
    }] : [];
  }

  getRoleListItemClass(role) {
    return _.any(this.roleIdsActive, (roleId) => roleId === role.id)
    ? `list-group-item clearfix list-group-item-success`
    : `list-group-item clearfix`;
  }

  getRoleButtonClass(role) {
    return _.any(this.roleIdsActive, (roleId) => roleId === role.id) ? `btn btn-danger` : `btn btn-primary`;
  }

  getRoleButtonText(role) {
    return _.any(this.roleIdsActive, (roleId) => roleId === role.id) ? `Remove` : `Add`;
  }

  getRoleIconClass(role) {
    return _.any(this.roleIdsActive, (roleId) => roleId === role.id)
    ? `fa fa-check eb-role-icon`
    : `fa fa-ban eb-bold-danger eb-role-icon`;
  }

  getRoleButtonDisabled(role) {
    return !_.any(this.rolesCanAssign, (_role) => _role.id === role.id);
  }

  cancelSave() {
    this.$state.go('user', {c: this.companyIdParam, u: this.userId});
  }

  addRole(role) {
    Meteor.call('addUserRole', this.userId, role.id, this.companyIdParam,
      (error, response) => {
        if (error){
          this.toastr.error(error.reason, "Error");
        } else {
          this.toastr.success("Role successfully added");
          this.getRoleIdsForUserAndCompany(this.companyIdParam);
        }
      }
    );
  }

  confirmAddRole(role) {
    const addRole = () => this.addRole(role);
    this.bootstrapDialog.confirmationDialog("Add Role",
      `Are you sure you want to add ${role.name} role to ${this.user.profile.firstName} ${this.user.profile.lastName} in relation to ${this.company.name}?`)
      .then(addRole);
  }

  removeRole(role) {
    Meteor.call('removeUserRole', this.userId, role.id, this.companyIdParam,
      (error, response) => {
        if (error){
          this.toastr.error(error.reason, "Error");
        } else {
          this.toastr.success("Role successfully removed");
          this.getRoleIdsForUserAndCompany(this.companyIdParam);
        }
      }
    );
  }

  confirmRemoveRole(role) {
    const removeRole = () => this.removeRole(role);
    this.bootstrapDialog.confirmationDialog("Remove Role",
      `Are you sure you want to remove ${role.name} role from ${this.user.profile.firstName} ${this.user.profile.lastName} in relation to ${this.company.name}?`)
      .then(removeRole);
  }

  toggleRoleClick(role) {
    if (_.any(this.roleIdsActive, (roleId) => roleId === role.id)) {
      this.confirmRemoveRole(role);
    } else {
      this.confirmAddRole(role);
    }
  }

  getRolesLoggedInUserCanAssign(companyId) {
    Meteor.call('getRolesLoggedInUserCanAssign', companyId, (err, result) => {
      if (err) {
        console.log('failed to getRolesLoggedInUserCanAssign', err);
      } else {
        // console.log('success getting getRolesLoggedInUserCanAssign', result);
        this.rolesCanAssign = result;
      }
    });
  }

  getRoleIdsForUserAndCompany(companyId) {
    Meteor.call('getRoleIdsForUserAndCompany', this.userId, companyId,
      (err, result) => {
        if (err) {
          console.log('failed to getRoleIdsForUserAndCompany', err);
          this.roleIdsActive = [];
        } else {
          this.roleIdsActive = result;
        }
      }
    );
  }

  getCompanyDependencies(companyId) {
    this.getRolesLoggedInUserCanAssign(companyId);
    this.getRoleIdsForUserAndCompany(companyId);
  }

  _updateDependencies() {
    const companies = this.getReactively('companiesForSelect', true);
    const companiesSelectedLength = this.getReactively('companiesSelected.length');
    const companySelectedId = this.getReactively('companiesSelected[0]._id');
    if (companies &&
        companiesSelectedLength === 0) {
      if (companies.length === 1) {
        // cause the company to be selected
        // console.log('hello');
        companies[0].ticked = true;
        this.getCompanyDependencies(companies[0]._id);
        // console.log('goodbye');
      } else if (companies.length > 0 && this.companyIdParam) {
        const company = _.find(companies, (_company) => _company._id === this.companyIdParam);
        if (company) {
          // cause the company to be selected
          // console.log('hello again');
          company.ticked = true;
          this.getCompanyDependencies(company._id);
          // console.log('goodbye again');
        }
      }
    } else if (companies &&
        companiesSelectedLength === 1 &&
        this.companyIdParam !== companySelectedId) {
      // console.log('hello yet again');
      this.$state.go('roles', {c: companySelectedId, u: this.userId});
      // this.getCompanyDependencies(companySelectedId);
      // console.log('goodbye yet again');
    }
  }
}
