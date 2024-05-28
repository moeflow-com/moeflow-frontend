import { Cookies } from 'react-cookie';
import jwtDecode from 'jwt-decode';

const cookies = new Cookies();

/**
 * 将 Cookie 中取出的字符串转为布尔值
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toBoolean = (value: string | undefined) => {
  return value?.toLowerCase() === 'true';
};

/**
 * 从 Cookie 中获取 token
 */
const getToken = (): string | undefined => {
  return cookies.get('token');
};

/**
 * 向 Cookie 设置 token
 * @param token 用户令牌
 */
const setToken = (token: string, rememberMe?: boolean) => {
  const { exp } = jwtDecode(token, { header: true }) as { exp: number }; // token 过期时间（时间戳）
  const maxAge = exp - Math.floor(new Date().getTime() / 1000); // Cookie 过期时间（x秒后）
  if (rememberMe) {
    cookies.set('token', token, { path: '/', maxAge });
  } else {
    cookies.set('token', token, { path: '/' });
  }
};

/**
 * 从 Cookie 中删除 token
 */
const removeToken = () => {
  cookies.remove('token', { path: '/' });
};

export { getToken, setToken, removeToken };
