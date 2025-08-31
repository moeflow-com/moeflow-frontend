import { css } from '@emotion/core';
import { Button, Pagination, Result, Table, Tag } from 'antd';
import classNames from 'classnames';
import produce from 'immer';
import qs from 'qs';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Icon, ListSearchInput } from '@/components';
import apis from '@/apis';
import { APIInsightUser } from '@/apis/insight';
import { APIUser } from '@/apis/user';
import { usePagination } from '@/hooks';
import { FC, Team } from '@/interfaces';
import { AppState } from '@/store';
import style from '@/style';
import { toLowerCamelCase } from '@/utils';

const { Column } = Table;

/** 项目用户分析的属性接口 */
interface TeamInsightUserListProps {
  team: Team;
  className?: string;
}
/**
 * 项目用户分析
 */
export const TeamInsightUserList: FC<TeamInsightUserListProps> = ({
  team,
  className,
}) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const { formatMessage } = useIntl(); // i18n
  const [word, setWord] = useState<string>();
  const { url } = useRouteMatch();
  const history = useHistory();
  const location = useLocation();
  const queryString = qs.parse(location.search, { ignoreQueryPrefix: true });

  const defaultPage =
    queryString.page && parseInt(queryString.page as string) > 0
      ? parseInt(queryString.page as string)
      : 1;

  interface APIInsightUserWithPage extends APIInsightUser {
    projectsLoading?: boolean;
    projectsPage?: number;
  }
  const { items, setItems, page, setPage, total, limit, status, refresh } =
    usePagination<
      APIInsightUserWithPage,
      Parameters<typeof apis.getTeamInsightUsers>[0]
    >({
      api: apis.getTeamInsightUsers,
      apiParams: { teamID: team.id, params: { word: word } },
      defaultPage,
      defaultLimit: 10,
    });

  const handleLoadMoreClick = ({
    user,
    index,
  }: {
    user: APIUser;
    index: number;
  }): void => {
    const projectsPage = items[index].projectsPage;
    const page = projectsPage ? projectsPage : 1;
    setItems(
      produce((draft) => {
        draft[index].projectsLoading = true;
      }),
    );
    apis
      .getTeamInsightUserProjects({
        teamID: team.id,
        userID: user.id,
        params: { page, limit: 20 },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        setItems(
          produce((draft) => {
            draft[index].projectsLoading = false;
            draft[index].projectsPage = page + 1;
            if (page === 1) {
              draft[index].projects = data;
            } else {
              draft[index].projects.push(...data);
            }
          }),
        );
      });
  };

  return (
    <div
      className={classNames(['TeamInsightUserList', className])}
      css={css`
        width: 100%;
        .TeamInsightUserList__Name {
          word-break: break-all;
        }
        .TeamInsightUserList__Pagination {
          text-align: center;
          margin-top: 15px;
          margin-bottom: 25px;
        }
        .TeamInsightUserList__NoWorkingProjects {
          color: ${style.textColorSecondary};
        }
        .TeamInsightUserList__ProjectSetToProjectIcon {
          color: ${style.textColorSecondary};
        }
        .TeamInsightUserList__Project {
          margin: 3px 0;
        }
        .TeamInsightUserList__MoreProjectsTip {
          color: ${style.textColorSecondary};
        }
      `}
    >
      {status !== 'failure' && (
        <ListSearchInput
          size={isMobile ? 'middle' : 'small'}
          onSearch={(word) => {
            setPage(1);
            setWord(word);
          }}
          placeholder={formatMessage({ id: 'site.userName' })}
        />
      )}
      {status !== 'failure' && (
        <Table
          className="TeamInsightUserList__Table"
          loading={status === 'loading'}
          dataSource={items}
          rowKey={(record) => record.user.id}
          pagination={false}
        >
          <Column
            title={formatMessage({ id: 'site.userName' })}
            key="user"
            width="30%"
            render={(text, record: APIInsightUserWithPage, index) => {
              return (
                <div className="TeamInsightUserList__Name">
                  {record.user.name}
                </div>
              );
            }}
          />
          <Column
            title={formatMessage({ id: 'site.project' })}
            key="projects"
            render={(text, record: APIInsightUserWithPage, index) => {
              return (
                <div>
                  <div>
                    {record.projects.length === 0 && (
                      <span className="TeamInsightUserList__NoWorkingProjects">
                        {formatMessage({ id: 'insight.noWorkingProjects' })}
                      </span>
                    )}
                    {record.projects.map((project) => {
                      return (
                        <div
                          key={project.id}
                          className="TeamInsightUserList__Project"
                        >
                          <Link
                            className="TeamInsightUserList__Name"
                            to={`/dashboard/teams/${team.id}/project-sets/${project.projectSet.id}`}
                          >
                            {project.projectSet.default
                              ? formatMessage({ id: 'projectSet.default' })
                              : project.projectSet.name}
                          </Link>{' '}
                          <Icon
                            icon="angle-right"
                            className="TeamInsightUserList__ProjectSetToProjectIcon"
                          />{' '}
                          <Link
                            className="TeamInsightUserList__Name"
                            to={`/dashboard/teams/${team.id}/project-sets/${project.projectSet.id}/projects/${project.id}/setting/invitation`}
                          >
                            {project.name}
                          </Link>{' '}
                          <Tag>{project.role.name}</Tag>
                        </div>
                      );
                    })}
                  </div>
                  {record.count > record.projects.length && (
                    <div>
                      <span className="TeamInsightUserList__MoreProjectsTip">
                        {formatMessage(
                          { id: 'insight.moreProject' },
                          { count: record.count - record.projects.length },
                        )}
                      </span>
                      <Button
                        icon={
                          <Icon
                            icon="caret-down"
                            style={{ marginRight: '5px' }}
                          />
                        }
                        onClick={() => {
                          handleLoadMoreClick({ user: record.user, index });
                        }}
                        loading={record.projectsLoading}
                        type="link"
                        size="small"
                        className="TeamInsightUserList__LoadMoreProjects"
                      >
                        {formatMessage({ id: 'site.loadMore' })}
                      </Button>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </Table>
      )}
      {status === 'failure' && (
        <Result
          className="TeamInsightUserList__NetworkError"
          status="warning"
          title={formatMessage({ id: 'api.networkError' })}
          extra={
            <Button type="ghost" onClick={refresh}>
              {formatMessage({ id: 'site.refresh' })}
            </Button>
          }
        />
      )}
      {status !== 'failure' && (
        <Pagination
          className="TeamInsightUserList__Pagination"
          total={total}
          pageSize={limit}
          current={page}
          onChange={(page) => {
            setPage(page);
            history.replace({
              pathname: url,
              search: '?' + qs.stringify({ page: page.toString() }),
            });
          }}
          showSizeChanger={false}
        />
      )}
    </div>
  );
};
