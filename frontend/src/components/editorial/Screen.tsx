import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp, RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayRibbonColors, DayRibbonSpacing } from '@theme/dayRibbon';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeTop?: boolean;
  safeBottom?: boolean;
  hasTabBar?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeTop = true,
  safeBottom = true,
  hasTabBar = false,
  refreshControl,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
    paddingTop: safeTop ? Math.max(insets.top, DayRibbonSpacing.screenTop) : 0,
    paddingBottom: safeBottom ? (hasTabBar ? insets.bottom + 84 : insets.bottom + 16) : 0,
  };

  if (scrollable) {
    return (
      <View style={[styles.wrapper, containerStyle, style]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, containerStyle, style]}>
      <View style={[styles.fixedContent, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: DayRibbonColors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
    paddingBottom: 40,
  },
  fixedContent: {
    flex: 1,
    paddingHorizontal: DayRibbonSpacing.screenHorizontal,
  },
});

export default Screen;
