# 基本参数设定

在开始进行实际的开发之前我们首先需要确定一些基本的参数设置。Cola Shell项目的配置参数通常都被放在`/public/app-config.js`中，
在这个文件中我们可以找到这样一段内容。各种默认参数值应该在这里进行配置。

```
/* 系统默认值 */
App.prop({
	appTitle: "Cola-Shell",
	liveMessage: false,
	domainRegExp: /^https*:\/\/shop\.cola-shell\.com\//
});
```

这里支持的参数目前有以下这些：

* appTitle	-	应用的名称，该名称将会显示在浏览器的标题栏等位置。如果利用Cola Shell的国际化资源定义的appTitle项，那么这里的设置将会失效。
* domainRegExp	-	用于判断某个URL是否本应用内部URL的正则表达式。
* contextPath	-	用于设置应用在站点内的根路径，默认值为`/`。假设你的应用的访问地址是`http://www.mycompany.com`或`http://www.mycompany.com:/8080`，
那么该应用的contextPath就是`/`。假设你的应用的访问地址是`http://www.mycompany.com/my-app`，那么该应用的contextPath就是`/my-app`。
* liveMessage	-	是否启用实时消息服务，默认值为true。启用实时消息须提供相应的后端服务支持。
* serviceUrlPattern	-	用于根据URL判断某个请求是否Ajax请求的真个表达式。Cola Shell需要拦截所有的Ajax请求以便于做些统一的处理。
因此，我们建议您在设计时为所有的Ajax类请求的URL加入一个可被区分的规则。Cola Shell中默认使用的规则是将所有`/service/`开头的URL认作Ajax请求。
* serviceUrlPrefix	-	此参数用于处理那种最终部署时，Ajax服务和App分开部署在不同位置的场景。默认值为`/`。
* defaultRouterPath	-	默认的路径，默认值为`/home`。即当用户访问该App的根路径时，App自动将访问路径导向到哪里。
* htmlSuffix	-	静态HTML页面的URL后缀，此项设置的值取决于我们将HTML的路径映射成什么。
例如当我们在WebStorm中利用Node.js和Express进行开发时，访问某个Jade页面时URL通常是不带任何后缀的，此时htmlSuffix应设置为空。
当我们最终Jade生成的HTML打包到App中时，通常是直接通过文件名来访问某个页面的，此时htmlSuffix应设置为`.html`。
* mainView	-	App主页面的URL，默认值为`shell/main-channel-bottom`。
* loginPath	-	App路径页的路径，默认值为`/login`。