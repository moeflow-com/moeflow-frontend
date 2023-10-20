import { css, Global } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Header } from '../components';
import { Spin } from 'antd';
import brandJump from '../images/brand/mascot-jump1.png';
import { FC } from '../interfaces';
import { useTitle } from '../hooks';
import apis from '../apis';

/** 首页的属性接口 */
interface IndexProps {}
/**
 * 首页
 */
const Index: FC<IndexProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle({ suffix: formatMessage({ id: 'site.slogan' }) }); // 设置标题
  const [homepageHtml, setHomepageHtml] = useState<string>();
  const [homepageCss, setHomepageCss] = useState<string>();

  useEffect(() => {
    apis
      .getHomepage({})
      .then((res) => {
        setHomepageHtml(res.data.html);
        setHomepageCss(res.data.css);
      })
      .catch((err) => {
        setHomepageHtml('');
        setHomepageCss('');
      });
  }, []);

  return homepageHtml === undefined ? (
    <div
      css={css`
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `}
    >
      <Spin />
    </div>
  ) : homepageHtml === '' ? (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
        .Index__Title {
          flex: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            max-height: 300px;
          }
        }
        .Index__Footer {
          height: 50px;
          text-align: center;
          a {
            font-size: 16px;
          }
        }
      `}
    >
      <Global
        styles={css`
          #root {
            width: 100%;
            height: 100%;
          }
        `}
      />
      <Header></Header>
      <div className="Index__Title">
        <img src={brandJump} alt="Mascot" />
      </div>
      <div className="Index__Footer">{/* 备案号 */}</div>
    </div>
  ) : (
    <>
      <Global
        styles={css`
          ${homepageCss}
        `}
      />
      <div
        id="homepage"
        className="Index_Homepage"
        dangerouslySetInnerHTML={{ __html: homepageHtml }}
      />
    </>
  );
};
export default Index;
