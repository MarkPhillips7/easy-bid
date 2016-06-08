SheetMaterials = new Mongo.Collection("sheetMaterials");

Schema.SheetMaterialPricing = new SimpleSchema({
  id: {
    type: String,
    optional: true
  },
  effectiveDate: {
    type: Date
  },
  expirationDate: {
    type: Date,
    optional: true
  },
  purchasePricePerSheet: {
    type: Number,
    decimal: true,
    optional: true
  },
  supplierId: {
    type: String,
    optional: true
  },
});

Schema.SheetMaterialOffering = new SimpleSchema({
  name: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  sku: {
    type: String,
    optional: true
  },
  // Density in pounds per square foot
  density: {
    type: Number,
    decimal: true,
  },
  // Nominal (advertised) thickness in inches
  nominalThickness: {
    type: Number,
    decimal: true,
  },
  // Actual thickness in inches (typically 1/32" less than nominal thickness)
  actualThickness: {
    type: Number,
    decimal: true,
  },
  // Length of sheet in inches
  length: {
    type: Number,
    decimal: true,
  },
  // Width of sheet in inches
  width: {
    type: Number,
    decimal: true,
  },
  sheetMaterialPricings: {
    type: [Schema.SheetMaterialPricing],
  },
});

Schema.SheetMaterial = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  templateLibraryId: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  sku: {
    type: String,
    optional: true
  },
  coreMaterial: {
    type: Schema.Material,
  },
  sideAMaterial: {
    type: Schema.Material,
    optional: true
  },
  sideBMaterial: {
    type: Schema.Material,
    optional: true
  },
  sheetMaterialOfferings: {
    type: [Schema.SheetMaterialOffering],
  },
});

SheetMaterials.attachSchema(Schema.SheetMaterial);

SheetMaterials.allow({
  insert: function (userId, sheetMaterial) {
    return false;
  },
  update: function (userId, sheetMaterial, fields, modifier) {
    return false;
  },
  remove: function (userId, sheetMaterial) {
    return false;
  }
});
