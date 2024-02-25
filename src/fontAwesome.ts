/**
 * 建立 FontAwesome 图标库，供 index.tsx 和 test/setup.ts 直接引用
 * （以避免 test 中未引用图标报 Warning）
 */
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faSyncAlt,
  faBars,
  faSearchMinus,
  faSearchPlus,
  faArrowsAltH,
  faArrowsAltV,
  faImage,
  faCaretUp,
  faCaretDown,
  faChevronLeft,
  faCog,
  faAngleDoubleRight,
  faRobot,
  faTimes,
  faWifi,
  faHome,
  faBook,
  faAngleLeft,
  faEllipsisH,
  faPlus,
  faBan,
  faCaretLeft,
  faCaretRight,
  faCheck,
  faExclamationTriangle,
  faAngleRight,
  faUserCircle,
  faSignOutAlt,
  faBox,
  faLayerGroup,
  faCheckDouble,
  faCommentAlt,
  faCloudUploadAlt,
  faExclamationCircle,
  faLanguage,
  faCloud,
  faExchangeAlt,
  faPenNib,
  faPencilAlt,
  faStar,
  faSpinner,
  faTag,
  faDownload,
  faSync,
  faThLarge,
  faThList,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faUserCheck,
  faLink,
  faSave,
  faPaste,
} from '@fortawesome/free-solid-svg-icons';
import { faKissWinkHeart as faKissWinkHeartRegular } from '@fortawesome/free-regular-svg-icons';
library.add(
  ...[
    faSyncAlt,
    faBars,
    faSearchMinus,
    faSearchPlus,
    faArrowsAltH,
    faArrowsAltV,
    faImage,
    faCaretUp,
    faCaretDown,
    faChevronLeft,
    faCog,
    faAngleDoubleRight,
    faRobot,
    faTimes,
    faWifi,
    faHome,
    faBook,
    faAngleLeft,
    faEllipsisH,
    faPlus,
    faBan,
    faCaretLeft,
    faCaretRight,
    faCheck,
    faExclamationTriangle,
    faAngleRight,
    faUserCircle,
    faSignOutAlt,
    faBox,
    faLayerGroup,
    faCheckDouble,
    faCommentAlt,
    faCloudUploadAlt,
    faExclamationCircle,
    faLanguage,
    faCloud,
    faExchangeAlt,
    faPenNib,
    faPencilAlt,
    faStar,
    faSpinner,
    faTag,
    faDownload,
    faSync,
    faThLarge,
    faThList,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faUserCheck,
    faLink,
    faSave,
    faPaste,
  ],
  // Regular icons
  ...[faKissWinkHeartRegular],
);
