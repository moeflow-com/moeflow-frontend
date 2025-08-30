import { css, Global } from '@emotion/core';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { api } from '@/apis';
import { useHotKey } from '@/components';
import { ImageViewer, ImageSourceViewer } from '@/components/project-file';
import { FC, Source } from '@/interfaces';
import { AppState } from '@/store';
import { setCurrentProjectSaga } from '@/store/project/slice';
import { fetchSourcesSaga, focusSource } from '@/store/source/slice';
import style from '../style';
import { toLowerCamelCase } from '@/utils';
import { getCancelToken } from '@/utils/api';
import { useTitle } from '@/hooks';
import { ImageTranslatorSettingMouse } from '@/components/project-file';
import { ImageTranslatorSettingHotKey } from '@/components/project-file';
import { GetFileReturn } from '@/apis/file';

/**
 * 全屏显示的图片翻译器
 */
const ImageTranslator: FC = () => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { fileID, targetID } = useParams<{
    fileID: string;
    targetID: string;
  }>();
  const sources = useSelector((state: AppState) => state.source.sources);
  const sourcesLoading = useSelector((state: AppState) => state.source.loading);
  const focusedSourceID = useSelector(
    (state: AppState) => state.source.focusedSource.id,
  );
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const osName = useSelector((state: AppState) => state.site.osName);
  const isIOS = osName === 'ios';
  const [file, setFile] = useState<GetFileReturn>();
  const sourceListWidth = 400;
  const sourceListHeightMobile = 200;
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );

  useTitle({ prefix: file?.name }, [file?.name]); // 设置标题

  useImageTranslatorHotkeys(file, sources, focusedSourceID);
  // 翻译器尺寸
  const [imageTranslatorSize, setImageTranslatorSize] = useState({
    width: 0,
    height: 0,
  });
  const windowSize = useWindowSize();

  useEffect(() => {
    setImageTranslatorSize({
      width: windowSize.width - (isMobile ? 0 : sourceListWidth),
      height: windowSize.height - (isMobile ? sourceListHeightMobile : 0),
    });
  }, [
    windowSize.width,
    windowSize.height,
    isMobile,
    sourceListWidth,
    sourceListHeightMobile,
  ]);

  // 获取图片信息
  useEffect(() => {
    dispatch(fetchSourcesSaga({ fileID, targetID }));
    setFile(undefined);
    const [cancelToken, cancel] = getCancelToken();
    api.file
      .getFile({
        fileID,
        params: {
          target: targetID,
        },
        configs: { cancelToken },
      })
      .then((result) => {
        const file = toLowerCamelCase(result.data);
        setFile(file);
        dispatch(setCurrentProjectSaga({ id: file.projectID }));
      })
      .catch((error) => {
        error.default();
      });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileID, targetID]);

  return (
    <div
      css={css`
        position: relative;
        width: 100%;
        height: 100%;
        .ImageTranslator__ImageViewer {
          z-index: 1;
          ${isMobile &&
        css`
            position: absolute;
            bottom: ${sourceListHeightMobile}px;
            left: 0;
          `};
        }
        .ImageTranslator__ImageSourceViewer {
          position: absolute;
          z-index: 10;
          box-shadow: ${style.boxShadowBase};
          overflow: hidden;
          ${isMobile
          ? css`
                bottom: 0;
                left: 0;
                height: ${sourceListHeightMobile}px;
                width: 100%;
                border-radius: ${style.borderRadiusBase}
                  ${style.borderRadiusBase} 0 0;
              `
          : css`
                top: 0;
                right: 0;
                height: 100%;
                width: ${sourceListWidth}px;
                border-radius: ${style.borderRadiusBase} 0 0
                  ${style.borderRadiusBase};
              `};
        }
      `}
    >
      <Global
        styles={css`
          html,
          body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: ${style.translatorColorBackground};
          }
          #root {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        `}
      />
      {file && (
        <ImageViewer
          className="ImageTranslator__ImageViewer"
          projectId={file.projectID}
          file={file}
          targetID={targetID}
          labels={sources}
          width={imageTranslatorSize.width}
          height={imageTranslatorSize.height}
          loading={!currentProject || sourcesLoading}
          onSettingButtonClick={() => {
            setSettingModalVisible(true);
          }}
        />
      )}
      <ImageSourceViewer
        className="ImageTranslator__ImageSourceViewer"
        file={file}
        sources={sources}
        targetID={targetID}
        loading={!currentProject || sourcesLoading}
      />
      <Modal
        width={700}
        title={formatMessage({ id: 'imageTranslator.settingTitle' })}
        onCancel={() => setSettingModalVisible(false)}
        open={settingModalVisible}
        footer={null}
      >
        {isMobile ? (
          formatMessage({ id: 'imageTranslator.mouseHotkeySettingUnavailable' })
        ) : (
          <>
            <ImageTranslatorSettingMouse />
            <ImageTranslatorSettingHotKey />
          </>
        )}
      </Modal>
    </div>
  );
};

function useImageTranslatorHotkeys(file: GetFileReturn | undefined, sources: Source[], focusedSourceID: string | null) {
  const dispatch = useDispatch();
  const focusNextSource = () => {
    if (sources.length === 0) {
      return;
    }
    let nextFocusedSourceIndex = 0;
    if (focusedSourceID) {
      const focusedSourceIndex = sources.findIndex(
        (source) => source.id === focusedSourceID,
      );
      if (focusedSourceIndex + 1 >= sources.length) {
        nextFocusedSourceIndex = 0;
      } else {
        nextFocusedSourceIndex = focusedSourceIndex + 1;
      }
    }
    const nextFocusedSourceID = sources[nextFocusedSourceIndex].id;
    dispatch(
      focusSource({
        id: nextFocusedSourceID,
        effects: ['focusInput', 'focusLabel', 'scrollIntoView'],
        noises: ['focusInput', 'focusLabel'],
      }),
    );
  };
  const focusPrevSource = () => {
    if (sources.length === 0) {
      return;
    }
    let prevFocusedSourceIndex = sources.length - 1;
    if (focusedSourceID) {
      const focusedSourceIndex = sources.findIndex(
        (source) => source.id === focusedSourceID,
      );
      if (focusedSourceIndex - 1 < 0) {
        prevFocusedSourceIndex = sources.length - 1;
      } else {
        prevFocusedSourceIndex = focusedSourceIndex - 1;
      }
    }
    const prevFocusedSourceID = sources[prevFocusedSourceIndex].id;
    dispatch(
      focusSource({
        id: prevFocusedSourceID,
        effects: ['focusInput', 'focusLabel', 'scrollIntoView'],
        noises: ['focusInput', 'focusLabel'],
      }),
    );
  };

  // 快捷键 - 下一个输入框
  const focusNextSourceHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.focusNextSource,
  );
  useHotKey(
    {
      disabled: !Boolean(focusNextSourceHotKeyOptions[0]),
      ...focusNextSourceHotKeyOptions[0],
    },
    focusNextSource,
    [focusedSourceID, sources.length],
  );
  useHotKey(
    {
      disabled: !Boolean(focusNextSourceHotKeyOptions[1]),
      ...focusNextSourceHotKeyOptions[1],
    },
    focusNextSource,
    [focusedSourceID, sources.length],
  );

  // 快捷键 - 上一个输入框
  const focusPrevSourceHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.focusPrevSource,
  );
  useHotKey(
    {
      disabled: !Boolean(focusPrevSourceHotKeyOptions[0]),
      ...focusPrevSourceHotKeyOptions[0],
    },
    focusPrevSource,
    [focusedSourceID, sources.length],
  );
  useHotKey(
    {
      disabled: !Boolean(focusPrevSourceHotKeyOptions[1]),
      ...focusPrevSourceHotKeyOptions[1],
    },
    focusPrevSource,
    [focusedSourceID, sources.length],
  );


  // 快捷键 - 当 ImageViewer 未加载完成是，忽略所有快捷键
  useHotKey(
    {
      disabled: Boolean(file?.id),
      ignoreKeyboardElement: false,
    },
    () => { },
    [file?.id],
  );
}

function useWindowSize() {

  // 页面尺寸
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    const setTimeoutHandleResize = () => {
      setTimeout(handleResize, 250);
    };
    if (isIOS) {
      window.addEventListener('focusin', setTimeoutHandleResize);
      window.addEventListener('focusout', setTimeoutHandleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (isIOS) {
        window.removeEventListener('focusin', setTimeoutHandleResize);
        window.removeEventListener('focusout', setTimeoutHandleResize);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return windowSize
}
export default ImageTranslator;
