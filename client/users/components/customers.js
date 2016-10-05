import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'customers'
})
@View({
  templateUrl: () => 'client/users/views/customers.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class customers {
  constructor() {
    this.companyIdToFilterBy = this.$stateParams.c;
    this.itemIdsSelected = [];
    this.perPage = 3;
    this.page = 1;
    this.searchText = '';
    this.sortOptions = [
      {
        name: 'Name',
        sort: {
          'profile.nameLower': 1,
        },
      },{
        name: 'Newest Additions',
        sort: {
          'createdAt': -1,
        },
      }
    ];
    this.sortOptionSelected = this.sortOptions[0];

    this.helpers({
      areAnyItemsSelected: this._areAnyItemsSelected,
      company: this._company,
      currentUserId: this._currentUserId,
      customers: this._customersCollection,
      customersCount: this._customersCount,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount,
    });

    this.initializeCompanyId();

    this.subscribe('company', this._companySubscription.bind(this));
    this.subscribe('customers', this._customersSubscription.bind(this));
  }

  updateSort() {
    this.pageChanged(1);
  };

  pageChanged(newPage) {
    this.page = newPage;
  };

  _areAnyItemsSelected() {
    return this.getReactively('itemIdsSelected').length;
  };

  _notShownSelectedCount() {
    const items = this.customers;
    const itemIdsSelected = this.getReactively('itemIdsSelected');
    let shownCount = 0;
    _.each(itemIdsSelected, (itemIdSelected) => {
      shownCount += _.some(items, (item) => item._id === itemIdSelected) ? 1 : 0;
    });

    return itemIdsSelected.length - shownCount;
  }

  isItemSelected(itemId) {
    const itemIdIndex = _.indexOf(this.itemIdsSelected, itemId);
    return itemIdIndex != -1;
  }

  toggleItemSelection(itemId) {
    const itemIdIndex = _.indexOf(this.itemIdsSelected, itemId);

    if (itemIdIndex === -1) {
      this.itemIdsSelected = [...this.itemIdsSelected, itemId];
    } else {
      this.itemIdsSelected = [
        ...this.itemIdsSelected.slice(0, itemIdIndex),
        ...this.itemIdsSelected.slice(itemIdIndex + 1)
      ];
    }
  }

  initializeCompanyId() {
    let self = this;
    if (!this.companyIdToFilterBy) {
      Meteor.call('companyIdsRelatedToUser', Meteor.userId(), function(err, result){
        if (err) {
          console.log('failed to get companyIdsRelatedToUser', err);
        } else {
          // console.log('success getting companyIdsRelatedToUser', result);

          self.companyIdToFilterBy = result[0];
          // console.log(`Changed companyId to ${self.companyIdToFilterBy}. Rerouting...`);
          self.$state.go('customers', {c: self.companyIdToFilterBy})
        }
      });
    }
  }

  _currentUserId() {
    return Meteor.userId();
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }

  _company() {
    // console.log(`about to get companyIdToFilterBy ${this.companyIdToFilterBy}`);
    return Companies.findOne({ _id: this.getReactively('companyIdToFilterBy') });
  }

  _companySubscription() {
    return [
      this.getReactively('companyIdToFilterBy')
    ]
  }

  _customersCollection() {
    const companyIdToFilterBy = this.getReactively('companyIdToFilterBy');
    if (companyIdToFilterBy) {
      let customerRole = {};
      const roleGroup = 'roles.' + companyIdToFilterBy;
      customerRole[roleGroup] = 'customer';
      // console.log(`about to get users for ${roleGroup} customers`);
      return Meteor.users.find(customerRole,
        {
          sort: this.getReactively('sortOptionSelected.sort')
        }
      );
    }
  }

  _customersCount() {
    return Counts.get('numberOfCustomers');
  }

  _customersSubscription() {
    // console.log(`about to get customersSubscription for company ${this.companyIdToFilterBy} searching for '${this.searchText}'`);
    return [
      this.getReactively('companyIdToFilterBy'),
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sortOptionSelected.sort')
      },
      this.getReactively('searchText')
    ]
  }
}
