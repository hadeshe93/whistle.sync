# whistle.sync

用于同步 whistle 配置的插件，目前仅支持「全量」同步 `rules` 和 `values`，且目前仅支持将数据备份到阿里云 OSS，来实现 PUSH 和 PULL 的同步操作。

内部使用 [ali-oss](https://www.npmjs.com/package/ali-oss) 包进行数据的推拉，详细 api 见文档即可。
