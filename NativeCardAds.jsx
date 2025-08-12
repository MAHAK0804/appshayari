import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
} from 'react-native';
import {
    NativeAd,
    NativeAdView,
    TestIds,
    MobileAds,
} from 'react-native-google-mobile-ads';

export default function NativeCard() {
    const [nativeAd, setNativeAd] = useState(null);
    const [loading, setLoading] = useState(true); // 🔄 Add loading state

    useEffect(() => {
        MobileAds().initialize();

        const loadAd = async () => {
            try {
                const ad = await NativeAd.createForAdRequest(TestIds.NATIVE);
                setNativeAd(ad);
            } catch (e) {
                console.error('Failed to load ad:', e);
            } finally {
                setLoading(false); // ✅ Stop loading whether success or error
            }
        };

        loadAd();
    }, []);

    const handleCTAPress = () => {
        if (nativeAd?.callToAction) {
            const storeUrl = `https://play.google.com/store`;
            Linking.openURL(storeUrl).catch(err => console.error("Failed to open URL:", err));
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#190b5fff" />
            </View>
        );
    }

    if (!nativeAd) return null;

    return (
        <NativeAdView nativeAd={nativeAd} style={styles.adContainer}>
            <View style={styles.adContent}>
                {nativeAd.icon?.url && (
                    <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
                )}

                <Text style={styles.headline}>{nativeAd.headline}</Text>
                <Text style={styles.body}>{nativeAd.body}</Text>

                {nativeAd.images && nativeAd.images[0]?.url && (
                    <Image
                        source={{ uri: nativeAd.images[0].url }}
                        style={styles.image}
                    />
                )}

                {nativeAd.advertiser && (
                    <Text style={styles.advertiser}>By: {nativeAd.advertiser}</Text>
                )}

                {nativeAd.callToAction && (
                    <TouchableOpacity style={styles.ctaButton} onPress={handleCTAPress}>
                        <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </NativeAdView>
    );
}

const styles = StyleSheet.create({
    adContainer: {
        width: '95%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 30,
        marginVertical: 10,
        elevation: 2,
    },
    adContent: {
        alignItems: 'center',
    },
    icon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 10,
    },
    headline: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    body: {
        fontSize: 14,
        color: '#333',
        marginVertical: 8,
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        resizeMode: 'cover',
        marginVertical: 10,
    },
    advertiser: {
        fontSize: 12,
        color: '#bbb',
        fontStyle: 'italic',
        marginTop: 5,
    },
    ctaButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#190b5fff',
        borderRadius: 25,
    },
    ctaText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loaderContainer: {
        width: '95%',
        alignSelf: 'center',
        padding: 20,
        marginVertical: 10,
        borderRadius: 30,
        backgroundColor: 'transparent',
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
