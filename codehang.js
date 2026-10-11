/* ===== Code section: the code card hangs from a lanyard like an ID card =====
   Spring/pendulum physics in plain JS. It swings in when scrolled into view,
   swings when the pointer brushes the strap, and can be dragged by the clip. */
function CodeHang({children}){
  let ref=mo.useRef(null),st=mo.useRef({a:0,w:0,drag:false,last:0,raf:0,x0:0,px:0,kick:()=>{}});
  mo.useEffect(()=>{
    let el=ref.current,s=st.current;if(!el)return;
    if(_e()){s.kick=()=>{};return}
    let step=now=>{
      let dt=Math.min(.033,(now-s.last)/1e3||.016);s.last=now;
      if(!s.drag){s.w+=(-26*s.a-1.9*s.w)*dt;s.a+=s.w*dt}
      el.style.transform="rotate("+s.a+"rad)";
      if(!s.drag&&Math.abs(s.a)<4e-4&&Math.abs(s.w)<2e-3){s.a=0;s.w=0;el.style.transform="";s.raf=0;return}
      s.raf=requestAnimationFrame(step)};
    s.kick=v=>{s.w=Math.max(-.45,Math.min(.45,s.w+v));if(!s.raf){s.last=performance.now();s.raf=requestAnimationFrame(step)}};
    let io=new IntersectionObserver(es=>{if(es[0].isIntersecting){s.kick(.42);io.disconnect()}},{threshold:.3});
    io.observe(el);
    return()=>{io.disconnect();cancelAnimationFrame(s.raf)}},[]);
  let s=st.current;
  let onMove=e=>{
    if(s.drag){s.a=Math.max(-.12,Math.min(.12,(e.clientX-s.x0)/700));s.w=0;return}
    let dx=e.clientX-s.px;s.px=e.clientX;if(Math.abs(dx)>1)s.kick(dx*.0016)};
  let onDown=e=>{s.drag=true;s.x0=e.clientX;e.currentTarget.setPointerCapture&&e.currentTarget.setPointerCapture(e.pointerId);s.kick(0)};
  let onUp=()=>{s.drag=false;s.kick(0)};
  return(0,pt.jsx)("div",{className:"lanyard",children:(0,pt.jsxs)("div",{ref:ref,className:"lan-swing",children:[
    (0,pt.jsxs)("div",{className:"lan-handle",onPointerMove:onMove,onPointerDown:onDown,onPointerUp:onUp,onPointerCancel:onUp,children:[
      (0,pt.jsxs)("svg",{className:"lan-strap",viewBox:"0 0 1000 90",preserveAspectRatio:"none","aria-hidden":"true",children:[
        (0,pt.jsx)("path",{d:"M170 0L500 84",className:"lan-line"}),
        (0,pt.jsx)("path",{d:"M830 0L500 84",className:"lan-line"})]}),
      (0,pt.jsx)("div",{className:"lan-clip"})]}),
    children]})})
}
