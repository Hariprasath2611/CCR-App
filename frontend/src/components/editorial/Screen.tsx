import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp, RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialColors, EditorialSpacing } from '@theme/editorial';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeTop?: boolean;
  safeBottom?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeTop = true,
  safeBottom = true,
  refreshControl,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: EditorialColors.bg,
    paddingTop: safeTop ? Math.max(insets.top, EditorialSpacing.screenPaddingTop) : 0,
    paddingBottom: safeBottom ? insets.bottom : 0,
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
    backgroundColor: EditorialColors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: EditorialSpacing.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  fixedContent: {
    flex: 1,
    paddingHorizontal: EditorialSpacing.screenPaddingHorizontal,
  },
});
