# 基本参数设定

在开始进行实际的开发之前我们首先需要确定一些基本的参数设置。Cola Shell项目的配置参数通常都被放在`/public/common/common.js`中，
在这个文件中我们可以找到这样一段内容。各种默认参数值应该在这里进行配置。

```
/* 系统默认值 */
var properties = {
      mainView: "./frame/main",
      loginPath: "./login",
      longPollingTimeout: 0,
      longPollingInterval: 2000,
      "service.messagePull": "./service/message/pull",
      "service.login": "./service/account/login",
      "service.logout": "./service/account/logout",
      "service.menus": "./service/menus",
      "service.user.detail": "./service/user/detail",
      "message.action": {
        path: "http://cola-ui.com",
        type: "subWindow",
        label: "我的消息",
        closeable: true
      },
      "task.action": {
        path: "http://cola-ui.com",
        type: "subWindow",
        label: "我的任务",
        closeable: true
      },
      "app.logo.path": "./resources/images/logo.png",
      "app.name": "Cola-UI Client Framework",
      title: "Cola-Frame"
    };
  });
```

这里支持的参数目前有以下这些：

* mainView	-	系统主框架界面地址
* loginPath	-	登录界面路径
* longPollingTimeout	-	消息长轮询请求超时时间
* longPollingInterval	-	框架长轮询周期
* service.messagePull	-	消息接口
* service.login	-	登录接口
* service.logout	-	登出接口
* service.menus	-	系统菜单接口
* service.user.detail	-	获得当前用户详细信息接口
* message.action	-	单击右上角消息按钮后的响应配置
* task.action	-	单击右上角任务按钮后的响应配置
* app.logo.path	-	系统Logo图片地址
* app.name	-	系统名称
* title	-	系统Title 浏览器标签标题
