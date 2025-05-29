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

    var data = {"OkPercent": 98.91666666666667, "KoPercent": 1.0833333333333333};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.21125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2425, 500, 1500, "Get Wallet Convert Curreny2 Swap enable"], "isController": false}, {"data": [0.255, 500, 1500, "POST Convert Create"], "isController": false}, {"data": [0.0, 500, 1500, "WALLET"], "isController": true}, {"data": [1.0, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.1725, 500, 1500, "Get Wallet Convert Currencies Swap Available"], "isController": false}, {"data": [0.02, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [0.0, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.0, 500, 1500, "AUTHENTICATOR"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1200, 13, 1.0833333333333333, 10531.005833333345, 0, 35808, 9661.0, 25323.600000000002, 28021.200000000004, 32290.300000000007, 13.871870159295309, 16.13836531208818, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Wallet Convert Curreny2 Swap enable", 200, 3, 1.5, 9280.445, 470, 28942, 5376.5, 24569.7, 26247.1, 28389.99000000001, 2.772118036786006, 3.423484561035109, 0.0], "isController": false}, {"data": ["POST Convert Create", 200, 4, 2.0, 7409.684999999999, 72, 28735, 1192.5, 22088.5, 24584.3, 27325.48, 3.4834102586432114, 2.9960389815379256, 0.0], "isController": false}, {"data": ["WALLET", 200, 4, 2.0, 28984.915, 1862, 62954, 27813.0, 48554.600000000006, 53250.1, 61925.66, 2.429277654289497, 8.675700163368923, 0.0], "isController": true}, {"data": ["Send 2FA", 200, 0, 0.0, 0.6800000000000002, 0, 11, 1.0, 1.0, 1.0, 9.980000000000018, 5.9522038034582305, 0.0, 0.0], "isController": false}, {"data": ["Get Wallet Convert Currencies Swap Available", 200, 3, 1.5, 12294.785000000002, 518, 29615, 14337.5, 24999.7, 26417.8, 28768.58, 2.4769335562573533, 3.6498123916341565, 0.0], "isController": false}, {"data": ["Post Request-code-login", 200, 0, 0.0, 11455.319999999994, 637, 24703, 12328.5, 19466.7, 20933.6, 23800.39000000001, 5.8132775258690845, 3.508403819323334, 0.0], "isController": false}, {"data": ["Post Authen", 200, 3, 1.5, 22745.120000000006, 3364, 35808, 23377.0, 30805.4, 33295.95, 35678.47000000001, 2.9200916908790937, 8.20029616117446, 0.0], "isController": false}, {"data": ["AUTHENTICATOR", 200, 3, 1.5, 34201.12, 4070, 59501, 36120.5, 48452.1, 51254.7, 55543.990000000005, 2.8858363153641924, 9.845746412544731, 0.0], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected not to contain /&quot;error&quot;:true/", 12, 92.3076923076923, 1.0], "isController": false}, {"data": ["502/Bad Gateway", 1, 7.6923076923076925, 0.08333333333333333], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1200, 13, "Test failed: text expected not to contain /&quot;error&quot;:true/", 12, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Wallet Convert Curreny2 Swap enable", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Convert Create", 200, 4, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Wallet Convert Currencies Swap Available", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Authen", 200, 3, "Test failed: text expected not to contain /&quot;error&quot;:true/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
