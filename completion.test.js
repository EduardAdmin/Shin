import test from 'node:test';
import assert from 'node:assert/strict';
import {completionBody,readCompletion} from './completion.js';
function stream(input) {
 const bytes=new TextEncoder().encode(input);
 return new Response(new ReadableStream({start(c){for(let i=0;i<bytes.length;i+=7)c.enqueue(bytes.slice(i,i+7));c.close();}}),{headers:{'Content-Type':'text/event-stream'}});
}
test('handles split SSE events, Unicode and reasoning-only chunks',async()=>{
 const wire='data: {"choices":[{"delta":{"reasoning_content":"internal"}}]}\r\n\r\n'+
 'data: {"choices":[{"delta":{"content":"π = 3.14\\n"}}]}\n\n'+
 'data: {"choices":[{"delta":{"content":"ANSWER: B"},"finish_reason":"stop"}]}\n\n'+
 'data: [DONE]\n\n';
 const progress=[];const r=await readCompletion(stream(wire),s=>progress.push(s));
 assert.equal(r.text,'π = 3.14\nANSWER: B');assert.equal(r.finishReason,'stop');assert.equal(progress.length,2);
});
test('distinguishes truncation and interrupted streams',async()=>{
 const r=await readCompletion(stream('data: {"choices":[{"delta":{"content":"ANSWER: A"},"finish_reason":"length"}]}\n\ndata: [DONE]\n\n'));
 assert.equal(r.finishReason,'length');
 await assert.rejects(readCompletion(stream('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n')),/ended early/);
});
test('supports providers returning JSON despite stream request',async()=>{
 const r=await readCompletion(new Response(JSON.stringify({choices:[{message:{content:'ANSWER: C'},finish_reason:'stop'}]}),{headers:{'Content-Type':'application/json'}}));
 assert.equal(r.text,'ANSWER: C');
});
test('Groq request matches supplied parameters and bounds the output budget',()=>{
 const a=completionBody({model:'qwen/qwen3.8-27b',messages:[],fast:true});
 assert.equal(a.stream,true);assert.equal(a.max_completion_tokens,2048);
 assert.equal('max_tokens' in a,false);assert.equal(a.reasoning_effort,'default');
 assert.equal(a.temperature,0.6);assert.equal(a.top_p,0.95);assert.equal(a.stop,null);
 assert.equal(completionBody({model:'qwen/qwen3.8-27b',messages:[],fast:false}).max_completion_tokens,4096);
});
