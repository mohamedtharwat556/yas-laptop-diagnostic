// YAS Admin Portal - Hardware Display Module
// Displays hardware information with source and confidence indicators

const AdminHardwareDisplay = {
    // Render hardware information section
    renderHardwareSection: function(sessionData) {
        if (!sessionData.device_info) {
            return '';
        }

        const deviceInfo = sessionData.device_info;
        const source = sessionData.hardware_source || 'unknown';
        const capturedAt = sessionData.hardware_captured_at || '';

        // Agent status badge
        const agentConnected = sessionData.agentConnected === true;
        const agentStatusHTML = `
            <div style="margin-bottom: 20px; padding: 10px; background: ${agentConnected ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">
                <strong style="color: ${agentConnected ? '#155724' : '#721c24'};">
                    ${agentConnected ? '🟢' : '🔴'} 
                    Agent: ${agentConnected ? 'متصل' : 'غير متصل'}
                </strong>
                ${sessionData.agentVersion ? `<div style="font-size: 0.85em; margin-top: 5px;">الإصدار: ${sessionData.agentVersion}</div>` : ''}
            </div>
        `;

        // Source indicator
        const sourceLabel = this.getSourceLabel(source);
        const confidenceLevel = this.getConfidenceLevel(deviceInfo);

        const sourceHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: #f0f7ff; border-right: 3px solid #667eea; border-radius: 3px;">
                <strong>مصدر البيانات:</strong> ${sourceLabel}
                <br>
                <strong>مستوى الدقة:</strong> 
                <span style="color: ${confidenceLevel.color}; font-weight: bold;">
                    ${confidenceLevel.icon} ${confidenceLevel.label}
                </span>
                ${capturedAt ? `<br><small style="color: #666;">تاريخ الالتقاط: ${new Date(capturedAt).toLocaleString('ar-SA')}</small>` : ''}
            </div>
        `;

        // Hardware details
        let hardwareHTML = sourceHTML + agentStatusHTML;

        // Computer Info
        if (deviceInfo.computer) {
            hardwareHTML += this.renderSection('معلومات الجهاز', {
                'الشركة المصنعة': deviceInfo.computer.manufacturer,
                'الموديل': deviceInfo.computer.model,
                'نوع الجهاز': deviceInfo.computer.deviceType,
                'اسم الجهاز': deviceInfo.computer.computerName
            });
        }

        // OS Info
        if (deviceInfo.operatingSystem) {
            hardwareHTML += this.renderSection('نظام التشغيل', {
                'الإصدار': deviceInfo.operatingSystem.name,
                'رقم الإصدار': deviceInfo.operatingSystem.version,
                'البناء': deviceInfo.operatingSystem.build,
                'المعمارية': deviceInfo.operatingSystem.architecture
            });
        }

        // CPU Info
        if (deviceInfo.cpu) {
            hardwareHTML += this.renderSection('المعالج (CPU)', {
                'الاسم': deviceInfo.cpu.name,
                'الشركة المصنعة': deviceInfo.cpu.manufacturer,
                'عدد الأنوية الفعلية': deviceInfo.cpu.cores,
                'المعالجات المنطقية': deviceInfo.cpu.logicalProcessors,
                'السرعة القصوى': deviceInfo.cpu.maxClockMHz ? `${deviceInfo.cpu.maxClockMHz} MHz` : null
            });
        }

        // Memory Info
        if (deviceInfo.memory) {
            const totalGB = deviceInfo.memory.totalGB?.value || (deviceInfo.memory.totalBytes?.value ? (deviceInfo.memory.totalBytes.value / (1024 ** 3)).toFixed(2) : null);
            hardwareHTML += this.renderSection('الذاكرة (RAM)', {
                'الإجمالي': totalGB ? `${totalGB} GB` : null,
                'المستخدم': deviceInfo.memory.usagePercent ? `${deviceInfo.memory.usagePercent.value}%` : null,
                'عدد المضخمات': deviceInfo.memory.modules ? `${deviceInfo.memory.modules.length} وحدة` : null
            });
        }

        // GPU Info
        if (deviceInfo.gpu && deviceInfo.gpu.length > 0) {
            let gpuHTML = '<div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">';
            gpuHTML += '<h4 style="margin-bottom: 10px; color: #333;">كرت الشاشة (GPU)</h4>';
            
            deviceInfo.gpu.forEach((gpu, index) => {
                gpuHTML += `
                    <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 3px;">
                        <strong>كرت ${index + 1}:</strong> ${gpu.name?.value || 'غير محدد'}<br>
                        ${gpu.vram ? `الذاكرة: ${(gpu.vram / 1024 / 1024).toFixed(0)} MB<br>` : ''}
                        ${gpu.driverVersion ? `إصدار التشغيل: ${gpu.driverVersion.value}<br>` : ''}
                    </div>
                `;
            });
            
            gpuHTML += '</div>';
            hardwareHTML += gpuHTML;
        }

        // Storage Info
        if (deviceInfo.storage && deviceInfo.storage.length > 0) {
            let storageHTML = '<div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">';
            storageHTML += '<h4 style="margin-bottom: 10px; color: #333;">التخزين</h4>';
            
            deviceInfo.storage.forEach((disk, index) => {
                const capacityGB = disk.capacity?.value ? (disk.capacity.value / (1024 ** 3)).toFixed(2) : null;
                const freeGB = disk.free?.value ? (disk.free.value / (1024 ** 3)).toFixed(2) : null;
                
                storageHTML += `
                    <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 3px;">
                        <strong>قرص ${index + 1}:</strong> ${disk.model?.value || 'غير محدد'}<br>
                        ${disk.type ? `النوع: ${disk.type.value}<br>` : ''}
                        ${capacityGB ? `السعة: ${capacityGB} GB<br>` : ''}
                        ${freeGB ? `المتاح: ${freeGB} GB` : ''}
                    </div>
                `;
            });
            
            storageHTML += '</div>';
            hardwareHTML += storageHTML;
        }

        // Battery Info
        if (deviceInfo.battery) {
            hardwareHTML += this.renderSection('البطارية', {
                'الحالة': deviceInfo.battery.present?.value ? 'موجودة' : 'غير موجودة',
                'مستوى الشحن': deviceInfo.battery.percentage ? `${deviceInfo.battery.percentage.value}%` : null,
                'حالة الشحن': deviceInfo.battery.charging?.value ? 'قيد الشحن' : 'غير مشحون'
            });
        }

        // Network Info
        if (deviceInfo.network && deviceInfo.network.length > 0) {
            let networkHTML = '<div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">';
            networkHTML += '<h4 style="margin-bottom: 10px; color: #333;">الشبكة</h4>';
            
            deviceInfo.network.forEach((adapter, index) => {
                networkHTML += `
                    <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 3px;">
                        <strong>${adapter.name?.value || `محول ${index + 1}`}</strong><br>
                        ${adapter.ipAddress ? `IP: ${adapter.ipAddress.value}<br>` : ''}
                        ${adapter.speed ? `السرعة: ${adapter.speed.value} Mbps<br>` : ''}
                    </div>
                `;
            });
            
            networkHTML += '</div>';
            hardwareHTML += networkHTML;
        }

        return hardwareHTML;
    },

    // Render data section
    renderSection: function(title, data) {
        let html = `<div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">`;
        html += `<h4 style="margin-bottom: 10px; color: #333;">${title}</h4>`;
        
        for (const [label, value] of Object.entries(data)) {
            if (value) {
                const displayValue = typeof value === 'object' && value.value ? value.value : value;
                html += `<div style="margin: 5px 0; padding: 5px 0;"><strong>${label}:</strong> ${displayValue}</div>`;
            }
        }
        
        html += '</div>';
        return html;
    },

    // Get source label
    getSourceLabel: function(source) {
        const labels = {
            'hardware-agent': '🖥️ Windows Hardware Agent',
            'browser': '🌐 Browser Detection',
            'manual': '✏️ Manual Entry',
            'unavailable': '❌ Unavailable'
        };
        return labels[source] || source;
    },

    // Get confidence level
    getConfidenceLevel: function(deviceInfo) {
        // Check if Agent data is present
        if (deviceInfo.computer?.manufacturer?.source === 'hardware-agent') {
            return {
                label: 'عالية جداً',
                color: '#28a745',
                icon: '✓'
            };
        }
        
        // Check if partial data from agent
        const hasAgentData = deviceInfo.cpu?.name?.source === 'hardware-agent' ||
                           deviceInfo.memory?.totalGB?.source === 'hardware-agent';
        
        if (hasAgentData) {
            return {
                label: 'عالية',
                color: '#ffc107',
                icon: '⚠'
            };
        }
        
        // Browser only
        return {
            label: 'محدودة',
            color: '#dc3545',
            icon: '!'
        };
    },

    // Create confidence badge
    createConfidenceBadge: function(value) {
        if (!value) return '';
        
        const source = value.source;
        const confidence = value.confidence;
        
        const colors = {
            'HIGH': '#28a745',
            'MEDIUM': '#ffc107',
            'LOW': '#dc3545',
            'NONE': '#999'
        };
        
        const labels = {
            'HIGH': 'عالي',
            'MEDIUM': 'متوسط',
            'LOW': 'منخفض',
            'NONE': 'غير متاح'
        };
        
        return `<span style="background: ${colors[confidence]}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-right: 5px;">${labels[confidence]}</span>`;
    }
};
