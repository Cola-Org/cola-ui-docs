# Model(视图模型)

在Cola-UI的绝大部分使用场景中我们只会接触到Model和View这两种对象，View是指页面的DOM树或控件，而Model则相当于MVVM概念中的ViewModel和Model的合体。在绝大部分场景中我们并没有必要区分这两种对象，因此我们没必要接触过多的概念徒劳的增加复杂度。其实Cola-UI并没有真正的合并ViewModel和Model，如果有需要您完全可以从Model中分离出一个叫DataModel的对象实现完整的MVVM，具体的做法此文暂不做论述。

![MVVM](/images/docs/mvvm.png)

Model对象管理三件事：数据、绑定、Action。

* 数据通常利用Model的get和set方法来读取和写入。
* 数据绑定通常都是通过DOM指令或控件的绑定表达式来建立。
* Action通常利用Model的action方法来声明和访问。

## Model中的主要方法

### set() / get()
用于设置和获取Model中的数据。Model管理数据的方式有点像Map对象，一个Model可以有若干个数据项，每个数据项的值既可以是string、boolean这样的简单值，也可以是复杂的数据实体和集合。

例如：
```
model.set("name", "Bob");	// 设置name数据项的值为"Bob"

model.set("person", {	// 设置person数据项的值为一个数据实体
	name: "Tom",
	age: 16
});

model.set("addresses", [	// 设置addresses数据项的值为一个包含三个数据实体的集合
	{ city: "ShangHai" },
	{ city: "BeiJing" },
	{ city: "ShenZhen" }
]);
```  

Model的set()/get()的行为特征与cola.Entity的set()/get()几乎是完全一致的，事实上Model的set()/get()在内部正是通过cola.Entity的set()/get()实现的，因此要更详细的了解这两个方法可以直接参考cola.Entity的set()/get()的说明。

### describe()
set()/get()是用来读写Model中的数据的，而describe()则是用来描述Model中的数据。比如描述某个数据项的数据类型、数据获取来源、校验逻辑等。describe()的参数被设计的颇为灵活，用于降低各种场景下的使用复杂度。

例如：
```
// 描述price数据项的数据类型number。
// 为当第二个参数是string时，将被认为是一个DataType的名称
model.describe("price", "number");

// 描述age数据项的数据类型number和校验规则。
// 为当第二个参数是JSON时，将被认为是一个cola.Property对象的配置参数
model.describe("age", {
	dataType: "number",
	validators: [
		"required",
		{
			min: 1,
			max: 120
		}
	]
});

// 描述items数据项的数据将利用AJAX从某个url处装载
model.describe("items", {
	provider: "http://cola-ui.com/services/items.json"
});
```  

### dataType()
dataType()用于预定义DataType或按照名称获取DataType。

例如：
```
// 声明一个名为Person的DataType
model.dataType({
	name: "Person",
	properties: {
		name: {
			required: true
		},
		age: {
			dataType: "int",
			validator: {
				min: 1,
				max: 120
			}
		},
		gender: {
			dataType: "boolean"
		}
	}
});

// 描述person数据项的数据类型为上面声明的Person
model.describe("person", "Person");

// 根据名称获得DataType的实例
var DataType = model.dataType("person");
```

### action()
用于为Model定义一到多个Action。具体请参考[Action](action)

### widgetConfig()
利用此方法可以将一些原本需要定义在HTML中的控件属性声明提取到Javascript中，以方便开发者进行更加直观的配置。

## 子Model
Model对于一个页面而言往往并不是一个唯一的实例，很多情况下Cola-都会根据需要创建出主Model的子Model实例，子Model实例可视作是主Model的代理对象。通过子Model我们仍然可以访问主Model中的数据和Action。
最常见的接触到子Model的机会是使用c-repeat指令时和使用Cola的[Router](router)功能时。

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

多数情况下，开发者可能并不会感觉到这些子Model的存在，因为完全可以像使用主Model一样使用这些子Model，反正主Model中有的数据和Action，通过子Model一样能拿到。但是我认为开发者仍然需要知道在Cola-的处理过程中大致发生了些什么，以免在某些时刻犯下令人莫名其妙的错误