# Cola-UI快速入门

标签:Cola-UI

##概述
随着技术的发展，前端的开发技术正在变得日趋复杂。目前业界比较的流行的前端框架有jQuery、Bootstrap、AngularJS、React、JQueryUI等。然而上述每一个的框架都只能帮我们解决前端开发过程中遇到的一小部分问题。实际的使用过程中开发者通常都要选取其中的几个进行整合，这种整合的工作往往技术要求较高，且整合的结果通常也不能很好的发挥每个框架各自的优点，难以形成一套高效的、便于推广的开发模式。

Cola-UI的目标就提供一套一站式的前端开发解决方案，满足前端开发过程中所需的绝大多数需求。

* Cola-UI整合了jQuery 2.x和Semantic UI 2.x，为Semantic UI提供了更加易于使用的控件化封装，同时还提供了更多SemanticUI中不具备的高级控件如List、Table、Tree等。
* Cola-UI提供了自行实现的MVVM跨框架，并基于此框架实现了任意DOM元素或控件与模型间的双向数据绑定。
* Cola-UI的设计遵循了Mobile First的策略，非常适用于移动设备，同时也能很好的满足PC浏览器的操作要求。

从功能角度，Cola-UI可划分为两大部分MVVM框架和控件集。

![pic][images/structure.png]

###MVVM框架
MVVM框架部分的功能比较类似于AngularJS，提供了数据模型、DOM指令、以及模型和DOM之间的双向数据绑定等功能。
相比较于AngularJS这类MVVM框架，Cola-UI简化了其中一些过于繁琐的设计，让开发者能够更快的理解和上手。同时，Cola-UI又强化了数据模型中元数据的功能，使得数据模型能够自行管理懒装载、分页、编辑状态、校验状态等，以便于适应一些复杂的应用场景。

###视图
* Semantic控件的数据绑定支持
* 更多常用布局
* 更多常用的高级控件

##Hello World

	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<link rel="stylesheet" type="text/css" href="lib/themes/default/cola.css" />
		<script src="lib/jquery-2.1.4.js"></script>
		<script src="lib/3rd.js"></script>
		<script src="lib/cola.js"></script>
		<script type="text/javascript">
			cola(function(model) {
				model.set("name", "World");
			});
		</script>
	</head>
	<body>
		Hello <span c-bind="name"></span>
		<br>
		<input c-bind="name">
	</body>
	</html>

运行该示例，并尝试修改Input中的内容，你会发现Input中的改变会立刻更新到Hello后面。这就是双向数据绑定提供的功能。其实上面的页面中真正有效的代码只有3行，其它部分都是固定的内容。

`cola(function(model){ })` 是一个默认的初始化方法，其中的代码会在页面的DOM树装载完成之后自动执行，其触发时机与jQuery.ready相同。在初始化时会自动传入一个已经创建好的Model对象。我们可以在这个方法中对这个Model对象进行初始化。参考[cola方法](/)。

`model.set("name","World")` 向Model中写入了一个数据项，该数据项的名称是name，值是World。Model可以拥有1到多个数据，每个数据项中的数据并不限于简单的String类型，它可以接受各种复杂的数据类型，包括Array和JSON。参考[Model](/)。

`<span c-bind="name"></span>` 定义了一个Span，它同样绑定到了name这个数据项。

`<input c-bind="name">` 定义了一个Input，这里我们利用c-bind指令声明了该Input绑定到name这个数据项，由于我们在之前已经向Model的name中写入了World，因此Input中默认将显示World。同时，由于Input是一种可以编辑的DOM元素，所以当我们在Input中录入内容时新的内容会自动被写回Model中，这表示我们可以利用Input来改变Model中的数据。参考[DOM指令](/)。
另外，由于Model是支持双向数据绑定的，因此当我们编辑Input中的内容时，这个Span总是可以同步的显示出最新的内容变化。

##简单的Action
	<!DOCTYPE html>
	<html>
	<head>
		<script src="../include-all.js"></script>
		<script type="text/javascript">
			cola(function(model) {
				model.action({
					showMessage: function() {
						alert("Hello World!");
					}
				});
			});
		</script>
	</head>
	<body>
		<button c-onclick="showMessage()">Show Message</button>
	</body>
