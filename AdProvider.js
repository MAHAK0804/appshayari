/* eslint-disable react-hooks/exhaustive-deps */
// AdProvider.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const AdContext = createContext();

export const AdProvider = ({ children }) => {
  const interstitialAdRef = useRef(null);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  const createAndLoadInterstitialAd = () => {
    const newAd = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });
    interstitialAdRef.current = newAd;

    newAd.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
      //console.log('Global Interstitial ad loaded');
    });

    newAd.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      // Reload a new ad when closed
      createAndLoadInterstitialAd();
    });

    newAd.addAdEventListener(AdEventType.ERROR, error => {
      console.error('Global Ad failed to load:', error);
      setInterstitialLoaded(false);
    });

    newAd.load();
  };

  useEffect(() => {
    createAndLoadInterstitialAd();
  }, []);

  const showAd = onAdClosedCallback => {
    const ad = interstitialAdRef.current;
    if (ad && interstitialLoaded) {
      try {
        // ad.addAdEventListener(AdEventType.CLOSED, () => {
        //   // Call the provided callback after the ad is closed.
        //   onAdClosedCallback();
        // });
        ad.show();
      } catch (error) {
        console.error('Failed to show interstitial ad:', error);
        // Fallback in case showing the ad fails.
        onAdClosedCallback();
      }
    } else {
      //console.log('Ad not ready, calling fallback directly.');
      onAdClosedCallback();
      // Try to load a new ad for the future.
      createAndLoadInterstitialAd();
    }
  };

  return (
    <AdContext.Provider value={{ showAd, interstitialLoaded }}>
      {children}
    </AdContext.Provider>
  );
};

export const useInterstitialAd = () => useContext(AdContext);
