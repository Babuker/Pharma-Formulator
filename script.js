const translations = {
    en: { run: "Generate Report", batch: "Batch Info", storage: "Storage", steps: "Process", role_api: "Active API", role_filler: "Filler", role_bind: "Binder", role_dis: "Disintegrant", role_lub: "Lubricant" },
    ar: { run: "توليد التقرير", batch: "معلومات التشغيلة", storage: "المستودع", steps: "خطوات التصنيع", role_api: "مادة فعالة", role_filler: "مادة مالئة", role_bind: "مادة ربط", role_dis: "مادة تفكك", role_lub: "مادة مزلقة" }
};

function updateUI() {
    const l = document.getElementById('lang').value;
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('btn-run').innerText = translations[l].run;
}

function runFormulator() {
    const name = document.getElementById('api-name').value || "LOT-001";
    const dose = parseFloat(document.getElementById('api-dose').value) || 500;
    const units = parseInt(document.getElementById('batch-units').value) || 10000;
    const form = document.getElementById('dosage-form').value;
    const ref = document.getElementById('ref').value;
    const l = document.getElementById('lang').value;
    const t = translations[l];

    let formula = [{ name: name, role: t.role_api, qty: dose, costMg: 0.008 }];
    if (form === "tablet") {
        formula.push({ name: "MCC PH102", role: t.role_filler, qty: dose * 0.5, costMg: 0.0001 });
        formula.push({ name: "PVP K30", role: t.role_bind, qty: dose * 0.05, costMg: 0.0004 });
        formula.push({ name: "Mag Stearate", role: t.role_lub, qty: dose * 0.01, costMg: 0.0005 });
    } else if (form === "syrup") {
        formula.push({ name: "Sugar Syrup", role: "Vehicle", qty: dose * 10, costMg: 0.00005 });
    }

    renderReport(formula, units, ref, form, name);
}

function renderReport(formula, units, ref, form, apiName) {
    const unitWt = formula.reduce((s, i) => s + i.qty, 0);
    const unitCost = formula.reduce((s, i) => s + (i.qty * i.costMg), 0);

    // 1. الجدول
    let html = "";
    formula.forEach(i => {
        html += `<tr><td>${i.name}</td><td>${i.role}</td><td>${i.qty.toFixed(1)} mg</td><td>${((i.qty/unitWt)*100).toFixed(1)}%</td><td>${(((i.qty*i.costMg)/unitCost)*100).toFixed(1)}%</td></tr>`;
    });
    document.getElementById('table-body').innerHTML = html;

    // 2. التشغيلة
    document.getElementById('batch-summary').innerHTML = `
        <div class="info-item">Units: ${units.toLocaleString()}</div>
        <div class="info-item">Total Weight: ${((unitWt * units)/1000000).toFixed(2)} Kg</div>
        <div class="info-item">Total Cost: $${(unitCost * units).toFixed(2)}</div>
    `;

    // 3. الخطوات
    const steps = form === "tablet" ? ["Sifting", "Mixing", "Compression", "Blistering"] : ["Mixing", "Heating", "Filtration", "Bottling"];
    document.getElementById('manufacturing-steps').innerHTML = steps.map(s => `<div class="step-item">${s}</div>`).join('');

    // 4. المستودع (AI Logistics Logic)
    // حساب تقريبي: الصندوق الكرتوني يسع 100 عبوة
    const unitsPerBox = form === "syrup" ? 24 : 100;
    const totalBoxes = Math.ceil(units / unitsPerBox);
    const areaPerBox = form === "syrup" ? 0.08 : 0.04; // m2
    const totalArea = (totalBoxes * areaPerBox * 1.2).toFixed(2); // إضافة 20% ممرات

    document.getElementById('storage-info').innerHTML = `
        <p>📦 <strong>Total Shipping Boxes:</strong> ${totalBoxes} Boxes</p>
        <p>📏 <strong>Estimated Warehouse Footprint:</strong> ${totalArea} $m^2$ (Including aisles)</p>
        <p>🧊 <strong>Recommended Storage:</strong> ${form === 'syrup' ? 'Cool Room (15-25°C)' : 'Controlled Ambient (< 30°C)'}</p>
    `;

    // 5. الباركود
    JsBarcode("#barcode", apiName + "-" + units, { height: 35 });
    document.getElementById('results').style.display = "block";
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("PharmaFormulator Enterprise Report", 15, 20);
    doc.autoTable({ html: '#formula-table', startY: 30 });
    doc.save("Full_Manufacturing_Report.pdf");
}
