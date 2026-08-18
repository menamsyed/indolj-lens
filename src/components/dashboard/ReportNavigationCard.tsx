import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { ScreenMetrics, moderateScale, scale, verticalScale } from '../../utils/responsive';

export interface ReportNavigationCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

export function ReportNavigationCard({
  title,
  subtitle = 'Tap to view report',
  onPress,
  isLoading = false,
}: ReportNavigationCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const metrics = useResponsive();
  const styles = useMemo(() => createStyles(colors, metrics), [colors, metrics]);

  if (isLoading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.contentLeft}>
          <SkeletonLoader width={140} height={18} borderRadius={4} style={styles.skeletonTitle} />
          <SkeletonLoader width={90} height={12} borderRadius={3} />
        </View>
        <SkeletonLoader width={65} height={32} borderRadius={16} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.contentLeft}>
        <Text style={[typography.h3, styles.titleText]}>{title}</Text>
        <Text style={[typography.caption, styles.subtitleText]}>{subtitle}</Text>
      </View>

      <View style={styles.viewButton}>
        <Text style={[typography.bodyMedium, styles.viewButtonText]}>View</Text>
        <VectorIcon name="arrow-right" size={13} color={colors.text.secondary} strokeWidth={2.2} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: Colors, metrics: ScreenMetrics) => StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: moderateScale(20, 0.5, metrics),
    paddingHorizontal: scale(20, metrics),
    paddingVertical: verticalScale(18, metrics),
    marginBottom: scale(12, metrics),
    minHeight: Math.max(44, verticalScale(52, metrics)),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  contentLeft: {
    flex: 1,
  },
  titleText: {
    fontSize: moderateScale(18, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: scale(4, metrics),
  },
  subtitleText: {
    fontSize: moderateScale(13, 0.3, metrics),
    color: colors.text.secondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: moderateScale(12, 0.5, metrics),
    paddingVertical: moderateScale(6, 0.5, metrics),
    borderRadius: moderateScale(20, 0.5, metrics),
  },
  viewButtonText: {
    fontSize: moderateScale(12.5, 0.3, metrics),
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
    marginRight: scale(4, metrics),
  },
  skeletonTitle: {
    marginBottom: scale(6, metrics),
  },
});

export default ReportNavigationCard;
