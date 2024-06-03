# 萌翻[MoeFlow]前端项目

**由于部分API代码调整，请更新萌翻后端到对应 Version.1.0.1 后继续使用。**

## 部署方法

非开发者建议参考 [moeflow-deploy](https://github.com/moeflow-com/moeflow-deploy) ，用docker和docker-compose部署。

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

## 本地开发

1. 安装 Node.js 近期LTS版本，如v18 v20
2. `npm install` 安装依赖项
3. `npm start` 启动vite 开发服务器
    - 开发服务器自带API反向代理。默认将 `localhost:5173/api/*` 的请求转发到 `localhost:5000/*` (本地moeflow-backend开发版地址)
    - 上述配置可在 `vite.config.ts` 修改。比如不用本地的moeflow-backend，改用公网的服务器。
4. `npm build` 发布前端代码，**请注意** 此时使用的后端地址配置为 `.env.local` 中的配置。
    - 如果没有创建 `.env.local` 则为默认值 `/api`。

如果您要部署到 `Vercel` 之类的网站托管程序上，您可以直接将 `REACT_APP_BASE_URL` 相对应的后端接口地址配置到托管程序的环境变量中。

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

### Version 1.1.1

- i18n: english locale
- EXPERIMENTAL manga-image-translator based assisted translation
- upgrade deps
- minor fixes

### Version NEXT

- [diff](https://github.com/moeflow-com/moeflow-frontend/compare/v1.1.1...main)
