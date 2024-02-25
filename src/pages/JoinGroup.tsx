import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FC, UserTeam } from '../interfaces';
import classNames from 'classnames';
import { GroupTypes } from '../apis/type';
import apis, { FailureResults } from '../apis';
import { useHistory, useParams } from 'react-router-dom';
import { APIGroupPublicInfo } from '../apis/group';
import { toLowerCamelCase } from '../utils';
import { ID_REGEX } from '../utils/regex';
import { Spin } from '../components';
import { EmptyTip } from '../components';
import { createTeam } from '../store/team/slice';
import { Button, Input, message } from 'antd';
import { useDispatch } from 'react-redux';
import { APPLICATION_CHECK_TYPE } from '../constants';
import { resetFilesState } from '../store/file/slice';

/** 加入团体界面的属性接口 */
interface JoinGroupProps {
  className?: string;
}
/**
 * 加入团体界面
 */
const JoinGroup: FC<JoinGroupProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const { groupType, groupID } = useParams<{
    groupType: string;
    groupID: string;
  }>();
  const history = useHistory(); // 路由
  const dispatch = useDispatch();
  const [group, setGroup] = useState<APIGroupPublicInfo>();
  const [applying, setApplying] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<
    | 'loading'
    | 'joined'
    | 'joinLinkError'
    | 'groupNotExistError'
    | 'groupNotAllowJoinError'
    | 'ok'
  >('loading');

  useEffect(() => {
    if (
      (groupType === 'team' || groupType === 'project') &&
      ID_REGEX.test(groupID)
    ) {
      apis
        .getGroupPublicInfo({ groupType, groupID })
        .then((result) => {
          const data = toLowerCamelCase(result.data);
          setGroup(data);
          if (data.joined) {
            setStatus('joined');
          } else {
            setStatus('ok');
          }
        })
        .catch((result: FailureResults) => {
          // 团体不存在
          if (result.type === 'BASIC_FAILURE') {
            if (result.data.code === 3001 || result.data.code === 4001) {
              setStatus('groupNotExistError');
            } else if (result.data.code === 5014) {
              setStatus('groupNotAllowJoinError');
            } else {
              result.default();
            }
          } else {
            result.default();
          }
        });
    } else {
      setStatus('joinLinkError');
    }
  }, [groupType, groupID]);

  /** 处理提交申请 */
  const handleApply = () => {
    setApplying(true);
    apis
      .createApplication({
        groupType: groupType as GroupTypes,
        groupID,
        data: {
          message: reason,
        },
      })
      .then((result) => {
        setApplying(false);
        const data = toLowerCamelCase(result.data);
        // 弹出提示
        message.success(data.message);
        if (groupType === 'team') {
          // 无需审核或之前有邀请，则跳转到所在团队
          if (data.group && data.group.role) {
            // 加入成功
            dispatch(
              createTeam({ team: data.group as UserTeam, unshift: true }),
            );
            // 跳转到团队
            history.replace(`/dashboard/teams/${data.group.id}`);
          }
        } else if (groupType === 'project') {
          dispatch(resetFilesState());
          // 跳转到我的项目
          history.replace('/dashboard/projects');
        }
      })
      .catch((error) => {
        setApplying(false);
        error.default();
      });
  };

  return (
    <div
      className={classNames(['JoinGroup', className])}
      css={css`
        flex: auto;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .JoinGroup__Tip {
          margin-bottom: 14px;
        }
        .JoinGroup__TextArea {
          margin-bottom: 14px;
        }
      `}
    >
      {status === 'loading' && <Spin spinning />}
      {status === 'joinLinkError' && (
        <EmptyTip
          text={formatMessage({ id: 'error.joinLink' })}
          buttons={
            <Button
              onClick={() => {
                history.push('/dashboard/projects');
              }}
            >
              {formatMessage({ id: 'router.goDashboard' })}
            </Button>
          }
        />
      )}
      {status === 'groupNotAllowJoinError' && (
        <EmptyTip
          text={formatMessage({ id: groupType + '.notAllowAllUserJoin' })}
          buttons={
            <Button
              onClick={() => {
                history.push('/dashboard/projects');
              }}
            >
              {formatMessage({ id: 'router.goDashboard' })}
            </Button>
          }
        />
      )}
      {status === 'groupNotExistError' && (
        <EmptyTip
          text={formatMessage({ id: groupType + '.notExist' })}
          buttons={
            <Button
              onClick={() => {
                history.push('/dashboard/projects');
              }}
            >
              {formatMessage({ id: 'router.goDashboard' })}
            </Button>
          }
        />
      )}
      {status === 'joined' && (
        <EmptyTip
          text={formatMessage(
            { id: 'group.joined' },
            { groupName: group?.name },
          )}
          buttons={
            <Button
              onClick={() => {
                history.push('/dashboard/projects');
              }}
            >
              {formatMessage({ id: 'router.goDashboard' })}
            </Button>
          }
        />
      )}
      {status === 'ok' && (
        <div>
          {group?.applicationCheckType ===
          APPLICATION_CHECK_TYPE.ADMIN_CHECK ? (
            <>
              <div className="JoinGroup__Tip">
                {formatMessage(
                  { id: 'group.joinTip' },
                  { groupName: group?.name },
                )}
              </div>
              <Input
                className="JoinGroup__TextArea"
                onChange={(e) => {
                  setReason(e.target.value);
                }}
                maxLength={140}
              />
            </>
          ) : (
            <div className="JoinGroup__Tip">
              {formatMessage(
                { id: 'group.joinTipNoNeedCheck' },
                { groupName: group?.name },
              )}
            </div>
          )}
          <Button onClick={handleApply} block type="primary" loading={applying}>
            {group?.applicationCheckType === APPLICATION_CHECK_TYPE.ADMIN_CHECK
              ? formatMessage({ id: 'site.apply' })
              : formatMessage({ id: 'site.join' })}
          </Button>
        </div>
      )}
    </div>
  );
};
export default JoinGroup;
