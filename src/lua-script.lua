local key1 = KEYS[1]
local key2 = KEYS[2]

local hash1 = redis.call('HGETALL', key1)
local hash2 = redis.call('HGETALL', key2)

return {hash1, hash2}
