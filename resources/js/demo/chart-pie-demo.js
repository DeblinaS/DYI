
function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
}
function convert(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-");
}
var startDate=convert(new Date(2020, 1 - 1, 1));
var endDate=convert(new Date());
var myPieChart;
var barChart;
var areaChart;
    $(function () {
        $('#datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
               changeMonth: true,
               changeYear: true,
               minDate: new Date(2020, 1 - 1, 1),
               maxDate: endDate?endDate:new Date(),
               onSelect: function(dateText) {
                startDate=this.value;
                console.log("Selected date: " + dateText + "; input's current value: " + this.value);
                $( "#datepicker1" ).datepicker( "option", "disabled", false );
                $( "#datepicker1" ).datepicker( "option", "minDate", startDate );
               } 
        });
        $('#datepicker1').datepicker({
              dateFormat: 'yy-mm-dd',
        //       showButtonPanel: true,
                 changeMonth: true,
                 changeYear: true,
          // yearRange: '1999:2012',
        //       showOn: "button",
        //       buttonImage: "images/calendar.gif",
        //       buttonImageOnly: true,
              disabled: startDate?false:true,
              minDate: startDate?startDate:new Date(2020, 1 - 1, 1),
              maxDate: new Date(),
              onSelect: function(dateText) {
                console.log("Selected date: " + dateText + "; input's current value: " + this.value);
                endDate=this.value;
                $( "#datepicker" ).datepicker( "option", "maxDate", endDate );  
               } 
              // inline: true
        });
        console.log(startDate,endDate);
        selectDate();
  });  
// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

var plotChart=function(data){
var label=[];
var data_plot=[];
color=[];
hover=[];
data.category.forEach(function(value,key){
  console.log(key,value);
  label.push(value.category)
  data_plot.push(value.count)
  color.push(getRandomColor())
  hover.push(getRandomColor())
})
console.log(label,data_plot);
// Pie Chart Example
var ctx = document.getElementById("myPieChart");
myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: label,
    datasets: [{
      data: data_plot,
      backgroundColor: color,
      hoverBackgroundColor: hover,
      hoverBorderColor: "rgba(234, 236, 244, 1)"
    }],
  },
  options: {
    maintainAspectRatio: false,
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },
    // legend: {
    //   display: false
    // },
    cutoutPercentage: 80,
    title: {
        display: true,
        text: 'Transaction count per category'
      }
  },
});
}

var selectDate=function(){
  $.ajax({

      url : '/dashboard',
      type : 'POST',
      data:{
        startDate:startDate,
        endDate:endDate
      },
      // dataType:'json',
      success : function(data) {     
        if(data.merchant.length && data.category.length && data.transactions.length){
          document.getElementById('filter_section').style.display='block';
          plotChart(data);
          plotMerchant(data);
          plotAreaChart(data);
        }    
      },
      error : function(request,error)
      {
        alert("Request: "+JSON.stringify(request));
      }
  });    
}

var changeFilter=function(){
    myPieChart.destroy();
    barChart.destroy();
    areaChart.destroy();   
    selectDate();
}

var plotMerchant=function(data){
var label=[];
var data_plot=[];
color=[];
hover=[];
data.merchant.forEach(function(value,key){
  console.log(key,value);
  label.push(value.merchant)
  data_plot.push(value.amount)
  color.push(getRandomColor())
  hover.push(getRandomColor())
})
barChart=new Chart(document.getElementById("bar-chart-horizontal"), {
    type: 'horizontalBar',
    data: {
      labels: label,
      datasets: [
        {
          label: "Spending Amount(INR)",
          backgroundColor: color,
          data: data_plot
        }
      ]
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Merchant wise spend (in INR)'
      },
      scales: {
        xAxes: [{
            gridLines: {
                drawBorder: true,
                display:false
            }
        }],
        yAxes: [{
            gridLines: {
                drawBorder: true,
                display:false
            }   
        }]
    }
    }
});
}
var plotAreaChart=function(data){
//   Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
// Chart.defaults.global.defaultFontColor = '#858796';

// function number_format(number, decimals, dec_point, thousands_sep) {
//   // *     example: number_format(1234.56, 2, ',', ' ');
//   // *     return: '1 234,56'
//   number = (number + '').replace(',', '').replace(' ', '');
//   var n = !isFinite(+number) ? 0 : +number,
//     prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
//     sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
//     dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
//     s = '',
//     toFixedFix = function(n, prec) {
//       var k = Math.pow(10, prec);
//       return '' + Math.round(n * k) / k;
//     };
//   // Fix for IE parseFloat(0.55).toFixed(0) = 0;
//   s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
//   if (s[0].length > 3) {
//     s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
//   }
//   if ((s[1] || '').length < prec) {
//     s[1] = s[1] || '';
//     s[1] += new Array(prec - s[1].length + 1).join('0');
//   }
//   return s.join(dec);
// }

var label=[];
var data_plot=[];
data.transactions.forEach(function(value,key){
  console.log(key,value);
  label.push(convert(value.txn_dt))
  data_plot.push(value.amount)
})
console.log(label,data_plot);

// Area Chart Example
// var ctx = document.getElementById("myAreaChart");
// var myLineChart = new Chart(ctx, {
//   type: 'line',
//   data: {
//     labels: label,
//     datasets: [{
//       label: "Earnings",
//       lineTension: 0.3,
//       backgroundColor: "rgba(78, 115, 223, 0.05)",
//       borderColor: "rgba(78, 115, 223, 1)",
//       pointRadius: 3,
//       pointBackgroundColor: "rgba(78, 115, 223, 1)",
//       pointBorderColor: "rgba(78, 115, 223, 1)",
//       pointHoverRadius: 3,
//       pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
//       pointHoverBorderColor: "rgba(78, 115, 223, 1)",
//       pointHitRadius: 10,
//       pointBorderWidth: 2,
//       data: data_plot,
//     }],
//   },
//   options: {
//     maintainAspectRatio: false,
//     layout: {
//       padding: {
//         left: 10,
//         right: 25,
//         top: 25,
//         bottom: 0
//       }
//     },
//     scales: {
//       xAxes: [{
//         time: {
//           unit: 'date'
//         },
//         gridLines: {
//           display: false,
//           drawBorder: false
//         },
//         ticks: {
//           maxTicksLimit: 7
//         }
//       }],
//       yAxes: [{
//         ticks: {
//           maxTicksLimit: 5,
//           padding: 10,
//           // Include a dollar sign in the ticks
//           callback: function(value, index, values) {
//             return '$' + number_format(value);
//           }
//         },
//         gridLines: {
//           color: "rgb(234, 236, 244)",
//           zeroLineColor: "rgb(234, 236, 244)",
//           drawBorder: false,
//           borderDash: [2],
//           zeroLineBorderDash: [2]
//         }
//       }],
//     },
//     legend: {
//       display: false
//     },
//     tooltips: {
//       backgroundColor: "rgb(255,255,255)",
//       bodyFontColor: "#858796",
//       titleMarginBottom: 10,
//       titleFontColor: '#6e707e',
//       titleFontSize: 14,
//       borderColor: '#dddfeb',
//       borderWidth: 1,
//       xPadding: 15,
//       yPadding: 15,
//       displayColors: false,
//       intersect: false,
//       mode: 'index',
//       caretPadding: 10,
//       callbacks: {
//         label: function(tooltipItem, chart) {
//           var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
//           return datasetLabel + ': $' + number_format(tooltipItem.yLabel);
//         }
//       }
//     }
//   }
// });
areaChart=new Chart(document.getElementById("myAreaChart"), {
  type: 'line',
  data: {
    labels: label,
    datasets: [{ 
        data: data_plot,
        label: "Total Spending Amount(INR)",
        borderColor: "#3e95cd",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Spends per day (in INR)'
    },
    scales: {
        xAxes: [{
            gridLines: {
                drawOnChartArea: false
            }
        }],
        yAxes: [{
            gridLines: {
                drawOnChartArea: false
            }   
        }]
    }
  }
});

}

var plotBar=function(data){
  var data_bal=[];
  var label=[];
  var data_lim=[];
  data.card_bal.forEach(function(value,key){
    console.log(key,value);
    label.push(value.mon)
    data_bal.push(value.bal)
    data_lim.push(value.lim)
  })
  new Chart(document.getElementById("bar-chart-grouped"), {
      type: 'bar',
      data: {
        labels: label,
        datasets: [
          {
            label: "Limit(INR)",
            backgroundColor: "#3e95cd",
            data: data_lim
          }, {
            label: "Balance(INR)",
            backgroundColor: "#8e5ea2",
            data: data_bal
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Limit vs. Balance(INR)'
        },
        scales: {
          xAxes: [{
              gridLines: {
                  drawOnChartArea: false
              }
          }],
          yAxes: [{
              gridLines: {
                  drawOnChartArea: false
              }   
          }]
         } 
      }
  });
}

$.ajax({

      url : '/cards',
      type : 'GET',
      // dataType:'json',
      success : function(data) {    
        plotBar(data);
      },
      error : function(request,error)
      {
        alert("Request: "+JSON.stringify(request));
      }
 });     
