import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message, Modal, Upload } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Form,
  FormItem,
  RoleRadioGroup,
  TypeRadioGroup,
  LanguageSelect,
} from '.';
import api from '../apis';
import { FC, UserProjectSet, UserTeam } from '../interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, resetProjectsState } from '../store/project/slice';
import { useHistory } from 'react-router-dom';
import { AppState } from '../store';
import { toLowerCamelCase } from '../utils';
import { GROUP_ALLOW_APPLY_TYPE } from '../constants';
import configs from '../configs';
import style from '../style';
import { resetFilesState } from '../store/file/slice';
import * as zip from '@zip.js/zip.js';
import { RcFile } from 'antd/lib/upload';
import { log } from 'console';
import file from '../apis/file';
import produce from 'immer';

/** 导入项目表单的属性接口 */
interface ProjectImportFormProps {
  teamID: string;
  projectSetID: string;
  className?: string;
}
/**
 * 导入项目表单
 */
export const ProjectImportForm: FC<ProjectImportFormProps> = ({
  teamID,
  projectSetID,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const history = useHistory();
  const [importing, setImporting] = useState(false);
  const [importStatuses, setImportStatuses] = useState<string[]>([]);
  const [importFileList, setImportFileList] = useState<RcFile[]>();
  const currentTeam = useSelector(
    (state: AppState) => state.team.currentTeam
  ) as UserTeam;
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet
  ) as UserProjectSet;

  const handleImport = async () => {
    setImporting(true);
    if (importFileList) {
      setImportStatuses(importFileList.map((file) => `${file.name} 排队中`));
      for (let i = 0; i < importFileList.length; i++) {
        const file = importFileList[i];
        setImportStatuses(
          produce((draft) => {
            draft[i] = `${file.name}：解压中...`;
          })
        );
        let project, labelplus;
        const zipReader = new zip.ZipReader(new zip.BlobReader(file));
        const entries = await zipReader.getEntries();
        for (const entry of entries) {
          const writer = new zip.BlobWriter();
          entry.getData?.(writer);
          if (entry.filename === 'project.json') {
            project = await writer.getData();
          }
          if (entry.filename === 'translations.txt') {
            labelplus = await writer.getData();
          }
        }
        zipReader.close();
        if (project && labelplus) {
          setImportStatuses(
            produce((draft) => {
              draft[i] = `${file.name}：创建项目...`;
            })
          );
          api
            .importProject({
              teamID: currentTeam.id,
              projectSetID: currentProjectSet.id,
              data: {
                project,
                labelplus,
              },
            })
            .then(async (result) => {
              // 上传图片
              const zipReader = new zip.ZipReader(new zip.BlobReader(file));
              const entries = await zipReader.getEntries();
              for (const entry of entries) {
                if (entry.filename.startsWith('images/')) {
                  const writer = new zip.BlobWriter();
                  entry.getData?.(writer);
                  const filename = entry.filename.replace('images/', '');
                  setImportStatuses(
                    produce((draft) => {
                      draft[i] = `${file.name}：上传 "${filename}" 中...`;
                    })
                  );
                  const image = await writer.getData();
                  await api
                    .uploadFile({
                      projectID: result.data.project.id,
                      filename,
                      file: image,
                    })
                    .catch((error) => {
                      message.error(`${file.name}：${filename} 上传失败`);
                    });
                }
              }
              zipReader.close();
              // 导入成功
              setImportStatuses(
                produce((draft) => {
                  draft[i] = `${file.name}：项目导入成功！`;
                })
              );
              dispatch(
                createProject({
                  project: toLowerCamelCase(result.data.project),
                  unshift: true,
                })
              );
              dispatch(resetFilesState());
              dispatch(resetProjectsState());
            })
            .catch((error) => {
              message.error(`${file.name} 导入失败`);
            });
        } else {
          setImportStatuses(
            produce((draft) => {
              draft[i] = `${file.name}：格式不正确`;
            })
          );
        }
      }
    }
  };

  return (
    <div
      className={className}
      css={css`
        width: 100%;
        .ProjectImportForm__Zip {
          margin-bottom: 24px;
        }
        .ProjectImportForm__ZipUpload {
          display: flex;
          align-items: center;
        }
      `}
    >
      {importing ? (
        <div>
          {importStatuses.map((status, i) => (
            <div key={i}>{status}</div>
          ))}
        </div>
      ) : (
        <>
          <div className="ProjectImportForm__Zip">
            <div className="ProjectImportForm__ZipUpload">
              <Upload
                accept=".zip"
                beforeUpload={() => {
                  return false;
                }}
                multiple
                disabled={importing}
                onChange={(file) => {
                  setImportFileList(
                    file.fileList.map((file) => file.originFileObj)
                  );
                }}
              >
                <Button>{formatMessage({ id: 'site.selectFile' })}</Button>
              </Upload>
            </div>
          </div>
          <Button
            type="primary"
            block
            loading={importing}
            onClick={handleImport}
          >
            {formatMessage({ id: 'project.startImport' })}
          </Button>
        </>
      )}
    </div>
  );
};
