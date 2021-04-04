var url_id = "";
var url_prefix = "https://bscscan.com/token/";
var url_stored = null;

// Get stored URL
chrome.storage.local.get(['url_coin'], function(result) {
  if(result.url_coin) {
    console.log("--- url retrieved : "+result.url_coin+" ---");
    url_stored = result.url_coin;

    // Replace URL in refresh button
    var regex = /\(.*\)/g;
    document.getElementById("refresh").innerHTML = document.getElementById("refresh").innerHTML.replace(regex, "("+url_stored.substring(url_prefix.length)+")");
  }
});

// Callback that takes page dump and extracts time info from it
function parse_page_data(page_data) {
  // The info we want is in a chunk of HTML that looks like this :
  //    data-original-title=3D"2021-04-03 17:25:15">17 mins ago</span>
  // Extract pattern between "2021-04-03 17:25:15">" and " ago<"
  // Yes, it's ugly. Fuck you.
  var regex = /[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}">(.*?)\ ago</g;
  var matches = [];
  while (m = regex.exec(page_data)) {
    matches.push(m[1]);
  }
  console.log("--- age points : "+matches+" ---");
}

// Callback that dumps the page's MHTML that contains the table we want
// (since the JS from the page created it when the page loaded)
// then converts it to text by downloading it from the object URL before forwarding it to the parsing function
function capture_page_data(tab_id) {
  console.log("--- tab id : "+tab_id+" ---");
  chrome.pageCapture.saveAsMHTML({tabId: tab_id}, function(mhtmlData) {
    var blob_url = window.webkitURL.createObjectURL(mhtmlData);
    // DEBUG :
    // window.open(blob_url);
    var page_data;
    fetch(blob_url).then(response => response.text())
                   .then(data => page_data = data)
                   .then(function () {
                     // Remove line feeds added when converting MHTML blob ("=\n")
                     page_data = page_data.replace(/=\r?\n|\r/g, "")
                     console.log("--- page data dump : "+page_data+" ---");
                     // Call to parsing function
                     parse_page_data(page_data);
                   });
  });
}

// Get tab list from foreground window and search for the tab that matches the url
// if no match, open the tab ourselves
function get_page(url) {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    var tab_coin = null;
    var found = false;
    for(let [i, tab] of tabs.entries()) {
        if(tab.url == url) {
          console.log("--- found tab at index : "+tab.index+" ---");
          tab_coin = tab;
          break;
        }
    }

    // Match
    if (tab_coin) {
      // Reload tab and calls page capture callback when it's done
      chrome.tabs.reload(tab_coin.id, capture_page_data(tab_coin.id));
    }
    // No match
    else {
      // Open tab and calls page capture callback when it's done
      chrome.tabs.create({ url: url }, function(tab) { capture_page_data(tab.id) });
    }
  });
}

// Callback for "submit" button
document.getElementById('submit').addEventListener('click', function(){
  url_id = document.getElementById('url_id').value;
  url_stored = url_prefix+url_id;
  console.log("--- url "+url_stored+" ---");

  // Store URL
  chrome.storage.local.set({url_coin: url_stored}, function() {
    console.log("--- url stored : "+url_stored+" ---");
    // Replace URL in refresh button
    var regex = /\(.*\)/g;
    document.getElementById("refresh").innerHTML = document.getElementById("refresh").innerHTML.replace(regex, "("+url_id+")");
  });

  get_page(url_stored);
});

// Callback for "refresh" button
document.getElementById('refresh').addEventListener('click', function(){
  if(url_stored) {
    get_page(url_stored);
  }
});
