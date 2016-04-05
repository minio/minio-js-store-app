var express = require('express');
var app = express();
var Minio = require('minio');

//instantiate a minioClient Object with an endPoint, Port & Keys
var minioClient = new Minio({
     endPoint: 'play.minio.io',
     port: 9000,
     accessKey: 'Q3AM3UQ867SPQQA43P2F', 
     secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG'
	  
});

// set up handlebars view engine
var handlebars = require('express3-handlebars') .create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.use(express.static(__dirname + '/public'));
 
app.get('/', function(req, res){ 
    var assets=[];
	 
	var objectsStream = minioClient.listObjects('minio-store', '', true)
	objectsStream.on('data', function(obj) {
	    console.log(obj);
		//lets construct the URL with our object name
		assets.push("http://play.minio.io:9000/minio-store/"+obj.name);
	});
	objectsStream.on('error', function(e) {
		console.log(e);
	});
	objectsStream.on('end', function(e) {
		console.log(assets);
		res.render('home', { url: assets });	
	});
         
});

app.get('/about', function(req, res){
	res.render('about');	
});
	 
	
	 
 

app.set('port',process.env.PORT || 3000);

 // custom 404 page
app.use(function(req, res){ res.type('text/plain');
    res.status(404);
    res.render('404');
});

 // custom 500 page
app.use(function(err, req, res, next){ console.error(err.stack);
    res.type('text/plain');
    res.render('500');
});

app.listen(app.get('port'), function(){
console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
