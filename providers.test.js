import test from 'node:test';
import assert from 'node:assert/strict';
import {PROVIDERS,getProvider} from './providers.js';
test('Groq is the only provider and uses the requested model',()=>{
 assert.deepEqual(Object.keys(PROVIDERS),['groq']);
 const p=getProvider('groq');
 assert.equal(p.endpoint,'https://api.groq.com/openai/v1/chat/completions');
 assert.deepEqual(p.models,['openai/gpt-oss-120b','openai/gpt-oss-20b']);
 assert.equal(p.keySlot,'groqApiKey');
 assert.throws(()=>getProvider('orca'));
 assert.throws(()=>getProvider('tokenharbor'));
 assert.throws(()=>getProvider('__proto__'));
});
