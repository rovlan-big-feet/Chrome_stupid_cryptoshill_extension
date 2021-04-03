var url_id = "";
var url_prefix = "https://bscscan.com/token/";

// Callback for "submit" button
document.getElementById('submit').addEventListener('click', function(){
  url_id = document.getElementById('url_id').value;
  var url = url_prefix+url_id;
  console.log("--- url "+url+" ---");

  // Get tab list from foreground window and search for the tab that matches the url
  // if no match, open the tab ourselves
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

    if (tab_coin) {
      console.log("--- tab id : "+tab_coin.id+" ---");

      chrome.pageCapture.saveAsMHTML({tabId: tab_coin.id}, function(mhtmlData) {
        var blob_url = window.webkitURL.createObjectURL(mhtmlData);
        var page_data;
        fetch(blob_url).then(response => response.text())
                       .then(data => page_data = data)
                       .then(function () { console.log("--- "+page_data+" ---"); });
      });
    }
  });
});

