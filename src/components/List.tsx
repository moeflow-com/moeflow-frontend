import { css } from '@emotion/core';
import { Pagination } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';
import { Canceler, CancelToken } from 'axios';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { useDebouncedCallback } from 'use-debounce';
import { ListSearchInput, ListSkeletonItem } from '.';
import { AppState } from '../store';
import { getCancelToken } from '../utils/api';
import { ListSearchInputProps } from './ListSearchInput';

/** 列表的属性接口 */
interface ListProps<T> {
  id?: string;
  onChange: ({
    page,
    pageSize,
    word,
    cancelToken,
  }: {
    page: number;
    pageSize: number;
    word: string;
    cancelToken: CancelToken;
  }) => Promise<any> | void;
  loading: boolean;
  onSearchRightButtonClick?: (e: React.MouseEvent) => void;
  total: number;
  items: T[];
  itemHeight: number;
  multiColumn?: boolean;
  columnWidth?: number;
  itemCreater: (item: T) => React.ReactNode | React.ReactElement;
  emptyTipCreater?: () => React.ReactNode | React.ReactElement | undefined;
  searchEmptyTipCreater?: (
    word: string
  ) => React.ReactNode | React.ReactElement | undefined;
  searchRightButton?: React.ReactNode | React.ReactElement;
  searchInputVisible?: boolean;
  searchInputProps?: ListSearchInputProps;
  searchInputHeight?: number;
  minPageSize?: number;
  maxPageSize?: number;
  autoPageSize?: boolean;
  defaultPageSize?: number;
  paginationProps?: PaginationProps;
  paginationHeight?: number;
  header?: React.ReactNode | React.ReactElement;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  defaultWord?: string;
  onWordChange?: (word: string) => void;
  defaultScrollTop?: number;
  onScrollTopChange?: (scrollTop: number) => void;
  className?: string;
}
/**
 * 列表
 * @param id 唯一的值用于其改变时触发 List 重新加载
 * @param onChange 当列表搜索词、页数、每页个数发生改变时触发，同时会提供一个 cancelToken
 * 在下次改变时，会自动 cancel 这个 cancelToken 的 axios 请求
 * @param onSearchRightButtonClick 当点击搜索框右侧的按钮
 * @param loading 加载中，显示骨架屏
 * @param total 元素总个数
 * @param items 当前页的元素
 * @param itemHeight 元素的高度
 * @param multiColumn 是否多列显示（默认false）
 * @param columnWidth 每列预计宽度（有空余会进行放大）
 * @param itemCreater 创建 item 组件的创建器，会收到这个 items 列表中的一个对象
 * @param emptyTipCreater 创建空提示组件的创建器
 * @param searchEmptyTipCreater 创建搜索空提示组件的创建器，会收到当前的搜索词
 * @param searchRightButton 搜索框右侧的按钮
 * @param searchInputVisible 显示搜索框
 * @param searchInputProps 搜索框的 Props
 * @param searchInputHeight 搜索框高度（默认45）
 * @param minPageSize 每页最小个数（默认1）
 * @param maxPageSize 每页最大个数（默认100）
 * @param autoPageSize 根据页面大小自动计算每页个数（默认true）
 * @param defaultPageSize 默认每页个数（默认10）
 * @param paginationProps 分页器的 Props
 * @param paginationHeight 分页器高度（默认55）
 * @param header 列表头部元素（在搜索框下面）
 * @param defaultPage 初次加载时的页数（用于还原翻页状态）
 * @param onPageChange 当用户改变页数（用于还原翻页状态）
 * @param defaultWord 初次加载时的搜索词（用于还原搜索状态）
 * @param onWordChange 当用户改变搜索词（用于还原搜索状态）
 * @param defaultScrollTop 初次加载时的滚动条位置（用于还原搜索状态）
 * @param onScrollTopChange 当用户改变滚动条位置（用于还原搜索状态）
 */
export function List<T>({
  id,
  onChange,
  onSearchRightButtonClick,
  loading,
  total,
  items,
  itemHeight,
  multiColumn = false,
  columnWidth = 100,
  itemCreater,
  emptyTipCreater,
  searchEmptyTipCreater,
  searchRightButton,
  searchInputVisible = true,
  searchInputProps,
  searchInputHeight = 45,
  minPageSize = 1,
  maxPageSize = 100,
  autoPageSize = true,
  defaultPageSize = 10,
  paginationProps,
  paginationHeight = 49,
  header,
  defaultPage = 1,
  onPageChange,
  defaultWord = '',
  onWordChange,
  defaultScrollTop = 0,
  onScrollTopChange,
  className,
}: ListProps<T>) {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const domRef = useRef<HTMLDivElement>(null); // 节点自身 Ref
  const cancelRef = useRef<Canceler>();
  const listHeightRef = useRef(0);
  const [column, setColumn] = useState(1);
  // 分页
  const [pageSize, setPageSize] = useState(defaultPageSize); // 每页元素个数
  const [page, setPage] = useState(defaultPage); // 当前页数
  const [word, setWord] = useState(defaultWord); // 搜索词
  const [tempWord, setTempWord] = useState(defaultWord); // 临时搜索词（经过防抖后才会设置到搜索词）
  const handleScrollRef = useRef(
    _.debounce(
      () => {
        if (typeof domRef.current?.scrollTop === 'number') {
          onScrollTopChange?.(domRef.current?.scrollTop);
        }
      },
      200,
      { maxWait: 500 }
    )
  );

  /** 第一次挂载/切换 ID */
  useEffect(() => {
    let firstPageSize = pageSize;
    const width = (domRef.current as HTMLElement).offsetWidth;
    // 根据高度计算每页显示的个数
    if (autoPageSize) {
      const height = (domRef.current as HTMLElement).offsetHeight;
      firstPageSize = calcPageSize(width, height);
    } else {
      // 仅计算每行摆放的宽度
      let newColumn = 1;
      if (multiColumn) {
        newColumn = Math.floor(width / columnWidth);
        if (newColumn < 1) newColumn = 1;
      }
      if (newColumn !== column) setColumn(newColumn);
    }
    // 获取元素
    setPage(defaultPage);
    setWord(defaultWord);
    setTempWord(defaultWord);
    const promise = handleChange({
      page: defaultPage,
      pageSize: firstPageSize,
      word: defaultWord,
    });
    // 等待列表加载完成后滚动到相应位置
    if (promise && typeof promise.then === 'function') {
      promise.then(() => {
        domRef.current?.scrollTo({ top: defaultScrollTop });
      });
    } else {
      domRef.current?.scrollTo({ top: defaultScrollTop });
    }
    return cancelRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** 统一处理变化 */
  const handleChange = ({
    page,
    pageSize,
    word,
  }: {
    page: number;
    pageSize: number;
    word: string;
  }) => {
    // 尝试取消上一个请求
    if (cancelRef.current) {
      cancelRef.current();
    }
    // 记录本次请求的 cancel
    const [cancelToken, cancel] = getCancelToken();
    cancelRef.current = cancel;
    return onChange({ page, pageSize, word, cancelToken });
  };

  /** 处理页数变化 */
  const handlePageChange = (page: number) => {
    setPage(page);
    onPageChange?.(page);
    handleChange({ page, pageSize, word });
  };

  /** 处理搜索词变化 */
  const handleWordChange = (word: string) => {
    setWord(word);
    onWordChange?.(word);
    setPage(1);
    onPageChange?.(1);
    handleChange({ page: 1, pageSize, word });
  };

  const debouncedHandleWordChange = useDebouncedCallback(handleWordChange, 500);

  /** 计算并设置每页个数 */
  const calcPageSize = (width: number, height: number) => {
    let newColumn = 1;
    if (multiColumn) {
      newColumn = Math.floor(width / columnWidth);
      if (newColumn < 1) newColumn = 1;
    }
    if (newColumn !== column) setColumn(newColumn);
    let otherHeight = paginationHeight; // 减去分页器高度
    if (searchInputVisible) {
      otherHeight += searchInputHeight; // 减去搜索框高度
    }
    let newPageSize =
      Math.floor((height - otherHeight) / itemHeight) * newColumn;
    // 最大每页个数
    if (newPageSize > maxPageSize) {
      newPageSize = maxPageSize;
    }
    // 最小每页个数
    if (newPageSize < minPageSize) {
      newPageSize = minPageSize;
    }
    // 不能小于 1
    if (newPageSize < 1) {
      newPageSize = 1;
    }
    if (newPageSize !== pageSize) setPageSize(newPageSize);
    return newPageSize;
  };

  /** 当区域尺寸变化时，动态计算每页显示的个数 */
  const handleResize = (width: number, height: number) => {
    // 手机版不改变每页个数（因为键盘上升屏幕尺寸肯定变化，造成混乱）
    // 之前页面键盘打开，跳转到此页后收缩，页面放大也记下
    if (isMobile && listHeightRef.current >= height) {
      return;
    }
    listHeightRef.current = height;
    calcPageSize(width, height);
  };

  return (
    <div
      className={classNames(['List', className, { mobile: isMobile }])}
      css={css`
        flex: auto;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow-x: hidden;
        overflow-y: auto;
        .List__Header {
          width: 100%;
        }
        .List__Items {
          flex: none;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          .List__ItemWrapper {
            width: 100%;
          }
        }
        .List__Pagination {
          margin-top: auto;
          padding: 10px 0 15px 0;
        }
        ${column !== 1 &&
        css`
          .List__Items {
            flex-wrap: wrap;
            flex-direction: row;
            justify-content: flex-start;
            align-items: stretch;
            align-content: flex-start;
            .List__ItemWrapper {
              width: ${100 / column}%;
            }
          }
          .List__SkeletonItem {
            width: ${100 / column}%;
          }
        `}
      `}
      ref={domRef}
      onScroll={() => {
        handleScrollRef.current();
      }}
    >
      <ReactResizeDetector
        handleWidth={autoPageSize}
        handleHeight={autoPageSize}
        skipOnMount
        onResize={handleResize}
        refreshMode="throttle"
        refreshRate={500}
        refreshOptions={{ leading: false, trailing: true }}
      >
        <>
          {searchInputVisible && (
            <ListSearchInput
              className="List__SearchInputWrapper"
              onSearch={handleWordChange}
              rightButton={searchRightButton}
              onRightButtonClick={onSearchRightButtonClick}
              value={tempWord}
              onChange={(e) => {
                setTempWord(e.target.value);
                debouncedHandleWordChange(e.target.value);
              }}
              {...searchInputProps}
            />
          )}
          {header && <div className="List__Header">{header}</div>}
          {loading ? (
            // 加载中
            <div className="List__Items">
              {[...Array(Math.min(3 * column, pageSize))].map((v, key) => {
                return (
                  <ListSkeletonItem className="List__SkeletonItem" key={key} />
                );
              })}
            </div>
          ) : items.length === 0 ? (
            // 加载完成，没有元素
            word ? (
              // 通过搜索没有元素
              searchEmptyTipCreater && searchEmptyTipCreater(word)
            ) : (
              // 没有元素
              emptyTipCreater && emptyTipCreater()
            )
          ) : (
            // 加载完成
            <div className="List__Items">
              {items.map((item) => {
                return (
                  <div className="List__ItemWrapper" key={(item as any).id}>
                    {itemCreater(item)}
                  </div>
                );
              })}
            </div>
          )}
          <Pagination
            className="List__Pagination"
            size="small"
            defaultCurrent={1}
            current={page}
            onChange={handlePageChange}
            defaultPageSize={pageSize}
            pageSize={pageSize}
            total={total}
            hideOnSinglePage
            simple
            {...paginationProps}
          />
        </>
      </ReactResizeDetector>
    </div>
  );
}
