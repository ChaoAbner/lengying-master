import md5 from "md5.js"

function encodeUtf8(text) {
  const code = encodeURIComponent(text);
  const bytes = [];
  for (var i = 0; i < code.length; i++) {
    const c = code.charAt(i);
    if (c === '%') {
      const hex = code.charAt(i + 1) + code.charAt(i + 2);
      const hexVal = parseInt(hex, 16);
      bytes.push(hexVal);
      i += 2;
    } else bytes.push(c.charCodeAt(0));
  }
  return bytes;
}

function translate(params, string){
  let appid = 20180407000143731
  let secret = 'nBEay3ty21AXQPVd7DUQ'
  let salt = 123456
  let q = string
  let { from_, to } = params
  let sign = md5(encodeUtf8(appid + q + salt + secret))
  console.log(appid + q + salt + secret)
  // encodeURIComponent(q) 
  let data = {
    q: encodeURIComponent(q),
    appid: appid,
    from: from_,
    to: to,
    salt: salt,
    sign: sign
  }
  console.log(data)

  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  wx.request({
    url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
    method: 'POST',
    data: data,
    header: headers,
    success: function(res){
      console.log
    },fail: res =>{
      console.log(res)
    }, complete: res=>{
      console.log(res)
    }
  })
}


module.exports = translate;