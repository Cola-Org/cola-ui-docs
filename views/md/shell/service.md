# 后台服务接口

要使Cola Shell的App能够良好的工作，需要实现几个基本的后端服务接口，以便于前端界面得到一些关键的信息。
这些接口都是Ajax形式发出，其URL符合Restful的规则，且Response都是JSON格式的。

如果您是用Java开发后端接口的话，建议您使用Spring MVC来搭建整个Restful的服务架构，
具体可以参考我们提供的 https://github.com/Cola-Org/cola-ui-spring-rest-example 示例。

如果你使用其他方式来搭建后端接口的话，请注意为这些服务的Response设置正确的ContentType，即`Content-Type:application/json`。
否则jQuery的默认处理逻辑并不会将Response的内容转换成JSON。

### 获取应用基本信息的接口

用于获得获取登录状态、登录用户信息、系统可用版本等基本信息的接口。该接口会在App已启动时由客户端第一时间自动发起，以便于尽早确认App是否已登录等关键信息。

* URL:`/service/sys/info`。
* Method: GET

如果不想使用这个路径的话可以在app-config.js中修改Cola Shell的`service.sysInfo`参数。

该接口的Response的结构是这样的...
```
{
	authenticated: true/false,	// 是否已登录
	authInfo: {	// 登录用户的信息，此JSON对象中的属性可以自由定义 },
	availableVersion: "0.0.0"	// 可用的版本更新，例如本例版本号为1.0.0，而availableVersion为1.0.1，那么系统会认为目前存在可用的版本更新。
}
```

### 登录

Cola Shell已经默认提供好了一套登录界面，如果不使用Cola Shell提供的登录界面，那么你可以直接跳过这一段内容。
如果要使用这套界面你只需要在后台为它定义一个登录的服务接口就好了。

* URL:`/service/login`。
* Method: POST
* Form Data:
	* account: 登录账户名
	* password: 口令
	* captcha: 验证码（如果启用的话）

如果你希望改变这个服务的路径可以在app-config.js中修改Cola Shell的`service.login`参数。

该接口的Response的结构是这样的...
```
{
	authenticated: true/false,	// 登录是否成功
	authInfo: {	// 如果登录成功则顺便输出登录用户的信息，此JSON对象中的属性可以自由定义 },
	message: ""	// 如果登录失败则输出失败的原因
}
```

### 获取消息汇总
TODO

### 拉取消息
TODO