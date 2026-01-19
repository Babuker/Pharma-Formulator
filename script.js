const dictionary = {
    en: {
        title: "PharmaFormulator Pro", sub: "Manufacturing & Logistics Intelligence",
        lbl_api: "API Name & Dose (mg)", lbl_batch: "Batch Size (Units)",
        lbl_strategy: "Formulation Strategy", lbl_form: "Dosage Form", run: "Generate Report",
        th_m: "Material", th_r: "Function", th_q: "Qty/Unit", th_wp: "Weight %",
        h_table: "1. Formulation Composition", h_batch: "2. Batch Details", h_rec: "3. Recommendations",
        total_w: "Total Batch Weight", total_c: "Total Cost", unit_c: "Cost Per Unit",
        active: "Active Ingredient", filler: "Filler / Diluent", binder: "Binding Agent", 
        lub: "Lubricant", disint: "Disintegrant", coating: "Coating Polymer", 
        sweet: "Sweetener", solvent: "Vehicle",
        method: "Production Method", pkg: "Packaging Type", store: "Storage", area: "Area Req."
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "ذكاء التصنيع والخدمات اللوجستية",
        lbl_api: "اسم المادة والجرعة (ملغ)", lbl_batch: "حجم التشغيلة (وحدة)",
        lbl_strategy: "استراتيجية التركيبة", lbl_form: "الشكل الصيدلاني", run: "توليد التقرير",
        th_m: "المادة", th_r: "الوظيفة", th_q: "الكمية/وحدة", th_wp: "وزن %",
        h_table: "1. جدول التركيبة والمواد المضافة", h_batch: "2. تفاصيل التشغيلة", h_rec: "3. التوصيات النهائية",
        total_w: "إجمالي وزن التشغيلة", total_c: "إجمالي التكلفة", unit_c: "التكلفة لكل وحدة",
        active: "المادة الفعالة", filler: "مادة مالئة", binder: "مادة رابطة", 
        lub: "مادة مزلقة", disint: "مادة مفككة", coating: "تغليف", 
        sweet: "مادة محلية", solvent: "مذيب / حامل",
        method: "طريقة التصنيع", pkg: "شكل التغليف", store: "ظروف التخزين", area: "المساحة"
    }
};

let myChart = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = dictionary[l];
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('sub-title').innerText = t.sub;
    document.getElementById('lbl-api').innerText = t.lbl_api;
    document.getElementById('lbl-batch').innerText = t.lbl_batch;
    document.getElementById('lbl-strategy').innerText = t.lbl_strategy;
    document.getElementById('lbl-form').innerText = t.lbl_form;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('h-table').innerText = t.h_table;
    document.getElementById('h-batch').innerText = t.h_batch;
    document.getElementById('h-rec').innerText = t.h_rec;
    document.getElementById('th-m').innerText = t.th_m;
    document.getElementById('th-r').innerText = t.th_r;
    document.getElementById('th-q').innerText = t.th_q;
    document.getElementById('th-wp').innerText = t.th_wp;
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = dictionary[l];
    const units = parseInt(document.getElementById('batch-units').value);
    const dose = parseFloat(document.getElementById('api-dose').value);
    const form = document.getElementById('dosage-form').value;

    // بناء مصفوفة المواد المضافة بناءً على الشكل الصيدلاني
    let formula = [{ name: document.getElementById('api-name').value, role: t.active, qty: dose, cost: 0.1 }];
    
    if (form.includes('tablet')) {
        formula.push({ name: "Microcrystalline Cellulose (MCC)", role: t.filler, qty: dose * 0.45, cost: 0.01 });
        formula.push({ name: "Povidone (PVP K30)", role: t.binder, qty: dose * 0.05, cost: 0.04 });
        formula.push({ name: "Croscarmellose Sodium", role: t.disint, qty: dose * 0.03, cost: 0.03 });
        formula.push({ name: "Magnesium Stearate", role: t.lub, qty: 5, cost: 0.02 });
        if (form === 'coated') formula.push({ name: "HPMC Opadry", role: t.coating, qty: 15, cost: 0.08 });
    } else if (form === 'syrup') {
        formula.push({ name: "Liquid Sorbitol", role: t.sweet, qty: dose * 2, cost: 0.01 });
        formula.push({ name: "Purified Water", role: t.solvent, qty: dose * 4, cost: 0.002 });
    }

    const totalQtyUnit = formula.reduce((s, i) => s + i.qty, 0);
    const totalCostUnit = formula.reduce((s, i) => s + (i.qty * i.cost), 0);

    // 1. الجدول
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td><span class="tag">${i.role}</span></td>
            <td>${i.qty.toFixed(1)}</td>
            <td>${((i.qty/totalQtyUnit)*100).toFixed(1)}%</td>
        </tr>
    `).join('');

    // 2. تفاصيل التشغيلة
    document.getElementById('batch-content').innerHTML = `
        <div class="row"><span>${t.total_w}:</span> <strong>${(totalQtyUnit * units / 1000000).toFixed(2)} Kg</strong></div>
        <div class="row"><span>${t.total_c}:</span> <strong>$${(totalCostUnit * units).toLocaleString()}</strong></div>
        <div class="row"><span>${t.unit_c}:</span> <strong>$${totalCostUnit.toFixed(3)}</strong></div>
    `;

    // 3. التوصيات
    const pallets = Math.ceil(units / 5000);
    const recs = {
        tablet: { m: "Wet Granulation", p: "Alu-PVC Blister", s: "Temp < 30°C" },
        syrup: { m: "Closed-Vessel Mixing", p: "Amber Bottles", s: "15-25°C" }
    }[form] || { m: "Standard", p: "Standard", s: "Controlled" };

    document.getElementById('rec-content').innerHTML = `
        <div class="rec-card"><strong>${t.method}</strong>${recs.m}</div>
        <div class="rec-card"><strong>${t.pkg}</strong>${recs.p}</div>
        <div class="rec-card"><strong>${t.store}</strong>${recs.s}</div>
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
            datasets: [{ data: formula.map(i => i.qty * i.cost), backgroundColor: ['#0a3d62', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}
window.onload = updateUI;
