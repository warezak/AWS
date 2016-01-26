# AWS
AWS Projects

1)  Convert PDF file to JPG images using AWS Lambda & S3 with node.js

S3 Put triggers Lambda node.js code to process file. File is loaded locally to /tmp direcory. PDF File is then converted to jpg images (one for each pdf page) using Ghostscript. Files are placed in /tmp directory. Newly created files are then uploaded to S3.

2) Convert PDF file to JPG images using E2C & S3 with node.js

Enter S3 file details (bucket/key) in code to process file. File is downloaded locally. PDF File is then converted to jpg images (one for each pdf page) using Ghostscript. Files are placed in /tmp directory. Newly created files are then uploaded to S3.
