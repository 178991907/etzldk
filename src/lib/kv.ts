
export interface KVBinding {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}

// Access the global Cloudflare Worker scope or process.env
const getKVBinding = (): KVBinding | null => {
    // In Cloudflare Workers, bindings are global variables or attached to the `env` object passed to the fetch handler.
    // However, in Next.js via open-next, accessing bindings can be tricky depending on the deployment mode.
    // Often they are exposed on `process.env` if using the nodejs_compat flag or specific presets.

    // We'll try to look for a global variable named 'DISCIPLINE_KV' (user needs to bind this name).
    // Or check process.env if injected.

    if (typeof process !== 'undefined' && process.env && process.env.DISCIPLINE_KV) {
        return process.env.DISCIPLINE_KV as unknown as KVBinding;
    }

    // In some open-next configurations, bindings might be on the global scope
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
