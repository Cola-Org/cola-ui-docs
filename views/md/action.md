# Action(动作)

Model中可以声明一组Action。Action有两种，一种是普通的Function，还有一种是cola.Action的实例。cola.Action通常用于封装异步操作，比如Ajax调用。

把动作封装成Action的主要目的是供表达式使用。例如SPAN可以绑定到一个Action以显示其执行的返回值；Button的onclick事件可以绑定到某个Action以便在点击时自动调用它。用cola.Action对象封装异步的操作可以带来一些额外的好处，比如定义Ajax的操作功能，或者定义异步操作执行期间的特殊消息提示等。

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

Action可以相互调用，例如只要直接调用`model.action.showMessage()`就可以了。