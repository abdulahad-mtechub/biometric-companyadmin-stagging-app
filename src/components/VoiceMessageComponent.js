import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Sound from 'react-native-nitro-sound';
import {Fonts} from '@constants/Fonts';
import {Colors} from '@constants/themeColors';
import logger from '@utils/logger';

const VoiceMessageComponent = ({onSendAudio, isDarkMode, setIsRecordingg}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState('00:00');

  // Request audio permission
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        logger.warn(err, { context:'VoiceMessageComponent' });
        return false;
      }
    }
    return true;
  };

  // Format duration
  const formatDuration = duration => {
    if (typeof duration === 'string') {
      const parts = duration.split(':');
      if (parts.length === 3) return `${parts[1]}:${parts[2]}`;
      if (parts.length === 2) return duration;
    } else if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return '00:00';
  };

  // Start recording on press in
  const handlePressIn = async () => {
    const granted = await requestAudioPermission();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Microphone access is needed to record audio',
      );
      return;
    }
    //   setIsRecordingg(true);

    try {
      Sound.addRecordBackListener(e => {
        setDuration(
          formatDuration(Sound.mmssss(Math.floor(e.currentPosition))),
        );
      });

      await Sound.startRecorder();
      setIsRecording(true);
    } catch (error) {
      logger.error('Failed to start recording:', error, { context:'VoiceMessageComponent' });
      Alert.alert('Error', 'Failed to start recording');
      setIsRecordingg(false);
    }
  };

  // Stop recording and send on press out
  const handlePressOut = async () => {
    if (!isRecording) return;

    try {
      const result = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      setIsRecording(false);
      setIsRecordingg(false);
      setDuration('00:00');

      // Send audio immediately
      if (result) {
        await onSendAudio(result);
      }
    } catch (error) {
      logger.error('Failed to stop recording:', error, { context:'VoiceMessageComponent' });
      setIsRecordingg(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
      Sound.stopRecorder();
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={styles.initialMicButton}>
        {isRecording ? (
          <MaterialCommunityIcons
            name="microphone"
            size={RFPercentage(3)}
            color="red"
          />
        ) : (
          <MaterialCommunityIcons
            name="microphone"
            size={RFPercentage(3.5)}
            color={
              isDarkMode
                ? Colors.darkTheme.primaryColor
                : Colors.lightTheme.primaryColor
            }
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VoiceMessageComponent;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  micButtonRecording: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: RFPercentage(1.8),
    minWidth: wp(15),
  },
  recordingHint: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: RFPercentage(1.6),
    color: '#FF6B6B',
  },
  initialMicButton: {
    padding: wp(2),
  },
});
