import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

export interface HourlySalesChartProps {
  onViewDetailsPress?: () => void;
  isLoading?: boolean;
}

export function HourlySalesChart({
  onViewDetailsPress,
  isLoading = false,
}: HourlySalesChartProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderTopLabel = useCallback(
    (text: string) => () => (
      <Text style={[typography.caption, styles.barTopValue]}>{text}</Text>
    ),
    [styles]
  );

  const barData = [
    {
      value: 7800,
      label: '9:AM',
      frontColor: colors.brand.primary,
      topLabelComponent: renderTopLabel('7.8K'),
    },
    {
      value: 34845,
      label: '12:PM',
      frontColor: colors.brand.primary,
      topLabelComponent: renderTopLabel('34.8K'),
    },
    {
      value: 5200,
      label: '3:PM',
      frontColor: colors.brand.primary,
      topLabelComponent: renderTopLabel('5.2K'),
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.chartCard}>
        <View style={styles.headerRow}>
          <SkeletonLoader width={140} height={18} borderRadius={4} />
          <SkeletonLoader width={80} height={14} borderRadius={4} />
        </View>
        <View style={styles.chartSkeletonBody}>
          <View style={styles.barsRow}>
            {[1, 2, 3, 4, 5].map((key) => (
              <SkeletonLoader key={key} width={28} height={80 + (key % 3) * 25} borderRadius={6} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      {/* Header Row with View Details Action */}
      <View style={styles.headerRow}>
        <Text style={[typography.h3, styles.chartHeaderTitle]}>Sale Summary</Text>
        {onViewDetailsPress && (
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={onViewDetailsPress}
            activeOpacity={0.7}
          >
            <Text style={[typography.caption, styles.viewDetailsText]}>View Details</Text>
            <VectorIcon name="arrow-right" size={12} color={colors.brand.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chartBody}>
        <BarChart
          data={barData}
          barWidth={28}
          initialSpacing={30}
          spacing={40}
          barBorderRadius={6}
          showGradient={false}
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.xAxisText}
          yAxisColor={colors.neutral.gray300}
          xAxisColor={colors.neutral.gray700}
          rulesColor={colors.neutral.gray100}
          noOfSections={4}
          maxValue={40000}
          isAnimated
          animationDuration={800}
          height={140}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  chartCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartHeaderTitle: {
    fontSize: 14,
    color: colors.text.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: fontWeights.bold,
  },
  chartBody: {
    alignItems: 'center',
    paddingTop: 8,
  },
  yAxisText: {
    fontSize: 9.5,
    color: colors.text.muted,
  },
  xAxisText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: fontWeights.semiBold,
  },
  barTopValue: {
    fontSize: 9.5,
    color: colors.brand.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 2,
  },
  chartSkeletonBody: {
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 16,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
  },
});

export default HourlySalesChart;
