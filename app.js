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
let materialDialogMode = "create";
let materialDialogOriginalName = null;
let materialDialogRecipe = [];
let productDialogMode = "create";
let productDialogFactory = null;
let productDialogProductId = null;
let productDialogRecipe = [];

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
  addMaterialDialog: document.querySelector("#addMaterialDialog"),
  addMaterialForm: document.querySelector("#addMaterialForm"),
  closeMaterialDialogBtn: document.querySelector("#closeMaterialDialogBtn"),
  cancelMaterialDialogBtn: document.querySelector("#cancelMaterialDialogBtn"),
  materialDialogTitle: document.querySelector("#materialDialogTitle"),
  materialDialogEyebrow: document.querySelector("#materialDialogEyebrow"),
  materialDialogIntro: document.querySelector("#materialDialogIntro"),
  materialDialogSubmitBtn: document.querySelector("#materialDialogSubmitBtn"),
  newMaterialName: document.querySelector("#newMaterialName"),
  newMaterialOutput: document.querySelector("#newMaterialOutput"),
  addMaterialDialogRecipeRowBtn: document.querySelector("#addMaterialDialogRecipeRowBtn"),
  materialDialogRecipeTableBody: document.querySelector("#materialDialogRecipeTable tbody"),
  productDialog: document.querySelector("#productDialog"),
  productForm: document.querySelector("#productForm"),
  closeProductDialogBtn: document.querySelector("#closeProductDialogBtn"),
  cancelProductDialogBtn: document.querySelector("#cancelProductDialogBtn"),
  productDialogTitle: document.querySelector("#productDialogTitle"),
  productDialogEyebrow: document.querySelector("#productDialogEyebrow"),
  productDialogIntro: document.querySelector("#productDialogIntro"),
  productDialogSubmitBtn: document.querySelector("#productDialogSubmitBtn"),
  productFactoryLabel: document.querySelector("#productFactoryLabel"),
  newProductName: document.querySelector("#newProductName"),
  newProductOutput: document.querySelector("#newProductOutput"),
  addProductDialogRecipeRowBtn: document.querySelector("#addProductDialogRecipeRowBtn"),
  productDialogRecipeTableBody: document.querySelector("#productDialogRecipeTable tbody"),
  kpiPositions: document.querySelector("#kpiPositions"),
  kpiRuns: document.querySelector("#kpiRuns"),
  kpiMaterials: document.querySelector("#kpiMaterials"),
  factoryPanelTemplate: document.querySelector("#factoryPanelTemplate"),
  productTemplate: document.querySelector("#productTemplate"),
  planRowTemplate: document.querySelector("#planRowTemplate"),
  materialDialogRecipeRowTemplate: document.querySelector("#materialDialogRecipeRowTemplate"),
  productDialogRecipeRowTemplate: document.querySelector("#productDialogRecipeRowTemplate")
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

  els.addMaterialBtn.addEventListener("click", () => openMaterialDialogCreate());
  els.addPlanRowBtn.addEventListener("click", addPlanRow);
  els.copyMaterialsBtn.addEventListener("click", copyRequirementsTable);
  els.copyRawMaterialsBtn.addEventListener("click", copyRawRequirementsTable);
  els.exportDataBtn.addEventListener("click", exportData);
  els.importDataInput.addEventListener("change", importData);
  els.resetDataBtn.addEventListener("click", resetData);

  els.addMaterialForm.addEventListener("submit", saveMaterialFromDialog);
  els.closeMaterialDialogBtn.addEventListener("click", closeMaterialDialog);
  els.cancelMaterialDialogBtn.addEventListener("click", closeMaterialDialog);
  els.addMaterialDialogRecipeRowBtn.addEventListener("click", addMaterialDialogRecipeRow);
  els.addMaterialDialog.addEventListener("click", (event) => {
    if (event.target === els.addMaterialDialog) closeMaterialDialog();
  });

  els.productForm.addEventListener("submit", saveProductFromDialog);
  els.closeProductDialogBtn.addEventListener("click", closeProductDialog);
  els.cancelProductDialogBtn.addEventListener("click", closeProductDialog);
  els.addProductDialogRecipeRowBtn.addEventListener("click", addProductDialogRecipeRow);
  els.productDialog.addEventListener("click", (event) => {
    if (event.target === els.productDialog) closeProductDialog();
  });
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
    if (tabInfo.target === activeTarget) button.classList.add("active");
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
    panel.querySelector(".add-product-btn").addEventListener("click", () => openProductDialogCreate(factory));

    const container = panel.querySelector(".product-list");
    if (!state.products[factory].length) {
      container.innerHTML = `<div class="empty-state">Noch keine Waren vorhanden.</div>`;
    } else {
      state.products[factory].forEach((product) => container.appendChild(createProductCard(factory, product)));
    }

    els.factoryPanels.appendChild(panel);
  }

  activateTab(document.getElementById(activeTarget) ? activeTarget : "calculator");
}

function createProductCard(factory, product) {
  const node = els.productTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.productId = product.id;
  node.querySelector(".product-name-display").textContent = product.name;
  node.querySelector(".product-output-display").textContent = positiveInteger(product.output, 1).toLocaleString("de-DE");

  const recipeBody = node.querySelector(".recipe-table tbody");
  if (!product.recipe.length) {
    recipeBody.innerHTML = `<tr><td colspan="2" class="empty-state">Kein Rezept hinterlegt.</td></tr>`;
  } else {
    product.recipe
      .slice()
      .sort((a, b) => cleanText(a.material).localeCompare(cleanText(b.material), "de", { sensitivity: "base" }))
      .forEach((recipeItem) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${escapeHtml(recipeItem.material)}</td><td>${positiveInteger(recipeItem.amount, 0).toLocaleString("de-DE")}</td>`;
        recipeBody.appendChild(row);
      });
  }

  node.querySelector(".edit-product").addEventListener("click", () => openProductDialogEdit(factory, product.id));
  node.querySelector(".remove-product").addEventListener("click", () => {
    if (!confirm(`Ware "${product.name}" wirklich entfernen?`)) return;
    state.products[factory] = state.products[factory].filter((item) => item.id !== product.id);
    state.plan = state.plan.filter((item) => item.productId !== product.id);
    removeAutoRecipeForProduct(product.id);
    renderAll();
    activateTab(factory);
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

  state.materials.forEach((material) => {
    const recipeDef = getMaterialRecipe(material);
    const row = document.createElement("tr");
    row.className = "material-row";
    row.innerHTML = `
      <td><strong>${escapeHtml(material)}</strong></td>
      <td>${positiveInteger(recipeDef.output, 1).toLocaleString("de-DE")}</td>
      <td><div class="nested-recipe"></div></td>
      <td class="row-actions">
        <button class="button button-secondary edit-material" type="button">Bearbeiten</button>
        <button class="icon-button remove-material" type="button" aria-label="Material entfernen">×</button>
      </td>
    `;

    const nested = row.querySelector(".nested-recipe");
    if (!recipeDef.recipe.length) {
      nested.innerHTML = `<span class="raw-material-badge">Rohmaterial</span>`;
    } else {
      const table = document.createElement("table");
      table.className = "data-table compact nested-recipe-table";
      table.innerHTML = `
        <thead><tr><th>Material</th><th>Menge pro Lauf</th></tr></thead>
        <tbody></tbody>
      `;
      const body = table.querySelector("tbody");
      recipeDef.recipe
        .slice()
        .sort((a, b) => cleanText(a.material).localeCompare(cleanText(b.material), "de", { sensitivity: "base" }))
        .forEach((recipeItem) => {
          const itemRow = document.createElement("tr");
          itemRow.innerHTML = `<td>${escapeHtml(recipeItem.material)}</td><td>${positiveInteger(recipeItem.amount, 0).toLocaleString("de-DE")}</td>`;
          body.appendChild(itemRow);
        });
      nested.appendChild(table);
    }

    row.querySelector(".edit-material").addEventListener("click", () => openMaterialDialogEdit(material));
    row.querySelector(".remove-material").addEventListener("click", () => {
      if (isMaterialInUse(material)) {
        alert(`Das Material "${material}" wird noch in Rezepten verwendet und kann nicht gelöscht werden.`);
        return;
      }
      if (!confirm(`Material "${material}" wirklich entfernen?`)) return;
      state.materials = state.materials.filter((item) => item !== material);
      delete state.materialRecipes[material];
      renderAll();
      activateTab("materials");
    });

    els.materialsTableBody.appendChild(row);
  });
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
  const entries = Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }));
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
      expandRawMaterial(material, amount, totals, warnings, new Set([`product:${product.id}`]));
    }
  }
  return { totals, warnings };
}

function expandRawMaterial(material, requiredAmount, totals, warnings, stack) {
  const materialRecipe = getExistingMaterialRecipe(material);
  if (materialRecipe?.recipe?.length) {
    const materialKey = `material:${material.toLocaleLowerCase("de-DE")}`;
    if (stack.has(materialKey)) {
      addTotal(totals, material, requiredAmount);
      warnings.push(`Zyklisches Unterrezept bei "${material}" erkannt; dieser Eintrag wurde als Rohmaterial behandelt.`);
      return;
    }
    const output = positiveInteger(materialRecipe.output, 1);
    const runs = Math.ceil(requiredAmount / output);
    const nextStack = new Set(stack);
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

  const productKey = `product:${craftableProduct.id}`;
  if (stack.has(productKey)) {
    addTotal(totals, material, requiredAmount);
    warnings.push(`Zyklisches Warenrezept bei "${material}" erkannt; dieser Eintrag wurde als Rohmaterial behandelt.`);
    return;
  }

  const output = positiveInteger(craftableProduct.output, 1);
  const runs = Math.ceil(requiredAmount / output);
  const nextStack = new Set(stack);
  nextStack.add(productKey);
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

function openMaterialDialogCreate() {
  materialDialogMode = "create";
  materialDialogOriginalName = null;
  materialDialogRecipe = [];
  els.materialDialogEyebrow.textContent = "Material";
  els.materialDialogTitle.textContent = "Material hinzufügen";
  els.materialDialogIntro.textContent = "Materialien ohne Unterrezept werden im Calculator als Rohmaterial behandelt.";
  els.materialDialogSubmitBtn.textContent = "Material speichern";
  els.newMaterialName.value = "";
  els.newMaterialOutput.value = 1;
  renderMaterialDialogRecipeRows();
  showDialog(els.addMaterialDialog, "#newMaterialName");
}

function openMaterialDialogEdit(materialName) {
  materialDialogMode = "edit";
  materialDialogOriginalName = materialName;
  const recipeDef = getMaterialRecipe(materialName);
  materialDialogRecipe = (recipeDef.recipe ?? []).map((item) => ({ material: item.material, amount: item.amount }));
  els.materialDialogEyebrow.textContent = "Material bearbeiten";
  els.materialDialogTitle.textContent = materialName;
  els.materialDialogIntro.textContent = "Änderungen werden auf alle Rezeptreferenzen übertragen.";
  els.materialDialogSubmitBtn.textContent = "Änderungen speichern";
  els.newMaterialName.value = materialName;
  els.newMaterialOutput.value = positiveInteger(recipeDef.output, 1);
  renderMaterialDialogRecipeRows();
  showDialog(els.addMaterialDialog, "#newMaterialName");
}

function closeMaterialDialog() {
  els.addMaterialDialog.close();
}

function saveMaterialFromDialog(event) {
  event.preventDefault();
  const name = cleanText(els.newMaterialName.value);
  const output = positiveInteger(els.newMaterialOutput.value, 1);
  const recipe = materialDialogRecipe
    .map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) }))
    .filter((item) => item.material && item.amount > 0);

  if (!name) {
    alert("Bitte einen Materialnamen eintragen.");
    queueFocus("#newMaterialName");
    return;
  }

  const existing = state.materials.find((material) => material.toLocaleLowerCase("de-DE") === name.toLocaleLowerCase("de-DE"));
  if (materialDialogMode === "create" && existing) {
    alert(`Das Material "${name}" existiert bereits.`);
    queueFocus("#newMaterialName");
    return;
  }
  if (materialDialogMode === "edit" && existing && existing !== materialDialogOriginalName) {
    alert(`Das Material "${name}" existiert bereits.`);
    queueFocus("#newMaterialName");
    return;
  }

  if (materialDialogMode === "create") {
    ensureMaterial(name);
    if (recipe.length) state.materialRecipes[name] = { output, recipe };
  } else {
    if (materialDialogOriginalName !== name) renameMaterial(materialDialogOriginalName, name, false);
    state.materialRecipes[name] = { output, recipe };
  }

  clearAutoRecipeFlag(name);
  closeMaterialDialog();
  renderAll();
  activateTab("materials");
  queueFocusMaterialRow(name);
}

function addMaterialDialogRecipeRow() {
  if (!state.materials.length) {
    alert("Lege zuerst mindestens ein Basismaterial an, bevor du ein Unterrezept erstellst.");
    return;
  }
  const fallback = state.materials.find((material) => material !== materialDialogOriginalName) || state.materials[0];
  materialDialogRecipe.push({ material: fallback, amount: 1 });
  renderMaterialDialogRecipeRows();
}

function renderMaterialDialogRecipeRows() {
  renderDialogRecipeRows({
    tbody: els.materialDialogRecipeTableBody,
    template: els.materialDialogRecipeRowTemplate,
    recipe: materialDialogRecipe,
    materialSelector: ".material-dialog-recipe-material",
    amountSelector: ".material-dialog-recipe-amount",
    removeSelector: ".remove-material-dialog-recipe-row",
    emptyText: "Kein Unterrezept. Das Material wird als Rohmaterial behandelt."
  });
}

function openProductDialogCreate(factory) {
  productDialogMode = "create";
  productDialogFactory = factory;
  productDialogProductId = null;
  productDialogRecipe = [];
  els.productDialogEyebrow.textContent = "Ware";
  els.productDialogTitle.textContent = "Ware hinzufügen";
  els.productDialogIntro.textContent = "Die Ware wird automatisch als Material/Zwischenprodukt übernommen.";
  els.productDialogSubmitBtn.textContent = "Ware speichern";
  els.productFactoryLabel.value = FACTORIES[factory];
  els.newProductName.value = "";
  els.newProductOutput.value = 1;
  renderProductDialogRecipeRows();
  showDialog(els.productDialog, "#newProductName");
}

function openProductDialogEdit(factory, productId) {
  const product = state.products[factory].find((item) => item.id === productId);
  if (!product) return;
  productDialogMode = "edit";
  productDialogFactory = factory;
  productDialogProductId = productId;
  productDialogRecipe = (product.recipe ?? []).map((item) => ({ material: item.material, amount: item.amount }));
  els.productDialogEyebrow.textContent = "Ware bearbeiten";
  els.productDialogTitle.textContent = product.name;
  els.productDialogIntro.textContent = "Änderungen werden im Calculator und im automatischen Material-Unterrezept berücksichtigt.";
  els.productDialogSubmitBtn.textContent = "Änderungen speichern";
  els.productFactoryLabel.value = FACTORIES[factory];
  els.newProductName.value = product.name;
  els.newProductOutput.value = positiveInteger(product.output, 1);
  renderProductDialogRecipeRows();
  showDialog(els.productDialog, "#newProductName");
}

function closeProductDialog() {
  els.productDialog.close();
}

function saveProductFromDialog(event) {
  event.preventDefault();
  const name = cleanText(els.newProductName.value);
  const output = positiveInteger(els.newProductOutput.value, 1);
  const recipe = productDialogRecipe
    .map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) }))
    .filter((item) => item.material && item.amount > 0);

  if (!name) {
    alert("Bitte einen Warennamen eintragen.");
    queueFocus("#newProductName");
    return;
  }

  const factoryProducts = state.products[productDialogFactory];
  const duplicate = factoryProducts.find((product) => product.name.toLocaleLowerCase("de-DE") === name.toLocaleLowerCase("de-DE") && product.id !== productDialogProductId);
  if (duplicate) {
    alert(`In dieser Fabrik existiert bereits eine Ware namens "${name}".`);
    queueFocus("#newProductName");
    return;
  }

  if (productDialogMode === "create") {
    const product = { id: cryptoId(), name, output, recipe };
    factoryProducts.unshift(product);
    ensureMaterial(name);
    recipe.forEach((item) => ensureMaterial(item.material));
    syncSingleProductRecipeToMaterial(product);
    closeProductDialog();
    renderAll();
    activateTab(productDialogFactory);
    queueFocusProductCard(product.id);
    return;
  }

  const product = factoryProducts.find((item) => item.id === productDialogProductId);
  if (!product) return;
  const oldName = product.name;
  product.name = name;
  product.output = output;
  product.recipe = recipe;
  ensureMaterial(name);
  recipe.forEach((item) => ensureMaterial(item.material));
  if (oldName !== name) replaceProductMaterialName(oldName, name, product.id);
  syncSingleProductRecipeToMaterial(product);
  closeProductDialog();
  renderAll();
  activateTab(productDialogFactory);
  queueFocusProductCard(product.id);
}

function addProductDialogRecipeRow() {
  if (!state.materials.length) {
    alert("Lege zuerst mindestens ein Material an, bevor du eine Rezeptzeile erstellst.");
    return;
  }
  productDialogRecipe.push({ material: state.materials[0], amount: 1 });
  renderProductDialogRecipeRows();
}

function renderProductDialogRecipeRows() {
  renderDialogRecipeRows({
    tbody: els.productDialogRecipeTableBody,
    template: els.productDialogRecipeRowTemplate,
    recipe: productDialogRecipe,
    materialSelector: ".product-dialog-recipe-material",
    amountSelector: ".product-dialog-recipe-amount",
    removeSelector: ".remove-product-dialog-recipe-row",
    emptyText: "Noch keine Materialien im Rezept."
  });
}

function renderDialogRecipeRows(config) {
  const { tbody, template, recipe, materialSelector, amountSelector, removeSelector, emptyText } = config;
  tbody.innerHTML = "";
  if (!recipe.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3" class="empty-state">${escapeHtml(emptyText)}</td>`;
    tbody.appendChild(row);
    return;
  }

  recipe.forEach((item, index) => {
    const row = template.content.firstElementChild.cloneNode(true);
    const materialSelect = row.querySelector(materialSelector);
    const amountInput = row.querySelector(amountSelector);
    fillSelect(materialSelect, state.materials.map((material) => ({ value: material, label: material })), item.material);
    amountInput.value = positiveInteger(item.amount, 1);
    materialSelect.addEventListener("change", () => {
      recipe[index].material = materialSelect.value;
    });
    amountInput.addEventListener("change", () => {
      recipe[index].amount = positiveInteger(amountInput.value, 0);
    });
    row.querySelector(removeSelector).addEventListener("click", () => {
      recipe.splice(index, 1);
      if (recipe === materialDialogRecipe) renderMaterialDialogRecipeRows();
      if (recipe === productDialogRecipe) renderProductDialogRecipeRows();
    });
    tbody.appendChild(row);
  });
}

function showDialog(dialog, focusSelector) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    queueFocus(focusSelector);
  } else {
    alert("Dein Browser unterstützt Dialogfenster nicht vollständig.");
  }
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
  const lines = [["Material", "Gesamtbedarf"], ...Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }))].map((row) => row.join("\t"));
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    temporaryButtonText(els.copyMaterialsBtn, "Kopiert", "Tabelle kopieren");
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

async function copyRawRequirementsTable() {
  const rawRequirements = calculateRawRequirements().totals;
  const lines = [["Rohmaterial", "Gesamtbedarf"], ...Object.entries(rawRequirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }))].map((row) => row.join("\t"));
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
  const products = (state.products[factory] ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
  const options = products.length ? products.map((product) => ({ value: product.id, label: product.name })) : [{ value: "", label: "Keine Ware vorhanden" }];
  fillSelect(select, options, selectedProductId);
}

function fillSelect(select, options, selectedValue) {
  select.innerHTML = "";
  options
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, "de", { sensitivity: "base" }))
    .forEach((option) => {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      select.appendChild(node);
    });
  if (selectedValue && options.some((option) => option.value === selectedValue)) select.value = selectedValue;
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
  if (!cleaned) return;
  const exists = state.materials.some((material) => material.toLocaleLowerCase("de-DE") === cleaned.toLocaleLowerCase("de-DE"));
  if (!exists) state.materials.push(cleaned);
}

function renameMaterial(oldName, newName, shouldRender = true) {
  if (oldName === newName) return;
  if (state.materials.some((material) => material === newName)) {
    alert(`Das Material "${newName}" existiert bereits.`);
    if (shouldRender) renderAll();
    return;
  }
  state.materials = state.materials.map((material) => (material === oldName ? newName : material));
  if (state.materialRecipes?.[oldName]) {
    state.materialRecipes[newName] = state.materialRecipes[oldName];
    delete state.materialRecipes[oldName];
  }
  replaceRecipeMaterialReferences(oldName, newName);
  if (shouldRender) renderAll();
}

function replaceProductMaterialName(oldName, newName, productId) {
  if (state.materials.includes(oldName)) renameMaterial(oldName, newName, false);
  else ensureMaterial(newName);

  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    if (recipeDef.autoProductId === productId && materialName !== newName) {
      delete state.materialRecipes[materialName];
    }
  }
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
  const usedInProducts = Object.values(state.products).flat().some((product) => product.recipe.some((recipeItem) => recipeItem.material === materialName));
  const usedInMaterialRecipes = Object.entries(state.materialRecipes ?? {}).some(([name, recipeDef]) => name !== materialName && (recipeDef.recipe ?? []).some((recipeItem) => recipeItem.material === materialName));
  const matchingProduct = Object.values(state.products).flat().some((product) => product.name === materialName);
  return usedInProducts || usedInMaterialRecipes || matchingProduct;
}

function clearAutoRecipeFlag(materialName) {
  const recipeDef = getExistingMaterialRecipe(materialName);
  if (recipeDef?.autoProductId) delete recipeDef.autoProductId;
}

function syncSingleProductRecipeToMaterial(product) {
  ensureMaterial(product.name);
  const existing = getExistingMaterialRecipe(product.name);
  if (!existing || existing.autoProductId === product.id || !existing.recipe?.length) {
    state.materialRecipes[product.name] = {
      output: positiveInteger(product.output, 1),
      autoProductId: product.id,
      recipe: (product.recipe ?? []).map((item) => ({ material: item.material, amount: positiveInteger(item.amount, 0) }))
    };
  }
}

function syncProductRecipesToMaterials() {
  const validProductIds = new Set(Object.values(state.products).flat().map((product) => product.id));
  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    if (recipeDef.autoProductId && !validProductIds.has(recipeDef.autoProductId)) delete state.materialRecipes[materialName];
  }
  for (const product of Object.values(state.products).flat()) syncSingleProductRecipeToMaterial(product);
}

function removeAutoRecipeForProduct(productId) {
  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    if (recipeDef.autoProductId === productId) delete state.materialRecipes[materialName];
  }
}

function sortMaterials() {
  state.materials = unique(state.materials).sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" }));
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
        ? product.recipe.map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) })).filter((item) => item.material)
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
    if (!name) continue;
    ensureMaterial(name);
    normalizedMaterialRecipes[name] = {
      output: positiveInteger(recipeDef?.output, 1),
      autoProductId: cleanText(recipeDef?.autoProductId) || undefined,
      recipe: Array.isArray(recipeDef?.recipe)
        ? recipeDef.recipe.map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) })).filter((item) => item.material)
        : []
    };
    normalizedMaterialRecipes[name].recipe.forEach((item) => ensureMaterial(item.material));
  }
  state.materialRecipes = normalizedMaterialRecipes;
  syncProductRecipesToMaterials();
  sortMaterials();

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
    if (value.products[factory] !== undefined && !Array.isArray(value.products[factory])) throw new Error(`Feld 'products.${factory}' ist ungültig.`);
  }
  if (!Array.isArray(value.plan)) throw new Error("Feld 'plan' fehlt oder ist ungültig.");
  if (value.materialRecipes !== undefined && (typeof value.materialRecipes !== "object" || Array.isArray(value.materialRecipes))) throw new Error("Feld 'materialRecipes' ist ungültig.");
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
  for (const factory of Object.keys(FACTORIES)) products[factory] = [];
  return { materials: [], materialRecipes: {}, products, plan: [] };
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
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function queueFocusMaterialRow(materialName) {
  window.setTimeout(() => {
    const rows = [...document.querySelectorAll("#materialsTable tbody tr")];
    const row = rows.find((item) => item.querySelector("td")?.textContent?.trim() === materialName);
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
}

function queueFocusProductCard(productId) {
  window.setTimeout(() => {
    const element = document.querySelector(`.product-card[data-product-id="${cssEscape(productId)}"]`);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
