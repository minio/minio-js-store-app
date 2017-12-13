# Javascript Shopping App [![Slack](https://slack.minio.io/slack?type=svg)](https://slack.minio.io)

![minio_JS1](https://github.com/minio/minio-js-store-app/blob/master/docs/screenshots/minio-JS1.jpg?raw=true)

本示例将会指导你如何构建一个使用Minio Server做存储服务的简单的Node.js的购物APP。我们将使用[Minio Javascript Client SDK](https://docs.minio.io/docs/javascript-client-quickstart-guide)来获取Minio Server上的应用图片资源。

你可以通过[这里](https://github.com/minio/minio-js-store-app)获取完整的代码，代码是以Apache 2.0 License发布的。


## 1. 前提条件

* 从[这里](https://docs.minio.io/docs/minio-client-quickstart-guide)下载并安装mc。
* 从[这里](https://docs.minio.io/docs/minio )下载并安装Minio Server。

## 2. 依赖

* [Express web framework](http://expressjs.com).
* [Handlebars](http://handlebarsjs.com).

我们会使用Express做为应用框架，并使用Handlebars做为渲染引擎。

## 3. 安装

按照下面所示获取本示例的代码，然后运行npm install来安装express，handlebars和minio node-modules。

`minio-store.js`将做为我们app的入口。

```sh
git clone https://github.com/minio/minio-js-store-app
cd minio-js-store-app
npm install
```

##  4. 设置存储桶

1. 我们已经创建了一个公开的Minio Server(https://play.minio.io:9000) 供大家进行开发和测试。Minio Client `mc`已经预设好和play server的配置。下载[`mc`](https://docs.minio.io/docs/minio-client-quick-start-guide)来执行下面的操作。
调用`mc mb`命令，在play.minio.io上创建一个名叫`minio-store`的存储桶。更多关于`mc mb`命令的细节，请参考[这里](https://docs.minio.io/docs/minio-client-complete-guide#mb)。

   ```sh
    mc mb play/minio-store
   ```

2. 使用`mc policy`命令可以将存储桶设为可公开读写。更多关于`mc policy`命令的细节，请参考[这里](https://docs.minio.io/docs/minio-client-complete-guide#policy)。
3. 
   ```sh
    mc policy public play/minio-store
   ```

3. 使用`mc cp`命令，将应用的图片上传到`minio-store`这个存储桶中。更多关于`mc cp`命令的细节，请参考[这里](https://docs.minio.io/docs/minio-client-complete-guide#cp)。

   ```sh
   mc cp ~/Downloads/Product-1.jpg play/minio-store/
   mc cp ~/Downloads/Product-2.jpg play/minio-store/
   mc cp ~/Downloads/Product-3.jpg play/minio-store/
   mc cp ~/Downloads/Product-4.jpg play/minio-store/
   ```

   **注意** : 我们已经在play.minio.io上创建了minio-store这个存储桶，并将本示例用到的资源上传上去到这个存储桶了。


## 5. 连接Minio Server

在`minio-store.js`文件，使用`require`引入minio依赖，并使用play server的endpoint，端口和认证信息初使化`minioClient`。

```js
var Minio = require('minio');
var minioClient = new Minio.Client({
 	 endPoint: 'play.minio.io',
     port: 9000,
	 accessKey: 'Q3AM3UQ867SPQQA43P2F',
	 secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG'
});
```

**注意** : 如果是使用本地的Minio Server,需要在上面的代码中加上``secure: false,``。


## 6. 调用listObjects

在minio-store.js中设置好'/'的路由。调用[listObjects]( https://docs.minio.io/docs/javascript-client-api-reference#listObjects)方法，获取minio-store存储桶中所有的文件。listObjects返回商品的url，这些url被push到assets这个数组中，然后将assets这个数组传给`home.handlebars`这个view中。


```js
var minioBucket = 'minio-store'

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
```

## 7. 创建view

遍历`home.handlebars`中的`assets_url`，渲染商品图片的缩略图。为了简单起见，在本示例中我们没有用到数据库来存储商品的信息。如果你需要的话，你可以将这些信息存到你的数据库中。

```js
<!-- Page Features -->
<div class="row text-center">
	{{#each url}}
     <div class="col-md-3 col-sm-6 hero-feature">
          <div class="thumbnail">
               <img src="{{this}}" max-height=200 max-width=200 alt="">
               <div class="caption">
                     <h3>Product Name</h3>
                     <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                     <p> <a href="#" class="btn btn-primary">Buy Now!</a> <a href="#" class="btn btn-default">More Info</a> </p>
                </div>
           </div>
      </div>
  {{/each}}   
 </div>
```

## 8. 运行APP

完整的代码在[这里](https://github.com/minio/minio-js-store-app)。执行下列操作来启动app server。

  ```sh
  git clone https://github.com/minio/minio-js-store-app
  cd minio-js-store-app
  npm install
  node minio-store.js
  ```

  访问http://localhost:3000 来查看这个app。

## 9.  了解更多。

- [Using `minio-js` client sdk with Minio Server](https://docs.minio.io/docs/javascript-client-quickstart-guide).
- [Minio JavaScript Client SDK API Reference](https://docs.minio.io/docs/javascript-client-api-reference).
