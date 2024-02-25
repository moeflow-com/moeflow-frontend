import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * 实现同时使用State和Ref的自定义Hook
 * @typeparam S 初始值类型
 * @param initialValue 初始值
 */
export function useStateRef<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>, MutableRefObject<S>];
export function useStateRef<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
  MutableRefObject<S>,
];
export function useStateRef<S>(initialValue?: S) {
  const [state, setState] = useState(initialValue);
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return [state, setState, ref];
}
