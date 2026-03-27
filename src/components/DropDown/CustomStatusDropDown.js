import Loader from '@components/Loaders/loader';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';

const CustomStatusDropDown = ({
  data,
  selectedValue,
  onValueChange,
  placeholder,
  containerStyle,
  width,
  dropdownStyle,
  backgroundColor,
  icon,
  searchable = false, // Optional: search enabled or not
  loading = false,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const [Value, setValue] = useState(selectedValue);

  const styles = StyleSheet.create({
    dropdown: {
      height: hp(4),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: wp(2),
      paddingHorizontal: wp(2),
      backgroundColor:
        backgroundColor ||
        (isDarkMode
          ? Colors.darkTheme.secondryColor
          : Colors.lightTheme.backgroundColor),
      width: width,
      justifyContent: 'center',
    },
    placeholderStyle: {
      fontSize: RFPercentage(pxToPercentage(13)),
      fontFamily: Fonts.PoppinsMedium,
      color:
        placeholder === 'Requested'
          ? Colors.darkTheme.primaryTextColor
          : isDarkMode
          ? Colors.darkTheme.primaryTextColor
          : Colors.lightTheme.primaryTextColor,
      paddingLeft: wp(1),
      // textAlign: 'center'
    },
    selectedTextStyle: {
      fontSize: RFPercentage(pxToPercentage(13)),
      fontFamily: Fonts.PoppinsMedium,
      color:
        placeholder === 'Requested'
          ? Colors.darkTheme.primaryTextColor
          : isDarkMode
          ? Colors.darkTheme.primaryTextColor
          : Colors.lightTheme.primaryTextColor,
      paddingLeft: wp(1),
    },
    itemTextStyle: {
      fontSize: RFPercentage(pxToPercentage(15)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    iconStyle: {
      width: wp(4),
      height: wp(4),
      tintColor: isDarkMode
        ? Colors.darkTheme.iconColor
        : Colors.lightTheme.iconColor,
    },
  });

  return (
    <View style={[containerStyle, styles.dropdown]}>
      {loading ? (
        <Loader size={wp(10)} />
      ) : (
        <Dropdown
          style={[dropdownStyle]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={styles.itemTextStyle}
          data={data.map(item => ({
            label: t(item.label || item),
            value: item.value || item,
          }))}
          labelField="label"
          valueField="value"
          placeholder={t(placeholder) || t('Select')}
          value={Value}
          onChange={item => {
            onValueChange(item.value);
            setValue(item.value);
          }}
          showsVerticalScrollIndicator={false}
          renderLeftIcon={() => icon}
          renderRightIcon={() => (
            // Optional: you can replace with your Svg icon
            <View style={{paddingLeft: wp(1)}}>
              <MaterialCommunityIcons
                name="chevron-down"
                size={wp(6)}
                color={Colors.darkTheme.primaryTextColor}
              />
            </View>
          )}
          maxHeight={hp(50)}
          search={searchable}
          searchPlaceholder={t('Search...')}
          autoScroll = {false}
        />
      )}
    </View>
  );
};

export default CustomStatusDropDown;
