import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Button,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { StackActions, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import md5 from 'md5';
import LoginContract from '../models/LoginContract';

type Props = {
    navigation: any;
};

const Main: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [loginURL, setLoginURL] = useState('');
    const [webdepoURL, setWebdepoURL] = useState('');
    const [params, setParams] = useState('');
    const [showError, setShowError] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [webViewUri, setWebViewUri] = useState('');
    const [permission, requestPermission] = useCameraPermissions();
    const [canGoBack, setCanGoBack] = useState(false);
    const webViewRef = useRef<WebView>(null);
    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);
    useEffect(() => {
        loadSettings();
    }, []);
    const loadSettings = async () => {
            try {
                const androidId = Device.osInternalBuildId;
                const hesapKodu = await AsyncStorage.getItem('hesapkodu');
                const kullaniciAdi = await AsyncStorage.getItem('kullaniciadi');
                let kullaniciSifre = await AsyncStorage.getItem('kullanicisifre');
                const storedLoginContract = await AsyncStorage.getItem('loginContract');
                const loginContract = storedLoginContract
                    ? LoginContract.fromJSON(JSON.parse(storedLoginContract))
                    : null;

                if (kullaniciSifre) {
                    kullaniciSifre = md5(kullaniciSifre.toUpperCase());
                }

                const _LOGINURL =
                    (loginContract?.getLoginURL() ?? 'https://webdepo.asecza.com.tr/Login.aspx').trim();
                const _WEBDEPOURL =
                    (loginContract?.getWebdepoURL() ?? 'https://webdepo.asecza.com.tr').trim();

                const newParams = `?DeviceId=${androidId}&AppType=4&EczaneKodu=${hesapKodu}&KullaniciAdi=${kullaniciAdi}&Sifre=${kullaniciSifre}`;

                setLoginURL(_LOGINURL);
                setWebdepoURL(_WEBDEPOURL);
                setParams(newParams);

                // Önce fetch ile kontrol
                try {
                    const response = await fetch(_LOGINURL + newParams, { method: 'GET' });
                    const html = await response.text();

                    if (
                        html.includes('<span id="spnErrorkod">401</span>') ||
                        html.includes('Kullanıcı Adı Şifresi Yanlış')
                    ) {
                        Alert.alert('Hata', 'Giriş başarısız. Kullanıcı adı veya şifre yanlış.');
                        await AsyncStorage.multiRemove([
                            'kullanicisifre'
                            ]);
                        navigation.replace('Login');
                        return;
                    }

                    // Hata yoksa WebView göster
                    setWebViewUri(_LOGINURL + newParams);
                    // webViewRef.current?.reload();
                } catch (error) {
                    console.error('Fetch hatası:', error);
                    Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
                    navigation.replace('Login');
                }
            } catch (e) {
                console.error('Ayarlar yüklenemedi:', e);
                setShowError(true);
            }
        };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (qrModalVisible) {
                    setQrModalVisible(false);
                    setScannedData(null);
                    return true;
                }

                if (canGoBack && webViewRef.current) {
                    webViewRef.current.goBack();
                    return true;
                }

                Alert.alert('Çıkış', 'Programdan çıkmak istiyor musunuz?', [
                    { text: 'Hayır', style: 'cancel' },
                    { text: 'Evet', onPress: () => BackHandler.exitApp() },
                ]);
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [qrModalVisible])
    );

    const handleRefresh = () => {
        setShowError(false);
        setLoading(true);
        webViewRef.current?.reload();
    };

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['hesapkodu', 'kullaniciadi', 'kullanicisifre']);
        navigation.dispatch(StackActions.replace('Login'));
    };

    const handleAbout = () => {
        Alert.alert('Boyut Bilgisayar', 'Boyut Bilgisayar 2016\nv1.0', [{ text: 'Tamam' }]);
    };

    const extractBarcode = (data: string): string | null => {
        const barcodePattern = /^[0-9]{13,14}$/;
        if (barcodePattern.test(data)) {
            return data.length === 14 && data.startsWith('0') ? data.substring(1) : data;
        }
        const match = data.match(/01(\d{13,14})/);
        if (match?.[1]) {
            return match[1].length === 14 && match[1].startsWith('0')
                ? match[1].substring(1)
                : match[1];
        }
        return null;
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScannedData(data);
        setQrModalVisible(false);

        const barcode = extractBarcode(data);
        if (!barcode) {
            Alert.alert('Barkod Tanınmadı', data);
            return;
        }

        const link = `${webdepoURL}/Siparis/hizlisiparis.aspx?ilcAdi=${barcode.trim()}`;
        setWebViewUri(link);
        webViewRef.current?.reload();
    };

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" />}
            {showError ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Bir hata oluştu. Lütfen tekrar deneyin.</Text>
                    <Button title="Yenile" onPress={handleRefresh} />
                </View>
            ) : (
                <>
                    <View style={styles.menu}>
                        <Text style={styles.title}>AS Webdepo</Text>
                        <TouchableOpacity onPress={() => setQrModalVisible(true)}>
                            <Image
                                source={require('../../assets/scanner48.png')}
                                style={styles.qrIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMenuVisible(true)}>
                            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <WebView
                        ref={webViewRef}
                        source={{ uri: webViewUri }}
                        onLoadStart={() => {
                            setLoading(true);
                            console.log('onLoadStart');
                        }}
                        onLoadEnd={() => {
                            setLoading(false);
                            console.log('onLoadEnd, sayfa yüklendi.');
                        }}
                        onHttpError={({ nativeEvent }) => {
                            setLoading(false);
                            setShowError(true);
                            console.log('onHttpErrorda:' + nativeEvent.statusCode);
                        }}
                        onError={() => {
                            setLoading(false);
                            setShowError(true);
                            console.log('onErrorda');
                        }}
                        style={styles.webView}
                        onNavigationStateChange={(navState) => {
                            setCanGoBack(navState.canGoBack);
                        }}
                    />

                    {/* Menü Modal */}
                    <Modal visible={menuVisible} transparent animationType="slide">
                        <TouchableOpacity
                            style={styles.modalContainer}
                            onPress={() => setMenuVisible(false)}
                        >
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
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {/* QR Modal */}
                    <Modal
                        visible={qrModalVisible}
                        transparent={false}
                        onRequestClose={() => {
                            setQrModalVisible(false);
                            setScannedData(null);
                        }}
                    >
                        <CameraView
                            style={styles.camera}
                            flash="on"
                            onBarcodeScanned={
                                scannedData ? undefined : handleBarCodeScanned
                            }
                        >
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => setScannedData(null)}
                                >
                                    <Text>Scan Barcode</Text>
                                </TouchableOpacity>
                            </View>
                        </CameraView>
                    </Modal>
                </>
            )}
        </View>
    );
};

export default Main;

const styles = StyleSheet.create({
    container: { flex: 1 },
    webView: { flex: 1 },
    menu: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        marginTop: StatusBar.currentHeight,
        backgroundColor: '#289af7',
    },
    title: { fontSize: 20, color: '#fff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { marginBottom: 10, fontSize: 18, color: 'red' },
    qrIcon: { width: 24, height: 24, tintColor: 'white' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modal: {
        backgroundColor: 'white',
        position: 'absolute',
        right: 10,
        top: StatusBar.currentHeight ? StatusBar.currentHeight + 50 : 50,
        width: 150,
        borderRadius: 8,
        padding: 10,
    },
    menuItem: { paddingVertical: 10, alignItems: 'center' },
    camera: { flex: 1 },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 50,
    },
    button: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 6,
    },
});
