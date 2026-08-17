import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { VectorIcon } from '../common/VectorIcon';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../styles/colors';
import { typography, fontWeights } from '../../styles/typography';
import { BranchOption, DateRangePreset } from '../../types/dashboard';
import { DATE_RANGE_PRESETS, formatDisplayDate } from '../../utils/dateRange';
import { CustomDateRange } from '../../hooks/useDateBranchFilter';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SHEET_ANIMATION_MS = 280;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface FilterBottomSheetProps {
  visible: boolean;
  selectedDateRange: DateRangePreset;
  selectedBranch: BranchOption;
  branches: BranchOption[];
  onApply: (range: DateRangePreset, branch: BranchOption, customLabel?: string, customRange?: CustomDateRange) => void;
  onClose: () => void;
}

export function FilterBottomSheet({
  visible,
  selectedDateRange,
  selectedBranch,
  branches,
  onApply,
  onClose,
}: FilterBottomSheetProps): React.JSX.Element {
  const { colors, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const [isModalMounted, setIsModalMounted] = useState<boolean>(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [pendingDateRange, setPendingDateRange] = useState<DateRangePreset>(selectedDateRange);
  const [pendingBranch, setPendingBranch] = useState<BranchOption>(selectedBranch);
  const [prevPreset, setPrevPreset] = useState<DateRangePreset>(selectedDateRange);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isBranchListOpen, setIsBranchListOpen] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFromPicker, setShowFromPicker] = useState<boolean>(false);
  const [showToPicker, setShowToPicker] = useState<boolean>(false);

  // In dark mode, icons and text headers inside sheet render in bright white/light colors for crisp contrast
  const primaryIconColor = isDarkMode ? colors.text.white : colors.brand.primary;

  useEffect(() => {
    if (visible) {
      setIsModalMounted(true);
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: SHEET_ANIMATION_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: SHEET_ANIMATION_MS,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: SHEET_ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: SHEET_ANIMATION_MS,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setIsModalMounted(false);
      });
    }
  }, [visible, translateY, backdropOpacity]);

  useEffect(() => {
    if (visible) {
      setPendingDateRange(selectedDateRange);
      setPrevPreset(selectedDateRange);
      setPendingBranch(selectedBranch);
      setIsCustomMode(false);
      setIsBranchListOpen(false);
    }
  }, [visible, selectedDateRange, selectedBranch]);

  const handleFromChange = (_event: DateTimePickerEvent, date?: Date): void => {
    setShowFromPicker(false);
    if (date) setFromDate(date);
  };

  const handleToChange = (_event: DateTimePickerEvent, date?: Date): void => {
    setShowToPicker(false);
    if (date) setToDate(date);
  };

  const handleSelectPreset = (option: DateRangePreset): void => {
    if (option === 'Custom') {
      setPrevPreset(pendingDateRange === 'Custom' ? prevPreset : pendingDateRange);
      setIsCustomMode(true);
    }
    setPendingDateRange(option);
  };

  const handleBackToPresets = (): void => {
    setPendingDateRange(prevPreset);
    setIsCustomMode(false);
  };

  const toggleBranchList = (): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsBranchListOpen((open) => !open);
  };

  const handleSelectBranch = (branch: BranchOption): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPendingBranch(branch);
    setIsBranchListOpen(false);
  };

  const handleApply = (): void => {
    if (pendingDateRange === 'Custom') {
      const label = `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`;
      onApply(pendingDateRange, pendingBranch, label, { from: fromDate, to: toDate });
    } else {
      onApply(pendingDateRange, pendingBranch);
    }
    onClose();
  };

  return (
    <Modal visible={isModalMounted} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheetCard, { transform: [{ translateY }] }]}>
              {/* Header Row: Title & Close Button */}
              <View style={styles.headerRow}>
                <Text style={[typography.h2, styles.title]}>Filters</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <VectorIcon name="x" size={20} color={colors.text.secondary} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                {/* Date Range Section */}
                <Text style={[typography.caption, styles.sectionLabel]}>DATE RANGE</Text>

                {isCustomMode ? (
                  <View style={styles.customContainer}>
                    <Text style={[typography.caption, styles.dateFieldLabel]}>FROM DATE</Text>
                    <TouchableOpacity
                      style={styles.datePickerInput}
                      onPress={() => setShowFromPicker(true)}
                      activeOpacity={0.8}
                    >
                      <VectorIcon name="calendar" size={18} color={primaryIconColor} />
                      <Text style={[typography.bodyMedium, styles.datePickerValue]}>
                        {formatDisplayDate(fromDate)}
                      </Text>
                    </TouchableOpacity>

                    <Text style={[typography.caption, styles.dateFieldLabel]}>TO DATE</Text>
                    <TouchableOpacity
                      style={styles.datePickerInput}
                      onPress={() => setShowToPicker(true)}
                      activeOpacity={0.8}
                    >
                      <VectorIcon name="calendar" size={18} color={primaryIconColor} />
                      <Text style={[typography.bodyMedium, styles.datePickerValue]}>
                        {formatDisplayDate(toDate)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.backToPresetsButton}
                      onPress={handleBackToPresets}
                      activeOpacity={0.8}
                    >
                      <VectorIcon name="chevron-left" size={14} color={primaryIconColor} />
                      <Text style={[typography.buttonText, styles.backToPresetsText]}>Back to presets</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.optionsRow}>
                    {DATE_RANGE_PRESETS.map((option) => {
                      const isSelected = option === pendingDateRange;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[styles.presetPill, isSelected && styles.presetPillSelected]}
                          onPress={() => handleSelectPreset(option)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              typography.caption,
                              styles.presetPillText,
                              isSelected && styles.presetPillTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <View style={styles.divider} />

                {/* Branch Section — collapsed dropdown */}
                <Text style={[typography.caption, styles.sectionLabel]}>BRANCH</Text>

                <TouchableOpacity style={styles.branchDropdownTrigger} onPress={toggleBranchList} activeOpacity={0.8}>
                  <View style={styles.branchRowLeft}>
                    <VectorIcon name="store" size={17} color={primaryIconColor} />
                    <Text style={[typography.bodyMedium, styles.branchDropdownValue]}>{pendingBranch.name}</Text>
                  </View>
                  <View style={isBranchListOpen ? styles.chevronOpen : undefined}>
                    <VectorIcon name="chevron-down" size={16} color={colors.text.secondary} />
                  </View>
                </TouchableOpacity>

                {isBranchListOpen && (
                  <View style={styles.branchList}>
                    {branches.map((branch) => {
                      const isSelected = branch.id === pendingBranch.id;
                      return (
                        <TouchableOpacity
                          key={branch.id}
                          style={[styles.branchRow, isSelected && styles.branchRowSelected]}
                          onPress={() => handleSelectBranch(branch)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.branchRowLeft}>
                            <VectorIcon
                              name="store"
                              size={17}
                              color={isSelected ? primaryIconColor : colors.text.secondary}
                            />
                            <Text
                              style={[
                                typography.bodyMedium,
                                styles.branchLabel,
                                isSelected && styles.branchLabelSelected,
                              ]}
                            >
                              {branch.name}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.checkmarkCircle}>
                              <VectorIcon
                                name="check"
                                size={13}
                                color={isDarkMode ? '#FF4D4D' : colors.text.white}
                                strokeWidth={3}
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              {showFromPicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleFromChange}
                />
              )}
              {showToPicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleToChange}
                />
              )}

              <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
                <Text style={[typography.buttonText, styles.applyButtonText]}>Apply Filters</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colors: Colors, isDarkMode: boolean) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '82%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: colors.text.primary,
  },
  scrollBody: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  presetPill: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetPillSelected: {
    backgroundColor: isDarkMode ? colors.brand.primary : colors.brand.tint,
    borderColor: colors.brand.primary,
  },
  presetPillText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: fontWeights.semiBold,
  },
  presetPillTextSelected: {
    color: isDarkMode ? colors.text.white : colors.brand.primary,
  },
  customContainer: {
    marginBottom: 4,
  },
  dateFieldLabel: {
    color: colors.text.muted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  datePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.neutral.gray50,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  datePickerValue: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 10,
  },
  backToPresetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  backToPresetsText: {
    fontSize: 13,
    color: isDarkMode ? colors.text.white : colors.brand.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 18,
  },
  branchDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.neutral.gray50,
    paddingHorizontal: 14,
  },
  branchDropdownValue: {
    fontSize: 14.5,
    color: colors.text.primary,
    marginLeft: 10,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  branchList: {
    marginTop: 6,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  branchRowSelected: {
    backgroundColor: isDarkMode ? colors.brand.primary : colors.brand.tint,
  },
  branchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  branchLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  branchLabelSelected: {
    fontWeight: fontWeights.bold,
    color: isDarkMode ? colors.text.white : colors.brand.primary,
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: isDarkMode ? colors.text.white : colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  applyButtonText: {
    fontSize: 15,
    color: colors.text.white,
    fontWeight: fontWeights.bold,
  },
});

export default FilterBottomSheet;
