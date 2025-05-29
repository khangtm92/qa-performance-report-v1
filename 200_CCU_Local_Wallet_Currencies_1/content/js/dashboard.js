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

    var data = {"OkPercent": 99.13636363636364, "KoPercent": 0.8636363636363636};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.24115384615384616, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1775, 500, 1500, "Get Wallet Currencies Info"], "isController": false}, {"data": [0.2925, 500, 1500, "Get Wallet Withdraw Get Currencies"], "isController": false}, {"data": [0.255, 500, 1500, "Get Wallet Deposit Currencies"], "isController": false}, {"data": [0.605, 500, 1500, "Get Login page"], "isController": false}, {"data": [0.235, 500, 1500, "Get Wallet Balance Currency"], "isController": false}, {"data": [0.2975, 500, 1500, "Get Wallet Convert Currency2 Swap enable"], "isController": false}, {"data": [1.0, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.0825, 500, 1500, "Get Wallet Currencies"], "isController": false}, {"data": [0.0, 500, 1500, "WALLET"], "isController": true}, {"data": [0.175, 500, 1500, "Get Wallet Convert Currencies Swap Available"], "isController": false}, {"data": [0.015, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [0.0, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.0, 500, 1500, "AUTHENTICATOR"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2200, 19, 0.8636363636363636, 8306.676818181839, 0, 37005, 2057.5, 25224.8, 27108.85, 32156.649999999972, 18.324018623866202, 172.40246624632476, 21.077208929210983], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Wallet Currencies Info", 200, 1, 0.5, 9757.57, 62, 28442, 3788.5, 25631.6, 27025.199999999997, 28406.370000000003, 1.9997200391945127, 4.6844223058771775, 3.066660511278421], "isController": false}, {"data": ["Get Wallet Withdraw Get Currencies", 200, 3, 1.5, 4850.705, 478, 26815, 860.5, 22895.5, 25218.2, 26005.030000000002, 3.5507580868515425, 22.429851029054078, 5.417506735344246], "isController": false}, {"data": ["Get Wallet Deposit Currencies", 200, 3, 1.5, 5104.715, 529, 27688, 1355.0, 24408.300000000003, 25179.55, 27003.13, 3.225858481588413, 20.377486557242857, 4.918646621316473], "isController": false}, {"data": ["Get Login page", 200, 0, 0.0, 950.7100000000005, 178, 32915, 875.0, 1104.1000000000001, 1223.35, 1567.020000000001, 4.68230556726132, 351.1247684453575, 2.5332004729128625], "isController": false}, {"data": ["Get Wallet Balance Currency", 200, 3, 1.5, 6721.42, 470, 27822, 1982.0, 24369.0, 25413.799999999996, 27155.840000000004, 2.869522798358633, 1.754962593080146, 4.383728505480789], "isController": false}, {"data": ["Get Wallet Convert Currency2 Swap enable", 200, 3, 1.5, 4832.1050000000005, 471, 26839, 1230.5, 23922.3, 25220.899999999998, 26610.36, 2.921968822592663, 3.6427306437827807, 4.5237727274387485], "isController": false}, {"data": ["Send 2FA", 200, 0, 0.0, 0.7249999999999999, 0, 11, 1.0, 1.0, 1.0, 10.980000000000018, 3.759186512038795, 0.0, 0.0], "isController": false}, {"data": ["Get Wallet Currencies", 200, 0, 0.0, 16756.08, 552, 29943, 16566.5, 27326.4, 28023.0, 29226.220000000005, 2.243711997128049, 15.149438230608718, 3.4780822642980547], "isController": false}, {"data": ["WALLET", 200, 4, 2.0, 55901.79499999999, 12352, 110678, 56491.0, 79743.8, 87501.79999999999, 97944.93000000002, 1.7258786879870214, 43.2709051775282, 18.548898053424576], "isController": true}, {"data": ["Get Wallet Convert Currencies Swap Available", 200, 3, 1.5, 7879.199999999999, 489, 28023, 2480.5, 24907.7, 25602.4, 27628.61, 2.357990049281992, 3.5021448498549836, 3.6252945645381875], "isController": false}, {"data": ["Post Request-code-login", 200, 0, 0.0, 11475.389999999996, 701, 22807, 11877.5, 19461.8, 21120.15, 22730.340000000004, 3.710368625122906, 2.279122915236629, 2.3189260395989093], "isController": false}, {"data": ["Post Authen", 200, 3, 1.5, 23044.825000000008, 2759, 37005, 22359.0, 32550.4, 34389.0, 36744.42, 2.924917371084267, 8.24322550290298, 2.162225172021703], "isController": false}, {"data": ["AUTHENTICATOR", 200, 3, 1.5, 35471.65, 3949, 60297, 36332.0, 50660.5, 53865.5, 58472.37, 2.865575837464539, 224.72490751801732, 5.459621573845889], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected not to contain /&quot;error&quot;:true/", 18, 94.73684210526316, 0.8181818181818182], "isController": false}, {"data": ["502/Bad Gateway", 1, 5.2631578947368425, 0.045454545454545456], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2200, 19, "Test failed: text expected not to contain /&quot;error&quot;:true/", 18, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Wallet Currencies Info", 200, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Withdraw Get Currencies", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Deposit Currencies", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Wallet Balance Currency", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Convert Currency2 Swap enable", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Wallet Convert Currencies Swap Available", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Authen", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
