import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PROJECT_PERMISSION } from '@/constants';
import { SOURCE_POSITION_TYPE } from '@/constants/source';
import { FC, labelSavingStatuses } from '@/interfaces';
import { AppState } from '@/store';
import { deleteSourceSaga, editSourceSaga } from '@/store/source/slice';
import { can } from '@/utils/user';
import { Label, LabelProps } from '@/components/shared/Label';
import {
  MovableInfoContext,
  MovableItem,
  OnLongPress,
  OnMoveEnd,
  OnTap,
} from '@/components/shared/Movable';

/**
 * 标签（使用 Context，进行自动缩放/激活）
 */
const LabelWithContext: FC<LabelProps> = (props) => {
  const movableInfo = useContext(MovableInfoContext);
  const propsToLabel = { ...props };
  propsToLabel.scale = 1 / movableInfo.area.scale;
  propsToLabel.focus = movableInfo.item.focus;
  propsToLabel.allowMove = movableInfo.item.allowMove;
  return <Label {...propsToLabel}></Label>;
};
LabelWithContext.whyDidYouRender = true;

export interface OnDelete {
  ({ id }: { id: string }): void;
}
export interface OnMove {
  ({
    id,
    x,
    y,
    reset,
  }: {
    id: string;
    x: number;
    y: number;
    reset: () => void;
  }): void;
}
/** 可移动标签的属性接口 */
interface MovableLabelProps {
  x: number;
  y: number;
}
/**
 * 可移动标签
 */
export const MovableLabel: FC<MovableLabelProps & LabelProps> = ({
  index,
  status = 'pending',
  id,
  x,
  y,
  positionType,
  content,
  styleTransition = '',
  children,
  ...movableItemProps
}) => {
  const dispatch = useDispatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const osName = useSelector((state: AppState) => state.site.osName);
  const isMobile = platform === 'mobile';
  const isIPad = platform === 'tablet' && osName === 'ios';
  const saving = labelSavingStatuses.includes(status);
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );

  const handleMoveEnd: OnMoveEnd = ({ x: newX, y: newY, reset }) => {
    // 发生了移动
    if (newX !== x || newY !== y) {
      dispatch(
        editSourceSaga({
          id,
          x: newX,
          y: newY,
          reset,
        }),
      );
    }
  };

  const handleTap: OnTap = ({ button }) => {
    // 右键单击
    if (button === 2 && !saving) {
      dispatch(deleteSourceSaga({ id }));
    }
    // 中建单击
    if (
      button === 1 &&
      !saving &&
      can(currentProject, PROJECT_PERMISSION.MOVE_LABEL)
    ) {
      dispatch(
        editSourceSaga({
          id,
          positionType:
            positionType === SOURCE_POSITION_TYPE.OUT
              ? SOURCE_POSITION_TYPE.IN
              : SOURCE_POSITION_TYPE.OUT,
        }),
      );
    }
  };

  const handleLongPress: OnLongPress = ({ button }) => {
    // 左键长按
    if (button === 0 && !saving) {
      dispatch(deleteSourceSaga({ id }));
    }
  };

  const label = useMemo(() => {
    return (
      <LabelWithContext
        id={id}
        index={index}
        status={status}
        positionType={positionType}
        content={content}
        styleTransition={styleTransition}
        direction="rtl"
        writingMode="vertical-rl"
        originDirection="ltr"
        originWritingMode="vertical-rl"
      >
        {children}
      </LabelWithContext>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleTransition, content, children, index, saving]);

  return (
    <MovableItem
      defaultPosition={{ x, y }}
      otherStyle={{ pointerEvents: 'none' }}
      limitWithSize={false}
      onMoveEnd={handleMoveEnd}
      onTap={handleTap}
      onLongPress={isMobile || isIPad ? handleLongPress : undefined}
      allowMove={!['creating', 'deleting'].includes(status)}
      {...movableItemProps}
    >
      {label}
    </MovableItem>
  );
};
MovableLabel.whyDidYouRender = true;
