let {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables
} = angular2now;

SetModule('app');

@Component({
  selector: 'bid'
})
@View({
  templateUrl: () => 'client/bids/views/bid.html'
})
@Inject('$state', '$stateParams', '$timeout', 'bootstrap.dialog')
@MeteorReactive
@LocalInjectables
class bid {
  constructor($state, $stateParams, $timeout, bootstrapDialog) {
    this.areaSelectedId = '';
    this.areaToAdd = '';
    this.areaTree = {};
    this.areaTreeData = [];
    this.companyId = this.$stateParams.c;
    this.customerId = this.$stateParams.r;
    this.jobId = this.$stateParams.bidId;
    this.selectedAreaBreadcrumbText = '[No Areas]';

    this.helpers({
      areaTreeData: this._areaTreeData,
      company: this._company,
      currentUserId: this._currentUserId,
      customer: this._customer,
      job: this._job,
      jobSelection: this._jobSelection,
      areaTemplate: this._areaTemplate,
      jobTemplate: this._jobTemplate,
      selections: this._selectionsCollection,
      selectionRelationships: this._selectionRelationshipsCollection,
      templateLibraries: this._templateLibrariesCollection,
      jobsTemplateLibraries: this._jobsTemplateLibrariesCollection,
      isLoggedIn: this._isLoggedIn
    });

    this.initializeCompanyId();

    this.subscribe('company', this._companySubscription.bind(this));
    this.subscribe('customer', this._customerSubscription.bind(this));
    this.subscribe('job', this._jobSubscription.bind(this));
    this.subscribe('selectionData', this._selectionDataSubscription.bind(this));
    this.subscribe('templateLibraryData', this._templateLibraryDataSubscription.bind(this));
  }

  initializeCompanyId() {
    let self = this;
    if (!this.companyId) {
      Meteor.call('companyIdsRelatedToUser', Meteor.userId(), function(err, result){
        if (err) {
          console.log('failed to get companyIdsRelatedToUser', err);
        } else {
          // console.log('success getting companyIdsRelatedToUser', result);

          self.companyId = result[0];
          // console.log(`Changed companyId to ${self.companyId}. Rerouting...`);
          self.$state.go(`bid/${self.$stateParams.bidId}`, {c: self.companyId, r: self.customerId});
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

  _areaTreeData() {
    const jobSelection = this.getReactively('jobSelection');
    const areaTemplate = this.getReactively('areaTemplate');
    let areaTreeData = [];
    let i;
    let treeItem;

    if (jobSelection && areaTemplate) {
      const childSelections = SelectionsHelper.childSelectionsWithTemplateId(jobSelection, areaTemplate.id);

      for (i = 0; i < childSelections.length; i += 1) {
        treeItem = this.addItemToTreeData(areaTreeData, childSelections[i]);
      }

      //Even the demo code did not work in attempting to expand all here rather than after a timeout
      //if (this.areaTree) {
      //    this.areaTree.expand_all();
      //}
      this.$timeout(() => {
        this.areaTree.expand_all();
        this.selectAreaTreeItem(treeItem);
      }, 50);
    }
    return areaTreeData;
  }

  getBreadcrumbText(branch, text) {
    var parent;
    if (branch && branch.label) {
      if (text && text.length > 0) {
        text = branch.label + ' / ' + text;
      } else {
        text = branch.label;
      }

      parent = this.areaTree.get_parent_branch(branch);
      if (parent) {
        text = this.getBreadcrumbText(parent, text);
      }
    }

    return text;
  }

  addItemToTreeData(areaTreeDataArray, areaSelection) {
    const areaTemplate = this.getReactively('areaTemplate');
    var i;
    var areaSelectionChildren = [];
    var treeItem = {
        data: {selectionId: areaSelection._id},
        label: areaSelection.value,
        children: areaSelectionChildren
    }
    areaTreeDataArray.push(treeItem);

    areaSelection.isAreaSelected = function () {
        return areaSelection._id === this.areaSelectedId;
    };

    const childSelections = SelectionsHelper.childSelectionsWithTemplateId(areaSelection, areaTemplate.id);

    for (i = 0; i < childSelections.length; i += 1) {
      treeItem = this.addItemToTreeData(areaSelectionChildren, childSelections[i]);
    }

    return treeItem;
  }

  _jobSelection() {
    const jobTemplate = this.getReactively('jobTemplate');
    if (jobTemplate) {
      console.log(`looking for job selection for jobTemplate.id ${jobTemplate.id}`);
      return Selections.findOne({
        jobId: this.$stateParams.bidId,
        templateId: jobTemplate.id
      });
    }
    return null;
  }

  _areaTemplate() {
    const templateLibraries = this.getReactively('templateLibraries');
    if (templateLibraries && templateLibraries.length > 0) {
      return _.find(templateLibraries[0].templates, function(template) {
        return template.templateType === Constants.templateTypes.area;
      });
    }
    return null;
  }

  _jobTemplate() {
    const templateLibraries = this.getReactively('templateLibraries');
    if (templateLibraries && templateLibraries.length > 0) {
      return _.find(templateLibraries[0].templates, function(template) {
        return template.templateType === Constants.templateTypes.job;
      });
    }
    return null;
  }

  _selectionsCollection() {
    return Selections.find({});
  }

  _selectionRelationshipsCollection() {
    return SelectionRelationships.find({});
  }

  _selectionDataSubscription() {
    return [ this.$stateParams.bidId ];
  }

  _templateLibrariesCollection() {
    return TemplateLibraries.find({});
  }

  _jobsTemplateLibrariesCollection() {
    return JobsTemplateLibraries.find({});
  }

  _templateLibraryDataSubscription() {
    return [ this.$stateParams.bidId ];
  }

  _company() {
    // console.log(`about to get companyId ${this.companyId}`);
    return Companies.findOne({ _id: this.getReactively('companyId') });
  }

  _companySubscription() {
    return [
      this.getReactively('companyId')
    ]
  }

  _customer() {
    // console.log(`about to get customerId ${this.customerId}`);
    return Meteor.users.findOne({ _id: this.getReactively('customerId') });
  }

  _customerSubscription() {
    return [
      this.getReactively('customerId')
    ]
  }

  _job() {
    // console.log(`about to get jobId ${this.jobId}`);
    return Jobs.findOne(this.$stateParams.bidId);
  }

  _jobSubscription() {
    return [ this.$stateParams.bidId ];
  }

  addArea(event) {
    if (!this.areaToAdd) {
      console.log("Please enter a name for the area and try again");
      return;
    }
    this.addAreaToArray(this.areaTreeData, this.jobSelection);
  }

  addChildArea(event) {
    if (!this.areaToAdd) {
      console.log("Please enter a name for the area and try again");
      return;
    }

    if (this.areaTree.get_selected_branch()) {
      const selection = Selections.findOne(this.areaSelectedId);
      if (selection) {
        this.areaTree.expand_branch();
        this.addAreaToArray(this.areaTree.get_selected_branch().children, data);
      } else {
        console.log(`selection ${this.areaSelectedId} not found in addChildArea`);
      }
    } else {
      console.log("An area must be selected to add a child area");
    }
  }

  addAreaToArray(areaTreeDataArray, parentSelection) {
    let treeItem;
    let newProductSelection;

    if (this.areaToAdd) {
      const areaTemplate = this.getReactively('areaTemplate');
      Meteor.call('addSelectionForTemplate', areaTemplate,
          this.areaToAdd, this.jobSelection, parentSelection,
          function(err, result) {
        if (err) {
          console.log('failed to addSelectionForTemplate get in addAreaToArray', err);
        } else {
          newProductSelection = result;
          treeItem = addItemToTreeData(areaTreeDataArray, newProductSelection);
          selectAreaTreeItem(treeItem);
          this.areaToAdd = null;
        }
      });
    }
  }

  deleteArea() {
    var selectedBranch = this.areaTree.get_selected_branch && this.areaTree.get_selected_branch();
    if (selectedBranch) {
      bootstrapDialog.confirmationDialog("Delete area and its selections", "Are you sure you want to delete '" + selectedBranch.label + "' and its selections and child areas?")
      .then(confirmDelete, cancelDelete);
    } else {
      console.log("An area must be selected to delete");
    }

    function cancelDelete() {
    }

    function confirmDelete() {
      const selection = Selections.findOne(this.areaSelectedId);
      if (selection) {
        var parentBranch = this.areaTree.get_parent_branch(selectedBranch);
        var parentBranchChildren = parentBranch ? parentBranch.children : this.areaTreeData;
        var index;
        var branchToSelect;

        Meteor.call('deleteSelectionAndRelated', selection, function(err, result){
          if (err) {
            console.log('failed to deleteSelectionAndRelated', err);
          } else {
            // console.log('success getting companyIdsRelatedToUser', result);
            index = parentBranchChildren.indexOf(selectedBranch);
            if (index > -1) {
              parentBranchChildren.splice(index, 1);
              //Select the branch that was the next sibling after the one deleted or the one before or the parent branch or nothing
              branchToSelect = parentBranchChildren.length > 0 ? parentBranchChildren[Math.min(index, parentBranchChildren.length - 1)] : parentBranch;
              if (branchToSelect) {
                this.areaTree.select_branch(branchToSelect);
              } else {
                this.areaTree.select_branch(null);
                this.onAreaTreeItemSelected(null);
              }
            }
          }
        });
      }
    }
  }

  addArea(event) {
    if (!this.areaToAdd) {
      console.log("Please enter a name for the area and try again");
      return;
    }
    this.addAreaToArray(this.areaTreeData, this.jobSelection);
  }

  addChildArea(event) {
    if (!this.areaToAdd) {
      console.log("Please enter a name for the area and try again");
      return;
    }

    if (this.areaTree.get_selected_branch()) {
      datacontext.getEntityById(model.entityNames.selection, this.areaSelectedId)
      .then(function (data) {
        this.areaTree.expand_branch();
        this.addAreaToArray(this.areaTree.get_selected_branch().children, data);
      }, failure);
    } else {
      console.log("An area must be selected to add a child area");
    }
  }

  addAreaToArray(areaTreeDataArray, parentSelection) {
    var treeItem;
    var newProductSelection;

    if (this.areaToAdd) {
      newProductSelection = datacontext.addSelectionForTemplate(areaTemplate, this.areaToAdd, this.jobSelection, parentSelection);
      save()
      .then(function () {
        treeItem = addItemToTreeData(areaTreeDataArray, newProductSelection);
        this.selectAreaTreeItem(treeItem);
        this.areaToAdd = null;
      }, failure);
    }
  }

  selectAreaTreeItem(treeItem) {
    this.areaTree.select_branch(treeItem);
  }

  onAreaTreeItemSelected(branch) {
    var breadcrumbText = '';
    this.areaSelectedId = branch ? branch.data.selectionId : 0;
    this.selectedAreaBreadcrumbText = this.getBreadcrumbText(branch, breadcrumbText);

    if (this.selectedAreaBreadcrumbText.length == 0) {
      this.selectedAreaBreadcrumbText = '[No Areas]';
    }
  }
}
