const STORAGE_KEY = "fg2_warenherstellung_calculator_v2";
const LEGACY_STORAGE_KEY = "fg2_warenherstellung_calculator_v1";

const FACTORIES = {
  steel: "Stahlfabrik",
  vehicle: "Fahrzeugfabrik",
  clothing: "Kleidungsfabrik",
  aircraft: "Luftfahrzeugfabrik",
  boat: "Bootsfabrik",
  oil: "Ölfabrik",
  goods: "Warenfabrik",
  chemistry: "Chemiefabrik",
  illegalWeapons: "Illegale Waffenfabrik"
};

const DEFAULT_MATERIALS = [
  "Eisen",
  "Kohle",
  "Kupfer",
  "Aluminium",
  "Gummi",
  "Elektronik",
  "Glas",
  "Kunststoff",
  "Stoff",
  "Leder",
  "Fasern",
  "Rohöl",
  "Treibstoff",
  "Chemikalien",
  "Schwefel",
  "Werkzeugteile",
  "Holz",
  "Lack",
  "Sprengstoffkomponenten",
  "Waffenteile"
];

const defaultState = createDefaultState();
let state = loadState();

const els = {
  tabs: document.querySelector("#tabs"),
  factorySelect: document.querySelector("#factorySelect"),
  factoryPanels: document.querySelector("#factoryPanels"),
  materialsTableBody: document.querySelector("#materialsTable tbody"),
  planTableBody: document.querySelector("#planTable tbody"),
  requirementsTableBody: document.querySelector("#requirementsTable tbody"),
  addPlanRowBtn: document.querySelector("#addPlanRowBtn"),
  addMaterialBtn: document.querySelector("#addMaterialBtn"),
  copyMaterialsBtn: document.querySelector("#copyMaterialsBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  resetDataBtn: document.querySelector("#resetDataBtn"),
  kpiPositions: document.querySelector("#kpiPositions"),
  kpiRuns: document.querySelector("#kpiRuns"),
  kpiMaterials: document.querySelector("#kpiMaterials"),
  factoryPanelTemplate: document.querySelector("#factoryPanelTemplate"),
  productTemplate: document.querySelector("#productTemplate"),
  recipeRowTemplate: document.querySelector("#recipeRowTemplate"),
  planRowTemplate: document.querySelector("#planRowTemplate")
};

init();

function init() {
  bindStaticEvents();
  renderAll();
}

function bindStaticEvents() {
  els.tabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    activateTab(tab.dataset.target);
  });

  els.factorySelect.addEventListener("change", () => {
    if (els.factorySelect.value) {
      activateTab(els.factorySelect.value);
    }
  });

  els.addMaterialBtn.addEventListener("click", addMaterial);
  els.addPlanRowBtn.addEventListener("click", addPlanRow);
  els.copyMaterialsBtn.addEventListener("click", copyRequirementsTable);
  els.exportDataBtn.addEventListener("click", exportData);
  els.importDataInput.addEventListener("change", importData);
  els.resetDataBtn.addEventListener("click", resetData);
}

function renderAll() {
  normalizeState();
  renderFactoryNavigation();
  renderFactoryPanels();
  renderMaterials();
  renderPlan();
  renderRequirements();
  saveState();
}

function renderFactoryNavigation() {
  const currentValue = els.factorySelect.value;
  els.factorySelect.innerHTML = `<option value="">Fabrik auswählen</option>`;

  for (const [key, label] of Object.entries(FACTORIES)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    els.factorySelect.appendChild(option);
  }

  if (FACTORIES[currentValue]) {
    els.factorySelect.value = currentValue;
  }
}

function renderFactoryPanels() {
  const activeTarget = document.querySelector(".panel.active")?.id || document.querySelector(".tab.active")?.dataset.target || "calculator";
  els.factoryPanels.innerHTML = "";

  for (const [factory, label] of Object.entries(FACTORIES)) {
    const panel = els.factoryPanelTemplate.content.firstElementChild.cloneNode(true);
    panel.id = factory;
    panel.querySelector(".factory-title").textContent = `${label}-Rezepte`;
    panel.querySelector(".add-product-btn").addEventListener("click", () => addProduct(factory));

    const container = panel.querySelector(".product-list");
    if (!state.products[factory].length) {
      container.innerHTML = `<div class="empty-state">Noch keine Waren vorhanden.</div>`;
    } else {
      state.products[factory].forEach((product) => {
        container.appendChild(createProductCard(factory, product));
      });
    }

    els.factoryPanels.appendChild(panel);
  }

  activateTab(document.getElementById(activeTarget) ? activeTarget : "calculator");
}

function createProductCard(factory, product) {
  const node = els.productTemplate.content.firstElementChild.cloneNode(true);
  const nameInput = node.querySelector(".product-name");
  const outputInput = node.querySelector(".product-output");
  const recipeBody = node.querySelector(".recipe-table tbody");

  nameInput.value = product.name;
  outputInput.value = product.output;

  nameInput.addEventListener("change", () => {
    const newName = cleanText(nameInput.value);
    if (!newName) {
      nameInput.value = product.name;
      return;
    }
    product.name = newName;
    ensureMaterial(newName);
    renderAll();
  });

  outputInput.addEventListener("change", () => {
    product.output = positiveInteger(outputInput.value, 1);
    renderAll();
  });

  node.querySelector(".remove-product").addEventListener("click", () => {
    state.products[factory] = state.products[factory].filter((item) => item.id !== product.id);
    state.plan = state.plan.filter((item) => item.productId !== product.id);
    renderAll();
  });

  node.querySelector(".add-recipe-row").addEventListener("click", () => {
    ensureMinimumMaterial();
    product.recipe.push({ material: state.materials[0], amount: 1 });
    renderAll();
  });

  product.recipe.forEach((recipeItem, index) => {
    recipeBody.appendChild(createRecipeRow(product, index, recipeItem));
  });

  return node;
}

function activateTab(targetId) {
  document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === targetId));

  if (FACTORIES[targetId]) {
    els.factorySelect.value = targetId;
  } else {
    els.factorySelect.value = "";
  }
}

function renderMaterials() {
  els.materialsTableBody.innerHTML = "";
  state.materials.forEach((material, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" value="${escapeHtml(material)}" aria-label="Materialname" /></td>
      <td><button class="icon-button" type="button" aria-label="Material entfernen">×</button></td>
    `;

    row.querySelector("input").addEventListener("change", (event) => {
      const oldName = state.materials[index];
      const newName = cleanText(event.target.value);
      if (!newName) {
        event.target.value = oldName;
        return;
      }
      renameMaterial(oldName, newName);
    });

    row.querySelector("button").addEventListener("click", () => {
      const name = state.materials[index];
      if (isMaterialInUse(name)) {
        alert(`Das Material "${name}" wird noch in Rezepten verwendet und kann nicht gelöscht werden.`);
        return;
      }
      state.materials.splice(index, 1);
      renderAll();
    });

    els.materialsTableBody.appendChild(row);
  });
}

function createRecipeRow(product, index, recipeItem) {
  const row = els.recipeRowTemplate.content.firstElementChild.cloneNode(true);
  const materialSelect = row.querySelector(".recipe-material");
  const amountInput = row.querySelector(".recipe-amount");

  fillSelect(materialSelect, state.materials.map((material) => ({ value: material, label: material })), recipeItem.material);
  amountInput.value = recipeItem.amount;

  materialSelect.addEventListener("change", () => {
    product.recipe[index].material = materialSelect.value;
    renderAll();
  });

  amountInput.addEventListener("change", () => {
    product.recipe[index].amount = positiveInteger(amountInput.value, 0);
    renderAll();
  });

  row.querySelector(".remove-recipe-row").addEventListener("click", () => {
    product.recipe.splice(index, 1);
    renderAll();
  });

  return row;
}

function renderPlan() {
  els.planTableBody.innerHTML = "";

  if (!state.plan.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="empty-state">Noch keine Produktionspositionen vorhanden.</td>`;
    els.planTableBody.appendChild(row);
    return;
  }

  state.plan.forEach((item) => {
    const row = els.planRowTemplate.content.firstElementChild.cloneNode(true);
    const factorySelect = row.querySelector(".plan-factory");
    const productSelect = row.querySelector(".plan-product");
    const quantityInput = row.querySelector(".plan-quantity");
    const outputCell = row.querySelector(".plan-output");
    const runsCell = row.querySelector(".plan-runs");

    fillSelect(factorySelect, Object.entries(FACTORIES).map(([value, label]) => ({ value, label })), item.factory);
    updatePlanProductOptions(productSelect, item.factory, item.productId);

    const product = findProduct(item.productId);
    const output = product ? positiveInteger(product.output, 1) : 1;
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;

    quantityInput.value = quantity;
    outputCell.textContent = output.toLocaleString("de-DE");
    runsCell.textContent = runs.toLocaleString("de-DE");

    factorySelect.addEventListener("change", () => {
      item.factory = factorySelect.value;
      item.productId = state.products[item.factory][0]?.id ?? null;
      renderAll();
    });

    productSelect.addEventListener("change", () => {
      item.productId = productSelect.value;
      renderAll();
    });

    quantityInput.addEventListener("change", () => {
      item.quantity = positiveInteger(quantityInput.value, 0);
      renderAll();
    });

    row.querySelector(".remove-plan-row").addEventListener("click", () => {
      state.plan = state.plan.filter((planItem) => planItem.id !== item.id);
      renderAll();
    });

    els.planTableBody.appendChild(row);
  });
}

function renderRequirements() {
  const requirements = calculateRequirements();
  els.requirementsTableBody.innerHTML = "";

  const entries = Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de"));
  if (!entries.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="2" class="empty-state">Keine Materialien benötigt.</td>`;
    els.requirementsTableBody.appendChild(row);
  } else {
    entries.forEach(([material, amount]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${escapeHtml(material)}</td><td>${amount.toLocaleString("de-DE")}</td>`;
      els.requirementsTableBody.appendChild(row);
    });
  }

  const totalRuns = state.plan.reduce((sum, item) => {
    const product = findProduct(item.productId);
    if (!product) return sum;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    return sum + (quantity > 0 ? Math.ceil(quantity / output) : 0);
  }, 0);

  els.kpiPositions.textContent = state.plan.length.toLocaleString("de-DE");
  els.kpiRuns.textContent = totalRuns.toLocaleString("de-DE");
  els.kpiMaterials.textContent = entries.length.toLocaleString("de-DE");
}

function calculateRequirements() {
  const totals = {};

  for (const item of state.plan) {
    const product = findProduct(item.productId);
    if (!product) continue;

    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;

    for (const recipeItem of product.recipe) {
      const material = cleanText(recipeItem.material);
      const amount = positiveInteger(recipeItem.amount, 0);
      if (!material || amount <= 0) continue;
      totals[material] = (totals[material] ?? 0) + amount * runs;
    }
  }

  return totals;
}

function addProduct(factory) {
  ensureMinimumMaterial();
  const product = {
    id: cryptoId(),
    name: "Neue Ware",
    output: 1,
    recipe: [{ material: state.materials[0], amount: 1 }]
  };
  state.products[factory].push(product);
  ensureMaterial(product.name);
  renderAll();
  activateTab(factory);
}

function addMaterial() {
  let base = "Neues Material";
  let name = base;
  let counter = 2;
  while (state.materials.includes(name)) {
    name = `${base} ${counter}`;
    counter += 1;
  }
  state.materials.push(name);
  renderAll();
}

function addPlanRow() {
  const factory = firstFactoryWithProduct() || Object.keys(FACTORIES)[0];
  state.plan.push({
    id: cryptoId(),
    factory,
    productId: state.products[factory][0]?.id ?? null,
    quantity: 1
  });
  renderAll();
}

async function copyRequirementsTable() {
  const requirements = calculateRequirements();
  const lines = [["Material", "Gesamtbedarf"], ...Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de"))]
    .map((row) => row.join("\t"));

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    els.copyMaterialsBtn.textContent = "Kopiert";
    setTimeout(() => (els.copyMaterialsBtn.textContent = "Tabelle kopieren"), 1400);
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "warenherstellung-daten.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      validateImportedState(imported);
      state = imported;
      renderAll();
    } catch (error) {
      alert(`Import fehlgeschlagen: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (!confirm("Alle lokal gespeicherten Daten werden auf die Beispielwerte zurückgesetzt. Fortfahren?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  renderAll();
}

function updatePlanProductOptions(select, factory, selectedProductId) {
  const products = state.products[factory] ?? [];
  const options = products.length
    ? products.map((product) => ({ value: product.id, label: product.name }))
    : [{ value: "", label: "Keine Ware vorhanden" }];
  fillSelect(select, options, selectedProductId);
}

function fillSelect(select, options, selectedValue) {
  select.innerHTML = "";
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    select.appendChild(node);
  });
  if (selectedValue && options.some((option) => option.value === selectedValue)) {
    select.value = selectedValue;
  }
}

function findProduct(productId) {
  if (!productId) return null;
  return Object.values(state.products).flat().find((product) => product.id === productId) ?? null;
}

function ensureMaterial(name) {
  const cleaned = cleanText(name);
  if (cleaned && !state.materials.includes(cleaned)) state.materials.push(cleaned);
}

function ensureMinimumMaterial() {
  if (!state.materials.length) state.materials.push("Material");
}

function renameMaterial(oldName, newName) {
  if (oldName === newName) return;
  if (state.materials.includes(newName)) {
    alert(`Das Material "${newName}" existiert bereits.`);
    renderAll();
    return;
  }

  state.materials = state.materials.map((material) => (material === oldName ? newName : material));
  for (const product of Object.values(state.products).flat()) {
    for (const recipeItem of product.recipe) {
      if (recipeItem.material === oldName) recipeItem.material = newName;
    }
  }
  renderAll();
}

function isMaterialInUse(materialName) {
  return Object.values(state.products).flat().some((product) =>
    product.recipe.some((recipeItem) => recipeItem.material === materialName)
  );
}

function normalizeState() {
  const fallbackState = createDefaultState();
  state.materials = unique((state.materials ?? []).map(cleanText).filter(Boolean));
  state.products ??= {};
  state.plan ??= [];

  for (const factory of Object.keys(FACTORIES)) {
    state.products[factory] ??= fallbackState.products[factory] ?? [];
    state.products[factory] = state.products[factory].map((product) => ({
      id: product.id || cryptoId(),
      name: cleanText(product.name) || "Unbenannte Ware",
      output: positiveInteger(product.output, 1),
      recipe: Array.isArray(product.recipe)
        ? product.recipe.map((item) => ({
            material: cleanText(item.material) || state.materials[0] || "Material",
            amount: positiveInteger(item.amount, 0)
          }))
        : []
    }));
  }

  for (const product of Object.values(state.products).flat()) {
    ensureMaterial(product.name);
    product.recipe.forEach((item) => ensureMaterial(item.material));
  }

  state.plan = state.plan.map((item) => {
    const factory = FACTORIES[item.factory] ? item.factory : Object.keys(FACTORIES)[0];
    const validProduct = state.products[factory].some((product) => product.id === item.productId);
    return {
      id: item.id || cryptoId(),
      factory,
      productId: validProduct ? item.productId : state.products[factory][0]?.id ?? null,
      quantity: positiveInteger(item.quantity, 0)
    };
  });
}

function validateImportedState(value) {
  if (!value || typeof value !== "object") throw new Error("Datei enthält kein gültiges Objekt.");
  if (!Array.isArray(value.materials)) throw new Error("Feld 'materials' fehlt oder ist ungültig.");
  if (!value.products || typeof value.products !== "object") throw new Error("Feld 'products' fehlt oder ist ungültig.");
  for (const factory of Object.keys(FACTORIES)) {
    if (value.products[factory] !== undefined && !Array.isArray(value.products[factory])) {
      throw new Error(`Feld 'products.${factory}' ist ungültig.`);
    }
  }
  if (!Array.isArray(value.plan)) throw new Error("Feld 'plan' fehlt oder ist ungültig.");
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return createDefaultState();
    const parsed = JSON.parse(saved);
    validateImportedState(parsed);
    return parsed;
  } catch {
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function firstFactoryWithProduct() {
  return Object.keys(FACTORIES).find((factory) => state.products[factory]?.length);
}

function createDefaultState() {
  const products = {
    steel: [
      createProduct("Stahlbarren", 1, [
        ["Eisen", 3],
        ["Kohle", 2]
      ]),
      createProduct("Stahlträger", 1, [
        ["Stahlbarren", 2],
        ["Kohle", 1]
      ])
    ],
    vehicle: [
      createProduct("Karosserie", 1, [
        ["Stahlbarren", 8],
        ["Aluminium", 4],
        ["Glas", 2]
      ]),
      createProduct("Fahrzeugreifen", 4, [
        ["Gummi", 6],
        ["Stahlbarren", 1]
      ])
    ],
    clothing: [
      createProduct("Arbeitskleidung", 1, [
        ["Stoff", 4],
        ["Leder", 1]
      ]),
      createProduct("Schutzweste", 1, [
        ["Stoff", 3],
        ["Kunststoff", 2],
        ["Stahlbarren", 1]
      ])
    ],
    aircraft: [
      createProduct("Flugzeugrumpf", 1, [
        ["Aluminium", 12],
        ["Elektronik", 4],
        ["Glas", 3]
      ]),
      createProduct("Rotorblatt", 2, [
        ["Aluminium", 6],
        ["Kunststoff", 3]
      ])
    ],
    boat: [
      createProduct("Bootsrumpf", 1, [
        ["Holz", 8],
        ["Aluminium", 4],
        ["Lack", 2]
      ]),
      createProduct("Bootsmotor", 1, [
        ["Stahlbarren", 5],
        ["Elektronik", 2],
        ["Gummi", 1]
      ])
    ],
    oil: [
      createProduct("Treibstoff", 5, [
        ["Rohöl", 10],
        ["Chemikalien", 1]
      ]),
      createProduct("Schmieröl", 3, [
        ["Rohöl", 6],
        ["Kunststoff", 1]
      ])
    ],
    goods: [
      createProduct("Werkzeugkiste", 1, [
        ["Werkzeugteile", 4],
        ["Stahlbarren", 2],
        ["Kunststoff", 1]
      ]),
      createProduct("Haushaltswaren", 2, [
        ["Kunststoff", 4],
        ["Glas", 2]
      ])
    ],
    chemistry: [
      createProduct("Chemikalien", 2, [
        ["Schwefel", 3],
        ["Rohöl", 2]
      ]),
      createProduct("Kunststoff", 3, [
        ["Rohöl", 4],
        ["Chemikalien", 1]
      ])
    ],
    illegalWeapons: [
      createProduct("Waffenteile", 1, [
        ["Stahlbarren", 3],
        ["Werkzeugteile", 2]
      ]),
      createProduct("Illegale Waffe", 1, [
        ["Waffenteile", 4],
        ["Stahlbarren", 2],
        ["Sprengstoffkomponenten", 1]
      ])
    ]
  };

  const materials = unique([...DEFAULT_MATERIALS]);
  for (const product of Object.values(products).flat()) {
    if (!materials.includes(product.name)) materials.push(product.name);
  }

  return {
    materials,
    products,
    plan: [
      { id: cryptoId(), factory: "steel", productId: products.steel[0].id, quantity: 1 },
      { id: cryptoId(), factory: "vehicle", productId: products.vehicle[0].id, quantity: 1 }
    ]
  };
}

function createProduct(name, output, recipePairs) {
  return {
    id: cryptoId(),
    name,
    output,
    recipe: recipePairs.map(([material, amount]) => ({ material, amount }))
  };
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function unique(values) {
  return [...new Set(values)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cryptoId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
