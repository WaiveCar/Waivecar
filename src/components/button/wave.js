module.exports = function (btn) {
  btn.addEventListener('click', function (event) {
    let self     = this;
    let rect     = this.getBoundingClientRect();
    let diameter = Math.max(rect.width, rect.height);
    let span     = this.querySelector('.wave');
    if (!span) {
      span              = document.createElement('span');
      span.className    = 'wave';
      span.style.height = diameter + 'px';
      span.style.width  = diameter + 'px';
      this.appendChild(span);
    }
    span.classList.remove('anim');
    span.style.left = event.clientX - rect.left - diameter / 2 + 'px';
    span.style.top  = event.clientY - rect.top - diameter / 2 + 'px';
    // span.classList.add('anim');
    setTimeout(function () {
      span.classList.add('anim');
    }, 0);
  });
}