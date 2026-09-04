(function () {
  var path = document.getElementById('wave-path');
  var dot = document.getElementById('wave-dot');
  if (!path) return;

  function cardiacCycle(x0, baseline) {
    var w = 130;
    return [
      'M' + x0 + ',' + baseline,
      'L' + (x0 + w * 0.18) + ',' + baseline,
      'L' + (x0 + w * 0.24) + ',' + (baseline - 14),
      'L' + (x0 + w * 0.30) + ',' + (baseline + 6),
      'L' + (x0 + w * 0.36) + ',' + (baseline - 70),
      'L' + (x0 + w * 0.42) + ',' + (baseline + 24),
      'L' + (x0 + w * 0.50) + ',' + baseline,
      'L' + (x0 + w * 0.66) + ',' + baseline,
      'C' + (x0 + w * 0.72) + ',' + baseline + ' ' + (x0 + w * 0.74) + ',' + (baseline - 34) + ' ' + (x0 + w * 0.82) + ',' + (baseline - 34),
      'C' + (x0 + w * 0.90) + ',' + (baseline - 34) + ' ' + (x0 + w * 0.92) + ',' + baseline + ' ' + (x0 + w) + ',' + baseline
    ].join(' ');
  }

  var baseline = 110;
  var d = '';
  for (var x = -20; x < 560; x += 130) {
    d += cardiacCycle(x, baseline) + ' ';
  }
  path.setAttribute('d', d.trim());

  var length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    path.style.strokeDashoffset = 0;
    if (dot) dot.style.display = 'none';
    return;
  }

  var duration = 2600;
  var start = null;

  function drawFrame(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var offset = length * (1 - progress);
    path.style.strokeDashoffset = offset;

    if (dot) {
      var point = path.getPointAtLength(length * progress);
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
    }

    if (progress < 1) {
      requestAnimationFrame(drawFrame);
    }
  }

  requestAnimationFrame(drawFrame);
})();
