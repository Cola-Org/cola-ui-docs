# 路由系统
要定义Cola Shell中的频道和卡片，首先需要了解一下Cola Shell中的路由系统（Router）。
因为所有频道和卡片的切换都是由路由的转换来控制的，这也意味着所有的频道和卡片都应该对应一个特有的URL路径。

在Cola Shell中定义频道和卡片的方法是十分相似的，因为事实上我们定义的是一个路由。频道和卡片只是在显示方式上略有不同而已。
配置一个频道或路径的基本方法如下:

```
// 配置一个频道
App.channel({
	path: "/home",
	icon: "home"
});

// 配置一个普通的路由，即卡片
App.router({
	path: "/login",
	class: "open",
	animation: "slide down",
	htmlUrl: "shell/account/login"
});
```
### path属性

这里的path就是该路由匹配的URL。

此处的path并不一定是一个固定的值，有些符合RESTFUL规范的URL中是带有动态的参数内容的，例如`/product/PDC0861A`。
这是我们将path定义成`/product/:productSN`来匹配这一类参数，其中`productSN`是可以任意定义的参数名。
将来Cola UI会把URL中的`PDC0861A`识别成`productSN`参数的参数值，并传入到相应的卡片中。

如果把path定义成`/product/:productSN?`，那么这个路由不但能匹配`/product/PDC0861A`这样的URL，也能匹配`/product`。
path中的问号代码这段参数是可以不定义的。

关于path的更多介绍请阅读 [Router(路由)](router)

### 其他属性

上面方法的JSON参数还支持下列一些额外属性：

* title	-	频道或卡片对应的标题。当App切换到某个频道或卡片是该标题将显示在浏览器的标题栏中，如果某个路由未定义该属性，那么浏览器标题栏会显示appTitle。
* type	-	用于定义某个频道或卡片具体使用哪种模式来实现。目前支持两种模式iFrame和subView。这里的subView就是轻量级的卡片，Cola Shell默认使用subView模式。
* authRequired	-	此视图是否需要登录后才能访问，默认值为false。如果设置为true，且当前的App状态为为登录。那么Cola Shell将会自动切换到登录的视图。
* htmlUrl	-	要装载的HTML的URL。此属性的值除了可以是一个字符串之外，也可以是一个Function，该Function会在运行时被Cola Shell调用，它应该返回一个字符串作为htmlUrl。
例如下面的例子中，我们总是把当前主框架URL中的QueryString部分取出来并在iFrame页面的URL后面。
```
App.router({
	path: "/item",
	type: "iFrame",
	htmlUrl: function () {
		return "frame/item" + location.search
	}
});
```

#### 频道特有的属性
* icon	-	频道按钮的图标。注意此处需要定义的并不是图片文件的URL，而是一个CSS Class名。在现代的App开发中，很多时候我们并不直接使用图片，而是是有FontAwesome等矢量图标。
此处具体可选的图标可参考 http://semantic-ui.com/elements/icon.html 。
另外，你也可以引入或定义自己的矢量图标，请参考 http://www.iconfont.cn 。
* menuClass	-	频道按钮的CSS Class。

#### 卡片特有的属性
* name	-	频道或卡片的名称，这个名称目前只对轻量级的频道或卡片而言是有意义的。
假设某个卡片的名称是`product`，那么Cole Shell在创建这个卡片时会首先创建一个id为`subViewProduct`的DIV，并将卡片的内容装载到这个DIV中。
同时，如果你需要为某个轻量级卡片的内容定义CSS时，我们强烈的建议您在没有个CSS定义前添加`#subViewProduct`作为前缀。
这样做的目的是为了防止卡片内部的CSS声明干扰到主框架及其他卡片中的内容。
多数情况下，我们可能并不需要手工定义name这个属性。Cola Shell会自动利用path按照驼峰命名的规则生成一个默认的name。
比如当我们定义path为`/account/login`时，Cola Shell会自动设置name为`accountLogin`。
只有当你对Cola Shell自动生成的name不满意时，才需要可以自己来定义name属性。
* jsUrl	-	卡片需要装载的Javascript文件，默认值为`$`。`$`表示自动装载与html同位置下同名的.js文件。也可以利用`$.min.js`这种方式来自定义js文件的后缀名。
如果不希望Cola Shell自动装载这样的js文件的话，可以将此属性设置为null。
* cssUrl	-	卡片需要装载的CSS文件，默认值为`$`。`$`表示自动装载与html同位置下同名的.css文件。也可以利用`$.min.css`这种方式来自定义CSS文件的后缀名。
                如果不希望Cola Shell自动装载这样的CSS文件的话，可以将此属性设置为null。
* class	-	用于定义卡片的外观风格。此属性只对卡片有效，目前支持三种风格frame、open、free
	* frame	-	框架式卡片，这种卡片会自带一个标题栏和回退按钮。
	
	![框架式卡片](/images/docs/card-frame.png)
	* open	-	开放式卡片，这种卡片自带一个回退按钮，但整体布局是开放式的。
	
	![开放式卡片](/images/docs/card-open.png)
	* free	-	自由式卡片，这种卡片不会带入任何默认的显示元素。所有的内容都需要自己来定义。
* animation	-	用于切入的动画效果。此属性只对卡片有效。默认值为slide left，其他常用的动画效果有slide down、fade、scale。
具体请参考 http://semantic-ui.com/modules/transition.html