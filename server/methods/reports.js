import Future from 'fibers/future';
import axios from 'axios';
import AWS from 'aws-sdk';

const getJsReportOnlineAuthorizationInfo = () => {
  const authorizationHashParts = Meteor.settings.private.jsreportonline.authorizationHash.split(':');
  return {
    username: authorizationHashParts[0],
    password: authorizationHashParts[1]
  };
};

const getAmazonS3 = () => {
  const myCredentials = new AWS.Credentials(
    Meteor.settings.private.aws.accessKeyId,
    Meteor.settings.private.aws.secretAccessKey);
  const myConfig = new AWS.Config({
    credentials: myCredentials,
    region: 'us-east-1'
  });
  return new AWS.S3(myConfig);
};

const generateQuoteReport = ({bidControllerData, forceGenerate, jsReportOnlineId, reportData, reportName}) => {
};

Meteor.methods({
  getQuoteReport: function(bidControllerData, forceGenerate, jsReportOnlineId, reportData, reportName) {
    check(bidControllerData, {
      selections: [Schema.Selection],
      selectionRelationships: [Schema.SelectionRelationship],
      lookupData: Match.Any,
      metadata: Match.Any,
      job: Schema.Job,
      templateLibraries: [Schema.TemplateLibrary],
    });
    check(forceGenerate, Match.Any);
    check(jsReportOnlineId, String);
    check(reportData, Object);
    check(reportName, String);

    const reportFuture = new Future();
    const userId = Meteor.userId();
    const {job} = bidControllerData;
    const existingReport = Reports.findOne({
      reportType: Constants.reportTypes.jobQuote,
      reportTemplate: Constants.reportTemplates.jobQuoteStandard,
      jobId: job._id,
    }, {
        sort: {
          'createdAt': -1,
        },
      }
    );
    if (existingReport) {
      const s3 = getAmazonS3();
      const params = {
        Bucket: Meteor.settings.private.aws.bucketName,
        Key: existingReport.amazonS3Key,
      };
      const reportName = existingReport.name;

      console.log(`about to download '${reportName}' report`);
      s3.getObject(params, (err, data) => {
        if (err) {
          console.log(`Failed to download '${reportName}' report`, err);
          reportFuture.return(err);
        } else {
          console.log(`Downloaded '${reportName}' report`);
          reportFuture.return(data.Body);
        }
      });
      return reportFuture.wait();
    }

    const reportUrl = Meteor.settings.private.jsreportonline.url;
    const data = {
      "template": {
        "shortid": jsReportOnlineId
      },
      "data": reportData,
    };
    const {username, password} = getJsReportOnlineAuthorizationInfo();
    axios({
      method: 'post',
      url: reportUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username,
        password
      },
      data,
      responseType: 'arraybuffer'
    })
    .then(function (response) {
      // console.log('it worked this time', response);
      reportFuture.return(response.data);

      console.log('Now upload report to amazon S3');
      const reportId = Random.id();
      const s3 = getAmazonS3();
      const params = {
        Bucket: Meteor.settings.private.aws.bucketName,
        Key: reportId,
        Body: response.data
      };

      console.log(`really about to upload '${reportName}' report`);
      s3.upload(params, (err, data) => {
        if (err) {
          console.log(`Failed to upload '${reportName}' report`, err);
        } else {
          console.log(`Uploaded '${reportName}' report as ${reportId}`);
          const report = {
            _id: reportId,
            reportType: Constants.reportTypes.jobQuote,
            reportTemplate: Constants.reportTemplates.jobQuoteStandard,
            jsReportOnlineId: Constants.jsReportOnlineIds.jobQuote,
            amazonS3Key: data.Key,
            companyId: job.companyId,
            jobId: job._id,
            name: reportName,
            createdBy: userId,
            createdAt: new Date(),
          }
          const newReportId = Reports.rawCollection().insert(report);
          console.log(`Saved '${reportName}' report as ${newReportId}`);
        }
      });
    })
    .catch(function (error) {
      console.log(error);
      reportFuture.return(error);
    });
    return reportFuture.wait();

    // Can maybe do something like this when async await work (I think problem is angular2-now)
    // const reportUrl = Meteor.settings.private.jsreportonline.url;
    // const data = {
    //   "template": {
    //     "shortid": jsReportOnlineId
    //   },
    //   "data": reportData,
    // };
    //
    // let result;
    // const {job} = bidControllerData;
    // const {username, password} = getJsReportOnlineAuthorizationInfo();
    // try {
    //   const jsReportOnlineResponse = await axios({
    //     method: 'post',
    //     url: reportUrl,
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     auth: {
    //       username,
    //       password
    //     },
    //     data,
    //     responseType: 'arraybuffer'
    //   });
    //   const reportId = Random.id();
    //   const myCredentials = new AWS.Credentials(
    //     Meteor.settings.private.aws.accessKeyId,
    //     Meteor.settings.private.aws.secretAccessKey);
    //   const myConfig = new AWS.Config({
    //     credentials: myCredentials,
    //     region: 'us-east-1'
    //   });
    //   const s3 = new AWS.S3(myConfig);
    //   const params = {
    //     Bucket: Meteor.settings.private.aws.bucketName,
    //     Key: reportId,
    //     Body: jsReportOnlineResponse.data
    //   };
    //   const s3UploadPromise = new Promise(function(resolve, reject) {
    //     s3.upload(params, function(err, data) {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(data);
    //       }
    //     });
    //   });
    //   const s3UploadResponse = await s3UploadPromise;
    //   const report = {
    //     _id: reportId,
    //     reportType: Constants.reportTypes.jobQuote,
    //     reportTemplate: Constants.reportTemplates.jobQuoteStandard,
    //     jsReportOnlineId: Constants.jsReportOnlineIds.jobQuote,
    //     amazonS3Key: s3UploadResponse.Key,
    //     companyId: job.companyId,
    //     jobId: job._id,
    //     name: reportName,
    //     createdBy: Meteor.userId()
    //   }
    //   Reports.insert(report);
    //   return(jsReportOnlineResponse.data);
    // }
    // catch(err) {
    //   console.log('failed to generateQuoteReport', err);
    // }
  }
});
