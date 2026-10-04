/**
 * BATCH 6B-6: Health Check Proxy for Hardware Agent
 * Allows checking if Hardware Agent is running
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Try different possible locations
        const possibleURLs = [
            'http://127.0.0.1:5275',
            'http://localhost:5275',
        ];

        let lastError = null;

        for (const baseURL of possibleURLs) {
            try {
                const endpoint = `${baseURL}/api/health`;
                console.log(`[Health Proxy] Trying: ${endpoint}`);

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 3000
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`[Health Proxy] Agent healthy from ${baseURL}`);
                    
                    return res.status(200).json({
                        ...data,
                        _proxy: true,
                        _proxiedAt: new Date().toISOString(),
                        _proxiedFrom: baseURL
                    });
                }
            } catch (error) {
                console.log(`[Health Proxy] Failed from ${baseURL}:`, error.message);
                lastError = error;
                // Try next URL
                continue;
            }
        }

        // All URLs failed
        console.error('[Health Proxy] All URLs failed:', lastError?.message);
        return res.status(503).json({
            status: 'error',
            agent: 'YAS Hardware Agent',
            error: 'Agent unreachable',
            message: 'Could not connect to Hardware Agent',
            tried: possibleURLs
        });

    } catch (error) {
        console.error('[Health Proxy] Error:', error.message);

        return res.status(503).json({
            status: 'error',
            agent: 'YAS Hardware Agent',
            error: 'Internal server error',
            message: error.message
        });
    }
}
