import { Platform, NetInfo } from 'react-native';
 import * as Crypto from 'expo-crypto'
 import {Buffer} from 'buffer/';
 import CryptoJS from 'crypto-js';
import md5 from 'md5';
String.prototype.isNull() = function(){
return this===undefined ||this==null;
};
const Utils =  {
    UserInfo: {
      userId: 0,
      eczaneAdi: '',
      eczaciAdi: '',
      subeId: 0,
      loginURL: '',
      webdepoURL: '',
      firmaKodu: '',
      ozelBolge: '',
    },
    toMd5: async(string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(string); // UTF-8 encoding
        console.log("gelenmetin="+string);

        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.MD5, 
          string,
          {
            encoding: Crypto.CryptoEncoding.HEX, // HEX encoding
          }
        );
      
        // Dönüştürülen hash'i Android kodunun çıktısıyla eşleştirmeyi deneyin
        const formattedHash = hash;//.toUpperCase().replace(/^0+/, ''); // Büyük harf ve öndeki sıfırları kaldır
      
        console.log("son metin = "+Date.now()+"----"+formattedHash);
        return formattedHash;
      },
      sNetworkConnected: async () => {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          const isConnected = await NetInfo.fetch().then((state) => {
            return state.isConnected;
          });
          return isConnected;
        }
        return false;
      },
// export const toMd5 = (string) => {
//     return Crypto.digestStringAsync(Crypto.CryptoEncoding.HEX,string);
// //   return createHash('md5').update(string).digest('hex');
// };

    stringToByteArray(str) {
        let byteArray = [];
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            byteArray.push(code & 0xff); // Lower byte
            byteArray.push((code >> 8) & 0xff); // Upper byte
        }
        return byteArray;
    },
};

export default Utils;