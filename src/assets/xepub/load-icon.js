'use strict';

Array.from(document.querySelectorAll('.svg')).forEach((elem) => {

fetch('/xepub/svgs/' + elem.getAttribute('name') + '.svg')
.then((res) => res.text())
.then((res) => { elem.innerHTML = res; });

});