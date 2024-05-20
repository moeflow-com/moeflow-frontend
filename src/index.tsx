import { ConfigProvider } from 'antd';
import Bowser from 'bowser';
import 'pepjs'; // 指针事件垫片
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl'; // i18n
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './fontAwesome'; // Font Awesome
import './index.css';
import {
  getAntdLocale,
  getAntdValidateMessages,
  getIntlMessages,
  getLocale,
} from './locales';
import store from './store';
import { setOSName, setPlatform } from './store/site/slice';
import { setUserToken } from './store/user/slice';
import { getToken } from './utils/cookie';
import { OSName, Platform } from './interfaces/common';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/zh-cn';
import {
  getDefaultHotKey,
  hotKeyInitialState,
  HotKeyState,
  setHotKey,
} from './store/hotKey/slice';
import { loadHotKey } from './utils/storage';

// TODO 完成一个函数，用于从服务器和cookie获取用户的语言
// TODO 将 locale/messages 记录 Store 中，以便能时时修改
// TODO 同时修改 locales/utils 中的 intlConfig，使组件外使用的 intl 也更改语言（“网络错误”弹窗和“CAPTCHAInput”的checkCAPTCHA中用到，测试一下）
const locale = getLocale(); // 用户地域，暂时用浏览器语言
const intlMessages = getIntlMessages(locale);
const antdLocale = getAntdLocale(locale);
const antdValidateMessages = getAntdValidateMessages(locale);
// 时间插件
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.locale(locale.toLowerCase());
if (false && process.env.NODE_ENV === 'development') {
  // 用于检测是什么导致 re-render
  const { default: whyDidYouRender } = await import(
    '@welldone-software/why-did-you-render'
  );
  whyDidYouRender(React, { trackAllPureComponents: true });
}
// 将 Cookie 中 token 恢复到 Store
const cookieToken = getToken();
if (cookieToken) {
  store.dispatch(setUserToken({ token: cookieToken, refresh: true }));
}
// 浏览器识别
const browser = Bowser.getParser(window.navigator.userAgent);
const platform = browser.getPlatformType() as Platform;
const osName = browser.getOSName(true) as OSName;
store.dispatch(setPlatform(platform));
store.dispatch(setOSName(osName));
// 恢复自定义快捷键
for (const hotKeyName in hotKeyInitialState) {
  const name = hotKeyName as keyof HotKeyState;
  for (const index of [0, 1]) {
    const loadedHotKey = loadHotKey({ name, index });
    if (loadedHotKey !== 'disabled') {
      let option;
      if (loadedHotKey) {
        option = loadedHotKey;
      } else {
        option = getDefaultHotKey({ name, index, osName });
      }
      store.dispatch(setHotKey({ name, index, option }));
    }
  }
}
// 渲染 APP
ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <IntlProvider locale={locale} messages={intlMessages}>
        <ConfigProvider
          locale={antdLocale}
          form={{ validateMessages: antdValidateMessages }}
        >
          <Router>
            <App />
          </Router>
        </ConfigProvider>
      </IntlProvider>
    </Provider>
  </StrictMode>,
  document.getElementById('root'),
);
