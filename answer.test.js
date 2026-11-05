import test from 'node:test';
import assert from 'node:assert/strict';
import {answerLetter} from './answer.js';
test('selects only one explicit final displayed answer',()=>{
 assert.equal(answerLetter('Solution\nANSWER: C',['A','B','C','D','E']),'C');
 assert.equal(answerLetter('ANSWER: C\nMaybe D',['A','C','D']),null);
 assert.equal(answerLetter('ANSWER: C or D',['C','D']),null);
 assert.equal(answerLetter('ANSWER: UNKNOWN',['A','B']),null);
 assert.equal(answerLetter('ANSWER: A\nANSWER: D',['A','D']),null);
 assert.equal(answerLetter('ANSWER: E',['A','B']),null);
});
