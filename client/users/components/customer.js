import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'customer'
})
@View({
  templateUrl: () => 'client/users/views/customer.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class customer {
  constructor($state, $stateParams) {
    this.companyId = this.$stateParams.c;
    this.isNew = this.$stateParams.userId.toLowerCase() === 'new';
    this.savedCustomer = null;

    this.helpers({
      company: this._company,
      customer: this._customer,
      // isDirty: this._isDirty,
      isLoggedIn: this._isLoggedIn
    });

    this.subscribe('company', this._companySubscription.bind(this));
    this.subscribe('user', this._userSubscription.bind(this));
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
    return !_.isEqual(this.customer, this.savedCustomer);
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }

  _company() {
    console.log(`about to get company ${this.companyId}`);
    return Companies.findOne({ _id: this.companyId });
  }

  _customer() {
    if (this.isNew) {
      this.savedCustomer = {
        emailAddress: '',
        firstName: '',
        lastName: '',
        address: {
          addressLines: '',
          city: '',
          state: '',
          zipCode: ''
        },
        phoneNumber: '',
        notes: ''
      };
    } else {
      console.log(`about to get user ${this.$stateParams.userId}`);
      const user = Meteor.users.findOne({ _id: this.$stateParams.userId });
      if (user) {
        this.savedCustomer = {
          emailAddress: user.emails && user.emails.length && user.emails[0].address,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          address: {
            addressLines: user.profile.address.addressLines,
            city: user.profile.address.city,
            state: user.profile.address.state,
            zipCode: user.profile.address.zipCode
          },
          phoneNumber: user.profile.phoneNumber,
          notes: user.profile.notes
        };
      } else {
        this.savedCustomer = null
      }
    }
    return this.savedCustomer && {...this.savedCustomer};
  }

  cancelSave() {
    this.$state.go('customers', {c: this.companyId})
  }

  submit() {
    const self = this;
    if (this.isNew) {
      Meteor.call('createUserRelatedToCompany', this.customer, this.companyId,
        function(err, result){
        if (err) {
          console.log('failed to create new customer', err);
        } else {
          // console.log('success creating customer', result);

          let userId = result;

          // Now need to add the role indicating user is customer of company
          Meteor.call('addUserRole', userId, Config.roles.customer, self.companyId,
            function(err, result) {
            if (err) {
              console.log('failed to add role for new customer', err);
            } else {
              // console.log('success adding role for new customer', result);

              self.$state.go('customers', {c: self.companyId})
            }
          });
        }
      });
    } else {
      Meteor.call('updateUserRelatedToCompany', this.customer, this.companyId,
        function(err, result){
        if (err) {
          console.log('failed to update customer', err);
        } else {
          // console.log('success creating customer', result);

          let userId = result;

          // Now need to add the role indicating user is customer of company
          Meteor.call('addUserRole', userId, Config.roles.customer, self.companyId,
            function(err, result) {
            if (err) {
              console.log('failed to add role for customer', err);
            } else {
              // console.log('success adding role for new customer', result);

              self.$state.go('customers', {c: self.companyId})
            }
          });
        }
      });
    }
  }
}
