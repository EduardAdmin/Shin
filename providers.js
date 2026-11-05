export const PROVIDERS = Object.freeze({
  groq: {name:'Groq', endpoint:'https://api.groq.com/openai/v1/chat/completions', keySlot:'groqApiKey', models:['openai/gpt-oss-120b','openai/gpt-oss-20b']}
});
export function getProvider(id) {
  if(!Object.hasOwn(PROVIDERS,id)) throw new Error('Unknown AI provider.');
  return PROVIDERS[id];
}
