(function () {
  "use strict";

  /* ── helpers ─────────────────────────────────────────── */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* ── setup a single canvas ──────────────────────────── */
  function initCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: rect.width, h: rect.height };
  }

  /* ── draw one organic tree ──────────────────────────── */
  function drawTree(ctx, startX, startY, angle, depth, maxDepth, branchLen, thickness, drift) {
    if (depth > maxDepth || branchLen < 2) return;

    var endX = startX + Math.cos(angle) * branchLen;
    var endY = startY + Math.sin(angle) * branchLen;

    /* colour fades from brown trunk to soft green leaves */
    var t = depth / maxDepth;
    var r = Math.round(90 + (45 * t));
    var g = Math.round(70 + (110 * t));
    var b = Math.round(50 - (10 * t));
    var alpha = 0.85 - t * 0.35;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    /* slight curve via a control point for organic feel */
    var cpX = (startX + endX) / 2 + rand(-drift, drift);
    var cpY = (startY + endY) / 2 + rand(-drift, drift);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);

    ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.stroke();

    /* leaves — small circles at tips */
    if (depth >= maxDepth - 1) {
      var leafSize = rand(1.5, 4);
      ctx.beginPath();
      ctx.arc(endX, endY, leafSize, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45,106,79," + rand(0.12, 0.3) + ")";
      ctx.fill();
    }

    /* recurse into branches */
    var branches = depth < 3 ? Math.floor(rand(2, 4)) : Math.floor(rand(1, 3));
    for (var i = 0; i < branches; i++) {
      var spread = rand(0.25, 0.55);
      var newAngle = angle + rand(-spread, spread);
      var shrink = rand(0.62, 0.78);
      drawTree(
        ctx,
        endX,
        endY,
        newAngle,
        depth + 1,
        maxDepth,
        branchLen * shrink,
        Math.max(thickness * 0.65, 0.5),
        drift * 0.75
      );
    }
  }

  /* ── compose a full side panel ─────────────────────── */
  function drawPanel(canvas, side) {
    var info = initCanvas(canvas);
    var ctx = info.ctx;
    var w = info.w;
    var h = info.h;

    ctx.clearRect(0, 0, w, h);

    /* draw several trees from the bottom */
    var treeCount = Math.floor(rand(3, 6));
    for (var i = 0; i < treeCount; i++) {
      var baseX;
      if (side === "left") {
        baseX = rand(w * 0.1, w * 0.85);
      } else {
        baseX = rand(w * 0.15, w * 0.9);
      }
      var baseY = h + rand(0, 15);

      /* trees grow upward → angle ~ -PI/2 */
      var angle = -Math.PI / 2 + rand(-0.2, 0.2);
      var maxDepth = Math.floor(rand(7, 11));
      var branchLen = rand(h * 0.06, h * 0.12);
      var thickness = rand(2.5, 5);
      var drift = rand(3, 8);

      drawTree(ctx, baseX, baseY, angle, 0, maxDepth, branchLen, thickness, drift);
    }

    /* optional: a few small ground shrubs */
    for (var j = 0; j < 8; j++) {
      var sx = rand(0, w);
      var sy = h - rand(0, 30);
      var sAngle = -Math.PI / 2 + rand(-0.5, 0.5);
      drawTree(ctx, sx, sy, sAngle, 5, Math.floor(rand(7, 9)), rand(8, 18), rand(0.8, 1.5), 3);
    }
  }

  /* ── kick off ──────────────────────────────────────── */
  function paint() {
    var left = document.getElementById("tree-left");
    var right = document.getElementById("tree-right");
    if (left) drawPanel(left, "left");
    if (right) drawPanel(right, "right");
  }

  /* initial draw + redraw on resize */
  paint();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(paint, 200);
  });
})();
