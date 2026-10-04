/**
 * BATCH 6B-6: Health Check Proxy for Hardware Agent
 * Allows checking if Hardware Agent is running
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const agentUrl = process.env.HARDWARE_AGENT_URL || 'http://127.0.0.1:5275';
        const endpoint = `${agentUrl}/api/health`;

        console.log(`[Health Proxy] Checking: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 3000
        });

        if (!response.ok) {
            console.error(`[Health Proxy] Status: ${response.status}`);
            return res.status(response.status).json({
                status: 'error',
                agent: 'YAS Hardware Agent',
                error: `HTTP ${response.status}`
            });
        }

        const data = await response.json();
        console.log(`[Health Proxy] Agent healthy`);
        
        return res.status(200).json({
            ...data,
            _proxy: true,
            _proxiedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Health Proxy] Error:', error.message);

        // Return error but don't crash
        return res.status(503).json({
            status: 'error',
            agent: 'YAS Hardware Agent',
            error: 'Agent unreachable',
            message: error.message
        });
    }
}
