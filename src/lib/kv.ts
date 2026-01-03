
export interface KVBinding {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}

// Access the global Cloudflare Worker scope or process.env
const getKVBinding = (): KVBinding | null => {
    // In Cloudflare Workers, bindings are passed in the 'env' object.
    // In many Next.js adapters (like open-next), they are exposed via process.env
    // or as global variables.
    
    // Check for global 'KV' (standard Cloudflare Workers behavior)
    // @ts-ignore
    if (typeof KV !== 'undefined') {
        // @ts-ignore
        return KV as KVBinding;
    }

    // Check process.env.KV (common in adapters and nodejs_compat)
    if (typeof process !== 'undefined' && process.env && process.env.KV) {
        return process.env.KV as unknown as KVBinding;
    }

    // Check for the previous naming if applicable (fallback)
    // @ts-ignore
    if (typeof DISCIPLINE_KV !== 'undefined') {
        // @ts-ignore
        return DISCIPLINE_KV as KVBinding;
    }

    return null;
};

export const kv = {
    async get(key: string): Promise<any | null> {
        const binding = getKVBinding();
        if (!binding) return null;
        try {
            const val = await binding.get(key);
            return val ? JSON.parse(val) : null;
        } catch (e) {
            console.error(`KV Get Error for ${key}:`, e);
            return null;
        }
    },

    async put(key: string, data: any): Promise<void> {
        const binding = getKVBinding();
        if (!binding) return;
        try {
            await binding.put(key, JSON.stringify(data));
        } catch (e) {
            console.error(`KV Put Error for ${key}:`, e);
        }
    },

    async delete(key: string): Promise<void> {
        const binding = getKVBinding();
        if (!binding) return;
        try {
            await binding.delete(key);
        } catch (e) {
            console.error(`KV Delete Error for ${key}:`, e);
        }
    },

    isAvailable(): boolean {
        return !!getKVBinding();
    }
};
