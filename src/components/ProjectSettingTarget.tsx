import { css } from '@emotion/core';
import { Button, message, Modal } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import api, { resultTypes } from '../apis';
import {
  EmptyTip,
  Icon,
  LanguageSelect,
  List,
  ListItem,
  LIST_ITEM_DEFAULT_HEIGHT,
  Spin,
} from '../components';
import { FC, Target, Project } from '../interfaces';
import { AppState } from '../store';
import { increaseCurrentProjectTargetCount } from '../store/project/slice';
import style from '../style';
import { toLowerCamelCase } from '../utils';

/** 项目目标设置区域的属性接口 */
interface ProjectSettingTargetProps {
  className?: string;
}
/**
 * 项目目标设置区域
 */
export const ProjectSettingTarget: FC<ProjectSettingTargetProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // 元素总个数
  const [items, setItems] = useState<Target[]>([]); // 元素
  const dispatch = useDispatch();
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject
  ) as Project;
  const [spinningIDs, setSpinningIDs] = useState<string[]>([]); // 删除请求中

  const [createLanguageID, setCreateLanguageID] = useState<string>();
  const [creating, setCreating] = useState<boolean>(false); // 创建中

  // const disabledLanguageIDs = [
  //   currentProject.sourceLanguage.id,
  //   ...items.map((item) => item.language.id),
  // ];

  /** 获取元素 */
  const handleChange = ({
    page,
    pageSize,
    cancelToken,
  }: {
    page: number;
    pageSize: number;
    word: string;
    cancelToken: CancelToken;
  }) => {
    setLoading(true);
    api
      .getProjectTargets({
        projectID: currentProject.id,
        params: {
          page,
          limit: pageSize,
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
        setItems(result.data?.map((item: any) => toLowerCamelCase(item)));
      })
      .catch((error) => {
        // 如果是 cancel 的请求，则不取消 loading 状态，因为肯定有下一个请求
        if (error.type !== resultTypes.CANCEL_FAILURE) {
          setLoading(false);
        }
        error.default();
      });
  };

  /** 删除目标确认 */
  const showDeleteTargetConfirm = (target: Target) => {
    Modal.confirm({
      title: formatMessage({ id: 'project.deleteTargetTitle' }),
      content: formatMessage({ id: 'project.deleteTargetTip' }),
      onOk: () => {
        setSpinningIDs((ids) => [target.id, ...ids]);
        api
          .deleteTarget({ id: target.id })
          .then((result) => {
            dispatch(
              increaseCurrentProjectTargetCount({
                id: currentProject.id,
                step: -1,
              })
            );
            setSpinningIDs((ids) => ids.filter((id) => id !== target.id));
            setItems((items) => {
              return items.filter((item) => item.id !== target.id);
            });
            message.success(result.data.message);
          })
          .catch((error) => {
            setSpinningIDs((ids) => ids.filter((id) => id !== target.id));
            error.default();
          });
      },
      onCancel: () => {},
      okText: formatMessage({ id: 'form.ok' }),
      cancelText: formatMessage({ id: 'form.cancel' }),
    });
  };

  /** 创建新的目标 */
  const createTarget = () => {
    if (!createLanguageID) return;
    setCreating(true);
    api
      .createTarget({
        projectID: currentProject.id,
        data: { language: createLanguageID },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        dispatch(
          increaseCurrentProjectTargetCount({ id: currentProject.id, step: 1 })
        );
        setCreating(false);
        setCreateLanguageID(undefined);
        setItems((items) => [data.target, ...items]);
        message.success(data.message);
      })
      .catch((error) => {
        setCreating(false);
        error.default();
      });
  };

  return (
    <div
      className={classNames('ProjectSettingTarget', className)}
      css={css`
        width: 100%;
        flex: auto;
        display: flex;
        flex-direction: column;
        .ProjectTargetList__Header {
          height: 40px;
          line-height: 40px;
          text-align: center;
          border-bottom: 1px solid ${style.borderColorLight};
          .LanguageSelect {
            width: 180px;
            margin-right: 5px;
          }
        }
      `}
    >
      <div className="ProjectTargetList__Header">
        <LanguageSelect
          // TODO: disabledLanguageIDs 获取所有已有语言并隐藏或静止选择，现在只禁止当页的
          // disabledLanguageIDs={disabledLanguageIDs}
          value={createLanguageID}
          onChange={(id) => {
            setCreateLanguageID(id as string);
          }}
        />
        <Button
          loading={creating}
          type="primary"
          onClick={() => {
            createTarget();
          }}
        >
          {formatMessage({ id: 'site.add' })}
        </Button>
      </div>
      <List
        searchInputVisible={false}
        css={css`
          /* 使搜索框上边距和左右一致 */
          margin-top: 7.5px;
        `}
        onChange={handleChange}
        loading={loading}
        total={total}
        paginationProps={{
          disabled: spinningIDs.length > 0,
        }}
        items={items}
        itemHeight={LIST_ITEM_DEFAULT_HEIGHT}
        itemCreater={(item) => {
          return (
            <Spin spinning={spinningIDs.includes(item.id)}>
              <ListItem
                name={item.language.i18nName}
                rightButton={<Icon icon="times" />}
                onRightButtonClick={() => {
                  showDeleteTargetConfirm(item);
                }}
              />
            </Spin>
          );
        }}
        multiColumn={!isMobile}
        columnWidth={250}
        emptyTipCreater={() => {
          return <EmptyTip text={formatMessage({ id: 'target.emptyTip' })} />;
        }}
      />
    </div>
  );
};
