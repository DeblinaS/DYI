var selectFilter=function(){
	month=document.getElementById("filterTransaction").value;
	window.location.href = 'transactions?page=1&startDate='+startDate+'&endDate='+endDate;
} 
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
        selectFilter();
  });  