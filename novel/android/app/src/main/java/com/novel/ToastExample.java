package com.novel;

import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;


/**
 * 原生的代码，之后与JS交互
 */
public class ToastExample extends ReactContextBaseJavaModule{

    private static final String LONG_TIME = "LONG";
    private static final String SHORT_TIME = "SHORT";

    public ToastExample(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * return string 这个名字在JavaScript端标记这个模块
     * 这样就可以在JavaScript中通过React.NativeModules.ToastForAndroid访问到这个模块
     * */
    @Override
    public String getName() {
        return "ToastForAndroid";
    }

    /**
     * return 需要导出给JavaScript使用的常量。它并不一定需要实现，但在定义一些可以被JavaScript同步访问到的预定义的值时非常有用。
     * */
    @Override
    public Map<String, Object> getConstants() {
        // 让js那边能够使用这些常量
        Map<String,Object> constants = new HashMap<>();
        constants.put(LONG_TIME,Toast.LENGTH_LONG);
        constants.put(SHORT_TIME,Toast.LENGTH_SHORT);
        return constants;
        // return super.getConstants();
    }

    /**
     * 该方法就是给js使用
     * Java方法需要使用注解@ReactMethod。
     * 方法的返回类型必须为void。
     * React Native的跨语言访问是异步进行的，所以想要给JavaScript返回一个值的唯一办法是使用回调函数或者发送事件
     * */
    @ReactMethod
    public void show(int duration){
        Toast.makeText(getReactApplicationContext(),"message",duration).show();
    }

    /**
     * 测试安卓的回调方法
     * */
    @ReactMethod
    public void testAndroidCallbackMethod(String msg, Callback callback){
        Toast.makeText(getReactApplicationContext(),msg,Toast.LENGTH_LONG).show();
        callback.invoke("abc");
    }

    @Override
    public boolean canOverrideExistingModule() {
        //这里需要返回true
        return true;
    }
}
