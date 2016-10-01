/*
 * Store Application, (C) 2016 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var express = require('express');
var app = express();
var Minio = require('minio');

// Set up handlebars view engine.
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main'
});

// Instantiate a minioClient Object with an endPoint, port & keys.
var minioClient = new Minio.Client({
  endPoint: 'play.minio.io',
  port: 9000,
  accessKey: 'Q3AM3UQ867SPQQA43P2F',
  secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG'
});

var minioBucket = 'minio-store'

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  var assets = [];
  var objectsStream = minioClient.listObjects(minioBucket, '', true)
  objectsStream.on('data', function(obj) {
    console.log(obj);
    // Lets construct the URL with our object name.
    var publicUrl = minioClient.protocol + '//' + minioClient.host + ':' + minioClient.port + '/' + minioBucket + '/' + obj.name
    assets.push(publicUrl);
  });
  objectsStream.on('error', function(e) {
    console.log(e);
  });
  objectsStream.on('end', function(e) {
    console.log(assets);
    // Pass our assets array to our home.handlebars template.
    res.render('home', { url: assets });
  });
});

app.get('/about', function(req, res){
  res.render('about');
});

app.set('port', process.env.PORT || 3000);
// Custom 404 page.
app.use(function(req, res) {
  res.type('text/plain');
  res.status(404);
  res.render('404');
});

// Custom 500 page.
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.type('text/plain');
  res.render('500');
});

// Start the app.
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' +
              app.get('port') + '; press Ctrl-C to terminate.' );
});
