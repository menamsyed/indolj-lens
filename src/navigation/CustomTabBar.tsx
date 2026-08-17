import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { VectorIcon, IconName } from '../components/common/VectorIcon';
import { typography, fontWeights } from '../styles/typography';
import { useTheme } from '../context/ThemeContext';

const BAR_HEIGHT = 64;
const FAB_SIZE = 52;
const NOTCH_WIDTH = 84;
const NOTCH_DEPTH = 25;

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
 * Builds the SVG path with a smooth concave cutout notch centered at `cx`.
 */
function buildNotchPath(cx: number, width: number, height: number): string {
  const halfNotch = NOTCH_WIDTH / 2;
  const x0 = Math.max(cx - halfNotch, 0);
  const x1 = Math.min(cx + halfNotch, width);

  const cp1X = x0 + NOTCH_WIDTH * 0.2;
  const cp1Y = 0;
  const cp2X = cx - NOTCH_WIDTH * 0.2;
  const cp2Y = NOTCH_DEPTH;

  const cp3X = cx + NOTCH_WIDTH * 0.2;
  const cp3Y = NOTCH_DEPTH;
  const cp4X = x1 - NOTCH_WIDTH * 0.2;
  const cp4Y = 0;

  return [
    `M 0 0`,
    `L ${x0} 0`,
    `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${cx} ${NOTCH_DEPTH}`,
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
}

const TabBarNotchBackground = React.memo(function TabBarNotchBackgroundInner({
  bubblePosition,
  activeIndex,
  tabWidth,
  barWidth,
  totalHeight,
  backgroundColor,
}: TabBarNotchBackgroundProps): React.JSX.Element | null {
  const computePath = useCallback(
    (indexValue: number) => {
      const cx = indexValue * tabWidth + tabWidth / 2;
      return buildNotchPath(cx, barWidth, totalHeight);
    },
    [tabWidth, barWidth, totalHeight],
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

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const [barWidth, setBarWidth] = useState<number>(Dimensions.get('window').width);

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

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  wrapper: {
    height: BAR_HEIGHT,
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
    height: BAR_HEIGHT,
    alignItems: 'center',
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingTop: 6,
  },
  iconContainer: {
    marginBottom: 4,
  },
  iconHidden: {
    opacity: 0,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: fontWeights.semiBold,
  },
  fabBubble: {
    position: 'absolute',
    top: -34,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    zIndex: 20,
  },
  fabInner: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default CustomTabBar;
