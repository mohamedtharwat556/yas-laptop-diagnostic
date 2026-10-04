/**
 * BATCH 6B-6: Proxy API for Hardware Agent
 * Allows HTTPS Vercel → HTTP localhost communication
 */

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Try different possible locations for the Agent
        const possibleURLs = [
            'http://127.0.0.1:5275',
            'http://localhost:5275',
        ];

        let lastError = null;
        
        for (const baseURL of possibleURLs) {
            try {
                const endpoint = `${baseURL}/api/hardware`;
                console.log(`[Hardware Proxy] Trying: ${endpoint}`);

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 3000
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Add proxy metadata
                    data._proxy = true;
                    data._proxiedAt = new Date().toISOString();
                    data._proxiedFrom = baseURL;

                    console.log(`[Hardware Proxy] Success from ${baseURL}`);
                    return res.status(200).json(data);
                }
            } catch (error) {
                console.log(`[Hardware Proxy] Failed from ${baseURL}:`, error.message);
                lastError = error;
                // Try next URL
                continue;
            }
        }

        // All URLs failed
        console.error('[Hardware Proxy] All URLs failed:', lastError?.message);
        return res.status(503).json({
            error: 'Hardware Agent unreachable',
            message: 'Could not connect to Hardware Agent on any known address',
            hint: 'Make sure Hardware Agent is running on http://127.0.0.1:5275',
            tried: possibleURLs
        });

    } catch (error) {
        console.error('[Hardware Proxy] Error:', error.message);

        return res.status(503).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
