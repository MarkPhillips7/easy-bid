import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'test'
})
@View({
  templateUrl: () => 'client/test/views/test.html'
})
@MeteorReactive
@LocalInjectables
class test {
  constructor() {
    this.helpers({
      jobs: this._jobsCollection,
      companies: this._companiesCollection,
      templateLibraries: this._templateLibrariesCollection,
      customers: this._customersCollection,
      coworkers: this._coworkersCollection
    });

    this.subscribe('jobs');
    this.subscribe('companies');
    this.subscribe('templateLibraries');
    this.subscribe('customers', this._customersSubscription.bind(this));
    this.subscribe('coworkers', this._coworkersSubscription.bind(this));
  }

  _jobsCollection() {
    return Jobs.find({});
  }

  _companiesCollection() {
    return Companies.find({});
  }

  _templateLibrariesCollection() {
    return TemplateLibraries.find({});
  }

  _customersCollection() {
    let customerRole = {};
    const roleGroup = this.companies &&
      this.companies.length &&
      'roles.' + this.companies[0]._id;
    customerRole[roleGroup] = 'customer';
    return Meteor.users.find(customerRole);
  }

  _customersSubscription() {
    return [
      this.getReactively('companies') &&
        this.getReactively('companies').length &&
        this.getReactively('companies')[0]._id,
      null, null
    ]
  }

  _coworkersCollection() {
    let coworkerRole = {};
    const roleGroup = this.companies &&
      this.companies.length &&
      'roles.' + this.companies[0]._id;
    coworkerRole[roleGroup] = {
      $in: ['user', 'manage-templates', 'manage-users']
    };
    return Meteor.users.find(coworkerRole);
  }

  _coworkersSubscription() {
    return [
      this.getReactively('companies') &&
        this.getReactively('companies').length &&
        this.getReactively('companies')[0]._id,
      null, null
    ];
  }
}
