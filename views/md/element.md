# Element

cola.Element是Cola中一种非常基础的抽象类。DataType、PropertyDef、控件等对象都是Element的子类。

Element的主要作用有两个：

* 为对象提供可声明的属性。
* 为对象提供统一的事件处理机制。

## Attribute
Element的属性在Cola-UI中被称为Attribute。我们知道JSON对象的属性在使用时是非常自由的，开发者可以任意的向对象中写入或创建属性，这一个特性并不利于框架管理和控制开发者的行为，也不利于框架统一的监听和处理对象的属性值变化。

读写Element的Attribute的方法是通过get和set方法。get和set方法都支持迭代式的属性名使用方式。例如Input控件中有一个button子属性，其中存放的是一个Button的实例，我们可以通过下面的代码修改Button的标题...
```
input.set("button.caption"， "xxxx");
```

set方法也支持批量的属性设置。例如:
```
table.set({
    bind: "items",
    highlightCurrentItem: true
});
```

所有的Element对象都支持利用构造参数对属性值进行批量的初始化，其内部其实相当于调用了一次set方法。例如：
```
var table = new cola.Table({
    bind: "items",
    highlightCurrentItem: true
});
```

## Event
Element规范了所有事件监听器的参数和返回值。

所有事件监听器都可以接受两个参数——self和arg，其中self是触发事件的Element对象自身，arg是事件的相关参数。arg参数是一个JSON对象，其中可以包含若干个子属性。每个子属性的具体含义需参考该事件的API文档。

事件的返回值也被赋予了特定的含义。对于大部分事件而言，返回false都可以终止该事件后续监听器的触发，返回true或不定义返回值都表示继续执行后续的监听器。
对于部分事件而言，返回值除了可用于终止后续监听器之外，还可以终止相关的系统操作。这样的事件通常都以beforeXXX命名，比如：在cola.Action的beforeExecute事件中返回false可以阻止execute()操作被执行。具体须参考各事件的API文档。

定义事件监听器的方法有两种：
```
button.on("click", function() {
    alert("Button Clicked.");
});
```

也可以给事件监听器一个别名，以便于在后期接触该事件监听器的绑定...
```
button.on("click:alert", function() { // 此处设置事件监听器的别名为alert
    alert("Button Clicked.");
});
...
...
button.off("click:alert");
```

另外，我们也可以通过set方法来绑定事件，例如:

```
button.set({
    caption: "Test",    // 设置属性
    click: function() { // 绑定事件
        alert("Button Clicked.");
    }
});
```