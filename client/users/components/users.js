import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'users'
})
@View({
  templateUrl: () => 'client/users/views/users.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class users {
  constructor($state, $stateParams) {
    this.companiesSelected = [];
    this.companyIdParam = this.$stateParams.c;
    this.itemIdsSelected = [];
    this.perPage = Config.defaultRecordsPerPage;
    this.page = 1;
    this.roleIdParam = this.$stateParams.r;
    this.roles = [];
    this.rolesSelected = [];
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
      users: this._usersCollection,
      usersCount: this._usersCount,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount,
      updateDependencies: this._updateDependencies,
    });

    this.subscribe('companies', this._companiesSubscription.bind(this));
    this.subscribe('company', this._companySubscription.bind(this));
    this.subscribe('users', this._usersSubscription.bind(this));
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
    const items = this.users;
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
        sort: {
          'nameLower': 1,
        }
      }
    );
  }

  _companiesSubscription() {
    return [
      {
        sort: {
          'nameLower': 1,
        }
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

  _usersCollection() {
    const companyIdToFilterBy = this.getReactively('companiesSelected[0]._id');
    const roleToFilterBy = this.getReactively('rolesSelected[0].id');
    if (companyIdToFilterBy && roleToFilterBy) {
      let roleSelector = {};
      const roleGroup = 'roles.' + companyIdToFilterBy;
      roleSelector[roleGroup] = roleToFilterBy;
      return Meteor.users.find(roleSelector,
        {
          sort: this.getReactively('sortOptionSelected.sort')
        }
      );
    }
  }

  _usersCount() {
    return Counts.get('numberOfUsers');
  }

  _usersSubscription() {
    // console.log(`about to get usersSubscription for company ${this.companyIdToFilterBy} searching for '${this.searchText}'`);
    const companyIdToFilterBy = this.getReactively('companiesSelected[0]._id');
    const roleToFilterBy = this.getReactively('rolesSelected[0].id');
    return [
      companyIdToFilterBy,
      roleToFilterBy ? [roleToFilterBy] : [],
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sortOptionSelected.sort')
      },
      this.getReactively('searchText')
    ]
  }

  getRolesLoggedInUserCanAssign(companyId) {
    Meteor.call('getRolesLoggedInUserCanAssign', companyId, (err, result) => {
      if (err) {
        console.log('failed to getRolesLoggedInUserCanAssign', err);
      } else {
        // console.log('success getting getRolesLoggedInUserCanAssign', result);
        this.roles = result;
        if (this.roles.length === 1) {
          // cause the role to be selected
          this.roles[0].ticked = true;
        } else if (this.roles.length > 0 && this.roleIdParam) {
          const role = _.find(this.roles, (_role) => _role.id === this.roleIdParam);
          if (role) {
            // cause the role to be selected
            role.ticked = true;
          }
        }
      }
    });
  }

  _updateDependencies() {
    const companies = this.getReactively('companies', true);
    const companiesSelectedLength = this.getReactively('companiesSelected.length');
    const companySelectedId = this.getReactively('companiesSelected[0]._id');
    if (companies &&
        companiesSelectedLength === 0) {
      if (companies.length === 1) {
        // cause the company to be selected
        // console.log('hello');
        companies[0].ticked = true;
        this.getRolesLoggedInUserCanAssign(companies[0]._id);
        // console.log('goodbye');
      } else if (companies.length > 0 && this.companyIdParam) {
        const company = _.find(companies, (_company) => _company._id === this.companyIdParam);
        if (company) {
          // cause the company to be selected
          // console.log('hello again');
          company.ticked = true;
          this.getRolesLoggedInUserCanAssign(company._id);
          // console.log('goodbye again');
        }
      }
    } else if (companies &&
        companiesSelectedLength === 1 &&
        this.companyIdParam !== companySelectedId) {
      // console.log('hello yet again');
      this.getRolesLoggedInUserCanAssign(companySelectedId);
      // console.log('goodbye yet again');
    }
  }
}
