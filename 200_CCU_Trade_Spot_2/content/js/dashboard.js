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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.209, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.025, 500, 1500, "Get Trade History Ticker"], "isController": false}, {"data": [0.0775, 500, 1500, "POST Create Trade Order Sell"], "isController": false}, {"data": [0.87, 500, 1500, "Get Login page"], "isController": false}, {"data": [0.9575, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.1575, 500, 1500, "POST Create Trade Order Buy"], "isController": false}, {"data": [0.0, 500, 1500, "Get Trade Order History"], "isController": false}, {"data": [0.0, 500, 1500, "SPOT TRADE"], "isController": true}, {"data": [0.0, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [0.0025, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.0, 500, 1500, "AUTHENTICATOR"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1600, 0, 0.0, 12675.32624999999, 0, 59892, 6462.5, 35424.600000000006, 45101.1, 55506.32, 13.096183281085018, 164.8287354304961, 13.529370876748544], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Trade History Ticker", 200, 0, 0.0, 27624.540000000008, 751, 59892, 22646.5, 54914.5, 56389.9, 59807.35000000001, 2.2190908384834733, 19.678795702869284, 3.449992787954775], "isController": false}, {"data": ["POST Create Trade Order Sell", 200, 0, 0.0, 6986.409999999999, 669, 19320, 4866.5, 16543.6, 17174.0, 19107.40000000001, 2.556629339878304, 1.445594128700721, 4.15701938564197], "isController": false}, {"data": ["Get Login page", 200, 0, 0.0, 491.9250000000002, 169, 2814, 218.0, 1467.8, 2594.25, 2804.59, 20.701790704895974, 1552.5691043564332, 11.199992236828486], "isController": false}, {"data": ["Send 2FA", 200, 0, 0.0, 97.92499999999998, 0, 1860, 1.0, 135.30000000000084, 1037.6499999999992, 1851.2700000000016, 7.256367462448298, 0.0, 0.0], "isController": false}, {"data": ["POST Create Trade Order Buy", 200, 0, 0.0, 3344.094999999999, 893, 19042, 2562.0, 5837.3, 7123.099999999997, 12201.82000000001, 2.4321727815544016, 1.375222695820311, 3.9451552638299425], "isController": false}, {"data": ["Get Trade Order History", 200, 0, 0.0, 30329.06499999997, 2902, 54623, 31724.0, 46829.9, 50026.15, 54173.44000000001, 2.2170245313764396, 27.10189081015619, 3.4511104521621534], "isController": false}, {"data": ["SPOT TRADE", 200, 0, 0.0, 68284.10999999999, 7710, 91553, 68541.5, 81611.1, 83181.2, 87344.14, 1.8460402436773122, 41.025026464717556, 11.739662174635408], "isController": true}, {"data": ["Post Request-code-login", 200, 0, 0.0, 10335.865000000005, 1589, 21189, 11194.5, 16557.100000000002, 17184.7, 19225.510000000006, 6.849549642111031, 4.2073893797732795, 4.280868191119558], "isController": false}, {"data": ["Post Authen", 200, 0, 0.0, 22192.784999999996, 1122, 31587, 22771.0, 26423.0, 27184.649999999998, 30120.79000000001, 3.889915394340173, 11.100808069143246, 2.875593364047457], "isController": false}, {"data": ["AUTHENTICATOR", 200, 0, 0.0, 33118.500000000015, 12887, 48122, 34354.0, 42864.1, 44120.3, 46138.23, 3.5760902605181757, 280.59738098883366, 6.813325015198384], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1600, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
