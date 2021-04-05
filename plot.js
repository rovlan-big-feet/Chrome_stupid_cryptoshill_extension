let xs = undefined;
let vals = undefined;

// Get querystring params array
var params = window.location.search.slice(1).split("&");

// If no params
if (params.length != 1) {
  // Placeholder
  xs = [1,2,3,4,5];
  vals = [1,2,3,4,5];
// Else
} else {
  // Retrieve y values and build x values
  xs = JSON.parse(decodeURIComponent(params[0]));
  vals = [];
  for(let i = 0; i < xs.length; i++){
    vals[i] = i+1;
  }
}

let data = [
  vals,
  xs
];

const opts = {
  width: 600,
  height: 200,
  title: "Time",
  scales: {
    x: {
      time: false,
    },
    y: {
      time: false,
    },
  },
  series: [
    {
      label: "Point number"
    },
    {
      label: "Time in secs",
      stroke: "blue",
      fill: "rgba(0,0,255,0.1)",
    },
  ],
};

let u = new uPlot(opts, data, document.body);
