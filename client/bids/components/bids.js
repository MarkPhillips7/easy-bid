let {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables
} = angular2now;

SetModule('app');

@Component({
  selector: 'bids'
})
@View({
  templateUrl: () => 'client/bids/views/bids.html'
})
@Inject('$state', '$stateParams')
@MeteorReactive
@LocalInjectables
class bids {
  constructor() {
    this.bidIdsSelected = [];
    this.companyIdToFilterBy = this.$stateParams.c;
    this.customerIdToFilterBy = this.$stateParams.r;
    this.now = new Date();
    this.perPage = 3;
    this.page = 1;
    this.sort = {
      'dueAt': -1,
      'nameLower': 1
    };
    this.orderProperty = '1';
    this.searchText = '';

    this.helpers({
      areAnyBidsSelected: this._areAnyBidsSelected,
      company: this._company,
      currentUserId: this._currentUserId,
      customer: this._customer,
      bids: this._bidsCollection,
      bidsCount: this._bidsCount,
      isLoggedIn: this._isLoggedIn,
      notShownSelectedCount: this._notShownSelectedCount
    });

    this.initializeCompanyId();

    this.subscribe('company', this._companySubscription.bind(this));
    this.subscribe('customer', this._customerSubscription.bind(this));
    this.subscribe('jobs', this._bidsSubscription.bind(this));
  }

  pageChanged(newPage) {
    this.page = newPage;
  };

  updateSort() {
    this.sort = {
      'dueAt': -1,
      'nameLower': parseInt(this.orderProperty)
    }
  };

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
          self.$state.go('bids', {c: self.companyIdToFilterBy, r: self.customerIdToFilterBy});
        }
      });
    }
  }

  _areAnyBidsSelected() {
    return this.getReactively('bidIdsSelected').length;
  };

  _notShownSelectedCount() {
    const bidIdsSelected = this.getReactively('bidIdsSelected');
    let shownCount = 0;
    const self = this;
    _.each(bidIdsSelected, (bidIdSelected) => {
      shownCount += _.some(self.bids, (bid) => bid._id === bidIdSelected) ? 1 : 0;
    });

    return bidIdsSelected.length - shownCount;
  }

  isBidSelected(bidId) {
    const bidIdIndex = _.indexOf(this.bidIdsSelected, bidId);
    return bidIdIndex != -1;
  }

  toggleBidSelection(bidId) {
    const bidIdIndex = _.indexOf(this.bidIdsSelected, bidId);

    if (bidIdIndex === -1) {
      this.bidIdsSelected = [...this.bidIdsSelected, bidId];
    } else {
      this.bidIdsSelected = [
        ...this.bidIdsSelected.slice(0, bidIdIndex),
        ...this.bidIdsSelected.slice(bidIdIndex + 1)
      ];
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

  _customer() {
    // console.log(`about to get customerIdToFilterBy ${this.customerIdToFilterBy}`);
    return Meteor.users.findOne({ _id: this.getReactively('customerIdToFilterBy') });
  }

  _customerSubscription() {
    return [
      this.getReactively('customerIdToFilterBy')
    ]
  }

  _bidsCollection() {
    return Jobs.find({}, {
          sort: this.getReactively('sort')
        }
      );
  }

  _bidsCount() {
    return Counts.get('numberOfJobs');
  }

  _bidsSubscription() {
    return [
      this.getReactively('companyIdToFilterBy'),
      this.getReactively('customerIdToFilterBy'),
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sort')
      },
      this.getReactively('searchText')
    ]
  }
}
