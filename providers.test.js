import test from 'node:test';
import assert from 'node:assert/strict';
import {getProvider} from './providers.js';
test('providers use independent endpoints, models and credential slots',()=>{
 const a=getProvider('orca'),b=getProvider('tokenharbor');
 assert.equal(b.endpoint,'https://tokenharbor.ai/v1/chat/completions');
 assert.deepEqual(b.models,['deepseek-v4.1-flash:free']);
 assert.notEqual(a.endpoint,b.endpoint);
 assert.notEqual(a.keySlot,b.keySlot);
 assert.throws(()=>getProvider('unknown'));
 assert.throws(()=>getProvider('__proto__'));
});
