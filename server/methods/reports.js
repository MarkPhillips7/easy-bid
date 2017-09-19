import Future from 'fibers/future';
// import axios from 'axios';
import request from 'superagent';
import AWS from 'aws-sdk';

const getEmailAddressFor = (firstName, lastName, emailAddress) => {
  return `${firstName} ${lastName} <${emailAddress}>`;
};

const getEmailAddressForEmail = (user) => {
  if (!user || !user.emails || user.emails.length < 1 || !user.profile) {
    return undefined;
  }
  return getEmailAddressFor(user.profile.firstName, user.profile.lastName, user.emails[0].address);
};

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

    // console.log(reportData);

    const reportFuture = new Future();
    const userId = Meteor.userId();
    const {job} = bidControllerData;
    if (!forceGenerate) {
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
      if (existingReport && existingReport.createdAt > job.modifiedAt) {
        const s3 = getAmazonS3();
        const params = {
          Bucket: Meteor.settings.private.aws.bucketName,
          Key: existingReport.amazonS3Key,
        };
        const reportName = existingReport.name;

        // console.log(`about to download '${reportName}' report`);
        s3.getObject(params, (err, data) => {
          if (err) {
            console.log(`Failed to download '${reportName}' report`, err);
            reportFuture.return(err);
          } else {
            // console.log(`Downloaded '${reportName}' report`);
            reportFuture.return({reportId: existingReport._id, reportBody: data.Body});
          }
        });
        return reportFuture.wait();
      }
    }

    const reportUrl = Meteor.settings.private.jsreportonline.url;
    const data = {
      "template": {
        "shortid": jsReportOnlineId
      },
      "data": reportData,
      "options": {
        "Content-Disposition": "attachment; filename=myreport.pdf",
      }
    };
    const {username, password} = getJsReportOnlineAuthorizationInfo();
    request
    .post(reportUrl)
    .set('Content-Type', 'application/json')
    .responseType('arraybuffer')
    .auth(username, password)
    .send(data)
    .end(function (err, response) {
      if (err || !response.ok) {
        const error = err || 'unexpected error generating report';
        console.log(error);
        reportFuture.return(error);
      } else {
        // console.log('it worked this time', response);

        // console.log('Now upload report to amazon S3');
        const reportId = Random.id();

        reportFuture.return({reportId, reportBody: response.body});

        const s3 = getAmazonS3();
        const params = {
          Bucket: Meteor.settings.private.aws.bucketName,
          Key: reportId,
          Body: response.body
        };

        console.log(`really about to upload '${reportName}' report`);
        s3.upload(params, (err, data) => {
          if (err) {
            console.log(`Failed to upload '${reportName}' report`, err);
          } else {
            // console.log(`Uploaded '${reportName}' report as ${reportId}`);
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
            // console.log(`Saved '${reportName}' report as ${newReportId}`);
          }
        });
      }
      // axios changes all header names to lowercase, which seems to prevent jsreportsonline from understanding content-disposition
      // axios({
      //   method: 'post',
      //   url: reportUrl,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   auth: {
      //     username,
      //     password
      //   },
      //   data,
      //   responseType: 'arraybuffer'
      // })
      // .then(function (response) {
      // ...
      // .catch(function (error) {
      //   console.log(error);
      //   reportFuture.return(error);
      // });
    })
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
  },
  sendQuoteReportEmail: function(bidControllerData, reportId, reportData) {
    check(bidControllerData, {
      selections: [Schema.Selection],
      selectionRelationships: [Schema.SelectionRelationship],
      lookupData: Match.Any,
      metadata: Match.Any,
      job: Schema.Job,
      templateLibraries: [Schema.TemplateLibrary],
    });
    check(reportId, String);
    check(reportData, Object);

    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    const loggedInUser = Meteor.users.findOne(this.userId);
    const estimator = Meteor.users.findOne(bidControllerData.job.estimatorId);
    const customer = Meteor.users.findOne(bidControllerData.job.customerId);

    if (!loggedInUser) {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }

    const existingReport = Reports.findOne(reportId);
    if (!existingReport) {
      throw new Meteor.Error('report-not-found', 'Sorry, report not found.');
    }

    const reportFuture = new Future();

    const s3 = getAmazonS3();
    const params = {
      Bucket: Meteor.settings.private.aws.bucketName,
      Key: existingReport.amazonS3Key,
    };
    const reportName = existingReport.name;

    s3.getObject(params, Meteor.bindEnvironment((err, data) => {
      if (err) {
        console.log(`Failed to download '${reportName}' report`, err);
        reportFuture.return(err);
      } else {
        const filename = reportName;
        const attachment = {
          filename,
          content: data.Body
        }

        const loggedInUserEmailAddress = getEmailAddressForEmail(loggedInUser);
        const estimatorEmailAddress = getEmailAddressForEmail(estimator);
        const customerEmailAddress = getEmailAddressForEmail(customer);
        const to = customerEmailAddress;
        let from;
        let replyTo;
        const bcc = [loggedInUserEmailAddress];
        if (estimatorEmailAddress && estimatorEmailAddress !== loggedInUserEmailAddress) {
          bcc.push(estimatorEmailAddress);
          replyTo = estimatorEmailAddress;
          from = getEmailAddressFor(estimator.profile.firstName, estimator.profile.lastName, Meteor.settings.private.email.fromAddress);
        } else {
          replyTo = loggedInUserEmailAddress;
          from = getEmailAddressFor(loggedInUser.profile.firstName, loggedInUser.profile.lastName, Meteor.settings.private.email.fromAddress);
        }
        SSR.compileTemplate('htmlEmail', Assets.getText('email/job-quote.html'));

        Email.send({
          to,
          replyTo,
          bcc,
          from,
          subject: reportName.replace(/\.pdf/gi, ''),
          html: SSR.render('htmlEmail', reportData),
          attachments: [attachment]
        });
        reportFuture.return(reportName);
      }
    }));
    return reportFuture.wait();
  }
});
