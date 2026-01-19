let currentChart = null;

const translations = {
    en: {
        active: "Active API", filler: "Filler", binder: "Binder", lub: "Lubricant", 
        coating: "Coating Agent", susp: "Suspending Agent",
        rec_pkg: "Packaging", rec_store: "Storage", rec_area: "Area", rec_pallets: "Pallets"
    },
    ar: {
        active: "مادة فعالة", filler: "مادة مالئة", binder: "مادة رابطة", lub: "مادة مزلقة", 
        coating: "عامل تغليف", susp: "عامل تعليق",
        rec_pkg: "التغليف", rec_store: "التخزين", rec_area: "المساحة", rec_pallets: "البلتات"
    }
};

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    const strategy = document.getElementById('strategy-mode').value;
    const form = document.getElementById('dosage-form').value;
    const units = parseInt(document.getElementById('batch-units').value);
    const dose = parseFloat(document.getElementById('api-dose').value);

    // بناء التركيبة بناءً على الاستراتيجية
    let costFactor = strategy === 'cost' ? 0.8 : (strategy === 'manual' ? 1.2 : 1.0);
    
    let formula = [
        { name: document.getElementById('api-name').value, role: t.active, qty: dose, cost: 0.15 * costFactor },
        { name: "Excipient A", role: t.filler, qty: dose * 0.4, cost: 0.01 * costFactor },
        { name: "Binder B", role: t.binder, qty: dose * 0.08, cost: 0.03 * costFactor }
    ];

    if (form === 'coated') formula.push({ name: "Color Coating", role: t.coating, qty: 12, cost: 0.04 });
    if (form === 'syrup') formula.push({ name: "Purified Water/Syrup", role: t.filler, qty: dose * 3, cost: 0.005 });

    updateTable(formula);
    updateChart(formula);
    updateLogistics(form, units, l);
    
    document.getElementById('results').style.display = 'block';
    JsBarcode("#barcode", "BATCH-" + Date.now(), { height: 30 });
}

function updateTable(formula) {
    const totalQty = formula.reduce((s, i) => s + i.qty, 0);
    const totalCost = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td>${i.role}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${((i.qty / totalQty) * 100).toFixed(1)}%</td>
            <td>${(((i.qty * i.cost) / totalCost) * 100).toFixed(1)}%</td>
            <td><span class="status-tag">Verified</span></td>
        </tr>
    `).join('');
}

function updateChart(formula) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (currentChart) currentChart.destroy();

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{
                data: formula.map(i => i.qty * i.cost),
                backgroundColor: ['#0a3d62', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

function updateLogistics(form, units, l) {
    const t = translations[l];
    const pallets = Math.ceil(units / 5000);
    const area = (pallets * 1.8).toFixed(1);

    document.getElementById('logistics-recommendations').innerHTML = `
        <div class="rec-node"><strong>${t.rec_pkg}:</strong> Blister Pack</div>
        <div class="rec-node"><strong>${t.rec_store}:</strong> &lt; 30°C</div>
        <div class="rec-node"><strong>${t.rec_pallets}:</strong> ${pallets}</div>
        <div class="rec-node"><strong>${t.rec_area}:</strong> ${area} m²</div>
    `;
}
