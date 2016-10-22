import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'lookups'
})
@View({
  templateUrl: () => 'client/lookups/views/lookups.html'
})
@Inject('$filter', '$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class lookups {
  constructor($filter, $state, $stateParams) {
    this.itemIdsSelected = [];
    this.perPage = 3;
    this.page = 1;
    this.searchText = '';
    this.sortOptions = [
      {
        name: 'Standard',
        sort: {
          'templateLibraryId': 1,
          'supplierId': 1,
          'lookupType': 1,
          'key': 1,
          'name': 1,
          'value': 1,
        },
      },{
        name: 'Newest Additions',
        sort: {
          'effectiveDate': -1,
          'templateLibraryId': 1,
          'supplierId': 1,
          'lookupType': 1,
          'key': 1,
          'name': 1,
          'value': 1,
        },
      },{
        name: 'Newest Expirations',
        sort: {
          'expirationDate': -1,
          'templateLibraryId': 1,
          'supplierId': 1,
          'lookupType': 1,
          'key': 1,
          'name': 1,
          'value': 1,
        },
      }
    ];
    this.sortOptionSelected = this.sortOptions[0];
    this.supplierId = null;
    this.lookupKey = null;
    this.lookupName = null;
    this.lookupTypeOptions = LookupsHelper.getLookupTypeOptions();
    this.subscriptionsReady = 0;
    this.lookupTypeOptionSelected = null;
    this.lookupTypeOptionsSelected = [];
    this.templateLibraryOptions = [];
    this.templateLibraryOptionsSelected = [];
    this.lookupKeyOptions = [];
    this.lookupKeyOptionsSelected = [];

    this.helpers({
      areAnyItemsSelected: this._areAnyItemsSelected,
      lookups: this._lookupsCollection,
      lookupsCount: this._lookupsCount,
      templateLibraries: this._templateLibrariesCollection,
      currentUserId: this._currentUserId,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount,
      updateDependencies: this._updateDependencies,
    });

    this.subscribe('lookups', this._lookupsSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
    this.subscribe('templateLibraries', this._templateLibrariesSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
  }

  updateSort() {
    this.pageChanged(1);
  };

  pageChanged(newPage) {
    this.page = newPage;
  };

  getIconStack2xClass(lookupType) {
    return LookupsHelper.getIconStack2xClass(lookupType);
  }

  getIconStack1xClass(lookupType) {
    return LookupsHelper.getIconStack1xClass(lookupType);
  }

  // getImageSource(lookupType) {
  //   switch (lookupType) {
  //     case Constants.lookupTypes.label:
  //       return "icon.png";
  //     case Constants.lookupTypes.price:
  //       return "Dollars.png";
  //     case Constants.lookupTypes.standard:
  //     default:
  //       return "icon.png";
  //   }
  // }

  handleTemplateLibraryOptionsSelected(templateLibraryOptionsSelected) {
    if (!this.templateLibraryOptionsSelected[0] ||
      (templateLibraryOptionsSelected && templateLibraryOptionsSelected[0] &&
      this.templateLibraryOptionsSelected && this.templateLibraryOptionsSelected[0] &&
      templateLibraryOptionsSelected[0]._id !== this.templateLibraryOptionsSelected[0]._id)) {
        this.templateLibraryOptionsSelected = templateLibraryOptionsSelected;
        const templateLibrarySelected = _.find(this.templateLibraries, (templateLibrary) => templateLibrary._id === templateLibraryOptionsSelected[0]._id);
        this.lookupKeyOptions = LookupsHelper.getLookupKeyOptions(templateLibrarySelected, this.lookupTypeOptionsSelected[0].lookupType);
      }
  }

  // update pretty much all state dependent on subscriptions
  _updateDependencies() {
    console.log(`maybe updating dependencies ${this.getReactively('subscriptionsReady')}`);
    if (this.getReactively('subscriptionsReady') < 2) {
      return;
    }
    if (!this.templateLibrarySelected && this.templateLibraries && this.templateLibraries[0]) {
      this.templateLibrarySelected = this.templateLibraries[0];
    }
    if (this.getReactively('templateLibraries', true) && this.templateLibraries.length !== this.templateLibraryOptions.length) {
      this.templateLibraryOptions = TemplateLibrariesHelper.getTemplateLibraryOptions(this.templateLibraries, this.$filter);
      this.handleTemplateLibraryOptionsSelected(this.templateLibraryOptions);
    }
  }

  _areAnyItemsSelected() {
    return this.getReactively('itemIdsSelected').length;
  };

  _notShownSelectedCount() {
    const items = this.lookups;
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

  _lookupsCollection() {
    return Lookups.find({}, {
        sort: this.getReactively('sortOptionSelected.sort')
      }
    );
  }

  _lookupsCount() {
    return Counts.get('numberOfLookups');
  }

  _lookupsSubscription() {
    return [
      this.getReactively('supplierId'),
      this.getReactively('templateLibraryOptionsSelected[0]._id'),
      this.getReactively('lookupTypeOptionsSelected[0].lookupType'),
      this.getReactively('lookupKeyOptionsSelected[0].lookupKey'),
      this.getReactively('lookupName'),
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sortOptionSelected.sort')
      },
      this.getReactively('searchText')
    ]
  }

  _templateLibrariesCollection() {
    return TemplateLibraries.find({}, {
        sort: {
          'createdAt': -1,
        }
      }
    );
  }

  _templateLibrariesSubscription() {
    return [
      {
        sort: {
          'createdAt': -1,
        }
      },
      ''
    ]
  }
}
