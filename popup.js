var url_id = "";
var url_prefix = "https://bscscan.com/token/";

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
  console.log("++++ "+matches+" ++++");
}

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

    // Match
    if (tab_coin) {
      console.log("--- tab id : "+tab_coin.id+" ---");

      // Dump page MHTML that contains the table we want (since the JS from the page created it when the page loaded)
      // then convert it to text by downloading it from the object URL before forwarding it to the parsing function
      chrome.pageCapture.saveAsMHTML({tabId: tab_coin.id}, function(mhtmlData) {
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
  });
});

