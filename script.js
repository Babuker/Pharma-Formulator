const translations = {
    en: {
        api: "API & Dose (mg)", batch: "Batch Size (Units)", run: "Generate Formulation",
        role_api: "Active Ingredient", role_filler: "Filler/Diluent", role_bind: "Binder", role_dis: "Disintegrant", role_lub: "Lubricant",
        role_veh: "Vehicle", role_pres: "Preservative"
    },
    ar: {
        api: "المادة الفعالة والجرعة (ملجم)", batch: "حجم التشغيلة (وحدة)", run: "توليد التركيبة",
        role_api: "مادة علاجية فعالة", role_filler: "مادة مالئة", role_bind: "مادة ربط", role_dis: "مادة تفكك", role_lub: "مادة مزلقة",
        role_veh: "مادة حاملة (سائل)", role_pres: "مادة حافظة"
    }
};

function updateUI() {
    const l = document.getElementById('lang').value;
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('lbl-api').innerText = translations[l].api;
    document.getElementById('lbl-batch').innerText = translations[l].batch;
    document.getElementById('btn-run').innerText = translations[l].run;
}

function runFormulator() {
    const apiName = document.getElementById('api-name').value || "PH-BATCH-01";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const batchUnits = parseInt(document.getElementById('batch-units').value) || 1000;
    const form = document.getElementById('dosage-form').value;
    const ref = document.getElementById('ref').value;
    const l = document.getElementById('lang').value;
    const t = translations[l];

    let formula = [{ name: apiName, role: t.role_api, qty: dose, costMg: 0.006 }];

    // منطق بناء التركيبة
    if (form === "tablet") {
        formula.push({ name: "Lactose DCL", role: t.role_filler, qty: dose * 0.6, costMg: 0.0001 });
        formula.push({ name: "PVP K30", role: t.role_bind, qty: dose * 0.05, costMg: 0.0004 });
        formula.push({ name: "Crosscarmellose", role: t.role_dis, qty: dose * 0.04, costMg: 0.0003 });
        formula.push({ name: "Magnesium Stearate", role: t.role_lub, qty: dose * 0.01, costMg: 0.0005 });
    } else if (form === "syrup") {
        formula.push({ name: "Purified Water", role: t.role_veh, qty: dose * 8, costMg: 0.00005 });
        formula.push({ name: "Sodium Benzoate", role: t.role_pres, qty: dose * 0.02, costMg: 0.001 });
    } else { // Capsule
        formula.push({ name: "Starch 1500", role: t.role_filler, qty: dose * 0.4, costMg: 0.0001 });
        formula.push({ name: "Talcum", role: t.role_lub, qty: dose * 0.02, costMg: 0.0002 });
    }

    displayAll(formula, batchUnits, ref, form, l, apiName);
}

function displayAll(formula, units, ref, form, l, apiName) {
    const unitWt = formula.reduce((s, i) => s + i.qty, 0);
    const unitCost = formula.reduce((s, i) => s + (i.qty * i.costMg), 0);

    // 1. الجدول
    let html = "";
    formula.forEach(i => {
        const wp = ((i.qty / unitWt) * 100).toFixed(1);
        const cp = (((i.qty * i.costMg) / unitCost) * 100).toFixed(1);
        html += `<tr><td>${i.name}</td><td>${i.role}</td><td>${i.qty.toFixed(2)} mg</td><td>${wp}%</td><td>${cp}%</td></tr>`;
    });
    document.getElementById('table-body').innerHTML = html;

    // 2. معلومات التشغيلة
    document.getElementById('batch-summary').innerHTML = `
        <div class="info-item">Batch Units: ${units.toLocaleString()}</div>
        <div class="info-item">Batch Weight: ${((unitWt * units) / 1000000).toFixed(3)} Kg</div>
        <div class="info-item">Unit Weight: ${unitWt.toFixed(2)} mg</div>
        <div class="info-item">Total Cost: $${(unitCost * units).toFixed(2)}</div>
        <div class="info-item">Standard: ${ref}</div>
    `;

    // 3. خطوات التصنيع
    const steps = {
        tablet: ["Sifting materials", "Dry Mixing", "Wet Granulation (if needed)", "Drying at 50°C", "Compression", "QC Testing"],
        syrup: ["Heating Vehicle", "Dissolving API", "Adding Preservatives", "Filtering", "Filling & Labeling"],
        capsule: ["Mixing API with Filler", "Lubrication", "Shell Filling", "Polishing", "QC Testing"]
    };
    let stepHtml = "";
    steps[form].forEach(s => stepHtml += `<div class="step-item">${s}</div>`);
    document.getElementById('manufacturing-steps').innerHTML = stepHtml;

    // 4. الباركود
    JsBarcode("#barcode", apiName + "-" + units, { height: 40 });

    document.getElementById('results').style.display = "block";
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("PharmaFormulator Pro - Technical Report", 14, 15);
    doc.autoTable({ html: '#formula-table', startY: 25 });
    doc.save("Batch_Report.pdf");
}

updateUI();
