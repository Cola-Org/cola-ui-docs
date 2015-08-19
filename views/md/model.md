# Model(视图模型)

在Cola-UI的绝大部分使用场景中我们只会接触到Model和View这两种对象，View是指页面的DOM树或控件，而Model则相当于MVVM概念中的ViewModel和Model的合体。在绝大部分场景中我们并没有必要区分这两种对象，因此我们没必要接触过多的概念徒劳的增加复杂度。其实Cola-UI并没有真正的合并ViewModel和Model，如果有需要您完全可以从Model中分离出一个叫DataModel的对象实现完整的MVVM，具体的做法此文暂不做论述。

![MVVM](/images/docs/mvvm.png)

Model对象管理三件事：数据、绑定、Action。

* 数据通常利用Model的get和set方法来读取和写入。
* 数据绑定通常都是通过DOM指令或控件的绑定表达式来建立。
* Action通常利用Model的action方法来声明和访问。

Model对于一个页面而言往往并不是一个唯一的实例，很多情况下Cola-都会根据需要创建出主Model的子Model实例，子Model实例可视作是主Model的代理对象。通过子Model我们仍然可以访问主Model中的数据和Action。

以下面的示例为例：
```
<script type="text/javascript">
	cola(function(model) {
		model.set("addresses", [
			{ city: "ShangHai" },
			{ city: "BeiJing" },
			{ city: "ShenZhen" }
		]);
</script>
<body>
	<ul>
		<li d-repeat="address in addresses">
			<span d-bind="address.city"></span>
		</li>
	</ul>
</body>
```  
在li的每一次迭代过程中，Cola-都会为当前迭代的DOM创建一个新的子Model，这个子Model既可以访问主Model中的所有数据，同时它自己也保存了一项名为address的数据，其值为当前的迭代值。而li中的span元素正是绑定了这个子Model中address，因此才能正确的显示当前的迭代值。

多数情况下，开发者可能并不会感觉到这些子Model的存在，因为完全可以像使用主Model一样使用这些子Model，反正主Model中有的数据和Action，通过子Model一样能拿到。但是我认为开发者仍然需要知道在Cola-的处理过程中大致发生了些什么，以免在某些时刻犯下莫名其妙的错误。