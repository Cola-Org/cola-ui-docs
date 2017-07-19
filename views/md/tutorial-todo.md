# 实例教程——代办事项

首先，我们来看一下将要实作的示例。
<a href="/examples/tutorial/todo.html" target="_blank" c-widget="button; class:blue">运行示例</a>

上面例子的代码如下：
```
<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" type="text/css" href="/resources/cola-ui/semantic.css">
	<link rel="stylesheet" type="text/css" href="/resources/cola-ui/cola.css">
	<script src="/resources/jquery-2.1.3.js"></script>
	<script src="/resources/cola-ui/3rd.js"></script>
	<script src="/resources/cola-ui/semantic.js"></script>
	<script src="/resources/cola-ui/cola.js"></script>

	<script type="text/javascript">
		cola(function (model) {
			model.set({
				todos: [
					{ title: "Meeting", done: true },
					{ title: "Date" },
					{ title: "Lunch" , done: true},
					{ title: "Play basketball" },
					{ title: "Game" }
				],
				sortOptions: ["", "done", "-done", "title", "-title", "done,title"]
			});

			model.action({
				add: function () {
					model.get("todos").insert({
						title: model.get("newItem")
					});
					model.set("newItem", null);
				},
				delete: function (todo) {
					todo.remove();
				},
				stat: function () {
					var todos = model.get("todos"), done = 0;
					todos.each(function (todo) {
						if (todo.get("done")) done++;
					});
					return done + "/" + todos.entityCount;
				}
			});
		});
	</script>
</head>
<body style="padding:20px">
<p>
	<input c-bind="newItem">
	<button c-onclick="add()" c-disabled="newItem?false:true">Add</button>
</p>
<p>
	Filter: <input c-bind="filterParam">
	Sort: <select c-bind="sortParam" c-options="sortOptions"></select>
</p>
<ul>
	<li c-repeat="todo in sort(filter(todos,filterParam),sortParam)">
		<input type="checkbox" c-bind="todo.done">
		<span c-bind="todo.title"></span>
		<button c-onclick="delete(todo)">Delete</button>
	</li>
</ul>
<p>
	<span c-bind="stat()"></span>
</p>
</body>
</html>
```

这是一个待办事项的列表界面。虽然界面略显粗糙，但功能已相当完整。

本页面最核心的部分是待办事项的列表，这个列表在HTML中是这样定义的：
```
<li c-repeat="todo in sort(filter(todos,filterParam),sortParam)">
	<input type="checkbox" c-bind="todo.done">
	<span c-bind="todo.title"></span>
	<button c-onclick="delete(todo)">Delete</button>
</li>
```

c-repeat指令的第一段`todo in sort(filter(todos,filterParam),sortParam)`里包含了对两个内置Action的调用，
用于完成对代办事项列表的过滤和排序。其中的filterParam和sortParam并不是两个固定的值，而是两个用于引用Model中数据的数据路径。
一开始我们并没有给Model中的filterParam和sortParam这两个数据项赋值，根据filter和sort这样两种转换器的定义，不传递参数就不会产生效果。
因此，我们一开始看到的列表是所有待办事项的初始顺序。

在列表上方的HTML中，我们可以找到这样一段定义：
```
<p>
	Filter: <input c-bind="filterParam">
	Sort: <select c-bind="sortParam" c-options="sortOptions"></select>
</p>
```

这里有一个`<input>`和一个`<select>`分别绑定到了之前提到的filterParam和sortParam这两个数据项。其中`<select>`的备选项的信息由来自于另一个名为sortOptions的数据项,
通过c-options指令完成绑定。

以绑定到filterParam的`<input>`为例，当用户通过`<input>`改变了filterParam数据项的值时，由于列表中`c-repeat="todo in sort(filter(todos,filterParam),sortParam)"`的声明是涉及filterParam数据项的，
因此Cola会重新计算执行c-repeat指令，刷新列表。此时由于filter的条件已发生改变，因此c-repeat重新计算的结果将是跟filterParam过滤后的结果。
这一数据变化最终会自动反应到代办事项的列表中。因此，我们在界面中看到的效果就是，当我们在Filter:后的输入框中输入内容时，下面的代办事项的列表会自动根据我们的录入内容进行数据过滤。

上面`<select>`的工作原理大致同样如此，这里不做累述。

我们再回到待办事项的列表的模板定义中，其中的`<checkbox>`的定义并不难理解，需要注意的是最后那个`<button>`的的定义方式。
为了用这个按钮实现删除当前行的功能，我这样定义了它的事件`c-onclick="delete(todo)"`。其中的todo是c-repeat产生的迭代变量，代表每一个当前的待办项。
delete()是我们为Model定义的一个Action，它的具体定义是这样的：
```
model.action({
	...
	
	delete: function (todo) {
		todo.remove();
	}
	
	...
});
```

即直接删除传入的待办事项。

当一个待办事项被删除后，`c-repeat="todo in sort(filter(todos,filterParam),sortParam)"`会自动感知到数据的变化，并重新执行迭代，刷新列表。因此该待办事项对应的DOM元素也会自动被移除。

列表下方的统计是这样的定义的：
```
<p>
	<span c-bind="stat()"></span>
</p>
```

其代码主体在Action中。逻辑并不复杂，对todos列表进行一次迭代，统计出已完成的代办事项数并返回。
```
model.action({
	...
	
	stat: function () {
		var todos = model.get("todos"), done = 0, total = 0;
		todos.each(function (todo) {
			if (todo.get("done")) done++;
		});
		return done + "/" + todos.entityCount;
	}
	
	...
});
```

最后，我们再来看一下添加功能的实现。`<body>`中的第一段内容是这样的：
```
<p>
	<input c-bind="newItem">
	<button c-onclick="add()" c-disabled="newItem?false:true">Add</button>
</p>
```

这里的`<input>`绑定到了名为newItem的数据项，用于供用户填写要添加的待办事项。
`<button>`中`c-disabled="newItem?false:true"`的作用是声明该按钮只在newItem项的内容不为空时才可用。
add()的具体定义如下：
```
model.action({
	...
	
	add: function () {
		model.get("todos").insert({
			title: model.get("newItem")
		});
		model.set("newItem", null);
	}
	
	...
});
```

此处的逻辑其实也非常简单，将newItem中的值取出组装成一条新的待办事项，添加到todos集合中。同时清空newItem数据项的内容。
由于Cola提供的双向数据绑定的特性，我们对数据模型所做的操作都会自动体现到相应的界面显示中。
所以在整个例子的Javascript代码中我们完全看不到直接对于DOM的代码操作。