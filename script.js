const dictionary = {
    en: {
        title: "PharmaFormulator Pro", sub: "Integrated Manufacturing & Logistics System",
        lbl_api: "API Name & Dose (mg)", lbl_batch: "Batch Size (Units)",
        lbl_strategy: "Formulation Strategy", lbl_form: "Dosage Form", run: "Generate Report",
        th_m: "Material", th_r: "Function", th_q: "Qty/Unit", th_wp: "Wt %", th_cp: "Cost %",
        h_table: "1. Formulation Composition", h_batch: "2. Batch Details", h_rec: "3. Recommendations",
        total_w: "Total Batch Weight", total_c: "Total Production Cost", unit_c: "Cost Per Unit",
        active: "Active Ingredient", filler: "Filler", binder: "Binder", lub: "Lubricant", coating: "Coating",
        method: "Optimal Method", pkg: "Optimal Packaging", store: "Storage Conditions", area: "Storage Area"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية المتكامل",
        lbl_api: "اسم المادة الفعالة والجرعة", lbl_batch: "حجم التشغيلة (وحدة)",
        lbl_strategy: "استراتيجية التركيبة", lbl_form: "الشكل الصيدلاني", run: "توليد التقرير",
        th_m: "المادة", th_r: "الوظيفة", th_q: "الكمية/وحدة", th_wp: "وزن %", th_cp: "تكلفة %",
        h_table: "1. جدول التركيبة", h_batch: "2. تفاصيل التشغيلة", h_rec: "3. التوصيات النهائية",
        total_w: "إجمالي وزن التشغيلة", total_c: "إجمالي تكلفة الإنتاج", unit_c: "التكلفة لكل وحدة",
        active: "مادة فعالة", filler: "مادة مالئة", binder: "مادة رابطة", lub: "مادة مزلقة", coating: "تغليف",
        method: "طريقة التصنيع المثلى", pkg: "التغليف المناسب", store: "ظروف التخزين", area: "مساحة التخزين"
    }
};

let costChart = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = dictionary[l];
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    
    // تحديث كل نصوص الواجهة
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('sub-title').innerText = t.sub;
    document.getElementById('lbl-api').innerText = t.lbl_api;
    document.getElementById('lbl-batch').innerText = t.lbl_batch;
    document.getElementById('lbl-strategy').innerText = t.lbl_strategy;
    document.getElementById('lbl-form').innerText = t.lbl_form;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('h-table').innerText = t.h_table;
    document.getElementById('h-batch-title').innerText = t.h_batch;
    document.getElementById('h-rec').innerText = t.h_rec;
    document.getElementById('th-m').innerText = t.th_m;
    document.getElementById('th-r').innerText = t.th_r;
    document.getElementById('th-q').innerText = t.th_q;
    document.getElementById('th-wp').innerText = t.th_wp;
    document.getElementById('th-cp').innerText = t.th_cp;
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = dictionary[l];
    const units = parseInt(document.getElementById('batch-units').value);
    const dose = parseFloat(document.getElementById('api-dose').value);
    const form = document.getElementById('dosage-form').value;

    let formula = [
        { name: document.getElementById('api-name').value, role: t.active, qty: dose, cost: 0.12 },
        { name: "MCC PH102", role: t.filler, qty: dose * 0.4, cost: 0.01 },
        { name: "PVP K30", role: t.binder, qty: dose * 0.05, cost: 0.04 }
    ];
    if(form === 'coated') formula.push({name: "Opadry", role: t.coating, qty: 15, cost: 0.08});

    // 1. الجدول
    renderTable(formula);
    
    // 2. تفاصيل التشغيلة (النتائج)
    const totalQty = formula.reduce((s, i) => s + i.qty, 0);
    const totalCostUnit = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    const totalWeightBatch = (totalQty * units / 1000000).toFixed(2);
    const totalCostBatch = (totalCostUnit * units).toLocaleString();

    document.getElementById('batch-details-content').innerHTML = `
        <div class="detail-row"><span>${t.total_w}:</span> <strong>${totalWeightBatch} Kg</strong></div>
        <div class="detail-row"><span>${t.total_c}:</span> <strong>$${totalCostBatch}</strong></div>
        <div class="detail-row"><span>${t.unit_c}:</span> <strong>$${totalCostUnit.toFixed(3)}</strong></div>
    `;

    // 3. المخطط والتوصيات
    renderChart(formula);
    renderRecs(form, units, l);

    document.getElementById('results').style.display = 'block';
    JsBarcode("#barcode", "BATCH-" + Date.now(), { height: 30, displayValue: false });
}

function renderTable(formula) {
    const totalQty = formula.reduce((s, i) => s + i.qty, 0);
    const totalCost = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td><span class="tag">${i.role}</span></td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${((i.qty/totalQty)*100).toFixed(1)}%</td>
            <td>${(((i.qty*i.cost)/totalCost)*100).toFixed(1)}%</td>
        </tr>
    `).join('');
}

function renderChart(formula) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (costChart) costChart.destroy();
    costChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{ data: formula.map(i => i.qty * i.cost), backgroundColor: ['#0a3d62', '#27ae60', '#f39c12', '#e74c3c'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

function renderRecs(form, units, l) {
    const t = dictionary[l];
    const pallets = Math.ceil(units / 5000);
    const config = {
        tablet: { m: "Wet Granulation", p: "Blister Pack", s: "Temp < 30°C" },
        syrup: { m: "Mixing & Filtration", p: "Amber Bottles", s: "15-25°C" }
    };
    const c = config[form] || config['tablet'];
    document.getElementById('recommendations-content').innerHTML = `
        <div class="rec-card"><strong>${t.method}</strong>${c.m}</div>
        <div class="rec-card"><strong>${t.pkg}</strong>${c.p}</div>
        <div class="rec-card"><strong>${t.store}</strong>${c.s}</div>
        <div class="rec-card"><strong>${t.area}</strong>${pallets} Pallets (${(pallets*1.5).toFixed(1)}m²)</div>
    `;
}

window.onload = updateUI;
