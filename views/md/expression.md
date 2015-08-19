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

### Convertor ###

表达式除了上面的这些用法之外，还可以附带一到多个Convertor(转换器)。Convertor用于对表达式的结果进行进一步的转换处理，带有Convertor的表达式的基本定义方式是：`表达式 | 转换器1 | 转换器2 | ...`
其中每一个转换器的声明格式是：`转换器名称:参数1:参数2:...`

Cola-UI中默认提供的Convertor如下：

* **upper**
用于将字符串转换为大写。
例如 `'Hello World'|upper`将输出`HELLO WORLD`。

* **lower**
用于将字符串转换为小写。

* **default**
如果表达式的值为空（null或undefined），则返回指定的默认值。
例如： `text|default:'<EMPTY>'`如果text的值为null将输出`<EMPTY>`。

* **number**
用于对数字进行格式化输出。
例如： `1234.5678|number:'$#,##0.00'`将输出`$1,234.57`。

* **date**
用于对数字进行格式化输出。
例如： `birthday|date:'yyyy-MM-dd'`将输出`1991-09-01`这样的格式。

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
 
 例如： `employees|filter:'b'`表示过滤出所有名字或其它属性中带有字母b的员工。
 `employees|filter:'Tom':false:true`表示过滤出所有名字或其它属性值为Tom的员工，忽略字母的大小写。
 
* **sort** 或 **orderBy**
用于对集合型数据进行排序。
sort支持两个参数：
 * comparator 排序条件，字符串或JSON数组。
 * caseSensitive 逻辑值，表示是否对大小写敏感。

 如果comparator是字符串，表示是一个属性名，即按照此属性进行排序。如果第一个字符为'+'或'-'表示正向或逆向的排序。
 例如：
 `employees|sort:'age'`表示按照age从小到大排序。
 `employees|sort:'-age'`表示按照age从大到小排序。
 如果集合中数据本身就是一个值而非对象，则可以省略上面的属性名，比如： `names|sort:'-'`表示逆向排序names中的值。
 
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
 
### 自定义Convertor ###
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