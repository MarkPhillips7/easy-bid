Constants.conditionTypes = {
  switch:"Switch",
}

Constants.dataOrientations = {
  horizontal: "Horizontal",
  vertical: "Vertical",
}

Constants.dateStatuses = {
  neverEffective: "NeverEffective",
  effectiveInPastNoExpiration: "EffectiveInPastNoExpiration",
  expired: "Expired",
  effectiveInPastWillExpire: "EffectiveInPastWillExpire",
  effectiveInFutureNoExpiration: "EffectiveInFutureNoExpiration",
  effectiveInFutureWillExpire: "EffectiveInFutureWillExpire",
};

Constants.dateStatusOptions = {
  active: "Active",
  expired: "Expired",
  effectiveInFuture: "EffectiveInFuture",
};

Constants.dependency = {
  required:"Required",
  optionalAutomatic:"OptionalAutomatic",//Automatically selected
  optionalExplicit:"OptionalExplicit",//must be explicitly chosen
  optionalOverride:"OptionalOverride"//Assumes the same setting has a default set by a parent
};

Constants.hierarchyRoot = "-";

Constants.importSetTypes = {
  calculations: 'Calculations',
  formulaReferences: 'FormulaReferences',
  lookups: 'Lookups',
  products: 'Products',
  specificationGroups: 'SpecificationGroups',
  specificationOptions: 'SpecificationOptions',
  subProducts: 'SubProducts',
};

Constants.lookupWildcardText = "*";

Constants.lookupSettingKeys = {
  hardwareMaterial:"HardwareMaterial",
  iconHtml:"IconHtml",
  iconType:"IconType",
  iconStack1xClass:"IconStack1xClass",
  iconStack2xClass:"IconStack2xClass",
  lookupValueType:"LookupValueType",
  min:"Min",
  max:"Max",
  size:"Size",
  unitsText:"UnitsText",
};

Constants.lookupTypes = {
  basic:"Basic",
  hierarchical:"Hierarchical",
  label:"Label",
  option: "Option",
  price:"Price",
  range:"Range", // lookup value within min and max range values
  // standard:"Standard", standard replaced with basic and option
};

Constants.lookupSubTypes = {
  lookupKey: "Lookup Key",
  lookupType: "Lookup Type",
  lookupSubType: "Sub Type",
  product: "Product",
  standard: "Standard", // used to be option (back when the option lookup type used to be standard)
};

// Constants.lookupKeys = {
//   // lookupType: "Lookup Type",
//   root: Constants.hierarchyRoot,
// };

Constants.noEmailYet = "noemailyet";

Constants.overrideTypes = {
  calculation:"Calculation",
  fromSpecificationGroup:"FromSpecificationGroup",
  userEntry:"UserEntry",
};

Constants.patternTypes = {
  currency:"Currency",
};

Constants.pricingMethods = {
  fixed: 'Fixed',
  costPlus: 'Cost +',
  materialAndLabor: 'M&L',
  variable: 'Variable',
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

Constants.reportTypes = {
  jobQuote: "Quote",
  partsLabor: "Parts/Labor",
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
  // lookupKeyValue:"lookupKeyValue",
  lookupType:"LookupType",
  nominalThickness:"NominalThickness",
  numeratorUnit:"NumeratorUnit",
  overrideType:"OverrideType",
  overrideValue:"OverrideValue",
  patternType:"PatternType",
  productTab:"ProductTab",
  propertyToOverride:"PropertyToOverride",
  selectionType:"SelectionType",
  switchValue:"SwitchValue",
  switchVariable:"SwitchVariable",
  unitsText:"UnitsText",
  valueFormula:"ValueFormula",
  valueType:"valueType",
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
