// YAS Laptop Diagnostic System - Global Error Handler
// BATCH 6B-6: Security and error handling
// يتعامل مع الأخطاء العامة للتطبيق بشكل آمن

// Prevent sensitive error details from leaking to users
window.addEventListener('error', function(event) {
    console.error('[Global Error Handler] Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
    
    // Log full error but don't expose to user
    if (event.error && event.error.stack) {
        console.error('[Global Error Handler] Stack trace:', event.error.stack);
    }
    
    // For production, could send to error tracking service
    // DO NOT show raw error to user
    
    // Only prevent default if it's a critical error
    if (event.message && event.message.toLowerCase().includes('critical')) {
        event.preventDefault();
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('[Global Error Handler] Unhandled Promise rejection:', {
        reason: event.reason,
        promise: event.promise
    });
    
    if (event.reason && event.reason.stack) {
        console.error('[Global Error Handler] Stack trace:', event.reason.stack);
    }
    
    // Log but don't crash the app
    event.preventDefault();
});

// Safe error display utility
const ErrorDisplay = {
    show: function(title, message, actions = null) {
        console.log('[ErrorDisplay] Showing:', title);
        
        const existing = document.getElementById('errorDisplay');
        if (existing) existing.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorDisplay';
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            text-align: center;
        `;
        
        content.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #dc2626;">
                ${title}
            </h2>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
                ${message}
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="errorAction" style="padding: 10px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
                    إعادة محاولة
                </button>
                <button id="errorClose" style="padding: 10px 24px; background: #e5e7eb; color: #374151; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
                    إغلاق
                </button>
            </div>
        `;
        
        errorDiv.appendChild(content);
        document.body.appendChild(errorDiv);
        
        // Button handlers
        const actionBtn = content.querySelector('#errorAction');
        const closeBtn = content.querySelector('#errorClose');
        
        if (actions && actions.onRetry) {
            actionBtn.onclick = () => {
                errorDiv.remove();
                actions.onRetry();
            };
        } else {
            actionBtn.onclick = () => {
                errorDiv.remove();
                location.reload();
            };
        }
        
        closeBtn.onclick = () => {
            errorDiv.remove();
            if (actions && actions.onClose) {
                actions.onClose();
            }
        };
    }
};

console.log('[ErrorHandler] Global error handling initialized');
