# Action(动作)

Model中可以声明一组Action。Action事实上是Javascript的Function。把动作封装成Action的主要目的是供表达式使用。例如SPAN可以绑定到一个Action以显示其执行的返回值；Button的onclick事件可以绑定到某个Action以便在点击时自动调用它。

### 普通Function
定义普通的Action的方式如下：
```
model.action({
    showMessage: function() {
        ...
    },
    checkNickName: function() {
    }
});
```
也可以简单的通过下面的方式来定义，不过此种简单的定义方式只能用于普通Function型Action。
```
model.action.showMessage = function() {
    ...
};
```
 
### 内置Action

Cola中包含一些系统级的Action供我们直接使用，我们称这些Action为内置Action。目前已支持的内置Action如下:

* **default(value，defaultValue)**

 如果value的值等价于逻辑false则返回defaultValue，否则返回value自身。null、false、0、""都会被认为是逻辑false。

* **int(value)**

 将传入的值转换整数，如果转换失败则返回0。

* **float(value)**

 将传入的值转换浮点数，如果转换失败则返回0。

* **is(value)**

 将传入的值转换成逻辑值。

* **bool(value)**

 同is()。

* **not(value)**

 用于对传入的值进行逻辑非运算。

* **isEmpty(value)**

 用于判断传入的值是否为空。此方法对于各种类型的value值有不完全相同的处理逻辑:
	* Array - 如果长度为0则认为是空。
	* cola.EntityList - 如果其entityCount属性为0则认为是空。
	* String - 如果长度为0则认为是空。
	* 其他情况下则当其值为null或undefined时才认为是空。

* **isNotEmpty(value)**

 与isEmpty(value)的结果相反。

* **len(value)**

 获得Array或EntityList的长度。

* **upperCase(str)**

 将字符串转换为大写。

* **lowerCase(str)**

 将字符串转换为小写。

* **resource(key, param1, param2, ...)**

 用于返回cola中定义的国际化资源，其具体用法可以直接参考cola.resource()方法的API文档。

* **formatNumber(num, format)**

 用于对数字进行格式化输出。例如： `formatNumber(1234.5678, '$#,##0.00')`将输出`$1,234.57`。

* **dateNumber(date, format)**

 用于对日期进行格式化输出。例如： `formatDate(birthday, 'yyyy-MM-dd')`将输出`1991-09-01`这样的格式。

* **filter(list, criteria, caseSensitive, strict)**

 用于对集合型数据进行过滤。
 filter支持三个参数：
 * criteria 过滤条件，字符串或JSON对象。
 * caseSensitive 逻辑值，表示是否对大小写敏感。此参数可省略。
 * strict 逻辑值，表示是否按照严格模式进行字符串匹配，即是否启用全文匹配。此参数可省略。

 如果criteria是字符串，表示用该值匹配对象中的每一个属性（如果集合中的对象本身就是一个值而非对象，那么则直接匹配该值）。

 如果criteria是一个JSON对象或JSON对象的数组，那么上面的caseSensitive和strict将是失效，同时它的格式应该是这样的：
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

 例如： `filter(employees, 'b')`表示过滤出所有名字或其它属性中带有字母b的员工。
 `filter(employees, 'Tom', false, true)`表示过滤出所有名字或其它属性值为Tom的员工，忽略字母的大小写。

* **sort(list, comparator, caseSensitive)**

 用于对集合型数据进行排序。
 sort支持两个参数：
 * comparator 排序条件，字符串或JSON数组。
 * caseSensitive 逻辑值，表示是否对大小写敏感。此参数可省略。

 如果comparator是字符串，表示是一个属性名，即按照此属性进行排序。如果第一个字符为'+'或'-'表示正向或逆向的排序。
 例如：
 `sort(employees, 'age')`表示按照age从小到大排序。
 `sort(employees, '-age')`表示按照age从大到小排序。
 如果集合中数据本身就是一个值而非对象，则可以省略上面的属性名，比如： `sort(names, '-')`表示逆向排序names中的值。

 如果comparator是JSON对象，那么它的格式应该是这样的：
```
[
    { prop:"age", desc:true }, //按照age逆向排序
    { prop:"gender" }
]
```

 另外comparator还接受两个特殊的值：
 * "$none" 表示不排序。
 * "$random" 表示随机排序。例如：`sort(employees, '$random')`
 
### 自定义内置Action

如果要自定义内置Action，可以通过下面的方式：
```
cola.defaultAction["percent"] = function(value) {
	return (value * 100) + "%";
}
```
	
上面的示例定义了一个名为percent的内置Action，用于输出数值的百分比形式。例如`percent(0.86)`将输出'86%'。

一个带有参数的内置Action：
```
cola.defaultAction["multiply"] = function(value, num) {
	return value * num;
}
```
	
上面的例子中定义了一个名为multiply的内置Action，用于对数值进行乘法运算。例如`multiply(6,3)`将输出18。