import {diff} from 'rus-diff';
import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'company'
})
@View({
  templateUrl: () => 'client/companies/views/company-details.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class company {
  constructor() {
    this.companyId = this.$stateParams.companyId;
    this.isNew = this.$stateParams.companyId.toLowerCase() === 'new';
    this.companyFields = CompanyFields;
    this.originalCompany = undefined;
    this.form = {};
    this.options = {};

    this.helpers({
      company: this._company,
      isLoggedIn: this._isLoggedIn,
    });

    this.subscribe('company', this._companySubscription.bind(this));
  }

  _companySubscription() {
    return [this.companyId];
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }

  _company() {
    let returnValue = {
      _id: Random.id(),
      createdAt: new Date(),
      createdBy: Meteor.userId(),
    };
    if (!this.isNew) {
      console.log(`about to get company ${this.companyId}`);
      returnValue = Companies.findOne({ _id: this.companyId });
    }
    if (!this.originalCompany) {
      this.originalCompany = returnValue && {...returnValue};
    }
    return returnValue;
  }

  cancelSave() {
    this.$state.go('companies')
  }

  submit() {
    if (this.form.$valid) {
      if (this.isNew) {
        Companies.insert(this.company);
      } else {
        const companyMods = diff(this.originalCompany, this.company);
        if (companyMods) {
          Companies.update({_id: this.company._id}, companyMods);
          this.originalCompany = this.company && {...this.company};
        }
      }
      this.$state.go('companies')
    }
  }
}
