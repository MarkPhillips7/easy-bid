import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'invite-users'
})
@View({
  templateUrl: () => 'client/users/views/invite-users.html'
})
@Inject('$scope', '$state', '$stateParams', 'toastr')
@MeteorReactive
@LocalInjectables
class inviteUsers {
  constructor($scope, $state, $stateParams, toastr) {
    this.companyId = this.$stateParams.c;
    this.originalEmailAddresses = '';
    this.emailAddresses = '';
    this.pendingActions = undefined;
    this.roleId = this.$stateParams.r;
    this.role = RolesHelper.getRoleObject(this.roleId);
    this.toastr = toastr;

    this.helpers({
      company: this._company,
    });

    this.subscribe('company', this._companySubscription.bind(this));
  }

  isDirty() {
    return this.emailAddresses !== '';
  }

  _companySubscription() {
    return [this.companyId];
  }

  _company() {
    // console.log(`about to get company ${this.companyId}`);
    return Companies.findOne({ _id: this.companyId });
  }

  cancelInvite() {
    this.$state.go('users', {c: this.companyId, r: this.roleId});
  }

  getPreviewActionIconClass(pendingAction) {
    if (pendingAction && !pendingAction.userExists) {
      return `eb-pending-action-icon fa fa-envelope`;
    }
    if (pendingAction && pendingAction.isInRole) {
      return `eb-pending-action-icon eb-invisible fa fa-check`;
    }
    return `eb-pending-action-icon fa fa-key`;
  }

  getPreviewActionText(pendingAction) {
    if (pendingAction && !pendingAction.userExists) {
      return `Send invitation to ${pendingAction.emailAddress} and add ${this.role.name} role when he/she signs up`;
    }
    if (pendingAction && pendingAction.isInRole) {
      return `Do nothing (${pendingAction.name} already has ${this.role.name} role)`;
    }
    return `Add ${this.role.name} role to ${pendingAction.name}`;
  }

  previewActions() {
    this.originalEmailAddresses = this.emailAddresses;
    Meteor.call('getUserAndRoleInfo', this.emailAddresses, this.roleId, this.companyId,
      (err, result) => {
      if (err) {
        console.log('failed to getUserAndRoleInfo', err);
      } else {
        this.pendingActions = result;
        this.$scope.$digest();
      }
    });
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
