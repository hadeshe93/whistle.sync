# whistle.sync

用于同步 whistle 配置的插件，目前仅支持「全量」同步 `rules` 和 `values`，且目前仅支持将数据备份到阿里云 OSS，来实现 PUSH 和 PULL 的同步操作。

内部使用 [ali-oss](https://www.npmjs.com/package/ali-oss) 包进行数据的推拉，详细 api 见文档即可。

## 使用

首先要安装插件：
```bash
npm i -g whistle.sync
```

然后到插件配置中填写 OSS 配置，完成后保存。

当 A 侧 PUSH 之后，B 侧就可以 PULL，PULL 之后必须在终端重启 whistle，Rules 和 Values 才会成功显示出来。

## 注意

本插件开发的意图本是为了方便自己多端同步配置，鉴于本插件会涉及到将敏感信息保存到本地，请在和其他插件一起使用时评估其他插件带来的风险。
