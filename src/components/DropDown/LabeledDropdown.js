import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';

const LabeledDropdown = ({
  label,
  data,
  value,
  onChange,
  placeholder,
  containerStyle,
  width = wp(40),
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  const styles = StyleSheet.create({
    container: {
      //   marginBottom: hp(2),
    },
    label: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    dropdown: {
      height: hp(6),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 4,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.white,
      justifyContent: 'center',
      width: width,
    },
    textStyle: {
      fontSize: RFPercentage(pxToPercentage(15)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
    },
    dropdownContainer: {
      borderRadius: 8,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    dropdownItemText: {
      fontSize: RFPercentage(pxToPercentage(15)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      paddingVertical: hp(1),
      paddingHorizontal: wp(3),
    },
    selectedItem: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.textStyle}
        selectedTextStyle={styles.textStyle}
        containerStyle={styles.dropdownContainer}
        data={data}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoScroll={false}
        renderItem={(item, selected) => (
          <Text
            style={[styles.dropdownItemText, selected && styles.selectedItem]}>
            {item.label}
          </Text>
        )}
      />
    </View>
  );
};

export default LabeledDropdown;
