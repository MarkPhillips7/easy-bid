import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'user'
})
@View({
  templateUrl: () => 'client/users/views/user.html'
})
@Inject('$state', '$stateParams', 'toastr')
@MeteorReactive
@LocalInjectables
class user {
  constructor($state, $stateParams, toastr) {
    this.companyId = this.$stateParams.c;
    this.emailRegex = SimpleSchema.RegEx.Email;
    this.isNew = this.$stateParams.userId.toLowerCase() === 'new';
    this.roleId = this.$stateParams.r;
    this.savedUser = null;
    this.stateOptions = _.chain(Constants.states)
      .sortBy('abbr')
      .map((state) => ({abbr: state.abbr, name: `${state.abbr} - ${state.name}`}))
      .value();
    this.stateOptionsSelected = [];
    this.stateTranslation = {
      selectAll: 'foo',
      selectNone: 'foo',
      reset: 'foo',
      search: 'Search...',
      nothingSelected : ''
    };
    this.schemaAddress = Schema.Address._schema;
    this.toastr = toastr;

    this.helpers({
      company: this._company,
      user: this._user,
      // isDirty: this._isDirty,
      isLoggedIn: this._isLoggedIn,
      updateDependencies: this._updateDependencies,
    });

    this.subscribe('company', this._companySubscription.bind(this));
    this.userSubscriptionHandle = this.subscribe('user', this._userSubscription.bind(this));
  }

  initializeSavedUser(user) {
    if (this.savedUser) {
      return;
    }

    if (this.isNew) {
      this.savedUser = {
        ...UsersHelper.emptyFormUser
      };
    } else {
      if (user) {
        // savedUser needs to be a deep clone of user and string properties should not be undefined
        this.savedUser = {
          ...user,
          address: {
            ...user.address
          }
        };
        const stateOption = _.find(this.stateOptions, (_stateOption) => _stateOption.abbr === user.address.state);
        if (stateOption) {
          stateOption.ticked = true;
        }
      } else {
        this.savedUser = null
      }
    }
  }

  _updateDependencies() {
    this.initializeSavedUser(this.getReactively('user'));
  }

  _companySubscription() {
    return [this.companyId];
  }

  _userSubscription() {
    return [this.$stateParams.userId];
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

  _company() {
    console.log(`about to get company ${this.companyId}`);
    return Companies.findOne({ _id: this.companyId });
  }

  _user() {
    if (this.isNew) {
      return {
        ...UsersHelper.emptyFormUser
      };
    } else {
      console.log(`about to get user ${this.$stateParams.userId}`);
      const user = Meteor.users.findOne({ _id: this.$stateParams.userId });
      if (user) {
        const userAddress = user.profile.address || {};
        return {
          emailAddress: user.emails && user.emails.length && user.emails[0].address,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          address: {
            addressLines: userAddress.addressLines,
            city: userAddress.city,
            state: userAddress.state,
            zipCode: userAddress.zipCode
          },
          phoneNumber: user.profile.phoneNumber,
          notes: user.profile.notes
        };
      }
    }
    return null;
  }

  stateSelected(stateOption) {
    this.user.address.state = stateOption.abbr;
  }

  cancelSave() {
    this.$state.go('users', {c: this.companyId, r: this.roleId});
  }

  manageRoles() {
    this.$state.go('roles', {c: this.companyId, u: this.$stateParams.userId});
  }

  submit(form) {
    const self = this;
    if (form.$invalid) {
      this.toastr.info("Please address field issue(s)");
      return;
    }
    // this.user.state = this.stateOptionsSelected.length > 0 ? this.stateOptionsSelected[0].abbr : '';
    if (this.isNew) {
      Meteor.call('createUserRelatedToCompany', this.user, this.companyId,
        function(err, result){
        if (err) {
          console.log('failed to create new user', err);
        } else {
          // console.log('success creating user', result);

          let userId = result;

          // Now need to add the role indicating user is user of company
          Meteor.call('addUserRole', userId, self.roleId, self.companyId,
            function(err, result) {
            if (err) {
              console.log('failed to add role for new user', err);
            } else {
              // console.log('success adding role for new user', result);

              self.$state.go('users', {c: self.companyId, r: self.roleId})
            }
          });
        }
      });
    } else {
      Meteor.call('updateUserRelatedToCompany', UsersHelper.cleanUser(this.user), this.companyId,
        function(err, result){
        if (err) {
          console.log('failed to update user', err);
        } else {
          // console.log('success creating user', result);
          self.$state.go('users', {c: self.companyId, r: self.roleId})
        }
      });
    }
  }
}
