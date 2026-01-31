import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import LoginContract from '../models/LoginContract';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;


interface Props {
    navigation: LoginScreenNavigationProp;
}

const Login: React.FC<Props> = ({ navigation }) => {
    const [language, setLanguage] = useState<'tr' | 'en'>('tr');
    const [depo] = useState<'as'>('as');
    const [hesapKodu, setHesapKodu] = useState('');
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [kullaniciSifre, setKullaniciSifre] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoLogin, setAutoLogin] = useState(false);

    const texts = {
        tr: {
            title: 'AS Ecza Webdepo Login Form',
            login: 'Giriş',
            forgotPassword: 'Şifremi Unuttum',
            userGuide: 'Kullanım Kılavuzu',
            salesmanLogin: 'Plasiyer Girişi',
            username: 'Kullanıcı Adı',
            password: 'Şifre',
            accountCode: 'Hesap Kodu',
            err: 'Hata',
            pleasefillspace: 'Lütfen tüm alanları doldurun.',
        },
        en: {
            title: 'AS Ecza Webdepo Login Form',
            login: 'Login',
            forgotPassword: 'Forgot Password',
            userGuide: 'User Guide',
            salesmanLogin: 'Salesman Login',
            username: 'Username',
            password: 'Password',
            accountCode: 'Account Code',
            err: 'Error',
            pleasefillspace: 'Please fill the space.',
        },
    };

    const logos = {
        as: {
            path: require('../../assets/asecza.png'),
        },
    };

    const handleLogin = async () => {
        if (hesapKodu && kullaniciAdi && kullaniciSifre) {
            setLoading(true);
            setTimeout(async () => {
                setLoading(false);

                const loginContract = new LoginContract(
                    1,
                    'Eczane Adı',
                    'Eczacı Adı',
                    1,
                    'https://webdepo.asecza.com.tr/Login.aspx',
                    'https://webdepo.asecza.com.tr',
                    '01',
                    'Özel Bölge'
                );


                await AsyncStorage.setItem('hesapkodu', hesapKodu);
                await AsyncStorage.setItem('kullaniciadi', kullaniciAdi);
                await AsyncStorage.setItem('kullanicisifre', kullaniciSifre);
                await AsyncStorage.setItem('loginContract', JSON.stringify(loginContract.toJSON()));

                navigation.replace('Main');
            }, 2000);
        } else {
            Alert.alert(texts[language].err, texts[language].pleasefillspace);
        }
    };

    const handleForgotPassword = () => Alert.alert('Bilgi', 'Şifremi unuttum');
    const handleUserGuide = () => Alert.alert('Bilgi', 'Kullanım kılavuzu');
    const handleSalesmanLogin = () => Alert.alert('Bilgi', 'Plasiyer girişi');
    useEffect(() => {
        const loadSavedData = async () => {
            const savedHesap = await AsyncStorage.getItem('hesapkodu');
            const savedUser = await AsyncStorage.getItem('kullaniciadi');
            const savedPassword = await AsyncStorage.getItem('kullanicisifre');
            if (savedHesap) setHesapKodu(savedHesap);
            if (savedUser) setKullaniciAdi(savedUser);
            if (savedPassword) setKullaniciSifre(savedPassword);

            if (savedHesap && savedUser && savedPassword) {
                setAutoLogin(true);
            }
        };

        loadSavedData();
    }, []);
    useEffect(() => {
        if (autoLogin) {
            handleLogin();
        }
    }, [autoLogin]);
    return (
        <View style={styles.container}>
            <Image source={logos[depo as keyof typeof logos].path} />
            <Text style={styles.title}>{texts[language].title}</Text>

            <View style={styles.languagePicker}>
                <Picker selectedValue={language} onValueChange={(value) => setLanguage(value)}>
                    <Picker.Item label="Türkçe" value="tr" style={styles.pickerItem} />
                    <Picker.Item label="English" value="en" style={styles.pickerItem} />
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.iconBackground}>
                    <FontAwesome name="plus" size={20} color="#000" />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={texts[language].accountCode}
                    value={hesapKodu}
                    onChangeText={setHesapKodu}
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.iconBackground}>
                    <FontAwesome name="user" size={20} color="#000" />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={texts[language].username}
                    value={kullaniciAdi}
                    onChangeText={setKullaniciAdi}
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.iconBackground}>
                    <FontAwesome name="lock" size={20} color="#000" />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={texts[language].password}
                    value={kullaniciSifre}
                    onChangeText={setKullaniciSifre}
                    secureTextEntry
                    placeholderTextColor="#888"
                />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginButtonText}>
                    {loading ? 'Giriş Yapılıyor...' : texts[language].login}
                </Text>
            </TouchableOpacity>

            <View style={styles.hr} />

            <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.footerButtonRed} onPress={handleForgotPassword}>
                    <Text style={styles.footerButtonText}>{texts[language].forgotPassword}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButtonYellow} onPress={handleUserGuide}>
                    <Text style={styles.footerButtonText}>{texts[language].userGuide}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButtonBlue} onPress={handleSalesmanLogin}>
                    <Text style={styles.footerButtonText}>{texts[language].salesmanLogin}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    languagePicker: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        overflow: 'hidden',
        color: '#000',
    },
    pickerItem: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        padding: 5,
    },
    iconBackground: {
        backgroundColor: '#f1f1f1',
        padding: 5,
        borderRadius: 5,
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        color: '#000',
    },
    loginButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    hr: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        width: '100%',
        marginVertical: 10,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    footerButtonRed: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    footerButtonYellow: {
        backgroundColor: '#ffc107',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    footerButtonBlue: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginLeft: 5,
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 14,
    },
});
