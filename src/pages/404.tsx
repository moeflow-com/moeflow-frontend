import { useTitle } from '@/hooks';
import { useHistory } from 'react-router-dom';
import { FC, useEffect } from 'react';

export const NotFoundPage: FC = (props) => {
  const history = useHistory();
  useTitle({
    prefix: 'Page not found',
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      history.push('/');
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  return <div>Page not found. You will be redirected shortly</div>;
};
