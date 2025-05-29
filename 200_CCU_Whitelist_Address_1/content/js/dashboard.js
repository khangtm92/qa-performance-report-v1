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

    var data = {"OkPercent": 75.1923076923077, "KoPercent": 24.807692307692307};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3496666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1275, 500, 1500, "Get Whitelist Internal list"], "isController": false}, {"data": [0.055, 500, 1500, "Get Whitelist External list"], "isController": false}, {"data": [0.0325, 500, 1500, "POST Create a Whitelist Address Internal"], "isController": false}, {"data": [0.065, 500, 1500, "Delete Whitelist Internal"], "isController": false}, {"data": [0.989, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.01, 500, 1500, "POST Create a Whitelist Address External"], "isController": false}, {"data": [0.01, 500, 1500, "Delete Whitelist External"], "isController": false}, {"data": [0.0, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [0.0, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.0, 500, 1500, "AUTHENTICATOR"], "isController": true}, {"data": [0.0, 500, 1500, "WHITE LIST"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2600, 645, 24.807692307692307, 7164.458846153837, 0, 36113, 1765.5, 23240.6, 25826.499999999993, 31844.759999999995, 21.406576759044277, 12.64132971891518, 18.238614055373052], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Whitelist Internal list", 200, 0, 0.0, 6690.3399999999965, 510, 23580, 2400.5, 21574.600000000002, 22179.65, 23306.100000000002, 3.0393289161753083, 2.2931499224971126, 4.716213347592851], "isController": false}, {"data": ["Get Whitelist External list", 200, 0, 0.0, 12847.07, 890, 27271, 12630.0, 25441.2, 25944.6, 26731.050000000003, 2.6114092470001435, 3.1332830637053286, 4.052198194536932], "isController": false}, {"data": ["POST Create a Whitelist Address Internal", 200, 155, 77.5, 7949.245000000003, 564, 26318, 3360.5, 22064.5, 22886.249999999996, 23683.210000000003, 2.5300442757748263, 1.4295738456672993, 4.163133499367489], "isController": false}, {"data": ["Delete Whitelist Internal", 200, 149, 74.5, 6147.764999999998, 584, 23535, 2287.0, 20583.9, 21619.5, 23414.480000000003, 3.44050506614371, 1.9481355956804458, 5.522816999535531], "isController": false}, {"data": ["Send 2FA", 1000, 0, 0.0, 20.959000000000003, 0, 1653, 1.0, 1.0, 2.0, 1033.2800000000016, 8.436397995511836, 0.0, 0.0], "isController": false}, {"data": ["POST Create a Whitelist Address External", 200, 175, 87.5, 12745.199999999993, 1049, 29590, 15232.5, 25960.8, 27584.55, 28513.65, 2.7282524179137053, 1.5209874014418814, 4.782354729084535], "isController": false}, {"data": ["Delete Whitelist External", 200, 166, 83.0, 10360.024999999998, 92, 26630, 7006.5, 23078.4, 24226.75, 26065.72, 2.2019883955211554, 1.246058784832704, 3.533815058435267], "isController": false}, {"data": ["Post Request-code-login", 200, 0, 0.0, 12346.634999999998, 1917, 24797, 12590.0, 21341.7, 23096.599999999988, 24527.670000000002, 5.854972335255716, 3.5964624989021927, 3.6592719433385055], "isController": false}, {"data": ["Post Authen", 200, 0, 0.0, 23946.890000000003, 1857, 36113, 25012.0, 33776.700000000004, 34809.8, 36017.83, 3.094011540663047, 8.829414574341362, 2.287226880965641], "isController": false}, {"data": ["AUTHENTICATOR", 200, 0, 0.0, 36395.93, 16539, 59339, 37615.0, 50664.00000000001, 54460.75, 58952.82000000001, 2.9134557955919416, 10.103773653619239, 3.9746194753594475], "isController": true}, {"data": ["WHITE LIST", 200, 199, 99.5, 56742.03999999999, 12247, 94266, 56638.5, 76972.40000000001, 88044.34999999999, 93177.92, 1.9067958203035618, 8.025673813972999, 18.518609209942987], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected not to contain /&quot;error&quot;:true/", 644, 99.84496124031008, 24.76923076923077], "isController": false}, {"data": ["502/Bad Gateway", 1, 0.15503875968992248, 0.038461538461538464], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2600, 645, "Test failed: text expected not to contain /&quot;error&quot;:true/", 644, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Create a Whitelist Address Internal", 200, 155, "Test failed: text expected not to contain /&quot;error&quot;:true/", 155, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Whitelist Internal", 200, 149, "Test failed: text expected not to contain /&quot;error&quot;:true/", 149, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Create a Whitelist Address External", 200, 175, "Test failed: text expected not to contain /&quot;error&quot;:true/", 175, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Whitelist External", 200, 166, "Test failed: text expected not to contain /&quot;error&quot;:true/", 165, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
