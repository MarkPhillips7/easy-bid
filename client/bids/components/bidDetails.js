(function () {
  'use strict';
  var controllerId = 'bidDetails';
  angular.module('app').controller(controllerId,
      ['$uibModalInstance', '$reactive', '$scope', 'bid', 'job', bidDetails]);

  function bidDetails($uibModalInstance, $reactive, $scope, bid, job) {
    $reactive(this).attach($scope);

    $scope.bid = bid;
    $scope.job = job;
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.getSummary = getSummary;
    this.cancel = cancel;
    this.save = save;
    this.bid = bid;
    this.job = job;
    this.getSummary = getSummary;
    this._customersCollection = () => {
      let customerRole = {};
      const roleGroup = 'roles.' + this.bid.companyId;
      customerRole[roleGroup] = 'customer';
      return Meteor.users.find(customerRole);
    };
    this._coworkersCollection = () => {
      let coworkerRole = {};
      const roleGroup = 'roles.' + this.bid.companyId;
      coworkerRole[roleGroup] = {
        $in: ['user', 'manage-templates', 'manage-users']
      };
      return Meteor.users.find(coworkerRole);
    };
    this.helpers({
      customers: this._customersCollection,
      coworkers: this._coworkersCollection,
    });
    this._customersSubscription = () => {
      return [
        this.bid.companyId
      ]
    };
    this._coworkersSubscription = () => {
      return [
        this.bid.companyId
      ]
    };
    this.subscribe('customers', this._customersSubscription.bind(this));
    this.subscribe('coworkers', this._coworkersSubscription.bind(this));
    $scope.customers = this.customers;
    $scope.coworkers = this.coworkers;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close();
    }

    function getSummary() {
      return JobsHelper.getSummary(this.job);
    }

    this.changeCustomer = () => {
      const customer = _.find(this.customers, (_customer) => _customer._id === this.job.customerId);
      this.job.customerProfile = customer.profile;
    }
    $scope.changeCustomer = this.changeCustomer;

    this.changeEstimator = () => {
      const estimator = _.find(this.coworkers, (coworker) => coworker._id === this.job.estimatorId);
      this.job.estimatorProfile = estimator.profile;
    }
    $scope.changeEstimator = this.changeEstimator;
  }
})();
// let {
//   Component, View, SetModule, Inject, MeteorReactive, LocalInjectables
// } = angular2now;
//
// SetModule('app');
//
// @Component({
//   selector: 'bid-details'
// })
// @View({
//   templateUrl: () => 'client/bids/views/bid-details-edit.html'
// })
// @Inject('company', 'customer', 'job')
// @MeteorReactive
// @LocalInjectables
// class bidDetails {
//   constructor(company, customer, job) {
//     this.company = company;
//     this.customer = customer;
//     this.job = job;
//     // this.companyId = this.$stateParams.c;
//     // this.customerId = this.$stateParams.r;
//     // this.jobId = this.$stateParams.bidId;
//     //
//     // this.helpers({
//     //   company: this._company,
//     //   currentUserId: this._currentUserId,
//     //   customer: this._customer,
//     //   job: this._job,
//     // });
//     //
//     // this.subscribe('company', this._companySubscription.bind(this));
//     // this.subscribe('customer', this._customerSubscription.bind(this));
//     // this.subscribe('job', this._jobSubscription.bind(this));
//   }
//
//   save() {
//     Meteor.call('saveSelectionChanges', this.job, [],
//       function(err, result) {
//       if (err) {
//         console.log('failed to save bid details', err);
//       } else {
//         console.log('success saving bid details', result);
//       }
//     });
//   }
// //
// //   _currentUserId() {
// //     return Meteor.userId();
// //   }
// //
// //   _isLoggedIn() {
// //     return Meteor.userId() !== null;
// //   }
// //
// //   _company() {
// //     return Companies.findOne({ _id: this.getReactively('companyId') });
// //   }
// //
// //   _companySubscription() {
// //     return [
// //       this.getReactively('companyId')
// //     ]
// //   }
// //
// //   _customer() {
// //     return Meteor.users.findOne({ _id: this.getReactively('customerId') });
// //   }
// //
// //   _customerSubscription() {
// //     return [
// //       this.getReactively('customerId')
// //     ]
// //   }
// //
// //   _job() {
// //     return Jobs.findOne(this.$stateParams.bidId);
// //   }
// //
// //   _jobSubscription() {
// //     return [ this.$stateParams.bidId ];
// //   }
// }
