  function toUSDBNB(bnb) {
    fetch('https://min-api.cryptocompare.com/data/price?fsym=bnb&tsyms=USD')
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log('bnbUSD: ' + data.USD);
      $('#bnbusd').text('$ ' + comma((data.USD*bnb/1e18).toFixed(2)));
      return data.USD;
      /*$('#oofCost').text('$ ' + comma((data.USD*bnb/1e18).toFixed(2)));*/
    })
    .catch(err => {
      console.log('(╯°□°)╯︵ ┻━┻', err);
    })
  }
  
  function bnbusd() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd')
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log('bnbUSD: ' + data.binancecoin.usd);
      return data.binancecoin.usd;
    })
    .catch(err => {
      console.log('(╯°□°)╯︵ ┻━┻', err);
    })
  }
  
  async function gettxsBNB_BNB(address) {
    var bnbusd = await fetch('https://min-api.cryptocompare.com/data/price?fsym=bnb&tsyms=USD')
    .then(response => {return response.json()})
    .catch(err => {
      console.log('(╯°□°)╯︵ ┻━┻', err);
    })
    if (bnbusd.hasOwnProperty('Response')) {
      bnbusd = null;
      console.log('Could not get bnb/USD price.')
      console.log(bnbusd.Message);
    } else {
      bnbusd = bnbusd.USD;
      console.log('bnbUSD: $' + bnbusd);
    }
    fetch(`https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=3Y4EZUBZIR1G5M3J25HXUWUJGRDJVX8CMA`)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('¯\_(ツ)_/¯ : ' +
          response.status);
          return;
        }
        response.json().then(function(data) {
          var txsBNB = data.result;
          console.log('All txsBNB (up to 10k): ', txsBNB);
          var n = txsBNB.length;
          var txsBNBOut = $.grep(txsBNB, function(v) {
            return v.from === address.toLowerCase();
          });
          var nOutBNB = txsBNBOut.length;
          $('#nOutBNB').text(nOutBNB);
          var txsBNBOutFail = $.grep(txsBNBOut, function(v) {
            return v.isError === '1';
          });
          var nOutBNBFail = txsBNBOutFail.length;
          $('#nOutBNBFail').text(nOutBNBFail);
          console.log('Failed outgoing txsBNB: ', txsBNBOutFail);
          
          if (nOutBNB > 0) {
            var gasUsed = txsBNBOut.map(value => parseInt(value.gasUsed));
            var gasUsedTotalBNB = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
            var gasPrice = txsBNBOut.map(value => parseInt(value.gasPrice));
            var gasPriceMin = Math.min(...gasPrice);
            var gasPriceMax = Math.max(...gasPrice);
            var gasFee = multiply(gasPrice, gasUsed)
            var gasFeeTotalBNB = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
            var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
            var gasUsedFail = txsBNBOutFail.map(value => parseInt(value.gasUsed));
            var gasPriceFail = txsBNBOutFail.map(value => parseInt(value.gasPrice));
            var gasFeeFail = multiply(gasPriceFail, gasUsedFail)
            var gasFeeTotalBNBFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
            $('#gasUsedTotalBNB').text(comma(formatter(gasUsedTotalBNB)));
            $('#gasPricePerTxBNB').text(comma((gasPriceTotal/nOutBNB/1e9).toFixed(1)));
            $('#gasPricePerTxBNB').hover(function() {
              $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
              Tipped.create('#gasPricePerTxBNB', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
            }, function() {
              $(this).css('cursor', 'auto');
            });
            $('#gasFeeTotalBNB').text('' + comma((gasFeeTotalBNB/1e18).toFixed(3)));
            
            if (nOutBNBFail > 0) {
              $('#gasFeeTotalBNBFail').html('' + (gasFeeTotalBNBFail/1e18).toFixed(3));
              var oof = Math.max(...gasFeeFail)/1e18;
              if (oof > 0.1) {
                var i = gasFeeFail.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
                var tx = txsBNBOutFail[i];
                $('p').last().append(' <a id="oof" href="https://bnberscan.io/tx/' + 
                tx.hash + '">This one</a> cost <span id="oofCost">' + 
                (gasFeeFail[i]/1e18).toFixed(3) + '</span>.')
              }
            }  else {
              $('#gasFeeTotalBNBFail').html('nothing');
            }
            if (bnbusd !== null) {
              $('#bnbusd').text('$ ' + comma(formatter((bnbusd*gasFeeTotalBNB/1e18).toFixed(2))));
              $('#oofCost').append(' ($' + comma(formatter((bnbusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');
            }
          } else {
            $('#gasUsedTotalBNB').text(0);
            $('#gasFeeTotalBNB').text('' + 0);
          }
          
        });
      }
      )
      .catch(function(err) {
        console.log('(╯°□°)╯︵ ┻━┻', err);
      });    
    }
    
    
    
    async function gettxsBNB(address) {
      var bnbusd = await fetch('https://min-api.cryptocompare.com/data/price?fsym=bnb&tsyms=USD')
      .then(response => {return response.json()})
      .catch(err => {
        console.log('(╯°□°)╯︵ ┻━┻', err);
      })
      if (bnbusd.hasOwnProperty('Response')) {
        bnbusd = null;
        console.log('Could not get bnb/USD price.')
        console.log(bnbusd.Message);
      } else {
        bnbusd = bnbusd.USD;
        console.log('bnbUSD: $' + bnbusd);
      }
      
      let key = "3Y4EZUBZIR1G5M3J25HXUWUJGRDJVX8CMA"
      var u = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${key}`
      var response = await fetch(u)
      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the mbnbod explained below)
        var json = await response.json();
      } else {
        console.error("HTTP-Error: " + response.status);
      }
      var txsBNB = json['result']
      var n = txsBNB.length
      var from, txsBNB2
      while (n===10000) {
        from = txsBNB[txsBNB.length - 1].blockNumber
        u = `https://api.bnberscan.io/api?module=account&action=txlist&address=${address}&startblock=${from}&endblock=99999999&sort=asc&apikey=${key}`
        response = await fetch(u)
        if (response.ok) { // if HTTP-status is 200-299
          // get the response body (the mbnbod explained below)
          json = await response.json();
        } else {
          console.log('¯\_(ツ)_/¯ : ' + response.status);
          break
        }
        txsBNB2 = json['result']
        n = txsBNB2.length
        txsBNB.push.apply(txsBNB, txsBNB2)
      }
      var txsBNBOut = $.grep(txsBNB, function(v) {
        return v.from === address.toLowerCase();
      });
      txsBNBOut = txsBNBOut.filter((v,i,a)=>a.findIndex(t=>(t.nonce === v.nonce))===i)
      // ^ https://stackoverflow.com/a/56757215/489704 @chickens
      //   To remove duplicates
      //localStorage.setItem('txsBNBOut', JSON.stringify(txsBNBOut));
      console.log('All outgoing txsBNB:', txsBNBOut)
      
      var nOutBNB = txsBNBOut.length;
      $('#nOutBNB').text(nOutBNB);
      var txsBNBOutFail = $.grep(txsBNBOut, function(v) {
        return v.isError === '1';
      });
      var nOutBNBFail = txsBNBOutFail.length;
      $('#nOutBNBFail').text(nOutBNBFail);
      console.log('Failed outgoing txsBNB:', txsBNBOutFail);
      
      if (nOutBNB > 0) {
        var gasUsed = txsBNBOut.map(value => parseInt(value.gasUsed));
        var gasUsedTotalBNB = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
        var gasPrice = txsBNBOut.map(value => parseInt(value.gasPrice));
        var gasPriceMin = Math.min(...gasPrice);
        var gasPriceMax = Math.max(...gasPrice);
        var gasFee = multiply(gasPrice, gasUsed)
        var gasFeeTotalBNB = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
        var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
        var gasUsedFail = txsBNBOutFail.map(value => parseInt(value.gasUsed));
        var gasPriceFail = txsBNBOutFail.map(value => parseInt(value.gasPrice));
        var gasFeeFail = multiply(gasPriceFail, gasUsedFail)
        var gasFeeTotalBNBFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
        $('#gasUsedTotalBNB').text(comma(formatter(gasUsedTotalBNB)));
        $('#gasPricePerTxBNB').text(comma((gasPriceTotal/nOutBNB/1e9).toFixed(1)));
        $('#gasPricePerTxBNB').hover(function() {
          $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
          Tipped.create('#gasPricePerTxBNB', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
        }, function() {
          $(this).css('cursor', 'auto');
        });
        $('#gasFeeTotalBNB').text('' + comma((gasFeeTotalBNB/1e18).toFixed(3)));
        
        if (nOutBNBFail > 0) {
          $('#gasFeeTotalBNBFail').html('' + (gasFeeTotalBNBFail/1e18).toFixed(3));
          var oof = Math.max(...gasFeeFail)/1e18;
          if (oof > 0.1) {
            var i = gasFeeFail.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            var tx = txsBNBOutFail[i];
            $('p').last().append(' <a id="oof" href="https://bnberscan.io/tx/' + 
            tx.hash + '">This one</a> cost <span id="oofCost">' + 
            (gasFeeFail[i]/1e18).toFixed(3) + '</span>.')
          }
        }  else {
          $('#gasFeeTotalBNBFail').html('nothing');
        }
        if (bnbusd !== null) {
          $('#bnbusd').text('$ ' + comma(formatter((bnbusd*gasFeeTotalBNB/1e18).toFixed(2))));
          $('#oofCost').append(' ($' + comma(formatter((bnbusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');
        }
        
      } else {
        $('#gasUsedTotalBNB').text(0);
        $('#gasFeeTotalBNB').text('' + 0);
      }
    }
    
    
    function mainBNB() {
      var address = getUrlParam('address', null);
      
      if (address==null) {
        address = getUrlParam('a', null);
      }
      if (address==null) {
        if(typeof(web3)=='undefined' || web3.eth.coinbase===null) {
          console.log('Specify an address via ?a= or ?address= url GET parameter, or sign into MetaMask.')
          $('body').html('<p id="oops">Sign into <strong><a href="https://metamask.io">MetaMask</a></strong> or pass an address via the url (like <strong><a href="http://beneverbored.com?address=0xcdd6a2b9dd3e386c8cd4a7ada5cab2f1c561182d">this</a></strong>).</p>')
          return;
        } else {
          address = web3.eth.coinbase;
        }
      }
      console.log('Getting transactions for ' + address)
      $('#myaddress').text(address);
      gettxsBNB(address);
    }
    
