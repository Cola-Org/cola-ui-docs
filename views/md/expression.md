# 表达式

表达式有几种基本的形式：

* **数据路径**
例如：`account.name`表示绑定到Model中名为account的对象的name属性上。
另一个示例：`employees.name`，此处的employees是一个集合，其中有若干个employee对象。如果我们将一个Input绑定到employees.name，把Input将总是显示employees集合中当前employee的name。

* **方法调用**
例如：`remove(person)` 调用Model中名为remove的Action，Action通常是一个Function，同时将person指向的数据作为参数传递给该方法。
需要特别注意的是，此处的方法特指Model中的Action，我们并不能通过表达式来访问Javascript中的各种全局Function。

* **字符串**
例如：`'Hello ' + person.name` 表示将字符串'Hello'与person.name指向的数据进行连接。

* **基本运算**
示例：`product.price*1.2`，`product.gender?'男':'女'`

## Convertor ###

表达式除了上面的这些用法之外，还可以附带一到多个Convertor(转换器)。Convertor用于对表达式的结果进行进一步的转换处理，带有Convertor的表达式的基本定义方式是：`表达式 | 转换器1 | 转换器2 | ...`
其中每一个转换器的声明格式是：`转换器名称:参数1:参数2:...`

Cola-UI中默认提供的Convertor如下：

* **upper**
用于将字符串转换为大写。
例如 `'Hello World' | upper`将输出`HELLO WORLD`。

* **lower**
用于将字符串转换为小写。

* **default**
如果表达式的值为空（null或undefined），则返回指定的默认值。
例如： `text | default:'<EMPTY>'`如果text的值为null将输出`<EMPTY>`。

* **number**
用于对数字进行格式化输出。
例如： `1234.5678 | number:'$#,##0.00'`将输出`$1,234.57`。

* **date**
用于对数字进行格式化输出。
例如： `birthday | date:'yyyy-MM-dd'`将输出`1991-09-01`这样的格式。

* **filter**
用于对集合型数据进行过滤。
filter支持三个参数：
 * criteria 过滤条件，字符串或JSON对象。
 * caseSensitive 逻辑值，表示是否对大小写敏感。
 * strict 逻辑值，表示是否按照严格模式进行字符串匹配。

 如果criteria是字符串，表示用该值匹配中对象的每一个属性（如果集合中的对象本身就是一个值而非对象，那么则直接匹配该值）。
 
 如果criteria是一个JSON对象，那么上面的caseSensitive和strict将是失效，同时它的格式应该是这样的：
```
{
	name: { //属性名，如果属性名为"$"表示要匹配每一个属性
		value: "b", //要匹配的值
		caseSensitive: true //非必须
	},
	gendar: {
		value: "male",
		strict: true //非必须
	}
}
```
 
 例如： `employees | filter:'b'`表示过滤出所有名字或其它属性中带有字母b的员工。
 `employees | filter:'Tom':false:true`表示过滤出所有名字或其它属性值为Tom的员工，忽略字母的大小写。
 
* **sort** 或 **orderBy**
用于对集合型数据进行排序。
sort支持两个参数：
 * comparator 排序条件，字符串或JSON数组。
 * caseSensitive 逻辑值，表示是否对大小写敏感。

 如果comparator是字符串，表示是一个属性名，即按照此属性进行排序。如果第一个字符为'+'或'-'表示正向或逆向的排序。
 例如：
 `employees | sort:'age'`表示按照age从小到大排序。
 `employees | sort:'-age'`表示按照age从大到小排序。
 如果集合中数据本身就是一个值而非对象，则可以省略上面的属性名，比如： `names | sort:'-'`表示逆向排序names中的值。
 
 如果comparator是JSON对象，那么它的格式应该是这样的：
```
[
    { prop:"age", desc:true }, //按照age逆向排序
    { prop:"gender" }
]
```
 
 另外comparator还接受两个特殊的值：
 * "$none" 表示不排序。
 * "$random" 表示随机排序。例如：`employees|sort:'$random'`
 
## 自定义Convertor ###
如果要自定义Convertor，可以通过下面的方式：
```
cola.convertor["percent"] = function(value) {
	return (value * 100) + "%";
}
```
	
上面的示例定义了一个名为percent的Convertor，用于输出数值的百分比形式。例如`0.86|percent`将输出'86%'。

一个带有参数的Convertor：
```
cola.convertor["multiply"] = function(value, num) {
	return value * num;
}
```
	
上面的例子中定义了一个名为multiply的Convertor，用于对数值进行乘法运算。例如`6|multiply:3`将输出18。

> 看到这里你也许会产生一些迷惑，Convertor能完成的工作似乎通过Action也是一样可以实现的，为什么我们还要定义Convertor呢？
> 我们认为Convertor通常应该用来封装一些具有广泛通用性的逻辑，Convertor通常应该被定义在一些可悲很多页面引用的.js文件中以便于帮助开发者快速的完成一些具有通用性的数据转换。
> 而Action则是用来封装那些自由的、未必具有通用性的逻辑的。

## 性能优化

### 静态绑定表达式
Cola的双向绑定功能为我们提供的很大的开发便利性，然而我们并不是在所有情况下都需要双向绑定的功能。
很多时候我只需要表达式帮我们完成一次求值就可以了，我们并不需要Cola在内部为我们建立起运行机制十分复杂的双向绑定，如果这是我们能够定义一种更加简单轻量的绑定机制将可以节省一部分的前端运算资源。

静态绑定表达式能够帮助我们完成这样一种轻量级的数据绑定。静态绑定表达式只要完成了一次有效的求值操作之后就自动关闭不再处于激活的状态，之后也不再响应数据模型中的任何数据变化。
这里提到的“一次有效的求值”是指在求值的过程中不涉及到尚未装载的数据。通常，“一次有效的求值”就是指表达式的第一次求值操作，除非表达式关联的数据项尚未完成数据装载，那么这次求值操作将被Cola认为是无效的。
比如，我们为某个数据项定义了Provider，这表示这个数据项的数据是通过Ajax操作装载的。如果某个与此数据项相关的表达式在Ajax操作完成之前就进行的求值操作，那么这将被认为是一次无效的求值。
知道这个表达式在该数据项完成数据装载之后的一次尝试中获得了真正的数据，此时表达式才算是完成了有效的求值，之后这个表达式将会失效，不再响应数据模型中的任何数据变化。

定义静态绑定表达式的方法非常简单，只要在原有的表达式前面添加一个"="就可以了。例如：
```
<div c-bind="=product.title"></div>
```

### 表达式的监听范围
Cola内部在实现双向数据绑定时会根据表达式的内容分析该表达式与数据模型中的那些数据相关。对于那些比较简单的绑定表达式这一点是很容易做到的。

比如`person.name`很明显至于person的name属性相关。稍微复杂一点的比如`items | filter:filterParam`，它的结果同时items和filterParam这两个数据路径相关。

对于包含方法调用的表达式而言，这种分析就不能确保完全准确了。例如`calcAge(person.birthday)`，Cola会认为它的结果只跟person.birthday相关，这种分析在大多数情况下是准确的，但去不是绝对的。例如下面这种情况...

```
<script type="text/javascript">
	cola(function(model) {
		... ...
	
		model.action({
			getPersonInfo: function() {
				var person = model.get("person");
				return person.get("name") + " is " + person.get("age") + "years old.";
			}
		});
	});
</script>
</head>
<body>
	<span c-bind="getPersonInfo()"></span>
</body>
```

可以看到开发者并没有在getPersonInfo()定义参数，这样一来Cola就无从分析getPersonInfo()究竟与那些数据项相关。
此时Cola就只能在数据模型发生任何改变时都尝试来重新计算getPersonInfo()的结果，同时为了避免getPersonInfo()产生过多重复且无意义的重算，Cola还会对getPersonInfo()的重算进行延时处理。
尽管如此，这种监听所有数据变化的表达式仍然是比较低效的。

除了上面的这种情况之外，通过分析方法参数得到的相关数据路径也可能是不完全准确的。这回导致部分情况下双向绑定的显示结果不能实时的反应数据模型的变化。

对了提高性能或者避免潜在的双向绑定失效，Cola允许我们自定义某个表达式的相关数据路径。方法是在表达式的最后添加一段的"on"的指令，其基本形式是这样的...
`<基本表达式> on 相关数据路径1[,相关数据路径2][,相关数据路径3]...`
如果相关数据路径指向一个集合，表示该表达式关注集合对象的增删；如果相关数据路径指向一个对象的属性，表示该表达式关注该属性的值变化。

比如上面的`getPersonInfo()`可以修改成`getPersonInfo() on person.name,person.age`。这表示声明getPersonInfo()的结果和`person.name`、`person.age`这两个数据路径相关。
不过这种写法显得相当啰嗦，如果getPersonInfo()中的代码涉及到了更多的属性我们岂不是要把表达式写的很长？

实际的使用场景中为了避免出现过长的on描述，Cola允许我们通过通配符来定义相关数据路径，比如上面的表达式也可以写成`getPersonInfo() on person.*`。
`person.*`表示getPersonInfo()的结果可能与person中的所有子属性的值相关。

如果getPersonInfo()的代码变成下面这样...
```
model.action({
	getPersonInfo: function() {
		var person = model.get("person");
		return person.get("name") + " lives in " + person.get("address.city") + ".";
	}
});
```
现在getPersonInfo()的内容不仅仅跟person的子属性相关了，还跟子属性中的子属性相关，`person.*`又不能满足要求了。
此时我们可以将表达式写成`getPersonInfo() on person.**`。这表示getPersonInfo()的返回结果与person中任意一级的子属性的变化相关。

让我们把问题进一步复杂化一些，看看下面这个例子...
```
model.action({
	stat: function () {
		var done = 0, total = 0;
		model.get("todos").each(function (todo) {
			total++;
			if (todo.get("done")) done++;
		});
		return done + "/" + total;
	}
});
```
这是一段统计todos中总共有多少条记录，以及有多少条记录的done是true的代码。从逻辑上而言这段逻辑与todos集合的增删以及每一个todo的done属性值变化相关。
这段表达式可以写成`stat() on todos,todos.done`。表示这段表达式关注todos集合的增删，以及其中todo对象的done属性值的变化。
事实上这段的表达式最终完全可以写成`stat() on todos.done`因为todos集合的增删本来就会导致与todos.done相关的表达式进行重新求值。

> 通过前面的内容你也许会发现"on"指令的语法并不足以准确的表达所有可能出现的表达式关注点，或许为了准确的描述你可能需要把在整个表达式写的很长。
> Cola其实并不推荐把"on"指令写的特别复杂，有时表达式重新求值的频率是实际需要的略高一点并不是问题，只要我们在开发便捷性和整体性能之间找到一个合适的平衡点即可。
> 所以当一个表达式与某个对象中的5个属性值的变化相关时，你大可不必在"on"指令中把他们全部罗列出来，只要用".*"概括一下子属性就足够了。