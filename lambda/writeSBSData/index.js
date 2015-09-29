console.log('Loading event');

var AWS = require('aws-sdk');
var DATA_TABLE = '';
var ddb = new AWS.DynamoDB();

exports.handler = function (event, context) {
  console.log("Putting data into DynamoDB:", event);
  ddb.putItem({
    TableName: DATA_TABLE,
    Item: {
      sbsID: { S: event.sbsid.toString() },
      sensors: { S: JSON.stringify(event.data.sensors) },
      recordTimestamp: { N: Date.now().toString() }
    }
  }, function (err, data) {
    console.log(data);
    context.done(err,data);
  });
};
