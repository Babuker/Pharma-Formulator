const translations = {
    en: {
        title: "PharmaFormulator Pro", sub: "Integrated Manufacturing & Logistics System",
        run: "Generate Full Report", lbl_api: "API Name & Dose (mg)",
        lbl_batch: "Batch Size (Units)", lbl_strategy: "Formulation Strategy",
        h_batch: "2. Batch Details", active: "Active API", filler: "Filler", 
        binder: "Binder", coating: "Coating Agent",
        strat_info: "Selected Strategy", total_w: "Total Batch Weight", 
        total_c: "Total Production Cost", cost_u: "Cost Per Unit"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية المتكامل",
        run: "توليد التقرير الكامل", lbl_api: "اسم المادة والجرعة",
        lbl_batch: "حجم التشغيلة", lbl_strategy: "استراتيجية التركيبة",
        h_batch: "2. تفاصيل التشغيلة", active: "مادة فعالة", filler: "مادة مالئة", 
        binder: "مادة رابطة", coating: "عامل تغليف",
        strat_info: "الاستراتيجية المختارة", total_w: "إجمالي وزن التشغيلة", 
        total_c: "إجمالي تكلفة الإنتاج", cost_u: "التكلفة لكل وحدة"
    }
};

let myChart = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    document.getElementById('app-container').dir = l === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('lbl-api').innerText = t.lbl_api;
    document.getElementById('lbl-batch').innerText = t.lbl_batch;
    document.getElementById('lbl-strategy').innerText = t.lbl_strategy;
    document.getElementById('h-batch').innerText = t.h_batch;
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = translations[l];
    const name = document.getElementById('api-name').value || "API";
    const dose = parseFloat(document.getElementById('api-dose').value) || 500;
    const units = parseInt(document.getElementById('batch-units').value) || 10000;
    const strategy = document.getElementById('strategy').value;
    const form = document.getElementById('dosage-form').value;

    // معامل الاستراتيجية (تأثير على التكلفة والكميات)
    let costFactor = strategy === 'economy' ? 0.7 : (strategy === 'quality' ? 1.4 : 1.0);
    
    let formula = [
        { name: name, role: t.active, qty: dose, cost: 0.15 * costFactor },
        { name: "MCC PH102", role: t.filler, qty: dose * 0.4, cost: 0.01 * costFactor },
        { name: "PVP K30", role: t.binder, qty: dose * 0.05, cost: 0.05 * costFactor }
    ];

    if(form === 'coated') formula.push({ name: "Opadry White", role: t.coating, qty: 15, cost: 0.08 });

    // 1. حسابات الجدول
    const totalQtyUnit = formula.reduce((s, i) => s + i.qty, 0);
    const totalCostUnit = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td>${i.name}</td>
            <td>${i.role}</td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${((i.qty/totalQtyUnit)*100).toFixed(1)}%</td>
            <td>${(((i.qty*i.cost)/totalCostUnit)*100).toFixed(1)}%</td>
        </tr>
    `).join('');

    // 2. تفاصيل التشغيلة (Batch Details)
    const totalBatchWeight = (totalQtyUnit * units / 1000000).toFixed(2); // kg
    const totalBatchCost = (totalCostUnit * units).toFixed(2);
    
    const strategyText = {
        economy: l === 'ar' ? "اقتصادية (أقل تكلفة)" : "Economy (Cost Optimized)",
        quality: l === 'ar' ? "جودة عالية (أفضل موردين)" : "Premium Quality",
        balanced: l === 'ar' ? "متوازنة (معياري)" : "Balanced Standard"
    };

    document.getElementById('batch-summary').innerHTML = `
        <div class="batch-row"><span>${t.strat_info}:</span> <strong>${strategyText[strategy]}</strong></div>
        <div class="batch-row"><span>${t.total_w}:</span> <strong>${totalBatchWeight} kg</strong></div>
        <div class="batch-row"><span>${t.total_c}:</span> <strong>$${totalBatchCost}</strong></div>
        <div class="batch-row"><span>${t.cost_u}:</span> <strong>$${totalCostUnit.toFixed(4)}</strong></div>
    `;

    // 3. المخطط الدائري
    updateChart(formula, l);

    // 4. الخدمات اللوجستية
    const pallets = Math.ceil(units / 5000);
    document.getElementById('logistics-data').innerHTML = `
        <div class="info-box">📦 Boxes: ${Math.ceil(units/100)}</div>
        <div class="info-box">📏 Area: ${(pallets * 1.5).toFixed(1)} m²</div>
        <div class="info-box">🚚 Pallets: ${pallets}</div>
    `;

    document.getElementById('results').style.display = 'block';
    JsBarcode("#barcode", name + "-" + units, { height: 30, displayValue: false });
}

function updateChart(formula, lang) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
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

window.onload = updateUI;
