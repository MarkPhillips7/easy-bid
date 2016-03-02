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
    this.itemIdsSelected = [];
    this.perPage = 50;
    this.page = 1;

    this.areaSelectedId = '';
    this.areaTemplate = null;
    this.areaToAdd = '';
    this.areaTree = {};
    this.areaTreeData = [];
    this.bootstrapDialog = bootstrapDialog;
    this.columnTemplates = [];
    this.companyId = this.$stateParams.c;
    this.customerId = this.$stateParams.r;
    this.includeChildAreas = false;
    this.jobId = this.$stateParams.bidId;
    this.jobSelection = null;
    this.jobTemplate = null;
    // metadata used to keep track of ui state of various data
    this.metadata = SelectionsHelper.getInitializedMetadata();
    this.productSelectionTemplate = null;
    this.selectedAreaBreadcrumbText = '[No Areas]';
    this.selectedProductSelectionId = '';
    this.subscriptionsReady = {};
    this.productSelections = [];

    this.helpers({
      areAnyItemsSelected: this._areAnyItemsSelected,
      notShownSelectedCount: this._notShownSelectedCount,
      company: this._company,
      currentUserId: this._currentUserId,
      customer: this._customer,
      job: this._job,
      selections: this._selectionsCollection,
      selectionRelationships: this._selectionRelationshipsCollection,
      templateLibraries: this._templateLibrariesCollection,
      jobsTemplateLibraries: this._jobsTemplateLibrariesCollection,
      isLoggedIn: this._isLoggedIn,
      updateDependencies: this._updateDependencies
    });

    this.initializeCompanyId();

    this.subscribe('company', this._companySubscription.bind(this), {
      onReady: () => {this.subscriptionsReady.company = true;}});
    this.subscribe('customer', this._customerSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady.customer = true;}});
    this.subscribe('job', this._jobSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady.job = true;}});
    this.subscribe('selectionData', this._selectionDataSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady.selectionData = true;}});
    this.subscribe('templateLibraryData', this._templateLibraryDataSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady.templateLibraryData = true;}});
  }

  pageChanged(newPage) {
    this.page = newPage;
  };

  // allSubscriptionsReady() {
  //   const {company, customer, job, selectionData, templateLibraryData} = this.subscriptionsReady;
  //   return company && customer && job && selectionData && templateLibraryData;
  // }

  // update pretty much all state dependent on subscriptions
  _updateDependencies() {
    if (!this.getReactively('subscriptionsReady.templateLibraryData')) {
      return;
    }
    this.initializeTemplateVariables();

    if (!this.getReactively('subscriptionsReady.selectionData')
        || !this.getReactively('subscriptionsReady.job')) {
      return;
    }
    this.initializeSelectionVariables();
  }

  getTemplatesByTemplateSetting(templateSettingKey, templateSettingValue) {
    let templates = TemplateLibrariesHelper.getTemplatesByTemplateSetting(
      this.templateLibraries, templateSettingKey, templateSettingValue);
    return _.sortBy(templates, (template) => {
      const displayOrder = TemplateLibrariesHelper.getTemplateSettingByTemplateAndKeyAndIndex(template, 'DisplayOrder', 0);
      return Number(displayOrder);
    });
  };

  initializeTemplateVariables() {
    this.areaTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.area);
    this.jobTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.job);
    this.productSelectionTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.productSelection);
    this.columnTemplates = this.getTemplatesByTemplateSetting('DisplayCategory', 'PrimaryTableColumn');
  }

  confirmSaveChanges() {
    const pendingSelectionChangeMessages = SelectionsHelper.getPendingChangeMessages(this.templateLibraries,
      this.selections, this.selectionRelationships, this.metadata);
    const pendingJobChangeMessages = JobsHelper.getPendingChangeMessages(this.job);
    const pendingChangeMessages = [...pendingJobChangeMessages, ...pendingSelectionChangeMessages];
    if (pendingChangeMessages && pendingChangeMessages.length > 0) {
      const cancelSave = (err) => {
        if (err) {
          console.log(err);
        }
      }

      const confirmSave = () => {
        Meteor.call('saveSelectionChanges', this.job,
          _.filter(this.selections, (selection) => this.metadata.pendingSelectionChanges[selection._id]),
          function(err, result) {
          if (err) {
            console.log('failed to save selection changes', err);
          } else {
            console.log('success saving selection changes', result);
          }
        });
      }

      this.bootstrapDialog.confirmationListDialog("Pending changes need to be saved",
          `Are you sure you want to apply the following changes?`, pendingChangeMessages)
        .then(confirmSave, cancelSave);
    }
  }

  getJobSubtotal = () => {
    const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName('jobSubtotal');
    const variableCollectorSelection = SelectionsHelper.getVariableCollectorSelection(
      this.templateLibraries, this.selections, this.selectionRelationships, this.jobSelection);
    if (!variableCollectorSelection) {
      return null;
    }

    return this.metadata.variables[variableCollectorSelection._id] &&
        this.metadata.variables[variableCollectorSelection._id][jsonVariableName];
        //parseFloat(this.metadata.variables[variableCollectorSelection._id][jsonVariableName]);
  };

  initializeJobVariables() {
    this.job.estimateTotal = this.getJobSubtotal();
  }

  initializeSelectionVariables() {
    this.jobSelection = SelectionsHelper.getSelectionByTemplate(this.selections, this.jobTemplate);
    this.productSelections = _.filter(this.selections, (selection) => {
        return (selection.templateId === this.productSelectionTemplate.id);
    });

    SelectionsHelper.initializeSelectionVariables(this.templateLibraries, this.selections, this.selectionRelationships, this.metadata);

    this.initializeJobVariables();

    this.confirmSaveChanges();

    _.each(this.productSelections, this.setProductSelectionSelections.bind(this));

    //Initialize first selection as selected
    if (this.productSelections.length > 0) {
      this.selectedProductSelectionId = this.productSelections[0]._id;
    }

    this.setAreaTreeData();
  }

  getSelectionsBySelectionParentAndTemplate(productSelection, columnTemplate) {
    let selections = [];
    _.each(this.templateLibraries, (templateLibrary) => {
      selections = selections.concat(SelectionsHelper.getSelectionsBySelectionParentAndTemplate(
        templateLibrary, this.selections, this.selectionRelationships, productSelection, columnTemplate));
    });
    return selections;
  }

  setProductSelectionSelections(productSelection) {
    let columnSelections = [];
    this.metadata.columnSelections[productSelection._id] = columnSelections;

    const setColumnSelection = (columnTemplate) => {
      var selections = this.getSelectionsBySelectionParentAndTemplate(productSelection, columnTemplate);
      var selection;

      //If there is no selection then just create a blank one
      if (selections && selections.length === 0) {
        selection = {
          jobId: this.jobId,
          templateLibraryId: columnTemplate.templateLibraryId,
          templateId: columnTemplate.id,
          value: ''
        };
      }
      // Otherwise there must just be one selection or something went wrong
      else if (selections && selections.length !== 1) {
          throw new Error('Error: There must be exactly one selection for the given productSelection and columnTemplate');
      }
      else {
          selection = selections[0];
      }

      columnSelections.push(selection);
    }

    _.each(this.columnTemplates, setColumnSelection.bind(this));
  }

  _areAnyItemsSelected() {
    return this.getReactively('itemIdsSelected').length;
  };

  _notShownSelectedCount() {
    const itemIdsSelected = this.getReactively('itemIdsSelected');
    let shownCount = 0;
    const self = this;
    _.each(itemIdsSelected, (itemIdSelected) => {
      shownCount += _.some(self.productSelections, (productSelection) => productSelection._id === itemIdSelected) ? 1 : 0;
    });

    return itemIdsSelected.length - shownCount;
  }

  isItemSelected(itemId) {
    const idIndex = _.indexOf(this.itemIdsSelected, itemId);
    return idIndex != -1;
  }

  toggleItemSelection(itemId) {
    const idIndex = _.indexOf(this.itemIdsSelected, itemId);

    if (idIndex === -1) {
      this.itemIdsSelected = [...this.itemIdsSelected, itemId];
    } else {
      this.itemIdsSelected = [
        ...this.itemIdsSelected.slice(0, idIndex),
        ...this.itemIdsSelected.slice(idIndex + 1)
      ];
    }
  }

  initializeCompanyId() {
    if (!this.companyId) {
      Meteor.call('companyIdsRelatedToUser', Meteor.userId(), (err, result) => {
        if (err) {
          console.log('failed to get companyIdsRelatedToUser', err);
        } else {
          // console.log('success getting companyIdsRelatedToUser', result);

          this.companyId = result[0];
          // console.log(`Changed companyId to ${self.companyId}. Rerouting...`);
          this.$state.go(`bid/${self.$stateParams.bidId}`, {c: this.companyId, r: this.customerId});
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

  getFirstTreeLeaf(treeItems) {
    if (treeItems && treeItems[0]) {
      return treeItems[0].children && treeItems[0].children[0]
          ? this.getFirstTreeLeaf(treeItems[0].children)
          : treeItems[0];
    }
    return null;
  }

  getTreeItemSelected(treeItems) {
    if (treeItems) {
      let selectedTreeItem = _.find(treeItems, (treeItem) => treeItem.data.selectionId === this.areaSelectedId);
      if (selectedTreeItem) {
        return selectedTreeItem;
      }
      _.each(treeItems, (treeItem) => {
        selectedTreeItem = this.getTreeItemSelected(treeItem.children);
        if (selectedTreeItem) {
          return selectedTreeItem;
        }
      })
    }
    return null;
  }

  // Cannot use _.isEqual because tree data in use will include properties
  // like expanded and uid that would not be in pending tree data
  isTreeDataEqual(a, b) {
    const _isItemEqual = (itemA, itemB) => {
      return (itemA && itemA.data && itemA.data.selectionId &&
        itemB && itemB.data && itemB.data.selectionId &&
        itemA.data.selectionId === itemB.data.selectionId &&
        this.isTreeDataEqual(itemA.children, itemB.children));
    };

    if (!(a && b && a.length === b.length)) {
      return false;
    }
    for (let index = 0; index < a.length; index = index + 1) {
      if (!_isItemEqual(a[index], b[index])) {
        return false;
      }
    }
    return true;
  }

  setAreaTreeData() {
    const pendingAreaTreeData = this.getPendingAreaTreeData();
    const treeItemSelected = this.getTreeItemSelected(pendingAreaTreeData);
    if (!this.isTreeDataEqual(this.areaTreeData, pendingAreaTreeData)) {
      this.areaTreeData = pendingAreaTreeData;
      const treeItemToSelect = treeItemSelected || this.getFirstTreeLeaf(this.areaTreeData);
      //Even the demo code did not work in attempting to expand all here rather than after a timeout
      //if (this.areaTree) {
      //    this.areaTree.expand_all();
      //}
      this.$timeout(() => {
        this.areaTree.expand_all();
        this.selectAreaTreeItem(treeItemToSelect);
      }, 50);
    }
  }

  getPendingAreaTreeData() {
    const jobSelection = this.jobSelection;
    const areaTemplate = this.areaTemplate;
    let pendingAreaTreeData = [];
    let treeItemSelected = null;
    let i;

    if (jobSelection && areaTemplate) {
      const childSelections = SelectionsHelper.getChildSelectionsWithTemplateId(jobSelection, areaTemplate.id);

      for (i = 0; i < childSelections.length; i += 1) {
        const childSelection = childSelections[i];
        this.addItemToTreeData(pendingAreaTreeData, childSelection);
      }
    }
    return pendingAreaTreeData;
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

  selectionShouldDisplay(selection) {
    return this.inSelectedArea(selection);
  }

  toggleIncludeChildAreas() {
    this.includeChildAreas = !this.includeChildAreas;
  }

  inSelectedArea(selection) {
    if (selection._id === this.areaSelectedId) {
      return true;
    }

    if (!this.getReactively('includeChildAreas')) {
      const selectionTemplate = TemplateLibrariesHelper.getTemplateById(this.templateLibraries, selection.templateId);
      if (selectionTemplate.templateType === Constants.templateTypes.area) {
        return false;
      }
    }

    const parentSelection = SelectionsHelper.getParentSelections(selection)[0];
    return parentSelection && this.inSelectedArea(parentSelection);
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

    const childSelections = SelectionsHelper.getChildSelectionsWithTemplateId(areaSelection, areaTemplate.id);

    for (i = 0; i < childSelections.length; i += 1) {
      treeItem = this.addItemToTreeData(areaSelectionChildren, childSelections[i]);
    }

    return treeItem;
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
        this.addAreaToArray(this.areaTree.get_selected_branch().children, selection);
      } else {
        console.log(`selection ${this.areaSelectedId} not found in addChildArea`);
      }
    } else {
      console.log("An area must be selected to add a child area");
    }
  }

  addAreaToArray(areaTreeDataArray, parentSelection) {
    let treeItem;
    let newSelection;
    if (this.areaToAdd) {
      const areaTemplate = this.getReactively('areaTemplate');
      Meteor.call('addSelectionForTemplate', this.templateLibraries[0], this.jobId, areaTemplate,
          this.areaToAdd, parentSelection, 0, (err, result) => {
        if (err) {
          console.log('failed to addSelectionForTemplate get in addAreaToArray', err);
        } else {
          newSelection = result;
          treeItem = this.addItemToTreeData(areaTreeDataArray, newSelection);
          this.selectAreaTreeItem(treeItem);
          this.areaToAdd = null;
        }
      });
    }
  }

  deleteArea() {
    let cancelDelete = () => {};

    let confirmDelete = () => {
      const selection = Selections.findOne(this.areaSelectedId);
      if (selection) {
        var parentBranch = this.areaTree.get_parent_branch(selectedBranch);
        var parentBranchChildren = parentBranch ? parentBranch.children : this.areaTreeData;
        var index;
        var branchToSelect;

        Meteor.call('deleteSelectionAndRelated', selection, (err, result) => {
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
    };

    var selectedBranch = this.areaTree.get_selected_branch && this.areaTree.get_selected_branch();
    if (selectedBranch) {
      this.bootstrapDialog.confirmationDialog("Delete area and its selections", "Are you sure you want to delete '" + selectedBranch.label + "' and its selections and child areas?")
      .then(confirmDelete, cancelDelete);
    } else {
      console.log("An area must be selected to delete");
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

  subtotalSelections(selections, onlyIfShouldDisplay) {
    const selectionsToSum = _.filter(selections, (selection) =>
        !onlyIfShouldDisplay || this.selectionShouldDisplay(selection));

    const subtotal = SelectionsHelper.sumSelections(this.templateLibraries,
      this.selections, this.selectionRelationships, this.metadata, selectionsToSum, 'priceTotal');

    return Filters.unitsFilter(subtotal, '$');
  }

  getSelectionTemplateName(selection) {
    const template = TemplateLibrariesHelper.getTemplateById(this.templateLibraries, selection.templateId);
    if (template) {
      return `${template.name}`;
    }
    return ``;
  }

  getTitle(productSelection) {
    if (!productSelection) {
      return '';
    }
    const columnSelections = this.metadata.columnSelections[productSelection._id];

    if (columnSelections.length > 2) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, columnSelections[0]);
    }
    return '';
  }

  getMainSelectionContent(productSelection) {
    if (!productSelection) {
      return '';
    }
    const columnSelections = this.metadata.columnSelections[productSelection._id];

    if (columnSelections.length > 7) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, columnSelections[5])
        + ' x ' + SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, columnSelections[6])
        + ' x ' + SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, columnSelections[7]);
    }
    return '';
  }

  getPriceTotal(productSelection) {
    if (!productSelection) {
      return '';
    }
    const columnSelections = this.metadata.columnSelections[productSelection._id];

    if (columnSelections.length > 2) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, columnSelections[2]);
    }
    return '';
  }

  getPriceEach(productSelection) {
    if (!productSelection) {
      return '';
    }
    const columnSelections = this.metadata.columnSelections[productSelection._id];

    if (columnSelections.length > 2) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, columnSelections[1]);
    }
    return '';
  }

  getQuantity(productSelection) {
    if (!productSelection) {
      return '';
    }
    const columnSelections = this.metadata.columnSelections[productSelection._id];

    if (columnSelections[4]) {
      return columnSelections[4].value;
    }
    return '';
  }

  getProductImage(productSelection) {
    if (!productSelection) {
      return '';
    }
    const columnSelections = this.metadata.columnSelections[productSelection._id];

    if (columnSelections[0]) {
      const imageFileSetting = TemplateLibrariesHelper.getTemplateSettingByKeyAndIndex(
        this.templateLibraries, columnSelections[0].templateId, Constants.templateSettingKeys.imageSource, 0
      );
      return imageFileSetting ? imageFileSetting.value : '';
    }
    return '';
  }
}
