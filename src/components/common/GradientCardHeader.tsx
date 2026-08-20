import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VectorIcon, IconName } from './VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale } from '../../utils/responsive';

export interface GradientCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
}

// Full-bleed solid header strip shared by the dashboard's card widgets (Sales Overview,
// Order Insights, Payment Breakdown, Party wise Sales, Sales Trend). Uses the theme's own
// `brand.primary` (same flat color the app's other header bars — MatrixReportView, DataTable —
// already use) rather than a gradient, and stays correct if the brand palette changes and
// matches light/dark mode automatically. The parent card must set `overflow: 'hidden'` so this
// rectangle clips to the card's rounded top corners (same technique as DataTable.tsx's sticky
// header).
export function GradientCardHeader({ title, subtitle, icon }: GradientCardHeaderProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {icon ? (
        <VectorIcon name={icon} size={moderateScale(20, 0.3, metrics)} color="rgba(255, 255, 255, 0.85)" strokeWidth={2} />
      ) : null}
    </View>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16, metrics),
      paddingVertical: scale(14, metrics),
      backgroundColor: colors.brand.primary,
    },
    textGroup: {
      flex: 1,
      marginRight: scale(10, metrics),
    },
    title: {
      fontSize: moderateScale(15, 0.3, metrics),
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
    },
    subtitle: {
      fontSize: moderateScale(11, 0.3, metrics),
      color: 'rgba(255, 255, 255, 0.75)',
      marginTop: scale(2, metrics),
    },
  });

export default GradientCardHeader;
