function visibleText(content) {
  return typeof content==='string'?content:Array.isArray(content)?content.filter(p=>p.type==='text').map(p=>p.text || '').join(''):'';
}
export function completionBody({model,messages,fast}) {
  return {model,messages,stream:true,temperature:0.6,top_p:0.95,max_completion_tokens:fast?2048:4096,reasoning_effort:'default',stop:null};
}
export async function readCompletion(response,onText=()=>{}) {
  if(!response.headers.get('content-type')?.includes('text/event-stream')) {
    const result=await response.json();
    if(result.error) throw new Error('The provider returned an error. Check its dashboard.');
    const text=visibleText(result.choices?.[0]?.message?.content);
    onText(text);
    return {text,finishReason:result.choices?.[0]?.finish_reason || null};
  }
  if(!response.body) throw new Error('The provider returned an empty response stream.');
  const reader=response.body.getReader(),decoder=new TextDecoder();
  let pending='',data=[],text='',finishReason=null,done=false;
  function event() {
    if(!data.length) return;
    const raw=data.join('\n');data=[];
    if(raw==='[DONE]') {done=true;return;}
    let payload;
    try {payload=JSON.parse(raw);} catch {throw new Error('The provider sent malformed streaming data.');}
    if(payload.error) throw new Error('The provider returned a streaming error. Check its dashboard.');
    const choice=payload.choices?.[0];
    if(choice?.finish_reason) finishReason=choice.finish_reason;
    const delta=visibleText(choice?.delta?.content);
    // Internal reasoning fields are not a user-facing explanation.
    if(delta) {text+=delta;onText(text);}
  }
  function line(value) {
    if(value.endsWith('\r')) value=value.slice(0,-1);
    if(!value) event();
    else if(value.startsWith('data:')) data.push(value.slice(5).replace(/^ /,''));
  }
  try {
    while(!done) {
      const chunk=await reader.read();
      pending+=decoder.decode(chunk.value || new Uint8Array(),{stream:!chunk.done});
      let index;
      while((index=pending.indexOf('\n'))>=0) {
        line(pending.slice(0,index));pending=pending.slice(index+1);
        if(done) break;
      }
      if(chunk.done) {if(pending) line(pending);event();break;}
    }
    if(!done && !finishReason) throw new Error('The response stream ended early. No answer was selected.');
    return {text,finishReason};
  } finally {
    await reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
}
