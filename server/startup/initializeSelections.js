// Should be called by initializeEverything.js
Initialization.initializeSelections = function (companyInfo, userInfo) {
  let company = Companies.findOne({"_id": companyInfo.weMakeCabinets._id});
  let templateLibrary = TemplateLibraries.findOne({"name": "Cabinetry", "ownerCompanyId": company._id});
  let job = Jobs.findOne({"name": "Garage", "companyId": company._id});

  let selection = Selections.findOne({"jobId": job._id});
  if (!selection && job && templateLibrary) {
    console.log(`adding selections for company ${company.name} and job ${job.name}`);

    let companySelection = addSelectionsForTemplateAndChildren(templateLibrary, job._id,
      _.find(templateLibrary.templates, (template) => {
      return template.templateType === Constants.templateTypes.company;
    }), company._id, null, 1);
  }
}

function addSelectionsForTemplateAndChildren(templateLibrary, jobId, template, selectionValue, parentSelection, childOrder,
                                             selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt, lookupData) {
  let selection = addSelectionForTemplate(templateLibrary, jobId, template, selectionValue, parentSelection, childOrder);
  addSelectionsForTemplateChildren(templateLibrary, jobId, selection, template, selectionAddingMode, templateToStopAt);

  return selection;
}

function addSelectionForTemplate(templateLibrary, jobId, template, selectionValue, parentSelection, childOrder) {
  let selection = {
    jobId: jobId,
    templateLibraryId: templateLibrary._id,
    templateId: template.id,
    value: selectionValue
  };
  var selectionId = Selections.insert(selection);
  selection._id = selectionId;

  if (parentSelection) {
    let selectionRelationship = {
      jobId: jobId,
      parentSelectionId: parentSelection._id,
      childSelectionId: selectionId,
      order: childOrder
    }
    SelectionRelationships.insert(selectionRelationship);
  }

  // ToDo: add selection settings?

  return selection;
}

function addSelectionsForTemplateChildren(templateLibrary, jobId, selection, template,
                                          selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt) {

  if (selection && template)
  {
    //If a child template exists with the same type as templateToStopAt then just return.
    if (templateToStopAt &&
      _.find(TemplateLibrariesHelper.getTemplateChildren(templateLibrary, template), (templateChild) => {return templateChild.templateType == templateToStopAt.templateType;})){
      return;
    }

    //Add selections for template children that are not SubItems (sub templates) first so that everything that might be overridden by sub template exists.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(templateLibrary, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem != Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(templateLibrary, jobId, selection, template, selectionAddingMode, templateRelationship);
      });

    //Now it's safe to add selections for template children that are SubItems.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(templateLibrary, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem == Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(templateLibrary, jobId, selection, template, selectionAddingMode, templateRelationship);
      });

    //Handle case where this is a sub template but also a parent of a sub template. So need to add the template children of the base template
    if (selectionAddingMode == Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates) {
      let isABaseTemplate = template.templateSettings
        && _.find(template.templateSettings, (templateSetting) => {
          return templateSetting.key === "IsABaseTemplate" && templateSetting.value === true.toString();
        });

      //To get here must be a sub template or base template, so go ahead and add selections for children
      addSelectionsForTemplateChildren(templateLibrary, jobId, selection, template, Constants.selectionAddingModes.ignoreSubTemplates);

      //If this template is not a base template then still need to add selections for children of parent template(s)
      if (!isABaseTemplate)
      {
        _.each(TemplateLibrariesHelper.parentTemplates(templateLibrary, template), (parentTemplate) => {
          addSelectionsForTemplateChildren(templateLibrary, jobId, selection, parentTemplate, Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates);
        });
      }
    }
  }
}

function addOrUpdateSelectionSettings(templateLibrary, selection, selectionSettingsToAddOrUpdate) {
  let newSelectionSettings = selection.selectionSettings || [];
  if (selectionSettingsToAddOrUpdate) {
    _.each(selectionSettingsToAddOrUpdate, (selectionSettingToAddOrUpdate) => {
      let existingSelectionSetting = _.find(newSelectionSettings, (selectionSetting) => {
        return selectionSetting.key === selectionSettingToAddOrUpdate.key;
      });

      if (existingSelectionSetting) {
        if (selectionSettingsToAddOrUpdate.levelFromHere >= existingSelectionSetting.levelFromHere) {
          existingSelectionSetting.value = selectionSettingToAddOrUpdate.value;
        }
      } else {
        newSelectionSettings.push(selectionSettingToAddOrUpdate);
      }
    });
  }
  Selections.update(selection._id, {$set: {selectionSettings: newSelectionSettings}});
}

function addSelectionsForChildTemplateRelationship(templateLibrary, jobId, selection, template, selectionAddingMode, templateRelationship) {
  let childTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary, templateRelationship.childTemplateId);
  let isASubTemplate = ItemTemplatesHelper.isASubTemplate(childTemplate);
  let isABaseTemplate = ItemTemplatesHelper.isABaseTemplate(childTemplate);

  // Ignore optional children
  if (templateRelationship.dependency === Constants.dependency.optionalOverride) {
    return;
  }

  if (selectionAddingMode == Constants.selectionAddingModes.handleAnything
    ||
    (!isABaseTemplate && selectionAddingMode == Constants.selectionAddingModes.ignoreBaseTemplates)
    ||
    (isASubTemplate && selectionAddingMode == Constants.selectionAddingModes.onlySubTemplates)
    ||
    (!isASubTemplate && selectionAddingMode == Constants.selectionAddingModes.ignoreSubTemplates))
  //addBaseTemplateChildrenForSubTemplates handled separately
  {
    switch (childTemplate.templateType)
    {
      case Constants.templateTypes.job:
        addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, "Renovation", selection, 1);
        break;
      case Constants.templateTypes.customer:
        addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, "Bob Smith", selection, 1);
        break;
      case Constants.templateTypes.area:
        //Prevent infinite loop by not allowing grandparent to have template type of area
        if (template.templateType == Constants.templateTypes.area && selection.value === "First Floor") {
          addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, "Kitchen", selection, 1);
        } else if (template.templateType == Constants.templateTypes.area && selection.value === "Second Floor") {
          addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, "Master Closet", selection, 1);
        } else if (template.templateType != Constants.templateTypes.area) {
          addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, "First Floor", selection, 1);
          addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, "Second Floor", selection, 2);
        }
        break;
      case Constants.templateTypes.productSelection:
        _.each(TemplateLibrariesHelper.getAllSubTemplatesOfBaseTemplateChild(templateLibrary, childTemplate),
          (subTemplate, index, list) => {
            if (subTemplate.name !== 'Lazy Susan Cabinet') {
              return;
            }

            //Add the product selection
            let productSelection = addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, null, selection, index + 1,
              Constants.selectionAddingModes.ignoreBaseTemplates);

            //Add selection for this sub template (will add template children for sub template after adding template children of base template)
            let subTemplateSelection = addSelectionForTemplate(templateLibrary, jobId, subTemplate, subTemplate.id.toString(), productSelection, index + 2);

            //Add the template children of the base template before the sub template children because they override some of these
            addSelectionsForTemplateChildren(templateLibrary, jobId, subTemplateSelection,
              TemplateLibrariesHelper.parentTemplate(templateLibrary, subTemplate),
              Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates);

            //Add selection and template children for this sub template
            addSelectionsForTemplateChildren(templateLibrary, jobId, subTemplateSelection,
              TemplateLibrariesHelper.getTemplateById(templateLibrary, subTemplateSelection.templateId),
              Constants.selectionAddingModes.ignoreSubTemplates);

            //AddSelectionsForTemplateAndChildren(context, selections, templates, childTemplate, "LazySusan Selection", masterSelection, selection, null);
          });
        break;
      //case Constants.templateTypes.Undefined:
      default:
        if (childTemplate.templateSettings
          && _.find (childTemplate.templateSettings, (templateSetting) => {
            return templateSetting.key === "IsVariableOverride" && templateSetting.value === true.toString();
          })) {
          //Don't add a selection if this is a variable override (Because the selection for the template containing the variable is added separately)
          //But add the appropriate override selection setting to that selection
          let variableToOverride = _.find(childTemplate.templateSettings, (templateSetting) => {
            return templateSetting.key == "VariableToOverride";
          }).value;
          let propertyToOverride = _.find(childTemplate.templateSettings, (templateSetting) => {
            return templateSetting.key == "PropertyToOverride";
          }).value;
          let overrideValue = _.find(childTemplate.templateSettings, (templateSetting) => {
            return templateSetting.key == "OverrideValue";
          }).value;
          const {selectionToOverride, levelFromHere} = SelectionsHelper.getSelectionToOverride(templateLibrary, selection, variableToOverride, [], null, null, 0);
          if (selectionToOverride) {
            addOrUpdateSelectionSettings(templateLibrary, selectionToOverride, [ { key: propertyToOverride, value: overrideValue, levelFromHere } ]);
          }
        }
        else if (isASubTemplate) {
          //Don't do anything. Sub templates are now handled in ProductSelection case.

          //if (selectionAddingMode == SelectionAddingModes.OnlySubTemplates)
          //{
          //    //First, if this sub template has any child sub templates, add selections for them
          //    AddSelectionsForTemplateChildren(context, selections, templates, masterSelection, selection, childTemplate, SelectionAddingModes.OnlySubTemplates);
          //}

          //Moved into processing of ProductSelection
          ////Now add selections for this sub template
          //Selection subTemplateSelection = AddSelectionsForTemplateAndChildren(context, selections, templates, childTemplate, null,
          //    masterSelection, selection, null, SelectionAddingModes.HandleAnything);

          ////Now also add the template children of the base template
          //AddSelectionsForTemplateChildren(context, selections, templates, masterSelection, subTemplateSelection, template, SelectionAddingModes.AddBaseTemplateChildrenForSubTemplates);
          break;
        }
        else if (isABaseTemplate) {
          //If child template IsABaseTemplate then don't add selection for this template now, just add selections for all of
          //its child sub templates (and they will add this template's other children).
          addSelectionsForTemplateChildren(templateLibrary, jobId, subTemplateSelection, childTemplate,
            Constants.selectionAddingModes.onlySubTemplates);
        } else {   //switch (childTemplate.Name)
          //case "Product"://OneDoorBaseCabinet Selection":
          //    AddSelectionsForTemplateAndChildren(context, selections, templates, childTemplate, selection.Value.Replace(" Selection", ""), masterSelection, selection, null);
          //    break;
          //default:
          let defaultValue = _.chain(childTemplate.templateSettings)
            .filter((templateSetting) => { return templateSetting.key == "DefaultValue"; })
            .map((templateSetting) => { return templateSetting.value; })
            .first()
            .value();

          //Not a base template or a sub template, so no matter the adding mode should go back to handling everything
          addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate,
            defaultValue, selection, 1, Constants.selectionAddingModes.handleAnything);
          //break;
        }
        break;
      //default:
      //    AddSelectionsForTemplateAndChildren(context, selections, templates, childTemplate, null, masterSelection, selection, null);
      //    break;
    }
  }
}
