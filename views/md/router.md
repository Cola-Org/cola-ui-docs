# Router(路由)

Router的功能是用于管理网页内的跳转，方便用户实现SPA类应用，SPA即Single Page Application（单页面应用）。
对于移动应用而言，SPA应用可以减轻系统的负担，提高前端的相应速度。利用SPA技术开发者有机会再视图的切换过程中插入过渡动画，这样可以改善用户界面的交互效果。

不过SPA也会带来一些额外的问题:
* 开发者需要自行管理Path（Hash或HTML5中新增的State）与页面内行为之间的映射关系。否则系统将无法正确的响应浏览器的前进、后退操作，也无法正确的响应Android的回退按钮。
* 依赖Hash或State可能不利于网站SEO，不利于社交URL分享。要解决这个问题，开发者需要付出额外的工作。

尽管SPA带来了新的问题，但他仍然会是未来移动开发领域的趋势，毕竟他带来的用户体验是显而易见的。

目前页面内的Path管理有两种实现方式：

* 利用Hash，即URL中"#"后面的内容。开发者可以在不刷新页面的情况下改变这部分内容。并将其作为Path与页面子内容或行为相关联。这样的做法难以对SEO的伤害较大。
 为了解决这个问题Google曾提出了"#!"规范（https://developers.google.com/webmasters/ajax-crawling/docs/specification ），目前大多数的搜索引擎都已经支持了此规范。
 尽管如此，这入了Hash的URL看起来不符合多数人的视频审美习惯却也是个不争的事实。
* 利用State。在HTML5中提供了两个新的方法——pushState()和replaceState()使得开发者可以在不刷新页面的情况下改变页面的URL。同时还提供了onStateChange事件来监听state的改变。
 有了这个方法只要再配合一些Server端的处理技巧，我们就可以有机会完美的解决SPA和SEO之间的冲突了。
 利用State方式实现SPA，其URL看起来与用户通常的习惯是完全一致的，可以实现非常自然的RESTFUL应用。不过，当用户点击刷新按钮时Server端的处理逻辑必须能够正确的处理这种URL，
 否则我们使用State的初衷就丧失了。至于具体如何实现相应的Server端逻辑这已经超出了本文的范畴。
 
Cola支持以上的所有3种PATH管理方法（#、#!、State）。

在Cola中使用Router功能的基本方法是定义若干个Router，方法大致如下：
```
cola.route("/list", {
	title: "Item List"
	templateUrl: "/list.html"
});
```

cola.route()方法的第一个参数是匹配的路径。如果你使用的Hash那么这是的Path就是URL中"#"或"#!"后面的内容。如果你使用的是State，那么这里的Path就对应实际URL中的子路径。
定义Path时不必以"/"开头，Cola会自行为为我们处理两种情况。如果path与name是相同的（不用在意paht或name是否以"/"开头），那么path可以省略。

Path除了可以是一个特定的字符串之外，也可以是一个用于匹配一类URL的表达式。例如假设我们设计了一种RESTFUL的URL——"/product/PDC0861A"，其中的PDC0861A代表某个Product的商品编码。
此时我们可以定义Path为——"/product/:productSN"，这样该Router就能匹配到这一类URL。同时将实际的Product编码解析出来，存放到名为productSN的参数中。
在实际的使用过程中通常有两种方式来获取这种参数：

一种方法是直接通过Router的param属性，param属性是一个JSON对象，其中会保存当前的PATH参数。以上面的URL为例，我们可以通过`router.param.productSN`来获得产品编码的值。

另一种方法是通过Router装载的Javascript中的cola入口方法（要了解通过Router装载的Javascript请继续向下阅读此文），例如在某个Router装载的.js文件中这些写...
```
// 这里的param参数就是当前Router获得的PATH参数，在主Model的初始化方法中我们通常会忽略这个参数
cola(function(model, param) {
	... ...
});
```

cola.route()方法的第二个参数用于处理前面路径的Router，它有以下一些主要的功能...
	
* title： 用于定义当该Router被激活后主页面的Title。即Cola会自动利用此属性的值设置document.title。

* tempalteURL： 如果希望Router自动为我们装载一段HTML到页面中可以定义此URL。如果我们同时定义了target，那么新的内容将被渲染到target代表的DOM中。
target既可以是一个DOM对象也可以一段CSS Selector。如果没有定义target，那么Cola会首先尝试在页面中寻找第一个带有c-viewport Class的DOM，如果这样的DOM不存在则直接替换过document.body的内容。

	按照HTML的规范，在进行这种动态的HTML渲染时，浏览器并不会处理HTML中Javascript和CSS。
	因此，如果需要在此时一同装载Javascript和CSjsUR，我们需要把他们定义在独立的文件中，并通过Router的jsUrl和cssUrl属性来通知Cola装载。
	jsUrl和cssUrl属性也支持以数组的形式定义多个URL。如果要装载的Javascript或CSS文件HTML（templateUrl）的相对路径和文件名相同，仅仅后缀名不同，那么他们可以简写成`$`或者`$.js`、`$.min.css`这种形式。

* 默认情况下，Cola会为每一个Router创建一个子Model，该Model的parent指向页面的主Model。
在该Router装载执行的Javascript中我们得到的都是新创建的子Model，这个子Model也会在Router离开时自动被销毁。

* 有时我们定义Router可能并不是为了自动装载一段HTML。或者我们可能希望通过Javascript自行实现类似的装载。
此时，我们可以为Router定义enter和leave两种监听器来监听该Router被激活和离开时的事件。例如：
   
	```
	// 下面enter监听器的第一个参数是当前Router，第二个参数是该Router对应的子Model
	cola.route("item/:itemId", {
		enter: function(router, model) {
			... ...
		}
	});
	```
	
	如果您只需要为Router定义一个enter事件的话，上面的代码也可以简化成这样...
	```
	// 下面enter监听器的第一个参数是当前Router，第二个参数是该Router对应的子Model
	cola.route("item/:itemId", function(router, model) {
		... ...
	});
	```
	 
	也可以利用全局的routerSwitch事件来监听每一次的Router切换，例如：
	```
	cola.on("routerSwitch", function() {
		
	});
	```
	
* redirectTo： 当某个Router被激活后自动跳转到此路径。
* data： data属性是一个可以自由定义的属性。Cola并不会对它进行任何处理。我们可以根据自己的需要在data属性中保存一组与该Router相关的数据以供代码取用。

有时我们可能需要通过代码来改变当前页面的Path，此时我们可以利用Cola提供的cola.setRoutePath()方法。
使用此方法时如果传入的path是以"#"开头的，那么Cola会认为这是一个Hash，否则Cola会以pushState的方式来处理。

很多时候我们都会通过`<a>`超链来实现页面间的跳转，这样的做法可以很好的兼容搜索引擎的工作原理。可是在以State模式使用Router的情况下这种用法就会有些问题。
State模式下所有页面内Path看起来都是真实的URL，但是当用户点击某个超链时我们实际希望产生的是页面内的State切换，而不是真实的URL跳转。
Cola提供了既可以兼容SEO又可以实现业内切换的超链支持。其使用方法非常简单，只要在这个`<a>`上添加一个名为state的Class。例如：
```
<a class="state" href="/product/PDC0861A">PDC0861A</a>
```

这样，Cola就会自动拦截用户点击该超链的动作，并将其处理成页面内的State切换。

最后，通过Cola的全局"defaultRoutePath"参数可以定义Cola默认按照什么path的规则来处理空Hash或空State，例如：
```
cola.setting("defaultRouterPath", "/home");
```