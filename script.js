// Chemical Formula Optimizer - Main JavaScript Application

class ChemicalFormulaOptimizer {
    constructor() {
        this.apiBaseUrl = window.location.origin;
        this.currentResults = null;
        this.excipientsData = null;
        this.initializeApp();
    }

    // ===== INITIALIZATION =====
    initializeApp() {
        this.initializeEventListeners();
        this.loadExcipients();
        this.setupSampleData();
        this.updateUI();
        
        // Check URL hash for section
        if (window.location.hash) {
            this.scrollToSection(window.location.hash);
        }
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('optimizationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.optimizeFormulation();
        });

        // Form reset
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Load sample data
        document.getElementById('loadSampleBtn').addEventListener('click', () => {
            this.loadSampleData();
        });

        // Excipient mode toggle
        document.getElementById('toggleAuto').addEventListener('click', () => {
            this.setExcipientMode('auto');
        });

        document.getElementById('toggleManual').addEventListener('click', () => {
            this.setExcipientMode('manual');
        });

        // Strategy selection
        document.querySelectorAll('.strategy-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const strategy = option.dataset.strategy;
                this.selectStrategy(strategy);
            });
        });

        // Navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.scrollToSection(targetId);
            });
        });

        // Export buttons
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
            this.exportToJSON();
        });

        document.getElementById('newOptimizationBtn')?.addEventListener('click', () => {
            this.showForm();
        });

        // Database search and filter
        document.getElementById('excipientSearch')?.addEventListener('input', (e) => {
            this.filterExcipients();
        });

        document.getElementById('filterFunction')?.addEventListener('change', () => {
            this.filterExcipients();
        });

        document.getElementById('filterCompliance')?.addEventListener('change', () => {
            this.filterExcipients();
        });

        // Real-time validation
        document.getElementById('apiDose')?.addEventListener('input', (e) => {
            this.validateDose(e.target);
        });

        document.getElementById('batchSize')?.addEventListener('input', (e) => {
            this.validateBatchSize(e.target);
        });
    }

    // ===== FORM HANDLING =====
    setExcipientMode(mode) {
        const autoBtn = document.getElementById('toggleAuto');
        const manualBtn = document.getElementById('toggleManual');
        const manualSection = document.getElementById('manualExcipientSection');
        const modeInput = document.getElementById('excipientMode');

        if (mode === 'auto') {
            autoBtn.classList.add('active');
            manualBtn.classList.remove('active');
            manualSection.style.display = 'none';
            modeInput.value = 'auto';
        } else {
            autoBtn.classList.remove('active');
            manualBtn.classList.add('active');
            manualSection.style.display = 'block';
            modeInput.value = 'manual';
            this.populateExcipientSelector();
        }
    }

    selectStrategy(strategy) {
        document.querySelectorAll('.strategy-option').forEach(option => {
            const input = option.querySelector('input');
            if (input.value === strategy) {
                input.checked = true;
                option.style.borderColor = '#2563eb';
                option.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
            } else {
                option.style.borderColor = '#e5e7eb';
                option.style.backgroundColor = 'transparent';
            }
        });
    }

    validateDose(input) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) {
            input.style.borderColor = '#ef4444';
            this.showToast('Please enter a valid positive dose', 'error');
            return false;
        }
        input.style.borderColor = '#10b981';
        return true;
    }

    validateBatchSize(input) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 100) {
            input.style.borderColor = '#ef4444';
            this.showToast('Batch size must be at least 100 units', 'error');
            return false;
        }
        input.style.borderColor = '#10b981';
        return true;
    }

    // ===== DATA LOADING =====
    async loadExcipients() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/excipients`);
            if (!response.ok) throw new Error('Failed to load excipients');
            
            this.excipientsData = await response.json();
            this.populateExcipientTable();
            this.populateExcipientSelector();
        } catch (error) {
            console.error('Error loading excipients:', error);
            this.showToast('Failed to load excipient database', 'error');
        }
    }

    populateExcipientTable() {
        if (!this.excipientsData) return;
        
        const tableBody = document.getElementById('excipientTableBody');
        tableBody.innerHTML = '';
        
        Object.entries(this.excipientsData).forEach(([key, excipient]) => {
            const row = document.createElement('tr');
            
            // Functions as badges
            const functionsHtml = excipient.functions
                .map(func => `<span class="function-badge">${func}</span>`)
                .join(' ');
            
            // Compliance badges
            const complianceKeys = Object.keys(excipient.compliance || {});
            const complianceHtml = complianceKeys
                .map(comp => `<span class="compliance-badge">${comp}</span>`)
                .join(' ');
            
            row.innerHTML = `
                <td><strong>${excipient.name}</strong><br>
                    <small class="text-muted">${excipient.aliases?.join(', ') || ''}</small>
                </td>
                <td>${functionsHtml}</td>
                <td>${excipient.typical_concentration?.min || 'N/A'} - ${excipient.typical_concentration?.max || 'N/A'}%</td>
                <td>${complianceHtml}</td>
                <td>$${excipient.cost?.range_usd_per_kg || 'N/A'}</td>
                <td>
                    <button class="btn-sm" onclick="optimizer.viewExcipientDetails('${key}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    populateExcipientSelector() {
        if (!this.excipientsData) return;
        
        const selector = document.getElementById('excipientSelector');
        selector.innerHTML = '';
        
        Object.entries(this.excipientsData).forEach(([key, excipient]) => {
            const item = document.createElement('div');
            item.className = 'excipient-item';
            
            // Only show excipients compatible with selected dosage form
            const dosageForm = document.getElementById('dosageForm').value;
            if (dosageForm && excipient.compatible_forms) {
                if (!excipient.compatible_forms.includes(dosageForm)) {
                    return; // Skip incompatible excipients
                }
            }
            
            item.innerHTML = `
                <input type="checkbox" class="excipient-checkbox" id="exc-${key}" value="${key}">
                <div class="excipient-info">
                    <div class="excipient-name">${excipient.name}</div>
                    <div class="excipient-functions">
                        ${excipient.functions.join(' • ')} | 
                        Typical: ${excipient.typical_concentration?.min || 'N/A'}-${excipient.typical_concentration?.max || 'N/A'}%
                    </div>
                </div>
            `;
            
            selector.appendChild(item);
        });
    }

    filterExcipients() {
        if (!this.excipientsData) return;
        
        const searchTerm = document.getElementById('excipientSearch').value.toLowerCase();
        const filterFunction = document.getElementById('filterFunction').value;
        const filterCompliance = document.getElementById('filterCompliance').value;
        
        const tableBody = document.getElementById('excipientTableBody');
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const functions = row.cells[1].textContent.toLowerCase();
            const compliance = row.cells[3].textContent.toLowerCase();
            
            let show = true;
            
            if (searchTerm && !name.includes(searchTerm) && !functions.includes(searchTerm)) {
                show = false;
            }
            
            if (filterFunction && !functions.includes(filterFunction)) {
                show = false;
            }
            
            if (filterCompliance && !compliance.includes(filterCompliance.toLowerCase())) {
                show = false;
            }
            
            row.style.display = show ? '' : 'none';
        });
    }

    // ===== OPTIMIZATION =====
    async optimizeFormulation() {
        // Validate form
        if (!this.validateForm()) return;
        
        // Show loading state
        this.showLoading();
        
        // Prepare data
        const formData = this.getFormData();
        
        try {
            // Call optimization API
            const response = await fetch(`${this.apiBaseUrl}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const results = await response.json();
            
            if (results.error) {
                throw new Error(results.error);
            }
            
            this.currentResults = results;
            this.displayResults(results);
            this.showToast('Formulation optimized successfully!', 'success');
            
        } catch (error) {
            console.error('Optimization error:', error);
            this.showToast(`Optimization failed: ${error.message}`, 'error');
            this.hideLoading();
        }
    }

    getFormData() {
        const form = document.getElementById('optimizationForm');
        const formData = new FormData(form);
        
        const data = {
            api_name: formData.get('apiName'),
            api_dose: parseFloat(formData.get('apiDose')),
            api_dose_unit: formData.get('apiDoseUnit'),
            dosage_form: formData.get('dosageForm'),
            batch_size: parseInt(formData.get('batchSize')),
            batch_unit: formData.get('batchUnit'),
            regulatory_target: formData.get('regulatoryTarget'),
            strategy: formData.get('strategy'),
            excipient_mode: formData.get('excipientMode'),
            additional_requirements: {}
        };
        
        // Add manual excipient selections if in manual mode
        if (data.excipient_mode === 'manual') {
            const selectedExcipients = [];
            document.querySelectorAll('.excipient-checkbox:checked').forEach(checkbox => {
                selectedExcipients.push(checkbox.value);
            });
            data.selected_excipients = selectedExcipients;
        }
        
        // Add additional requirements
        const disintegrationTime = document.getElementById('disintegrationTime').value;
        const maxCost = document.getElementById('maxCost').value;
        const notes = document.getElementById('additionalNotes').value;
        
        if (disintegrationTime) data.additional_requirements.disintegration_time = disintegrationTime;
        if (maxCost) data.additional_requirements.max_cost_per_unit = parseFloat(maxCost);
        if (notes) data.additional_requirements.notes = notes;
        
        return data;
    }

    validateForm() {
        const requiredFields = [
            'apiName', 'apiDose', 'dosageForm', 'batchSize'
        ];
        
        let isValid = true;
        let errorMessage = '';
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
                errorMessage = 'Please fill all required fields';
            } else {
                field.style.borderColor = '';
            }
        });
        
        // Validate dose
        if (!this.validateDose(document.getElementById('apiDose'))) {
            isValid = false;
        }
        
        // Validate batch size
        if (!this.validateBatchSize(document.getElementById('batchSize'))) {
            isValid = false;
        }
        
        if (!isValid && errorMessage) {
            this.showToast(errorMessage, 'error');
        }
        
        return isValid;
    }

    // ===== RESULTS DISPLAY =====
    displayResults(results) {
        this.hideLoading();
        
        // Show results section
        document.getElementById('results').style.display = 'block';
        document.getElementById('optimizer').style.display = 'none';
        
        // Scroll to results
        this.scrollToSection('#results');
        
        // Build results HTML
        const resultsContent = document.getElementById('resultsContent');
        resultsContent.innerHTML = this.generateResultsHTML(results);
        resultsContent.style.display = 'block';
    }

    generateResultsHTML(results) {
        const { master_formula, batch_details, recommendations, compliance_summary } = results;
        
        return `
            <div class="results-grid">
                <div class="result-card">
                    <h4><i class="fas fa-dollar-sign"></i> Cost Analysis</h4>
                    <div class="result-value">$${batch_details?.cost_per_unit?.toFixed(4) || '0.0000'}</div>
                    <div class="result-label">Cost per Unit</div>
                    <div class="result-value">$${batch_details?.total_batch_cost?.toFixed(2) || '0.00'}</div>
                    <div class="result-label">Total Batch Cost</div>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-balance-scale"></i> Compliance</h4>
                    <div class="result-value">${compliance_summary?.status || 'Compliant'}</div>
                    <div class="result-label">Regulatory Status</div>
                    <div class="result-value">${compliance_summary?.standards?.join(', ') || 'N/A'}</div>
                    <div class="result-label">Applicable Standards</div>
                </div>
                
                <div class="result-card">
                    <h4><i class="fas fa-industry"></i> Production</h4>
                    <div class="result-value">${batch_details?.batch_size?.toLocaleString() || '0'}</div>
                    <div class="result-label">Batch Size</div>
                    <div class="result-value">${recommendations?.production_method?.split(' ')[0] || 'Standard'}</div>
                    <div class="result-label">Production Method</div>
                </div>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-list-alt"></i> Master Formula</h3>
                <table class="formula-table">
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Amount/Unit</th>
                            <th>Function</th>
                            <th>% of Total</th>
                            <th>Cost/Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateFormulaRowsHTML(master_formula)}
                    </tbody>
                </table>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-clipboard-check"></i> Recommendations</h3>
                <div class="recommendations-grid">
                    <div class="recommendation">
                        <h4><i class="fas fa-cogs"></i> Production Method</h4>
                        <p>${recommendations?.production_method || 'Standard pharmaceutical manufacturing'}</p>
                    </div>
                    <div class="recommendation">
                        <h4><i class="fas fa-box"></i> Packaging</h4>
                        <p>${recommendations?.packaging || 'Appropriate pharmaceutical packaging'}</p>
                    </div>
                    <div class="recommendation">
                        <h4><i class="fas fa-temperature-low"></i> Storage Conditions</h4>
                        <p>${this.formatStorageConditions(recommendations?.storage_conditions)}</p>
                    </div>
                </div>
                
                ${this.generateStabilityNotesHTML(recommendations?.stability_considerations)}
            </div>
            
            <div class="card">
                <h3><i class="fas fa-chart-bar"></i> Batch Details</h3>
                <div class="batch-details">
                    <div class="detail-item">
                        <span class="detail-label">Total Batch Weight:</span>
                        <span class="detail-value">${batch_details?.total_weight?.toFixed(2) || '0.00'} kg</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Manufacturing Yield:</span>
                        <span class="detail-value">${batch_details?.yield?.toFixed(1) || '95.0'}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Required Storage Area:</span>
                        <span class="detail-value">${batch_details?.storage_area?.toFixed(1) || '3.5'} m³</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateFormulaRowsHTML(formula) {
        if (!formula?.excipients) return '<tr><td colspan="5">No formula data available</td></tr>';
        
        let rows = '';
        
        // API row
        rows += `
            <tr class="api-row">
                <td><strong>${formula.api_name || 'API'}</strong></td>
                <td>${formula.api_dose || '0'} ${formula.api_dose_unit || 'mg'}</td>
                <td>Active Ingredient</td>
                <td>${formula.api_percentage?.toFixed(2) || '0.00'}%</td>
                <td>$${formula.api_cost_per_unit?.toFixed(4) || '0.0000'}</td>
            </tr>
        `;
        
        // Excipient rows
        formula.excipients.forEach((excipient, index) => {
            rows += `
                <tr>
                    <td>${excipient.name}</td>
                    <td>${excipient.amount_per_unit?.toFixed(2) || '0.00'} ${excipient.unit || 'mg'}</td>
                    <td>${excipient.function || 'Excipient'}</td>
                    <td>${excipient.percentage?.toFixed(2) || '0.00'}%</td>
                    <td>$${excipient.cost_per_unit?.toFixed(4) || '0.0000'}</td>
                </tr>
            `;
        });
        
        // Total row
        rows += `
            <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td><strong>${formula.total_unit_weight?.toFixed(2) || '0.00'} ${formula.unit || 'mg'}</strong></td>
                <td></td>
                <td><strong>100.00%</strong></td>
                <td><strong>$${formula.total_unit_cost?.toFixed(4) || '0.0000'}</strong></td>
            </tr>
        `;
        
        return rows;
    }

    formatStorageConditions(conditions) {
        if (!conditions) return 'Standard room temperature storage';
        
        return `
            Temperature: ${conditions.temperature || '15-25°C'}<br>
            Humidity: ${conditions.humidity || '<60% RH'}<br>
            Light: ${conditions.light || 'Protect from light'}
        `;
    }

    generateStabilityNotesHTML(notes) {
        if (!notes || notes.length === 0) return '';
        
        return `
            <div class="stability-notes">
                <h4><i class="fas fa-exclamation-triangle"></i> Stability Considerations</h4>
                <ul>
                    ${notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // ===== UI CONTROLS =====
    showLoading() {
        const loadingEl = document.getElementById('loadingResults');
        const progressBar = document.getElementById('progressBar');
        const steps = document.querySelectorAll('.loading-steps .step');
        
        loadingEl.style.display = 'block';
        progressBar.style.width = '0%';
        
        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            
            // Update steps
            if (progress > 20) steps[1].classList.add('active');
            if (progress > 40) steps[2].classList.add('active');
            if (progress > 60) steps[3].classList.add('active');
            if (progress > 80) steps[4].classList.add('active');
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 30);
    }

    hideLoading() {
        document.getElementById('loadingResults').style.display = 'none';
        document.querySelectorAll('.loading-steps .step').forEach(step => {
            step.classList.remove('active');
        });
    }

    showForm() {
        document.getElementById('results').style.display = 'none';
        document.getElementById('optimizer').style.display = 'block';
        this.scrollToSection('#optimizer');
    }

    resetForm() {
        document.getElementById('optimizationForm').reset();
        this.setExcipientMode('auto');
        this.selectStrategy('low_cost');
        
        // Reset validation styles
        document.querySelectorAll('input, select').forEach(field => {
            field.style.borderColor = '';
        });
        
        this.showToast('Form has been reset', 'info');
    }

    loadSampleData() {
        document.getElementById('apiName').value = 'Ibuprofen';
        document.getElementById('apiDose').value = '200';
        document.getElementById('apiDoseUnit').value = 'mg';
        document.getElementById('dosageForm').value = 'tablet';
        document.getElementById('batchSize').value = '500000';
        document.getElementById('batchUnit').value = 'tablets';
        document.getElementById('regulatoryTarget').value = 'USP_FDA';
        document.getElementById('strategy').value = 'low_cost';
        document.getElementById('excipientMode').value = 'auto';
        document.getElementById('disintegrationTime').value = '<15 minutes';
        document.getElementById('maxCost').value = '0.05';
        document.getElementById('additionalNotes').value = 'Standard immediate-release tablet formulation';
        
        this.setExcipientMode('auto');
        this.selectStrategy('low_cost');
        
        this.showToast('Sample data loaded', 'success');
    }

    // ===== EXPORT FUNCTIONS =====
    async exportToPDF() {
        if (!this.currentResults) {
            this.showToast('No results to export', 'error');
            return;
        }
        
        try {
            this.showToast('Generating PDF report...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/optimize?pdf=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentResults.input_parameters)
            });
            
            if (!response.ok) throw new Error('Failed to generate PDF');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `formulation-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showToast('PDF report downloaded', 'success');
            
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Failed to generate PDF', 'error');
        }
    }

    exportToJSON() {
        if (!this.currentResults) {
            this.showToast('No results to export', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(this.currentResults, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `formulation-results-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showToast('JSON data exported', 'success');
    }

    // ===== UTILITIES =====
    scrollToSection(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: 'smooth'
            });
            window.location.hash = sectionId;
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 300);
            }
        }, 5000);
    }

    getToastIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    viewExcipientDetails(excipientId) {
        if (!this.excipientsData || !this.excipientsData[excipientId]) {
            this.showToast('Excipient details not available', 'error');
            return;
        }
        
        const excipient = this.excipientsData[excipientId];
        const modalHtml = `
            <div class="modal-overlay" id="excipientModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-vial"></i> ${excipient.name}</h3>
                        <button class="modal-close" onclick="optimizer.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="excipient-details">
                            <div class="detail-row">
                                <span class="detail-label">Aliases:</span>
                                <span class="detail-value">${excipient.aliases?.join(', ') || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Functions:</span>
                                <span class="detail-value">${excipient.functions?.join(', ') || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Typical Concentration:</span>
                                <span class="detail-value">
                                    ${excipient.typical_concentration?.min || 'N/A'} - 
                                    ${excipient.typical_concentration?.max || 'N/A'}%
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Compatible Forms:</span>
                                <span class="detail-value">${excipient.compatible_forms?.join(', ') || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Cost Range:</span>
                                <span class="detail-value">$${excipient.cost?.range_usd_per_kg || 'N/A'} per kg</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Suppliers:</span>
                                <span class="detail-value">${excipient.suppliers?.join(', ') || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Stability Notes:</span>
                                <span class="detail-value">${excipient.stability?.hygroscopicity || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div class="compliance-section">
                            <h4><i class="fas fa-file-contract"></i> Regulatory Compliance</h4>
                            ${this.generateComplianceHTML(excipient.compliance)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="optimizer.selectExcipient('${excipientId}')">
                            <i class="fas fa-plus"></i> Add to Formulation
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Inject modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    generateComplianceHTML(compliance) {
        if (!compliance) return '<p>No compliance data available</p>';
        
        let html = '<div class="compliance-grid">';
        
        Object.entries(compliance).forEach(([standard, data]) => {
            html += `
                <div class="compliance-card">
                    <div class="compliance-header">
                        <i class="fas fa-${this.getComplianceIcon(standard)}"></i>
                        <strong>${standard}</strong>
                    </div>
                    <div class="compliance-body">
                        <div>Max Percentage: ${data.max_percentage || 'N/A'}%</div>
                        <div>Monograph: ${data.monograph || 'N/A'}</div>
                        ${data.restrictions ? `<div>Restrictions: ${data.restrictions}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    getComplianceIcon(standard) {
        switch(standard) {
            case 'USP_FDA': return 'flag-usa';
            case 'BP': return 'landmark';
            case 'EP': return 'globe-europe';
            default: return 'file-alt';
        }
    }

    closeModal() {
        const modal = document.getElementById('excipientModal');
        if (modal) modal.remove();
    }

    selectExcipient(excipientId) {
        // In manual mode, check the checkbox
        if (document.getElementById('excipientMode').value === 'manual') {
            const checkbox = document.getElementById(`exc-${excipientId}`);
            if (checkbox) {
                checkbox.checked = true;
                this.showToast('Excipient added to selection', 'success');
            }
        }
        
        this.closeModal();
    }

    updateUI() {
        // Update form based on dosage form selection
        const dosageForm = document.getElementById('dosageForm');
        dosageForm.addEventListener('change', () => {
            this.populateExcipientSelector();
        });
    }

    setupSampleData() {
        // Set default values
        document.getElementById('regulatoryTarget').value = 'USP_FDA';
        document.getElementById('strategy').value = 'low_cost';
        this.selectStrategy('low_cost');
    }
}

// ===== GLOBAL FUNCTIONS =====
function createToastStyles() {
    const styles = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 9999;
            border-left: 4px solid #2563eb;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast-success { border-color: #10b981; }
        .toast-error { border-color: #ef4444; }
        .toast-warning { border-color: #f59e0b; }
        .toast-info { border-color: #06b6d4; }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0.25rem;
        }
        
        .toast i {
            font-size: 1.25rem;
        }
        
        .toast-success i { color: #10b981; }
        .toast-error i { color: #ef4444; }
        .toast-warning i { color: #f59e0b; }
        .toast-info i { color: #06b6d4; }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        }
        
        .modal {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        }
        
        .modal-header {
            padding: 1.5rem;
            border-bottom: 2px solid #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 2px solid #f3f4f6;
            text-align: right;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #6b7280;
        }
        
        .excipient-details .detail-row {
            display: flex;
            margin-bottom: 0.75rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .detail-label {
            font-weight: 600;
            min-width: 180px;
            color: #374151;
        }
        
        .detail-value {
            color: #6b7280;
        }
        
        .compliance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .compliance-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .compliance-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            color: #374151;
        }
        
        .function-badge, .compliance-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-right: 0.25rem;
        }
        
        .compliance-badge {
            background: #dcfce7;
            color: #166534;
        }
        
        .btn-sm {
            padding: 0.25rem 0.75rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
        }
        
        .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .batch-details .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .detail-label {
            color: #374151;
        }
        
        .detail-value {
            font-weight: 600;
            color: #2563eb;
        }
        
        .stability-notes {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #fef3c7;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }
        
        .stability-notes ul {
            margin: 0.5rem 0 0 1.5rem;
        }
        
        .stability-notes li {
            margin-bottom: 0.25rem;
            color: #92400e;
        }
        
        .api-row {
            background-color: #eff6ff;
        }
        
        .total-row {
            background-color: #f8fafc;
            font-weight: 600;
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ===== INITIALIZE APPLICATION =====
let optimizer;

document.addEventListener('DOMContentLoaded', () => {
    createToastStyles();
    optimizer = new ChemicalFormulaOptimizer();
});

// Make optimizer globally available
window.optimizer = optimizer;
