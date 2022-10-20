/**
 * 建立 FontAwesome 图标库，供 index.tsx 和 test/setup.ts 直接引用
 * （以避免 test 中未引用图标报 Warning）
 */
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { faKissWinkHeart as faKissWinkHeartRegular } from '@fortawesome/free-regular-svg-icons';
library.add(
  fas, fab, far,
  faKissWinkHeartRegular
);
