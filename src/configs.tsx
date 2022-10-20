// 公共配置
const configs = {
  baseURL: process.env.REACT_APP_BASE_URL,
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

console.log(
  `%c ${process.env.REACT_APP_BUILDNAME} %c Ver.${process.env.REACT_APP_BUILDVERSION} %c ${process.env.REACT_APP_BUILDTIME}`,
  'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
  'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
  'background:transparent'
)

if (process.env.NODE_ENV === 'production') {
  // 生产环境配置
} else if (process.env.NODE_ENV === 'test') {
  // 测试环境配置
}
export default configs;
