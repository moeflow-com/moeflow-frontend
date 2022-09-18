import Bowser from 'bowser';
import { OSName } from '../../interfaces';

const browser = Bowser.getParser(window.navigator.userAgent);
export const osName = browser.getOSName(true) as OSName;

export { HotKeyRecorder } from './components/HotKeyRecorder';
export { useHotKey } from './hooks/useHotKey';
