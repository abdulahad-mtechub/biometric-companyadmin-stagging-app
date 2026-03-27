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

const CustomDropDown = ({
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
  error,
  search = true,
  searchPlaceholder = 'Search...',
  disable,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const styles = dynamicStyles({isDarkMode, width, isFocus, error, Colors});

  const formattedData = [...data]
    .sort((a, b) => {
      const labelA = (a.label || a.value || a || '').toString().toLowerCase();
      const labelB = (b.label || b.value || b || '').toString().toLowerCase();
      return labelA.localeCompare(labelB);
    })
    .map(item =>
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
        search={search && formattedData.length > 0}
        inputSearchStyle={styles.inputSearchStyle}
        searchPlaceholder={t(searchPlaceholder)}
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
            onValueChange(item);
          } else {
            onValueChange(item);
          }
          setIsFocus(false);
        }}
        disable={disable}
        renderItem={(item, selected) => {
          const isSelected = multiple
            ? selectedValue?.some(sel => sel.label === item.label)
            : selectedValue?.value === item.value;

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
                      styles.emailText,
                    ]}>
                    {item.email}
                  </Text>
                )}
              </View>

              {multiple &&
                (isSelected ? (
                  <Svgs.checked height={hp(2.6)} />
                ) : isDarkMode ? (
                  <Svgs.UncheckBoxD height={hp(2.5)} width={hp(2.5)} />
                ) : (
                  <Svgs.check height={hp(3)} width={hp(3)} />
                ))}
            </View>
          );
        }}
        mode="dropdown"
        renderRightIcon={() => (
          <MaterialCommunityIcons
            name="chevron-down"
            size={RFPercentage(4)}
            color={
              error
                ? 'red'
                : isDarkMode
                ? Colors.darkTheme.secondryTextColor
                : Colors.lightTheme.iconColor
            }
          />
        )}
      />

      {error && <Text style={styles.errorText}>{t(error)}</Text>}
    </View>
  );
};

export default CustomDropDown;

const dynamicStyles = ({isDarkMode, width, isFocus, error, Colors}) =>
  StyleSheet.create({
    container: {
      marginBottom: hp(1.5),
    },
    dropdown: {
      height: hp(6),
      width: width || wp(90),
      borderColor: isFocus
        ? isDarkMode
          ? Colors.darkTheme.primaryColor
          : Colors.lightTheme.primaryColor
        : error
        ? 'red'
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
    inputSearchStyle: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      borderRadius: wp(1),
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
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
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
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
    emailText: {
      fontSize: RFPercentage(pxToPercentage(12)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
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
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      marginTop: hp(0.5),
    },
  });
