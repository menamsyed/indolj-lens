import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { VectorIcon, IconName } from '../components/common/VectorIcon';
import { typography, fontWeights } from '../styles/typography';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../utils/responsive';

const TAB_ICON: Record<string, IconName> = {
  Branches: 'store',
  Dashboard: 'grid',
  Settings: 'settings',
  Home: 'grid',
  Search: 'store',
  Favorites: 'settings',
  Profile: 'user',
};

/**
 * Builds the SVG path with a smooth concave cutout notch centered at `cx`. `notchWidth`/
 * `notchDepth` are passed in (rather than closed over as module constants) because they're
 * now device-scaled values computed inside `CustomTabBar` via `useResponsive()`.
 */
function buildNotchPath(
  cx: number,
  width: number,
  height: number,
  notchWidth: number,
  notchDepth: number
): string {
  const halfNotch = notchWidth / 2;
  const x0 = Math.max(cx - halfNotch, 0);
  const x1 = Math.min(cx + halfNotch, width);

  const cp1X = x0 + notchWidth * 0.2;
  const cp1Y = 0;
  const cp2X = cx - notchWidth * 0.2;
  const cp2Y = notchDepth;

  const cp3X = cx + notchWidth * 0.2;
  const cp3Y = notchDepth;
  const cp4X = x1 - notchWidth * 0.2;
  const cp4Y = 0;

  return [
    `M 0 0`,
    `L ${x0} 0`,
    `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${cx} ${notchDepth}`,
    `C ${cp3X} ${cp3Y}, ${cp4X} ${cp4Y}, ${x1} 0`,
    `L ${width} 0`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `Z`,
  ].join(' ');
}

interface TabBarNotchBackgroundProps {
  bubblePosition: Animated.Value;
  activeIndex: number;
  tabWidth: number;
  barWidth: number;
  totalHeight: number;
  backgroundColor: string;
  notchWidth: number;
  notchDepth: number;
}

const TabBarNotchBackground = React.memo(function TabBarNotchBackgroundInner({
  bubblePosition,
  activeIndex,
  tabWidth,
  barWidth,
  totalHeight,
  backgroundColor,
  notchWidth,
  notchDepth,
}: TabBarNotchBackgroundProps): React.JSX.Element | null {
  const computePath = useCallback(
    (indexValue: number) => {
      const cx = indexValue * tabWidth + tabWidth / 2;
      return buildNotchPath(cx, barWidth, totalHeight, notchWidth, notchDepth);
    },
    [tabWidth, barWidth, totalHeight, notchWidth, notchDepth],
  );

  const [notchPath, setNotchPath] = useState<string>(() => computePath(activeIndex));

  useEffect(() => {
    if (tabWidth > 0) {
      setNotchPath(computePath(activeIndex));
    }
  }, [tabWidth, barWidth, activeIndex, computePath]);

  useEffect(() => {
    const listenerId = bubblePosition.addListener(({ value }) => {
      setNotchPath(computePath(value));
    });
    return () => bubblePosition.removeListener(listenerId);
  }, [bubblePosition, computePath]);

  if (barWidth <= 0) {
    return null;
  }

  return (
    <Svg width={barWidth} height={totalHeight} style={StyleSheet.absoluteFill}>
      <Path d={notchPath} fill={backgroundColor} />
    </Svg>
  );
});

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const metrics = useResponsive();
  const [barWidth, setBarWidth] = useState<number>(Dimensions.get('window').width);

  // Scaled once per render from the live metrics — feeds both the StyleSheet values
  // below AND the SVG notch-path math, so the two can never drift out of sync.
  // FAB_SIZE, NOTCH_WIDTH, and NOTCH_DEPTH all use `scale` (not verticalScale for the
  // depth) deliberately: the FAB circle's bottom edge must stay shallower than the notch's
  // curve by a fixed margin on every device, and that only holds if all three move
  // together on the same ratio — mixing width- and height-based scaling here previously
  // let the circle dip deeper than the curve on devices whose height ratio differs from
  // width ratio (e.g. iPhone SE), closing the gap between the bubble and the cutout.
  const BAR_HEIGHT = verticalScale(64, metrics);
  const FAB_SIZE = scale(52, metrics);
  const NOTCH_WIDTH = scale(84, metrics);
  const NOTCH_DEPTH = scale(25, metrics);

  const styles = useMemo(
    () => createStyles(metrics, BAR_HEIGHT, FAB_SIZE),
    [metrics, BAR_HEIGHT, FAB_SIZE],
  );

  // In dark mode, active tab icon is crisp white (#FFFFFF) inside the floating FAB bubble
  const containerBgColor = colors.brand.primary;
  const iconViewBgColor = isDarkMode ? colors.brand.primary : colors.surface.card;
  const activeIconColor = isDarkMode ? colors.text.white : colors.brand.primary;
  const activeLabelColor = colors.text.white;
  const inactiveContentColor = 'rgba(255, 255, 255, 0.65)';
  const totalHeight = BAR_HEIGHT + insets.bottom;

  const bubblePosition = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(bubblePosition, {
      toValue: state.index,
      useNativeDriver: false,
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [state.index, bubblePosition]);

  const tabCount = state.routes.length;
  const tabWidth = barWidth > 0 ? barWidth / tabCount : 0;

  const fabTranslateX = bubblePosition.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => i * tabWidth + (tabWidth - FAB_SIZE) / 2),
  });

  const onLayout = (e: LayoutChangeEvent): void => {
    if (e.nativeEvent.layout.width > 0) {
      setBarWidth(e.nativeEvent.layout.width);
    }
  };

  // Fully custom tab bar, so the stock `tabBarStyle: { display: 'none' }` handling
  // doesn't apply automatically — the focused screen (e.g. DashboardScreen while a
  // detail sub-view is open) sets this option via `navigation.setOptions`, and we have
  // to actually read and honor it ourselves. Checked after every hook above per the
  // Rules of Hooks (an early return can't come before any of them).
  const focusedOptions = descriptors[state.routes[state.index].key]?.options;
  const isTabBarHidden = (focusedOptions?.tabBarStyle as { display?: string } | undefined)?.display === 'none';

  if (isTabBarHidden) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.wrapper,
          { height: totalHeight, paddingBottom: insets.bottom, backgroundColor: 'transparent' },
        ]}
        onLayout={onLayout}
      >
        <TabBarNotchBackground
          bubblePosition={bubblePosition}
          activeIndex={state.index}
          tabWidth={tabWidth}
          barWidth={barWidth}
          totalHeight={totalHeight}
          backgroundColor={containerBgColor}
          notchWidth={NOTCH_WIDTH}
          notchDepth={NOTCH_DEPTH}
        />

        {/* Elevated Active Icon View (FAB) centered inside the notch cutout */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.fabBubble,
              {
                transform: [{ translateX: fabTranslateX }],
              },
            ]}
          >
            <View style={[styles.fabInner, { backgroundColor: iconViewBgColor, shadowColor: colors.neutral.black }]}>
              <VectorIcon
                name={TAB_ICON[state.routes[state.index].name] || 'grid'}
                size={24}
                color={activeIconColor}
              />
            </View>
          </Animated.View>
        )}

        {/* Tab Items Row */}
        <View style={styles.itemsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : route.name;
            const iconName = TAB_ICON[route.name] || 'grid';

            const onPress = (): void => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.item}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              >
                <View style={isFocused ? styles.iconHidden : styles.iconContainer}>
                  <VectorIcon
                    name={iconName}
                    size={22}
                    color={inactiveContentColor}
                  />
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    { color: isFocused ? activeLabelColor : inactiveContentColor },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const createStyles = (metrics: ScreenMetrics, barHeight: number, fabSize: number) =>
  StyleSheet.create({
    outerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: 'transparent',
    },
    wrapper: {
      height: barHeight,
      justifyContent: 'flex-end',
      position: 'relative',
      backgroundColor: 'transparent',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 8,
    },
    itemsRow: {
      flexDirection: 'row',
      height: barHeight,
      alignItems: 'center',
    },
    item: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      paddingTop: verticalScale(6, metrics),
    },
    iconContainer: {
      marginBottom: verticalScale(4, metrics),
    },
    iconHidden: {
      opacity: 0,
      marginBottom: verticalScale(4, metrics),
    },
    label: {
      fontSize: moderateScale(11, 0.3, metrics),
      fontWeight: fontWeights.semiBold,
    },
    fabBubble: {
      position: 'absolute',
      // Same scale() axis as fabSize/NOTCH_DEPTH above — see the comment where those are
      // computed for why this can't use verticalScale without reopening the gap it controls.
      top: -scale(38, metrics),
      width: fabSize,
      height: fabSize,
      borderRadius: fabSize / 2,
      zIndex: 20,
    },
    fabInner: {
      width: fabSize,
      height: fabSize,
      borderRadius: fabSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },
  });

export default CustomTabBar;
