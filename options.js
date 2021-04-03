
'use strict';

let page = document.getElementById('buttonDiv');
const buttonOptions = [];
function constructOptions(buttonOptions) {
  for (let item of buttonOptions) {
    let button = document.createElement('button');
    button.addEventListener('click', function() {
    //TODO
    });
    page.appendChild(button);
  }
}
constructOptions(buttonOptions);
