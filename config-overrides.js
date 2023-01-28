const {
  override,
  fixBabelImports,
  addLessLoader,
  addBabelPresets
} = require('customize-cra');
const antdLessVars = require('./style').antdLessVars;
const antdLessVarsM = require('./style').antdLessVarsM;

module.exports = override(
  // antd 按需导入
  fixBabelImports('antd', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  // antd-mobile 按需导入
  fixBabelImports('antd-mobile', {
    libraryName: 'antd-mobile',
    style: true
  }),
  // 覆盖 antd 的 Less 样式
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { ...antdLessVars, ...antdLessVarsM }
  }),
  // 添加 Babel Presets
  ...addBabelPresets('@emotion/babel-preset-css-prop')
);
