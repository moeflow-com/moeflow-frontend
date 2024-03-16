# 萌翻[MoeFlow]前端项目

**由于部分API代码调整，请更新萌翻后端到对应 Version.1.0.1 后继续使用。**

## 技术栈

- Core
  - react
  - react-router // 路由
  - emotion // CSS in JS
  - react-intl // i18n
  - redux
    - react-redux
    - redux-saga // 副作用处理
  - immer.js // 不可变对象处理
- UI
  - antd
  - antd-mobile
  - classnames
  - fontawesome
- Other
  - pepjs // Pointer 事件垫片
  - bowser // 浏览器识别
  - why-did-you-render // 性能优化
  - lodash // 工具库
  - uuid
  - fontmin // 字体剪切

## 开发步骤

1. 建议使用 Node.js 近期LTS版本，如v18 v20
2. `npm install` 安装依赖项
3. `npm start start` 启动vite 开发服务器
    - 开发服务器自带API反向代理。默认将 `localhost:5173/api/*` 的请求自动转发到 `localhost:5000` (本地moeflow-backend开发版)
    - 上述配置可在 `vite.config.ts` 修改。比如不在本地跑moeflow-backend，改用公网的服务器。
4. `npm build` 发布前端代码，**请注意** 此时使用的后端地址配置为 `.env.local` 中的配置。
    - 如果没有创建 `.env.local` 则为默认值 `/api`。

如果您要部署到 `Vercel` 之类的网站托管程序上，您可以直接将 `REACT_APP_BASE_URL` 相对应的后端接口地址配置到托管程序的环境变量中。

## 将前后端项目合并

最新版本的后端已经支持将前端项目编译完合并到后端，仅保留一个端口更好做映射！

1. 复制 `.env.sample` 改名为 `.env.local` 修改此文件为 `REACT_APP_BASE_URL=/`
2. `npm run build` 编译前端代码。默认的编译结果目录是 `build`
3. 打开 [萌翻后端项目](https://github.com/kozzzx/moeflow-backend) 找到 `app` 文件夹，将前端 `build/static` 整个文件夹复制到此目录。
4. 找到后端项目 `app/templates/index.html` 文件，用前端 `build/index.html` 文件替换。
5. 将后端跑起来，访问首页 `http://127.0.0.1:5001/`（地址以命令行提示为准） 就可以正常访问、登录等操作。

## 修改项目配置

如果您的译制组不是从 日语(ja) 翻译为 繁体中文(zh-TW) 您可以修改 `src/configs.tsx` 文件中的对应位置的配置（文件中有注释）。
以下是常见的几个语言代码：

- `ja` 日语
- `en` 英语
- `ko` 朝鲜语（韩语）
- `zh-CN` 简体中文
- `zh-TW` 繁体中文

## 版本更新内容

### Version 1.0.0

萌翻前后端开源的首个版本

### Version 1.0.1

1. 处理一些数据处理和界面上的BUG
2. 调整需要初始化的默认配置内容，减少后只需要修改环境变量 `REACT_APP_BASE_URL` 指向您部署的后端地址。
3. 调整静态文件生成的目录结构，方便前后端联合部署。
4. 调整“创建团队”、“创建项目”页面中部分项目提交的内容。**（请配合最新版本的后端，避免出现数据格式问题！）**
5. 可配置网站标题等位置的内容，请从 `src/locales` 中查找对应词汇进行修改。

### Version 1.0.3

(旧构架的最后稳定版本。如果新版本中遇到问题，建议回退至此版本尝试。)

1. 支持设置和显示首页 HTML/CSS
2. 同时构建linux-amd64和linux-aarch64镜像。此版本起可以部署到ARM机器。

### Version 1.1.0

1. 抛弃create-react-app和webpack，改用vite构建。

### Version NEXT

- [diff](https://github.com/moeflow-com/moeflow-frontend/compare/v1.1.0...main)
