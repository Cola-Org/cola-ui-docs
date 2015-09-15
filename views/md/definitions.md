# 常用名词或规范

## 回调对象

在Cola提供的各种API方法中，涉及到回调参数（回调参数基本都会被命名为callback）的方法都会支持两种定义方式：

* 直接定义回调方法。例如：
  ```
  model.get("items", function(items) {
  	... ...
  });
  ```
  利用这种方式定义的回调方法只会在一步操作成功执行之后才会被执行，并不能用于监听执行失败的情况。

* 定义回调对象。回调对象是一个符合一定规范的JSON对象，通过它我们可以监听异步操作执行失败的情况。回调对象支持的子属性包括:
  * success: [function] 用于监听操作执行成功的监听方法，其传入参数为异步操作的返回值。
  * error: [function] 用于监听操作执行失败的监听方法，其传入参数为异常对象。
  * complete: [function] 用于监听操作执行结束（包括成功和失败）的监听方法。其传入第一个参数为逻辑值，表示执行成功或失败；第二个参数为返回结果或错误对象。
  * delay: [number] 延时执行回调方法的毫秒数。默认为0，即不延时。
  
  例如：
  ```
  segment.showDimmer();
  model.flush("items", {
  	complete: function(success, result) {
  		segment.hideDimmer();
  		if (success) {
  			alert("All data flushed.");
  		}
  	}
  });
  ```