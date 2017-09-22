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

Constants.jsReportOnlineIds = {
  jobQuote: "-1_p0OYdp",
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

Constants.reportTemplates = {
  jobQuoteStandard: "QuoteStandard",
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

Constants.states = [
  {name: 'Alabama', abbr: 'AL'},
  {name: 'Alaska', abbr: 'AK'},
  {name: 'American Samoa', abbr: 'AS'},
  {name: 'Arizona', abbr: 'AZ'},
  {name: 'Arkansas', abbr: 'AR'},
  {name: 'California', abbr: 'CA'},
  {name: 'Colorado', abbr: 'CO'},
  {name: 'Connecticut', abbr: 'CT'},
  {name: 'Delaware', abbr: 'DE'},
  {name: 'District of Columbia', abbr: 'DC'},
  {name: 'Federated States of Micronesia', abbr: 'FM'},
  {name: 'Florida', abbr: 'FL'},
  {name: 'Georgia', abbr: 'GA'},
  {name: 'Guam', abbr: 'GU'},
  {name: 'Hawaii', abbr: 'HI'},
  {name: 'Idaho', abbr: 'ID'},
  {name: 'Illinois', abbr: 'IL'},
  {name: 'Indiana', abbr: 'IN'},
  {name: 'Iowa', abbr: 'IA'},
  {name: 'Kansas', abbr: 'KS'},
  {name: 'Kentucky', abbr: 'KY'},
  {name: 'Louisiana', abbr: 'LA'},
  {name: 'Maine', abbr: 'ME'},
  {name: 'Marshall Islands', abbr: 'MH'},
  {name: 'Maryland', abbr: 'MD'},
  {name: 'Massachusetts', abbr: 'MA'},
  {name: 'Michigan', abbr: 'MI'},
  {name: 'Minnesota', abbr: 'MN'},
  {name: 'Mississippi', abbr: 'MS'},
  {name: 'Missouri', abbr: 'MO'},
  {name: 'Montana', abbr: 'MT'},
  {name: 'Nebraska', abbr: 'NE'},
  {name: 'Nevada', abbr: 'NV'},
  {name: 'New Hampshire', abbr: 'NH'},
  {name: 'New Jersey', abbr: 'NJ'},
  {name: 'New Mexico', abbr: 'NM'},
  {name: 'New York', abbr: 'NY'},
  {name: 'North Carolina', abbr: 'NC'},
  {name: 'North Dakota', abbr: 'ND'},
  {name: 'Northern Mariana Islands', abbr: 'MP'},
  {name: 'Ohio', abbr: 'OH'},
  {name: 'Oklahoma', abbr: 'OK'},
  {name: 'Oregon', abbr: 'OR'},
  {name: 'Palau', abbr: 'PW'},
  {name: 'Pennsylvania', abbr: 'PA'},
  {name: 'Puerto Rico', abbr: 'PR'},
  {name: 'Rhode Island', abbr: 'RI'},
  {name: 'South Carolina', abbr: 'SC'},
  {name: 'South Dakota', abbr: 'SD'},
  {name: 'Tennessee', abbr: 'TN'},
  {name: 'Texas', abbr: 'TX'},
  {name: 'Utah', abbr: 'UT'},
  {name: 'Vermont', abbr: 'VT'},
  {name: 'Virgin Islands', abbr: 'VI'},
  {name: 'Virginia', abbr: 'VA'},
  {name: 'Washington', abbr: 'WA'},
  {name: 'West Virginia', abbr: 'WV'},
  {name: 'Wisconsin', abbr: 'WI'},
  {name: 'Wyoming', abbr: 'WY'},
];

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
