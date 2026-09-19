/**
 * @irich/react
 * React Context for the iRich editor instance.
 */

import { createContext, useContext } from 'react';
import type { IRichContextValue } from './types';

export const IRichContext = createContext<IRichContextValue | null>(null);

/**
 * Accesses the optional IRichContextValue without throwing if outside <IRichProvider />.
 */
export function useOptionalIRichContext(): IRichContextValue | null {
  return useContext(IRichContext);
}

/**
 * Accesses the raw IRichContextValue. Throws if invoked outside <IRichProvider />.
 */
export function useIRichContext(): IRichContextValue {
  const context = useContext(IRichContext);
  if (!context) {
    throw new Error(
      'iRich hooks must be used within an <IRichProvider /> component. Make sure your component tree is wrapped with <IRichProvider>.',
    );
  }
  return context;
}

