# Simple Beer Service v5.0

Simple Beer Service is a cloud-connected kegerator that sends sensor data (beer flow, temperature, humidity, sound levels and proximity) to AWS. Simple Beer Service kegerators publish sensor data collected by an IoT device to an Amazon IoT Device Gateway. The Amazon IoT Rule Engine is used to invoke downstream actions in AWS, such as publishing to an Amazon Kinesis Firehose or an Amazon DynamoDB table.

The data visualizations are delivered through a static web application dashboard that opens a web socket connection to the same Amazon IoT Topic, providing a near real-time display of the sensor data. The web application is stored in Amazon S3 and delivered through Amazon’s content delivery network, Amazon CloudFront.

![Simple Beer Service Architecture](readme-images/architecturev5.png)
