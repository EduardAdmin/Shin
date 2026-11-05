import test from 'node:test';
import assert from 'node:assert/strict';
import {pageOperation} from './page.js';
function fixture() {
 let number='10',selected=null,nextClicks=0;
 const hidden={value:''};
 const image=src=>({currentSrc:src,src,complete:true,naturalWidth:100,getBoundingClientRect:()=>({left:10,top:10,right:110,bottom:60,width:100,height:50})});
 const q=image('https://cdn.example/q.png?b=2&a=1');
 const options=['A','B','C'].map((label,i)=>{
  const img=image(`https://cdn.example/${i}.png`);
  const node={textContent:label,getBoundingClientRect:q.getBoundingClientRect,click(){selected=node;hidden.value=label;}};
  return {img,node,querySelector:s=>s==='img'?img:node};
 });
 const answers={querySelectorAll:s=>s==='img'?options.map(o=>o.img):s==='.answer-container'?options:s==='.answer-index.answer-selected'?(selected?[selected]:[]):options.map(o=>o.node)};
 const question={querySelectorAll:()=>[q]};
 globalThis.location={href:'https://example.test/test.aspx'};
 globalThis.innerWidth=1000;globalThis.innerHeight=800;
 globalThis.document={baseURI:location.href,querySelector:s=>s==='#question-text'?question:s==='#question-answers'?answers:{get textContent(){return number;}},getElementById:id=>id==='hdnrealCevap'?hidden:id==='nextquestion'?{value:'Pasul urmator',click(){nextClicks++;}}:null,querySelectorAll:()=>Array(40).fill({})};
 return {q,options,setNumber:n=>number=n,get nextClicks(){return nextClicks;}};
}
function capture(){return {...pageOperation(),url:location.href};}
test('selection tolerates serialized object key order, DOM reorder and URL query order',()=>{
 const f=fixture(),expected=capture();
 expected.options=expected.options.map(o=>({image:o.image,label:o.label}));
 f.options.reverse();f.q.currentSrc='https://cdn.example/q.png?a=1&b=2';
 assert.equal(pageOperation('select',expected,'B').ok,true);
 assert.equal(pageOperation('next',{...expected,selectedLetter:'B'}).advanced,true);
 assert.equal(f.nextClicks,1);
});
test('falls back to src if currentSrc is temporarily empty',()=>{
 const f=fixture(),expected=capture();f.options[0].img.currentSrc='';
 assert.equal(pageOperation('select',expected,'A').ok,true);
});
test('rejects a different question, changed image or remapped answer',()=>{
 let f=fixture(),expected=capture();f.setNumber('11');assert.match(pageOperation('select',expected,'A').error,/10 to 11/);
 f=fixture();expected=capture();f.q.currentSrc='https://cdn.example/other.png';assert.match(pageOperation('select',expected,'A').error,/question image changed/);
 f=fixture();expected=capture();f.options[0].img.currentSrc='https://cdn.example/replacement.png';assert.match(pageOperation('select',expected,'A').error,/answer labels or their images changed/);
});

test('Next never submits the last recognized question',()=>{
 const f=fixture();f.setNumber('40');const expected=capture();
 assert.equal(pageOperation('select',expected,'C').ok,true);
 assert.equal(pageOperation('next',{...expected,selectedLetter:'C'}).last,true);
 assert.equal(f.nextClicks,0);
});
test('Next refuses to advance if the selected answer changed',()=>{
 const f=fixture(),expected=capture();
 pageOperation('select',expected,'A');
 assert.match(pageOperation('next',{...expected,selectedLetter:'B'}).error,/selected answer changed/);
 assert.equal(f.nextClicks,0);
});
