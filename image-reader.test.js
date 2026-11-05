import test from 'node:test';
import assert from 'node:assert/strict';
import {imageReaderBody,readTranscription} from './image-reader.js';
test('image input is sent to Qwen, not the text-only solver models',()=>{
 const body=imageReaderBody('data:image/png;base64,abc',['A','B']);
 assert.equal(body.model,'qwen/qwen3.8-27b');
 assert.equal(body.messages[1].content[1].image_url.url,'data:image/png;base64,abc');
 assert.equal(body.stream,false);
});
test('transcription must explicitly be complete and not truncated or unclear',()=>{
 const result=text=>({choices:[{finish_reason:'stop',message:{content:text}}]});
 assert.equal(readTranscription(result('Question and choices\nTRANSCRIPTION: COMPLETE')),'Question and choices');
 assert.throws(()=>readTranscription(result('TRANSCRIPTION: UNCLEAR')));
 assert.throws(()=>readTranscription(result('No completion marker')));
 assert.throws(()=>readTranscription({choices:[{finish_reason:'length',message:{content:'TRANSCRIPTION: COMPLETE'}}]}));
});
