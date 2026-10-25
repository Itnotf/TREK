import { nativeServerHost } from '../../native/platform';
import { TrekShell } from '../../native/trekShell';

/**
 * The server section both settings views show inside the iOS and Android app:
 * the host the app is connected to (null in a browser, where the section stays
 * hidden) and the way back to the address screen.
 */
export function useNativeServer(): { host: string | null; changeServer: () => void } {
  return {
    host: nativeServerHost(),
    changeServer: () => {
      void TrekShell.resetServer();
    },
  };
}
