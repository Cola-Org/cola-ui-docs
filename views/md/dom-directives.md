# DOM指令

### c-bind
普通的绑定，用于建立DOM元素与数据模型间的双向数据绑定，c-bind指令中的内容是表达式。

c-bind可以自动识别`<label>`、`<input>`、`<select>`的不同类型的DOM元素，并按照恰当的方式为之建立数据绑定。
注意: c-bind在处理<label>这类只读的DOM元素时会将数据转义后再绑定，即数据中包含的HTML标记会议文本的形式显示。

### c-repeat
迭代式绑定。用于根据一个数组或集合自动迭代的指令。
基本的形式是： `[[迭代变量名] in ]<目标数据路径>`

例如： `employee in employees`
这里的in关键词和迭代变量名也可以省略，直接定义`employees`，如果这样的话Dorado内部会自动按照`item in employees`来处理。

### c-alias
用于为目标数据定义一个别名，该别名的作用范围是此DOM元素及其中的子DOM。此指令并不产生实际的绑定效果。
基本的形式是： `<目标数据路径> as <别名>`

例如： `father.father as grandpa`

### c-html
类似于c-bind，但不会对其中的HTML标记做转义处理。且不能处理`<input>`、`<select>`等元素。

### c-style
用于绑定dom的style属性，其中可以支持一组绑定表达式。

例如： 
`<div c-style="backgound:bgColor;color:fontColor"></div>`

### c-display
用于控制一个dom是否可见。此指令相当于style.display的快捷方式。

### c-class
用于管理一组className是否要被添加到指定的dom节点上。

例如： `<div c-class="hot:product.isHot; new:product.isNew"></div>` 表示如果product.isHot为true则添加hot到class中，如果product.isNew为true则添加new到class中。

### c-on*
事件绑定。当一个指令是以c-on开始的，那么DoradoUI会把后面的字符串试做事件名并完成一个DOM事件的绑定
例如： `<button c-onclick="showMessage()">Show</button>`

### c-*
属性值绑定。当一个指令是以c-开始的，那么DoradoUI会把后面的字符串试做DOM的Attribute名。

例如： `<button c-disabled="num>5">Save</button>`

### c-ignore
用于忽略一个dom及其子dom的解析处理。该指令并不需要有值即可生效。

例如： `<div c-ignore>...</div>`

### c-options
专门处理`<select></select>`中所有的`<option></option>`的指令。

例如： `<select c-options="sortOptions"></select>` , 此例中sortOptions的定义可以是这样的：
`model.set("sortOptions", ["done", "-done", "title", "-title", "done,title"]);`
也可以利用JSON数组来声明sortOptions变量，以便于声明每一个Option的value和text。

### c-i18n
用于在DOM中引用国际化资源。

基本的形式是： `<国际化资源的名称>[;参数1][;参数2][;参数3]...`

TODO

### c-watch
用于监听某个数据路径上的数据变化然后触发某个指定的Action。

基本的形式是： `<要触发的Action的名称> on <监听的数据路径>`

例如：`<div c-watch="onItemRender on item.price" c-bind="item.price"></div>`，在本例中每当item.price的值发生变化时，Cola都会自动触发名为onItemRender的Action。
onItemRender的定义方法大致如下
```
model.action({
	onItemRender: function(dom, model) {
		... ...
	}
});
```
这种Watch Action支持两个传入参数。第一参数是当前被渲染的DOM对象，第二个参数是当前对应的Model实例。
> 注意此处方法中传入的Model与外面的Model未必是同一个对象，比如对于c-repeat内部的使用情况而言，传入是将是对应每次迭代的子Model实例，您可以通过这个子Model获得当前的迭代数据。

为c-watch定义数据路径时可以使用逗号隔开定义多个路径，也可以使用通配符来监听更多的属性或子对象。例如：`item.*`表示监听item对象中的每一个子属性的值变化；`item.**`表示监听item对象包括其中子对象中的所有属性值的变化。

### c-widget
TODO

### {{...}}
{{...}}是一种嵌入式的绑定表达式，如果你了解AngularJS那么你一定不会陌生。它的用法大致如下：
`<div>Hello {{name}}</div>`这表示{{name}}这段内容会与Model中的name建立双向的数据绑定，实时的体现数值的变化。

这种用法看起来非常简洁且易于使用，但是Dorado并不推荐这种用法。这也正是我们把它放在最后来介绍的原因。

{{name}}不同于c-开通的DOM指令，他是真正的HTML内容，会被浏览器识别和渲染。这意味着在Dorado开始渲染之前，浏览器会把抢先把{{name}}渲染到视图中，等到Dorado执行渲染时它得内容再被替换成最终的值。这不可能仅仅会影响到页面的渲染性能，更重要的是这可能会导致页面的展现效果变差，用户可能在那一瞬间看到网页的内容由{{name}}切换成最终值。

{{...}}这种用法其实是完全可以被其他方法替代，例如上面的例子可以被替换成这种形式：`<div>Hello <span c-bind="name"></span></div>`。