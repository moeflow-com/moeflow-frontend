import { css, Global } from "@emotion/core";
import React from "react";
import { useIntl } from "react-intl";
import { Header } from "../components";
import brandJump from "../images/brand/mascot-jump1.png";
import { FC } from "../interfaces";
import configs from '../configs';
import { useTitle } from "../hooks";

/** 首页的属性接口 */
interface IndexProps {}
/**
 * 首页
 */
const Index: FC<IndexProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle({ suffix: configs.siteSlogan || formatMessage({ id: "site.slogan" }) }); // 设置标题

  return (
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
      {configs.miitBeiAn ? (
        <div className="Index__Footer">
          <a href="https://beian.miit.gov.cn/" target="_blank">{configs.miitBeiAn}</a>
        </div>
      ) : (
        <div className="Index__Footer">
          {/* 无备案号 */}
        </div>
      )}
    </div>
  );
};
export default Index;
