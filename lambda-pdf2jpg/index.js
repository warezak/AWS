var AWS = require('aws-sdk');
var fs = require('fs');
var async = require('async');
var gs = require('gs');
var util = require('util');
var s3 = new AWS.S3();


exports.handler = function(event, context) {

	console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey    = event.Records[0].s3.object.key;
	var dstBucket = srcBucket;
	//var dstKey    = "resized-" + srcKey;
	var dstKey    =  srcKey.slice(0, -4);
	
	//var srcBucket = 'pdf2jpg';
	//var dstBucket = 'pdf2jpg-up';
	//var srcKey  = 'test1.pdf';
	var pathtofile = '/tmp/' +srcKey;
	var params = {Bucket: srcBucket, Key: srcKey};
	
	console.log('Process PDF2JPG v1');
	console.log('Bucket is ' + srcBucket);
	console.log('Key is    ' + srcKey);
	console.log('Pathtofile is    ' + pathtofile);
	
	var typeMatch = srcKey.match(/\.([^.]*)$/);
	if (!typeMatch) {
		console.error('unable to infer file type for key ' + srcKey);
		return;
	}
		
	var imageType = typeMatch[1];
	if (imageType != "pdf" && imageType != "PDF") {
		console.log('skipping non-pdf ' + srcKey);
		return;
	}
		
		
	
	function gets3file(callback1,callback2,callback3) {
	
			var file = fs.createWriteStream(pathtofile);
			s3.getObject(params).createReadStream().pipe(file);
	
			file.on('finish', function () {
					console.log('file has been saved locally');
					callback1(callback2,callback3);
			});
	
	
	}
	
	function transform(callback2,callback3) {
			
			console.log('transform file');
			
			gs()
			.batch()
			.nopause()
			.device('jpeg')
			.output('/tmp/'+dstKey+'-%d.jpg')
			.input(pathtofile)
			.exec(function(error, stdout, stderr) {
			
				if ( error !== null ) {
					console.log(error);
				}
				else {
					console.log('Created JPG for: '+srcKey);
					callback2(callback3);
				}
			})
		
	}
	
	
	function listfiles(callback2) {
	
			//console.log('listfiles');
			
			var path = "/tmp";
			var array = [];
			var i=0;
			
			fs.readdir(path, function(err, items) {
				async.forEach(items, function(err, data) {		
						
					var filename = items[i++];
					var filepath = path + '/' + filename;
					console.log("Readdir  File: " + filepath);
					
					if ((filename.indexOf(dstKey) !=-1) && ( filename !== srcKey))  {
						fs.stat(filepath, function(err, stat) {
							//console.log('List file: ',filename);
							//console.log('List size: ',stat.size);
							callback2(filename,filepath,stat.size);
						});
					}
	
	
				});
				
			});
			
	
	}
	
	function upload(filename,myfile,mysize) {
	
	
		// console.log('into upload function');
			//console.log('filename: ', filename);
			//console.log('file: ', myfile);
			//console.log('size: ', mysize);
	
			var path = "/tmp";
			var i = 0;
				
			var bodyStream = fs.createReadStream( myfile );
			var params = {
					Bucket   	 : dstBucket,
					Key			    : filename,
					ContentLength : mysize,
					Body          : bodyStream
			};
				
				
			s3.putObject(params, function(err, data) {
		
				if(err) {
						console.log('error upload');
						console.log(err);
				}
				else 
				{
					//console.log(data);
					console.log('s3 upload for ', myfile);
			
				}
	
			});
				
	}
	
			
	
	
	gets3file(transform,listfiles,upload);
	

	
}


