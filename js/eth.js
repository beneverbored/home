async function getTxs_(address) {
  var ethusd = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
  .then(response => {return response.json()})
  .catch(err => {
    console.log('(╯°□°)╯︵ ┻━┻', err);
  })
  if (ethusd.hasOwnProperty('Response')) {
    ethusd = null;
    console.log('Could not get ETH/USD price.')
    console.log(ethusd.Message);
  } else {
    ethusd = ethusd.USD;
    console.log('ETHUSD: $' + ethusd);
  }
  fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=3Y4EZUBZIR1G5M3J25HXUWUJGRDJVX8CMA`)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('¯\_(ツ)_/¯ : ' +
        response.status);
        return;
      }
      response.json().then(function(data) {
        var txs = data.result;
        console.log('All txs (up to 10k): ', txs);
        var n = txs.length;
        var txsOut = $.grep(txs, function(v) {
          return v.from === address.toLowerCase();
        });
        var nOut = txsOut.length;
        $('#nOut').text(nOut);
        var txsOutFail = $.grep(txsOut, function(v) {
          return v.isError === '1';
        });
        var nOutFail = txsOutFail.length;
        $('#nOutFail').text(nOutFail);
        console.log('Failed outgoing txs: ', txsOutFail);
        
        if (nOut > 0) {
          var gasUsed = txsOut.map(value => parseInt(value.gasUsed));
          var gasUsedTotal = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
          var gasPrice = txsOut.map(value => parseInt(value.gasPrice));
          var gasPriceMin = Math.min(...gasPrice);
          var gasPriceMax = Math.max(...gasPrice);
          var gasFee = multiply(gasPrice, gasUsed)
          var gasFeeTotal = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
          var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
          var gasUsedFail = txsOutFail.map(value => parseInt(value.gasUsed));
          var gasPriceFail = txsOutFail.map(value => parseInt(value.gasPrice));
          var gasFeeFail = multiply(gasPriceFail, gasUsedFail)
          var gasFeeTotalFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
          $('#gasUsedTotal').text(comma(formatter(gasUsedTotal)));
          $('#gasPricePerTx').text(comma((gasPriceTotal/nOut/1e9).toFixed(1)));
          $('#gasPricePerTx').hover(function() {
            $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
            Tipped.create('#gasPricePerTx', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
          }, function() {
            $(this).css('cursor', 'auto');
          });
          $('#gasFeeTotal').text('' + comma((gasFeeTotal/1e18).toFixed(3)));
          
          if (nOutFail > 0) {
            $('#gasFeeTotalFail').html('Ξ' + (gasFeeTotalFail/1e18).toFixed(3));
            var oof = Math.max(...gasFeeFail)/1e18;
            if (oof > 0.1) {
              var i = gasFeeFail.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
              var tx = txsOutFail[i];
              $('p').last().append(' <a id="oof" href="https://etherscan.io/tx/' + 
              tx.hash + '">This one</a> cost <span id="oofCost">Ξ' + 
              (gasFeeFail[i]/1e18).toFixed(3) + '</span>.')
            }
          }  else {
            $('#gasFeeTotalFail').html('nothing');
          }
          if (ethusd !== null) {
            $('#ethusd').text('$ ' + comma(formatter((ethusd*gasFeeTotal/1e18).toFixed(2))));
            $('#oofCost').append(' ($ ' + comma(formatter((ethusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');
          }
        } else {
          $('#gasUsedTotal').text(0);
          $('#gasFeeTotal').text('' + 0);
        }
        
      });
    }
    )
    .catch(function(err) {
      console.log('(╯°□°)╯︵ ┻━┻', err);
    });    
  }
  
  
  
  async function getTxs(address) {
    var ethusd = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    .then(response => {return response.json()})
    .catch(err => {
      console.log('(╯°□°)╯︵ ┻━┻', err);
    })
    if (ethusd.hasOwnProperty('Response')) {
      ethusd = null;
      console.log('Could not get ETH/USD price.')
      console.log(ethusd.Message);
    } else {
      ethusd = ethusd.USD;
      console.log('ETHUSD: $' + ethusd);
    }
    
    let key = "3Y4EZUBZIR1G5M3J25HXUWUJGRDJVX8CMA"
    var u = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${key}`
    var response = await fetch(u)
    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      var json = await response.json();
    } else {
      console.error("HTTP-Error: " + response.status);
    }
    var txs = json['result']
    var n = txs.length
    var from, txs2
    while (n===10000) {
      from = txs[txs.length - 1].blockNumber
      u = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${from}&endblock=99999999&sort=asc&apikey=${key}`
      response = await fetch(u)
      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        json = await response.json();
      } else {
        console.log('¯\_(ツ)_/¯ : ' + response.status);
        break
      }
      txs2 = json['result']
      n = txs2.length
      txs.push.apply(txs, txs2)
    }
    var txsOut = $.grep(txs, function(v) {
      return v.from === address.toLowerCase();
    });
    txsOut = txsOut.filter((v,i,a)=>a.findIndex(t=>(t.nonce === v.nonce))===i)
    // ^ https://stackoverflow.com/a/56757215/489704 @chickens
    //   To remove duplicates
    //localStorage.setItem('txsOut', JSON.stringify(txsOut));
    console.log('All outgoing txs:', txsOut)
    
    var nOut = txsOut.length;
    $('#nOut').text(nOut);
    var txsOutFail = $.grep(txsOut, function(v) {
      return v.isError === '1';
    });
    var nOutFail = txsOutFail.length;
    $('#nOutFail').text(nOutFail);
    console.log('Failed outgoing txs:', txsOutFail);
    
    if (nOut > 0) {
      var gasUsed = txsOut.map(value => parseInt(value.gasUsed));
      var gasUsedTotal = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPrice = txsOut.map(value => parseInt(value.gasPrice));
      var gasPriceMin = Math.min(...gasPrice);
      var gasPriceMax = Math.max(...gasPrice);
      var gasFee = multiply(gasPrice, gasUsed)
      var gasFeeTotal = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
      var gasUsedFail = txsOutFail.map(value => parseInt(value.gasUsed));
      var gasPriceFail = txsOutFail.map(value => parseInt(value.gasPrice));
      var gasFeeFail = multiply(gasPriceFail, gasUsedFail)
      var gasFeeTotalFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
      $('#gasUsedTotal').text(comma(formatter(gasUsedTotal)));
      $('#gasPricePerTx').text(comma((gasPriceTotal/nOut/1e9).toFixed(1)));
      $('#gasPricePerTx').hover(function() {
        $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
        Tipped.create('#gasPricePerTx', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
      }, function() {
        $(this).css('cursor', 'auto');
      });
      $('#gasFeeTotal').text('' + comma((gasFeeTotal/1e18).toFixed(3)));
      
      if (nOutFail > 0) {
        $('#gasFeeTotalFail').html('' + (gasFeeTotalFail/1e18).toFixed(3));
        var oof = Math.max(...gasFeeFail)/1e18;
        if (oof > 0.1) {
          var i = gasFeeFail.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
          var tx = txsOutFail[i];
          $('p').last().append(' <a id="oof" href="https://etherscan.io/tx/' + 
          tx.hash + '">This one</a> cost <span id="oofCost">Ξ' + 
          (gasFeeFail[i]/1e18).toFixed(3) + '</span>.')
        }
      }  else {
        $('#gasFeeTotalFail').html('nothing');
      }
      if (ethusd !== null) {
        $('#ethusd').text('$ ' + comma(formatter((ethusd*gasFeeTotal/1e18).toFixed(2))));
        $('#oofCost').append(' ($ ' + comma(formatter((ethusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');
      }
      
    } else {
      $('#gasUsedTotal').text(0);
      $('#gasFeeTotal').text('' + 0);
    }
  }
  
  
  function main() {
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
    getTxs(address);
  }
  
  
  $(document).on('click', '#tinytip', function (e) {
    if (typeof web3 === 'undefined') {
      return alert('You need to install MetaMask to use this feature.  https://metamask.io')
    }
    
    var user_address = web3.eth.accounts[0]
    web3.eth.sendTransaction({
      to: '0xf04713453F5A9dC6EB69C530f2765b6635af8D8b',
      from: user_address,
      value: web3.toWei(0.001, 'ether')
    }, function (err, transactionHash) {
      if (err) return alert('Oh no!: ' + err.message)
      alert('Thanks!')
    })    
    e.preventDefault();
  });
  
  
  $(document).on('click', '#smalltip', function (e) {
    if (typeof web3 === 'undefined') {
      return alert('You need to install MetaMask to use this feature.  https://metamask.io')
    }
    
    var user_address = web3.eth.accounts[0]
    web3.eth.sendTransaction({
      to: '0xf04713453F5A9dC6EB69C530f2765b6635af8D8b',
      from: user_address,
      value: web3.toWei(0.01, 'ether')
    }, function (err, transactionHash) {
      if (err) return alert('Oh no!: ' + err.message)
      alert('Thanks!')
    })    
    e.preventDefault();
  });
  
  
  
  $(document).on('click', '#bigtip', function (e) {
    if (typeof web3 === 'undefined') {
      return alert('You need to install MetaMask to use this feature.  https://metamask.io')
    }
    
    var user_address = web3.eth.accounts[0]
    web3.eth.sendTransaction({
      to: '0xf04713453F5A9dC6EB69C530f2765b6635af8D8b',
      from: user_address,
      value: web3.toWei(0.1, 'ether')
    }, function (err, transactionHash) {
      if (err) return alert('Oh no!: ' + err.message)
      alert('Thanks!')
    })    
    e.preventDefault();
  });
  
  
  $(document).on('click', '#hugetip', function (e) {
    if (typeof web3 === 'undefined') {
      return alert('You need to install MetaMask to use this feature.  https://metamask.io')
    }
    
    var user_address = web3.eth.accounts[0]
    web3.eth.sendTransaction({
      to: '0xf04713453F5A9dC6EB69C530f2765b6635af8D8b',
      from: user_address,
      value: web3.toWei(1, 'ether')
    }, function (err, transactionHash) {
      if (err) return alert('Oh no!: ' + err.message)
      alert('Thanks!')
    })    
    e.preventDefault();
  });
  
