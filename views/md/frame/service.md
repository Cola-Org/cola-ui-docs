# 后台服务接口

要使Cola Frame的App能够良好的工作，需要实现几个基本的后端服务接口，以便于前端界面得到一些关键的信息。
这些接口都是Ajax形式发出，其URL符合Restful的规则，且Response都是JSON格式的。

如果您是用Java开发后端接口的话，建议您使用Spring MVC来搭建整个Restful的服务架构，
具体可以参考我们提供的 https://github.com/Cola-Org/cola-ui-spring-rest-example 示例。

如果你使用其他方式来搭建后端接口的话，请注意为这些服务的Response设置正确的ContentType，即`Content-Type:application/json`。
否则jQuery的默认处理逻辑并不会将Response的内容转换成JSON。

### 获取应用菜单接口

用于获得获取登录状态、登录用户信息、系统可用版本等基本信息的接口。该接口会在App已启动时由客户端第一时间自动发起，以便于尽早确认App是否已登录等关键信息。

* URL:`./service/menus`。
* Method: GET

如果不想使用这个路径的话可以在common.js中修改Cola Frame的`service.menus`参数。

该接口的Response的结构是这样的...
```
[
	{
		icon: "icon setting",
		label: "内容设置",
		menus: [
			{
				icon: "icon payment",
				label: "导航设置",
				type: "subWindow",
				closeable: true,
				path:"/path"
			}, 
			{
				icon: "icon edit",
				label: "分类管理",
				menus: [
					{
						icon: "icon sidebar",
						label: "用户列表",
						type: "subWindow",
                        closeable: true,
						path: "/example/time-line"
					}, {
						icon: "icon sitemap",
						label: "用户组",
						type: "subWindow",
                        closeable: true,
						path: "/example/time-line"
					}
				]
			}, 
			{
				icon: "iconfont icon-zhucerenzheng",
				label: "专题管理",
				type: "subWindow",
                closeable: true,
				path:"/path"
			}
		]
	}
]
```

### 登录

Cola Shell已经默认提供好了一套登录界面，如果不使用Cola Shell提供的登录界面，那么你可以直接跳过这一段内容。
如果要使用这套界面你只需要在后台为它定义一个登录的服务接口就好了。

* URL:`/service/account/login`。
* Method: POST
* Form Data:
	* userName: 登录账户名
	* password: 口令

如果你希望改变这个服务的路径可以在common.js中修改Cola Frame的`service.login`参数。

该接口的Response的结构是这样的...
```
{
	type: true/false,	// 登录是否成功
	message: ""	// 如果登录失败则输出失败的原因
}
```
### 登出

Cola Shell已经默认提供好了一套登录界面，如果不使用Cola Shell提供的登录界面，那么你可以直接跳过这一段内容。
如果要使用这套界面你只需要在后台为它定义一个登录的服务接口就好了。

* URL:`/service/account/logout`。
* Method: POST

如果你希望改变这个服务的路径可以在common.js中修改Cola Frame的`service.logout`参数。

该接口的Response的结构是这样的...
```
{
	type: true/false,	// 登出是否成功
	message: ""	// 如果登录失败则输出失败的原因
}
```

### 拉取消息

用于获得后台消息的接口。

* URL:`./service/message/pull`。
* Method: GET

如果不想使用这个路径的话可以在common.js中修改Cola Frame的`service.messagePull`参数。

该接口的Response的结构是这样的...
```
[
	{
		type:"message",
		content:12
	},
	{
        type:"task",
        content:8
    }
]
```

### 获得用户详细信息

用于获得获取登录用户信息的接口。

* URL:`./service/user/detail`。
* Method: GET

如果不想使用这个路径的话可以在common.js中修改Cola Frame的`service.menus`参数。

该接口的Response的结构是这样的...
```
	{
		id: "u0001"
        name: "Alex Tong"
        avatar: "/resources/images/avatars/alex.png"
    }

```