console.log('Loading event');

var DATA_TABLE = '';
var UNIT_TABLE = '';
var AWS = require("aws-sdk");

var ddb = new AWS.DynamoDB();
var async = require("async");

console.log('Loading function');

function getData(time, records, callback) {

	if (records.length == 0) {
		callback(null, "No SBS units.");
	}

	var cache = [];

	async.map(records, function(record, inner_callback) {
		console.log("Collecting records for... ", record.sbsID.S.toString(), "at time:", time);
		var params = {
			TableName: DATA_TABLE,
			Limit:10,
			Select: 'SPECIFIC_ATTRIBUTES',
			AttributesToGet: ['recordTimestamp','sensors','sbsID'],
			KeyConditions: {
				sbsID: {
					ComparisonOperator: 'EQ',
					AttributeValueList: [record.sbsID]
				},
				recordTimestamp: {
					ComparisonOperator: 'GE',
					AttributeValueList: [{
						N: time
					}]
				}
			}
		};

		ddb.query(params, function(err, data) {
			if (err) {
				console.log(err);
				callback(err, "Error...");
			}
			else {
				//console.log(this.data.Items)
				//console.log(record.sbsID.S);
				cache = cache.concat(this.data.Items);
				inner_callback(err, null);

			}
		});
	}, function(err, results) {
		callback(err, cache);
	});

}

exports.handler = function(event, context) {

	var time = (new Date().getTime()-10000).toString();
	if ((event.timestamp!==undefined)&&(event.timestamp)) {
		time = event.timestamp;
	}

	var response = new Object();

	async.waterfall([
		function(callback) {
			console.log("Fetching SBS units.");
			var params = {
				TableName: UNIT_TABLE,
				Limit:50,
				AttributesToGet: ['sbsID']
			};
			ddb.scan(params, function(err, data) {
				if (err) {
					console.log("There was an error.");
					context.fail("Could not get SBS unit data.");
				} else {
					callback(null, this.data.Items)
				}
			})
		},
		function(items, callback) {
			//console.log('Items: ',items);
			getData(time, items, callback);
			//console.log("Back from loop.");
		},
		function(cache, callback) {
			//console.log(cache);
			response.records = cache
			response.timestamp = new Date().getTime();
			context.succeed(response);
		}
	]);

};
