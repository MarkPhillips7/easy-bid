import Future from 'fibers/future';
// import axios from 'axios';
import request from 'superagent';
import AWS from 'aws-sdk';

const getEmailAddressForEmail = (user) => {
  if (!user || !user.emails || user.emails.length < 1 || !user.profile) {
    return undefined;
  }
  return `${user.profile.firstName} ${user.profile.lastName} <${user.emails[0].address}>`;
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
  sendReportEmail: function(bidControllerData, reportId) {
    check(bidControllerData, {
      selections: [Schema.Selection],
      selectionRelationships: [Schema.SelectionRelationship],
      lookupData: Match.Any,
      metadata: Match.Any,
      job: Schema.Job,
      templateLibraries: [Schema.TemplateLibrary],
    });
    check(reportId, String);

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
        let replyTo;
        const bcc = [loggedInUserEmailAddress];
        if (estimatorEmailAddress && estimatorEmailAddress !== loggedInUserEmailAddress) {
          bcc.push(estimatorEmailAddress);
          replyTo = estimatorEmailAddress;
        } else {
          replyTo = loggedInUserEmailAddress;
        }
        SSR.compileTemplate('htmlEmail', Assets.getText('email/job-quote.html'));

        var emailData = {
          "productSelections": [
             { "areaText": "First Floor / Kitchen",
               "quantityText": "2",
               "unitOfMeasure": "each",
               "title": "Base Cabinet",
               "description": "18 in x 23 in x 34.5 in",
               "priceEachText": "$177.36",
               "priceTotalText": "$354.72" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Shirt",
               "priceEachText": "$3.70",
               "priceTotalText": "$48.10" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$3.00",
               "priceTotalText": "$3.00" },
             { "areaText": "First Floor / Kitchen",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Cat",
               "description": "Purrs when happy",
               "priceEachText": "$7.77",
               "priceTotalText": "$7.77" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Rabbit",
               "priceEachText": "$13.50",
               "priceTotalText": "$13.50" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "13",
               "unitOfMeasure": "each",
               "title": "Dog",
               "priceEachText": "$6.00",
               "priceTotalText": "$78.00" },
             { "areaText": "Second Floor / Master Closet",
               "quantityText": "1",
               "unitOfMeasure": "each",
               "title": "Hamburger",
               "description": "beef!",
               "priceEachText": "$9.00",
               "priceTotalText": "$9.00" } ],
          "company":
           { "name": "We Make Cabinets",
             "phoneNumber": "(434) 555-1212",
             "websiteUrl": "www.artisancabinetsok.com",
             "logoUrl": "http://www.artisancabinetsok.com/ARTISAN-LOGO.gif",
             "address":
              { "addressLines": "7 Cabinet Court",
                "city": "Cabinetville",
                "state": "CA",
                "zipCode": "12345" } },
          "customer":
           { "name": "Bob Customer",
             "address":
              { "addressLines": "7 Somewhere Road\nSuite 2",
                "city": "San Francisco",
                "state": "CA",
                "zipCode": "12345" } },
          "job":
           { "id": "w5TReXrdo6afNgAuw",
             "description": "Garage",
             "createdAt": "2017-07-16T01:05:48.276Z",
             "modifiedAt": "2017-07-16T01:05:48.276Z",
             "estimator": "John Cabinetmaker",
             "exclusions": "Stone and glass tops (unless listed above), all plumbing and bath fixtures, electrical equipment, any wood trim not listed above, bonds, demolition, electrical work, plumbing work, appliances, rough carpentry, in-wall blocking.",
             "provisions": "Payment terms: 50% deposit, balance due upon completion",
             "estimatedLeadTime": "4 - 6 weeks from approval of shop drawings.  2 - 3 weeks required for shop drawings.",
             "acknowledgments": "Arch. Drawings dated XXXX\rSpecifications dated XXX\rAddendums XXXX"},
          "subtotal": 796.25,
          "salesTax": 39.81,
          "nontaxableInstallAmount": 183.53,
          "grandTotal": 979.7
        };

        Email.send({
          to,
          replyTo,
          bcc,
          from: "Mailgun Sandbox <postmaster@sandbox238ce6ef48964def950cd7f2415500d0.mailgun.org>",
          subject: reportName.replace(/\.pdf/gi, ''),
          // text: "Please see attached quote.",
          html: SSR.render('htmlEmail', emailData),
          attachments: [attachment]
        });
        reportFuture.return(reportName);
      }
    }));
    return reportFuture.wait();
  }
});
