import { DependencyList, useEffect } from 'react';
import { useIntl } from 'react-intl';
import configs from '../configs';

interface UseTitleParams {
  prefix?: string;
  suffix?: string;
  hyphen?: string;
}
interface UseTitle {
  (params?: UseTitleParams, deps?: DependencyList): void;
}
/**
 * 设置页面标题
 * @param prefix 前缀
 * @param suffix 后缀
 * @param hyphen 站点名和前缀/后缀之间的连字符
 */
export const useTitle: UseTitle = (
  { prefix = '', suffix = '', hyphen = ' · ' }: UseTitleParams = {},
  deps = []
) => {
  const { formatMessage } = useIntl();
  const siteName = configs.siteName || formatMessage({ id: 'site.name' })
  if (prefix !== '') prefix = prefix + hyphen;
  if (suffix !== '') suffix = hyphen + suffix;
  useEffect(() => {
    document.title = prefix + siteName + suffix;
    return () => {
      document.title = siteName;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
