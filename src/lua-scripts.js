export const LUA_SCRIPTS = {
  getTwoHashmaps: `
    local key1 = KEYS[1]
    local key2 = KEYS[2]
    
    local result1 = redis.call('HGETALL', key1)
    local result2 = redis.call('HGETALL', key2)
    
    return {result1, result2}
  `
};

export async function loadLuaScripts(client) {
  const scriptSha = await client.scriptLoad(LUA_SCRIPTS.getTwoHashmaps);
  return {
    getTwoHashmapsSha: scriptSha
  };
}
