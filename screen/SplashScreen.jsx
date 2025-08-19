/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Image, ActivityIndicator, Text, AppState, NativeModules } from "react-native";
import messaging from '@react-native-firebase/messaging';
const { KillApp } = NativeModules;

const SplashScreen = ({ navigation }) => {
    const [loadingData, setLoadingData] = useState(false);
    const [initialNotification, setInitialNoti] = useState(null);
    const homeTimeoutRef = useRef(null); // To store fallback timer

    const setupFCMListeners = async () => {
        try {
            // 1. App opened from quit/background via notification tap
            const remoteMessage = await messaging().getInitialNotification();
            if (remoteMessage) {
                // //console.log(
                // 'Notification opened app from quit/background state:',
                //     remoteMessage.data
                // );

                setInitialNoti(remoteMessage);

            }

            // 2. Foreground notifications
            const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
                //console.log('Foreground message received:', remoteMessage);
            });

            // 3. App in background, opened via tap
            const unsubscribeOnNotificationOpenedApp =
                messaging().onNotificationOpenedApp(async remoteMessage => {
                    // //console.log(
                    // 'Notification opened app from background state:',
                    //     remoteMessage.data
                    //             );

                    setInitialNoti(remoteMessage);
                });

            return () => {
                unsubscribeOnMessage();
                unsubscribeOnNotificationOpenedApp();
            };
        } catch (error) {
            console.error('Error setting up FCM listeners:', error);
        }
    };

    // Step 1: Check notifications on mount
    useEffect(() => {
        let cleanup;
        (async () => {
            cleanup = await setupFCMListeners();

            // If no initial notification yet, set fallback to Home after 5 sec
            homeTimeoutRef.current = setTimeout(() => {
                //console.log("SplashScreen: No initial notification, navigating to Home.");
                navigation.replace("Home");
            }, 5000);
        })();

        return () => {
            if (homeTimeoutRef.current) clearTimeout(homeTimeoutRef.current);
            if (cleanup) cleanup();
        };
    }, []);

    // Step 2: Handle navigation if notification found
    useEffect(() => {
        if (initialNotification) {
            // Cancel Home fallback
            if (homeTimeoutRef.current) {
                clearTimeout(homeTimeoutRef.current);
                homeTimeoutRef.current = null;
            }

            //console.log("SplashScreen: Initial notification detected. Fetching data...");
            setLoadingData(true);

            (async () => {
                try {
                    const res = await axios.get(`https://hindishayari.onrender.com/api/shayaris`);
                    const fetchedShayaris = res.data.shayaris;
                    const shayariIdFromNoti = initialNotification.data?.shayari_id;

                    navigation.replace("ShayariFullView", {
                        shayariId: shayariIdFromNoti,
                        shayari: {
                            _id: shayariIdFromNoti,
                            text: initialNotification.notification.body,
                        },
                        title: 'Popular Shayaris',
                        shayariList: fetchedShayaris,
                        initialIndex: fetchedShayaris.findIndex((s) => s._id === shayariIdFromNoti),
                    });

                } catch (error) {
                    console.error("SplashScreen: Error fetching shayaris ->", error);
                    navigation.replace("Home");
                } finally {
                    setLoadingData(false);
                }
            })();
        }
    }, [initialNotification]);

    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/splash_icon.png")}
                style={styles.logo}
            />
            {loadingData && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size={"large"} color={"#fff"} />
                    <Text style={styles.loadingText}>Loading Shayaris...</Text>
                </View>
            )}
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#08041C",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
});
