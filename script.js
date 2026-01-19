const dictionary = {
    en: {
        title: "PharmaFormulator Pro", sub: "Manufacturing & Logistics Intelligence",
        lbl_api: "API Name & Dose (mg)", lbl_batch: "Batch Size (Units)",
        lbl_strategy: "Formulation Strategy", lbl_form: "Dosage Form", run: "Generate Report",
        th_m: "Material", th_r: "Function", th_q: "Qty/Unit", th_wp: "Wt %",
        h_table: "1. Formulation Composition", h_batch: "2. Batch Details", h_rec: "3. Recommendations",
        total_w: "Total Batch Weight", total_c: "Total Production Cost", unit_c: "Cost Per Unit",
        strat_applied: "Strategy Applied", method: "Manufacturing Method", pkg: "Packaging Form",
        store: "Storage Conditions", pallets: "Pallets Required", area: "Warehouse Area",
        active: "Active API", filler: "Filler", binder: "Binder", lub: "Lubricant", coating: "Coating"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "ذكاء التصنيع والخدمات اللوجستية",
        lbl_api: "اسم المادة والجرعة (ملغ)", lbl_batch: "حجم التشغيلة (وحدة)",
        lbl_strategy: "استراتيجية التركيبة", lbl_form: "الشكل الصيدلاني", run: "توليد التقرير",
        th_m: "المادة", th_r: "الوظيفة", th_q: "الكمية/وحدة", th_wp: "وزن %",
        h_table: "1. جدول التركيبة", h_batch: "2. تفاصيل التشغيلة", h_rec: "3. التوصيات النهائية",
        total_w: "إجمالي وزن التشغيلة", total_c: "إجمالي تكلفة الإنتاج", unit_c: "التكلفة لكل وحدة",
        strat_applied: "الاستراتيجية المطبقة", method: "طريقة التصنيع", pkg: "شكل التغليف",
        store: "ظروف التخزين", pallets: "البلتات المطلوبة", area: "مساحة التخزين",
        active: "مادة فعالة", filler: "مادة مالئة", binder: "مادة رابطة", lub: "مادة مزلقة", coating: "تغليف"
    }
};

let myChart = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = dictionary[l];
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    
    // تحديث الواجهة
    Object.keys(t).forEach(key => {
        let el = document.getElementById(key.replace('_','-')) || document.getElementById(key);
        if(el) el.innerText = t[key];
    });
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = dictionary[l];
    const units = parseInt(document.getElementById('batch-units').value);
    const dose = parseFloat(document.getElementById('api-dose').value);
    const strategy = document.getElementById('strategy').value;
    const form = document.getElementById('dosage-form').value;

    let costMod = strategy === 'economy' ? 0.8 : (strategy === 'quality' ? 1.3 : 1.0);
    
    let formula = [
        { name: document.getElementById('api-name').value, role: t.active, qty: dose, cost: 0.15 * costMod },
        { name: "Microcrystalline Cellulose", role: t.filler, qty: dose * 0.4, cost: 0.01 },
        { name: "PVP K30", role: t.binder, qty: dose * 0.05, cost: 0.05 }
    ];

    const totalQtyUnit = formula.reduce((s, i) => s + i.qty, 0);
    const totalCostUnit = formula.reduce((s, i) => s + (i.qty * i.cost), 0);

    // 1. عرض الجدول
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr><td><strong>${i.name}</strong></td><td><span class="tag">${i.role}</span></td><td>${i.qty} mg</td><td>${((i.qty/totalQtyUnit)*100).toFixed(1)}%</td></tr>
    `).join('');

    // 2. عرض تفاصيل التشغيلة
    document.getElementById('batch-content').innerHTML = `
        <div class="row"><span>${t.strat_applied}:</span> <strong>${strategy.toUpperCase()}</strong></div>
        <div class="row"><span>${t.total_w}:</span> <strong>${(totalQtyUnit * units / 1000000).toFixed(2)} Kg</strong></div>
        <div class="row"><span>${t.total_c}:</span> <strong>$${(totalCostUnit * units).toLocaleString()}</strong></div>
        <div class="row"><span>${t.unit_c}:</span> <strong>$${totalCostUnit.toFixed(3)}</strong></div>
    `;

    // 3. عرض التوصيات
    const pallets = Math.ceil(units / 5000);
    const recData = {
        tablet: { m: "Direct Compression", p: "Alu-PVC Blister", s: "Dry Place < 30°C" },
        syrup: { m: "Homogenization mixing", p: "Amber PET Bottles", s: "Cool Place 15-25°C" }
    }[form] || { m: "Standard Process", p: "Standard Pkg", s: "Ambient" };

    document.getElementById('rec-content').innerHTML = `
        <div class="rec-card"><strong>${t.method}</strong>${recData.m}</div>
        <div class="rec-card"><strong>${t.pkg}</strong>${recData.p}</div>
        <div class="rec-card"><strong>${t.store}</strong>${recData.s}</div>
        <div class="rec-card"><strong>${t.area}</strong>${pallets} Pallets (${(pallets*1.5).toFixed(1)} m²)</div>
    `;

    renderChart(formula);
    document.getElementById('results').style.display = 'block';
    JsBarcode("#barcode", "BATCH-"+Date.now(), {height: 30, displayValue: false});
}

function renderChart(formula) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{ data: formula.map(i => i.qty * i.cost), backgroundColor: ['#0a3d62', '#27ae60', '#f39c12'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}
window.onload = updateUI;
