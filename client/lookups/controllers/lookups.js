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
    this.perPage = Config.defaultRecordsPerPage;
    this.page = 1;
    this.searchText = '';
    this.sortOptions = [
      {
        name: 'Standard',
        sort: {
          'templateLibraryId': 1,
          'supplierId': 1,
          'lookupType': 1,
          'lookupSubType': 1,
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
          'lookupSubType': 1,
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
          'lookupSubType': 1,
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
    this.subscriptionsReady = 0;
    this.lookupTypeOptions = null; // LookupsHelper.getLookupTypeOptions();
    this.lookupTypeOptionSelected = null;
    this.dateStatusOptions = LookupsHelper.getDateStatusOptions();
    this.dateStatusOptionsSelected = null;
    this.lookupTypeOptionsSelected = [];
    // this.lookupSubTypeOptions = LookupsHelper.getLookupSubTypeOptions();
    this.lookupSubTypeOptionSelected = null;
    this.lookupSubTypeOptionsSelected = [];
    this.templateLibraryOptions = [];
    this.templateLibraryOptionsSelected = [];
    this.lookupKeyOptionsSelected = [];
    this.lookupData = null;
    this.lookupDataTemplateLibraryId = null;

    this.helpers({
      areAnyItemsSelected: this._areAnyItemsSelected,
      lookups: this._lookupsCollection,
      lookupsCount: this._lookupsCount,
      lookupKeyOptions: this._lookupKeyOptions,
      lookupSubTypeOptions: this._lookupSubTypeOptions,
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

  getUnits(lookup) {
    return LookupsHelper.getSettingValue(lookup, Constants.lookupSettingKeys.unitsText);
  }

  getDateStatusIconClass(lookup) {
    return LookupsHelper.getDateStatusIconClass(lookup);
  }

  getDateStatus(lookup) {
    return LookupsHelper.getDateStatus(lookup);
  }

  getDateStatusTooltip(lookup) {
    return LookupsHelper.getDateStatusTooltip(lookup, this.$filter);
  }

  getDateStatusText(lookup) {
    return LookupsHelper.getDateStatusText(lookup, this.$filter);
  }

  newLookUp() {
    this.$state.go('lookupDetails', {
      lookupId: 'new',
      tl: this.templateLibraryOptionsSelected[0] && this.templateLibraryOptionsSelected[0]._id,
      lt: this.lookupTypeOptionsSelected[0] && this.lookupTypeOptionsSelected[0].lookupType,
      ls: this.lookupSubTypeOptionsSelected[0] && this.lookupSubTypeOptionsSelected[0].lookupSubType,
      lk: this.lookupKeyOptionsSelected[0] && this.lookupKeyOptionsSelected[0].lookupKey,
    });
  }

  _lookupSubTypeOptions() {
    const lookupSubTypeOptions = this.getReactively('lookupData') &&
      LookupsHelper.getLookupSubTypeOptions(this.getReactively('lookupData'),
        this.getReactively('lookupTypeOptionsSelected[0].lookupType'),
        this.getReactively('lookupSubTypeOptionsSelected[0].lookupSubType'), 'Any');
    // this.$scope.$apply();
    return lookupSubTypeOptions;
  }

  _lookupKeyOptions() {
    return this.getReactively('lookupData') &&
      LookupsHelper.getLookupKeyOptions(this.getReactively('lookupData'),
        this.getReactively('lookupTypeOptionsSelected[0].lookupType'),
        this.getReactively('lookupSubTypeOptionsSelected[0].lookupSubType'),
        this.getReactively('lookupKeyOptionsSelected[0].lookupKey'), 'Any');
  }

  updateLookupTypes() {
    this.lookupTypeOptions = LookupsHelper.getLookupTypeOptions(this.lookupData,
      this.lookupTypeOptionsSelected.length && this.lookupTypeOptionsSelected[0].lookupType, 'Any');
    // this.$scope.$apply();
  }

  handleTemplateLibraryOptionsSelected() {
    if (this.templateLibraryOptionsSelected && this.templateLibraryOptionsSelected[0]) {
      const templateLibrarySelected = _.find(this.templateLibraries, (templateLibrary) => templateLibrary._id === this.templateLibraryOptionsSelected[0]._id);
      if (templateLibrarySelected) {
        // load all the lookup data for the selected template library
        this.lookupDataTemplateLibraryId = templateLibrarySelected._id;
        Meteor.call('loadLookupData', [templateLibrarySelected], (err, result) => {
          if (err) {
            console.log('failed to loadLookupData', err);
          } else {
            // console.log('success getting companyIdsRelatedToUser', result);
            this.lookupData = result;
            this.updateLookupTypes();
          }
        });
      }
    }
  }

  // update pretty much all state dependent on subscriptions
  _updateDependencies() {
    if (!this.templateLibrarySelected && this.templateLibraries && this.templateLibraries[0]) {
      this.templateLibrarySelected = this.templateLibraries[0];
    }
    if (this.getReactively('templateLibraries', true) &&
        this.templateLibraries.length !== this.templateLibraryOptions.length &&
        this.templateLibrarySelected) {
      this.templateLibraryOptions = TemplateLibrariesHelper.getTemplateLibraryOptions(this, this.$filter, this.templateLibrarySelected._id);
    }
    if (this.getReactively('this.templateLibraryOptionsSelected[0]') &&
        this.lookupDataTemplateLibraryId !== this.templateLibraryOptionsSelected[0]._id) {
      this.handleTemplateLibraryOptionsSelected();
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
      this.getReactively('lookupSubTypeOptionsSelected[0].lookupSubType'),
      this.getReactively('lookupKeyOptionsSelected[0].lookupKey'),
      this.getReactively('lookupName'),
      this.getReactively('dateStatusOptionsSelected[0].dateStatusOption'),
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
