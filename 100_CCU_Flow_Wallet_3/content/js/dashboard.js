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

    var data = {"OkPercent": 52.08, "KoPercent": 47.92};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.305, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.185, 500, 1500, "Get Wallet Assets"], "isController": false}, {"data": [0.19, 500, 1500, "POST Convert Create"], "isController": false}, {"data": [0.19, 500, 1500, "Get Whitelist-internal list"], "isController": false}, {"data": [0.185, 500, 1500, "Get Wallet Withdraw Get Currencies"], "isController": false}, {"data": [0.18, 500, 1500, "Get Wallet Deposit Currencies"], "isController": false}, {"data": [0.2, 500, 1500, "Get Wallet Deposit Blockchain support"], "isController": false}, {"data": [0.505, 500, 1500, "Get Wallet Currencies"], "isController": false}, {"data": [0.205, 500, 1500, "Get Wallet Convert Curreny2 Swap enable"], "isController": false}, {"data": [0.21, 500, 1500, "Get Wallet Deposit Address"], "isController": false}, {"data": [0.0, 500, 1500, "WALLET"], "isController": true}, {"data": [0.57, 500, 1500, "Get Wallet Blockchains"], "isController": false}, {"data": [0.18, 500, 1500, "Get Wallet Transactions"], "isController": false}, {"data": [0.52, 500, 1500, "Post Request-code-login"], "isController": false}, {"data": [1.0, 500, 1500, "Send 2FA"], "isController": false}, {"data": [0.2, 500, 1500, "Get Wallet Balance Curreny"], "isController": false}, {"data": [0.2, 500, 1500, "Get Wallet Withdraw Blockchain suport"], "isController": false}, {"data": [0.185, 500, 1500, "Get Wallet Withdraw List"], "isController": false}, {"data": [0.185, 500, 1500, "POST Wallet withdraw create"], "isController": false}, {"data": [0.19, 500, 1500, "POST Wallet transfer create"], "isController": false}, {"data": [0.195, 500, 1500, "Get Wallet Convert Currencies Swap Available"], "isController": false}, {"data": [0.2, 500, 1500, "Get Whitelist-external list"], "isController": false}, {"data": [0.19, 500, 1500, "Get Wallet Deposit Lits"], "isController": false}, {"data": [0.205, 500, 1500, "Get Customer Profile"], "isController": false}, {"data": [0.155, 500, 1500, "Post Authen"], "isController": false}, {"data": [0.01, 500, 1500, "AUTHENTICATOR"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2500, 1198, 47.92, 614.4103999999991, 0, 5678, 643.0, 870.0, 978.8999999999996, 1287.9799999999996, 15.300626713670193, 20.552333737652393, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Wallet Assets", 100, 63, 63.0, 689.7600000000001, 435, 1112, 667.0, 899.4000000000001, 959.6999999999999, 1111.93, 0.661261952309788, 0.907575571908931, 0.0], "isController": false}, {"data": ["POST Convert Create", 100, 63, 63.0, 670.8399999999999, 419, 1124, 649.0, 869.0000000000002, 951.4499999999996, 1123.5199999999998, 0.669429177740141, 0.45468884931818637, 0.0], "isController": false}, {"data": ["Get Whitelist-internal list", 100, 63, 63.0, 700.62, 426, 3478, 658.5, 913.1000000000003, 984.5999999999999, 3454.949999999988, 0.6680026720106881, 0.45593791750167006, 0.0], "isController": false}, {"data": ["Get Wallet Withdraw Get Currencies", 100, 63, 63.0, 715.7999999999997, 428, 1279, 678.0, 962.6000000000004, 1090.1999999999996, 1278.4999999999998, 0.6654865372073523, 1.8106497914531565, 0.0], "isController": false}, {"data": ["Get Wallet Deposit Currencies", 100, 63, 63.0, 722.6699999999998, 418, 4213, 673.5, 885.1, 988.5999999999999, 4183.749999999985, 0.6635259770420012, 1.8053155169696768, 0.0], "isController": false}, {"data": ["Get Wallet Deposit Blockchain support", 100, 64, 64.0, 654.2500000000002, 417, 1191, 649.0, 841.0000000000002, 947.4499999999998, 1188.959999999999, 0.6634247311471276, 0.3976725920170102, 0.0], "isController": false}, {"data": ["Get Wallet Currencies", 100, 0, 0.0, 704.2500000000002, 481, 1103, 691.0, 883.3000000000001, 939.7499999999998, 1102.1799999999996, 0.6623218354262703, 4.459689747754728, 0.0], "isController": false}, {"data": ["Get Wallet Convert Curreny2 Swap enable", 100, 63, 63.0, 660.4400000000002, 424, 1328, 655.0, 832.8000000000001, 891.5999999999999, 1326.3199999999993, 0.662712482189602, 0.5426023165943206, 0.0], "isController": false}, {"data": ["Get Wallet Deposit Address", 100, 63, 63.0, 651.4799999999999, 437, 1310, 643.5, 825.7, 906.0999999999998, 1308.1999999999991, 0.6635656034133816, 0.3828980895946278, 0.0], "isController": false}, {"data": ["WALLET", 100, 64, 64.0, 13751.310000000003, 11076, 21490, 13371.5, 15767.3, 17390.299999999992, 21455.13999999998, 0.6178216843054757, 19.512244743109743, 0.0], "isController": true}, {"data": ["Get Wallet Blockchains", 100, 0, 0.0, 728.2400000000002, 420, 5678, 631.0, 848.4000000000001, 980.95, 5664.819999999993, 0.6617257808364214, 0.6662492969163578, 0.0], "isController": false}, {"data": ["Get Wallet Transactions", 100, 63, 63.0, 728.21, 442, 1544, 686.5, 927.2000000000002, 1041.1499999999999, 1541.3899999999987, 0.6617783307303385, 2.0872643655531142, 0.0], "isController": false}, {"data": ["Post Request-code-login", 100, 0, 0.0, 718.82, 482, 1069, 714.0, 919.2000000000002, 992.0999999999998, 1068.82, 0.6602621240632531, 0.3984785084678617, 0.0], "isController": false}, {"data": ["Send 2FA", 300, 0, 0.0, 0.6200000000000007, 0, 11, 1.0, 1.0, 1.0, 8.930000000000064, 1.8557695876479976, 0.0, 0.0], "isController": false}, {"data": ["Get Wallet Balance Curreny", 100, 63, 63.0, 658.0, 99, 1290, 641.5, 844.5000000000001, 1028.8499999999988, 1289.5899999999997, 0.6623086755813414, 0.38226335297078556, 0.0], "isController": false}, {"data": ["Get Wallet Withdraw Blockchain suport", 100, 63, 63.0, 683.29, 418, 5677, 624.0, 778.6, 873.4499999999998, 5630.2999999999765, 0.6675834813143383, 0.4230223569535495, 0.0], "isController": false}, {"data": ["Get Wallet Withdraw List", 100, 63, 63.0, 766.0599999999998, 427, 5639, 698.5, 942.5, 1191.7999999999981, 5595.709999999978, 0.6661160107644347, 2.4137663385767767, 0.0], "isController": false}, {"data": ["POST Wallet withdraw create", 100, 63, 63.0, 702.05, 416, 3801, 658.0, 849.8, 960.7499999999993, 3775.409999999987, 0.6689500160548003, 0.5862262460030236, 0.0], "isController": false}, {"data": ["POST Wallet transfer create", 100, 63, 63.0, 660.67, 421, 1024, 646.5, 856.5000000000001, 914.7999999999997, 1023.1199999999995, 0.6691514490474629, 0.547475667980434, 0.0], "isController": false}, {"data": ["Get Wallet Convert Currencies Swap Available", 100, 63, 63.0, 680.4699999999998, 453, 1093, 670.0, 880.2, 943.3999999999999, 1091.9299999999994, 0.6617038875103392, 0.6010713916459884, 0.0], "isController": false}, {"data": ["Get Whitelist-external list", 100, 63, 63.0, 664.7200000000003, 435, 1227, 637.5, 878.0000000000002, 991.0499999999995, 1226.5299999999997, 0.6676235938178054, 0.4556791818272858, 0.0], "isController": false}, {"data": ["Get Wallet Deposit Lits", 100, 63, 63.0, 662.17, 421, 1158, 668.0, 791.9, 884.2499999999998, 1156.279999999999, 0.6625412431923887, 1.078848774547153, 0.0], "isController": false}, {"data": ["Get Customer Profile", 100, 63, 63.0, 646.2299999999996, 426, 1229, 644.0, 774.7, 898.9499999999998, 1227.5599999999993, 0.6620368224880667, 0.5017256403551166, 0.0], "isController": false}, {"data": ["Post Authen", 100, 63, 63.0, 889.36, 496, 1819, 783.0, 1313.6, 1555.1999999999994, 1818.0099999999995, 0.6602010972542237, 0.9282079274472005, 0.0], "isController": false}, {"data": ["AUTHENTICATOR", 100, 63, 63.0, 1608.9500000000005, 1012, 2609, 1558.0, 2066.3, 2273.3999999999996, 2608.8199999999997, 0.6572979794660112, 1.3208158978197426, 0.0], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected not to contain /&quot;error&quot;:true/", 1196, 99.8330550918197, 47.84], "isController": false}, {"data": ["502/Bad Gateway", 2, 0.1669449081803005, 0.08], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2500, 1198, "Test failed: text expected not to contain /&quot;error&quot;:true/", 1196, "502/Bad Gateway", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Wallet Assets", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Convert Create", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Whitelist-internal list", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Withdraw Get Currencies", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Deposit Currencies", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Deposit Blockchain support", 100, 64, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Wallet Convert Curreny2 Swap enable", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Deposit Address", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Wallet Transactions", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Wallet Balance Curreny", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 62, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Withdraw Blockchain suport", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Withdraw List", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Wallet withdraw create", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Wallet transfer create", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Convert Currencies Swap Available", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Whitelist-external list", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Wallet Deposit Lits", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Customer Profile", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Post Authen", 100, 63, "Test failed: text expected not to contain /&quot;error&quot;:true/", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
