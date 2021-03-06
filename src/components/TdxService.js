import axios from 'axios';
// import _ from 'lodash';
import JsSHA from 'jssha';

function getAuthorizationHeader() {
  const AppID = '705e9a212c3242ed9a2fa2355b84f418';
  const AppKey = 'o2tSBueG3Dtk4o--mJKUv5kmGlE';

  const GMTString = new Date().toUTCString();
  const shaObj = new JsSHA('SHA-1', 'TEXT');
  shaObj.setHMACKey(AppKey, 'TEXT');
  shaObj.update(`x-date: ${GMTString}`);
  const HMAC = shaObj.getHMAC('B64');
  const Authorization = `hmac username="${AppID}", algorithm="hmac-sha1", headers="x-date", signature="${HMAC}"`;
  return { Authorization, 'X-Date': GMTString };
}

const TdxService = {
  getAny(category, city, keyword) {
    let computedCity = city;
    let computedQueryString = '';
    let positionQueryString = '';
    let tagQueryString = '';
    console.log(keyword);
    if (keyword && keyword[0] === '@') {
      positionQueryString = `&$spatialFilter=nearby(${keyword.split('@')[1]},10000)`;
    } else if (keyword && keyword[0] === '_') {
      tagQueryString = ` and (contains(Class1,'${keyword.split('_')[1]}') or contains(Class2,'${
        keyword.split('_')[1]
      }') or contains(Class3,'${keyword.split('_')[1]}'))`;
    } else if (keyword) {
      computedQueryString = ` and (contains(${category}Name,'${keyword}') or contains(Description,'${keyword}'))`;
    }
    if (city === 'Taiwan') computedCity = '';
    return new Promise((resolve) => {
      const api = `${
        `https://ptx.transportdata.tw/MOTC/v2/Tourism/${category}/${computedCity}?`
        + '$filter=Picture/PictureUrl1 ne null'
      }${computedQueryString}${tagQueryString}${positionQueryString}&$format=JSON`;
      return axios.get(api, { headers: getAuthorizationHeader() }).then((response) => {
        resolve(response.data);
      });
    });
  },
  getDetailByID(category, city, id) {
    let computedCity = city;
    let computedQueryString = '';
    computedQueryString = `%20and ${category}ID eq '${id}'`;
    if (city === 'Taiwan') computedCity = '';
    return new Promise((resolve) => {
      const api = `${
        `https://ptx.transportdata.tw/MOTC/v2/Tourism/${category}/${computedCity}?`
        + '$filter=Picture/PictureUrl1 ne null'
      }${computedQueryString}&$format=JSON`;
      return axios.get(api, { headers: getAuthorizationHeader() }).then((response) => {
        resolve(response.data);
      });
    });
  },
  getDetailNearby(category, city, position) {
    let computedCity = city;
    let computedQueryString = '';

    computedQueryString = `&$spatialFilter=nearby(${position.PositionLat}, ${position.PositionLon}, 10000)`;
    if (city === 'Taiwan') computedCity = '';
    return new Promise((resolve) => {
      const api = `${
        `https://ptx.transportdata.tw/MOTC/v2/Tourism/${category}/${computedCity}?`
        + '$filter=Picture/PictureUrl1 ne null'
      }${computedQueryString}&$skip=1&$top=3&$format=JSON`;
      console.log(api);
      return axios.get(api, { headers: getAuthorizationHeader() }).then((response) => {
        resolve(response.data);
      });
    });
  },
};
export default TdxService;
