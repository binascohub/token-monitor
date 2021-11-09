$(function() {

  let now = new Date();
  let month = now.getMonth() + 1; month = ( month < 10 ? '0' : '' ) + month;
  let day = now.getDate(); day = ( day < 10 ? '0' : '' ) + day;
  let yesterday = now.getDate()-1; yesterday = ( yesterday < 10 ? '0' : '' ) + yesterday;
  let year = now.getFullYear();
  let urlDollar = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='";
    
  $.get(urlDollar+month+"-"+day+"-"+year+"'&$format=json", function(dataDollar, statusDollar){
    if(dataDollar.value[0]!=undefined && statusDollar=='success'){
      render(dataDollar);
    }else{
      $.get(urlDollar+month+"-"+yesterday+"-"+year+"'&$format=json", function(dataDollar, statusDollar){
        if(dataDollar.value[0]!=undefined && statusDollar=='success'){    
          render(dataDollar);
        }
      });
    }
  });
  
  /** Form */
  $('#btm-newToken').on('click', function(){
    $('#btm-table').hide();
    $('#btm-form').show();
    return false;
  });

  $('#btm-formSave').on('click', function(){
    let dictionary = {
      'token': $('#btm-formToken').val()
    };

    dictionary = JSON.stringify(dictionary);

    chrome.storage.sync.set({ "BTM_STORAGE_KEY": dictionary }, function () {
      $('#btm-form').hide();
      $('#btm-table').show();
    });

    return false;
  });

});

function render(dataDollar){
  let dollar = dataDollar.value[0].cotacaoCompra;
  let urlPancakeswap = 'https://api.pancakeswap.info/api/v2/tokens/';

  $('#btm-dollarValue').text(dollar);
  $('#btm-dollarDate').text(dataDollar.value[0].dataHoraCotacao);

  chrome.storage.sync.get(['BTM_STORAGE_KEY'], function(result) {
    if (result['BTM_STORAGE_KEY'] != undefined) {
      let data = JSON.parse(result['BTM_STORAGE_KEY']);
    //   alert('Value currently is ' + data.token);
    }
  });


  // pegando valor do token
  let token = '0x727b531038198e27a1a4d0fd83e1693c1da94892';
  
  let purchasePrice = 0.10;
  let amount = 10;

  $.get(urlPancakeswap+token, function(dataToken, statusToken){
    if(statusToken=='success'){
      let actualPrice = dataToken.data.price*dollar;
          actualPrice = actualPrice.toFixed(2);

      let profit = actualPrice-purchasePrice;
          profit *=amount;
          profit = profit.toFixed(2);

      let tmProfitClass = (profit > 0) ? 'btm-bgGreen':'btm-bgRed';

      let tmAppend =  '<tr>'+
                        '<th scope="row">'+dataToken.data.name+'</th>'+
                        '<td>'+dataToken.data.symbol+'</td>'+
                        '<td>'+amount+'</td>'+
                        '<td>'+purchasePrice+'</td>'+
                        '<td>'+actualPrice+'</td>'+
                        '<td class="'+tmProfitClass+'">'+profit+'</td>'+
                        '<td><a href="#">Remove</a></td>'+
                      '</tr>';
      $('#btm-tableBody').append(tmAppend);
    }
  });
}