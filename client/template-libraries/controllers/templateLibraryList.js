import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'libraries'
})
@View({
  templateUrl: () => 'client/template-libraries/views/template-library-list.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class templateLibraryList {
  constructor($state, $stateParams) {
    this.itemIdsSelected = [];
    this.perPage = Config.defaultRecordsPerPage;
    this.page = 1;
    this.sort = {
      name: 1
    };
    this.orderProperty = '1';
    this.searchText = '';

    this.helpers({
      areAnyItemsSelected: this._areAnyItemsSelected,
      // clone: this._clone,
      companies: this._companiesCollection,
      currentUserId: this._currentUserId,
      // getCompanyName: this._getCompanyName,
      templateLibraries: this._templateLibraryListCollection,
      librariesCount: this._templateLibraryListCount,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount
    });

    this.subscribe('companies');
    this.subscribe('templateLibraries', this._templateLibraryListSubscription.bind(this));
  }

  _companiesCollection() {
    return Companies.find({});
  }

  pageChanged(newPage) {
    this.page = newPage;
  };

  updateSort() {
    this.sort = {
      'name': parseInt(this.orderProperty)
    }
  };

  _areAnyItemsSelected() {
    return this.getReactively('itemIdsSelected').length;
  };

  _notShownSelectedCount() {
    const itemIdsSelected = this.getReactively('itemIdsSelected');
    let shownCount = 0;
    const self = this;
    _.each(itemIdsSelected, (itemIdSelected) => {
      shownCount += _.some(self.templateLibraries, (bid) => bid._id === itemIdSelected) ? 1 : 0;
    });

    return itemIdsSelected.length - shownCount;
  }

  isItemSelected(templateLibraryId) {
    const templateLibraryIdIndex = _.indexOf(this.itemIdsSelected, templateLibraryId);
    return templateLibraryIdIndex != -1;
  }

  toggleItemSelection(templateLibraryId) {
    const templateLibraryIdIndex = _.indexOf(this.itemIdsSelected, templateLibraryId);

    if (templateLibraryIdIndex === -1) {
      this.itemIdsSelected = [...this.itemIdsSelected, templateLibraryId];
    } else {
      this.itemIdsSelected = [
        ...this.itemIdsSelected.slice(0, templateLibraryIdIndex),
        ...this.itemIdsSelected.slice(templateLibraryIdIndex + 1)
      ];
    }
  }

  _currentUserId() {
    return Meteor.userId();
  }

  _isLoggedIn() {
    return Meteor.userId() !== null;
  }

  _templateLibraryListCollection() {
    return TemplateLibraries.find({}, {
        sort: this.getReactively('sort')
      }
    );
  }

  _templateLibraryListCount() {
    return Counts.get('numberOfTemplateLibraries');
  }

  _templateLibraryListSubscription() {
    return [
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sort')
      },
      this.getReactively('searchText')
    ];
  }

  clone(templateLibrary) {
    // ToDo: implement (use TemplateLibrariesHelper.cloneTemplateLibrary)
  }

  getCompanyName(companyId) {
    const company = _.find(this.companies, (company) => company._id === companyId);
    return company && company.name || 'Easy Bid';
  }
}
