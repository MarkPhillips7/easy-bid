Constants.dependency = {
  required:"Required",
  optionalAutomatic:"OptionalAutomatic",//Automatically selected
  optionalExplicit:"OptionalExplicit",//must be explicitly chosen
  optionalOverride:"OptionalOverride"//Assumes the same setting has a default set by a parent
};

Constants.relationToItem = {
  child:"Child",
  sibling:"Sibling",
  independent:"Independent",
  subItem:"SubItem"//when template represents a sub-template of a base template
}

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
  belongsTo:"BelongsTo",
  defaultValue:"DefaultValue",
  denominatorUnit:"DenominatorUnit",
  displayCaption:"DisplayCaption",
  displayCategory:"DisplayCategory",
  displayOrder:"DisplayOrder",
  imageSource:"ImageSource",
  isABaseTemplate:"IsABaseTemplate",
  isASubTemplate:"IsASubTemplate",
  isVariableOverride:"IsVariableOverride",
  numeratorUnit:"NumeratorUnit",
  overrideValue:"OverrideValue",
  propertyToOverride:"PropertyToOverride",
  selectionType:"SelectionType",
  unitsText:"UnitsText",
  valueFormula:"ValueFormula",
  variableName:"VariableName",
  variableToOverride:"VariableToOverride"
};

Constants.templateTypes = {
  area: "Area",
  baseProduct: "BaseProduct",
  calculation: "Calculation",
  company: "Company",
  customer: "Customer",
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
  specification: "Specification",
  undefined: "Undefined",
  variableDisplay: "VariableDisplay"
};

Constants.valueSources = {
  nothing: "Nothing",
  defaultValue: "DefaultValue",
  userEntry: "UserEntry",
  calculatedValue: "CalculatedValue",
  lookupData: "LookupData",
  lookup: "Lookup"
};
