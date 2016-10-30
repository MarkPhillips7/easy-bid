Constants.conditionTypes = {
  switch:"Switch",
}

Constants.dateStatuses = {
  neverEffective: "NeverEffective",
  effectiveInPastNoExpiration: "EffectiveInPastNoExpiration",
  expired: "Expired",
  effectiveInPastWillExpire: "EffectiveInPastWillExpire",
  effectiveInFutureNoExpiration: "EffectiveInFutureNoExpiration",
  effectiveInFutureWillExpire: "EffectiveInFutureWillExpire",
};

Constants.dependency = {
  required:"Required",
  optionalAutomatic:"OptionalAutomatic",//Automatically selected
  optionalExplicit:"OptionalExplicit",//must be explicitly chosen
  optionalOverride:"OptionalOverride"//Assumes the same setting has a default set by a parent
};

Constants.hierarchyRoot = "-";

Constants.lookupSettingKeys = {
  hardwareMaterial:"HardwareMaterial",
  iconType:"IconType",
  iconStack1xClass:"IconStack1xClass",
  iconStack2xClass:"IconStack2xClass",
  size:"Size",
  unitsText:"UnitsText",
};

Constants.lookupTypes = {
  hierarchical:"Hierarchical",
  label:"Label",
  price:"Price",
  standard:"Standard",
};

Constants.lookupSubTypes = {
  lookupKey: "Lookup Key",
  lookupType: "Lookup Type",
  lookupSubType: "Sub Type", // lookupType should be standard, lookupSubType should be this, key should be the lookupType the subtype is under
  option: "Option",
  product: "Product",
};

Constants.lookupKeys = {
  // lookupType: "Lookup Type",
  root: Constants.hierarchyRoot,
};

Constants.noEmailYet = "noemailyet";

Constants.overrideTypes = {
  fromSpecificationGroup:"FromSpecificationGroup",
  userEntry:"UserEntry",
};

Constants.recordActions = {
  add:"Add",
  copy:"Copy",
  view:"View",
  edit:"Edit",
  delete:"Delete",
  save:"Save",
  cancel:"Cancel"
};

Constants.relationToItem = {
  child:"Child",
  sibling:"Sibling",
  independent:"Independent",
  subItem:"SubItem"//when template represents a sub-template of a base template
};

Constants.selectionAddingModes = {
  addBaseTemplateChildrenForSubTemplates: "AddBaseTemplateChildrenForSubTemplates",
  handleAnything:"HandleAnything",
  ignoreBaseTemplates:"IgnoreBaseTemplates",
  ignoreSubTemplates:"IgnoreSubTemplates",
  onlySubTemplates:"OnlySubTemplates"
}

Constants.selectionSettingKeys = {
  overrideTemplateId:"OverrideTemplateId",
};

Constants.selectionTypes = {
  // For read-only or calculated values
  notApplicable: "NotApplicable",

  // These represent primary or parent options
  checkbox: "Checkbox",
  entry: "Entry",
  select: "Select",

  // These represent child options
  selectOption: "SelectOption",
  intRange: "IntRange",
  floatRange: "FloatRange"
};

Constants.templateSettingKeys = {
  // Instead of applicableTemplateId use a templateRelationship with an optionalOverride dependency
  // applicableTemplateId:"ApplicableTemplateId",
  applicableTemplateType:"ApplicableTemplateType",
  belongsTo:"BelongsTo",
  caseMaterialInteriorSku:"CaseMaterialInteriorSku",
  caseMaterialExposedSku:"CaseMaterialExposedSku",
  columnWidth:"ColumnWidth",
  conditionType:"ConditionType",
  customLookup:"CustomLookup",
  customOptions:"CustomOptions",
  defaultValue:"DefaultValue",
  denominatorUnit:"DenominatorUnit",
  displayCaption:"DisplayCaption",
  displayCategory:"DisplayCategory",
  displayOrder:"DisplayOrder",
  function:"Function",
  imageSource:"ImageSource",
  isABaseTemplate:"IsABaseTemplate",
  isASubTemplate:"IsASubTemplate",
  isVariableCollector:"IsVariableCollector",
  isVariableOverride:"IsVariableOverride",
  // Commenting levelsDeepCanOverride because it seems better to explicitly specify with optionalOverride templateRelationship
  // levelsDeepCanOverride:"LevelsDeepCanOverride",
  lookupKey:"LookupKey",
  lookupKeyVariable:"LookupKeyVariable",
  lookupType:"LookupType",
  nominalThickness:"NominalThickness",
  numeratorUnit:"NumeratorUnit",
  overrideType:"OverrideType",
  overrideValue:"OverrideValue",
  propertyToOverride:"PropertyToOverride",
  selectionType:"SelectionType",
  switchValue:"SwitchValue",
  switchVariable:"SwitchVariable",
  unitsText:"UnitsText",
  valueFormula:"ValueFormula",
  variableName:"VariableName",
  variableToDisplay:"VariableToDisplay",
  variableToOverride:"VariableToOverride"
};

Constants.templateTypes = {
  area: "Area",
  baseProduct: "BaseProduct",
  calculation: "Calculation",
  company: "Company",
  condition: "Condition",
  customer: "Customer",
  definition: "Definition",
  function: "Function",
  input: "Input",
  job: "Job",
  labor: "Labor",
  lookupData: "LookupData",
  material: "Material",
  object: "Object",
  override: "Override",
  product: "Product",
  productSelection: "ProductSelection",
  specificationGroup: "SpecificationGroup",
  undefined: "Undefined",
  variableDisplay: "VariableDisplay"
};

Constants.usageModes = {
  browse:"Browse", //don't even see buttons for editing or deleting
  classicEdit:"Classic Edit", //must choose to save before changes take effect
  autoSave:"Auto Save" //updates take effect immediately
};

Constants.valueSources = {
  nothing: "Nothing",
  defaultValue: "DefaultValue",
  userEntry: "UserEntry",
  calculatedValue: "CalculatedValue",
  lookupData: "LookupData",
  lookup: "Lookup"
};
