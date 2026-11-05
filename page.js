// Self-contained: Chrome serializes this function into the page's isolated world.
export function pageOperation(action='inspect',expected=null,letter=null) {
  const normalizeLabel=value=>String(value || '').replace(/\s+/g,' ').trim().toUpperCase();
  function imageSource(img) {
    const raw=img?.currentSrc || img?.src || img?.getAttribute('src');
    if(!raw) return '';
    try {
      const url=new URL(raw,document.baseURI);
      url.searchParams.sort(); // Keep all values; parameter order alone is not identity.
      return url.href;
    } catch {return raw;}
  }
  const question=document.querySelector('#question-text');
  const answers=document.querySelector('#question-answers');
  function fail(error) {if(action==='inspect') throw new Error(error);return {ok:false,error};}
  if(!question || !answers) return fail('Question not found. Open a supported question page.');
  const questionImages=[...question.querySelectorAll('img')];
  const images=[...questionImages,...answers.querySelectorAll('img')];
  if(!questionImages.length || images.some(i=>!i.complete || !i.naturalWidth)) return fail('Wait for all question images to finish loading.');
  const containers=[...answers.querySelectorAll('.answer-container')];
  const options=containers.map(el=>({label:normalizeLabel(el.querySelector('.answer-index')?.textContent),image:imageSource(el.querySelector('img'))}));
  if(!options.length || options.some(o=>!o.label || !o.image) || new Set(options.map(o=>o.label)).size!==options.length) return fail('Could not read unique answer labels and images.');
  const number=String(document.querySelector('#questionindex')?.textContent || document.getElementById('hdnHANGISORU')?.value || '').trim();
  const questionSources=questionImages.map(imageSource);
  const sortedOptions=options.map(o=>[o.label,o.image]).sort((a,b)=>a[0].localeCompare(b[0]));
  const fingerprint=JSON.stringify([number,questionSources,sortedOptions]);
  if(action==='inspect') {
    const rects=[...images,...answers.querySelectorAll('.answer-index')].map(el=>el.getBoundingClientRect());
    if(rects.some(r=>r.width<=0 || r.height<=0)) return fail('Some question elements are hidden.');
    return {
      number,questionSources,options,fingerprint,signature:fingerprint,
      rect:{left:Math.min(...rects.map(r=>r.left)),top:Math.min(...rects.map(r=>r.top)),right:Math.max(...rects.map(r=>r.right)),bottom:Math.max(...rects.map(r=>r.bottom))},
      viewport:{width:innerWidth,height:innerHeight}
    };
  }
  if(!expected || location.href!==expected.url) return fail('The page URL changed. Auto mode stopped.');
  if(fingerprint!==expected.fingerprint) {
    if(number!==expected.number) return fail(`Question changed from ${expected.number} to ${number}. No answer selected.`);
    if(JSON.stringify(questionSources)!==JSON.stringify(expected.questionSources)) return fail('The question image changed while AI was working. Capture it again.');
    return fail('The answer labels or their images changed while AI was working. Capture the question again.');
  }
  if(action==='select') {
    const matches=[...answers.querySelectorAll('.answer-index')].filter(el=>normalizeLabel(el.textContent)===letter);
    if(matches.length!==1) return fail('Could not find a unique matching answer.');
    matches[0].click();
    const selected=[...answers.querySelectorAll('.answer-index.answer-selected')];
    const hidden=document.getElementById('hdnrealCevap');
    if(selected.length!==1 || selected[0]!==matches[0] || (hidden && normalizeLabel(hidden.value)!==letter)) return fail('The site did not confirm the selection. Check manually.');
    return {ok:true};
  }
  if(action==='next') {
    const selected=answers.querySelectorAll('.answer-index.answer-selected');
    if(selected.length!==1 || normalizeLabel(selected[0].textContent)!==expected.selectedLetter) return fail('The selected answer changed. Auto mode stopped.');
    const count=document.querySelectorAll('input[type="hidden"][id^="answer"]').length;
    if(count>0 && Number(number)>=count) return {last:true};
    const next=document.getElementById('nextquestion');
    if(!next || next.disabled) return fail('Next button unavailable. Auto mode stopped.');
    if(/finish|submit|final|termin|înche|inche/i.test((next.value || next.textContent || '').trim())) return {last:true};
    next.click();return {advanced:true};
  }
  return fail('Unknown page operation.');
}
