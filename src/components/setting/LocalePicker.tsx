import { FC } from '@/interfaces';
import { MenuProps } from 'antd';
import { availableLocales, setLocale } from '@/locales';
import { Dropdown, Icon } from '@/components';
import { css } from '@emotion/core';

const dropDownMenuItemStyle = css`
  width: 150px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LocalePicker: FC = () => {
  const menuProps: MenuProps = {
    items: Object.entries(availableLocales).map(([locale, label]) => ({
      label: <div css={dropDownMenuItemStyle}>{label}</div>,
      key: `locale-${locale}`,
      onClick: () => setLocale(locale),
    })),
  };
  return (
    <Dropdown menu={menuProps}>
      <div>
        <Icon icon="language" size="3x" />
      </div>
    </Dropdown>
  );
};
