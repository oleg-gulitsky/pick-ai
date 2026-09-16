# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# react-native-config reads BuildConfig fields via reflection (Class.forName + getFields).
# Without this rule R8 strips them and Config is empty in release builds.
-keep class com.pickai.BuildConfig { *; }

# React Native 0.80.0: native libraries look these classes up by name via JNI, but nothing
# references them from Java in release, and RN's consumer rules only keep their @DoNotStrip
# members, not the classes. R8 removes them and the app crashes on start with
# ClassNotFoundException: com.facebook.react.devsupport.CxxInspectorPackagerConnection.
# List = JNI descriptors from RN sources intersected with usage.txt; re-check after RN upgrades.
-keep class com.facebook.react.devsupport.CxxInspectorPackagerConnection { *; }
-keep class com.facebook.react.devsupport.CxxInspectorPackagerConnection$* { *; }
-keep class com.facebook.react.runtime.cxxreactpackage.CxxReactPackage { *; }
-keep class com.facebook.react.interfaces.TaskInterface { *; }
-keep class com.facebook.hermes.instrumentation.HermesMemoryDumper { *; }
