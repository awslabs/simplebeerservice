/*
Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Note: Other license terms may apply to certain, identified software files contained within or
distributed with the accompanying software if such terms are included in the directory containing
the accompanying software. Such other license terms will then apply in lieu of the terms of the
software license above.
*/
console.log('Loading event');

var AWS = require('aws-sdk');
var UNIT_TABLE = '';
var db = new AWS.DynamoDB();

function sbsJSONParse(items) {
  var sbsInfo = {};
  for (i in items) {
    sbsInfo[items[i].sbs_id.S] = {
      full:items[i].full.S,
      short:items[i].short.S,
      color: [
        items[i].color.NS[0],
        items[i].color.NS[1],
        items[i].color.NS[2]
      ],
      location: [
        items[i].location.NS[0],
        items[i].location.NS[1]
      ]
    }
  }
  return sbsInfo;
}

exports.handler = function(event, context) {

  if (event.sbsid === undefined) {
    var params = {
      TableName: DYNAMO_TABLE,
      Limit:50,
      AttributesToGet: ['color','location','full','short','sbs_id']
    };

    db.scan(params, function(err, data) {
      if (err) {
        console.log("There was an error.");
        context.fail(err);
      } else {
        context.succeed(setSBSJson(this.data.Items))
      }
    });

  } else {
    var params = {
      TableName: UNIT_TABLE,
      Limit:1,
      Select: 'SPECIFIC_ATTRIBUTES',
      AttributesToGet: ['color','location','full','short','sbs_id'],
      KeyConditions: {
        sbs_id: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [{
            S: event.sbsid
          }]
        }
      }
    };

    db.query(params, function(err, data) {
      context.done(err, sbsJSONParse(this.data.Items))
    });
  }
};
