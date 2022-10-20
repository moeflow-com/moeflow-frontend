import _ from 'lodash';

// 用于转换 JavaScript 中常用的大写简写
const abbrs = [
  ['ID', 'Id', 'id'],
  ['TXT', 'Txt', 'txt'],
  ['CAPTCHA', 'Captcha', 'captcha'],
];

// 将字符串从“小驼峰格式”转为“连字符格式”
function stringToHyphenCase(value: string) {
  return value.replace(/([A-Z])/g, '-$1').toLowerCase();
}
/**
 * 将字符串或对象的 key 从“小驼峰格式”转为“连字符格式”
 */
function toHyphenCase(value: string): string;
function toHyphenCase<T>(value: T): T;
function toHyphenCase(value: string | { [propNames: string]: any }) {
  if (typeof value === 'string') {
    return stringToHyphenCase(value);
  } else {
    const newValue: { [key: string]: any } = {};
    for (let key in value) {
      newValue[stringToHyphenCase(key)] = value[key];
    }
    return newValue;
  }
}

// 将字符串从“小驼峰格式”转为“下划线格式”
function stringToUnderScoreCase(value: string) {
  // 将全大写的简写提前替换
  abbrs.forEach((item) => {
    value = value.replace(item[0], item[1]);
  });
  return value.replace(/([A-Z])/g, '_$1').toLowerCase();
}
/**
 * 将字符串或对象的 key 从“小驼峰格式”转为“下划线格式”
 */
function toUnderScoreCase(value: string): string;
function toUnderScoreCase<T>(value: T): T;
function toUnderScoreCase(
  value: string | { [propNames: string]: any | any[] }
) {
  if (typeof value === 'string') {
    return stringToUnderScoreCase(value);
  } else if (_.isArray(value)) {
    return value.map((v: any) => toUnderScoreCase(v));
  } else if (_.isPlainObject(value)) {
    const newValue: { [key: string]: any } = {};
    for (let key in value) {
      if (_.isPlainObject(value[key])) {
        // 递归处理所以子对象
        newValue[stringToUnderScoreCase(key)] = toUnderScoreCase(value[key]);
      } else if (_.isArray(value[key])) {
        // 递归处理所以子数组
        newValue[stringToUnderScoreCase(key)] = value[key].map((v: any) => {
          if (_.isPlainObject(v)) return toUnderScoreCase(v)
          else return v
        });
      } else {
        newValue[stringToUnderScoreCase(key)] = value[key];
      }
    }
    return newValue;
  } else {
    return value;
  }
}

// 将字符串从“下划线格式”转换为“小驼峰格式”
function stringToLowerCamelCase(value: string) {
  // 将全大写的简写提前替换
  abbrs.forEach((item) => {
    value = value.replace('_' + item[2], '_' + item[0]);
  });
  return value.replace(/_(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
}
/**
 * 将字符串或对象的 key 从“下划线格式”转换为“小驼峰格式”
 */
function toLowerCamelCase(value: string): string;
function toLowerCamelCase<T>(value: T): T;
function toLowerCamelCase(
  value: string | { [propNames: string]: any } | any[]
) {
  if (typeof value === 'string') {
    return stringToLowerCamelCase(value);
  } else if (_.isArray(value)) {
    return value.map((v: any) => toLowerCamelCase(v));
  } else if (_.isPlainObject(value)) {
    const newValue: { [key: string]: any } = {};
    for (let key in value) {
      if (_.isPlainObject(value[key])) {
        // 递归处理所以子对象
        newValue[stringToLowerCamelCase(key)] = toLowerCamelCase(value[key]);
      } else if (_.isArray(value[key])) {
        // 递归处理所以子数组
        newValue[stringToLowerCamelCase(key)] = value[key].map((v: any) =>
          toLowerCamelCase(v)
        );
      } else {
        newValue[stringToLowerCamelCase(key)] = value[key];
      }
    }
    return newValue;
  } else {
    return value;
  }
}

interface FormError {
  name: string;
  errors: string[];
}
interface ToFormErrors {
  (value: { [propNames: string]: any }): FormError[];
}
/**
 * 将 API 返回的字段验证错误（下划线），转换为 Form 使用的错误列表（小驼峰）
 */
const toFormErrors: ToFormErrors = (value) => {
  const newValue = [];
  for (let key in value) {
    newValue.push({
      name: stringToLowerCamelCase(key),
      errors: value[key],
    });
  }
  return newValue;
};

/**
 * 将字符串转为复数
 */
const toPlural = (value: string) => {
  return value + 's';
};

export {
  toHyphenCase,
  toUnderScoreCase,
  toLowerCamelCase,
  toFormErrors,
  toPlural,
};
