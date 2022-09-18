// 关闭翻译文本中 ${xxx} 的 Warning
/* eslint-disable no-template-curly-in-string */
import { createIntl, createIntlCache } from 'react-intl';
// 引入 intl 的 locale message
import intl_zhCN from './zh-cn.json';
// 引入 antd 的 locale
import antd_zhCN from 'antd/es/locale/zh_CN';

/** 获取用户语言 */
const getLocale = () => {
  return navigator.language;
};

/** 获取 Intl 的 messages */
const getIntlMessages = (locale: string) => {
  return intl_zhCN;
};

/** 获取 antd 所用的 locale */
const getAntdLocale = (locale: string) => {
  return antd_zhCN;
};

/** 获取 antd 所用的 Validate Messages */
const getAntdValidateMessages = (locale: string) => {
  // const typeTemplate_enUS = 'Value is not a valid ${type}';
  // const enUS = {
  //   default: 'Validation error on field',
  //   required: 'Value is required',
  //   enum: 'Value must be one of [${enum}]',
  //   whitespace: 'Value cannot be empty',
  //   date: {
  //     format: 'Value is invalid for format date',
  //     parse: 'Value could not be parsed as date',
  //     invalid: 'Value is invalid date'
  //   },
  //   types: {
  //     string: typeTemplate_enUS,
  //     method: typeTemplate_enUS,
  //     array: typeTemplate_enUS,
  //     object: typeTemplate_enUS,
  //     number: typeTemplate_enUS,
  //     date: typeTemplate_enUS,
  //     boolean: typeTemplate_enUS,
  //     integer: typeTemplate_enUS,
  //     float: typeTemplate_enUS,
  //     regexp: typeTemplate_enUS,
  //     email: typeTemplate_enUS,
  //     url: typeTemplate_enUS,
  //     hex: typeTemplate_enUS
  //   },
  //   string: {
  //     len: 'Value must be exactly ${len} characters',
  //     min: 'Value must be at least ${min} characters',
  //     max: 'Value cannot be longer than ${max} characters',
  //     range: 'Value must be between ${min} and ${max} characters'
  //   },
  //   number: {
  //     len: 'Value must equal ${len}',
  //     min: 'Value cannot be less than ${min}',
  //     max: 'Value cannot be greater than ${max}',
  //     range: 'Value must be between ${min} and ${max}'
  //   },
  //   array: {
  //     len: 'Value must be exactly ${len} in length',
  //     min: 'Value cannot be less than ${min} in length',
  //     max: 'Value cannot be greater than ${max} in length',
  //     range: 'Value must be between ${min} and ${max} in length'
  //   },
  //   pattern: {
  //     mismatch: 'Value does not match pattern ${pattern}'
  //   }
  // };

  const typeTemplate_zhCN = '类型不是合法的 ${type}';
  const zhCN = {
    default: '格式错误',
    required: '必填',
    enum: '必须为 [${enum}] 其中之一',
    whitespace: '不可为空字符',
    date: {
      format: '格式日期无效',
      parse: '无法被解析成时间',
      invalid: '无效的时间'
    },
    types: {
      string: typeTemplate_zhCN,
      method: typeTemplate_zhCN,
      array: typeTemplate_zhCN,
      object: typeTemplate_zhCN,
      number: typeTemplate_zhCN,
      date: typeTemplate_zhCN,
      boolean: typeTemplate_zhCN,
      integer: typeTemplate_zhCN,
      float: typeTemplate_zhCN,
      regexp: typeTemplate_zhCN,
      email: typeTemplate_zhCN,
      url: typeTemplate_zhCN,
      hex: typeTemplate_zhCN
    },
    string: {
      len: '长度必须为 ${len} 个字符',
      min: '长度最少为 ${min} 个字符',
      max: '长度最多为 ${max} 个字符',
      range: '长度必须在 ${min} 到 ${max} 个字符之间'
    },
    number: {
      len: '数值必须等于 ${len}',
      min: '数值不可小于 ${min}',
      max: '数值不可大于 ${max}',
      range: '数值必须在 ${min} 到 ${max} 之间'
    },
    array: {
      len: '元素个数必须等于 ${len}',
      min: '元素个数不可小于 ${min}',
      max: '元素个数不可大于 ${max}',
      range: '元素个数必须在 ${min} 到 ${max} 之间'
    },
    pattern: {
      mismatch: '不匹配正则：${pattern}'
    }
  };
  return zhCN;
};

/** 用于在 React 组件外部使用 Intl */
const cache = createIntlCache();
/** 切换语言时直接修此对象 */
const intlConfig = {
  locale: getLocale(),
  messages: getIntlMessages(getLocale())
};
/** 获取在组件外使用的 intl 实例 */
const getIntl = () => {
  return createIntl(intlConfig, cache);
};

export {
  getLocale,
  getIntlMessages,
  getAntdLocale,
  getAntdValidateMessages,
  getIntl,
  intlConfig
};
