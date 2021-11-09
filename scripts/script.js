$(function() {

  let btmNow = new Date();
  let btmMonth = btmNow.getMonth() + 1; btmMonth = ( btmMonth < 10 ? '0' : '' ) + btmMonth;
  let btmDay = btmNow.getDate(); btmDay = ( btmDay < 10 ? '0' : '' ) + btmDay;
  let btmYesterday = btmNow.getDate()-1; btmYesterday = ( btmYesterday < 10 ? '0' : '' ) + btmYesterday;
  let btmYear = btmNow.getFullYear();
  let btmUrlDollar = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='";
  
  // get dollar data
  $.get(btmUrlDollar+btmMonth+"-"+btmDay+"-"+btmYear+"'&$format=json", function(dataDollar, statusDollar){
    if(dataDollar.value[0]!=undefined && statusDollar=='success'){
      btmRender(dataDollar);
    }else{
      $.get(btmUrlDollar+btmMonth+"-"+btmYesterday+"-"+btmYear+"'&$format=json", function(dataDollar, statusDollar){
        if(dataDollar.value[0]!=undefined && statusDollar=='success'){    
          btmRender(dataDollar);
        }
      });
    }
  });
  
  /** Form Actions */
  $('#btm-new-token').on('click', function(){
    $('#btm-table').hide();
    $('#btm-form').show();
    return false;
  });

  $('#btm-form-cancel').on('click', function(){
    $('#btm-form').hide();
    $('#btm-table').show();
    return false;
  });

  $('#btm-form-save').on('click', function(){
    btmSave();
    return false;
  });

  /** Table list actions */
  $('.btm-table-remove').on('click', function(){
    btmRemove($(this).attr('id'));
  });

});

/** Load table data */
function btmRender(dataDollar){
  let btmDollar = dataDollar.value[0].cotacaoCompra;
  let btmUrlPancakeswap = 'https://api.pancakeswap.info/api/v2/tokens/';

  $('#btm-dollarValue').text(btmDollar);
  $('#btm-dollarDate').text(dataDollar.value[0].dataHoraCotacao);

  chrome.storage.sync.get( function(items) {
    $.each(items, function(index, value){

    btmLine = JSON.parse(value);

    // get token data if exists
    $.get(btmUrlPancakeswap+btmLine.token, function(dataToken, statusToken){
        if(statusToken=='success'){
          let btmActualPrice = dataToken.data.price*btmDollar;
              btmActualPrice = btmActualPrice.toFixed(2);
    
          let btmProfit = btmActualPrice-btmLine.purchasePrice;
              btmProfit *= btmLine.amount;
              btmProfit = btmProfit.toFixed(2);
    
          let btmProfitClass = (profit > 0) ? 'btm-bgGreen':'btm-bgRed';
    
          let btmAppend =  '<tr>'+
                            '<th scope="row">'+dataToken.data.name+'</th>'+
                            '<td>'+dataToken.data.symbol+'</td>'+
                            '<td>'+btmLine.amount+'</td>'+
                            '<td>'+btmLine.purchasePrice+'</td>'+
                            '<td>'+btmActualPrice+'</td>'+
                            '<td class="'+btmProfitClass+'">'+btmProfit+'</td>'+
                            '<td><a href="#" id="'+index+'" class="btm-table-remove">Remove</a></td>'+
                          '</tr>';
          $('#btm-tableBody').append(btmAppend);
        }
      });
    });
  });  
}

/** Save form data in chrome storage */
function btmSave(){
  let timestamp = $.now();

  let dictionary = JSON.stringify({
        'token': $('#btm-formToken').val()
      });

  let save = {};
      save[timestamp] = dictionary;
  
  chrome.storage.sync.set(save, function () {
    $('#btm-form').hide();
    $('#btm-table').show();
  });
}

/** Remove register in chrome storage by ID */
function btmRemove(btmID){
  alert(btmID);
}