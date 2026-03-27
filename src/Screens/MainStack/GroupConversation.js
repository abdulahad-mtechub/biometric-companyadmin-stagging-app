import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Images } from '@assets/Images/Images';
import { Svgs } from '@assets/Svgs/Svgs';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import TxtInput from '@components/TextInput/Txtinput';
import { Fonts } from '@constants/Fonts';
import { SCREENS } from '@constants/Screens';
import logger from '@utils/logger';

const {width} = Dimensions.get('window');

const GroupConversation = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = 
  dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();
  const [chat, setChat] = useState('');
  const [downloadingImages, setDownloadingImages] = useState({});
  const CameraBottomSheetRef = useRef(null);

  // Dummy chat data
  const [chatData, setChatData] = useState([
    {
      id: 1,
      message: 'Thanks! Please leave the food by the front door.',
      time: '11:48 PM',
      isSender: false,
      isDelivered: true,
    },
    {
      id: 2,
      message: "Sure! I'll leave it by the door and message you when I arrive.",
      time: '11:55 PM',
      isSender: true,
      isDelivered: true,
    },
    {
      id: 3,
      message: 'Thank you! Looking forward to it.',
      time: '12:00 PM',
      isSender: false,
      isDelivered: true,
    },
    {
      id: 4,
      message: '',
      time: '03:18 PM',
      isSender: true,
      isDelivered: true,
      images: [
        {
          id: 'img1',
          uri: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
          downloaded: false,
        },
        {
          id: 'img2',
          uri: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          downloaded: false,
        },
        {
          id: 'img3',
          uri: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=988&q=80',
          downloaded: false,
        },
        {
          id: 'img4',
          uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=962&q=80',
          downloaded: false,
        },
      ],
    },
  ]);

  const handleSendMessage = () => {
    if (chat.trim()) {
      const newMessage = {
        id: chatData.length + 1,
        message: chat,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSender: true,
        isDelivered: false,
      };
      setChatData([...chatData, newMessage]);
      setChat('');

      // Simulate message delivery
      setTimeout(() => {
        setChatData(prev =>
          prev.map(msg =>
            msg.id === newMessage.id ? {...msg, isDelivered: true} : msg,
          ),
        );
      }, 1000);
    }
  };

  const handleImageDownload = imageId => {
    setDownloadingImages(prev => ({...prev, [imageId]: true}));

    // Simulate download process
    setTimeout(() => {
      setDownloadingImages(prev => ({...prev, [imageId]: false}));
      setChatData(prev =>
        prev.map(msg => ({
          ...msg,
          images: msg.images?.map(img =>
            img.id === imageId ? {...img, downloaded: true} : img,
          ),
        })),
      );
    }, 2000);
  };

  const renderMessage = ({item}) => {
    return (
      <View style={styles.messageContainer}>
        {!item.isSender && (
          <View
            style={[
              styles.timeContainer,
              item.isSender && styles.senderTimeContainer,
            ]}>
          <Image source={Images.placeholderImg} style={[styles.avatar]} />

            <Text style={styles.timeText}>{'John Doe'}</Text>
            
           
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            item.isSender ? styles.senderBubble : styles.receiverBubble,
          ]}>
          {item.message ? (
            <Text
              style={[
                styles.messageText,
                item.isSender ? styles.senderText : styles.receiverText,
              ]}>
              {item.message}
            </Text>
          ) : null}

          {item.images && (
            <View style={styles.imagesContainer}>
              {item.images.map((image, index) => (
                <TouchableOpacity
                  key={image.id}
                  style={styles.imageWrapper}
                  onPress={() =>
                    !image.downloaded && handleImageDownload(image.id)
                  }>
                  <Image
                    source={{uri: image.uri}}
                    style={styles.messageImage}
                  />
                  {!image.downloaded && (
                    <View style={styles.downloadOverlay}>
                      {downloadingImages[image.id] ? (
                        <View style={styles.downloadingCircle}>
                          <MaterialCommunityIcons
                            name="download"
                            size={RFPercentage(2)}
                            color={Colors.lightTheme.backgroundColor}
                          />
                        </View>
                      ) : (
                        <View style={styles.downloadButton}>
                          <MaterialCommunityIcons
                            name="download"
                            size={RFPercentage(2.5)}
                            color={Colors.lightTheme.backgroundColor}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View
          style={[
            styles.timeContainer,
            item.isSender && styles.senderTimeContainer,
          ]}>
          <Text style={styles.timeText}>{item.time}</Text>
          {item.isSender && (
            <MaterialCommunityIcons
              name={item.isDelivered ? 'check-all' : 'check'}
              size={RFPercentage(1.8)}
              color={
                item.isDelivered
                  ? Colors.darkTheme.primaryColor
                  : Colors.lightTheme.placeholderColor
              }
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons
          name={'chevron-left'}
          onPress={() => navigation.goBack()}
          size={RFPercentage(4)}
          color={
            isDarkMode
              ? Colors.darkTheme.primaryTextColor
              : Colors.lightTheme.primaryTextColor
          }
        />
        <TouchableOpacity
          style={{flexDirection: 'row', alignItems: 'center'}}
          onPress={() => navigation.navigate(SCREENS.CHATPROFILESCREEN, {isGroup: true})}>
          {/* <Image source={Images.placeholderImg} style={styles.avatar} /> */}
          <Svgs.GroupPlaceHolder
            height={hp(6)}
            width={hp(6)}
            style={{marginRight: wp(2)}}
          />
          <Text style={styles.screenHeading}>{t('Design Team')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chatData}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.chatList}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={() => CameraBottomSheetRef.current.open()}
          style={styles.iconWrapper}>
          <Svgs.plusBlue />
        </TouchableOpacity>
        <TxtInput
          value={chat}
          onChangeText={setChat}
          placeholder={t('Write message...')}
          style={styles.input}
          containerStyle={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.input
              : Colors.lightTheme.backgroundColor,
          }}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.iconWrapper,
            {backgroundColor: Colors.darkTheme.primaryColor},
          ]}
          onPress={handleSendMessage}>
          <Svgs.sendWhite />
        </TouchableOpacity>
      </View>

      <CameraBottomSheet
        refRBSheet={CameraBottomSheetRef}
        onPick={image => logger.log(image)}
      />
    </View>
  );
};

export default GroupConversation;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(1),
      borderBottomWidth: 0.5,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    screenHeading: {
      paddingTop: hp(0.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    avatar: {
      width: wp(5),
      height: wp(5),
      borderRadius: wp(5),
    },
    chatList: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    chatContent: {
      paddingVertical: hp(2),
      paddingBottom: hp(10),
    },
    messageContainer: {
      marginVertical: hp(0.5),
    },
    messageBubble: {
      maxWidth: '80%',
      borderRadius: wp(4),
      padding: wp(3),
    },
    senderBubble: {
      backgroundColor: Colors.darkTheme.primaryColor,
      alignSelf: 'flex-end',
      marginLeft: '20%',
    },
    receiverBubble: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      alignSelf: 'flex-start',
      marginRight: '20%',
    },
    messageText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
      lineHeight: RFPercentage(2.8),
    },
    senderText: {
      color: Colors.lightTheme.backgroundColor,
    },
    receiverText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    timeContainer: {
      alignSelf: 'flex-start',
      marginTop: hp(0.5),
      marginLeft: wp(2),
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1),
    },
    senderTimeContainer: {
      alignSelf: 'flex-end',
      marginRight: wp(2),
      marginLeft: 0,
    },
    timeText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(1),
      marginTop: wp(2),
    },
    imageWrapper: {
      position: 'relative',
      width: wp(33),
      height: wp(33),
      borderRadius: wp(2),
      overflow: 'hidden',
    },
    messageImage: {
      width: '100%',
      height: '100%',
      borderRadius: wp(2),
    },
    downloadOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: wp(5),
      padding: wp(2),
    },
    downloadingCircle: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: wp(5),
      padding: wp(2),
      borderWidth: 2,
      borderColor: Colors.lightTheme.backgroundColor,
    },
    inputContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(6),
      position: 'absolute',
      bottom: hp(1),
      left: wp(4),
      right: wp(4),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(2),
    },
    iconWrapper: {
      padding: wp(2.5),
      borderRadius: wp(100),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      marginHorizontal: wp(3),
      maxHeight: hp(10),
    },
  });
