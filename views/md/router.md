# Router(路由)

Router的功能是用于管理网页内的跳转，方便用户实现SPA类应用，SPA即Single Page Application（单页面应用）。
对于移动应用而言，SPA应用可以减轻系统的负担，提高前端的相应速度。利用SPA技术开发者有机会再视图的切换过程中插入过渡动画，这样可以改善用户界面的交互效果。

不过SPA也会带来一些额外的问题:
* 开发者需要自行管理Path（Hash或HTML5中新增的State）与页面内行为之间的映射关系。否则系统将无法正确的响应浏览器的前进、后退操作，也无法正确的响应Android的回退按钮。
* 依赖Hash或State可能不利于网站SEO，不利于社交URL分享。要解决这个问题，开发者需要付出额外的工作。

尽管SPA带来了新的问题，但他仍然会是未来移动开发领域的趋势，毕竟他带来的用户体验是显而易见的。

目前页面内的Path管理有两种实现方式：

* 利用Hash，即URL中"#"后面的内容。开发者可以在不刷新页面的情况下改变这部分内容。并将其作为Path与页面子内容或行为相关联。这样的做法难以对SEO的伤害较大。
 为了解决这个问题Google曾提出了"#!"规范（https://developers.google.com/webmasters/ajax-crawling/docs/specification ），目前大多数的收缩引擎都已经支持了此规范。
 尽管如此，这入了Hash的URL看起来不符合多数人的视频审美习惯却也是个不争的事实。
* 利用State。在HTML5中提供了两个新的方法——pushState()和replaceState()使得开发者可以在不刷新页面的情况下改变页面的URL。同时还提供了onStateChange事件来监听state的改变。
 有了这个方法只要再配合一些Server端的处理技巧，我们就可以有机会完美的解决SPA和SEO之间的冲突了。
 利用State方式实现SPA，其URL看起来与用户通常的习惯是完全一致的，可以实现非常自然的RESTFUL应用。不过，当用户点击刷新按钮时Server端的处理逻辑必须能够正确的处理这种URL，
 否则我们使用State的初衷就丧失了。至于具体如何实现相应的Server端逻辑这已经超出了本文的范畴。
 
Cola支持以上的所有3种PATH管理方法（#、#!、State）。

在Cola中使用Router功能的基本方法是定义若干个Router，方法大致如下：
```
cola.router("list", {
	path: "/list",
	title: "Item List"
	templateUrl: "/list.html"
});
```

* cola.router()方法的第一个参数是router的名字，通常没有实际作用。
* cola.router()方法的第二个参数是用于Router的JSON配置对象。其中可以包含下列重要的子属性：

 * path： 用于定义此Router对应的路径。如果你使用的Hash那么这是的Path就是URL中"#"或"#!"后面的内容。如果你使用的是State，那么这里的Path就对应实际URL中的子路径。
   定义Path时不必以"/"开头，Cola会自行为为我们处理两种情况。如果path与name是相同的（不用在意paht或name是否以"/"开头），那么path可以省略。
   
   Path除了可以是一个特定的字符串之外，也可以是一个用于匹配一类URL的表达式。例如假设我们设计了一种RESTFUL的URL——"/product/PDC0861A"，其中的PDC0861A代表某个Product的商品编码。
   此时我们可以定义Path为——"/product/:productSN"，这样该Router就能匹配到这一类URL。同时将实际的Product编码解析出来，存放到名为productSN的参数中。
   
 * tempalteURL： 如果希望Router自动为我们装载一段HTML到页面中可以定义此URL。如果我们同时定义了target，那么新的内容