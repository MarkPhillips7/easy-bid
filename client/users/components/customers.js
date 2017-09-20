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
  constructor($state, $stateParams) {
    this.companiesSelected = [];
    this.companyIdToFilterBy = this.$stateParams.c;
    this.itemIdsSelected = [];
    this.perPage = Config.defaultRecordsPerPage;
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
      companies: this._companiesCollection,
      company: this._company,
      currentUserId: this._currentUserId,
      customers: this._customersCollection,
      customersCount: this._customersCount,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount,
      updateDependencies: this._updateDependencies,
    });

    this.subscribe('companies', this._companiesSubscription.bind(this));
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

  _currentUserId() {
    return Meteor.userId();
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }

  _companiesCollection() {
    return Companies.find({}, {
        sort: this.getReactively('sortOptionSelected.sort')
      }
    );
  }

  _companiesSubscription() {
    return [
      {
        sort: this.getReactively('sortOptionSelected.sort')
      },
      ''
    ]
  }

  _company() {
    return Companies.findOne({ _id: this.getReactively('companiesSelected[0]._id') });
  }

  _companySubscription() {
    return [
      this.getReactively('companiesSelected[0]._id')
    ]
  }

  _customersCollection() {
    const companyIdToFilterBy = this.getReactively('companiesSelected[0]._id');
    if (companyIdToFilterBy) {
      let customerRole = {};
      const roleGroup = 'roles.' + companyIdToFilterBy;
      customerRole[roleGroup] = Config.roles.customer;
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
      this.getReactively('companiesSelected[0]._id'),
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sortOptionSelected.sort')
      },
      this.getReactively('searchText')
    ]
  }
  
  _updateDependencies() {
    if (this.getReactively('companies', true) &&
        this.companiesSelected.length === 0) {
      if (this.companies.length === 1) {
        // cause the company to be selected
        this.companies[0].ticked = true;
      } else if (this.companies.length > 0 && this.companyIdToFilterBy) {
        const company = _.find(this.companies, (_company) => _company._id === this.companyIdToFilterBy);
        if (company) {
          // cause the company to be selected
          company.ticked = true;
        }
      }
    }
  }
}
