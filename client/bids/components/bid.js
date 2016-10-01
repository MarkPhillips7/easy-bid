import {
  Component, View, SetModule, Inject, MeteorReactive, LocalInjectables, init
} from 'angular2-now';
init();
SetModule('app');

@Component({
  selector: 'bid'
})
@View({
  templateUrl: () => 'client/bids/views/bid.html'
})
@Inject('$modal', '$scope', '$state', '$stateParams', '$timeout', 'bootstrap.dialog', 'toastr')
@MeteorReactive
@LocalInjectables
class bid {
  constructor($modal, $scope, $state, $stateParams, $timeout, bootstrapDialog, toastr) {
    this.itemIdsSelected = [];
    this.perPage = 50;
    this.page = 1;

    this.areaSelectedId = '';
    this.areaTemplate = null;
    this.areaToAdd = '';
    // this.areaTree = {};
    this.areaTreeData = [];
    this.bootstrapDialog = bootstrapDialog;
    this.columnTemplates = [];
    this.companyId = this.$stateParams.c;
    this.companyTemplate = null;
    this.customerId = this.$stateParams.r;
    this.customerTemplate = null;
    this.fullHierarchyTree = {};
    this.fullHierarchyTreeData = [];
    this.ignoreUpdatesTemporarily = false;
    this.ignoreSelectionUpdatesTemporarily = true;
    this.includeChildAreas = false;
    this.isNew = this.$stateParams.bidId.toLowerCase() === 'new';
    this.jobId = this.$stateParams.bidId;
    this.jobSelection = null;
    this.jobTemplate = null;
    this.lookupData = null;
    // metadata used to keep track of ui state of various data
    this.metadata = SelectionsHelper.getInitializedMetadata();
    this.productCategories = [];
    this.productOptions = [];
    this.productSelectionTemplate = null;
    this.productSelectionIdToEdit = null;
    this.deleteProductSelectionOnCancel = false;
    this.productTemplate = null;
    this.productToAdd = null;
    this.productTypeaheadText = '';
    this.selectedAreaBreadcrumbText = '[No Areas]';
    this.selectedProductSelectionId = '';
    this.productSelectionIds = [];
    this.productSelectionEditItems = [];
    this.productSelectionItems = [];
    this.tabs = [];
    this.toastr = toastr;
    this.areaTreeOptions = {
      allowDeselect: false,
      nodeChildren: "children",
      dirSelectable: true,
      dirExpandDisabled: false, // will only work if https://github.com/wix/angular-tree-control/pull/233 gets included
      injectClasses: {
        ul: "a1",
        li: "a2",
        liSelected: "a7",
        iExpanded: "a3",
        iCollapsed: "a4",
        iLeaf: "a5",
        label: "a6",
        labelSelected: "a8"
      },
      isSelectable: (node) => node.isSelectable,
    };
    this.expandedNodes = [];
    this.selectedNode = null;
    this.metadataHtml = '';
    this.subscriptionsReady = 0;

    this.initializeCompanyId();

    // Careful: onReady does not get called if a subscription is already ready (https://github.com/meteor/meteor/issues/1173)
    this.companySubscriptionHandle = this.subscribe('company', this._companySubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
    this.customerSubscriptionHandle = this.subscribe('user', this._customerSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
    this.jobSubscriptionHandle = this.subscribe('job', this._jobSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
    this.selectionDataSubscriptionHandle = this.subscribe('selectionData', this._selectionDataSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});
    this.templateLibraryDataSubscriptionHandle = this.subscribe('templateLibraryData', this._templateLibraryDataSubscription.bind(this), {
      onReady: () => {this.subscriptionsReady = this.subscriptionsReady + 1;},
      onStop: (error) => {
        if (error) {console.log(error);}
      }});

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
      updateDependencies: this._updateDependencies,
      updateSelectionDependencies: this._updateSelectionDependencies,
    });
  }

  pageChanged(newPage) {
    this.page = newPage;
  };

  // update pretty much all state dependent on subscriptions
  _updateDependencies() {
    console.log(`maybe updating dependencies ${this.getReactively('subscriptionsReady')}`);
    if (this.ignoreUpdatesTemporarily || this.getReactively('subscriptionsReady') === 0) {
      return;
    }

    if (!this.templateLibraryDataSubscriptionHandle || !this.templateLibraryDataSubscriptionHandle.ready()) {
      return;
    }
    SelectionsHelper.initializeMetadata(this.metadata);
    this.initializeTemplateVariables();

    if (!this.selectionDataSubscriptionHandle || !this.selectionDataSubscriptionHandle.ready()
        || !this.jobSubscriptionHandle || !this.jobSubscriptionHandle.ready()
        || !this.companySubscriptionHandle || !this.companySubscriptionHandle.ready()
      ) {
      return;
    }

    Meteor.call('loadLookupData', this.templateLibraries, (err, result) => {
      if (err) {
        console.log('failed to loadLookupData', err);
      } else {
        // console.log('success getting companyIdsRelatedToUser', result);
        this.lookupData = result;
        console.log('updating dependencies');
        this.ignoreSelectionUpdatesTemporarily = false;
        if (this.isNew) {
          this.editBidDetails();
        } else {
          this.initializeSelectionVariables();
          this.initializeAfterSelectionVariablesOneTime();
        }
      }
    });
  }

  _updateSelectionDependencies() {
    this.getReactively(`selections`, true);
    if (!this.isNew) {
      if (!this.getReactively('ignoreSelectionUpdatesTemporarily')) {
        console.log('updating selection dependencies');
        this.initializeSelectionVariables();
      }
    }
  }

  getTemplatesByTemplateSetting(templateSettingKey, templateSettingValue) {
    let templates = TemplateLibrariesHelper.getTemplatesByTemplateSetting(
      this.templateLibraries, templateSettingKey, templateSettingValue);
    return _.sortBy(templates, (template) => {
      const displayOrder = TemplateLibrariesHelper.getTemplateSettingByTemplateAndKeyAndIndex(template, 'DisplayOrder', 0);
      return Number(displayOrder);
    });
  };

  getProductOptions(tabPageName) {
    if (!tabPageName || !this.productOptions || !this.metadata || !this.metadata.tabPages) {
      return [];
    }
    const tabPage = _.find(this.metadata.tabPages, (_tabPage) => _tabPage.name === tabPageName);
    if (!tabPage) {
      return [];
    }
    return _.filter(this.productOptions, (productOption) => {
      return _.some(tabPage.templateIds, (templateId) => templateId === productOption.id);
    });
  }

  initializeTemplateVariables() {
    this.areaTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.area);
    this.companyTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.company);
    this.customerTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.customer);
    this.jobTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.job);
    this.productSelectionTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.productSelection);
    this.productTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.baseProduct);
    this.columnTemplates = this.getTemplatesByTemplateSetting('DisplayCategory', 'PrimaryTableColumn');
    this.productCategories = [
      {
        icon: "<img src=../Content/images/Cabinet.png />",
        name: "Cabinetry",
        maker: "(Standard)",
        ticked: true
      },
      {
        icon: "<img src=../Content/images/Yellow-Smiley-128.png />",
        name: "Flooring",
        maker: "(Sand)",
        ticked: false
      }
    ];
    this.productOptions = TemplateLibrariesHelper.populateSelectOptions(this.templateLibraries, this.productTemplate,
      this.metadata, false, this.lookupData);
    TemplateLibrariesHelper.populateTabPages(this.templateLibraries, this.productTemplate, this.metadata);
  }

  cancel() {
    this.ignoreUpdatesTemporarily = false;
  }

  save(job, selections, selectionRelationships, metadata) {
    this.ignoreUpdatesTemporarily = false;
    const selectionsToInsertOrUpdate = _.filter(selections, (selection) => metadata.pendingSelectionChanges[selection._id]
        && metadata.pendingSelectionChanges[selection._id].displayMessages
        && metadata.pendingSelectionChanges[selection._id].displayMessages.length > 0);
    Meteor.call('saveSelectionChanges', this.templateLibraries, job,
      selectionsToInsertOrUpdate,
      _.difference(_.map(this.selections, (selection) => selection._id), _.map(selections, (selection) => selection._id)),
      selectionRelationships,
      _.difference(_.map(this.selectionRelationships, (relationship) => relationship._id), _.map(selectionRelationships, (relationship) => relationship._id)),
      this.lookupData,
      this.isNew,
      (err, result) => {
      if (err) {
        console.log('failed to save selection changes', err);
      } else {
        console.log('success saving selection changes', result);
        if (this.isNew) {
          this.$state.go(`bid`, {bidId: job._id, c: job.companyId, r: job.customerId});
        }
        SelectionsHelper.initializePendingSelectionChanges(this.metadata);
      }
    });
  }

  confirmSaveChanges(job, selections, selectionRelationships, metadata, saveWithoutPrompting = false) {
    const pendingSelectionChangeMessages = SelectionsHelper.getPendingChangeMessages(this.templateLibraries,
      selections, selectionRelationships, metadata);
    const pendingJobChangeMessages = JobsHelper.getPendingChangeMessages(job);
    const pendingChangeMessages = [...pendingJobChangeMessages, ...pendingSelectionChangeMessages];
    if (pendingChangeMessages && pendingChangeMessages.length > 0) {
      const cancelSave = (err) => {
        this.cancel();
        if (err) {
          console.log(err);
        }
      }

      const confirmSave = () => {
        this.save(job, selections, selectionRelationships, metadata);
      }

      if (saveWithoutPrompting) {
        this.save(job, selections, selectionRelationships, metadata);
      } else {
        this.bootstrapDialog.confirmationListDialog("Pending changes need to be saved",
            `Are you sure you want to apply the following changes?`, pendingChangeMessages)
          .then(confirmSave, cancelSave);
      }
    }
  }

  getJobSubtotal = (metadata, selections, selectionRelationships) => {
    const jobSelection = SelectionsHelper.getSelectionByTemplate(selections, this.jobTemplate);
    const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName('jobSubtotal');
    const variableCollectorSelection = SelectionsHelper.getVariableCollectorSelection(
      this.templateLibraries, selections, selectionRelationships, jobSelection);
    if (!variableCollectorSelection) {
      return null;
    }

    return metadata.variables[variableCollectorSelection._id] &&
        metadata.variables[variableCollectorSelection._id][jsonVariableName];
  };

  initializeJobVariables(job, metadata, selections, selectionRelationships) {
    job.estimateTotal = this.getJobSubtotal(metadata, selections, selectionRelationships);
  }

  updateProductSelectionIds() {
    // must not change reference to this.productSelectionIds or ng-repeat won't work (actually not sure about this).
    // So first add selections that are missing
    _.chain(this.selections)
      .filter((selection) => selection.templateId === this.productSelectionTemplate.id &&
        !_.contains(this.productSelectionIds, selection._id))
      .each((selection) => {
        this.productSelectionIds.push(selection._id);
      });
    // Now remove selections that are missing
    let index;
    for (index = 0; index < this.productSelectionIds.length; ) {
      if (!_.find(this.selections, (selection) => selection._id === this.productSelectionIds[index])) {
        this.productSelectionIds.splice(index, 1);
        // no need to increment index since item at index has been removed
      } else {
        index = index + 1;
      }
    }
    // Actually changing the above to not change reference to this.productSelectionIds
    // did not seem to help. But this did the trick:
    // this.$scope.$apply();
    // But calling $apply caused problems and then seemed unnecessary.
  }

  initializeSelectionVariables() {
    this.jobSelection = SelectionsHelper.getSelectionByTemplate(this.selections, this.jobTemplate);
    this.updateProductSelectionIds();
    _.each(this.productSelectionIds, (productSelectionId) => this.setProductSelectionSelections(productSelectionId, this));
    SelectionsHelper.initializeSelectionVariables(this.templateLibraries, this.selections, this.selectionRelationships, this.metadata, this.lookupData);
    this.initializeJobVariables(this.job, this.metadata, this.selections, this.selectionRelationships);
  }

  initializeAfterSelectionVariablesOneTime() {
    this.confirmSaveChanges(this.job, this.selections, this.selectionRelationships, this.metadata, false);

    //Initialize first selection as selected if none currently selected
    if (this.productSelectionIds.length > 0 && !this.selectedProductSelectionId) {
      this.selectedProductSelectionId = this.productSelectionIds[0]._id;
    }
    if (this.productSelectionIdToEdit) {
      this.editProductSelection(this.productSelectionIdToEdit, null, this.deleteProductSelectionOnCancel);
      this.productSelectionIdToEdit = null;
      this.deleteProductSelectionOnCancel = false;
    }

    this.setAreaTreeData();
    this.setFullHierarchyTreeData();
  }

  getSelectionsBySelectionParentAndTemplate(productSelectionId, columnTemplate, {selections, selectionRelationships}) {
    let _selections = [];
    _.each(this.templateLibraries, (templateLibrary) => {
      _selections = _selections.concat(SelectionsHelper.getSelectionsBySelectionParentAndTemplate(
        templateLibrary, selections, selectionRelationships, productSelectionId, columnTemplate));
    });
    return _selections;
  }

  setProductSelectionSelections(productSelectionId, {selections, selectionRelationships, metadata}) {
    let columnSelectionIds = [];
    metadata.columnSelectionIds[productSelectionId] = columnSelectionIds;

    const setColumnSelection = (columnTemplate) => {
      var productSelections = this.getSelectionsBySelectionParentAndTemplate(productSelectionId, columnTemplate,
        {selections, selectionRelationships});
      let selection;

      //If there is no selection then just create a blank one
      if (productSelections && productSelections.length === 0) {
        selection = SelectionsHelper.addSelectionForTemplate(this.templateLibraries[0], selections, selectionRelationships,
            metadata, this.jobId, columnTemplate, '', productSelectionId, 0, this.lookupData);
      }
      // Otherwise there must just be one selection or something went wrong
      else if (productSelections && productSelections.length !== 1) {
        throw new Error('Error: There must be exactly one selection for the given productSelection and columnTemplate');
      }
      else {
        selection = productSelections[0];
      }

      if (selection) {
        columnSelectionIds.push(selection._id);
      }
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
      shownCount += _.some(self.productSelectionIds, (productSelectionId) => productSelectionId === itemIdSelected) ? 1 : 0;
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
          // console.log(`Changed companyId to ${this.companyId}. Rerouting...`);
          this.$state.go(`bid`, {bidId: this.$stateParams.bidId, c: this.companyId, r: this.customerId});
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

  populateAllExpandableNodes(treeDataArray, expandableNodes) {
    _.each(treeDataArray, (treeDataItem) => {
      if (treeDataItem.children && treeDataItem.children.length > 0) {
        expandableNodes.push(treeDataItem);
        this.populateAllExpandableNodes(treeDataItem.children, expandableNodes);
      }
    });
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
      // this.$timeout(() => {
      //   this.areaTree.expand_all();
      //   this.selectAreaTreeItem(treeItemToSelect);
      // }, 100);
      let expandableNodes = [];
      this.populateAllExpandableNodes(this.areaTreeData, expandableNodes);
      this.expandedNodes = expandableNodes;
      this.selectedNode = treeItemToSelect;
      this.onAreaTreeItemSelected(this.selectedNode);
    }
  }

  getPendingAreaTreeData() {
    const jobSelection = this.jobSelection;
    const areaTemplate = this.areaTemplate;
    let pendingAreaTreeData = [];
    let treeItemSelected = null;
    let i;

    if (jobSelection && areaTemplate) {
      this.addItemToTreeData(pendingAreaTreeData, jobSelection, true);
    }
    return pendingAreaTreeData;
  }

  getBranchBySelectionIdAndTreeDataArray(selectionId, treeDataArray) {
    let branch;
    _.find(treeDataArray, (treeDataItem) => {
      if (treeDataItem.data.selectionId === selectionId) {
        branch = treeDataItem;
        return branch;
      }
      branch = this.getBranchBySelectionIdAndTreeDataArray(selectionId, treeDataItem.children);
      return branch;
    });
    return branch;
  }

  getBranchBySelectionId(selectionId) {
    return this.getBranchBySelectionIdAndTreeDataArray(selectionId, this.areaTreeData);
  }

  getParentBranch(branch, treeDataArray) {
    let parentBranch = _.find(treeDataArray, (treeDataItem) => {
      return _.find(treeDataItem.children, (childItem) => childItem === branch);
    });
    if (parentBranch) {
      return parentBranch;
    }
    _.find(treeDataArray, (treeDataItem) => {
      parentBranch = this.getParentBranch(branch, treeDataItem.children);
      return parentBranch;
    });
    return parentBranch;
  }

  getBreadcrumbText(branch, text) {
    var parent;
    if (branch && branch.label) {
      if (text && text.length > 0) {
        text = branch.label + ' / ' + text;
      } else {
        text = branch.label;
      }

      // parent = this.areaTree.get_parent_branch(branch);
      const parent = this.getParentBranch(branch, this.areaTreeData);
      if (parent) {
        text = this.getBreadcrumbText(parent, text);
      }
    }

    return text;
  }

  selectionShouldDisplay(selectionId) {
    return this.inSelectedArea(selectionId);
  }

  toggleIncludeChildAreas() {
    this.includeChildAreas = !this.includeChildAreas;
  }

  inSelectedArea(selectionId) {
    if (selectionId === this.areaSelectedId) {
      return true;
    }

    const selection = _.find(this.selections, (_selection) => _selection._id === selectionId);
    if (!selection) {
      return false;
    }

    if (!this.getReactively('includeChildAreas')) {
      const selectionTemplate = TemplateLibrariesHelper.getTemplateById(this.templateLibraries, selection.templateId);
      if (selectionTemplate.templateType === Constants.templateTypes.area) {
        return false;
      }
    }

    const parentSelection = SelectionsHelper.getParentSelections(selection, this.selections, this.selectionRelationships)[0];
    return parentSelection && this.inSelectedArea(parentSelection._id);
  }

  updateSpecifications(treeItem, pendingChanges) {
    const areaSelection = _.find(this.selections, (selection) => selection._id === treeItem.data.selectionId);
    const templatesForTabs = TemplateLibrariesHelper.getTemplatesForTabs(pendingChanges, this.templateLibraries, areaSelection._id);
    const applicableSpecificationGroupTemplates =
      _.filter(templatesForTabs, (template) => template.templateType === Constants.templateTypes.specificationGroup);
    const specifications = SelectionsHelper.getSpecificationListInfo(this.templateLibraries, pendingChanges,
      this.lookupData, applicableSpecificationGroupTemplates, areaSelection);
    treeItem.specifications = specifications;

    if (treeItem.children) {
      _.each(treeItem.children, (_treeItem) => {
        this.updateSpecifications(_treeItem, pendingChanges);
      });
    }
  }

  updateSpecificationsForAreaTreeData(pendingChanges) {
    _.each(this.areaTreeData, (treeItem) => {
      this.updateSpecifications(treeItem, pendingChanges);
    });
  }

  addItemToTreeData(areaTreeDataArray, selection, isJobTreeItem) {
    const areaTemplate = this.areaTemplate;
    const pendingChanges = {
      job: this.job,
      metadata: this.metadata,
      selections: this.selections,
      selectionRelationships: this.selectionRelationships
    };
    const templatesForTabs = TemplateLibrariesHelper.getTemplatesForTabs(pendingChanges, this.templateLibraries, selection._id);
    const applicableSpecificationGroupTemplates =
      _.filter(templatesForTabs, (template) => template.templateType === Constants.templateTypes.specificationGroup);
    const specifications = SelectionsHelper.getSpecificationListInfo(this.templateLibraries, pendingChanges,
      this.lookupData, applicableSpecificationGroupTemplates, selection);
    var i;
    var selectionChildren = [];
    const treeItem = {
        data: {selectionId: selection._id},
        label: isJobTreeItem ? 'Job' : selection.value,
        isSelectable: !isJobTreeItem,
        type: isJobTreeItem ? 'job' : 'area',
        specifications,
        children: selectionChildren
    }
    areaTreeDataArray.push(treeItem);

    const childSelections = SelectionsHelper.getChildSelectionsWithTemplateId(selection, areaTemplate.id);

    for (i = 0; i < childSelections.length; i += 1) {
      this.addItemToTreeData(selectionChildren, childSelections[i], false);
    }

    return treeItem;
  }

  _selectionsCollection() {
    const selections = Selections.find({jobId: this.$stateParams.bidId});
    return selections;
  }

  _selectionRelationshipsCollection() {
    const selectionRelationships = SelectionRelationships.find({jobId: this.$stateParams.bidId});
    return selectionRelationships;
  }

  _selectionDataSubscription() {
    return [ this.$stateParams.bidId ];
  }

  _templateLibrariesCollection() {
    const templateLibraries = TemplateLibraries.find({});
    return templateLibraries;
  }

  _jobsTemplateLibrariesCollection() {
    return JobsTemplateLibraries.find({});
  }

  _templateLibraryDataSubscription() {
    return [ this.$stateParams.bidId ];
  }

  _company() {
    // console.log(`about to get companyId ${this.companyId}`);
    const company = Companies.findOne({ _id: this.getReactively('companyId') });
    return company;
  }

  _companySubscription() {
    return [
      this.getReactively('companyId')
    ]
  }

  _customer() {
    // console.log(`about to get customerId ${this.customerId}`);
    const customer = Meteor.users.findOne({ _id: this.getReactively('customerId') });
    return customer;
  }

  _customerSubscription() {
    return [
      this.getReactively('customerId')
    ]
  }

  _job() {
    return  Jobs.findOne(this.$stateParams.bidId);
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

    // if (this.areaTree.get_selected_branch()) {
    //   const selection = Selections.findOne(this.areaSelectedId);
    //   if (selection) {
    //     this.areaTree.expand_branch();
    //     this.addAreaToArray(this.areaTree.get_selected_branch().children, selection);
    //   } else {
    //     console.log(`selection ${this.areaSelectedId} not found in addChildArea`);
    //   }
    // } else {
    //   console.log("An area must be selected to add a child area");
    // }
    if (this.selectedNode) {
      const selection = Selections.findOne(this.areaSelectedId);
      if (selection) {
        this.addAreaToArray(this.selectedNode.children, selection);
        if (!_.contains(this.expandedNodes, this.selectedNode)) {
          this.expandedNodes.push(this.selectedNode);
        }
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
      const pendingChanges = this.getPendingChanges();
      const {job, metadata, selections, selectionRelationships} = pendingChanges;
      const newAreaSelection = SelectionsHelper.addSelectionForTemplate(this.templateLibraries[0],
        selections, selectionRelationships, metadata, job._id,
        this.areaTemplate, this.areaToAdd, parentSelection._id, 0, this.lookupData);
      SelectionsHelper.addSelectionsForTemplateChildren(this.templateLibraries[0],
        selections, selectionRelationships, metadata, job._id,
        newAreaSelection, this.areaTemplate, Constants.selectionAddingModes.handleAnything,
        this.areaTemplate, this.lookupData);
      SelectionsHelper.initializeSelectionVariables(this.templateLibraries, selections, selectionRelationships, metadata, this.lookupData);
      this.save(job, selections, selectionRelationships, metadata);
      // Maybe these things should not happen until the save callback?
      treeItem = this.addItemToTreeData(areaTreeDataArray, newAreaSelection);
      this.selectAreaTreeItem(treeItem);
      this.onAreaTreeItemSelected(treeItem);
      this.areaToAdd = null;
    }
  }

  deleteArea() {
    let cancelDelete = () => {};

    let confirmDelete = () => {
      const selection = Selections.findOne(this.areaSelectedId);
      if (selection) {
        const parentBranch = this.getParentBranch(this.selectedNode, this.areaTreeData);
        // var parentBranch = this.areaTree.get_parent_branch(selectedBranch);
        var parentBranchChildren = parentBranch ? parentBranch.children : this.areaTreeData;
        var index;
        var branchToSelect;

        const pendingChanges = this.getPendingChanges();
        SelectionsHelper.deleteSelectionAndRelated(this.templateLibraries, pendingChanges, this.lookupData, selection);
        const {job, metadata, selections, selectionRelationships} = pendingChanges;
        this.initializeJobVariables(job, metadata, selections, selectionRelationships);
        this.confirmSaveChanges(job, selections, selectionRelationships, metadata, true);
        index = parentBranchChildren.indexOf(this.selectedNode);
        if (index > -1) {
          parentBranchChildren.splice(index, 1);
          //Select the branch that was the next sibling after the one deleted or the one before or the parent branch or nothing
          branchToSelect = parentBranchChildren.length > 0 ? parentBranchChildren[Math.min(index, parentBranchChildren.length - 1)] : parentBranch;
          if (branchToSelect) {
            // this.areaTree.select_branch(branchToSelect);
            this.selectedNode = branchToSelect;
            this.onAreaTreeItemSelected(branchToSelect);
          } else {
            this.selectedNode = null;
            // this.areaTree.select_branch(null);
            this.onAreaTreeItemSelected(null);
          }
        }
        // Meteor.call('deleteSelectionAndRelated', selection, (err, result) => {
        //   if (err) {
        //     console.log('failed to deleteSelectionAndRelated', err);
        //   } else {
        //     // console.log('success getting companyIdsRelatedToUser', result);
        //     // index = parentBranchChildren.indexOf(selectedBranch);
        //     index = parentBranchChildren.indexOf(this.selectedNode);
        //     if (index > -1) {
        //       parentBranchChildren.splice(index, 1);
        //       //Select the branch that was the next sibling after the one deleted or the one before or the parent branch or nothing
        //       branchToSelect = parentBranchChildren.length > 0 ? parentBranchChildren[Math.min(index, parentBranchChildren.length - 1)] : parentBranch;
        //       if (branchToSelect) {
        //         // this.areaTree.select_branch(branchToSelect);
        //         this.selectedNode = branchToSelect;
        //         this.onAreaTreeItemSelected(branchToSelect);
        //       } else {
        //         this.selectedNode = null;
        //         // this.areaTree.select_branch(null);
        //         this.onAreaTreeItemSelected(null);
        //       }
        //     }
        //   }
        // });
      }
    };

    // var selectedBranch = this.areaTree.get_selected_branch && this.areaTree.get_selected_branch();
    if (this.selectedNode) {
      this.bootstrapDialog.confirmationDialog("Delete area and its selections", "Are you sure you want to delete '" +
        this.selectedNode.label + "' and its selections and child areas?")
      .then(confirmDelete, cancelDelete);
    } else {
      console.log("An area must be selected to delete");
    }
  }

  selectAreaTreeItem(treeItem) {
    this.selectedNode = treeItem;
    // this.areaTree.select_branch(treeItem);
  }

  onAreaTreeItemSelected(branch) {
    var breadcrumbText = '';
    this.areaSelectedId = branch ? branch.data.selectionId : 0;
    this.selectedAreaBreadcrumbText = this.getBreadcrumbText(branch, breadcrumbText);

    if (this.selectedAreaBreadcrumbText.length == 0) {
      this.selectedAreaBreadcrumbText = '[No Areas]';
    }
  }

  subtotalSelections(selectionIds, onlyIfShouldDisplay) {
    const selectionsToSum = _.filter(selectionIds, (selectionId) =>
        !onlyIfShouldDisplay || this.selectionShouldDisplay(selectionId));

    const subtotal = SelectionsHelper.sumSelections(this.templateLibraries,
      this.selections, this.selectionRelationships, this.metadata, this.lookupData, selectionsToSum, 'priceTotal');

    return Filters.unitsFilter(subtotal, '$');
  }

  editBidDetails(event) {
    const pendingChanges = this.getPendingChanges();
    const {job, metadata, selections, selectionRelationships} = pendingChanges;
    const modalInstance = this.$modal.open({
      templateUrl: 'client/bids/views/bid-details-edit.html',
      controller: 'bidDetails',
      size: 'lg',
      resolve: {
        'bid': () => {
          return this;
        },
        'job': () => {
          return job;
        },
      }
    });

    modalInstance.result.then((selectedItem) => {
      if (this.isNew) {
        // new job needs a company selection and all of its appropriate children down to but not including an area.
        const companySelection = SelectionsHelper.addSelectionForTemplate(this.templateLibraries[0],
          selections, selectionRelationships, metadata, job._id,
          this.companyTemplate, this.company._id, null, 0, this.lookupData);
        SelectionsHelper.addSelectionsForTemplateChildren(this.templateLibraries[0],
          selections, selectionRelationships, metadata, job._id,
          companySelection, this.companyTemplate, Constants.selectionAddingModes.handleAnything,
          this.areaTemplate, this.lookupData);
        SelectionsHelper.initializeSelectionVariables(this.templateLibraries, selections, selectionRelationships, metadata, this.lookupData);
        this.initializeJobVariables(job, metadata, selections, selectionRelationships);
        job.estimateTotal = this.getJobSubtotal(metadata, selections, selectionRelationships);
      }
      this.save(job, selections, selectionRelationships, metadata);
    }, () => {
      console.log('Modal dismissed at: ' + new Date());
      this.cancel();
    });
  }

  addProductSelectionOptionFromInput(option) {
    if (option && option.id) {
      this.addProductSelectionOption(option);
      this.productTypeaheadText = '';
    }
  };

  addProductSelectionOption(option) {
    this.productToAdd = option && TemplateLibrariesHelper.getTemplateById(this.templateLibraries, option.id);
    this.addProductSelection();
  }

  getNewJob() {
    return {
      _id: Random.id(),
      company: this.company,
      companyId: this.companyId,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      estimatorId: Meteor.userId(),
    };
  }

  getPendingChanges() {
    return {
      job: this.isNew ? this.getNewJob() : _.clone(this.job),
      metadata: JSON.parse(JSON.stringify(this.metadata)), //_.clone(this.metadata) not an option as it does not do a deep clone
      selections: JSON.parse(JSON.stringify(this.selections)), //_.map(this.selections, _.clone),
      selectionRelationships: JSON.parse(JSON.stringify(this.selectionRelationships)), //_.map(this.selectionRelationships, _.clone),
    };
  }

  addProductSelection() {
    this.ignoreUpdatesTemporarily = true;
    const parentSelectionId = this.areaSelectedId;
    const parentSelection =  _.find(this.selections, (selection) => selection._id === parentSelectionId);
    const pendingChanges = this.getPendingChanges();
    const newProductSelection = SelectionsHelper.addProductSelectionAndChildren(
      this.templateLibraries, pendingChanges, this.lookupData, parentSelection,
      this.productSelectionTemplate, this.productToAdd, 0);
    const {job, metadata, selections, selectionRelationships} = pendingChanges;

    const productSelectionIds = _.chain(selections)
      .filter((selection) => selection.templateId === this.productSelectionTemplate.id)
      .map((selection) => selection._id)
      .value();
    _.each(productSelectionIds, (productSelectionId) => this.setProductSelectionSelections(productSelectionId, pendingChanges));

    this.selectedProductSelectionId = newProductSelection._id;
    this.editProductSelection(newProductSelection._id, null, false, pendingChanges);
  }

  // ToDo: Need to call this from somewhere
  addSpecificationGroupSelection(specificationGroupTemplate, parentSelectionId, selectionValue) {
    const parentSelection =  _.find(this.selections, (selection) => selection._id === parentSelectionId);
    const pendingChanges = this.getPendingChanges();
    const newSpecificationGroupSelection = SelectionsHelper.addSpecificationGroupSelectionAndChildren(
      this.templateLibraries, pendingChanges, this.lookupData, parentSelection,
      specificationGroupTemplate, selectionValue, 0);
    const {job, metadata, selections, selectionRelationships} = pendingChanges;
    this.save(job, selections, selectionRelationships, metadata);
  }

  deleteSelected() {
    const cancelSave = (err) => {
      if (err) {
        console.log(err);
      }
    }

    const confirmSave = () => {
      this.ignoreUpdatesTemporarily = true;
      const pendingChanges = this.getPendingChanges();
      _.each(this.itemIdsSelected, (productSelectionId) => {
        const selectionToDelete =  _.find(this.selections, (selection) => selection._id === productSelectionId);
        SelectionsHelper.deleteSelectionAndRelated(this.templateLibraries, pendingChanges, this.lookupData, selectionToDelete);
      });
      const {job, metadata, selections, selectionRelationships} = pendingChanges;
      this.initializeJobVariables(job, metadata, selections, selectionRelationships);
      this.confirmSaveChanges(job, selections, selectionRelationships, metadata, true);
      this.itemIdsSelected = [];
    }

    const deletionCount = this.itemIdsSelected.length;
    if (deletionCount) {
      const deletionText = deletionCount === 1 ? `the selected product` : `the ${deletionCount} selected products`;
      this.bootstrapDialog.confirmationDialog("Delete selected products",
        `Are you sure you want to delete ${deletionText}?`)
      .then(confirmSave, cancelSave);
    }
  }

  deleteProductSelection(productSelectionId) {
    this.ignoreUpdatesTemporarily = true;
    const selectionToDelete =  _.find(this.selections, (selection) => selection._id === productSelectionId);
    const pendingChanges = this.getPendingChanges();
    SelectionsHelper.deleteSelectionAndRelated(this.templateLibraries, pendingChanges, this.lookupData, selectionToDelete);
    const {job, metadata, selections, selectionRelationships} = pendingChanges;
    this.initializeJobVariables(job, metadata, selections, selectionRelationships);
    this.confirmSaveChanges(job, selections, selectionRelationships, metadata, true);
  }

  editSelected() {
    const editCount = this.itemIdsSelected.length;
    if (editCount === 0) {
      this.toastr.info("Please check a product selection first");
      return;
    }
    if (editCount > 1) {
      this.toastr.warning("Sorry, cannot edit multiple records");
      return;
    }
    this.ignoreUpdatesTemporarily = true;
    const pendingChanges = this.getPendingChanges();
    this.editProductSelection(this.itemIdsSelected[0], null, false, pendingChanges);
  }

  editProductSelection(productSelectionId, event, deleteIfCanceled, pendingChanges) {
    if (!pendingChanges) {
      pendingChanges = this.getPendingChanges();
    }
    this.selectedProductSelectionId = productSelectionId;
    this.setTabs(pendingChanges, productSelectionId);
    const modalInstance = this.$modal.open({
      templateUrl: 'client/product-selections/views/product-selection-edit.html',
      controller: 'productSelection',
      // size: 'lg',
      resolve: {
        'bid': () => {
          return this;
        },
        'pendingChanges': () => {
          return pendingChanges;
        },
      }
    });

    modalInstance.result.then((selectedItem) => {
      const {job, metadata, selections, selectionRelationships} = pendingChanges;
      job.estimateTotal = this.getJobSubtotal(metadata, selections, selectionRelationships);
      this.save(job, selections, selectionRelationships, metadata);
      this.updateSpecificationsForAreaTreeData(pendingChanges);
    }, () => {
      console.log('Modal dismissed at: ' + new Date());
      if (deleteIfCanceled) {
        this.deleteProductSelection(this.selectedProductSelectionId);
      }
      // this.cancel();
    });
  }

  editArea(areaNode) {
    if (areaNode && areaNode.data && areaNode.data.selectionId) {
      this.editProductSelection(areaNode.data.selectionId);
    }
  }

  getSelectionTemplateName(selection) {
    const template = TemplateLibrariesHelper.getTemplateById(this.templateLibraries, selection.templateId);
    if (template) {
      return `${template.name}`;
    }
    return ``;
  }

  getSelectedProductDisplaySummary(pendingChanges = {}) {
    const {selections} = pendingChanges;
    if (!selections) {
      return '';
    }
    const selectedProductSelection = _.find(selections, (selection) => selection._id === this.selectedProductSelectionId);
    const selectedProductSelectionId = selectedProductSelection && selectedProductSelection._id;
    const template = selectedProductSelection &&
      TemplateLibrariesHelper.getTemplateById(this.templateLibraries, selectedProductSelection.templateId);
    if (template) {
      switch (template.templateType) {
        case Constants.templateTypes.productSelection:
          const titleText = this.getTitle(selectedProductSelectionId, pendingChanges);
          const priceEachText = this.getPriceEach(selectedProductSelectionId, pendingChanges);
          const priceTotalText = this.getPriceTotal(selectedProductSelectionId, pendingChanges);
          const quantityText = this.getQuantity(selectedProductSelectionId, pendingChanges);
          return `${titleText} x ${quantityText} at ${priceEachText} each = ${priceTotalText}`;
        case Constants.templateTypes.area:
          const branch = this.getBranchBySelectionId(selectedProductSelectionId);
          return this.getBreadcrumbText(branch, '');
        default:
          return selectedProductSelection.value;
      }
    }

  }

  getTitle(productSelectionId, pendingChanges = {}) {
    const {metadata, selections} = pendingChanges;
    if (!productSelectionId || !metadata || !selections) {
      return '';
    }
    const columnSelectionIds = metadata.columnSelectionIds[productSelectionId];

    if (columnSelectionIds && columnSelectionIds.length > 2) {
      const columnSelection = _.find(selections, (selection) => selection._id === columnSelectionIds[0]);
      return SelectionsHelper.getDisplayValue(this.templateLibraries, selections, columnSelection);
    }
    return '';
  }

  getMainSelectionContent(productSelectionId, pendingChanges = {}) {
    const {metadata, selections} = pendingChanges;
    if (!productSelectionId || !metadata || !selections) {
      return '';
    }
    const columnSelectionIds = metadata.columnSelectionIds[productSelectionId];

    if (columnSelectionIds && columnSelectionIds.length > 7) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, selections, _.find(selections, (selection) => selection._id === columnSelectionIds[5]))
        + ' x ' + SelectionsHelper.getDisplayValue(this.templateLibraries, selections, _.find(selections, (selection) => selection._id === columnSelectionIds[6]))
        + ' x ' + SelectionsHelper.getDisplayValue(this.templateLibraries, selections, _.find(selections, (selection) => selection._id === columnSelectionIds[7]));
    }
    return '';
  }

  getPriceTotal(productSelectionId, pendingChanges = {}) {
    const {metadata, selections} = pendingChanges;
    if (!productSelectionId || !metadata || !selections) {
      return '';
    }
    const columnSelectionIds = metadata.columnSelectionIds[productSelectionId];

    if (columnSelectionIds && columnSelectionIds.length > 2) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, selections, _.find(selections, (selection) => selection._id === columnSelectionIds[2]));
    }
    return '';
  }

  getPriceEach(productSelectionId, pendingChanges = {}) {
    const {metadata, selections} = pendingChanges;
    if (!productSelectionId || !metadata || !selections) {
      return '';
    }
    const columnSelectionIds = metadata.columnSelectionIds[productSelectionId];

    if (columnSelectionIds && columnSelectionIds.length > 2) {
      return SelectionsHelper.getDisplayValue(this.templateLibraries, selections, _.find(selections, (selection) => selection._id === columnSelectionIds[1]));
    }
    return '';
  }

  getQuantity(productSelectionId, pendingChanges = {}) {
    const {metadata, selections} = pendingChanges;
    if (!productSelectionId || !metadata || !selections) {
      return '';
    }
    const columnSelectionIds = metadata.columnSelectionIds[productSelectionId];

    if (columnSelectionIds && columnSelectionIds.length > 4) {
      const selection = _.find(selections, (selection) => selection._id === columnSelectionIds[4]);
      return (selection && selection.value) || '';
    }
    return '';
  }

  getProductImage(productSelectionId, pendingChanges = {}) {
    const {metadata, selections} = pendingChanges;
    if (!productSelectionId || !metadata || !selections) {
      return '';
    }
    const columnSelectionIds = metadata.columnSelectionIds[productSelectionId];

    if (columnSelectionIds && columnSelectionIds.length > 0) {
      const columnSelection = _.find(selections, (selection) => selection._id === columnSelectionIds[0]);
      const imageFileSetting = columnSelection && TemplateLibrariesHelper.getTemplateSettingByKeyAndIndex(
        this.templateLibraries, columnSelection.templateId, Constants.templateSettingKeys.imageSource, 0);
      return imageFileSetting ? imageFileSetting.value : '';
    }
    return '';
  }

  // returns array of TabSection objects
  getTabsFromTemplates(templatesForTabs, pendingChanges) {
    var tabs = [];
    if (templatesForTabs) {
      _.each(templatesForTabs, (templateForTab) => {
        const templateSettingsForTabs = TemplateLibrariesHelper.getTemplateSettingsForTabs(templateForTab);
        _.each(templateSettingsForTabs, (templateSetting) => {
          const tabMatch = _.find(tabs, (tab) => tab.title === templateSetting.value);
          if (tabMatch) {
            tabMatch.inputSelectionItems.push(new InputSelectionItem(this.templateLibraries,
              pendingChanges, templateForTab, this.selectedProductSelectionId, this.lookupData));
          }
          else {
            const newTab = new TabSection(templateSetting.value, this.templateLibraries,
              pendingChanges, templateForTab, this.selectedProductSelectionId, this.lookupData);
              //Ultimately need a better way of ordering tabs, but for now just make Primary the first
            if (templateSetting.value === 'Primary') {
              tabs.unshift(newTab);
            } else {
              tabs.push(newTab);
            }
          }
        });
      });
    }

    return tabs;
  };

  setTabs(pendingChanges, productSelectionId) {
    const templatesForTabs = TemplateLibrariesHelper.getTemplatesForTabs(pendingChanges, this.templateLibraries, productSelectionId);
    this.tabs = this.getTabsFromTemplates(templatesForTabs, pendingChanges);

    //Initialize first tab as selected
    if (this.tabs && this.tabs.length > 0) {
        this.tabs[0].active = true;
    }
    this.setProductSelectionEditItems(templatesForTabs, pendingChanges);
  }

  setProductSelectionEditItems(templatesForTabs, pendingChanges) {
    const {metadata, selections, selectionRelationships} = pendingChanges;
    this.productSelectionEditItems = [];
    const selectedProductSelection = _.find(selections, (selection) => selection._id === this.selectedProductSelectionId);

    _.each(templatesForTabs, (templateForTab) => {
      this.productSelectionEditItems.push(new InputSelectionItem(this.templateLibraries,
        pendingChanges, templateForTab, this.selectedProductSelectionId, this.lookupData));
    });
  }

  getUnitsText(template) {
    return ItemTemplatesHelper.getUnitsText(template);
  }

  // this is primarily for debugging
  setFullHierarchyTreeData() {
    const pendingFullHierarchyTreeData = this.getPendingFullHierarchyTreeData();
    // const treeItemSelected = this.getTreeItemSelected(pendingFullHierarchyTreeData);
    // if (!this.isTreeDataEqual(this.areaTreeData, pendingFullHierarchyTreeData)) {
    this.fullHierarchyTreeData = pendingFullHierarchyTreeData;
    this.$timeout(() => {
      this.fullHierarchyTree.expand_all();
    }, 50);
  }

  getPendingFullHierarchyTreeData() {
    const jobSelection = this.jobSelection;
    const companyTemplate = TemplateLibrariesHelper.getTemplateByType(this.templateLibraries, Constants.templateTypes.company);
    const companySelection = SelectionsHelper.getSelectionByTemplate(this.selections, companyTemplate);
    let pendingFullHierarchyTreeData = [];
    let treeItemSelected = null;
    let i;

    if (jobSelection && companySelection) {
      this.addItemToFullHierarchyTreeData(pendingFullHierarchyTreeData, companySelection);
    }
    return pendingFullHierarchyTreeData;
  }

  addItemToFullHierarchyTreeData(treeDataArray, selection) {
    var i;
    var selectionChildren = [];
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(this.templateLibraries, selection.templateId);
    const templateDisplayValue = selectionTemplate && ItemTemplatesHelper.getDisplayCaption(selectionTemplate);
    const selectionDisplayValue = SelectionsHelper.getDisplayValue(this.templateLibraries, this.selections, selection);
    var treeItem = {
        data: {selectionId: selection._id},
        label: `${templateDisplayValue} - ${selectionDisplayValue} (${selection._id})`,
        children: selectionChildren
    }
    treeDataArray.push(treeItem);

    const childSelections = SelectionsHelper.getChildSelections(selection, this.selections, this.selectionRelationships);

    for (i = 0; i < childSelections.length; i += 1) {
      treeItem = this.addItemToFullHierarchyTreeData(selectionChildren, childSelections[i]);
    }

    return treeItem;
  }

  showMetadata() {
    this.metadataHtml = JSON.stringify(this.metadata, undefined, 2);
  }
}
