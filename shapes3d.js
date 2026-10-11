/* ===== Shapes section: Three.js scene (replaces the old SVG cards) =====
   Draws a circle, square and triangle as 3D glowing outlines. A pen traces
   each one in turn. Moving the pointer over the stage tilts the scene.
   Uses the global THREE (three.js r128 from cdnjs). */
function Kv(){
  let box=aa.useRef(null),cnv=aa.useRef(null),ctl=aa.useRef({}),[act,setAct]=aa.useState(-1);
  aa.useEffect(()=>{
    let T=window.THREE,host=box.current,canvas=cnv.current;
    if(!T||!host||!canvas)return;
    let rd;try{rd=new T.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(e){return}
    rd.setPixelRatio(Math.min(window.devicePixelRatio||1,2));rd.setClearColor(0,0);
    let sc=new T.Scene(),cam=new T.PerspectiveCamera(34,1,.1,80);cam.position.set(0,.9,10.5);
    sc.add(new T.AmbientLight(0xffffff,.7));
    let dl=new T.DirectionalLight(0xffffff,.9);dl.position.set(-3,5,6);sc.add(dl);
    let pl=new T.PointLight(0x22e4ff,1.2,24);pl.position.set(0,2,5);sc.add(pl);
    let cssv=k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim();
    let colors=()=>({a:new T.Color(cssv("--cyan")||"#22e4ff"),b:new T.Color(cssv("--indigo")||"#7c7fff")});
    let col=colors();

    /* polyline path that is parametrised by length, so a tube can follow it */
    class PolyCurve extends T.Curve{
      constructor(pts){super();this.pts=pts;this.len=[0];
        for(let i=1;i<pts.length;i++)this.len.push(this.len[i-1]+pts[i].distanceTo(pts[i-1]));
        this.total=this.len[this.len.length-1]}
      getPoint(t,out){out=out||new T.Vector3();let d=t*this.total,i=1;
        while(i<this.len.length-1&&this.len[i]<d)i++;
        let s=(d-this.len[i-1])/Math.max(1e-6,this.len[i]-this.len[i-1]);
        return out.copy(this.pts[i-1]).lerp(this.pts[i],Math.min(1,Math.max(0,s)))}
    }
    let V=(x,y)=>new T.Vector3(x,y,0);
    let circle=[];for(let i=0;i<=160;i++){let a=i/160*Math.PI*2+Math.PI/2;circle.push(V(1.05*Math.cos(a),1.05*Math.sin(a)))}
    let square=[V(-.95,-.95),V(.95,-.95),V(.95,.95),V(-.95,.95),V(-.95,-.95)];
    let tri=[90,210,330].map(d=>V(1.25*Math.cos(d*Math.PI/180),1.25*Math.sin(d*Math.PI/180)-.12));tri.push(tri[0].clone());
    let defs=[circle,square,tri];

    let root=new T.Group();sc.add(root);
    let grid=new T.GridHelper(16,16,0x4a5578,0x4a5578);grid.position.y=-1.9;
    grid.material.transparent=true;grid.material.opacity=.16;root.add(grid);

    let TS=240,RS=8,items=[],disposables=[];
    defs.forEach((pts,i)=>{
      let g=new T.Group();g.position.x=(i-1)*3.6;root.add(g);
      let sh=new T.Shape();pts.slice(0,-1).forEach((p,k)=>k?sh.lineTo(p.x,p.y):sh.moveTo(p.x,p.y));sh.closePath();
      let eg=new T.ExtrudeGeometry(sh,{depth:.28,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:2,curveSegments:48});
      let fillM=new T.MeshStandardMaterial({color:col.a,transparent:true,opacity:.16,metalness:.3,roughness:.4,side:T.DoubleSide});
      let fill=new T.Mesh(eg,fillM);fill.position.z=-.28;g.add(fill);
      let edgeM=new T.LineBasicMaterial({color:col.b,transparent:true,opacity:.5});
      let edges=new T.LineSegments(new T.EdgesGeometry(eg,30),edgeM);edges.position.z=-.28;g.add(edges);
      let curve=new PolyCurve(pts);
      let tg=new T.TubeGeometry(curve,TS,.04,RS,false),tm=new T.MeshBasicMaterial({color:col.a});
      let gg=new T.TubeGeometry(curve,TS,.11,RS,false),gm=new T.MeshBasicMaterial({color:col.a,transparent:true,opacity:.22,depthWrite:false});
      let tube=new T.Mesh(tg,tm),glow=new T.Mesh(gg,gm);g.add(glow);g.add(tube);
      let pen=new T.Group(),pm=new T.MeshBasicMaterial({color:0xffffff});
      let tip=new T.Mesh(new T.SphereGeometry(.075,16,16),pm);pen.add(tip);
      let cone=new T.Mesh(new T.ConeGeometry(.06,.34,16),new T.MeshStandardMaterial({color:0xdde4ff,metalness:.6,roughness:.3}));
      cone.rotation.z=Math.PI;cone.position.y=.2;pen.add(cone);g.add(pen);
      disposables.push(eg,edges.geometry,tg,gg,tip.geometry,cone.geometry,fillM,edgeM,tm,gm,pm,cone.material);
      items.push({g,curve,tube,glow,pen,fillM,edgeM,tm,gm,p:0,on:false,wait:0,lift:0});
      tube.geometry.setDrawRange(0,0);glow.geometry.setDrawRange(0,0);pen.visible=false;
    });

    let reduce=_e(),seq=0,hold=0,tgt={x:0,y:0},cur={x:0,y:0},frames=0;
    let setP=(it,p)=>{it.p=p;let n=Math.floor(p*TS)*RS*6;it.tube.geometry.setDrawRange(0,n);it.glow.geometry.setDrawRange(0,n);
      if(p>0&&p<1){it.curve.getPointAt(p,it.pen.position);it.pen.visible=true}else it.pen.visible=false};
    let start=i=>{let it=items[i];it.on=true;setP(it,0)};
    ctl.current.trig=i=>{if(reduce)return;setAct(i);start(i);seq=99;hold=0;
      setTimeout(()=>setAct(a=>a===i?-1:a),2800)};
    if(reduce)items.forEach(it=>setP(it,1));else start(0);

    let size=()=>{let w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;rd.setSize(w,h,false);cam.aspect=w/h;
      cam.position.z=Math.min(22,10.5*Math.max(1,2/cam.aspect));cam.updateProjectionMatrix()};
    let ro=new ResizeObserver(size);ro.observe(host);size();
    let mv=e=>{let r=host.getBoundingClientRect();tgt.x=((e.clientX-r.left)/r.width-.5)*2;tgt.y=((e.clientY-r.top)/r.height-.5)*2};
    let lv=()=>{tgt.x=0;tgt.y=0};
    host.addEventListener("pointermove",mv);host.addEventListener("pointerleave",lv);

    let loop=xi(host,(dt,now)=>{
      frames++;
      if(frames%90===0){col=colors();items.forEach(it=>{it.fillM.color.copy(col.a);it.edgeM.color.copy(col.b);it.tm.color.copy(col.a);it.gm.color.copy(col.a)})}
      cur.x+=(tgt.x-cur.x)*Math.min(1,dt*4);cur.y+=(tgt.y-cur.y)*Math.min(1,dt*4);
      if(!reduce){
        root.rotation.y=Math.sin(now*.0004)*.3+cur.x*.45;
        root.rotation.x=-.1+cur.y*.2;
        items.forEach((it,i)=>{it.g.rotation.y=Math.sin(now*.0007+i*1.3)*.25;it.g.position.y=Math.sin(now*.0009+i)*.08});
        items.forEach(it=>{if(it.on){let np=it.p+dt/2.6;if(np>=1){np=1;it.on=false}setP(it,np)}});
        if(seq<3&&!items[seq].on&&items[seq].p>=1){hold+=dt;if(hold>.35){hold=0;seq++;if(seq<3)start(seq)}}
        else if(seq===3){hold+=dt;if(hold>3.5){hold=0;seq=0;items.forEach(it=>setP(it,0));start(0)}}
        else if(seq===99){if(!items.some(it=>it.on)){hold+=dt;if(hold>3){hold=0;seq=0;items.forEach(it=>setP(it,0));start(0)}}}
      }
      rd.render(sc,cam)});
    return()=>{loop.dispose();ro.disconnect();host.removeEventListener("pointermove",mv);host.removeEventListener("pointerleave",lv);
      disposables.forEach(d=>d.dispose&&d.dispose());grid.geometry.dispose();grid.material.dispose();rd.dispose()};
  },[]);
  let trig=i=>ctl.current.trig&&ctl.current.trig(i);
  return(0,xt.jsxs)("section",{className:"block-pad",id:"shapes",style:{paddingTop:0},children:[
    (0,xt.jsxs)("div",{className:"wrap",children:[
      (0,xt.jsx)("h2",{className:"h2",children:(0,xt.jsx)(cn,{text:"Three shapes, one standard"})}),
      (0,xt.jsx)("p",{className:"lede",children:"Each shape tests something different about the arm."}),
      (0,xt.jsx)("div",{className:"glass sh3-stage",ref:box,children:(0,xt.jsx)("canvas",{ref:cnv,role:"img","aria-label":"A circle, a square and a triangle drawn in 3D by a pen"})}),
      (0,xt.jsx)("div",{className:"shape-grid",children:Qb.map((e,t)=>(0,xt.jsx)(Ki,{delay:t*120,children:
        (0,xt.jsxs)(Jn,{className:"glass shape-card sh3-card"+(act===t?" on":""),tabIndex:0,onMouseEnter:()=>trig(t),onFocus:()=>trig(t),children:[
          (0,xt.jsx)("h3",{children:(0,xt.jsx)($n,{text:e.name,trigger:"both"})}),
          (0,xt.jsx)("p",{children:e.text})]})},e.name))})
    ]})
  ]})
}
