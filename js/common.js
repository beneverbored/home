function multiply(x, y) {
    var prod = [];
    var i;
    for (i=0; i < x.length; i++) {
      prod[i] = x[i] * y[i];
    }
    return prod;
  }
  
  function formatter(num) {
    return num > 999999 ? (num/1e6).toFixed(3) + ' million' : num;
  }
  
  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }
  
  function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
      urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
  }
  
  function comma(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }