const UI_DATA = {
    en: {
        title: "PharmaFormulator Pro", sub: "Integrated Manufacturing & Logistics System",
        run: "Generate Full Report", active: "Active Ingredient",
        filler: "Filler/Diluent", binder: "Binding Agent", lub: "Lubricant",
        disint: "Disintegrant", glidant: "Glidant", coating: "Coating Polymer",
        sweetener: "Sweetening Agent", solvent: "Solvent/Vehicle",
        h_rec: "3. Manufacturing & Storage Recommendations",
        rec_pkg: "Packaging Type", rec_store: "Storage Conditions",
        rec_method: "Optimal Manufacturing Method", rec_area: "Storage Area"
    },
    ar: {
        title: "فارما فورميوليتور برو", sub: "نظام التصنيع والخدمات اللوجستية المتكامل",
        run: "توليد التقرير الكامل", active: "المادة الفعالة",
        filler: "مادة مالئة", binder: "مادة رابطة", lub: "مادة مزلقة",
        disint: "مادة مفككة", glidant: "مادة محسنة للانسياب", coating: "بوليمر تغليف",
        sweetener: "مادة محلية", solvent: "مذيب / حامل",
        h_rec: "3. التوصيات النهائية (التصنيع والتخزين)",
        rec_pkg: "شكل التغليف المناسب", rec_store: "ظروف التخزين المثلى",
        rec_method: "الطريقة المثلى للتصنيع", rec_area: "مساحة التخزين"
    }
};

let myChart = null;

function updateUI() {
    const l = document.getElementById('lang').value;
    const t = UI_DATA[l];
    document.getElementById('app-container').className = (l === 'ar' ? 'container rtl' : 'container');
    document.getElementById('main-title').innerText = t.title;
    document.getElementById('btn-run').innerText = t.run;
    document.getElementById('h-rec').innerText = t.h_rec;
}

function runFormulator() {
    const l = document.getElementById('lang').value;
    const t = UI_DATA[l];
    const form = document.getElementById('dosage-form').value;
    const units = parseInt(document.getElementById('batch-units').value);
    const apiName = document.getElementById('api-name').value;
    const dose = parseFloat(document.getElementById('api-dose').value);

    // بناء التركيبة مع المواد الإضافية ووظائفها
    let formula = [{ name: apiName, role: t.active, qty: dose, cost: 0.1 }];
    
    if (form.includes('tablet')) {
        formula.push({ name: "Microcrystalline Cellulose", role: t.filler, qty: dose * 0.4, cost: 0.01 });
        formula.push({ name: "PVP K30", role: t.binder, qty: dose * 0.05, cost: 0.04 });
        formula.push({ name: "Croscarmellose Sodium", role: t.disint, qty: dose * 0.03, cost: 0.03 });
        formula.push({ name: "Magnesium Stearate", role: t.lub, qty: 5, cost: 0.02 });
        if (form === 'coated') formula.push({ name: "HPMC / Opadry", role: t.coating, qty: 15, cost: 0.07 });
    } else if (form === 'syrup') {
        formula.push({ name: "Sorbitol / Sucrose", role: t.sweetener, qty: dose * 3, cost: 0.01 });
        formula.push({ name: "Purified Water", role: t.solvent, qty: dose * 5, cost: 0.002 });
        formula.push({ name: "Xanthan Gum", role: "Thickener", qty: 10, cost: 0.05 });
    }

    renderTable(formula);
    renderChart(formula);
    renderRecommendations(form, units, l);

    document.getElementById('results').style.display = 'block';
    JsBarcode("#barcode", "LOT-" + Date.now(), { height: 30, displayValue: false });
}

function renderTable(formula) {
    const totalQty = formula.reduce((s, i) => s + i.qty, 0);
    const totalCost = formula.reduce((s, i) => s + (i.qty * i.cost), 0);
    document.getElementById('table-body').innerHTML = formula.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td><span class="role-tag">${i.role}</span></td>
            <td>${i.qty.toFixed(1)} mg</td>
            <td>${((i.qty / totalQty) * 100).toFixed(1)}%</td>
            <td>${(((i.qty * i.cost) / totalCost) * 100).toFixed(1)}%</td>
        </tr>
    `).join('');
}

function renderRecommendations(form, units, l) {
    const t = UI_DATA[l];
    const recs = {
        tablet: { method: "Wet Granulation / Direct Compression", pkg: "Alu-PVC Blister Pack", temp: "Controlled Ambient < 30°C" },
        coated: { method: "Film Coating Process", pkg: "Alu-Alu Blister Pack", temp: "Controlled Ambient < 25°C" },
        syrup: { method: "Closed-System Mixing", pkg: "Amber Glass / PET Bottles", temp: "Cool Place 15-25°C" },
        dry_powder: { method: "Dry Powder Blending", pkg: "HDPE Bottles with Induction Seal", temp: "Dry Place < 30°C" },
        capsule: { method: "Encapsulation / Powder Filling", pkg: "PVC-PVDC Blister", temp: "Controlled Ambient < 25°C" }
    };

    const pallets = Math.ceil(units / 5000);
    const data = recs[form];

    document.getElementById('logistics-recommendations').innerHTML = `
        <div class="rec-node"><strong>${t.rec_method}:</strong><br>${data.method}</div>
        <div class="rec-node"><strong>${t.rec_pkg}:</strong><br>${data.pkg}</div>
        <div class="rec-node"><strong>${t.rec_store}:</strong><br>${data.temp}</div>
        <div class="rec-node" style="border-left:4px solid #27ae60"><strong>${t.rec_area}:</strong><br>${pallets} Pallets / ${(pallets*1.6).toFixed(1)} m²</div>
    `;
}

function renderChart(formula) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formula.map(i => i.name),
            datasets: [{
                data: formula.map(i => i.qty * i.cost),
                backgroundColor: ['#0a3d62', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6']
            }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }
    });
}

window.onload = updateUI;
