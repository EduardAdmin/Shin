export const PROVIDERS = Object.freeze({
  groq: {name:'Groq', endpoint:'https://api.groq.com/openai/v1/chat/completions', keySlot:'groqApiKey', models:['qwen/qwen3.8-27b']}
});
export function getProvider(id) {
  if(!Object.hasOwn(PROVIDERS,id)) throw new Error('Unknown AI provider.');
  return PROVIDERS[id];
}
