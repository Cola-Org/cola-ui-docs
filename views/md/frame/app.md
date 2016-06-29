# App对象

Cola Frame内置一个App对象，通过该对象可以完成一些跟App相关的操作。App中包含的方法有以下一些...

### prop(key, value)
基本参数设定，具体请参考 [基本参数设定](frame-setting) 。


### open(path, config)
打开一个新的链接。
但是当我们要打开一个应用内的链接时，如果使用window.open()是会导致整个页面刷新的，而利用App.open()是不会导致整体刷新的，即实现的效果是应用内部的标签Tab的新增或者切换。
这里的path参数是要打开的目标地址
这里的config参数是修饰参数，config是一个JSON对象，其中包含下列的子属性：
* type	-  可选配置，是描述目标路径的打开形式,如打开一个新的浏览器标签、打开框架内部标签。type=subWindow 或 "" 都在框架内部打开一个标签，其他都打开新的浏览器标签。
* closeable	-	可选配置，是描述当前打开的页面是否支持关闭，默认值为true （type=subWindow 模式时有效）
* icon	-	当subWindow模式打开时的标签图标class name。（type=subWindow 模式时有效）
* label	-	当subWindow模式打开时的标签name（type=subWindow 模式时有效）

### close(path)
关闭一个内部界面.
参数path是必选参数，cola Frame 内部用path作为key进行管理Tab。

### goLogin()
显示登录页。

此方法可以传入回调方法
* 回调方法在登录成功之后被触发。

### setTitle(title)
设置浏览器标签的标题。

### setFavicon(path)
设置浏览器标签小图标。path参数为图标图片的地址

### refreshMessage()
刷新框架消息。

#### 在应用业务界面引入了Cola Frame 提供的/common/common.js的前提下都可调用。