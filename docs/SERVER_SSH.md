# 云服务器 SSH 连接记录

这份文件给本项目和 Codex 记录服务器连接方式。不要把私钥内容写进仓库。

## 服务器

- 实例名称：Hermes Agent-DqxC
- 实例 ID：lhins-764myzie
- 地域：上海 / 上海四区
- 公网 IP：124.222.83.113
- 登录用户：ubuntu

## 本机私钥

私钥文件在本机桌面：

```bash
/Users/macminim4/Desktop/rule/agar.pem
```

如果 SSH 提示私钥权限过宽，先运行：

```bash
chmod 600 /Users/macminim4/Desktop/rule/agar.pem
```

## SSH 连接

```bash
ssh -i /Users/macminim4/Desktop/rule/agar.pem ubuntu@124.222.83.113
```

`root` 用户当前不接受这个私钥。需要管理员权限时，登录后使用 `sudo`。

## 当前项目部署信息

- 服务器项目目录：`/home/ubuntu/apps/food`
- 公网访问地址：`http://124.222.83.113/`
- pm2 服务名：`food`
- 服务端口：`3001`
- nginx：公网 `80` 端口代理到 `http://127.0.0.1:3001`

常用服务器命令：

```bash
cd /home/ubuntu/apps/food
pm2 list
pm2 logs food
pm2 restart food
```

当前服务器上还保留旧服务：

- `agar-io-clone` pm2 服务仍在 `3000` 端口运行。
