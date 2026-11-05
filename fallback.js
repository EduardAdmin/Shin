export async function requestWithModelFallback({models,activeModel,request,onSwitch=async()=>{}}) {
  if(!Array.isArray(models) || !models.length) throw new Error('No Groq models configured.');
  const start=Math.max(0,models.indexOf(activeModel));
  for(let attempt=0;attempt<models.length;attempt++) {
    const model=models[(start+attempt)%models.length];
    const response=await request(model);
    if(response.status!==429) return {response,model};
    if(attempt===models.length-1) {
      const retry=response.headers.get('retry-after');
      await response.body?.cancel();
      const seconds=retry && /^\d{1,6}$/.test(retry)?Number(retry):null;
      throw new Error('All configured Groq models are rate-limited. Auto mode stopped.'+(seconds!==null?` Retry after at least ${seconds} seconds.`:''));
    }
    await response.body?.cancel();
    const next=models[(start+attempt+1)%models.length];
    await onSwitch(next,model);
  }
}
