export function answerLetter(text, labels) {
  const lines=String(text).trim().split(/\r?\n/);
  const matches=lines.filter(line=>/^ANSWER\s*:/i.test(line.trim()));
  if(matches.length!==1) return null;
  const match=/^ANSWER:\s*([A-E])\s*$/i.exec(lines.at(-1).trim());
  if(!match || !labels.includes(match[1].toUpperCase())) return null;
  return match[1].toUpperCase();
}
