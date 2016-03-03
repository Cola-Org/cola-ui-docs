# Cola-UI编码规范

下面是Cola-UI Hello-World例子的代码，为了获得更高性能的Web体验请参考如下此例：
```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<!--网页页面字符集-->
	<meta charset="UTF-8">
	<!--针对移动设备,网站显示宽度等于设备屏幕显示宽度,内容缩放比例为1:1-->
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<!--将下面的 <meta> 标签加入到页面中，可以让部分国产浏览器默认采用高速模式渲染页面：-->
	<meta name="renderer" content="webkit">
	<!-- 上述3个meta标签*必须*放在最前面，任何其他内容都*必须*跟随其后！ -->
	<title>Cola-UI</title>
	<!-- css引入和样式定义区域 -->
	<link rel="stylesheet" type="text/css" href="resources/cola-ui/semantic.css">
	<link rel="stylesheet" type="text/css" href="resources/cola-ui/cola.css">
	<!-- document 内部样式定义区域-->
	<style>
		body {
			padding: 1em;
		}
	</style>
</head>
<body>
Hello <span c-bind="name"></span> !
<br>
<input c-bind="name">
<!-- javascript引入区域 -->
<script src="resources/jquery-2.1.3.js"></script>
<script src="resources/cola-ui/3rd.js"></script>
<script src="resources/cola-ui/semantic.js"></script>
<script src="resources/cola-ui/cola.js"></script>
<script src="resources/cola-ui/i18n/zh-Hans/cola.js"></script>
<!-- document 内部样式定义区域-->
<script type="text/javascript">
	cola(function (model) {
		model.set("name", "World");
	});
</script>
</body>
</html>
```
***
## HTML5 doctype

为每个 HTML 页面的第一行添加标准模式（standard mode）的声明，这样能够确保在每个浏览器中拥有一致的展现。
```
<!DOCTYPE html>
<html>
  <head>
  </head>
</html>
```

## 语言属性
根据 HTML5 规范：
强烈建议为 html 根元素指定 lang 属性，从而为文档设置正确的语言。这将有助于语音合成工具确定其所应该采用的发音，有助于翻译工具确定其翻译时所应遵守的规则等等。
```
<html lang="zh-CN">
  <!-- ... -->
</html>
```
## 字符编码
通过明确声明字符编码，能够确保浏览器快速并容易的判断页面内容的渲染方式。这样做的好处是，可以避免在 HTML 中使用字符实体标记（character entity），从而全部与文档编码一致（一般采用 UTF-8 编码）。
```
<head>
  <meta charset="UTF-8">
</head>
```
## Viewport
```
<head>
	<meta name=”viewport” content=”width=device-width, initial-scale=1, maximum-scale=1″>
</head>
```
* width：控制 viewport 的大小，可以指定的一个值，如果 600，或者特殊的值，如 device-width 为设备的宽度（单位为缩放为 100% 时的 CSS 的像素）。
* height：和 width 相对应，指定高度。
* initial-scale：初始缩放比例，也即是当页面第一次 load 的时候缩放比例。
* maximum-scale：允许用户缩放到的最大比例。
* minimum-scale：允许用户缩放到的最小比例。
* user-scalable：用户是否可以手动缩放

## 引入 CSS 和 JavaScript 文件

### CSS引入在先
CSS 用来定义网页样式，如果html载入了而CSS没载入，那网站就会面目全非，所以为了第一时间获得更加美观的界面CSS最好在`head`标签中引入。

### 为何`<script>`标签尽可能放到`<body>`标签的底部

浏览器在下载和执行JavaScript时出现阻塞，无论当前JavaScript代码是内嵌还是在外链文件中，页面的下载和渲染都必须停下来等待脚本执行完成。JavaScript 
执行过程耗时越久，浏览器等待响应用户输入的时间就越长。


此文档还在完善中……

