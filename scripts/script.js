$(function() {

  let now = new Date();
  let month = now.getMonth() + 1;
      month = ( month < 10 ? '0' : '' ) + month;
  let day = now.getDate();
      day = ( day < 10 ? '0' : '' ) + day;
  let year = now.getFullYear();
  let hours = now.getHours();
      hours = ( hours < 10 ? '0' : '' ) + hours;
  let minutes = now.getMinutes();
      minutes = ( minutes < 10 ? '0' : '' ) + minutes;
  let seconds = now.getSeconds();
      seconds = ( seconds < 10 ? '0' : '' ) + seconds;
  let date = day + '/' + month + '/' + year +' '+ hours + ':' + minutes + ':' + seconds;
  
  let urlDollar = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='"+month+"-"+day+"-"+year+"'&$format=json";
    
  $.get(urlDollar, function(dataDollar, statusDollar){
    if(statusDollar=='success'){
      let dollar = dataDollar.value[0].cotacaoCompra;
      let urlPancakeswap = 'https://api.pancakeswap.info/api/v2/tokens/';

      $('#tm-dollarValue').text(dollar);
      $('#tm-dollarDate').text(date);

      // pegando valor do token poocoin
      let token = '0x727b531038198e27a1a4d0fd83e1693c1da94892';
      
      let purchasePrice = 2;
      let amount = 10;

      $.get(urlPancakeswap+token, function(dataToken, statusToken){
        if(statusToken=='success'){
          let actualPrice = dataToken.data.price*dollar;
              actualPrice = actualPrice.toFixed(2);

          let profit = actualPrice-purchasePrice;
              profit *=amount;
              profit = profit.toFixed(2);

          let tmProfitClass = (profit > 0) ? 'tm-bgGreen':'tm-bgRed';

          let tmAppend =  '<tr>'+
                            '<th scope="row">'+dataToken.data.name+'</th>'+
                            '<td>'+dataToken.data.symbol+'</td>'+
                            '<td>'+amount+'</td>'+
                            '<td>'+purchasePrice+'</td>'+
                            '<td>'+actualPrice+'</td>'+
                            '<td class="'+tmProfitClass+'">'+profit+'</td>'+
                            '<td><a href="#">Remove</a></td>'+
                          '</tr>';
          $('#tm-tableBody').append(tmAppend);
        }
      });
    }
  });
  
  $('#tm-newToken').click(function(){
    $('#tm-table').hide();
    $('#tm-form').show();
    return false;
  });

});
