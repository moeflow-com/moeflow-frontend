import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTitle } from '../hooks';
import { FC, File } from '../interfaces';
import apis from '../apis';
import {
  FileNotExistReasons,
  FileSafeStatuses,
  FILE_NOT_EXIST_REASON,
  FILE_SAFE_STATUS,
} from '../constants';
import { toLowerCamelCase } from '../utils';
import classNames from 'classnames';
import { Button, Pagination, Radio, Spin } from 'antd';

/** 图片安全检查页面的属性接口 */
interface AdminImageSafeCheckProps {
  className?: string;
}
/**
 * 图片安全检查页面
 */
export const AdminImageSafeCheck: FC<AdminImageSafeCheckProps> = ({
  className,
}) => {
  useTitle(); // 设置标题
  const [files, setFiles] = useState<File[]>();
  const pageSize = 40;
  const [safeFileIDs, setSafeFileIDs] = useState<string[]>([]);
  const [unsafeFileIDs, setUnsafeFileIDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pendingStatus: FileSafeStatuses[] = [
    FILE_SAFE_STATUS.NEED_HUMAN_CHECK,
    FILE_SAFE_STATUS.QUEUING,
    FILE_SAFE_STATUS.WAIT_RESULT,
    FILE_SAFE_STATUS.NEED_MACHINE_CHECK,
  ];
  const [safeStatus, setSafeStatus] =
    useState<FileSafeStatuses[]>(pendingStatus);

  const toggle = (id: string) => {
    if (safeFileIDs.includes(id)) {
      setSafeFileIDs((ids) => ids.filter((i) => i !== id));
      setUnsafeFileIDs((ids) => [...ids, id]);
    } else {
      setUnsafeFileIDs((ids) => ids.filter((i) => i !== id));
      setSafeFileIDs((ids) => [...ids, id]);
    }
  };

  const getFileNotExistReasonText = (id: FileNotExistReasons): string => {
    if (id === FILE_NOT_EXIST_REASON.BLOCK) return '屏蔽';
    if (id === FILE_NOT_EXIST_REASON.NOT_UPLOAD) return '待上传';
    if (id === FILE_NOT_EXIST_REASON.FINISH) return '完结';
    return '未知';
  };

  const safeCheck = () => {
    setSubmitting(true);
    apis
      .adminSafeCheck({
        safeFileIDs,
        unsafeFileIDs,
      })
      .then(() => {
        fetchAdminFiles({ page: 1, safeStatus });
        setSubmitting(false);
      });
  };

  const fetchAdminFiles = ({
    page,
    safeStatus,
  }: {
    page: number;
    safeStatus: FileSafeStatuses[];
  }) => {
    setLoading(true);
    apis
      .adminGetFiles({
        params: { safeStatus, page, limit: pageSize },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        setPage(page);
        setFiles(data);
        setSafeFileIDs(data.map((d) => d.id));
        setUnsafeFileIDs([]);
        setTotal(result.headers['x-pagination-count']);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdminFiles({ page: 1, safeStatus });
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={classNames('AdminImageSafeCheck', className)}
      css={css`
        .AdminImageSafeCheck__Top {
          padding: 10px 10px 0;
          display: flex;
        }
        .AdminImageSafeCheck__TopButton {
          margin-right: 10px;
        }
        .AdminImageSafeCheck__Images {
          display: flex;
          flex-wrap: wrap;
        }
        .AdminImageSafeCheck__Image {
          margin: 10px;
          border: 2px solid #c0c0c0;
          background: repeating-linear-gradient(
            45deg,
            rgb(238, 238, 238),
            rgb(238, 238, 238) 15px,
            rgb(248, 248, 248) 0px,
            rgb(248, 248, 248) 30px
          );
          img {
            width: 400px;
            height: 500px;
            object-fit: contain;
          }
        }
        .AdminImageSafeCheck__Image--safe {
          border-color: #03c903;
        }
        .AdminImageSafeCheck__Image--unsafe {
          border-color: red;
        }
        .AdminImageSafeCheck__Bottom {
          padding-bottom: 100px;
          display: flex;
        }
        .AdminImageSafeCheck__SubmitButton {
          flex: auto;
        }
      `}
    >
      <div className="AdminImageSafeCheck__Top">
        <Radio.Group
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Safe', value: 'safe' },
            { label: 'Unsafe', value: 'unsafe' },
          ]}
          defaultValue="pending"
          onChange={(e) => {
            let safeStatus = pendingStatus;
            switch (e.target.value) {
              case 'safe':
                safeStatus = [FILE_SAFE_STATUS.SAFE];
                setSafeStatus(safeStatus);
                fetchAdminFiles({ page: 1, safeStatus });
                break;
              case 'unsafe':
                safeStatus = [FILE_SAFE_STATUS.BLOCK];
                setSafeStatus(safeStatus);
                fetchAdminFiles({ page: 1, safeStatus });
                break;
              default:
                setSafeStatus(pendingStatus);
                fetchAdminFiles({ page: 1, safeStatus });
                break;
            }
          }}
        />
      </div>
      <div className="AdminImageSafeCheck__Images">
        {loading ? (
          <Spin />
        ) : (
          files?.map((file) => (
            <div
              key={file.id}
              className={classNames('AdminImageSafeCheck__Image', {
                'AdminImageSafeCheck__Image--safe':
                  file.safeStatus === FILE_SAFE_STATUS.SAFE,
                'AdminImageSafeCheck__Image--unsafe':
                  unsafeFileIDs.includes(file.id) ||
                  file.safeStatus === FILE_SAFE_STATUS.BLOCK,
              })}
              onClick={() => {
                toggle(file.id);
              }}
            >
              {file.saveName ? (
                <img src={file.safeCheckUrl} alt={file.name} />
              ) : (
                <div>
                  文件不存在（
                  {getFileNotExistReasonText(file.fileNotExistReason)}）
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="AdminImageSafeCheck__Bottom">
        <Pagination
          className="AdminImageSafeCheck__Pagination"
          defaultCurrent={1}
          current={page}
          onChange={(page) => {
            fetchAdminFiles({ page, safeStatus });
          }}
          defaultPageSize={pageSize}
          showSizeChanger={false}
          total={total}
        />
        {safeStatus.includes(FILE_SAFE_STATUS.BLOCK) || (
          <Button
            type="primary"
            className="AdminImageSafeCheck__SubmitButton"
            onClick={safeCheck}
            loading={submitting}
          >
            提交
          </Button>
        )}
      </div>
    </div>
  );
};
