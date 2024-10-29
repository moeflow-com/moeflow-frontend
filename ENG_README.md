# MoeFlow Frontend Project
[![GitHubStars](https://img.shields.io/github/stars/moeflow-com/moeflow-frontend)]()
[![GitHubForks](https://img.shields.io/github/forks/moeflow-com/moeflow-frontend)]()
[![Chinese README](https://img.shields.io/badge/README-Chinese-red)](README.md)
[![English README](https://img.shields.io/badge/README-English-blue)](ENG_README.md)

**Due to some API code adjustments, please update the MoeFlow backend to Version 1.0.1 before continuing to use.**

## Deployment

For non-developers, it is recommended to refer to [moeflow-deploy](https://github.com/moeflow-com/moeflow-deploy) and use Docker and docker-compose for deployment.

## Tech Stack

- Core
  - react
  - react-router // Routing
  - emotion // CSS in JS
  - react-intl // i18n
  - redux
    - react-redux
    - redux-saga // Side effects handling
  - immer.js // Immutable object handling
- UI
  - antd
  - antd-mobile
  - classnames
  - fontawesome
- Other
  - pepjs // Pointer event polyfill
  - bowser // Browser detection
  - why-did-you-render // Performance optimization
  - lodash // Utility library
  - uuid
  - fontmin // Font minification

## Local Development

1. Install the recent LTS version of Node.js, such as v18 or v20.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the Vite development server.
    - The development server includes API reverse proxying. By default, requests to `localhost:5173/api/*` are forwarded to `localhost:5000/*` (local moeflow-backend development version address).
    - This configuration can be modified in `vite.config.ts`. For instance, you can use a public server instead of the local moeflow-backend.
4. Run `npm build` to build the frontend code for production. **Note** that the backend address used will be configured in `.env.local`.
    - If `.env.local` is not created, the default value is `/api`.

If deploying on hosting services like `Vercel`, you can set `REACT_APP_BASE_URL` to the corresponding backend API address in the hosting environment variables.

## Project Configuration

If your translation team is translating from a language other than Japanese (ja) to Traditional Chinese (zh-TW), you can modify the corresponding configuration in `src/configs.tsx` (the file has comments). Common language codes include:

- `ja` Japanese
- `en` English
- `ko` Korean
- `zh-CN` Simplified Chinese
- `zh-TW` Traditional Chinese

## Version Updates

### Version 1.0.0

First open-source version of the MoeFlow frontend and backend.

### Version 1.0.1

1. Fixed some data processing and interface bugs.
2. Adjusted default initialization settings, reducing the need to modify only the environment variable `REACT_APP_BASE_URL` to point to your backend address.
3. Adjusted the directory structure for generating static files, making joint frontend and backend deployment easier.
4. Updated the "Create Team" and "Create Project" pages for smoother content submission. **(Please use the latest backend version to avoid data format issues!)**
5. Configurable website titles and other content; search for the corresponding terms in `src/locales` to modify.

### Version 1.0.3

(The final stable version of the old architecture. If you encounter issues with new versions, consider reverting to this version.)

1. Added support for setting and displaying homepage HTML/CSS.
2. Builds both linux-amd64 and linux-aarch64 images. Deployment on ARM machines is now possible.

### Version 1.1.0

1. Replaced create-react-app and webpack with Vite for build.

### Version 1.1.1

- i18n: Added English locale.
- EXPERIMENTAL: Assisted translation with manga-image-translator.
- Dependency updates.
- Minor fixes.

### Version NEXT

- [diff](https://github.com/moeflow-com/moeflow-frontend/compare/v1.1.1...main)
