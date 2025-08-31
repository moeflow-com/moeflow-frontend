import { css } from '@emotion/core';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { FC } from '../../interfaces';
import classNames from 'classnames';
import ImgCrop from 'antd-img-crop';
import { Button, Upload } from 'antd';

import { UploadOutlined } from '@ant-design/icons';
import { runtimeConfig } from '../../configs';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../store';
import { setUserInfo } from '../../store/user/slice';
import { setCurrentTeamInfo } from '../../store/team/slice';
import { Avatar } from '..';
import { usePromised } from '@jokester/ts-commonutil/lib/react/hook/use-promised';
/** 头像上传的属性接口 */
interface AvatarUploadProps {
  type: 'user' | 'team';
  disabled?: boolean;
  className?: string;
}
/**
 * 头像上传
 */
export const AvatarUpload: FC<AvatarUploadProps> = ({
  type,
  disabled = false,
  className,
}) => {
  const runtimeConfigLoaded = usePromised(runtimeConfig);
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const [status, setStatus] = useState<
    'error' | 'success' | 'done' | 'uploading' | 'removed'
  >();
  const currentUser = useSelector((state: AppState) => state.user);
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);

  let id = '';
  if (type === 'team') {
    id = currentTeam!.id;
  }

  return (
    <div
      className={classNames(['AvatarUpload', className])}
      css={css`
        .AvatarUpload__Avatar {
          margin-right: 15px;
        }
      `}
    >
      {type === 'user' && (
        <Avatar
          className="AvatarUpload__Avatar"
          type="user"
          url={currentUser.avatar}
          size="large"
        />
      )}
      {type === 'team' && (
        <Avatar
          className="AvatarUpload__Avatar"
          type="team"
          url={currentTeam!.avatar}
          size="large"
        />
      )}
      {!disabled && runtimeConfigLoaded.fulfilled && (
        <ImgCrop rotate>
          <Upload
            name="file"
            action={`${runtimeConfigLoaded.value.baseURL}/v1/avatar`}
            method="PUT"
            showUploadList={false}
            data={{
              type,
              id,
            }}
            headers={{
              Authorization: `Bearer ${currentUser.token}`,
            }}
            onChange={(info) => {
              setStatus(info.file.status);
              if (info.file.status === 'done') {
                if (type === 'user') {
                  dispatch(
                    setUserInfo({
                      avatar: info.file.response.avatar,
                      hasAvatar: true,
                    }),
                  );
                } else if (type === 'team') {
                  dispatch(
                    setCurrentTeamInfo({
                      avatar: info.file.response.avatar,
                      hasAvatar: true,
                    }),
                  );
                }
              }
            }}
          >
            <Button icon={<UploadOutlined />} loading={status === 'uploading'}>
              {formatMessage({ id: 'avatar.upload' })}
            </Button>
          </Upload>
        </ImgCrop>
      )}
    </div>
  );
};
