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
    this.sort = {
      'nameLower': 1
    };
    this.orderProperty = '1';
    this.searchText = '';

    this.helpers({
      areAnyItemsSelected: this._areAnyItemsSelected,
      currentUserId: this._currentUserId,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount,
      companies: this._companiesCollection,
      companiesCount: this._companiesCount
    });

    this.subscribe('companies', this._companiesSubscription.bind(this));
  }

  updateSort() {
    this.sort = {
      'dueAt': -1,
      'nameLower': parseInt(this.orderProperty)
    }
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
          sort: this.getReactively('sort')
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
        sort: this.getReactively('sort')
      },
      this.getReactively('searchText')
    ]
  }
}
