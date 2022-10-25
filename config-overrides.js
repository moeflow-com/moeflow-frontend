const {
  override,
  fixBabelImports,
  addLessLoader,
  addBabelPresets
} = require('customize-cra');
const antdLessVars = require('./style').antdLessVars;
const antdLessVarsM = require('./style').antdLessVarsM;
const pkg = require('./package')
process.env.REACT_APP_BUILDNAME = pkg.name
process.env.REACT_APP_BUILDVERSION = pkg.version
process.env.REACT_APP_BUILDTIME = `${(new Date()).toLocaleString()}`

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
