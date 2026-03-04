window.MAPBOX_TOKEN = "pk.eyJ1IjoiZGVmZmllIiwiYSI6ImNtZTl1MTBvcjBvZGkyanFhdmwydHp0aTUifQ.vACEuAMjlPb7JoRrNbtKQg";
/* ========= HERO BACKGROUND CAROUSEL ========= */
(function heroCarousel(){
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  if (!slides.length) return;

  let idx = 0;
  const intervalMs = 3800;
  let timer = null;

  function setActive(nextIdx){
    idx = (nextIdx + slides.length) % slides.length;
    slides.forEach((el,i)=> el.classList.toggle("is-active", i===idx));
    dots.forEach((el,i)=> el.classList.toggle("is-active", i===idx));
  }

  function start(){
    stop();
    timer = setInterval(()=> setActive(idx+1), intervalMs);
  }
  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
  }

  dots.forEach((d,i)=>{
    d.addEventListener("click", ()=>{
      setActive(i);
      start();
    });
  });

  // pause when tab not visible
  document.addEventListener("visibilitychange", ()=>{
    if (document.hidden) stop();
    else start();
  });

  setActive(0);
  start();
})();

/* ========= PIE CHART (SVG arcs + hover tooltip) ========= */
(function modalSharePie(){
  const svg = document.getElementById("modalPie");
  if (!svg) return;

  const labelEl = document.getElementById("pieLabel");
  const valueEl = document.getElementById("pieValue");
  const tip = document.getElementById("pieTooltip");

  // Order matters (looks nicer if biggest first)
  const data = [
    { name:"Motorcycles", value:74, color:"#2f6bff" },
    { name:"Active Mobility", value:19, color:"#ffb020" },
    { name:"Public Transport", value:4, color:"#28c76f" },
    { name:"Private Cars", value:1, color:"#ff4d4d" },
    { name:"Other", value:2, color:"#a96bff" },
  ];

  const cx = 120, cy = 120;
  const rOuter = 92;
  const rInner = 54;

  function polarToCartesian(cx, cy, r, angleDeg){
    const rad = (angleDeg - 90) * Math.PI / 180.0;
    return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
  }

  function arcPath(startAngle, endAngle){
    const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
    const endOuter   = polarToCartesian(cx, cy, rOuter, startAngle);
    const startInner = polarToCartesian(cx, cy, rInner, startAngle);
    const endInner   = polarToCartesian(cx, cy, rInner, endAngle);

    const largeArc = (endAngle - startAngle) <= 180 ? 0 : 1;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
      "Z"
    ].join(" ");
  }

  // Clear
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Background ring (subtle)
  const ring = document.createElementNS("http://www.w3.org/2000/svg","circle");
  ring.setAttribute("cx", cx); ring.setAttribute("cy", cy);
  ring.setAttribute("r", (rOuter + rInner)/2);
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", "rgba(255,255,255,.10)");
  ring.setAttribute("stroke-width", (rOuter - rInner));
  svg.appendChild(ring);

  let angle = 0;
  const total = data.reduce((s,d)=>s+d.value,0);

  data.forEach((d)=>{
    const slice = (d.value / total) * 360;
    const start = angle;
    const end = angle + slice;

    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d", arcPath(start, end));
    path.setAttribute("fill", d.color);
    path.setAttribute("opacity", "0.92");
    path.style.cursor = "pointer";
    path.style.transition = "transform 120ms ease, opacity 120ms ease";
    path.dataset.name = d.name;
    path.dataset.value = `${d.value}%`;

    // hover interactions
    path.addEventListener("mousemove", (e)=>{
      labelEl.textContent = d.name;
      valueEl.textContent = `${d.value}%`;

      tip.textContent = `${d.name} — ${d.value}%`;
      tip.classList.add("is-on");

      // tooltip position relative to container
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top + 12;
      tip.style.left = `${x}px`;
      tip.style.top  = `${y}px`;
    });

    path.addEventListener("mouseenter", ()=>{
      path.style.opacity = "1";
      path.style.transform = "scale(1.01)";
    });

    path.addEventListener("mouseleave", ()=>{
      path.style.opacity = "0.92";
      path.style.transform = "scale(1)";
      tip.classList.remove("is-on");
    });

    svg.appendChild(path);
    angle += slice;
  });

  // Default state
  labelEl.textContent = "—";
  valueEl.textContent = "—";
})();