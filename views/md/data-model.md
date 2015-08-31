# 数据相关概念

Model可以根据名称管理一到N组数据，这里的数据既可以是string、bool这样的简单数据，也可以是复杂的数据实体和集合。数据的读写通常都是通过Model的get和set方法完成的，Model的get和set方法的使用方式可以直接参考本文后面对Entity对象的get和set方法的说明。

你可以通过DataType来声明某项数据的数据类型，虽然这个操作不是必须的，但声明数据类型可以获得很多额外的好处，必须获得自动的Javascript类型转换、隐式的数据校验、格式化输出等等。Cola中默认支持的数据类型有：

* string —— 字符串。这种类型通常无须额外声明。
* bool —— 逻辑型。
* int —— 整型。
* float —— 浮点型。
* number —— 数字，即不特别声明究竟是整型还是浮点型。 
* date —— 日期型。
* entity —— 数据实体或数据实体的集合。
* json —— JSON对象或Array。

上述的类型中需要特别说明的是entity和json这两种类型。

Cola默认使用Entity和EntityList来封装JSON数据。其中Entity对应JSON对象，EntityList对应Array。Entity和EntityList我们统称为实体数据。Cola中的很多特性（比如双向数据绑定）都依赖于实体数据。
在这一点的设计上，Cola于AngularJS是不同的，而与EmberJS比较相似。虽然AngularJS的数据在使用时看起来似乎更方便。但在现有的Javascript规范下却损失了一部分性能，且在功能扩展上也会受到制约。

Cola默认使用Entity和EntityList来封装JSON数据。当我们把复杂的JSON数据设置到Model中时，Cola会自动的将其转换成实体数据。因此，当我们再一次从Model中读取出该项数据时，我们得到的将不再是当初的JSON了。正因为如此，Cola才会特别提供一种名为json的数据类型，以声明在某些情况下不要转换遇到的JSON对象和JSON数组。

## 数据路径

由于Model中的数据可能是比较复杂的树形结构，因此当我们需要将一个控件绑定到术中一个比较深的位置，或者需要从树中读取一个位置较深的数据项时就会用到数据路径。

数据路径是一个以“.”连接的属性链。例如：`person.name`

数据路径并不能用于指示集合中的某个具体项。通过数据路径访问集合时我们得到的总是集合中的当前项。相应的，EntityList总是会管理着一个当前项只要这个EntityList不是空的。EntityList的当前项可以通过API或绑定的控件被改变。例如当我们使用products.name来为某个SPAN建立的绑定，当我们通过API或其他方式改变了products集合的当前项时，由于双向数据绑定功能的作用，SPAN中的内容会立刻切换成新的当前产品名称。

## Entity（数据实体）
Entity的结构类似于一个Map，其中可以有若干个属性。这个特征和Model很像，事实上Model内部正是通过一个Entity来管理数据的，所以我们在这里介绍的Entity的get和set方法的各种特性同样适用于Model的get和set方法。我们可以通过get和set方法来读写一个Entity中的属性值。例如：
```
person.get("name");
person.set("age", 23); 
```    
Entity的属性值也可以是复杂的数据类型，例如：
```
account.set("address", {
    city: "Shanghai",
    street: "Dongfang road",
    zipCode: 200010
});
```    
根据之前的描述，Cola遇到JSON类型的数值时会自动转换成Entity，因此当我们再次从account中读取address时将会得到一个Entity对象的实例。
```
var address = account.get("address");
alert(address.get("city"));
```       
Entity的get和set方法都支持迭代式的属性读取和写入，例如：
```
var city = account.get("address.city");
account.set("address.city", "beijing");
```   
无论address的值目前是Entity类型还是JSON对象，上面的读写操作都可以成功的执行，Cola会自动根据每一级上对象的类型完成不同方式的数据钻取。

Entity属性也可以被批量的设置。例如：
```
address.set({
    city: "Beijing",
    street: "Zhichun Road",
    zipCode: "100020"
});
```    
Entity除了实现上述较基本的数据管理之外还可以实现对属性值的校验、数据懒装载、装载管理等功能。具体请参考Entity的API文档。
    
## EntityList（数据实体集合）
EntityList是Entity的集合，相对于数组它提供了更加方便高效的插入、删除，新增了当前Entity的概念，提供了数据分页和数据懒加载的功能。

例如当我们要迭代EntityList中的所有Entity时，代码可以是这样的：
```
employees.each(function(employee) {
    ... ...
});
```   
EntityList的更多用法请参考API文档。

## EntityDataType（实体数据类型）
model.EntityDataType是专门用于描述Entity的DataType。例如我们可以用这样的一段声明来描述person这种数据实体...
```
model.describe("person", {
	dataType: {
		properties:{
			name: {
				label: "姓名",
				required: true
			},
			gendar: {
				label: "性别",
				dataType: "bool"
			},
			age: {
				label: "年龄",
				dataType: "int",
				validators: [
					{
						$type: "number",
						min: 18,
						max: 70
					}
				]
			}
		}
	}
});
```
Cola会自动根据此处dataType对应的那段JSON创建一个EntityDataType实例，该DataType可以限定person实体中各属性的显示名称、数据类型、校验规则等等。

我们也可以利用EntityDataType来定义属性的数据懒装载，例如在下面的例子中指定了Category的products属性是一个支持数据懒装载的属性，同时还用一段子JSON还声明了products中每一个数据实体的DataType。
```
model.describe("categories", {
	properties:{
		id: {
			required: true
		},
		name: {
			label: "分类名称",
			required: true
		},
		products: {
			provider: {
				url: "/data/products.action",
				parameter: ":id"
			},
			dataType: {
				properties: {
					id: {
						dataType: "int",
						required: true
					},
					name: {
						label: "产品名称",
						required: true
					},
					price: {
						label: "价格",
						dataType: "float"
					}
				}
			}
		}
	}
});
```        
下面的例子定义一个递归的树状结构，我们在定义DataType时为其声明了name属性，例如指定name为"Category"。之后我们就可以在其他地方通过"Category"这个名称来引用这个DataType了。例如此例中我们在categories属性中引用了"Category"，那就相当于又引用了自身。
```
model.describe("categories", {
	name: "Category",
	properties:{
		id: {
			required: true
		},
		name: {
			label: "分类名称",
			required: true
		},
		categories: {
			provider: {
				url: "/data/categories.action",
				parameter: ":id"
			},
			dataType: "Category"
		}
	}
});
```    
也可以预先利用Model.dataType()声明好DataType，再到cola.data()中使用，就像下面的这个例子...
```
model.dataType([
	{
		name: "Product",
		properties:[
			id: {
				dataType: "int",
				required: true
			},
			name: {
				label: "产品名称",
				required: true
			},
			price: {
				label: "价格",
				dataType: "int"
			}
		]
	},
	{
		name: "Category",
		properties: {
			name: {
				label: "分类名称",
				required: true
			},
			products: {
				provider: {
					url: "/data/products.action",
					parameter: ":id"
				},
				dataType: "Product"
			}
		}
	}
]);

model.describe("categories", "Category");
```

## Provider（数据装载器）

### Provider的基本用法
Provider是用于为数据模型提供数据的，通常是用于声明让Model自动从Server端通过Ajax装载数据。

如果我们把一个Provider作为数据设置到Model或Entity中，或者利用describe为某个数据项声明好了Provider。那么当我们之后尝试从Model和Entity中读取这项数据时，Cola会自动调用该Provider尝试获得最终的数据。例如:
```
model.describe("employees", {
    provider: "data/employees.json"
});
``` 
或
```
model.set("employees", new cola.Provider({
    url: "data/employees.json"
}));
``` 

以上的第一段代码演示的是一种极简的Provider的定义方法，如果只需要定义一个Provider的url，那么就可以直接通过一个代表url的字符串来定义。但事实上Provider还支持更多的属性和设置，如果有需要我们还可以通过JSON配置对象的醒来来定义的Provider。

下面的代码将触发Model从Server端装载数据
```
model.get("employees", function(employees) {
    // 异步方式读取employees属性，可以在回调方法中得到装载到的employees集合。
});
```

当我们利用Provider来为某种Entity的某个属性定义数据懒装载时，你会需要向Ajax服务传递当前Entity的id或类似的唯一标示，以便于服务器区分究竟应该装载那些数据。这种参数的值只有在实际运行时才能最终确定，因此需要利用特殊的定义方法。见下面的DataType声明：
```
model.dataType({
	name: "Category",
	properties: {
		name: {
			label: "分类名称",
			required: true
		},
		products: {
			provider: {
				url: "/data/products.action",
				parameter: ":id"
			}
		}
	}
});
```
在products对应的属性的provider中，我们通过:id来定义了参数。这表示Provider会在最终被执行之前从当前所属的Entity的id属性中读取该参数的值，即获得当前对应的Category的id作为参数值。

另外，对于那些比较简单的parameter值，Cola会直接把它作为Request的GET参数(参数名为parameter)来传递，例如：`/data/get-items.action?from=20&limit=10&parameter=foo`，这里的from和limit可能是Cola根据当前EntityList的分页情况自动添加的，其中from表示从第几条记录开始（从0开始计数），limit表示最多返回多少条记录（相当于每页的大小）。
不过，当你的参数是一个结构复杂的JSON对象时，上面这种传递方式可能就不适用了。这种情况下我们可以设定Provider的sendJson属性为true，这样Provider会以JSON的形式传递所有参数，并且默认也会使用POST方式来发出Request。

### 数据分页
在前面的内容中，你已经接触到了通过[Provider](#provider数据装载器)来实现数据分页装载。此功能最终需要由Server端的逻辑提供相应的支持，因为分页本身就是为了提高效率降低网络带宽的压力，不能简单的认为是Cola在客户端对数据进行分页显示。

我们在Cola中设置的pageSize参数最终会变成Ajax请求中的参数，例如最终发往服务器端的请求可能是`/data/get-products.do?from=0&limit=100`。

需要特别加以注意的是如果你只为Provider发出的请求返回一个简单的数组，EntityList将无法知道总共有多少页数据。这可能会导致DataPilot控件中的"最后一页"按钮不可用，因为Cola不知道最后一页是哪一页。当然，不指定总页数在很多场景中都是毫无问题的，我们只要确保向后翻页的功能可用就可以了。
但在另一些场景中，我们可能就必须要知道总共有多少页。此时通过装载数据的请求告诉Cola是一个选择。只要按照下面的方法来提供Response数据，以下的两种任选其一即可。
```
{
	$totalEntityCount: 100, //总记录数
	$data: [
    		{...},
    		{...},
    		{...},
    		{...},
    		{...},
    		{...},
    		{...},
    		{...},
    		{...},
    		{...}
    	]
}
```