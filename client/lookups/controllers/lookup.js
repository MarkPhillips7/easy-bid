import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'lookup'
})
@View({
  templateUrl: () => 'client/lookups/views/lookup-details.html'
})
@Inject('$filter', '$state', '$stateParams', '$timeout')
@MeteorReactive
@LocalInjectables
class lookup {
  constructor() {
    this.lookupId = this.$stateParams.lookupId;
    this.isNew = this.$stateParams.lookupId.toLowerCase() === 'new';
    this.savedLookup = null;
    this.templateLibraryId = this.$stateParams.tl;
    this.lookupType = this.$stateParams.lt;
    this.lookupSubType = this.$stateParams.ls;
    this.lookupKey = this.$stateParams.lk;
    // this.lookupKeyTypeaheadText = this.$stateParams.lk;
    this.lookupTypeOptions = null;
    this.lookupTypeOptionsSelected = [];
    this.lookupSubTypeOptionsSelected = [];
    this.templateLibraryOptions = [];
    this.templateLibraryOptionsSelected = [];
    this.lookupKeyOptionsSelected = [];
    this.subscriptionsReady = 0;
    this.lookupData = null;
    this.lookupDataTemplateLibraryId = null;

    this.helpers({
      lookup: this._lookup,
      lookupKeyOptions: this._lookupKeyOptions,
      lookupSubTypeOptions: this._lookupSubTypeOptions,
      templateLibraries: this._templateLibrariesCollection,
      isLoggedIn: this._isLoggedIn,
      updateDependencies: this._updateDependencies,
    });

    this.subscribe('lookup', this._lookupSubscription.bind(this));
    this.subscribe('templateLibraries', this._templateLibrariesSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
  }

  _lookupSubscription() {
    return [this.lookupId];
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }

  _lookup() {
    if (this.isNew) {
      this.savedLookup = {
        _id: Random.id(),
        lookupType: this.lookupType,
        lookupSubType: this.lookupSubType,
        templateLibraryId: this.templateLibraryId,
        // supplierId,
        key: this.lookupKey,
        // name: productName,
        // value: LookupsHelper.getSquishedKey(productSku),
        effectiveDate: new Date(),
        createdAt: new Date(),
        createdBy: Meteor.userId(),
      };
    } else {
      console.log(`about to get lookup ${this.lookupId}`);
      this.savedLookup = Lookups.findOne({ _id: this.lookupId });
    }
    return this.savedLookup && {...this.savedLookup};
  }

  _lookupSubTypeOptions() {
    const lookupSubType = this.getReactively('lookupSubType') || this.getReactively('lookupSubTypeOptionsSelected[0].lookupSubType');
    const lookupSubTypeOptions = this.getReactively('lookupData') &&
      LookupsHelper.getLookupSubTypeOptions(this.getReactively('lookupData'),
        this.getReactively('lookupTypeOptionsSelected[0].lookupType'),
        lookupSubType, 'None');
    return lookupSubTypeOptions;
  }

  _lookupKeyOptions() {
    const lookupKey = this.getReactively('lookup.key');
    // this.lookupKeyTypeaheadText = lookupKey;
    return this.getReactively('lookupData') &&
      LookupsHelper.getLookupKeyOptions(this.getReactively('lookupData'),
        this.getReactively('lookupTypeOptionsSelected[0].lookupType'),
        this.getReactively('lookupSubTypeOptionsSelected[0].lookupSubType'), lookupKey);
  }

  updateLookupTypes(lookupType) {
    // multi-select controls were not consistently binding until moving getLookupTypeOptions call into timeout
    // idea from here: http://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
    this.$timeout(() => {
      this.lookupTypeOptions = LookupsHelper.getLookupTypeOptions(this.lookupData, lookupType);
    });
  }

  handleTemplateLibraryOptionsSelected() {
    if (this.templateLibraryOptionsSelected && this.templateLibraryOptionsSelected[0]) {
      const templateLibrarySelected = _.find(this.templateLibraries, (templateLibrary) => templateLibrary._id === this.templateLibraryOptionsSelected[0]._id);
      if (templateLibrarySelected) {
        // load all the lookup data for the selected template library
        this.lookupDataTemplateLibraryId = templateLibrarySelected._id;
        this.lookup.templateLibraryId = templateLibrarySelected._id;
        Meteor.call('loadLookupData', [templateLibrarySelected], (err, result) => {
          if (err) {
            console.log('failed to loadLookupData', err);
          } else {
            // console.log('success getting companyIdsRelatedToUser', result);
            this.lookupData = result;
            this.updateLookupTypes(this.lookupType);
          }
        });
      }
    }
  }

  // update pretty much all state dependent on subscriptions
  _updateDependencies() {
    if (!this.templateLibraryId && this.lookup) {
      this.templateLibraryId = this.lookup.templateLibraryId;
      this.lookupType = this.lookup.lookupType;
      this.lookupSubType = this.lookup.lookupSubType;
      this.lookupKey = this.lookup.lookupKey;
    }
    if (this.getReactively('templateLibraries', true) &&
        this.templateLibraries.length !== this.templateLibraryOptions.length) {
      this.templateLibraryOptions = TemplateLibrariesHelper.getTemplateLibraryOptions(
        this, this.$filter, this.templateLibraryId);
    }
    if (this.getReactively('this.templateLibraryOptionsSelected[0]') &&
        this.lookupDataTemplateLibraryId !== this.templateLibraryOptionsSelected[0]._id) {
      this.handleTemplateLibraryOptionsSelected();
    }
    if (this.lookup && this.getReactively('lookupTypeOptionsSelected[0].lookupType')) {
      this.lookup.lookupType = this.lookupTypeOptionsSelected[0].lookupType;
    }
    if (this.lookup && this.getReactively('lookupSubTypeOptionsSelected[0].lookupSubType') !== undefined) {
      this.lookup.lookupSubType = this.lookupSubTypeOptionsSelected[0].lookupSubType;
    }
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

  isDirty() {
    return !_.isEqual(this.lookup, this.savedLookup);
  }

  isEffectiveDateDirty() {
    return this.lookup && this.savedLookup && this.lookup.effectiveDate !== this.savedLookup.effectiveDate;
  }

  cancelSave() {
    this.$state.go('lookups')
  }

  createNewLookup(makeEffectiveNow) {
    const isInsert = true;
    const lookupToSave = {...this.lookup, _id: Random.id()};
    if (makeEffectiveNow) {
      lookupToSave.effectiveDate = new Date();
    }
    this.actuallySaveLookup(lookupToSave, isInsert);
    this.$state.go('lookups');
  }

  saveExistingLookup() {
    const isInsert = false;
    this.actuallySaveLookup(this.lookup, isInsert);
    this.$state.go('lookups');
  }

  actuallySaveLookup(lookup, isInsert) {
    Meteor.call('saveLookup', lookup, isInsert,
      (err, result) => {
      if (err) {
        console.log('failed to save lookup', err);
      } else {
        console.log('success saving lookup', result);
      }
    });
  }
}
