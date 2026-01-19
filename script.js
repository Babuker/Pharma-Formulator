const UI_DATA = {
    en: {
        title: "PharmaFormulator Pro", sub: "Integrated Manufacturing & Logistics System", run: "Generate Full Report",
        th_m: "Material", th_r: "Role", th_q: "Qty/Unit", th_wp: "Wt %", th_cp: "Cost %",
        h_rec: "Logistics Recommendations", pkg: "Optimal Packaging", store: "Storage Conditions",
        area: "Storage Area", pallets: "Required Pallets",
        active: "Active API", filler: "Filler", binder: "Binder", lub: "Lubricant", coating: "Coating Agent", susp: "Suspending Agent"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية المتكامل", run: "توليد التقرير الكامل",
        th_m: "المادة", th_r: "الدور", th_q: "الكمية/وحدة", th_wp: "وزن %", th_cp: "تكلفة %",
        h_rec: "التوصيات اللوجستية", pkg: "طريقة التغليف الأمثل", store: "ظروف التخزين الأمثل",
        area: "مساحة التخزين", pallets: "عدد البلتات",
        active: "مادة فعالة", filler: "مادة مالئة", binder: "مادة رابطة", lub: "مادة مزلقة", coating: "عامل تغليف", susp: "عامل تعليق"
    }
};

let currentChart = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = UI_DATA[l];
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('btn-run').innerText = t.run;
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = UI_DATA[l];
    const strategy = document.getElementById('strategy-mode').value;
    const form = document.getElementById('dosage-form').value;
    const units = parseInt(document.getElementById('batch-units').value);
    const dose = parseFloat(document.getElementById('api-dose').value);

    // منطق الاستراتيجية (تعديل التكلفة)
    let costMod = strategy === 'cost' ? 0.85 : (strategy === 'manual' ? 1.25 : 1.0);

    let formula = [
        { name: document.getElementById('api-name').value, role: t.active, qty: dose, cost: 0.1 * costMod },
        { name: "Excipient Filler", role: t.filler, qty: dose * 0.4, cost: 0.01 * costMod },
        { name: "Binder PVP K30", role: t.binder, qty: dose * 0.05, cost: 0.04 * costMod }
    ];

    if (form === 'coated') formula.push({ name: "HPMC Coating", role: t.coating, qty: 15, cost: 0.06 });
    if (form === 'syrup') formula.push({ name: "Sucrose Base", role: t.filler, qty: dose * 3, cost: 0.005 });

    renderTable(formula);
    renderChart(formula);
    renderLogistics(form, units, l);
    
    // خطوات التصنيع
    const steps = {
        tablet: ["Sifting", "Granulation", "Compression", "Blistering"],
        coated: ["Compression", "Coating", "Blistering"],
        syrup: ["Mixing", "Filtration", "Filling", "Capping"],
        dry_powder: ["Dry Blending", "Filling", "Sealing"],
        capsule: ["Blending", "Encapsulation", "Polishing"]
    };
    document.getElementById('manufacturing-steps').innerHTML = steps[form].map(s => `<div class="step-item">${s}</div>`).join('');

    document.getElementById('results').style.display = "block";
    JsBarcode("#barcode", "B-" + Date.now(), { height: 30, displayValue: false });
}

function renderTable(formula) {
    const totalQty = formula.reduce((s, i) => s + i.qty, 0);
    const totalCost = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td>${i.role}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${((i.qty / totalQty) * 100).toFixed(1)}%</td>
            <td>${(((i.qty * i.cost) / totalCost) * 100).toFixed(1)}%</td>
            <td><span class="status-badge">Approved</span></td>
        </tr>
    `).join('');
}

function renderChart(formula) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (currentChart) currentChart.destroy();
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{
                data: formula.map(i => i.qty * i.cost),
                backgroundColor: ['#0a3d62', '#27ae60', '#f39c12', '#e74c3c']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

function renderLogistics(form, units, l) {
    const t = UI_DATA[l];
    const pallets = Math.ceil(units / 4500);
    const area = (pallets * 1.6).toFixed(1);
    const config = {
        tablet: { pkg: "Alu-PVC Blister", temp: "< 30°C" },
        coated: { pkg: "Alu-Alu Blister", temp: "< 25°C" },
        syrup: { pkg: "Amber Bottles", temp: "15-25°C" },
        dry_powder: { pkg: "HDPE Bottles", temp: "Dry < 30°C" },
        capsule: { pkg: "PVC-PVDC", temp: "< 25°C" }
    };

    document.getElementById('logistics-data').innerHTML = `
        <div class="rec-node"><strong>${t.pkg}:</strong><br>${config[form].pkg}</div>
        <div class="rec-node"><strong>${t.store}:</strong><br>${config[form].temp}</div>
        <div class="rec-node"><strong>${t.pallets}:</strong><br>${pallets} Pallets</div>
        <div class="rec-node"><strong>${t.area}:</strong><br>${area} m²</div>
    `;
}
