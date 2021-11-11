let btmBnbBrlPrice = 0.00;

$(function() {

  // get Bnb data
  let btmUrlBnb = "https://api.binance.com/api/v3/ticker/price?symbol=BNBBRL";

  $.get(btmUrlBnb, function(dataBnb, statusBnb){
    if(statusBnb=='success'){
      btmBnbBrlPrice = parseFloat(dataBnb.price).toFixed(2);
      btmRender();
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

  /** Form Input Mask */
  $('#btm-form-purchase-price').maskMoney();

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

  $('#btm-bnb-value').text(btmBnbBrlPrice);

  chrome.storage.sync.get( function(items) {

    $('#btm-table-body').html('No Data');
    
    $.each(items, function(index, value){

      let btmLine = JSON.parse(value);
      let btmUrlPancakeswap = 'https://api.pancakeswap.info/api/v2/tokens/';

      $.get(btmUrlPancakeswap+btmLine.token, function(dataToken, statusToken){
        
        
        if(statusToken=='success'){
          
          let btmActualPrice = dataToken.data.price_BNB*btmBnbBrlPrice;
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

          $('#btm-table-body').html(
            $('#btm-table-body').html()+btmAppend
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
        'token': $('#btm-form-token').val(),
        'amount': $('#btm-form-amount').val(),
        'purchasePrice': $('#btm-form-purchase-price').val()
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