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
 
### 隐式Action

Cola中包含一些系统级的Action供我们直接使用，我们称这些Action为隐式Action。目前已支持的隐式Action如下:

* not(value): 用于对传入的值进行逻辑非运算。
* isEmpty(value)： 用于判断传入的值是否为空。此方法对于各种类型的value值有不完全相同的处理逻辑:
 * Array - 如果长度为0则认为是空。
 * cola.EntityList - 如果其entityCount属性为0则认为是空。
 * String - 如果长度为0则认为是空。
 * 其他情况下则当其值为null或undefined时才认为是空。
* i18n(key, param1, param2, ...)： 用于返回cola中定义的国际化资源，其具体用法可以直接参考cola.i18n()方法的API文档。