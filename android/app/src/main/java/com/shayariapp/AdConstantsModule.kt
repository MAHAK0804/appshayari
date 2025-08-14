package com.shayariapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class AdConstantsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AdConstants"
    }

    override fun getConstants(): Map<String, Any> {
        val constants: MutableMap<String, Any> = HashMap()
        constants["BANNER_AD_UNIT_ID"] = reactApplicationContext.getString(R.string.banner_ad_unit_id)
        constants["NATIVE_AD_UNIT_ID"] = reactApplicationContext.getString(R.string.native_ad_unit_id)
        constants["INTERSTITIAL_AD_UNIT_ID"] = reactApplicationContext.getString(R.string.interstitial_ad_unit_id)
        return constants
    }
}
