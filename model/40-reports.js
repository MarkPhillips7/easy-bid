Reports = new Mongo.Collection("reports");

// Schema.ReportType = new SimpleSchema({
//   // Using an id since we want these to be able to be referenced even though they are not in their own collection
//   id: {
//     type: String
//   },
//   name: {
//     type: String,
//   },
//   description: {
//     type: String,
//     optional: true
//   },
//   order: {
//     type: Number,
//     optional: true
//   }
// });

Schema.Report = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  // Use Constants.reportTypes (this helps to avoid key collisions)
  reportType: {
    type: String,
  },
  // If reportType is Price, reportTemplate could be 'Drawer Slides'
  reportTemplate: {
    type: String,
    optional: true,
  },
  jsReportOnlineId: {
    type: String,
    optional: true,
  },
  templateLibraryId: {
    type: String, // not optional, but can be some global value to be used by multiple template libraries
  },
  companyId: {
    type: String,
    optional: true,
  },
  jobId: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
  },
  createdBy: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
  },
});

Reports.attachSchema(Schema.Report);
