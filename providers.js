export const PROVIDERS = Object.freeze({
  orca: {name:'OrcaRouter', endpoint:'https://api.orcarouter.ai/v1/chat/completions', keySlot:'orcaApiKey', models:['z-ai/glm-5.3-flash-free','deepseek/deepseek-v4.1-flash-free']},
  tokenharbor: {name:'TokenHarbor', endpoint:'https://tokenharbor.ai/v1/chat/completions', keySlot:'tokenHarborApiKey', models:['deepseek-v4.1-flash:free']}
});
export function getProvider(id) {
  if(!Object.hasOwn(PROVIDERS,id)) throw new Error('Unknown AI provider.');
  return PROVIDERS[id];
}
