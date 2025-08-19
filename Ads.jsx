import {
    InterstitialAd,
    TestIds,
    AdEventType,
} from 'react-native-google-mobile-ads';
import { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';
const { AdConstants } = NativeModules;

const adUnitId2 = __DEV__ ? TestIds.INTERSTITIAL : AdConstants.INTERSTITIAL_AD_UNIT_ID

const interstitial = InterstitialAd.createForAdRequest(adUnitId2, {
    requestNonPersonalizedAdsOnly: true,
});

export default function useInterstitial() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(
            AdEventType.LOADED,
            () => {
                setLoaded(true);
            }
        );

        const unsubscribeClosed = interstitial.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                interstitial.load(); // reload for next time
            }
        );

        // first load
        interstitial.load();

        // cleanup
        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, []);

    const show = () => {
        if (loaded) {
            interstitial.show();
            setLoaded(false);
        } else {
            //console.log('Interstitial not loaded yet');
        }
    };

    return { show, loaded };
}
