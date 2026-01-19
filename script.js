const translations = {
    en: { title: "PharmaFormulator Pro (AI)", batch: "Batch Size (Units)", run: "Run Analysis", unit: "Unit Wt", bWt: "Batch Wt", cost: "Total Cost", packing: "AI Packaging Advice" },
    ar: { title: "خبير الصياغة الدوائية الذكي", batch: "حجم التشغيلة (وحدة)", run: "بدء التحليل والتركيب", unit: "وزن الوحدة", bWt: "وزن التشغيلة", cost: "التكلفة الكلية", packing: "توصية التغليف الذكية" }
};

let chartInstance = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l] || translations.en;
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
}

function runAIFormulator() {
    const name = document.getElementById('api-name').value || "API";
    const dose = parseFloat(document.getElementById('api-dose').value) || 0;
    const batchUnits = parseInt(document.getElementById('batch-units').value) || 1000;
    const form = document.getElementById('dosage-form').value;
    const ref = document.getElementById('ref').value;

    // --- خوارزمية AI للتغليف ---
    let packRec = "";
    let aiReason = "";
    if (form.includes("tablet")) {
        packRec = "Blister (Alu-PVC) or Strip Pack";
        aiReason = "AI Logic: Recommended for high mechanical stability and protection from oxidation.";
    } else if (form === "capsule") {
        packRec = "PVC/PVDC Blister or HDPE Bottles";
        aiReason = "AI Logic: Detected moisture sensitivity in gelatin shell; enhanced moisture barrier required.";
    } else {
        packRec = "Amber Glass Bottle (UV Protection)";
        aiReason = "AI Logic: Fluid state detected; UV blocking glass required to prevent photo-degradation.";
    }

    // --- خوارزمية حساب التشغيلة والتكلفة ---
    let formula = [ { name: name, role: "API", qty: dose, cost: 0.0007 } ];
    if (form.includes("tablet")) {
        formula.push({ name: "Cellulose (Filler)", role: "Excipient", qty: dose * 0.5, cost: 0.0001 });
        formula.push({ name: "Stearate (Lubricant)", role: "Excipient", qty: dose * 0.02, cost: 0.0004 });
    } else {
        formula.push({ name: "Sorbitol (Base)", role: "Vehicle", qty: dose * 6, cost: 0.00005 });
    }

    renderResults(formula, batchUnits, ref, packRec, aiReason);
}

function renderResults(formula, units, ref, pack, reason) {
    let unitWeight = formula.reduce((s, i) => s + i.qty, 0);
    let totalCost = formula.reduce((s, i) => s + (i.qty * i.cost * units), 0);
    let batchWeightKg = (unitWeight * units) / 1000000;

    document.getElementById('sum-unit-weight').innerText = unitWeight.toFixed(2) + " mg";
    document.getElementById('sum-batch-size').innerText = batchWeightKg.toFixed(2) + " kg";
    document.getElementById('sum-total-cost').innerText = totalCost.toLocaleString();
    document.getElementById('sum-ref').innerText = ref;
    document.getElementById('ai-packaging-tip').innerHTML = `<strong>${pack}</strong><br><small>${reason}</small>`;

    let html = "";
    formula.forEach(i => {
        let bQty = (i.qty * units) / 1000;
        html += `<tr><td>${i.name}</td><td>${i.role}</td><td>${i.qty.toFixed(2)}</td><td>${bQty.toFixed(2)} g</td></tr>`;
    });
    document.getElementById('table-body').innerHTML = html;
    document.getElementById('results').style.display = "block";
    updateChart(formula);
}

function updateChart(data) {
    const ctx = document.getElementById('ctxChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(i => i.name),
            datasets: [{ data: data.map(i => i.qty), backgroundColor: ['#1a2a6c', '#27ae60', '#f39c12', '#b21f1f'] }]
        }
    });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("PharmaFormulator AI Batch Report", 14, 15);
    doc.autoTable({ html: '#formula-table', startY: 25 });
    doc.save("Batch_Report.pdf");
}

updateUI();
