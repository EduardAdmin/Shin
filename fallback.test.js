import test from 'node:test';
import assert from 'node:assert/strict';
import {requestWithModelFallback} from './fallback.js';
const models=['openai/gpt-oss-120b','openai/gpt-oss-20b'];
test('switches only on 429 and retries the same request with the backup model',async()=>{
 const calls=[],switches=[];
 const result=await requestWithModelFallback({models,activeModel:models[0],request:async model=>{calls.push(model);return new Response('',{status:calls.length===1?429:200});},onSwitch:async model=>switches.push(model)});
 assert.deepEqual(calls,models);assert.deepEqual(switches,[models[1]]);assert.equal(result.model,models[1]);
});
test('does not switch for successful requests or unrelated errors',async()=>{
 for(const status of [200,400,401,403,404,500,503]) {
  const calls=[];const result=await requestWithModelFallback({models,activeModel:models[0],request:async model=>{calls.push(model);return new Response('',{status});},onSwitch:()=>assert.fail('Unexpected switch')});
  assert.equal(result.response.status,status);assert.equal(calls.length,1);
 }
});
test('keeps the active backup until its own limit and then tries primary',async()=>{
 const calls=[];
 await requestWithModelFallback({models,activeModel:models[1],request:async model=>{calls.push(model);return new Response('',{status:calls.length===1?429:200});}});
 assert.deepEqual(calls,[models[1],models[0]]);
});
test('stops after trying both models, without an unlimited retry loop',async()=>{
 let calls=0;
 await assert.rejects(requestWithModelFallback({models,activeModel:models[0],request:async()=>{calls++;return new Response('',{status:429,headers:{'retry-after':'30'}});}}),/at least 30 seconds/);
 assert.equal(calls,2);
});
test('network failures do not trigger a model switch',async()=>{
 await assert.rejects(requestWithModelFallback({models,activeModel:models[0],request:async()=>{throw new TypeError('network');},onSwitch:()=>assert.fail('Unexpected switch')}),/network/);
});
