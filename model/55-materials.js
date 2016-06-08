Materials = new Mongo.Collection("materials");

Schema.Material = new SimpleSchema({
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
});

Materials.attachSchema(Schema.Material);

Materials.allow({
  insert: function (userId, material) {
    return false;
  },
  update: function (userId, material, fields, modifier) {
    return false;
  },
  remove: function (userId, material) {
    return false;
  }
});
