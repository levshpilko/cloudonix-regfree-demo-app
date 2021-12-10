package com.cloudonixregfreedemo;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import net.greenfieldtech.cloudonixsdk.api.interfaces.IVoIPObserver;
import net.greenfieldtech.cloudonixsdk.api.models.RegistrationData;
import net.greenfieldtech.cloudonixsdk.api.models.SDKConstants;
import net.greenfieldtech.cloudonixsdk.appinterface.CloudonixSDKClient;
import net.greenfieldtech.cloudonixsdk.appinterface.DefaultVoipObserver;

import java.io.InputStream;
import java.util.concurrent.CompletableFuture;

@RequiresApi(api = Build.VERSION_CODES.N)
public class CxModule extends ReactContextBaseJavaModule {

    private CloudonixSDKClient cxClient;
    private DefaultVoipObserver evHandler = new DefaultVoipObserver(){
        @Override
        public void onLicense(LicensingState state, String description) {
            switch (state){
                case LICENSING_SUCCESS:
                    licenseCb.invoke();
                    cxClient.setConfiguration(new RegistrationData() {{
                        setServerUrl("sip4.staging.cloudonix.io");
                        setDomain("rupin-android-regfree.cloudonix.net");
                        setTransportType(TransportType.TRANSPORT_TYPE_TLS);
                        setPort(443);
                    }});
                    break;
                case LICENSING_INVALID_KEY_ERROR:
                    System.err.println("Invalid key entered");
                    break;
                case LICENSING_EXPIRED_KEY_ERROR:
                    System.err.println("Your license key is expired");
                    break;
                case LICENSING_KEY_REVOKED_ERROR:
                    System.err.println("Your license key was revoked");
                    break;
                case LICENSING_KEY_NETWORK_ERROR:
                    System.err.println("Network error, please try again");
                    break;
            }
        }

        @Override
        public void onLog(int level, String message) {
            System.err.println(message);
        }

        @Override
        public void onCallState(String key, CallState callState, String contactUrl) {
            callKey = key;

            switch (callState){
                case CALL_STATE_STARTING:
                    System.err.println("Starting call" +key + " to number: " + contactUrl);
                    break;
                case CALL_STATE_CONNECTING:
                    System.err.println("CONNECTING call" +key + " to number: " + contactUrl);
                    break;
                case CALL_STATE_CALLING:
                    System.err.println("CALLING" +key + " number: " + contactUrl);
                    break;
                case CALL_STATE_RINGING:
                    System.err.println("Ringing " +key + " number: " + contactUrl);
                    break;
                case CALL_STATE_CONFIRMED:
                    System.err.println("Connected call" +key + " to number: " + contactUrl);
                    cxClient.setAudioRoute(SDKConstants.AudioRoute.SPEAKER);
                    
                    break;
                case CALL_STATE_DISCONNECTED:
                case CALL_STATE_DISCONNECTEDDUETOBUSY:
                case CALL_STATE_DISCONNECTEDMEDIACHANGED:
                case CALL_STATE_DISCONNECTEDDUETONETWORKCHANGE:
                case CALL_STATE_DISCONNECTEDDUETONOMEDIA:
                case CALL_STATE_DISCONNECTEDDUETOTIMEOUT:
                    callDisconnectedCb.invoke();
                    System.err.println("Hanged up call " + key + " to number: " + contactUrl);
                    break;

            }
        }

        @Override
        public void onSipStarted() {
            isOnSipCompleted.complete(null);
        }
    };

    private Callback licenseCb;
    private Callback callDisconnectedCb;
    private String callKey;
    private ReactApplicationContext context;


    private String[] callData = new String[2];

    private CompletableFuture<Void> isOnSipCompleted = new CompletableFuture<>();

    public CxModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return getClass().getSimpleName();
    }

    @ReactMethod
    public void initCloudonixSDK(String licenseKey) {
            cxClient = CloudonixSDKClient.getInstance(licenseKey, evHandler);
            cxClient.setConfig(IVoIPObserver.ConfigurationKey.USER_AGENT, "CloudonixRegfreeDemo");
            cxClient.bind(getReactApplicationContext());
    }

    @ReactMethod
    public void onLicense(Callback cb){
        this.licenseCb = cb;
    }

    @ReactMethod
    private void dial(String msisdn, String token,Callback cb ) {
        callData[0] = msisdn;
        callData[1] = token;
        callDisconnectedCb = cb;
        isOnSipCompleted.thenRun(() -> cxClient.dialRegistrationFree(callData[0], callData[1]));
    }

    @ReactMethod
    private void endCall(){
        cxClient.hangup(callKey);
    }

    @ReactMethod
    private void invokeApp(){
        System.err.println("************* Before invoke app");
    context.startActivity(new Intent(context, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        System.err.println("************* After invoke app");

    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        cxClient.destroy();
        cxClient = null;
        System.err.println("*********CATALYST DESTROYED");
    }
}
