var AWS = require('aws-sdk');
var fs = require('fs');
var async = require('async');
var gs = require('gs');
var s3 = new AWS.S3();

var srcBucket = 'pdf2jpg';
var dstBucket = 'pdf2jpg-up';
var srcKey  = 'test1.pdf';
var pathtofile = '/home/ec2-user/node/mys3test/' +srcKey;
var params = {Bucket: srcBucket, Key: srcKey};

console.log('Process PDF2JPG v1');
console.log('bucket1 is ' + srcBucket);
console.log('key1 is    ' + srcKey);
console.log('pathtofile is    ' + pathtofile);


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
		.output(srcKey+'-%d.jpg')
		.input(pathtofile)
		.exec(function(error, stdout, stderr) {
		
			if ( error !== null ) {
				console.log(error);
			}
			else {
				console.log('Created JPG for: '+srcKey);
				callback2(callback3,done);
			}
		})
	
}


function listfiles(callback2,done) {

        //console.log('listfiles');
		
		var path = "/home/ec2-user/node/mys3test";
		var array = [];
		var i=0;
		var itemsProcessed = 0;
		var lastitem = "N";
		
		fs.readdir(path, function(err, items) {
			async.forEach(items, function(err, data) {		
					
				var filename = items[i++];
				var filepath = path + '/' + filename;
				//console.log("Readdir  File: " + filepath);
				itemsProcessed++;
				if(itemsProcessed === items.length) {
					console.log(itemsProcessed);
					lastitem = "Y";
				}
				
				
				if ((filename.indexOf(srcKey) !=-1) && ( filename !== srcKey))  {
					fs.stat(filepath, function(err, stat) {
                    	//console.log('List file: ',filename);
						//console.log('List size: ',stat.size);
						callback2(filename,filepath,stat.size,lastitem,done);
					});
				}
				else {
				
					if (lastitem === "Y") {
						console.log('done 2');
						done();
					}
				}

			});
			
		});
		

}

function upload(filename,myfile,mysize,lastitem,callback) {


        //console.log('into upload function');
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
				
				if (lastitem === "Y") {
					console.log('done1');
					callback();
				}
		
			}

		});
			
}

								
function done() {

	console.log('reached end');
	
}								


gets3file(transform,listfiles,upload);




	