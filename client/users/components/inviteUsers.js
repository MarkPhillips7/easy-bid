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
    Meteor.call('addRolesSendInvitations', this.pendingActions, this.roleId, this.companyId,
      (err, result) => {
        if (err) {
          console.log('failed to addRolesSendInvitations', err);
        } else {
          // const addRoleCount = _.filter(this.pendingActions, (pendingAction) => pendingAction.userExists && !pendingAction.isInRole).length;
          // const addedRolesText = addRoleCount > 0 ? `added ${addRoleCount} role${addRoleCount > 1 ? 's' : ''}` : '';
          // const sendInvitationCount = _.filter(this.pendingActions, (pendingAction) => !pendingAction.userExists).length;
          // const sentInvitationsText = sendInvitationCount > 0 ? `${addedRolesText ? ', ' : ''}sent ${sendInvitationCount} invitation${sendInvitationCount > 1 ? 's' : ''}` : '';
          // const doNothingCount = _.filter(this.pendingActions, (pendingAction) => pendingAction.userExists && pendingAction.isInRole).length;
          // const didNothingText = doNothingCount > 0 ? `${addedRolesText || sentInvitationsText ? ', ' : ''}did nothing for ${doNothingCount} user${doNothingCount > 1 ? 's' : ''} already having desired role` : '';
          // const successMessage = `Successfully ${addedRolesText}${sentInvitationsText}${didNothingText}`;
          const successMessage = 'Successfully added roles / sent invitations';
          this.toastr.success(successMessage);
          this.$state.go('users', {c: this.companyId, r: this.roleId})
        }
      }
    );
  }
}
