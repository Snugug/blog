const S={svg:"http://www.w3.org/2000/svg",xmlns:"http://www.w3.org/2000/xmlns/",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",ct:"http://gionkunz.github.com/chartist-js/ct"},me=8,J={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};function W(i,e){return typeof i=="number"?i+e:i}function U(i){if(typeof i=="string"){const e=/^(\d+)\s*(.*)$/g.exec(i);return{value:e?+e[1]:0,unit:e?.[2]||void 0}}return{value:Number(i)}}function ge(i){return String.fromCharCode(97+i%26)}const Y=2221e-19;function xe(i){return Math.floor(Math.log(Math.abs(i))/Math.LN10)}function L(i,e,s){return e/s.range*i}function we(i,e){const s=Math.pow(10,e||me);return Math.round(i*s)/s}function be(i){if(i===1)return i;function e(a,l){return a%l===0?l:e(l,a%l)}function s(a){return a*a+1}let t=2,r=2,n;if(i%2===0)return 2;do t=s(t)%i,r=s(s(r))%i,n=e(Math.abs(t-r),i);while(n===1);return n}function ye(i,e,s){let t=arguments.length>3&&arguments[3]!==void 0?arguments[3]:!1;const r={high:e.high,low:e.low,valueRange:0,oom:0,step:0,min:0,max:0,range:0,numberOfSteps:0,values:[]};r.valueRange=r.high-r.low,r.oom=xe(r.valueRange),r.step=Math.pow(10,r.oom),r.min=Math.floor(r.low/r.step)*r.step,r.max=Math.ceil(r.high/r.step)*r.step,r.range=r.max-r.min,r.numberOfSteps=Math.round(r.range/r.step);const a=L(i,r.step,r)<s,l=t?be(r.range):0;if(t&&L(i,1,r)>=s)r.step=1;else if(t&&l<r.step&&L(i,l,r)>=s)r.step=l;else{let h=0;for(;;){if(a&&L(i,r.step,r)<=s)r.step*=2;else if(!a&&L(i,r.step/2,r)>=s){if(r.step/=2,t&&r.step%1!==0){r.step*=2;break}}else break;if(h++>1e3)throw new Error("Exceeded maximum number of iterations while optimizing scale step!")}}r.step=Math.max(r.step,Y);function u(h,c){return h===(h+=c)&&(h*=1+(c>0?Y:-Y)),h}let o=r.min,f=r.max;for(;o+r.step<=r.low;)o=u(o,r.step);for(;f-r.step>=r.high;)f=u(f,-r.step);r.min=o,r.max=f,r.range=r.max-r.min;const d=[];for(let h=r.min;h<=r.max;h=u(h,r.step)){const c=we(h);c!==d[d.length-1]&&d.push(c)}return r.values=d,r}function O(){let i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};for(var e=arguments.length,s=new Array(e>1?e-1:0),t=1;t<e;t++)s[t-1]=arguments[t];for(let r=0;r<s.length;r++){const n=s[r];for(const a in n){const l=n[a];typeof l=="object"&&l!==null&&!(l instanceof Array)?i[a]=O(i[a],l):i[a]=l}}return i}const Z=i=>i;function R(i,e){return Array.from({length:i},e?(s,t)=>e(t):()=>{})}const pe=(i,e)=>R(Math.max(...i.map(s=>s.length)),s=>e(...i.map(t=>t[s])));function g(i,e){return i!==null&&typeof i=="object"&&Reflect.has(i,e)}function ne(i){return i!==null&&isFinite(i)}function ve(i){return!i&&i!==0}function E(i){return ne(i)?Number(i):void 0}function Ae(i){return Array.isArray(i)?i.every(Array.isArray):!1}function Me(i,e){let s=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,t=0;i[s?"reduceRight":"reduce"]((r,n,a)=>e(n,t++,a),void 0)}function Ee(i,e){const s=Array.isArray(i)?i[e]:g(i,"data")?i.data[e]:null;return g(s,"meta")?s.meta:void 0}function ae(i){return i==null||typeof i=="number"&&isNaN(i)}function Ce(i){return Array.isArray(i)&&i.every(e=>Array.isArray(e)||g(e,"data"))}function Ne(i){return typeof i=="object"&&i!==null&&(Reflect.has(i,"x")||Reflect.has(i,"y"))}function Le(i){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"y";return Ne(i)&&g(i,e)?E(i[e]):E(i)}function T(i,e,s){e={...e,...s?s==="x"?e.axisX:e.axisY:{}};const t={high:e.high===void 0?-Number.MAX_VALUE:+e.high,low:e.low===void 0?Number.MAX_VALUE:+e.low},r=e.high===void 0,n=e.low===void 0;function a(l){if(!ae(l))if(Array.isArray(l))for(let u=0;u<l.length;u++)a(l[u]);else{const u=Number(s&&g(l,s)?l[s]:l);r&&u>t.high&&(t.high=u),n&&u<t.low&&(t.low=u)}}return(r||n)&&a(i),(e.referenceValue||e.referenceValue===0)&&(t.high=Math.max(e.referenceValue,t.high),t.low=Math.min(e.referenceValue,t.low)),t.high<=t.low&&(t.low===0?t.high=1:t.low<0?t.high=0:(t.high>0||(t.high=1),t.low=0)),t}function Se(i){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,s=arguments.length>2?arguments[2]:void 0,t=arguments.length>3?arguments[3]:void 0,r;const n={labels:(i.labels||[]).slice(),series:Be(i.series,s,t)},a=n.labels.length;return Ae(n.series)?(r=Math.max(a,...n.series.map(l=>l.length)),n.series.forEach(l=>{l.push(...R(Math.max(0,r-l.length)))})):r=n.series.length,n.labels.push(...R(Math.max(0,r-a),()=>"")),e&&Oe(n),n}function Oe(i){var e;(e=i.labels)===null||e===void 0||e.reverse(),i.series.reverse();for(const s of i.series)g(s,"data")?s.data.reverse():Array.isArray(s)&&s.reverse()}function ze(i,e){let s,t;if(typeof i!="object"){const r=E(i);e==="x"?s=r:t=r}else g(i,"x")&&(s=E(i.x)),g(i,"y")&&(t=E(i.y));if(!(s===void 0&&t===void 0))return{x:s,y:t}}function K(i,e){if(!ae(i))return e?ze(i,e):E(i)}function Q(i,e){return Array.isArray(i)?i.map(s=>g(s,"value")?K(s.value,e):K(s,e)):Q(i.data,e)}function Be(i,e,s){if(Ce(i))return i.map(r=>Q(r,e));const t=Q(i,e);return s?t.map(r=>[r]):t}function _(i){let e="";return i==null?i:(typeof i=="number"?e=""+i:typeof i=="object"?e=JSON.stringify({data:i}):e=String(i),Object.keys(J).reduce((s,t)=>s.replaceAll(t,J[t]),e))}class je{call(e,s){return this.svgElements.forEach(t=>Reflect.apply(t[e],t,s)),this}attr(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("attr",s)}elem(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("elem",s)}root(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("root",s)}getNode(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("getNode",s)}foreignObject(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("foreignObject",s)}text(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("text",s)}empty(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("empty",s)}remove(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("remove",s)}addClass(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("addClass",s)}removeClass(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("removeClass",s)}removeAllClasses(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("removeAllClasses",s)}animate(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return this.call("animate",s)}constructor(e){this.svgElements=[];for(let s=0;s<e.length;s++)this.svgElements.push(new A(e[s]))}}const le={easeInSine:[.47,0,.745,.715],easeOutSine:[.39,.575,.565,1],easeInOutSine:[.445,.05,.55,.95],easeInQuad:[.55,.085,.68,.53],easeOutQuad:[.25,.46,.45,.94],easeInOutQuad:[.455,.03,.515,.955],easeInCubic:[.55,.055,.675,.19],easeOutCubic:[.215,.61,.355,1],easeInOutCubic:[.645,.045,.355,1],easeInQuart:[.895,.03,.685,.22],easeOutQuart:[.165,.84,.44,1],easeInOutQuart:[.77,0,.175,1],easeInQuint:[.755,.05,.855,.06],easeOutQuint:[.23,1,.32,1],easeInOutQuint:[.86,0,.07,1],easeInExpo:[.95,.05,.795,.035],easeOutExpo:[.19,1,.22,1],easeInOutExpo:[1,0,0,1],easeInCirc:[.6,.04,.98,.335],easeOutCirc:[.075,.82,.165,1],easeInOutCirc:[.785,.135,.15,.86],easeInBack:[.6,-.28,.735,.045],easeOutBack:[.175,.885,.32,1.275],easeInOutBack:[.68,-.55,.265,1.55]};function ee(i,e,s){let t=arguments.length>3&&arguments[3]!==void 0?arguments[3]:!1,r=arguments.length>4?arguments[4]:void 0;const{easing:n,...a}=s,l={};let u,o;n&&(u=Array.isArray(n)?n:le[n]),a.begin=W(a.begin,"ms"),a.dur=W(a.dur,"ms"),u&&(a.calcMode="spline",a.keySplines=u.join(" "),a.keyTimes="0;1"),t&&(a.fill="freeze",l[e]=a.from,i.attr(l),o=U(a.begin||0).value,a.begin="indefinite");const f=i.elem("animate",{attributeName:e,...a});t&&setTimeout(()=>{try{f._node.beginElement()}catch{l[e]=a.to,i.attr(l),f.remove()}},o);const d=f.getNode();r&&d.addEventListener("beginEvent",()=>r.emit("animationBegin",{element:i,animate:d,params:s})),d.addEventListener("endEvent",()=>{r&&r.emit("animationEnd",{element:i,animate:d,params:s}),t&&(l[e]=a.to,i.attr(l),f.remove())})}class A{attr(e,s){return typeof e=="string"?s?this._node.getAttributeNS(s,e):this._node.getAttribute(e):(Object.keys(e).forEach(t=>{if(e[t]!==void 0)if(t.indexOf(":")!==-1){const r=t.split(":");this._node.setAttributeNS(S[r[0]],t,String(e[t]))}else this._node.setAttribute(t,String(e[t]))}),this)}elem(e,s,t){let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:!1;return new A(e,s,t,this,r)}parent(){return this._node.parentNode instanceof SVGElement?new A(this._node.parentNode):null}root(){let e=this._node;for(;e.nodeName!=="svg"&&e.parentElement;)e=e.parentElement;return new A(e)}querySelector(e){const s=this._node.querySelector(e);return s?new A(s):null}querySelectorAll(e){const s=this._node.querySelectorAll(e);return new je(s)}getNode(){return this._node}foreignObject(e,s,t){let r=arguments.length>3&&arguments[3]!==void 0?arguments[3]:!1,n;if(typeof e=="string"){const l=document.createElement("div");l.innerHTML=e,n=l.firstChild}else n=e;n instanceof Element&&n.setAttribute("xmlns",S.xmlns);const a=this.elem("foreignObject",s,t,r);return a._node.appendChild(n),a}text(e){return this._node.appendChild(document.createTextNode(e)),this}empty(){for(;this._node.firstChild;)this._node.removeChild(this._node.firstChild);return this}remove(){var e;return(e=this._node.parentNode)===null||e===void 0||e.removeChild(this._node),this.parent()}replace(e){var s;return(s=this._node.parentNode)===null||s===void 0||s.replaceChild(e._node,this._node),e}append(e){return(arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1)&&this._node.firstChild?this._node.insertBefore(e._node,this._node.firstChild):this._node.appendChild(e._node),this}classes(){const e=this._node.getAttribute("class");return e?e.trim().split(/\s+/):[]}addClass(e){return this._node.setAttribute("class",this.classes().concat(e.trim().split(/\s+/)).filter(function(s,t,r){return r.indexOf(s)===t}).join(" ")),this}removeClass(e){const s=e.trim().split(/\s+/);return this._node.setAttribute("class",this.classes().filter(t=>s.indexOf(t)===-1).join(" ")),this}removeAllClasses(){return this._node.setAttribute("class",""),this}height(){return this._node.getBoundingClientRect().height}width(){return this._node.getBoundingClientRect().width}animate(e){let s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0,t=arguments.length>2?arguments[2]:void 0;return Object.keys(e).forEach(r=>{const n=e[r];Array.isArray(n)?n.forEach(a=>ee(this,r,a,!1,t)):ee(this,r,n,s,t)}),this}constructor(e,s,t,r,n=!1){e instanceof Element?this._node=e:(this._node=document.createElementNS(S.svg,e),e==="svg"&&this.attr({"xmlns:ct":S.ct})),s&&this.attr(s),t&&this.addClass(t),r&&(n&&r._node.firstChild?r._node.insertBefore(this._node,r._node.firstChild):r._node.appendChild(this._node))}}A.Easing=le;function Ve(i){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"100%",s=arguments.length>2&&arguments[2]!==void 0?arguments[2]:"100%",t=arguments.length>3?arguments[3]:void 0;Array.from(i.querySelectorAll("svg")).filter(n=>n.getAttributeNS(S.xmlns,"ct")).forEach(n=>i.removeChild(n));const r=new A("svg").attr({width:e,height:s}).attr({style:"width: ".concat(e,"; height: ").concat(s,";")});return t&&r.addClass(t),i.appendChild(r.getNode()),r}function Pe(i){return typeof i=="number"?{top:i,right:i,bottom:i,left:i}:i===void 0?{top:0,right:0,bottom:0,left:0}:{top:typeof i.top=="number"?i.top:0,right:typeof i.right=="number"?i.right:0,bottom:typeof i.bottom=="number"?i.bottom:0,left:typeof i.left=="number"?i.left:0}}function Xe(i,e){var s,t,r,n;const a=Boolean(e.axisX||e.axisY),l=((s=e.axisY)===null||s===void 0?void 0:s.offset)||0,u=((t=e.axisX)===null||t===void 0?void 0:t.offset)||0,o=(r=e.axisY)===null||r===void 0?void 0:r.position,f=(n=e.axisX)===null||n===void 0?void 0:n.position;let d=i.width()||U(e.width).value||0,h=i.height()||U(e.height).value||0;const c=Pe(e.chartPadding);d=Math.max(d,l+c.left+c.right),h=Math.max(h,u+c.top+c.bottom);const m={x1:0,x2:0,y1:0,y2:0,padding:c,width(){return this.x2-this.x1},height(){return this.y1-this.y2}};return a?(f==="start"?(m.y2=c.top+u,m.y1=Math.max(h-c.bottom,m.y2+1)):(m.y2=c.top,m.y1=Math.max(h-c.bottom-u,m.y2+1)),o==="start"?(m.x1=c.left+l,m.x2=Math.max(d-c.right,m.x1+1)):(m.x1=c.left,m.x2=Math.max(d-c.right-l,m.x1+1))):(m.x1=c.left,m.x2=Math.max(d-c.right,m.x1+1),m.y2=c.top,m.y1=Math.max(h-c.bottom,m.y2+1)),m}function Ye(i,e,s,t,r,n,a,l){const u={["".concat(s.units.pos,"1")]:i,["".concat(s.units.pos,"2")]:i,["".concat(s.counterUnits.pos,"1")]:t,["".concat(s.counterUnits.pos,"2")]:t+r},o=n.elem("line",u,a.join(" "));l.emit("draw",{type:"grid",axis:s,index:e,group:n,element:o,...u})}function Ge(i,e,s,t){const r=i.elem("rect",{x:e.x1,y:e.y2,width:e.width(),height:e.height()},s,!0);t.emit("draw",{type:"gridBackground",group:i,element:r})}function Ie(i,e,s,t,r,n,a,l,u,o){const f={[r.units.pos]:i+a[r.units.pos],[r.counterUnits.pos]:a[r.counterUnits.pos],[r.units.len]:e,[r.counterUnits.len]:Math.max(0,n-10)},d=Math.round(f[r.units.len]),h=Math.round(f[r.counterUnits.len]),c=document.createElement("span");c.className=u.join(" "),c.style[r.units.len]=d+"px",c.style[r.counterUnits.len]=h+"px",c.textContent=String(t);const m=l.foreignObject(c,{style:"overflow: visible;",...f});o.emit("draw",{type:"label",axis:r,index:s,group:l,element:m,text:t,...f})}function te(i,e,s){let t;const r=[];function n(l){const u=t;t=O({},i),e&&e.forEach(o=>{window.matchMedia(o[0]).matches&&(t=O(t,o[1]))}),s&&l&&s.emit("optionsChanged",{previousOptions:u,currentOptions:t})}function a(){r.forEach(l=>l.removeEventListener("change",n))}if(window.matchMedia)e&&e.forEach(l=>{const u=window.matchMedia(l[0]);u.addEventListener("change",n),r.push(u)});else throw new Error("window.matchMedia not found! Make sure you're using a polyfill.");return n(),{removeMediaQueryListeners:a,getCurrentOptions(){return t}}}class Ue{on(e,s){const{allListeners:t,listeners:r}=this;e==="*"?t.add(s):(r.has(e)||r.set(e,new Set),r.get(e).add(s))}off(e,s){const{allListeners:t,listeners:r}=this;if(e==="*")s?t.delete(s):t.clear();else if(r.has(e)){const n=r.get(e);s?n.delete(s):n.clear(),n.size||r.delete(e)}}emit(e,s){const{allListeners:t,listeners:r}=this;r.has(e)&&r.get(e).forEach(n=>n(s)),t.forEach(n=>n(e,s))}constructor(){this.listeners=new Map,this.allListeners=new Set}}const G=new WeakMap;class Re{update(e,s){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1;if(e&&(this.data=e||{},this.data.labels=this.data.labels||[],this.data.series=this.data.series||[],this.eventEmitter.emit("data",{type:"update",data:this.data})),s&&(this.options=O({},t?this.options:this.defaultOptions,s),!this.initializeTimeoutId)){var r;(r=this.optionsProvider)===null||r===void 0||r.removeMediaQueryListeners(),this.optionsProvider=te(this.options,this.responsiveOptions,this.eventEmitter)}return!this.initializeTimeoutId&&this.optionsProvider&&this.createChart(this.optionsProvider.getCurrentOptions()),this}detach(){if(this.initializeTimeoutId)window.clearTimeout(this.initializeTimeoutId);else{var e;window.removeEventListener("resize",this.resizeListener),(e=this.optionsProvider)===null||e===void 0||e.removeMediaQueryListeners()}return G.delete(this.container),this}on(e,s){return this.eventEmitter.on(e,s),this}off(e,s){return this.eventEmitter.off(e,s),this}initialize(){window.addEventListener("resize",this.resizeListener),this.optionsProvider=te(this.options,this.responsiveOptions,this.eventEmitter),this.eventEmitter.on("optionsChanged",()=>this.update()),this.options.plugins&&this.options.plugins.forEach(e=>{Array.isArray(e)?e[0](this,e[1]):e(this)}),this.eventEmitter.emit("data",{type:"initial",data:this.data}),this.createChart(this.optionsProvider.getCurrentOptions()),this.initializeTimeoutId=null}constructor(e,s,t,r,n){this.data=s,this.defaultOptions=t,this.options=r,this.responsiveOptions=n,this.eventEmitter=new Ue,this.resizeListener=()=>this.update(),this.initializeTimeoutId=setTimeout(()=>this.initialize(),0);const a=typeof e=="string"?document.querySelector(e):e;if(!a)throw new Error("Target element is not found");this.container=a;const l=G.get(a);l&&l.detach(),G.set(a,this)}}const w={x:{pos:"x",len:"width",dir:"horizontal",rectStart:"x1",rectEnd:"x2",rectOffset:"y2"},y:{pos:"y",len:"height",dir:"vertical",rectStart:"y2",rectEnd:"y1",rectOffset:"x1"}};class oe{createGridAndLabels(e,s,t,r){const n=this.units.pos==="x"?t.axisX:t.axisY,a=this.ticks.map((u,o)=>this.projectValue(u,o)),l=this.ticks.map(n.labelInterpolationFnc);a.forEach((u,o)=>{const f=l[o],d={x:0,y:0};let h;a[o+1]?h=a[o+1]-u:h=Math.max(this.axisLength-u,this.axisLength/this.ticks.length),!(f!==""&&ve(f))&&(this.units.pos==="x"?(u=this.chartRect.x1+u,d.x=t.axisX.labelOffset.x,t.axisX.position==="start"?d.y=this.chartRect.padding.top+t.axisX.labelOffset.y+5:d.y=this.chartRect.y1+t.axisX.labelOffset.y+5):(u=this.chartRect.y1-u,d.y=t.axisY.labelOffset.y-h,t.axisY.position==="start"?d.x=this.chartRect.padding.left+t.axisY.labelOffset.x:d.x=this.chartRect.x2+t.axisY.labelOffset.x+10),n.showGrid&&Ye(u,o,this,this.gridOffset,this.chartRect[this.counterUnits.len](),e,[t.classNames.grid,t.classNames[this.units.dir]],r),n.showLabel&&Ie(u,h,o,f,this,n.offset,d,s,[t.classNames.label,t.classNames[this.units.dir],n.position==="start"?t.classNames[n.position]:t.classNames.end],r))})}constructor(e,s,t){this.units=e,this.chartRect=s,this.ticks=t,this.counterUnits=e===w.x?w.y:w.x,this.axisLength=s[this.units.rectEnd]-s[this.units.rectStart],this.gridOffset=s[this.units.rectOffset]}}class se extends oe{projectValue(e){const s=Number(Le(e,this.units.pos));return this.axisLength*(s-this.bounds.min)/this.bounds.range}constructor(e,s,t,r){const n=r.highLow||T(s,r,e.pos),a=ye(t[e.rectEnd]-t[e.rectStart],n,r.scaleMinSpace||20,r.onlyInteger),l={min:a.min,max:a.max};super(e,t,a.values),this.bounds=a,this.range=l}}class I extends oe{projectValue(e,s){return this.stepLength*s}constructor(e,s,t,r){const n=r.ticks||[];super(e,t,n);const a=Math.max(1,n.length-(r.stretch?1:0));this.stepLength=this.axisLength/a,this.stretch=Boolean(r.stretch)}}function Te(i){return pe(i,function(){for(var e=arguments.length,s=new Array(e),t=0;t<e;t++)s[t]=arguments[t];return Array.from(s).reduce((r,n)=>({x:r.x+(g(n,"x")?n.x:0),y:r.y+(g(n,"y")?n.y:0)}),{x:0,y:0})})}const re={axisX:{offset:30,position:"end",labelOffset:{x:0,y:0},showLabel:!0,showGrid:!0,labelInterpolationFnc:Z,scaleMinSpace:30,onlyInteger:!1},axisY:{offset:40,position:"start",labelOffset:{x:0,y:0},showLabel:!0,showGrid:!0,labelInterpolationFnc:Z,scaleMinSpace:20,onlyInteger:!1},width:void 0,height:void 0,high:void 0,low:void 0,referenceValue:0,chartPadding:{top:15,right:15,bottom:5,left:10},seriesBarDistance:15,stackBars:!1,stackMode:"accumulate",horizontalBars:!1,distributeSeries:!1,reverseData:!1,showGridBackground:!1,classNames:{chart:"ct-chart-bar",horizontalBars:"ct-horizontal-bars",label:"ct-label",labelGroup:"ct-labels",series:"ct-series",bar:"ct-bar",grid:"ct-grid",gridGroup:"ct-grids",gridBackground:"ct-grid-background",vertical:"ct-vertical",horizontal:"ct-horizontal",start:"ct-start",end:"ct-end"}};class Qe extends Re{createChart(e){const{data:s}=this,t=Se(s,e.reverseData,e.horizontalBars?"x":"y",!0),r=Ve(this.container,e.width,e.height,e.classNames.chart+(e.horizontalBars?" "+e.classNames.horizontalBars:"")),n=e.stackBars&&e.stackMode!==!0&&t.series.length?T([Te(t.series)],e,e.horizontalBars?"x":"y"):T(t.series,e,e.horizontalBars?"x":"y");this.svg=r;const a=r.elem("g").addClass(e.classNames.gridGroup),l=r.elem("g"),u=r.elem("g").addClass(e.classNames.labelGroup);typeof e.high=="number"&&(n.high=e.high),typeof e.low=="number"&&(n.low=e.low);const o=Xe(r,e);let f;const d=e.distributeSeries&&e.stackBars?t.labels.slice(0,1):t.labels;let h,c,m;e.horizontalBars?(e.axisX.type===void 0?f=c=new se(w.x,t.series,o,{...e.axisX,highLow:n,referenceValue:0}):f=c=new e.axisX.type(w.x,t.series,o,{...e.axisX,highLow:n,referenceValue:0}),e.axisY.type===void 0?h=m=new I(w.y,t.series,o,{ticks:d}):h=m=new e.axisY.type(w.y,t.series,o,e.axisY)):(e.axisX.type===void 0?h=c=new I(w.x,t.series,o,{ticks:d}):h=c=new e.axisX.type(w.x,t.series,o,e.axisX),e.axisY.type===void 0?f=m=new se(w.y,t.series,o,{...e.axisY,highLow:n,referenceValue:0}):f=m=new e.axisY.type(w.y,t.series,o,{...e.axisY,highLow:n,referenceValue:0}));const X=e.horizontalBars?o.x1+f.projectValue(0):o.y1-f.projectValue(0),he=e.stackMode==="accumulate",q=e.stackMode==="accumulate-relative",F=[],ue=[];let B=F;h.createGridAndLabels(a,u,e,this.eventEmitter),f.createGridAndLabels(a,u,e,this.eventEmitter),e.showGridBackground&&Ge(a,o,e.classNames.gridBackground,this.eventEmitter),Me(s.series,(y,b)=>{const ce=b-(s.series.length-1)/2;let j;e.distributeSeries&&!e.stackBars?j=h.axisLength/t.series.length/2:e.distributeSeries&&e.stackBars?j=h.axisLength/2:j=h.axisLength/t.series[b].length/2;const C=l.elem("g"),H=g(y,"name")&&y.name,fe=g(y,"className")&&y.className,k=g(y,"meta")?y.meta:void 0;H&&C.attr({"ct:series-name":H}),k&&C.attr({"ct:meta":_(k)}),C.addClass([e.classNames.series,fe||"".concat(e.classNames.series,"-").concat(ge(b))].join(" ")),t.series[b].forEach((M,p)=>{const V=g(M,"x")&&M.x,P=g(M,"y")&&M.y;let N;e.distributeSeries&&!e.stackBars?N=b:e.distributeSeries&&e.stackBars?N=0:N=p;let v;e.horizontalBars?v={x:o.x1+f.projectValue(V||0,p,t.series[b]),y:o.y1-h.projectValue(P||0,N,t.series[b])}:v={x:o.x1+h.projectValue(V||0,N,t.series[b]),y:o.y1-f.projectValue(P||0,p,t.series[b])},h instanceof I&&(h.stretch||(v[h.units.pos]+=j*(e.horizontalBars?-1:1)),v[h.units.pos]+=e.stackBars||e.distributeSeries?0:ce*e.seriesBarDistance*(e.horizontalBars?-1:1)),q&&(B=P>=0||V>=0?F:ue);const $=B[p]||X;if(B[p]=$-(X-v[h.counterUnits.pos]),M===void 0)return;const x={["".concat(h.units.pos,"1")]:v[h.units.pos],["".concat(h.units.pos,"2")]:v[h.units.pos]};e.stackBars&&(he||q||!e.stackMode)?(x["".concat(h.counterUnits.pos,"1")]=$,x["".concat(h.counterUnits.pos,"2")]=B[p]):(x["".concat(h.counterUnits.pos,"1")]=X,x["".concat(h.counterUnits.pos,"2")]=v[h.counterUnits.pos]),x.x1=Math.min(Math.max(x.x1,o.x1),o.x2),x.x2=Math.min(Math.max(x.x2,o.x1),o.x2),x.y1=Math.min(Math.max(x.y1,o.y2),o.y1),x.y2=Math.min(Math.max(x.y2,o.y2),o.y1);const D=Ee(y,p),de=C.elem("line",x,e.classNames.bar).attr({"ct:value":[V,P].filter(ne).join(","),"ct:meta":_(D)});this.eventEmitter.emit("draw",{type:"bar",value:M,index:p,meta:D,series:y,seriesIndex:b,axisX:c,axisY:m,chartRect:o,group:C,element:de,...x})})},e.reverseData),this.eventEmitter.emit("created",{chartRect:o,axisX:c,axisY:m,svg:r,options:e})}constructor(e,s,t,r){super(e,s,re,O({},re,t),r),this.data=s}}const qe=document.querySelector("#frequency"),z=JSON.parse(qe.dataset.frequency),Fe=Math.max(...Object.values(z)),He=Math.min(...Object.values(z)),ie=Object.values(z).length;new Qe("#frequency",{labels:Object.keys(z).map(i=>i-2e3),series:[Object.values(z)]},{high:Fe,low:He,axisY:{showLabel:!1,offset:0},axisX:{labelInterpolationFnc:(i,e)=>e===0||e===Math.round(ie/2)||e===ie-1?`'${i.toString().padStart(2,"0")}`:null}});