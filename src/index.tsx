import { initI18n } from './locales';
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
import store from './store';
import { setOSName, setPlatform } from './store/site/slice';
import { setUserToken } from './store/user/slice';
import { getToken } from './utils/cookie';
import { OSName, Platform } from './interfaces';
import {
  getDefaultHotKey,
  hotKeyInitialState,
  HotKeyState,
  setHotKey,
} from './store/hotKey/slice';
import { loadHotKey } from './utils/storage';

// 时间插件
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

async function mountApp() {
  const { intlMessages, locale, antdLocale, antdValidateMessages } =
    await initI18n;

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
}

Promise.resolve().then(mountApp);
