import { css } from '@emotion/core';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { api, resultTypes } from '../../apis';
import {
  EmptyTip,
  List,
  ListItem,
  LIST_ITEM_DEFAULT_HEIGHT,
  TranslationProgress,
} from '..';
import { FC, Project, Target } from '../../interfaces';
import { AppState } from '../../store';
import { toLowerCamelCase } from '../../utils';
import style from '../../style';

/** 项目目标列表页的属性接口 */
interface ProjectTargetListProps {
  project: Project;
  onClick?: (target: Target) => void;
  onLoad?: (targets: Target[]) => void;
  className?: string;
}
/**
 * 项目目标列表页
 */
export const ProjectTargetList: FC<ProjectTargetListProps> = ({
  project,
  onClick,
  onLoad,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [targetLangs, setTargetLangs] = useState<Target[]>([]); // 元素

  /** 获取元素 */
  const handleChange = ({
    page,
    pageSize,
    word,
    cancelToken,
  }: {
    page: number;
    pageSize: number;
    word: string;
    cancelToken: CancelToken;
  }) => {
    setLoading(true);
    api.target
      .getProjectTargets({
        projectID: project.id,
        params: {
          page,
          limit: 100000,
          word,
        },
        configs: {
          cancelToken,
        },
      })
      .then((result) => {
        // 设置数量
        setTotal(result.headers['x-pagination-count']);
        setLoading(false);
        // 转成大写
        const items = result.data.map((item: any) => toLowerCamelCase(item));
        setTargetLangs(items);
        onLoad && onLoad(items);
      })
      .catch((error) => {
        // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
        if (error.type !== resultTypes.CANCEL_FAILURE) {
          setLoading(false);
        }
        error.default();
      });
  };

  function handleClick(target: Target) {
    onClick && onClick(target);
  }

  return (
    <List
      id={project.id}
      className={classNames('ProjectTargetList', className)}
      onChange={handleChange}
      searchInputVisible={false}
      loading={loading}
      total={total}
      items={targetLangs}
      itemHeight={LIST_ITEM_DEFAULT_HEIGHT}
      itemCreater={(item) => {
        return (
          <ListItem
            className="ProjectTargetList__ListItem"
            name={item.language.i18nName}
            onClick={() => {
              handleClick(item);
            }}
            content={
              <TranslationProgress
                className="ProjectTargetList__TranslationProgress"
                css={css`
                  padding: 0 ${style.paddingBase}px;
                `}
                sourceCount={project.sourceCount}
                translatedSourceCount={item.translatedSourceCount}
                checkedSourceCount={item.checkedSourceCount}
              />
            }
          />
        );
      }}
      multiColumn={!isMobile}
      columnWidth={250}
      autoPageSize={false}
      defaultPageSize={100000}
      emptyTipCreater={() => (
        <EmptyTip text={formatMessage({ id: 'target.emptyTip' })} />
      )}
    />
  );
};
