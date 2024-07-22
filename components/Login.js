import React, { useEffect, useState } from 'react';
import {
  View, TextInput, Button, Text,
  ActivityIndicator, Alert, StyleSheet,
  StatusBar, TouchableOpacity, Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LoginContract from '../contracts/LoginContract';
// import md5 from 'md5';
import { WebView } from 'react-native-webview';
// import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SelectList } from 'react-native-dropdown-select-list'



const Login = ({ navigation }) => {
  const [language, setLanguage] = useState('tr');
  const [depo, setDepo] = useState('as');
  const [hesapKodu, setHesapKodu] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [kullaniciSifre, setKullaniciSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = React.useState("");
  const [digerButonLink, setDigerButonLink] = useState("");


  function isNull(value) {
    return value === undefined || value === null;
  }

  useEffect(() => {
    const loadUserData = async () => {
      const storedHesapKodu = await AsyncStorage.getItem('hesapkodu');
      const storedKullaniciAdi = await AsyncStorage.getItem('kullaniciadi');
      const storedKullaniciSifre = await AsyncStorage.getItem('kullanicisifre');

      if (!isNull(storedHesapKodu)) await setHesapKodu(storedHesapKodu);
      if (storedKullaniciAdi) await setKullaniciAdi(storedKullaniciAdi);
      if (storedKullaniciSifre) await setKullaniciSifre(storedKullaniciSifre);

      await setLoading(false);

      if (!isNull(storedHesapKodu) && !isNull(storedKullaniciAdi) && !isNull(storedKullaniciSifre)) {
        console.log("otomatik giriş1:" + storedHesapKodu);
        console.log("otomatik giriş2:" + storedKullaniciAdi);
        console.log("otomatik giriş3:" + storedKullaniciSifre);
        handleLogin(storedHesapKodu, storedKullaniciAdi, storedKullaniciSifre);
      }
    };

    loadUserData();
  }, []);


  const handleLogin = async (hesapKoduParam, kullaniciAdiParam, kullaniciSifreParam) => {
    console.log("hesapKodu:" + hesapKodu);
    console.log("hesapkoduParam:" + hesapKoduParam);
    const kodu = hesapKodu || hesapKoduParam;
    const adi = kullaniciAdiParam || kullaniciAdi;
    const sifre = kullaniciSifreParam || kullaniciSifre;

    console.log("-----------------------");
    console.log("kodu üst:", kodu);

    if (kodu && adi && sifre) {
      await setLoading(true);
      setTimeout(async () => {
        await setLoading(false);

        // Örnek LoginContract nesnesi
        const loginContract = new LoginContract(
          1, // userId
          'Eczane Adı', // eczaneadi
          'Eczacı Adı', // eczaciadi
          1, // subeId
          'https://webdepo.asecza.com.tr/Login.aspx', // loginUrl
          'https://webdepo.asecza.com.tr', // webdepourl
          '02', // firmakodu
          'Özel Bölge' // ozelbolge
        );

        await AsyncStorage.setItem('hesapkodu', await kodu);
        await AsyncStorage.setItem('kullaniciadi', await adi);
        await AsyncStorage.setItem('kullanicisifre', await sifre);
        await AsyncStorage.setItem('loginContract', await JSON.stringify(loginContract));
        navigation.replace('Main');
      }, 2000);
    } else {
      Alert.alert(texts[language].err, texts[language].pleasefillspace);
    }
    //   console.log('Login:', username, password);
  };

  const handleForgotPassword = () => {
    // Şifremi unuttum işlemleri burada yapılacak
    AsyncStorage.setItem('redirect', 'true');
    AsyncStorage.setItem('redirectlink', 'https://webdepo.asecza.com.tr/SifremiUnuttum.aspx');
    console.log('Forgot Password');
    navigation.replace('Main');
  };

  const handleUserGuide = () => {
    AsyncStorage.setItem('redirect', 'true');
    AsyncStorage.setItem('redirectlink', 'chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/https://webdepo.asecza.com.tr/WebDepoKK.pdf');
    console.log('User Guide');
    navigation.replace('Main');
  };

  const handleSalesmanLogin = () => {
    AsyncStorage.setItem('redirect', 'true');
    AsyncStorage.setItem('redirectlink', 'https://webdepo.asecza.com.tr/AdminLogin.aspx');
    // Plasiyer girişi işlemleri burada yapılacak
    console.log('Salesman Login');
    navigation.replace('Main');
  };


  const texts = {
    tr: {
      title: 'AS Ecza Webdepo Kullanıcı Girişi',
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
      title: 'AS Ecza Webdepo User Login',
      login: 'Login',
      forgotPassword: 'Forgot Password',
      userGuide: 'User Guide',
      salesmanLogin: 'Salesman Login',
      username: 'Username',
      password: 'Password',
      accountCode: 'Account Code',
      err: 'Error',
      pleasefillspace: 'Please fill the space.'
    },
  };

  const logos = {
    as: {
      path: require('../assets/aslogo72x72.png'),
    }
  }

  const languageData = [
    { key: "tr", value: "Türkçe" },
    { key: "en", value: "English" }
  ]

  return (
    <View style={styles.container}>
      <Image
        source={logos[depo].path} />
      <Text style={styles.title}>{texts[language].title}</Text>

      <View style={styles.languagePicker}>
        <SelectList
          onSelect={() => { setLanguage(selected) }}
          setSelected={(val) => setSelected(val)}
          //fontFamily='lato'
          data={languageData}
          arrowicon={<Icon name="chevron-down" size={12} color={'black'} />}
          searchicon={<Icon name="search" size={12} color={'black'} />}
          search={false}
          boxStyles={{ borderRadius: 0 }}
          defaultOption={languageData[0]}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.iconBackground}>
          <Icon name="plus" size={20} color="#000" style={styles.icon} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={texts[language].accountCode}
          value={hesapKodu}
          onChangeText={setHesapKodu}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.iconBackground}>
          <Icon name="user" size={20} color="#000" style={styles.icon} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={texts[language].username}
          value={kullaniciAdi}
          onChangeText={setKullaniciAdi}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.iconBackground}>
          <Icon name="lock" size={20} color="#000" style={styles.icon} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={texts[language].password}
          value={kullaniciSifre}
          onChangeText={setKullaniciSifre}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>{texts[language].login}</Text>
      </TouchableOpacity>

      <View style={styles.hr} />

      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.footerButtonRed} onPress={handleForgotPassword}>
          <Text style={styles.footerButtonText}>{texts[language].forgotPassword}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.footerButtonYellow} onPress={handleUserGuide}>
            <Text style={styles.footerButtonText}>{texts[language].userGuide}</Text>
          </TouchableOpacity> */}
        <TouchableOpacity style={styles.footerButtonBlue} onPress={handleSalesmanLogin}>
          <Text style={styles.footerButtonText}>{texts[language].salesmanLogin}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
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
  },
  icon: {
    marginRight: 10,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
  },
  loginButton: {
    backgroundColor: '#3bae75',
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
export default Login;
