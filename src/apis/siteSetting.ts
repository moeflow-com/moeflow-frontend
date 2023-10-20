import { AxiosRequestConfig } from 'axios';
import { request } from '.';
import { toUnderScoreCase } from '../utils';

export interface APISiteSetting {
  enableWhitelist: boolean;
  whitelistEmails: string[];
  onlyAllowAdminCreateTeam: boolean;
  autoJoinTeamIDs: string[];
}

const getSiteSetting = ({ configs }: { configs?: AxiosRequestConfig }) => {
  return request({
    method: 'GET',
    url: `/v1/admin/site-setting`,
    ...configs,
  });
};

const editSiteSetting = ({
  data,
  configs,
}: {
  data: APISiteSetting;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/admin/site-setting`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

export interface APIHomepage {
  html: string;
  css: string;
}
const getHomepage = ({ configs }: { configs?: AxiosRequestConfig }) => {
  return request<APIHomepage>({
    method: 'GET',
    url: `/v1/site/homepage`,
    ...configs,
  });
};

export default {
  getSiteSetting,
  editSiteSetting,
  getHomepage,
};
