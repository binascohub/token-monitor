let btmDataDollar = 0;

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
      btmDataDollar = dataDollar;
      btmRender();
    }else{
      $.get(btmUrlDollar+btmMonth+"-"+btmYesterday+"-"+btmYear+"'&$format=json", function(dataDollar, statusDollar){
        if(dataDollar.value[0]!=undefined && statusDollar=='success'){    
          btmDataDollar = dataDollar;
          btmRender();
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

  $('#btm-form-clear-all').on('click', function(){
    if (confirm('This action will remove all tokens, do you confirm?')) {
      chrome.storage.sync.clear( function() {
        btmRender();
      });
    } 
  });

  /** Table list actions */
  $.subscribe('/table/loaded', function(e, data) {
    $('.btm-table-clear').on('click',function(){
      btmClear($(this).attr('id'));
      return false;
    });
  });
});

/** Load table data */
function btmRender(){
  
  let btmDollar = btmDataDollar.value[0].cotacaoCompra;
  
  $('#btm-dollarValue').text(btmDollar);
  $('#btm-dollarDate').text(btmDataDollar.value[0].dataHoraCotacao);

  chrome.storage.sync.get( function(items) {
    $('#btm-tableBody').html('');
    $.each(items, function(index, value){
      let btmLine = JSON.parse(value);
      let btmUrlPancakeswap = 'https://api.pancakeswap.info/api/v2/tokens/';
        $.get(btmUrlPancakeswap+btmLine.token, function(dataToken, statusToken){
          if(statusToken=='success'){
            let btmActualPrice = dataToken.data.price*btmDollar;
                btmActualPrice = btmActualPrice.toFixed(2);

            let btmProfit = btmActualPrice-btmLine.purchasePrice;
                btmProfit *= btmLine.amount;
                btmProfit = btmProfit.toFixed(2);

            let btmProfitClass = (btmProfit > 0) ? 'btm-bgGreen':'btm-bgRed';

            let btmAppend =  '<tr>'+
                              '<th scope="row">'+dataToken.data.name+'</th>'+
                              '<td>'+dataToken.data.symbol+'</td>'+
                              '<td>'+btmLine.amount+'</td>'+
                              '<td>'+btmLine.purchasePrice+'</td>'+
                              '<td>'+btmActualPrice+'</td>'+
                              '<td class="'+btmProfitClass+'">'+btmProfit+'</td>'+
                              '<td><a href="#" id="'+index+'" class="btm-table-clear">Clear</a></td>'+
                            '</tr>';
            $('#btm-tableBody').html(
              $('#btm-tableBody').html()+btmAppend
            );
            $.publish('/table/loaded');
          }
        });
    });
    
  });
}


/** Save form data in chrome storage */
function btmSave(){
  let timestamp = $.now();

  let dictionary = JSON.stringify({
        'token': $('#btm-formToken').val(),
        'amount': $('#btm-formAmount').val(),
        'purchasePrice': $('#btm-formPurchasePrice').val(),
      });

  let save = {};
      save[timestamp] = dictionary;
  
  chrome.storage.sync.set(save, function () {
    $('#btm-form').hide();
    $('#btm-table').show();
  });

  btmRender();
}

/** Remove register in chrome storage by ID */
function btmClear(btmID){
  chrome.storage.sync.remove([btmID], function(Items) {
    btmRender();
  });
}