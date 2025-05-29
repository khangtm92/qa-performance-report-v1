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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4230769230769231, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get Trade Data Candle Ticker"], "isController": false}, {"data": [0.5, 500, 1500, "Get Trade Detail Ticker Symbol"], "isController": false}, {"data": [0.5, 500, 1500, "Get All Trade Ticker History"], "isController": false}, {"data": [0.5, 500, 1500, "Get Trade Depth Data Ticker"], "isController": false}, {"data": [1.0, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.5, 500, 1500, "POST Favorite Ticker"], "isController": false}, {"data": [0.5, 500, 1500, "POST UnFavorite Ticker"], "isController": false}, {"data": [0.5, 500, 1500, "Get Trade List Ticker"], "isController": false}, {"data": [0.5, 500, 1500, "Get Favorite Ticker"], "isController": false}, {"data": [0.0, 500, 1500, "SPOT TRADE"], "isController": true}, {"data": [0.5, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [0.5, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.0, 500, 1500, "AUTHENTICATOR"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 33, 0, 0.0, 926.8484848484849, 13, 3072, 796.0, 1910.6000000000013, 3012.4999999999995, 3072.0, 1.906412478336222, 8.434205300404392, 2.406033362218371], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Trade Data Candle Ticker", 3, 0, 0.0, 2781.3333333333335, 2285, 3072, 2987.0, 3072.0, 3072.0, 3072.0, 0.3025108399717657, 7.127025404608249, 0.48360375491580115], "isController": false}, {"data": ["Get Trade Detail Ticker Symbol", 3, 0, 0.0, 740.6666666666666, 597, 872, 753.0, 872.0, 872.0, 872.0, 0.409612233752048, 1.2572375494948116, 0.6328189001911524], "isController": false}, {"data": ["Get All Trade Ticker History", 3, 0, 0.0, 722.0, 643, 786, 737.0, 786.0, 786.0, 786.0, 0.39603960396039606, 1.8753867574257426, 0.6234529702970297], "isController": false}, {"data": ["Get Trade Depth Data Ticker", 3, 0, 0.0, 699.3333333333334, 576, 850, 672.0, 850.0, 850.0, 850.0, 0.40425818622827114, 0.26647878486726856, 0.626126448591834], "isController": false}, {"data": ["Send 2FA", 3, 0, 0.0, 14.333333333333334, 13, 17, 13.0, 17.0, 17.0, 17.0, 0.4425431479569258, 0.0, 0.0], "isController": false}, {"data": ["POST Favorite Ticker", 3, 0, 0.0, 796.3333333333334, 746, 838, 805.0, 838.0, 838.0, 838.0, 0.3908285565398645, 0.2198410630536738, 0.6156313102527358], "isController": false}, {"data": ["POST UnFavorite Ticker", 3, 0, 0.0, 662.3333333333334, 564, 796, 627.0, 796.0, 796.0, 796.0, 0.40010669511869834, 0.2258414743931715, 0.631027649039744], "isController": false}, {"data": ["Get Trade List Ticker", 3, 0, 0.0, 903.0, 800, 972, 937.0, 972.0, 972.0, 972.0, 0.40404040404040403, 4.626736111111112, 0.6253945707070707], "isController": false}, {"data": ["Get Favorite Ticker", 3, 0, 0.0, 711.3333333333334, 687, 738, 709.0, 738.0, 738.0, 738.0, 0.4181767493727349, 0.24951757213548925, 0.6489090378449958], "isController": false}, {"data": ["SPOT TRADE", 3, 0, 0.0, 8016.333333333333, 7188, 8548, 8313.0, 8548.0, 8548.0, 8548.0, 0.19981350739309978, 9.031219299487146, 2.501376319601705], "isController": true}, {"data": ["Post Request-code-login", 3, 0, 0.0, 917.0, 825, 1026, 900.0, 1026.0, 1026.0, 1026.0, 0.3899649031587157, 0.23953898836604706, 0.24372806447419734], "isController": false}, {"data": ["Post Authen", 3, 0, 0.0, 1247.6666666666667, 1053, 1349, 1341.0, 1349.0, 1349.0, 1349.0, 0.3838771593090211, 1.095149552143314, 0.2837841890595009], "isController": false}, {"data": ["AUTHENTICATOR", 3, 0, 0.0, 2179.0, 2092, 2266, 2179.0, 2266.0, 2266.0, 2266.0, 0.34250485215207216, 1.187506243578034, 0.46726492036762185], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 33, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
