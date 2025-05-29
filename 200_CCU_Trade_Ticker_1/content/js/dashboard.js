/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.17365384615384616, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get Trade Data Candle Ticker"], "isController": false}, {"data": [0.1225, 500, 1500, "Get Trade Detail Ticker Symbol"], "isController": false}, {"data": [0.255, 500, 1500, "Get All Trade Ticker History"], "isController": false}, {"data": [0.155, 500, 1500, "Get Trade Depth Data Ticker"], "isController": false}, {"data": [0.97, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.25, 500, 1500, "POST Favorite Ticker"], "isController": false}, {"data": [0.3, 500, 1500, "POST UnFavorite Ticker"], "isController": false}, {"data": [0.095, 500, 1500, "Get Trade List Ticker"], "isController": false}, {"data": [0.09, 500, 1500, "Get Favorite Ticker"], "isController": false}, {"data": [0.0, 500, 1500, "SPOT TRADE"], "isController": true}, {"data": [0.02, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [0.0, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.0, 500, 1500, "AUTHENTICATOR"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2200, 0, 0.0, 8080.198181818178, 0, 45646, 3417.0, 21349.800000000025, 32288.44999999999, 39061.29999999996, 21.004993459808855, 49.20022517711029, 26.510319448953094], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Trade Data Candle Ticker", 200, 0, 0.0, 33858.96999999999, 9093, 45646, 32867.0, 40074.200000000004, 43407.899999999994, 45162.560000000005, 2.932078403776517, 1.9380064707305273, 4.687416962623331], "isController": false}, {"data": ["Get Trade Detail Ticker Symbol", 200, 0, 0.0, 5524.325000000001, 607, 17595, 3858.5, 13265.7, 15023.15, 16499.74, 4.814984230926644, 14.778992223800467, 7.4389390407949545], "isController": false}, {"data": ["Get All Trade Ticker History", 200, 0, 0.0, 1940.545, 700, 8198, 1483.0, 3718.6000000000004, 4139.199999999999, 5316.230000000003, 3.2293483175095266, 15.292099601175483, 5.083811049820771], "isController": false}, {"data": ["Get Trade Depth Data Ticker", 200, 0, 0.0, 4489.9400000000005, 646, 15617, 3274.5, 11349.5, 14279.249999999995, 15516.190000000002, 5.142049106568968, 3.389534323177786, 7.964326030016711], "isController": false}, {"data": ["Send 2FA", 200, 0, 0.0, 72.34999999999998, 0, 1482, 1.0, 3.9000000000000057, 740.2499999999998, 1468.6000000000004, 8.328475056217206, 0.0, 0.0], "isController": false}, {"data": ["POST Favorite Ticker", 200, 0, 0.0, 1757.049999999999, 573, 5407, 1506.5, 3430.7000000000003, 3974.349999999998, 5027.320000000005, 3.644447683953497, 2.050001822223842, 5.740841474497977], "isController": false}, {"data": ["POST UnFavorite Ticker", 200, 0, 0.0, 1604.1850000000002, 572, 5606, 1206.0, 3311.8, 3849.549999999998, 5326.170000000007, 3.820293398533007, 2.1563765472188265, 6.025300340722418], "isController": false}, {"data": ["Get Trade List Ticker", 200, 0, 0.0, 6981.885000000007, 887, 19838, 5573.5, 15535.100000000002, 16924.299999999996, 19516.31, 4.220388697799067, 48.31873150282766, 6.532679491812446], "isController": false}, {"data": ["Get Favorite Ticker", 200, 0, 0.0, 8264.185000000001, 743, 20065, 8971.0, 15592.4, 16843.8, 18617.08, 4.391936404760859, 2.620579241512583, 6.81537174310466], "isController": false}, {"data": ["SPOT TRADE", 200, 0, 0.0, 64421.084999999955, 44476, 87852, 64112.5, 76981.5, 80813.3, 85153.13, 2.076951035879329, 46.3105824711823, 26.00099304221403], "isController": true}, {"data": ["Post Request-code-login", 200, 0, 0.0, 7709.610000000001, 1089, 16539, 8855.5, 12010.2, 12724.499999999998, 14069.82, 7.946598855689765, 4.8812604299109985, 4.966507879549428], "isController": false}, {"data": ["Post Authen", 200, 0, 0.0, 16679.134999999995, 2490, 26432, 16610.0, 21512.100000000002, 22534.749999999996, 25677.530000000006, 4.488834025361912, 12.810119690551005, 3.3183398678599483], "isController": false}, {"data": ["AUTHENTICATOR", 200, 0, 0.0, 24461.09500000001, 8285, 40342, 25468.0, 31627.3, 32796.6, 38297.48, 4.213098523308967, 14.611161452518381, 5.747629144635673], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2200, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
