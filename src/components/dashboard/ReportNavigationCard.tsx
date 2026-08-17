import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VectorIcon } from '../common/VectorIcon';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';

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
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: Colors) => StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
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
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: 12.5,
    color: colors.text.primary,
    fontWeight: fontWeights.semiBold,
    marginRight: 4,
  },
  skeletonTitle: {
    marginBottom: 6,
  },
});

export default ReportNavigationCard;
