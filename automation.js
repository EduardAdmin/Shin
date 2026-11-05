export function questionChanged(before,after) {
  if(before.fingerprint && after?.fingerprint) return before.fingerprint!==after.fingerprint;
  return !!after && (before.number!==after.number || before.signature!==after.signature || JSON.stringify(before.options)!==JSON.stringify(after.options));
}
export async function waitForNextQuestion(inspect,before,{stopped=()=>false,timeout=30000,pause=()=>new Promise(r=>setTimeout(r,350)),now=()=>Date.now()}={}) {
  const deadline=now()+timeout;
  while(now()<deadline) {
    if(stopped()) return null;
    try {
      const current=await inspect();
      if(questionChanged(before,current)) return current;
    } catch { /* The document may be loading. */ }
    await pause();
  }
  throw new Error('The next question did not load within 30 seconds. Auto mode stopped.');
}
