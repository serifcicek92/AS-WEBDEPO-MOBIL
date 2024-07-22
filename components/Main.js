import React, { useEffect, useState, useRef } from 'react';
import { View, BackHandler, Alert, ActivityIndicator, StyleSheet, Button, Text, StatusBar, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import * as Device from 'expo-device';
import md5 from 'md5';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

const Main = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [loginURL, setLoginURL] = useState('');
  const [webdepoURL, setWebdepoURL] = useState('');
  const [params, setParams] = useState('');
  const [showError, setShowError] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [webViewUri, setWebViewUri] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [redirect, setRedirect] = useState(false);
  const [redirectlink, setRedirectLink] = useState('');

  const webViewRef = useRef(null);


  useEffect(() => {

    console.log("useEffect tetiklendi");
    const loadSettings = async () => {
      const androidId = Device.osInternalBuildId;
      const hesapKodu = await AsyncStorage.getItem('hesapkodu');
      const kullaniciAdi = await AsyncStorage.getItem('kullaniciadi');
      let kullaniciSifre = await AsyncStorage.getItem('kullanicisifre');
      const storedLoginContract = await AsyncStorage.getItem('loginContract');
      const loginContract = storedLoginContract ? JSON.parse(storedLoginContract) : {};
      const _redirect = await AsyncStorage.getItem('redirect');
      const _redirectlink = await AsyncStorage.getItem('redirectlink');

      await setRedirect(_redirect === 'true');
      await setRedirectLink(_redirectlink);

      if (kullaniciSifre) {
        kullaniciSifre = md5(kullaniciSifre.toUpperCase()); // Convert to uppercase
      }

      if (!_redirect !== 'true' && kullaniciAdi) {
        console.log("redirect değil ve girdi");
        console.log('kullaniciAdi:' + kullaniciAdi);
        const { _LOGINURL, _WEBDEPOURL } = loginContract;
        await setLoginURL(_LOGINURL);
        await setWebdepoURL(_WEBDEPOURL);
        await setParams('?DeviceId=' + androidId + '&AppType=4&EczaneKodu=' + hesapKodu + '&KullaniciAdi=' + kullaniciAdi + '&Sifre=' + kullaniciSifre);
      }

    };

    console.log('web view izin varmı bakacak:' + loginURL + params);

    // if (permission && permission.granted) {
    loadSettings();
    // }
  }, []); // Only reload settings when permission changes permission,requestPermission,

  useEffect(() => {
    console.log("ikinci sycle da:" + redirectlink);
    console.log("kinci sycle da redirect:" + (redirect ? "true" : "false"));
    console.log("redirecti yaz:" + redirect)
    console.log("aaaaa"+(loginURL && params && !redirect));
    if (loginURL && params && !redirect) {
      console.log("loginURL && params && !redirect");
      setWebViewUri(loginURL + params);
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    } else if (redirect && redirectlink !== "") {
      console.log("redirect && redirectlink");
      setWebViewUri(redirectlink);
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    }
  }, [loginURL, params,redirect, redirectlink]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (webViewRef.current && webViewRef.current.canGoBack && webViewRef.current.canGoBack()) {
          webViewRef.current.goBack();
        } else {
          Alert.alert(
            'Çıkış',
            'Programdan çıkmak istiyor musunuz?',
            [
              { text: 'Hayır', style: 'cancel' },
              { text: 'Evet', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false }
          );
        }
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );


  const handleRefresh = () => {
    if (showError) {
      setShowError(false);
      setLoading(true); 
    }
    console.log("webviewuri refresh :" +webViewUri);
    webViewRef.current.reload();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('hesapkodu');
    await AsyncStorage.removeItem('kullaniciadi');
    await AsyncStorage.removeItem('kullanicisifre');
    await AsyncStorage.removeItem('redirect');
    await AsyncStorage.removeItem('redirectlink');
    await setWebViewUri("https://webdepo.asecza.com.tr/SignOut.aspx");
    await webViewRef.current.reload();

    navigation.dispatch(StackActions.replace('Login'));
  };

  const handleAbout = () => {
    Alert.alert(
      'Boyut Bilgisayar',
      'Boyut Bilgisayar 2024\nv1.0',
      [{ text: 'Tamam', style: 'default' }],
      { cancelable: true }
    );
  };

  const handleBarCodeScanned = ({ data }) => {
    setScannedData(data);
    setQrModalVisible(false);
    // Alert.alert('QR Code Data', data);
    const barcode = extractBarcode(data);
    if (barcode == null) {
      Alert.alert('Barkod Tanınmadı : ', data);
    } else {

      const link = webdepoURL + "/Siparis/hizlisiparis.aspx?ilcAdi=" + barcode.trim();
      console.log("link:" + link);
      if (barcode != null) {
        setWebViewUri(link);
        webViewRef.current.reload();
      }

    }
    console.log("barkod:" + barcode);
  };

  const extractBarcode = (data) => {
    const barcodePattern = /^[0-9]{13,14}$/;

    if (barcodePattern.test(data)) {
      return data.length === 14 && data.startsWith('0') ? data.substring(1) : data;
    } else {
      const match = data.match(/01(\d{14}|\d{13})/);
      if (match && match[1]) {
        const extractedBarcode = match[1];
        return extractedBarcode.length === 14 && extractedBarcode.startsWith('0')
          ? extractedBarcode.substring(1)
          : extractedBarcode;
      } else {
        return null;
      }
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  const handleWebViewMessage = (event) => {
    const data = event.nativeEvent.data;
    // console.log("webview data"+data);
    if (data.includes('Kullanıcı Adı Şifresi Yanlış')) {
      Alert.alert('Hata', 'Kullanıcı adı veya şifre yanlış!');
      handleLogout();
    }
  };
  const injectJavaScript = `
  (function() {
    var htmlContent = document.documentElement.innerHTML;
    window.ReactNativeWebView.postMessage(htmlContent);
  })();
  true;
`;
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && <ActivityIndicator size="large" />}
        {showError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Bir hata oluştu. Lütfen tekrar deneyin.</Text>
            <Button title="Yenile" onPress={handleRefresh} />
          </View>
        )}

        <View style={styles.menu}>
          <Text style={styles.title}>AS Webdepo</Text>
          <TouchableOpacity onPress={() => setQrModalVisible(true)} style={styles.qrButton}>
            <Image source={require('../assets/scanner48.png')} style={styles.qrIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ uri: webViewUri }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setShowError(true);
          }}
          injectedJavaScript={injectJavaScript}
          onMessage={handleWebViewMessage}
          style={styles.webView}
        />

        <Modal
          visible={menuVisible}
          transparent={true}
          animationType='none'//'slide-down'
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity style={styles.modalContainer} onPress={() => setMenuVisible(false)}>
            <View style={styles.modal}>
              <TouchableOpacity style={styles.menuItem} onPress={handleRefresh}>
                <Text>Yenile</Text>
              </TouchableOpacity>
              
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Text>Oturumu Kapat</Text>
                </TouchableOpacity>
             
              <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
                <Text>Hakkında</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={qrModalVisible}
          transparent={false}
          onRequestClose={() => setQrModalVisible(false)}
        >
          <CameraView style={styles.camera} flash='on' onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => setScannedData(false)}>
                <Text>Scan Barcode</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    // marginTop: StatusBar.currentHeight,
    backgroundColor: '#3bae75',
    color: '#fff'
  },
  title: {
    fontSize: 20,
    color: '#fff'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 10,
    fontSize: 18,
    color: 'red',
  },
  qrIcon: {
    textAlign: 'right',
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  menuIcon: {
    padding: 5,
  },
  modal: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 10,
    top: StatusBar.currentHeight + 50,
    width: 150,
    borderRadius: 5,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: 'red',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
});

export default Main;