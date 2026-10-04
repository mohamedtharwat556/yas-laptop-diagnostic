/**
 * BATCH 6B-6: Proxy API for Hardware Agent
 * Allows HTTPS Vercel → HTTP localhost communication
 * 
 * This endpoint relays hardware data from the local Hardware Agent
 * to the web client without CORS restrictions
 */

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // IMPORTANT: This only works when deployed to a LOCAL machine
        // or when the API is running on the same network as the Hardware Agent
        
        const agentUrl = process.env.HARDWARE_AGENT_URL || 'http://127.0.0.1:5275';
        const endpoint = `${agentUrl}/api/hardware`;

        console.log(`[Hardware Proxy] Requesting: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            // Note: targetAddressSpace is not available in Node.js fetch
            // This proxy only works when:
            // 1. Deployed on the same machine as Hardware Agent (localhost)
            // 2. Or on same local network
            timeout: 5000
        });

        if (!response.ok) {
            console.error(`[Hardware Proxy] Error: ${response.status}`);
            return res.status(response.status).json({
                error: 'Failed to fetch hardware data',
                status: response.status
            });
        }

        const data = await response.json();
        
        // Add proxy metadata
        data._proxy = true;
        data._proxiedAt = new Date().toISOString();
        data._proxiedFrom = agentUrl;

        console.log(`[Hardware Proxy] Success`);
        return res.status(200).json(data);

    } catch (error) {
        console.error('[Hardware Proxy] Error:', error.message);

        return res.status(503).json({
            error: 'Hardware Agent unreachable',
            message: error.message,
            hint: 'Make sure Hardware Agent is running on http://127.0.0.1:5275'
        });
    }
}
