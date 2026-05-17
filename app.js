const STORAGE_KEY = "fg2_warenherstellung_calculator_v1";

const FACTORIES = {
  steel: "Stahlfabrik",
  vehicle: "Fahrzeugfabrik"
};

const defaultState = {
  materials: ["Eisen", "Kohle", "Kupfer", "Aluminium", "Gummi", "Elektronik", "Glas", "Kunststoff"],
  products: {
    steel: [
      {
        id: cryptoId(),
        name: "Stahlbarren",
        output: 1,
        recipe: [
          { material: "Eisen", amount: 3 },
          { material: "Kohle", amount: 2 }
        ]
      },
      {
        id: cryptoId(),
        name: "Stahlträger",
        output: 1,
        recipe: [
          { material: "Stahlbarren", amount: 2 },
          { material: "Kohle", amount: 1 }
        ]
      }
    ],
    vehicle: [
      {
        id: cryptoId(),
        name: "Karosserie",
        output: 1,
        recipe: [
          { material: "Stahlbarren", amount: 8 },
          { material: "Aluminium", amount: 4 },
          { material: "Glas", amount: 2 }
        ]
      },
      {
        id: cryptoId(),
        name: "Fahrzeugreifen",
        output: 4,
        recipe: [
          { material: "Gummi", amount: 6 },
          { material: "Stahlbarren", amount: 1 }
        ]
      }
    ]
  },
  plan: [
    { id: cryptoId(), factory: "steel", productId: null, quantity: 1 },
    { id: cryptoId(), factory: "vehicle", productId: null, quantity: 1 }
  ]
};

defaultState.plan[0].productId = defaultState.products.steel[0].id;
defaultState.plan[1].productId = defaultState.products.vehicle[0].id;
for (const product of [...defaultState.products.steel, ...defaultState.products.vehicle]) {
  if (!defaultState.materials.includes(product.name)) defaultState.materials.push(product.name);
}

let state = loadState();

const els = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  steelProducts: document.querySelector("#steelProducts"),
  vehicleProducts: document.querySelector("#vehicleProducts"),
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
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      els.tabs.forEach((item) => item.classList.remove("active"));
      els.panels.forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`#${tab.dataset.target}`).classList.add("active");
    });
  });

  document.querySelectorAll(".add-product-btn").forEach((button) => {
    button.addEventListener("click", () => addProduct(button.dataset.factory));
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
  renderMaterials();
  renderProducts("steel");
  renderProducts("vehicle");
  renderPlan();
  renderRequirements();
  saveState();
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

function renderProducts(factory) {
  const container = factory === "steel" ? els.steelProducts : els.vehicleProducts;
  container.innerHTML = "";

  if (!state.products[factory].length) {
    container.innerHTML = `<div class="empty-state">Noch keine Waren vorhanden.</div>`;
    return;
  }

  state.products[factory].forEach((product) => {
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
      const row = createRecipeRow(product, index, recipeItem);
      recipeBody.appendChild(row);
    });

    container.appendChild(node);
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
  const factory = "steel";
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
  state = structuredClone(defaultState);
  renderAll();
}

function updatePlanProductOptions(select, factory, selectedProductId) {
  const options = state.products[factory].map((product) => ({ value: product.id, label: product.name }));
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
  return [...state.products.steel, ...state.products.vehicle].find((product) => product.id === productId) ?? null;
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
  for (const product of [...state.products.steel, ...state.products.vehicle]) {
    for (const recipeItem of product.recipe) {
      if (recipeItem.material === oldName) recipeItem.material = newName;
    }
  }
  renderAll();
}

function isMaterialInUse(materialName) {
  return [...state.products.steel, ...state.products.vehicle].some((product) =>
    product.recipe.some((recipeItem) => recipeItem.material === materialName)
  );
}

function normalizeState() {
  state.materials = unique((state.materials ?? []).map(cleanText).filter(Boolean));
  state.products ??= { steel: [], vehicle: [] };
  state.products.steel ??= [];
  state.products.vehicle ??= [];
  state.plan ??= [];

  for (const factory of Object.keys(FACTORIES)) {
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

  for (const product of [...state.products.steel, ...state.products.vehicle]) {
    ensureMaterial(product.name);
    product.recipe.forEach((item) => ensureMaterial(item.material));
  }

  state.plan = state.plan.map((item) => {
    const factory = FACTORIES[item.factory] ? item.factory : "steel";
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
  if (!value.products || !Array.isArray(value.products.steel) || !Array.isArray(value.products.vehicle)) {
    throw new Error("Feld 'products.steel' oder 'products.vehicle' fehlt oder ist ungültig.");
  }
  if (!Array.isArray(value.plan)) throw new Error("Feld 'plan' fehlt oder ist ungültig.");
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(defaultState);
    const parsed = JSON.parse(saved);
    validateImportedState(parsed);
    return parsed;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
