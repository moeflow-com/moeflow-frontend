import { css } from '@emotion/core';
import classNames from 'classnames';
import { FC } from '@/interfaces';
import style from '@/style';

/** 一般内容体中一行 的属性接口 */
interface ContentItemProps {
  className?: string;
}
/**
 * 一般内容体中一行
 */
export const ContentItem: FC<ContentItemProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(['ContentItem', className])}
      css={css`
        font-size: 14px;
        color: ${style.textColor};
        margin-bottom: 10px;
      `}
    >
      {children}
    </div>
  );
};
