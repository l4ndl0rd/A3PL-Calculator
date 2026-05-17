const STORAGE_KEY = "fg2_warenherstellung_calculator_v4_empty";

const FACTORIES = {
  steel: "Stahlfabrik",
  vehicle: "Fahrzeugfabrik",
  clothing: "Kleidungsfabrik",
  aircraft: "Luftfahrzeugsfabrik",
  boat: "Bootsfabrik",
  oil: "Ölfabrik",
  goods: "Warenfabrik",
  chemistry: "Chemiefabrik",
  illegalWeapons: "Illegale Waffenfabrik"
};

let state = loadState();

const els = {
  tabs: document.querySelector("#tabs"),
  factoryPanels: document.querySelector("#factoryPanels"),
  materialsTableBody: document.querySelector("#materialsTable tbody"),
  planTableBody: document.querySelector("#planTable tbody"),
  requirementsTableBody: document.querySelector("#requirementsTable tbody"),
  rawRequirementsTableBody: document.querySelector("#rawRequirementsTable tbody"),
  rawRequirementsHint: document.querySelector("#rawRequirementsHint"),
  addPlanRowBtn: document.querySelector("#addPlanRowBtn"),
  addMaterialBtn: document.querySelector("#addMaterialBtn"),
  copyMaterialsBtn: document.querySelector("#copyMaterialsBtn"),
  copyRawMaterialsBtn: document.querySelector("#copyRawMaterialsBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  resetDataBtn: document.querySelector("#resetDataBtn"),
  kpiPositions: document.querySelector("#kpiPositions"),
  kpiRuns: document.querySelector("#kpiRuns"),
  kpiMaterials: document.querySelector("#kpiMaterials"),
  factoryPanelTemplate: document.querySelector("#factoryPanelTemplate"),
  productTemplate: document.querySelector("#productTemplate"),
  recipeRowTemplate: document.querySelector("#recipeRowTemplate"),
  materialRecipeRowTemplate: document.querySelector("#materialRecipeRowTemplate"),
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

  els.addMaterialBtn.addEventListener("click", addMaterial);
  els.addPlanRowBtn.addEventListener("click", addPlanRow);
  els.copyMaterialsBtn.addEventListener("click", copyRequirementsTable);
  els.copyRawMaterialsBtn.addEventListener("click", copyRawRequirementsTable);
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
  const activeTarget = document.querySelector(".panel.active")?.id || "calculator";
  const tabs = [
    { target: "calculator", label: "Calculator" },
    ...Object.entries(FACTORIES).map(([target, label]) => ({ target, label })),
    { target: "materials", label: "Materialien" }
  ];

  els.tabs.innerHTML = "";

  for (const tabInfo of tabs) {
    const button = document.createElement("button");
    button.className = "tab";
    button.dataset.target = tabInfo.target;
    button.type = "button";
    button.textContent = tabInfo.label;
    if (tabInfo.target === activeTarget) {
      button.classList.add("active");
    }
    els.tabs.appendChild(button);
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
  node.dataset.productId = product.id;

  const nameInput = node.querySelector(".product-name");
  const outputInput = node.querySelector(".product-output");
  const recipeBody = node.querySelector(".recipe-table tbody");

  nameInput.value = product.name;
  outputInput.value = product.output;

  nameInput.addEventListener("change", () => {
    const oldName = product.name;
    const newName = cleanText(nameInput.value);
    if (!newName) {
      nameInput.value = product.name;
      return;
    }
    product.name = newName;
    ensureMaterial(newName);
    replaceRecipeMaterialReferences(oldName, newName);
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
    product.recipe.unshift({ material: state.materials[0], amount: 1 });
    renderAll();
    activateTab(factory);
    queueFocus(`#${factory} .product-card[data-product-id="${cssEscape(product.id)}"] .recipe-table tbody tr:first-child .recipe-material`);
  });

  product.recipe.forEach((recipeItem, index) => {
    recipeBody.appendChild(createRecipeRow(product, index, recipeItem));
  });

  return node;
}

function activateTab(targetId) {
  document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === targetId));
}

function renderMaterials() {
  els.materialsTableBody.innerHTML = "";

  if (!state.materials.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="empty-state">Noch keine Materialien vorhanden.</td>`;
    els.materialsTableBody.appendChild(row);
    return;
  }

  state.materials.forEach((material, index) => {
    const recipeDef = getMaterialRecipe(material);
    const row = document.createElement("tr");
    row.className = "material-row";
    row.innerHTML = `
      <td><input class="material-name" type="text" value="${escapeHtml(material)}" aria-label="Materialname" /></td>
      <td><input class="material-output" type="number" min="1" step="1" value="${recipeDef.output}" aria-label="Ausstoß pro Unterrezept-Lauf" /></td>
      <td>
        <div class="nested-recipe">
          <table class="data-table compact nested-recipe-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Menge pro Lauf</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <button class="button button-secondary add-material-recipe-row" type="button">Unterrezept-Zeile hinzufügen</button>
        </div>
      </td>
      <td><button class="icon-button remove-material" type="button" aria-label="Material entfernen">×</button></td>
    `;

    row.querySelector(".material-name").addEventListener("change", (event) => {
      const oldName = state.materials[index];
      const newName = cleanText(event.target.value);
      if (!newName) {
        event.target.value = oldName;
        return;
      }
      renameMaterial(oldName, newName);
    });

    row.querySelector(".material-output").addEventListener("change", (event) => {
      getMaterialRecipe(material).output = positiveInteger(event.target.value, 1);
      renderAll();
      activateTab("materials");
    });

    const nestedBody = row.querySelector(".nested-recipe-table tbody");
    if (!recipeDef.recipe.length) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `<td colspan="3" class="empty-state">Kein Unterrezept. Wird als Rohmaterial behandelt.</td>`;
      nestedBody.appendChild(emptyRow);
    } else {
      recipeDef.recipe.forEach((recipeItem, recipeIndex) => {
        nestedBody.appendChild(createMaterialRecipeRow(material, recipeIndex, recipeItem));
      });
    }

    row.querySelector(".add-material-recipe-row").addEventListener("click", () => {
      ensureMinimumMaterial();
      const defaultMaterial = state.materials.find((item) => item !== material) || state.materials[0];
      getMaterialRecipe(material).recipe.unshift({ material: defaultMaterial, amount: 1 });
      renderAll();
      activateTab("materials");
      queueFocus(`#materialsTable tbody tr:nth-child(${index + 1}) .nested-recipe-table tbody tr:first-child .material-recipe-material`);
    });

    row.querySelector(".remove-material").addEventListener("click", () => {
      const name = state.materials[index];
      if (isMaterialInUse(name)) {
        alert(`Das Material "${name}" wird noch in Rezepten verwendet und kann nicht gelöscht werden.`);
        return;
      }
      state.materials.splice(index, 1);
      delete state.materialRecipes[name];
      renderAll();
    });

    els.materialsTableBody.appendChild(row);
  });
}

function createMaterialRecipeRow(materialName, index, recipeItem) {
  const row = els.materialRecipeRowTemplate.content.firstElementChild.cloneNode(true);
  const materialSelect = row.querySelector(".material-recipe-material");
  const amountInput = row.querySelector(".material-recipe-amount");

  fillSelect(materialSelect, state.materials.map((material) => ({ value: material, label: material })), recipeItem.material);
  amountInput.value = recipeItem.amount;

  materialSelect.addEventListener("change", () => {
    getMaterialRecipe(materialName).recipe[index].material = materialSelect.value;
    renderAll();
    activateTab("materials");
  });

  amountInput.addEventListener("change", () => {
    getMaterialRecipe(materialName).recipe[index].amount = positiveInteger(amountInput.value, 0);
    renderAll();
    activateTab("materials");
  });

  row.querySelector(".remove-material-recipe-row").addEventListener("click", () => {
    getMaterialRecipe(materialName).recipe.splice(index, 1);
    renderAll();
    activateTab("materials");
  });

  return row;
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
    const output = product ? positiveInteger(product.output, 1) : 0;
    const quantity = positiveInteger(item.quantity, 0);
    const runs = product && quantity > 0 ? Math.ceil(quantity / output) : 0;

    quantityInput.value = quantity;
    outputCell.textContent = output.toLocaleString("de-DE");
    runsCell.textContent = runs.toLocaleString("de-DE");

    factorySelect.addEventListener("change", () => {
      item.factory = factorySelect.value;
      item.productId = state.products[item.factory][0]?.id ?? null;
      renderAll();
    });

    productSelect.addEventListener("change", () => {
      item.productId = productSelect.value || null;
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
  const directRequirements = calculateRequirements();
  const rawResult = calculateRawRequirements();
  renderRequirementTable(els.requirementsTableBody, directRequirements, "Keine Materialien benötigt.");
  renderRequirementTable(els.rawRequirementsTableBody, rawResult.totals, "Keine Rohmaterialien benötigt.");

  if (rawResult.warnings.length) {
    els.rawRequirementsHint.textContent = `Hinweis: ${unique(rawResult.warnings).join(" ")}`;
    els.rawRequirementsHint.hidden = false;
  } else {
    els.rawRequirementsHint.hidden = true;
  }

  const directEntries = Object.entries(directRequirements);
  const totalRuns = state.plan.reduce((sum, item) => {
    const product = findProduct(item.productId);
    if (!product) return sum;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    return sum + (quantity > 0 ? Math.ceil(quantity / output) : 0);
  }, 0);

  els.kpiPositions.textContent = state.plan.length.toLocaleString("de-DE");
  els.kpiRuns.textContent = totalRuns.toLocaleString("de-DE");
  els.kpiMaterials.textContent = directEntries.length.toLocaleString("de-DE");
}

function renderRequirementTable(tbody, requirements, emptyText) {
  tbody.innerHTML = "";
  const entries = Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de"));
  if (!entries.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="2" class="empty-state">${escapeHtml(emptyText)}</td>`;
    tbody.appendChild(row);
    return;
  }

  entries.forEach(([material, amount]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${escapeHtml(material)}</td><td>${amount.toLocaleString("de-DE")}</td>`;
    tbody.appendChild(row);
  });
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

function calculateRawRequirements() {
  const totals = {};
  const warnings = [];

  for (const item of state.plan) {
    const product = findProduct(item.productId);
    if (!product) continue;

    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;

    for (const recipeItem of product.recipe) {
      const material = cleanText(recipeItem.material);
      const amount = positiveInteger(recipeItem.amount, 0) * runs;
      if (!material || amount <= 0) continue;
      expandRawMaterial(material, amount, totals, warnings, new Set([product.id]));
    }
  }

  return { totals, warnings };
}

function expandRawMaterial(material, requiredAmount, totals, warnings, productStack) {
  const materialRecipe = getExistingMaterialRecipe(material);

  if (materialRecipe?.recipe?.length) {
    const materialKey = `material:${material.toLocaleLowerCase("de-DE")}`;
    if (productStack.has(materialKey)) {
      addTotal(totals, material, requiredAmount);
      warnings.push(`Zyklisches Unterrezept bei "${material}" erkannt; dieser Eintrag wurde als Rohmaterial behandelt.`);
      return;
    }

    const output = positiveInteger(materialRecipe.output, 1);
    const runs = Math.ceil(requiredAmount / output);
    const nextStack = new Set(productStack);
    nextStack.add(materialKey);

    for (const recipeItem of materialRecipe.recipe) {
      const childMaterial = cleanText(recipeItem.material);
      const amount = positiveInteger(recipeItem.amount, 0) * runs;
      if (!childMaterial || amount <= 0) continue;
      expandRawMaterial(childMaterial, amount, totals, warnings, nextStack);
    }
    return;
  }

  const craftableProduct = findProductByName(material);

  if (!craftableProduct || !craftableProduct.recipe.length) {
    addTotal(totals, material, requiredAmount);
    return;
  }

  if (productStack.has(craftableProduct.id)) {
    addTotal(totals, material, requiredAmount);
    warnings.push(`Zyklisches Warenrezept bei "${material}" erkannt; dieser Eintrag wurde als Rohmaterial behandelt.`);
    return;
  }

  const output = positiveInteger(craftableProduct.output, 1);
  const runs = Math.ceil(requiredAmount / output);
  const nextStack = new Set(productStack);
  nextStack.add(craftableProduct.id);

  for (const recipeItem of craftableProduct.recipe) {
    const childMaterial = cleanText(recipeItem.material);
    const amount = positiveInteger(recipeItem.amount, 0) * runs;
    if (!childMaterial || amount <= 0) continue;
    expandRawMaterial(childMaterial, amount, totals, warnings, nextStack);
  }
}

function addTotal(totals, material, amount) {
  totals[material] = (totals[material] ?? 0) + amount;
}

function addProduct(factory) {
  const product = {
    id: cryptoId(),
    name: nextUniqueProductName(factory),
    output: 1,
    recipe: []
  };
  state.products[factory].unshift(product);
  ensureMaterial(product.name);
  renderAll();
  activateTab(factory);
  queueFocus(`#${factory} .product-card[data-product-id="${cssEscape(product.id)}"] .product-name`);
}

function addMaterial() {
  let base = "Neues Material";
  let name = base;
  let counter = 2;
  while (state.materials.includes(name)) {
    name = `${base} ${counter}`;
    counter += 1;
  }
  state.materials.unshift(name);
  renderAll();
  activateTab("materials");
  queueFocus("#materialsTable tbody tr:first-child input");
}

function addPlanRow() {
  const factory = firstFactoryWithProduct() || Object.keys(FACTORIES)[0];
  state.plan.unshift({
    id: cryptoId(),
    factory,
    productId: state.products[factory][0]?.id ?? null,
    quantity: 1
  });
  renderAll();
  activateTab("calculator");
  queueFocus("#planTable tbody tr:first-child .plan-quantity");
}

async function copyRequirementsTable() {
  const requirements = calculateRequirements();
  const lines = [["Material", "Gesamtbedarf"], ...Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de"))]
    .map((row) => row.join("\t"));

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    temporaryButtonText(els.copyMaterialsBtn, "Kopiert", "Tabelle kopieren");
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

async function copyRawRequirementsTable() {
  const rawRequirements = calculateRawRequirements().totals;
  const lines = [["Rohmaterial", "Gesamtbedarf"], ...Object.entries(rawRequirements).sort((a, b) => a[0].localeCompare(b[0], "de"))]
    .map((row) => row.join("\t"));

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    temporaryButtonText(els.copyRawMaterialsBtn, "Kopiert", "Tabelle kopieren");
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

function temporaryButtonText(button, text, originalText) {
  button.textContent = text;
  setTimeout(() => (button.textContent = originalText), 1400);
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
  if (!confirm("Alle lokal gespeicherten Daten werden gelöscht. Fortfahren?")) return;
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

function findProductByName(productName) {
  const normalizedName = cleanText(productName).toLocaleLowerCase("de-DE");
  if (!normalizedName) return null;
  return Object.values(state.products).flat().find((product) => product.name.toLocaleLowerCase("de-DE") === normalizedName) ?? null;
}


function getMaterialRecipe(materialName) {
  const name = cleanText(materialName);
  state.materialRecipes ??= {};
  state.materialRecipes[name] ??= { output: 1, recipe: [] };
  state.materialRecipes[name].output = positiveInteger(state.materialRecipes[name].output, 1);
  state.materialRecipes[name].recipe = Array.isArray(state.materialRecipes[name].recipe) ? state.materialRecipes[name].recipe : [];
  return state.materialRecipes[name];
}

function getExistingMaterialRecipe(materialName) {
  const name = cleanText(materialName);
  if (!name || !state.materialRecipes) return null;
  return state.materialRecipes[name] ?? null;
}
function ensureMaterial(name) {
  const cleaned = cleanText(name);
  if (cleaned && !state.materials.includes(cleaned)) state.materials.unshift(cleaned);
}

function ensureMinimumMaterial() {
  if (!state.materials.length) state.materials.unshift("Neues Material");
}

function renameMaterial(oldName, newName) {
  if (oldName === newName) return;
  if (state.materials.includes(newName)) {
    alert(`Das Material "${newName}" existiert bereits.`);
    renderAll();
    return;
  }

  state.materials = state.materials.map((material) => (material === oldName ? newName : material));
  if (state.materialRecipes?.[oldName]) {
    state.materialRecipes[newName] = state.materialRecipes[oldName];
    delete state.materialRecipes[oldName];
  }
  replaceRecipeMaterialReferences(oldName, newName);
  renderAll();
}

function replaceRecipeMaterialReferences(oldName, newName) {
  for (const product of Object.values(state.products).flat()) {
    for (const recipeItem of product.recipe) {
      if (recipeItem.material === oldName) recipeItem.material = newName;
    }
  }

  for (const recipeDef of Object.values(state.materialRecipes ?? {})) {
    for (const recipeItem of recipeDef.recipe ?? []) {
      if (recipeItem.material === oldName) recipeItem.material = newName;
    }
  }
}

function isMaterialInUse(materialName) {
  const usedInProducts = Object.values(state.products).flat().some((product) =>
    product.recipe.some((recipeItem) => recipeItem.material === materialName)
  );
  const usedInMaterialRecipes = Object.entries(state.materialRecipes ?? {}).some(([owner, recipeDef]) =>
    owner !== materialName && (recipeDef.recipe ?? []).some((recipeItem) => recipeItem.material === materialName)
  );
  return usedInProducts || usedInMaterialRecipes;
}

function normalizeState() {
  state.materials = unique((state.materials ?? []).map(cleanText).filter(Boolean));
  state.products ??= {};
  state.plan ??= [];
  state.materialRecipes ??= {};

  for (const factory of Object.keys(FACTORIES)) {
    state.products[factory] ??= [];
    state.products[factory] = state.products[factory].map((product) => ({
      id: product.id || cryptoId(),
      name: cleanText(product.name) || "Unbenannte Ware",
      output: positiveInteger(product.output, 1),
      recipe: Array.isArray(product.recipe)
        ? product.recipe.map((item) => ({
            material: cleanText(item.material) || state.materials[0] || "Neues Material",
            amount: positiveInteger(item.amount, 0)
          }))
        : []
    }));
  }

  for (const product of Object.values(state.products).flat()) {
    ensureMaterial(product.name);
    product.recipe.forEach((item) => ensureMaterial(item.material));
  }

  const normalizedMaterialRecipes = {};
  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    const name = cleanText(materialName);
    if (!name || !state.materials.includes(name)) continue;
    normalizedMaterialRecipes[name] = {
      output: positiveInteger(recipeDef?.output, 1),
      recipe: Array.isArray(recipeDef?.recipe)
        ? recipeDef.recipe.map((item) => ({
            material: cleanText(item.material) || state.materials[0] || "Neues Material",
            amount: positiveInteger(item.amount, 0)
          }))
        : []
    };
    normalizedMaterialRecipes[name].recipe.forEach((item) => ensureMaterial(item.material));
  }
  state.materialRecipes = normalizedMaterialRecipes;

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
  if (value.materialRecipes !== undefined && (typeof value.materialRecipes !== "object" || Array.isArray(value.materialRecipes))) {
    throw new Error("Feld 'materialRecipes' ist ungültig.");
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
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
  const products = {};
  for (const factory of Object.keys(FACTORIES)) {
    products[factory] = [];
  }

  return {
    materials: [],
    materialRecipes: {},
    products,
    plan: []
  };
}

function nextUniqueProductName(factory) {
  const base = "Neue Ware";
  let name = base;
  let counter = 2;
  const existingNames = new Set(state.products[factory].map((product) => product.name));
  while (existingNames.has(name)) {
    name = `${base} ${counter}`;
    counter += 1;
  }
  return name;
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

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function queueFocus(selector) {
  window.setTimeout(() => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    element.focus();
    if (typeof element.select === "function") element.select();
  }, 0);
}

function cryptoId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
