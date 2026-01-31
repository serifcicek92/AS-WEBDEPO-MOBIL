// src/models/LoginContract.ts
export default class LoginContract {
  private _USERID: number;
  private _ECZANEADI: string;
  private _ECZACIADI: string;
  private _SUBEID: number;
  private _LOGINURL: string;
  private _WEBDEPOURL: string;
  private _FIRMAKODU: string;
  private _OZELBOLGE: string;

  constructor(
    userid: number,
    eczaneadi: string,
    eczaciadi: string,
    subeId: number,
    loginUrl: string,
    webdepourl: string,
    firmakodu: string,
    ozelbolge: string
  ) {
    this._USERID = userid;
    this._ECZANEADI = eczaneadi;
    this._ECZACIADI = eczaciadi;
    this._SUBEID = subeId;
    this._LOGINURL = loginUrl;
    this._WEBDEPOURL = webdepourl;
    this._FIRMAKODU = firmakodu;
    this._OZELBOLGE = ozelbolge;
  }

  // --- GETTER'lar ---
  getUserId(): number {
    return this._USERID;
  }

  getEczaneadi(): string {
    return this._ECZANEADI;
  }

  getEczaciadi(): string {
    return this._ECZACIADI;
  }

  getLoginURL(): string {
    return this._LOGINURL;
  }

  getWebdepoURL(): string {
    return this._WEBDEPOURL;
  }

  getSubeId(): number {
    return this._SUBEID;
  }

  getFirmakodu(): string {
    return this._FIRMAKODU;
  }

  getOzelBolge(): string {
    return this._OZELBOLGE;
  }

  // --- SETTER'lar ---
  setUserId(userid: number): void {
    this._USERID = userid;
  }

  setEczaneadi(eczaneadi: string): void {
    this._ECZANEADI = eczaneadi;
  }

  setEczaciadi(eczaciadi: string): void {
    this._ECZACIADI = eczaciadi;
  }

  setSubeId(subeId: number): void {
    this._SUBEID = subeId;
  }

  setLoginURL(URL: string): void {
    this._LOGINURL = URL;
  }

  setWebdepoURL(URL: string): void {
    this._WEBDEPOURL = URL;
  }

  setFirmakodu(firmakodu: string): void {
    this._FIRMAKODU = firmakodu;
  }

  setOzelBolge(ozelbolge: string): void {
    this._OZELBOLGE = ozelbolge;
  }

  // --- JSON’a çevirmek için yardımcı metot ---
  toJSON(): object {
    return {
      _USERID: this._USERID,
      _ECZANEADI: this._ECZANEADI,
      _ECZACIADI: this._ECZACIADI,
      _SUBEID: this._SUBEID,
      _LOGINURL: this._LOGINURL,
      _WEBDEPOURL: this._WEBDEPOURL,
      _FIRMAKODU: this._FIRMAKODU,
      _OZELBOLGE: this._OZELBOLGE,
    };
  }

  // --- JSON’dan geri yükleme (örneğin AsyncStorage’dan) ---
  static fromJSON(json: any): LoginContract {
    return new LoginContract(
      json._USERID,
      json._ECZANEADI,
      json._ECZACIADI,
      json._SUBEID,
      json._LOGINURL,
      json._WEBDEPOURL,
      json._FIRMAKODU,
      json._OZELBOLGE
    );
  }
}
