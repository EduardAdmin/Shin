import test from 'node:test';
import assert from 'node:assert/strict';
import {questionChanged,waitForNextQuestion} from './automation.js';
const before={number:'1',signature:'a',options:[{label:'A',image:'a'}]};
test('does not repeat the same question while navigation is pending',async()=>{
 let calls=0,time=0;
 const after={...before,number:'2'};
 const result=await waitForNextQuestion(async()=>{
  calls++;if(calls===1)throw new Error('loading');return calls<4?before:after;
 },before,{pause:async()=>{time+=10;},now:()=>time,timeout:100});
 assert.equal(result.number,'2');assert.equal(calls,4);
 assert.equal(questionChanged(before,before),false);
});
test('stops on cancellation and navigation timeout',async()=>{
 assert.equal(await waitForNextQuestion(async()=>before,before,{stopped:()=>true}),null);
 let time=0;
 await assert.rejects(waitForNextQuestion(async()=>before,before,{pause:async()=>{time+=10;},now:()=>time,timeout:20}),/did not load/);
});
