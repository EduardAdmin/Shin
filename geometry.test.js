import test from 'node:test';
import assert from 'node:assert/strict';
import {cropBounds} from './geometry.js';
const viewport={width:1000,height:800};
test('handles Retina and noninteger CSS bounds without cutting pixels',()=>{
 assert.deepEqual(cropBounds({left:10.25,top:20.25,right:300.25,bottom:400.25},viewport,{width:2000,height:1600}),{x:20,y:40,width:581,height:761});
});
test('rejects any partially offscreen question or answers',()=>{
 for(const rect of [{left:-1,top:0,right:50,bottom:50},{left:0,top:0,right:1001,bottom:50},{left:0,top:-1,right:50,bottom:50},{left:0,top:0,right:50,bottom:801}]) assert.throws(()=>cropBounds(rect,viewport,viewport),/cropped/);
});
test('rejects invalid or empty rectangles',()=>{
 assert.throws(()=>cropBounds({left:NaN,top:0,right:2,bottom:2},viewport,viewport));
 assert.throws(()=>cropBounds({left:2,top:0,right:1,bottom:2},viewport,viewport));
});
