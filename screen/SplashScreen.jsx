/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ActivityIndicator, Text } from "react-native";

const SplashScreen = ({ navigation, route }) => {
    const { initialNotification } = route.params || {};
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const handleNavigation = async () => {
            if (initialNotification) {
                console.log("SplashScreen: Initial notification detected. Fetching data...");
                setLoadingData(true);
                try {
                    const res = await axios.get(`https://hindishayari.onrender.com/api/shayaris`);
                    const fetchedShayaris = res.data.shayaris;

                    console.log("SplashScreen: Data fetched, navigating to ShayariFullView.");
                    console.log(fetchedShayaris.findIndex((s) => s._id === initialNotification.data?.shayari_id));
                    // console.log(initialNotification.data);

                    navigation.replace("ShayariFullView", {
                        shayariId: initialNotification.data?.shayariId,
                        shayari: {
                            _id: initialNotification.data?.shayariId,
                            text: initialNotification.notification.body,
                        },
                        title: 'Popular Shayaris',
                        shayariList: fetchedShayaris, // Pass the fetched list
                        initialIndex: fetchedShayaris.findIndex((s) => s._id === initialNotification.data?.shayari_id),
                    });

                } catch (error) {
                    console.error("SplashScreen: Error fetching all shayaris ->", error);
                    // Fallback to home if there's a network or API error
                    navigation.replace("Home");
                } finally {
                    setLoadingData(false);
                }
            } else {
                // If no initial notification, proceed to Home after 2 seconds
                console.log("SplashScreen: No initial notification, navigating to Home after 5 seconds.");
                const timeout = setTimeout(() => {
                    navigation.replace("Home");
                }, 5000);
                return () => clearTimeout(timeout);
            }
        };

        handleNavigation();
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