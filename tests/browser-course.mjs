import {writeFileSync,mkdirSync} from 'node:fs';
import {connect} from './browser_client.mjs';
const b=await connect(process.env.COURSE_DEBUG_URL),base=process.env.COURSE_TEST_BASE;
const report={checks:[],errors:[]};
function check(name,pass,details){report.checks.push({name,pass:!!pass,details});if(!pass)throw Error(name+': '+JSON.stringify(details));}
async function go(route,ready){await b.cdp('Page.navigate',{url:new URL('temas/'+route+'.html',base).href});await b.waitFor(ready);await b.evaluate('window.MathJax?.startup?.promise');}
async function set(id,value){await b.evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await b.evaluate('window.MathJax?.typesetPromise?.()');await b.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');}
async function stable(selector){await b.evaluate('window.MathJax?.typesetPromise?.()');const snap=()=>b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)});return {values:[...r.querySelectorAll('input,select')].map(e=>e.value),svg:[...r.querySelectorAll('svg')].map(e=>e.innerHTML),result:r.textContent}})()`);const before=await snap();await b.evaluate(`window.__nodes=[...document.querySelector(${JSON.stringify(selector)}).querySelectorAll('input,select,svg')]`);for(const mode of ['dark','light']){await b.theme(mode);check('theme preserves values and academic results '+selector+' '+mode,JSON.stringify(before)===JSON.stringify(await snap()));check('theme preserves simulator nodes '+mode,await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)});return [...r.querySelectorAll('input,select,svg')].every((e,i)=>e===window.__nodes[i])})()`));}}
try {
 await b.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await go('induccion',"document.querySelector('[data-induction-ready=true]')");await b.click('[data-chain-start]');await b.waitFor("document.querySelector('.induction-chain.is-complete')",15000);
 check('induction completes all eight steps',await b.evaluate("document.querySelectorAll('[data-chain-step].is-true').length===8 && !document.querySelector('[data-chain-start]').disabled"));await stable('.induction-chain');
 await go('sucesiones-sumatorias',"document.querySelector('#sequence-term-count')");
 await set('sequence-term-count',5);check('sequence computes a5=5/6',await b.evaluate("document.querySelector('.sequence-sim__detail').textContent.includes('0.833')"));await stable('.sequence-sim');
 await go('teorema-binomio',"document.querySelector('#pascal-row-input')");
 for(const n of [0,1,4,10]){await set('pascal-row-input',n);const row=await b.evaluate(`Array.from(document.querySelector('[data-row="${n}"]').querySelectorAll('.pascal-sim__cell'),e=>Number(e.textContent))`);check('Pascal boundary and row sum n='+n,row.length===n+1 && row[0]===1 && row.at(-1)===1 && row.reduce((a,x)=>a+x,0)===2**n,row);}
 await stable('.pascal-sim');
 await go('trigonometria',"document.querySelector('#unit-circle-angle')");
 for(const [angle,cos,sin] of [[0,'1','0'],[90,'0','1'],[180,'−1','0'],[270,'0','−1'],[360,'1','0']]){await set('unit-circle-angle',angle);const desc=await b.evaluate("[document.querySelector('[data-unit-cos]').textContent,document.querySelector('[data-unit-sin]').textContent].map(x=>x.replaceAll('−','-').trim())");check('unit-circle cardinal angle '+angle,desc[0].startsWith(cos.replace('−','-')) && desc[1].startsWith(sin.replace('−','-')),desc);}
 await stable('.unit-circle');
 await go('funciones-lineales-recta',"document.querySelector('#line-slope-input')");await set('line-slope-input',0);await set('line-intercept-input',2);
 check('horizontal line edge case',await b.evaluate("document.querySelector('#line-slope-input').value==='0' && document.querySelector('[data-line-reading]').textContent.toLowerCase().includes('horizontal')"));await stable('.sequence-sim');
 await go('circunferencia',"document.querySelector('#circle-r-input')");await set('circle-h-input',2);await set('circle-k-input',-1);await set('circle-r-input',1);
 const circle=await b.evaluate("document.querySelector('.sequence-sim svg').getAttribute('aria-label')");check('translated circle center and minimum radius',circle.replaceAll(' ','').includes('(2,-1)')&&circle.includes('radio 1'),circle);
 await b.evaluate("document.querySelector('#circle-r-input').focus()");await b.key('ArrowRight');check('native range works with keyboard',await b.evaluate("document.querySelector('#circle-r-input').value==='1.5'"));
 await b.cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 const touch=await b.evaluate("(()=>{const e=document.querySelector('#circle-r-input');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width*.8,y:r.y+r.height/2}})()");
 await b.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});await b.cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check('native range responds to touch',await b.evaluate("Number(document.querySelector('#circle-r-input').value)>1.5"));await stable('.sequence-sim');
 await go('parabola',"document.querySelector('#parabola-c-input')");await set('parabola-h-input',1);await set('parabola-k-input',2);await set('parabola-c-input',.5);
 for(const [direction,focus,directrix] of [['arriba','(1,2.5)','y=1.5'],['abajo','(1,1.5)','y=2.5'],['derecha','(1.5,2)','x=0.5'],['izquierda','(0.5,2)','x=1.5']]){await set('parabola-orientation-input',direction);const label=await b.evaluate("document.querySelector('.sequence-sim svg').getAttribute('aria-label').replaceAll(' ','')");check('parabola focus/directrix '+direction,label.includes('foco'+focus)&&label.includes('directriz'+directrix),label);}
 await stable('.sequence-sim');
 await b.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await b.evaluate("document.querySelector('.sequence-sim__chart-wrap').focus()");
 check('chart scroll region is named and focusable',await b.evaluate("document.activeElement.classList.contains('sequence-sim__chart-wrap') && document.activeElement.getAttribute('role')==='region' && !!document.activeElement.getAttribute('aria-label')"));
 const beforeScroll=await b.evaluate("document.querySelector('.sequence-sim__chart-wrap').scrollLeft");
 // Chromium's native scrolling needs the virtual key code in raw CDP input.
 await b.cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
 await b.cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
 await b.waitFor("document.querySelector('.sequence-sim__chart-wrap').scrollLeft>"+beforeScroll);
 check('chart pans horizontally with keyboard',await b.evaluate("document.querySelector('.sequence-sim__chart-wrap').scrollLeft")>beforeScroll);
 check('MathJax typesets academic formulas',await b.evaluate("!!window.MathJax?.typesetPromise && document.querySelectorAll('mjx-container').length>0 && !document.querySelector('mjx-merror')"));
 check('no runtime/resource errors',b.errors.length===0,b.errors);
} catch(e){report.errors.push(e.message);process.exitCode=1;} finally {b.close();mkdirSync('artifacts/platform',{recursive:true});writeFileSync('artifacts/platform/course-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(x=>!x.pass).length,errors:report.errors}));}
