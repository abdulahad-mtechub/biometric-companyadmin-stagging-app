import {Svgs} from '@assets/Svgs/Svgs';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';

const MultipleSelectionDropDown = ({
  data = [],
  selectedValue,
  onValueChange,
  placeholder,
  containerStyle,
  width,
  astrik,
  dropdownContainerStyle,
  placeholderStyle,
  multiple = false,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const styles = dynamicStyles({isDarkMode, width, isFocus, Colors});

  const formattedData = data.map(item =>
    item.email
      ? {
          label: t(item.label || item),
          value: item.value || item,
          email: item.email,
        }
      : {
          label: t(item.label || item),
          value: item.value || item,
        },
  );

  // For multiple, value must be an array of values
  const dropdownValue = multiple
    ? selectedValue?.map(item => item.value) ?? []
    : selectedValue?.value ?? null;
  return (
    <View style={[styles.container, containerStyle]}>
      <Dropdown
        multiple={multiple}
        style={[styles.dropdown, dropdownContainerStyle]}
        containerStyle={styles.dropdownListContainer}
        placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        data={formattedData}
        labelField="label"
        valueField="value"
        placeholder={t(placeholder) + (astrik ? ' *' : '')}
        fontFamily={Fonts.PoppinsRegular}
        value={dropdownValue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        autoScroll={false}
        onChange={item => {
          if (multiple) {
            let newValues = Array.isArray(selectedValue)
              ? [...selectedValue]
              : [];

            // check if item already exists
            const exists = newValues.some(v => v.value === item.value);

            if (exists) {
              // remove it
              newValues = newValues.filter(v => v.value !== item.value);
            } else {
              // add it
              newValues.push(item);
            }

            onValueChange(newValues);
          } else {
            onValueChange(item);
          }
          setIsFocus(false);
        }}
        renderItem={(item, selected) => {
          // ✅ handle multiple selection state
          const isSelected = multiple
            ? selectedValue?.some(sel => sel.value === item.value)
            : selected?.value === item.value;

          return (
            <View
              style={[styles.dropdownItem, isSelected && styles.selectedItem]}>
              <View>
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.selectedItemText,
                  ]}>
                  {t(item.label)}
                </Text>
                {item.email && (
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.selectedItemText,
                    ]}>
                    {item.email}
                  </Text>
                )}
              </View>

              {isSelected ? (
                <Svgs.checked height={hp(2.6)} />
              ) : isDarkMode ? (
                <Svgs.UncheckBoxD height={hp(2.5)} width={hp(2.5)} />
              ) : (
                <Svgs.check height={hp(3)} width={hp(3)} />
              )}
            </View>
          );
        }}
        mode="dropdown"
        renderRightIcon={() => (
          <MaterialCommunityIcons
            name="chevron-down"
            size={RFPercentage(4)}
            color={
              isDarkMode
                ? Colors.darkTheme.secondryTextColor
                : Colors.lightTheme.iconColor
            }
          />
        )}
      />
    </View>
  );
};

export default MultipleSelectionDropDown;

const dynamicStyles = ({isDarkMode, width, isFocus, Colors}) =>
  StyleSheet.create({
    container: {
      zIndex: 1000,
      marginBottom: hp(1.5),
    },
    dropdown: {
      height: hp(6),
      width: width || wp(90),
      borderColor: isFocus
        ? isDarkMode
          ? Colors.darkTheme.primaryColor
          : Colors.lightTheme.primaryColor
        : isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: wp(2),
      paddingHorizontal: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    placeholderStyle: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    selectedTextStyle: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    itemTextStyle: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    dropdownListContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      marginTop: hp(0.5),
    },
    iconStyle: {
      width: wp(4),
      height: wp(4),
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    itemText: {
      fontSize: RFPercentage(pxToPercentage(15)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginRight: wp(2),
    },
    selectedItemText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(15)),
    },
    selectedItem: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
    },
  });
