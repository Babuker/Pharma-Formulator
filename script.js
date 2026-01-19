const translations = {
    en: {
        title: "PharmaFormulator Pro", sub: "Integrated Manufacturing & Logistics System", run: "Generate Full Report",
        lbl_api: "API Name & Dose (mg)", lbl_batch: "Batch Size (Total Units)", lbl_form: "Dosage Form", lbl_ref: "Reference",
        th_m: "Material", th_r: "Role", th_q: "Qty/Unit", th_wp: "Wt %", th_cp: "Cost %",
        h_table: "1. Formulation Composition", h_batch: "2. Batch Info", h_steps: "3. Manufacturing Process", h_rec: "4. Final Recommendations & Storage",
        rec_pkg: "Optimal Packaging", rec_store: "Optimal Storage Conditions", rec_area: "Required Storage Area", rec_pallets: "Required Pallets Count",
        active: "Active API", filler: "Filler", binder: "Binder", lub: "Lubricant", coating: "Coating Agent", susp: "Suspending Agent"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية المتكامل", run: "توليد التقرير الكامل",
        lbl_api: "اسم المادة الفعالة والجرعة", lbl_batch: "حجم التشغيلة (وحدة)", lbl_form: "شكل المنتج", lbl_ref: "المرجع",
        th_m: "المادة", th_r: "الدور", th_q: "الكمية/وحدة", th_wp: "وزن %", th_cp: "تكلفة %",
        h_table: "1. جدول التركيبة", h_batch: "2. معلومات التشغيلة", h_steps: "3. خطوات التصنيع", h_rec: "4. التوصيات النهائية والتخزين",
        rec_pkg: "طريقة التغليف الأمثل", rec_store: "ظروف التخزين الأمثل", rec_area: "مساحة التخزين المناسبة", rec_pallets: "عدد البلتات المناسبة",
        active: "مادة فعالة", filler: "مادة مالئة", binder: "مادة رابطة", lub: "مادة مزلقة", coating: "عامل تغليف", susp: "عامل تعليق"
    }
};

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('sub-title').innerText = t.sub;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('lbl-api').innerText = t.lbl_api;
    document.getElementById('lbl-batch').innerText = t.lbl_batch;
    document.getElementById('lbl-form').innerText = t.lbl_form;
    document.getElementById('lbl-ref').innerText = t.lbl_ref;
    document.getElementById('th-m').innerText = t.th_m;
    document.getElementById('th-r').innerText = t.th_r;
    document.getElementById('th-q').innerText = t.th_q;
    document.getElementById('th-wp').innerText = t.th_wp;
    document.getElementById('th-cp').innerText = t.th_cp;
    document.getElementById('h-table').innerText = l === 'ar' ? "1. جدول التركيبة" : t.h_table;
    document.getElementById('h-batch').innerText = l === 'ar' ? "2. معلومات التشغيلة" : t.h_batch;
    document.getElementById('h-steps').innerText = l === 'ar' ? "3. خطوات التصنيع" : t.h_steps;
    document.getElementById('h-rec').innerText = l === 'ar' ? "4. التوصيات النهائية والتخزين" : t.h_rec;
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    const name = document.getElementById('api-name').value || "LOT-001";
    const dose = parseFloat(document.getElementById('api-dose').value) || 500;
    const units = parseInt(document.getElementById('batch-units').value) || 50000;
    const form = document.getElementById('dosage-form').value;

    // 1. حساب التركيبة
    let formula = [{ name: name, role: t.active, qty: dose, cost: 0.2 }];
    if (form.includes("tablet") || form === "capsule") {
        formula.push({ name: "Excipient Filler", role: t.filler, qty: dose * 0.5, cost: 0.01 });
        formula.push({ name: "Binder K30", role: t.binder, qty: dose * 0.05, cost: 0.02 });
        if (form === "coated") formula.push({ name: "Coating Polymer", role: t.coating, qty: 15, cost: 0.05 });
    } else {
        formula.push({ name: "Purified Sugar", role: t.filler, qty: dose * 2, cost: 0.005 });
        formula.push({ name: "Thickener", role: t.susp, qty: 10, cost: 0.03 });
    }

    renderTable(formula);

    // 2. معلومات التشغيلة
    const totalWeight = (formula.reduce((s, i) => s + i.qty, 0) * units / 1000000).toFixed(2);
    const totalCost = (formula.reduce((s, i) => s + (i.qty * i.cost), 0) * units).toLocaleString();
    document.getElementById('batch-summary').innerHTML = `
        <div class="info-box"><strong>Units:</strong> ${units}</div>
        <div class="info-box"><strong>Weight:</strong> ${totalWeight} Kg</div>
        <div class="info-box"><strong>Cost:</strong> $${totalCost}</div>
    `;

    // 3. خطوات التصنيع
    const stepsMap = {
        tablet: ["Sifting", "Mixing", "Compression", "Blistering"],
        coated: ["Mixing", "Compression", "Coating", "Blistering"],
        syrup: ["Mixing", "Filtration", "Filling", "Capping"],
        dry_powder: ["Sifting", "Dry Blending", "Powder Filling", "Sealing"],
        capsule: ["Sifting", "Blending", "Encapsulation", "Polishing"]
    };
    document.getElementById('manufacturing-steps').innerHTML = stepsMap[form].map(s => `<div class="step-item">${s}</div>`).join('');

    // 4. التوصيات اللوجستية (Logic)
    const unitsPerBox = (form.includes("tablet") || form === "capsule") ? 100 : 24;
    const totalBoxes = Math.ceil(units / unitsPerBox);
    const pallets = Math.ceil(totalBoxes / 40); // 40 boxes per pallet
    const warehouseArea = (pallets * 1.8).toFixed(2); // 1.8 m2 per pallet with aisles

    const storageMap = {
        tablet: { pkg: "Alu-PVC Blister", temp: "Controlled Ambient < 30°C" },
        coated: { pkg: "Alu-Alu Blister", temp: "Controlled Ambient < 30°C" },
        syrup: { pkg: "Amber Glass Bottles", temp: "Cool Place 15-25°C" },
        dry_powder: { pkg: "HDPE Bottles", temp: "Dry Place < 30°C" },
        capsule: { pkg: "PVC-PVDC Blister", temp: "Controlled Ambient < 25°C" }
    };

    document.getElementById('logistics-recommendations').innerHTML = `
        <div class="rec-grid">
            <div class="rec-node"><strong>${t.rec_pkg}:</strong><br>${storageMap[form].pkg}</div>
            <div class="rec-node"><strong>${t.rec_store}:</strong><br>${storageMap[form].temp}</div>
            <div class="rec-node"><strong>${t.rec_area}:</strong><br>${warehouseArea} m²</div>
            <div class="rec-node" style="border-left: 4px solid #27ae60; background: #e8f5e9;">
                <strong>${t.rec_pallets}:</strong><br><span style="font-size: 1.2em;">${pallets} Pallets</span>
            </div>
        </div>
    `;

    document.getElementById('results').style.display = "block";
    JsBarcode("#barcode", name + "-" + units, { height: 30 });
}

function renderTable(formula) {
    const totalQty = formula.reduce((s, i) => s + i.qty, 0);
    const totalCost = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td>${i.name}</td>
            <td>${i.role}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${((i.qty / totalQty) * 100).toFixed(1)}%</td>
            <td>${(((i.qty * i.cost) / totalCost) * 100).toFixed(1)}%</td>
        </tr>
    `).join('');
}

window.onload = updateUI;
