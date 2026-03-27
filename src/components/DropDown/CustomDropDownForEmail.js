import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '../../Constants/Fonts';
import {Colors} from '../../Constants/themeColors';
import {pxToPercentage} from '../../utils/responsive';
import {useTranslation} from 'react-i18next';
import {Svgs} from '../../assets/Svgs/Svgs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomDropDownForEmail = ({
  data = [],
  selectedValue,
  onValueChange,
  placeholder,
  containerStyle,
  width,
  astrik,
  dropdownContainerStyle,
  placeholderStyle,
  multiple = false, // ✅ add multiple prop
  error,
  isSearchable = true,
  format = true, // ✅ add format prop to control data formatting
  searchPlaceholder = 'Search here',
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [searchByEmail, setSearchByEmail] = useState(false);
  const {isDarkMode} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const styles = dynamicStyles({isDarkMode, width, isFocus, error});

  // Conditionally format data based on format prop
  const formattedData = format
    ? [...data]
        .sort((a, b) => {
          const labelA = (a.label || a.value || a || '')
            .toString()
            .toLowerCase();
          const labelB = (b.label || b.value || b || '')
            .toString()
            .toLowerCase();
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
        )
    : data;

  // For multiple, value must be an array of values
  const dropdownValue = multiple
    ? selectedValue?.map(item => item.value) ?? []
    : selectedValue?.value ?? null;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Toggle Button for Search by Email/Name */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          searchByEmail && styles.toggleButtonActive,
        ]}
        onPress={() => setSearchByEmail(!searchByEmail)}>
        <Text
          style={[
            styles.toggleButtonText,
            searchByEmail && styles.toggleButtonTextActive,
          ]}>
          {searchByEmail ? t('Search by Email') : t('Search by Name')}
        </Text>
      </TouchableOpacity>
      <Dropdown
        multiple={multiple}
        flatListProps={{
          ListEmptyComponent: () => (
            <Text style={styles.noDataText}>{t('No Data found')}</Text>
          ),
        }}
        style={[styles.dropdown, dropdownContainerStyle]}
        searchPlaceholder={t(searchPlaceholder)}
        containerStyle={styles.dropdownListContainer}
        searchPlaceholderTextColor={Colors.lightTheme.secondryTextColor}
        placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        data={formattedData}
        keyboardAvoiding={true}
        inputSearchStyle={styles.inputSearchStyle}
        labelField="label"
        valueField="value"
        placeholder={t(placeholder) + (astrik ? ' *' : '')}
        fontFamily={Fonts.PoppinsRegular}
        value={dropdownValue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => {
          setIsFocus(false);
        }}
        searchField={searchByEmail ? 'email' : 'label'}
        // searchQuery={(data) => {
        //   console.log(data, 'search query');
        //   setSearchQuery(data);
        // }}

        autoScroll={false}
        onChange={item => {
          if (multiple) {
            // item is an array of selected items
            onValueChange(item); //
          } else {
            onValueChange(item);
          }
          setIsFocus(false);
        }}
        renderItem={(item, selected) => {
          // ✅ handle multiple selection state
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
        search={isSearchable}
      />
      {error && <Text style={styles.errorText}>{t(error)}</Text>}
    </View>
  );
};

export default CustomDropDownForEmail;

const dynamicStyles = ({isDarkMode, width, isFocus, error}) =>
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
      fontSize: RFPercentage(pxToPercentage(14)),
    },
    inputSearchStyle: {
      height: hp(5),
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      borderWidth: 0,
    },
    toggleButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginBottom: hp(1),
    },
    toggleButtonActive: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    toggleButtonText: {
      fontSize: RFPercentage(pxToPercentage(12)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    toggleButtonTextActive: {
      color: Colors.lightTheme.backgroundColor,
    },
    noDataText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      paddingVertical: hp(2),
    },
  });

// import React, {useState} from 'react';
// import {View, Text, StyleSheet} from 'react-native';
// import {Dropdown} from 'react-native-element-dropdown';
// import {useSelector} from 'react-redux';
// import {RFPercentage} from 'react-native-responsive-fontsize';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {Fonts} from '../../Constants/Fonts';
// import {Colors} from '../../Constants/themeColors';
// import {pxToPercentage} from '../../utils/responsive';
// import {useTranslation} from 'react-i18next';
// import {Svgs} from '../../assets/Svgs/Svgs';

// const CustomDropDown = ({
//   data = [],
//   selectedValue,
//   onValueChange,
//   placeholder,
//   containerStyle,
//   width,
//   astrik,
// }) => {
//   const [isFocus, setIsFocus] = useState(false);
//   const {isDarkMode} = useSelector(store => store.theme);
//   const {t} = useTranslation();

//   const styles = dynamicStyles({isDarkMode, width, isFocus});

//   return (
//     <View style={[styles.container, containerStyle]}>
//       <Dropdown
//         style={styles.dropdown}
//         containerStyle={styles.dropdownListContainer}
//         placeholderStyle={styles.placeholderStyle}
//         selectedTextStyle={styles.selectedTextStyle}
//         itemTextStyle={styles.itemTextStyle}
//         iconStyle={styles.iconStyle}
//         data={data.map(item => ({
//           label: t(item.label || item),
//           value: item.value || item,
//         }))}
//         labelField="label"
//         valueField="value"
//         placeholder={t(placeholder) + (astrik ? ' *' : '')}
//         fontFamily={Fonts.PoppinsRegular}
//         value={selectedValue?.value}
//         onFocus={() => setIsFocus(true)}
//         onBlur={() => setIsFocus(false)}
//         onChange={item => {
//           onValueChange(item);
//           setIsFocus(false);
//         }}
//         renderItem={(item, selected) => {
//           return (
//             <View style={styles.dropdownItem}>
//               <Text
//                 style={[styles.itemText, selected && styles.selectedItemText]}>
//                 {t(item?.label) || item}
//               </Text>
//               {selected ? <Svgs.checked height={hp(2.6)} /> :isDarkMode ? (
//                     <Svgs.UncheckBoxD
//                       height={hp(2.5)}
//                       width={hp(2.5)}
//                       style={{marginTop: hp(0.6)}}
//                     />
//                   ) : (
//                     <Svgs.check
//                       height={hp(2.5)}
//                       width={hp(2.5)}
//                       style={{marginTop: hp(0.6)}}
//                     />
//                   )}
//             </View>
//           );
//         }}
//         mode="dropdown"
//         renderRightIcon={() => (
//           <View style={{paddingRight: wp(2)}}>
//             <Svgs.dropDownArrow height={wp(4)} width={wp(4)} />
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default CustomDropDown;

// const dynamicStyles = ({isDarkMode, width, isFocus}) =>
//   StyleSheet.create({
//     container: {
//       zIndex: 1000,
//       marginBottom: hp(1.5),
//     },
//     dropdown: {
//       height: hp(6),
//       width: width || wp(90),
//       borderColor: isFocus
//         ? isDarkMode
//           ? Colors.darkTheme.primaryColor
//           : Colors.lightTheme.primaryColor
//         : isDarkMode
//         ? Colors.darkTheme.BorderGrayColor
//         : Colors.lightTheme.BorderGrayColor,
//       borderWidth: 1,
//       borderRadius: wp(2),
//       paddingHorizontal: wp(3),
//       backgroundColor: isDarkMode
//         ? Colors.darkTheme.secondryColor
//         : Colors.lightTheme.backgroundColor,
//     },
//     placeholderStyle: {
//       fontFamily: Fonts.PoppinsMedium,
//       fontSize: RFPercentage(pxToPercentage(14)),
//       color: isDarkMode
//         ? Colors.darkTheme.secondryTextColor
//         : Colors.lightTheme.secondryTextColor,
//     },
//     selectedTextStyle: {
//       fontFamily: Fonts.PoppinsMedium,
//       fontSize: RFPercentage(pxToPercentage(14)),
//       color: isDarkMode
//         ? Colors.darkTheme.primaryTextColor
//         : Colors.lightTheme.primaryTextColor,
//     },
//     itemTextStyle: {
//       fontFamily: Fonts.PoppinsMedium,
//       fontSize: RFPercentage(pxToPercentage(14)),
//       color: isDarkMode
//         ? Colors.darkTheme.primaryTextColor
//         : Colors.lightTheme.primaryTextColor,
//     },
//     dropdownListContainer: {
//       backgroundColor: isDarkMode
//         ? Colors.darkTheme.secondryColor
//         : Colors.lightTheme.secondryColor,
//       borderRadius: wp(2),
//       marginTop: hp(0.5),
//     },
//     iconStyle: {
//       width: wp(4),
//       height: wp(4),
//     },
//     dropdownItem: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       paddingVertical: hp(1.2),
//       paddingHorizontal: wp(2),

//     },
//     itemText: {
//       fontSize: RFPercentage(pxToPercentage(15)),
//       fontFamily: Fonts.PoppinsMedium,
//       color: isDarkMode
//         ? Colors.darkTheme.primaryTextColor
//         : Colors.lightTheme.primaryTextColor,
//       marginRight: wp(2),
//     },
//     selectedItemText: {
//       color: isDarkMode
//         ? Colors.darkTheme.primaryColor
//         : Colors.lightTheme.primaryColor,
//       fontFamily: Fonts.PoppinsMedium,
//       fontSize: RFPercentage(pxToPercentage(15)),
//     },
//   });
