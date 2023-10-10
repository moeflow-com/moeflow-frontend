// 公共配置
const configs = {
  baseURL: process.env.REACT_APP_BASE_URL, // 后端地址
  siteName: process.env.REACT_APP_SITE_NAME,  // 网站名称[有填写则覆盖]
  miitBeiAn: process.env.REACT_APP_BEIAN_NO, // 工信部备案信息[有填写则显示]
  siteSlogan: '', // 首页标题附加的标语[有填写则覆盖原有标语]
  /** 默认值 */
  default: {
    team: {
      systemRole: 'member', // 团队默认角色，后端部署后不会变动
      allowApplyType: 2,
      applicationCheckType: 2,
    },
    project: {
      systemRole: 'supporter', // 项目默认角色，后端部署后不会变动
      allowApplyType: 3,
      applicationCheckType: 1,
      sourceLanugageCode: 'ja', // 默认源语言，后端部署后不会变动
      targetLanguageCodes: ['zh-TW'], // 默认目标语言，后端部署后不会变动
    },
  },
};

if (process.env.NODE_ENV === 'production') {
  // 生产环境配置
} else if (process.env.NODE_ENV === 'test') {
  // 测试环境配置
}
export default configs;
