import { GroupTypes } from '../apis/type';
import { getIntl } from '../locales';

export function formatGroupType(groupType: GroupTypes) {
  const intl = getIntl();

  if (groupType === 'project') {
    return intl.formatMessage({ id: 'site.project' });
  } else if (groupType === 'team') {
    return intl.formatMessage({ id: 'site.team' });
  } else {
    return intl.formatMessage({ id: 'site.group' });
  }
}
