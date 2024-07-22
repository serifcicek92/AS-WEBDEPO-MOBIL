class LoginContract {
    constructor(userid, eczaneadi, eczaciadi, subeId, loginUrl, webdepourl, firmakodu, ozelbolge) {
      this._USERID = userid;
      this._ECZANEADI = eczaneadi;
      this._ECZACIADI = eczaciadi;
      this._SUBEID = subeId;
      this._LOGINURL = loginUrl;
      this._WEBDEPOURL = webdepourl;
      this._FIRMAKODU = firmakodu;
      this._OZELBOLGE = ozelbolge;
    }
  
    getUserId() {
      return this._USERID;
    }
  
    getEczaneadi() {
      return this._ECZANEADI;
    }
  
    getEczaciadi() {
      return this._ECZACIADI;
    }
  
    getLoginURL() {
      return this._LOGINURL;
    }
  
    getWebdepoURL() {
      return this._WEBDEPOURL;
    }
  
    getSubeId() {
      return this._SUBEID;
    }
  
    getFirmakodu() {
      return this._FIRMAKODU;
    }
  
    getOzelBolge() {
      return this._OZELBOLGE;
    }
  
    setUserId(userid) {
      this._USERID = userid;
    }
  
    setEczaneadi(eczaneadi) {
      this._ECZANEADI = eczaneadi;
    }
  
    setEczaciadi(eczaciadi) {
      this._ECZACIADI = eczaciadi;
    }
  
    setSubeId(subeId) {
      this._SUBEID = subeId;
    }
  
    setLoginURL(URL) {
      this._LOGINURL = URL;
    }
  
    setWebdepoURL(URL) {
      this._WEBDEPOURL = URL;
    }
  
    setFirmakodu(firmakodu) {
      this._FIRMAKODU = firmakodu;
    }
  
    setOzelBolge(ozelbolge) {
      this._OZELBOLGE = ozelbolge;
    }
  }
  
  export default LoginContract;
  