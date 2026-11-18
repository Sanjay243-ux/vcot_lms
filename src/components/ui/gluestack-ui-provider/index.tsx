import React from 'react';
import { View, type ViewProps } from 'react-native';

import { gluestackLightVars } from './config';

export interface GluestackUIProviderProps extends ViewProps {
  mode?: 'light';
  children: React.ReactNode;
}

export function GluestackUIProvider({
  children,
  style,
  ...props
}: GluestackUIProviderProps) {
  return (
    <View
      style={[gluestackLightVars, { flex: 1, backgroundColor: '#FFFFFF' }, style]}
      {...props}>
      {children}
    </View>
  );
}
