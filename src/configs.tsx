// 公共配置
const configs = {
  baseURL: '',
  /** 默认值 */
  default: {
    team: {
      systemRole: '', // 默认角色 ID，后端部署后不会变动
      allowApplyType: 0,
      applicationCheckType: 0,
    },
    project: {
      systemRole: '', // 默认角色 ID，后端部署后不会变动
      allowApplyType: 0,
      applicationCheckType: 0,
      sourceLanugageID: '', // 默认源语言 ID，后端部署后不会变动
      targetLanguageIDs: [''], // 默认目标语言 ID，后端部署后不会变动
    },
  },
};

if (process.env.NODE_ENV === 'development') {
  // 开发环境配置
  configs.baseURL = 'http://127.0.0.1:5001';
  configs.default.team = {
    systemRole: '626eb57fdef4db8fb8d22189',
    allowApplyType: 2,
    applicationCheckType: 2,
  };
  configs.default.project = {
    systemRole: '626eb57fdef4db8fb8d2218e',
    allowApplyType: 3,
    applicationCheckType: 1,
    sourceLanugageID: '626eb57fdef4db8fb8d22193',
    targetLanguageIDs: ['626eb57fdef4db8fb8d22194'],
  };
} else if (process.env.NODE_ENV === 'production') {
  // 生产环境配置
  configs.baseURL = 'https://api.moeflow.com';
  configs.default.team = {
    systemRole: '5fad690cb804bf27fdafbd44',
    allowApplyType: 2,
    applicationCheckType: 2,
  };
  configs.default.project = {
    systemRole: '5fad690cb804bf27fdafbd49',
    allowApplyType: 3,
    applicationCheckType: 1,
    sourceLanugageID: '5fad690cb804bf27fdafbd4b',
    targetLanguageIDs: ['5fad690cb804bf27fdafbd4e'],
  };
} else if (process.env.NODE_ENV === 'test') {
  // 测试环境配置
}
export default configs;
