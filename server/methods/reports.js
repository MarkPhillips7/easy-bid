import Future from 'fibers/future';
import axios from 'axios';

Meteor.methods({
  generateReport: function(reportData) {
    check(reportData, Object);
    const reportUrl = Meteor.settings.private.jsreportonline.url;
    const data = {
      "template": {
        "shortid": "-1_p0OYdp"
      },
      "data": reportData,
    };

    const reportFuture = new Future();
    let result;
    const authorizationHashParts = Meteor.settings.private.jsreportonline.authorizationHash.split(':');
    axios({
      method: 'post',
      url: reportUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: authorizationHashParts[0],
        password: authorizationHashParts[1]
      },
      data,
      responseType: 'arraybuffer'
    })
    .then(function (response) {
      // console.log(response);
      reportFuture.return(response.data);
    })
    .catch(function (error) {
      console.log(error);
      reportFuture.return(error);
    });
    return reportFuture.wait();
  }
});
