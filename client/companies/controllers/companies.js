import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'companies'
})
@View({
  templateUrl: () => 'client/companies/views/companies.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class companies {
  constructor() {
    this.itemIdsSelected = [];
    this.perPage = 3;
    this.page = 1;
    this.searchText = '';
    this.sortOptions = [
      {
        name: 'Name',
        sort: {
          'nameLower': 1,
        },
      },{
        name: 'Bid Activity: High to Low',
        sort: {
          'bidsLast30Days': -1,
          'nameLower': 1,
        },
        notAnOption: true,
      },{
        name: 'Bid Activity: Low to High',
        sort: {
          'bidsLast30Days': 1,
          'nameLower': 1,
        },
        notAnOption: true,
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
      companiesCount: this._companiesCount,
      currentUserId: this._currentUserId,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount,
    });

    this.subscribe('companies', this._companiesSubscription.bind(this));
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
    const items = this.companies;
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

  _companiesCount() {
    return Counts.get('numberOfCompanies');
  }

  _companiesSubscription() {
    return [
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sortOptionSelected.sort')
      },
      this.getReactively('searchText')
    ]
  }
}
