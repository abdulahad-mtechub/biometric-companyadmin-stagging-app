import React from 'react';
import { Keyboard, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useSelector } from 'react-redux';
import logger from '@utils/logger';

const CustomLayout = ({ children, customStyle }) => {
    const { isDarkMode ,Colors} = useSelector(store => store.theme);


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.transparent ,
        }
    });
    return (
        <View style={[styles.container, customStyle]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView 
                    style={{ backgroundColor: Colors.transparent }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'>
                    {children}
                </ScrollView>
            </TouchableWithoutFeedback>
        </View>
    );
};



export default CustomLayout;
