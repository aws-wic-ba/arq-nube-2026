/**
 * Wizard — multi-step form controller.
 * Manages navigation, validation, and state accumulation client-side.
 * No server round-trips between steps.
 */

const Wizard = {
  currentStep: 0,
  steps: ["context", "components", "properties", "review"],
  state: { context: {}, components: [], properties: {}, general_controls: {} },

  init() {
    this.currentStep = 0;
    this.state = { context: {}, components: [], properties: {}, general_controls: {} };
    this.render();
  },

  next() {
    if (this.validateCurrentStep()) {
      this.saveCurrentStep();
      this.currentStep++;
      this.render();
      window.scrollTo(0, 0);
    }
  },

  prev() {
    if (this.currentStep > 0) {
      this.saveCurrentStep();
      this.currentStep--;
      this.render();
      window.scrollTo(0, 0);
    }
  },

  render() {
    const container = document.getElementById("wizard-container");
    const step = this.steps[this.currentStep];
    container.innerHTML = this.renderProgressBar() + this[`render_${step}`]();
    this.bindEvents();
  },

  renderProgressBar() {
    const labels = ["Contexto", "Componentes", "Seguridad", "Revisión"];
    return `<nav class="mb-4"><ol class="wizard-progress">${labels.map((l, i) =>
      `<li class="wizard-step ${i === this.currentStep ? 'active' : ''}"><span class="step-number">${i + 1}</span><span class="step-label">${l}</span></li>`
    ).join("")}</ol></nav>`;
  },

  // === STEP 1: Context ===
  render_context() {
    const c = this.state.context;
    return `
      <h1 class="h3 mb-4">Contexto de la solución</h1>
      <div id="errors" class="alert alert-danger d-none"></div>
      <fieldset class="mb-4"><legend class="h5">Identificación</legend>
        <div class="mb-3"><label class="form-label" for="solution_name">Nombre de la solución *</label>
          <input type="text" class="form-control" id="solution_name" value="${c.solution_name || ''}" required></div>
        <div class="mb-3"><label class="form-label" for="description">Descripción breve</label>
          <textarea class="form-control" id="description" rows="2">${c.description || ''}</textarea></div>
      </fieldset>
      <fieldset class="mb-4"><legend class="h5">Tipo de solución *</legend>
        <div class="row g-2">${SOLUTION_TYPES.map(t => `
          <div class="col-6 col-md-4"><input type="radio" class="btn-check" name="solution_type" id="type_${t.id}" value="${t.id}" ${c.solution_type === t.id ? 'checked' : ''}>
            <label class="btn btn-outline-secondary w-100" for="type_${t.id}">${t.label}</label></div>`).join("")}
        </div></fieldset>
      <fieldset class="mb-4"><legend class="h5">Criticidad *</legend>
        <p class="text-muted small">¿Qué impacto tiene si la solución deja de funcionar?</p>
        <div class="row g-2">${CRITICALITY_LEVELS.map(cl => `
          <div class="col-6 col-md-3"><input type="radio" class="btn-check" name="criticality" id="crit_${cl.id}" value="${cl.id}" ${c.criticality === cl.id ? 'checked' : ''}>
            <label class="btn btn-outline-secondary w-100 text-start" for="crit_${cl.id}"><strong>${cl.label}</strong><br><small class="text-muted">${cl.description}</small></label></div>`).join("")}
        </div></fieldset>
      <fieldset class="mb-4"><legend class="h5">Contexto general</legend>
        <div class="row g-3">
          ${this._switchField("internet_exposed", "Expuesta a Internet", c.internet_exposed)}
          ${this._switchField("external_users", "Usuarios externos", c.external_users)}
          ${this._switchField("sensitive_data", "Procesa datos sensibles", c.sensitive_data)}
          ${this._switchField("third_party", "Se integra con terceros", c.third_party)}
        </div></fieldset>
      <div class="d-flex justify-content-end"><button class="btn btn-primary" onclick="Wizard.next()">Siguiente →</button></div>`;
  },

  // === STEP 2: Components ===
  render_components() {
    const sel = this.state.components;
    return `
      <h1 class="h3 mb-4">Componentes de la arquitectura</h1>
      <p class="text-muted mb-4">Seleccioná los componentes que forman parte de tu solución.</p>
      <div id="errors" class="alert alert-danger d-none"></div>
      <div class="row g-3 mb-4">${Object.entries(COMPONENT_CATALOG).map(([id, c]) => `
        <div class="col-sm-6 col-md-4"><div class="card h-100 component-card ${sel.includes(id) ? 'border-primary' : ''}">
          <label class="card-body d-flex flex-column" for="comp_${id}" role="button">
            <div class="d-flex align-items-center mb-2">
              <input class="form-check-input me-2" type="checkbox" id="comp_${id}" value="${id}" ${sel.includes(id) ? 'checked' : ''}>
              <span class="component-icon me-2">${c.icon}</span><strong>${c.label}</strong></div>
            <small class="text-muted">${c.description}</small></label></div></div>`).join("")}
      </div>
      <div class="d-flex justify-content-between">
        <button class="btn btn-outline-secondary" onclick="Wizard.prev()">← Anterior</button>
        <button class="btn btn-primary" onclick="Wizard.next()">Siguiente →</button></div>`;
  },

  // === STEP 3: Properties ===
  render_properties() {
    const comps = this.state.components;
    const props = this.state.properties;
    const gc = this.state.general_controls;
    let panels = comps.map((cid, idx) => {
      const info = COMPONENT_CATALOG[cid];
      const questions = COMPONENT_PROPERTIES[cid] || [];
      const existing = props[cid] || {};
      return `<div class="accordion-item">
        <h2 class="accordion-header"><button class="accordion-button ${idx > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#col_${cid}">
          <span class="component-icon me-2">${info.icon}</span>${info.label}</button></h2>
        <div id="col_${cid}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}">
          <div class="accordion-body">${questions.map(q => this._yesNoField(cid, q.id, q.label, existing[q.id])).join("")}</div></div></div>`;
    }).join("");

    let generalHtml = GENERAL_CONTROLS.map(ctrl =>
      this._yesNoField("general", ctrl.id, ctrl.label, gc[ctrl.id])
    ).join("");

    return `
      <h1 class="h3 mb-4">Controles de seguridad</h1>
      <p class="text-muted mb-4">Respondé sobre los controles actuales de cada componente.</p>
      <div id="errors" class="alert alert-danger d-none"></div>
      <div class="accordion mb-4" id="compAccordion">${panels}</div>
      <fieldset class="mb-4"><legend class="h5">Controles transversales</legend>
        <p class="text-muted small">Controles generales de la solución.</p>${generalHtml}</fieldset>
      <div class="d-flex justify-content-between">
        <button class="btn btn-outline-secondary" onclick="Wizard.prev()">← Anterior</button>
        <button class="btn btn-primary" onclick="Wizard.next()">Siguiente →</button></div>`;
  },

  // === STEP 4: Review ===
  render_review() {
    const s = this.state;
    const ctx = s.context;
    const typeLabel = (SOLUTION_TYPES.find(t => t.id === ctx.solution_type) || {}).label || ctx.solution_type;
    const critLabel = (CRITICALITY_LEVELS.find(c => c.id === ctx.criticality) || {}).label || ctx.criticality;
    const critClass = { critical: "danger", high: "warning", medium: "info", low: "secondary" }[ctx.criticality] || "secondary";

    let compsHtml = s.components.map(cid => {
      const info = COMPONENT_CATALOG[cid];
      const questions = COMPONENT_PROPERTIES[cid] || [];
      const vals = s.properties[cid] || {};
      let qs = questions.map(q => `<li>${vals[q.id] === true ? '✓' : '✗'} ${q.label}</li>`).join("");
      return `<h6 class="mt-3">${info.icon} ${info.label}</h6><ul class="list-unstyled small">${qs}</ul>`;
    }).join("");

    let gcHtml = GENERAL_CONTROLS.map(ctrl =>
      `<li>${s.general_controls[ctrl.id] === true ? '✓' : '✗'} ${ctrl.label}</li>`
    ).join("");

    return `
      <h1 class="h3 mb-4">Revisión del assessment</h1>
      <p class="text-muted mb-4">Verificá la información antes de ejecutar el análisis.</p>
      <div class="card mb-3"><div class="card-header"><strong>Solución</strong></div><div class="card-body">
        <dl class="row mb-0"><dt class="col-sm-4">Nombre</dt><dd class="col-sm-8">${ctx.solution_name}</dd>
        ${ctx.description ? `<dt class="col-sm-4">Descripción</dt><dd class="col-sm-8">${ctx.description}</dd>` : ''}
        <dt class="col-sm-4">Tipo</dt><dd class="col-sm-8">${typeLabel}</dd>
        <dt class="col-sm-4">Criticidad</dt><dd class="col-sm-8"><span class="badge bg-${critClass}">${critLabel}</span></dd></dl></div></div>
      <div class="card mb-3"><div class="card-header"><strong>Contexto general</strong></div><div class="card-body">
        <ul class="list-unstyled mb-0">
          <li>${ctx.internet_exposed ? '✓' : '✗'} Expuesta a Internet</li>
          <li>${ctx.external_users ? '✓' : '✗'} Usuarios externos</li>
          <li>${ctx.sensitive_data ? '✓' : '✗'} Datos sensibles</li>
          <li>${ctx.third_party ? '✓' : '✗'} Integración con terceros</li></ul></div></div>
      <div class="card mb-3"><div class="card-header"><strong>Componentes</strong></div><div class="card-body">
        <div class="d-flex flex-wrap gap-2 mb-3">${s.components.map(cid => `<span class="badge bg-primary fs-6">${COMPONENT_CATALOG[cid].icon} ${COMPONENT_CATALOG[cid].label}</span>`).join("")}</div>
        ${compsHtml}</div></div>
      <div class="card mb-3"><div class="card-header"><strong>Controles transversales</strong></div><div class="card-body">
        <ul class="list-unstyled mb-0">${gcHtml}</ul></div></div>
      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-outline-secondary" onclick="Wizard.prev()">← Editar</button>
        <button class="btn btn-success btn-lg" id="btn-analyze" onclick="Wizard.submit()">Analizar Arquitectura →</button></div>`;
  },

  // === Submit ===
  async submit() {
    const btn = document.getElementById("btn-analyze");
    btn.disabled = true;
    btn.textContent = "Analizando...";
    try {
      const response = await API.analyzeAssessment(this.state);
      ResultRenderer.render(response.result || response);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Analizar Arquitectura →";
      alert("Error: " + (e.message || "Análisis falló"));
    }
  },

  // === Validation ===
  validateCurrentStep() {
    const step = this.steps[this.currentStep];
    const errDiv = document.getElementById("errors");
    let errors = [];

    if (step === "context") {
      if (!document.getElementById("solution_name").value.trim()) errors.push("El nombre es obligatorio.");
      if (!document.querySelector('input[name="solution_type"]:checked')) errors.push("Seleccioná un tipo.");
      if (!document.querySelector('input[name="criticality"]:checked')) errors.push("Seleccioná criticidad.");
    } else if (step === "components") {
      const checked = document.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length === 0) errors.push("Seleccioná al menos un componente.");
    } else if (step === "properties") {
      // Check all yes/no are answered
      const radios = document.querySelectorAll('.prop-yn');
      const names = new Set();
      radios.forEach(r => names.add(r.name));
      for (const name of names) {
        if (!document.querySelector(`input[name="${name}"]:checked`)) {
          errors.push("Respondé todas las preguntas de seguridad.");
          break;
        }
      }
    }

    if (errors.length > 0 && errDiv) {
      errDiv.innerHTML = errors.map(e => `<div>${e}</div>`).join("");
      errDiv.classList.remove("d-none");
      return false;
    }
    if (errDiv) errDiv.classList.add("d-none");
    return true;
  },

  // === Save current step data ===
  saveCurrentStep() {
    const step = this.steps[this.currentStep];
    if (step === "context") {
      this.state.context = {
        solution_name: document.getElementById("solution_name").value.trim(),
        description: document.getElementById("description").value.trim(),
        solution_type: (document.querySelector('input[name="solution_type"]:checked') || {}).value || "",
        criticality: (document.querySelector('input[name="criticality"]:checked') || {}).value || "",
        internet_exposed: document.getElementById("sw_internet_exposed")?.checked || false,
        external_users: document.getElementById("sw_external_users")?.checked || false,
        sensitive_data: document.getElementById("sw_sensitive_data")?.checked || false,
        third_party: document.getElementById("sw_third_party")?.checked || false,
      };
    } else if (step === "components") {
      this.state.components = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);
    } else if (step === "properties") {
      const props = {};
      for (const cid of this.state.components) {
        props[cid] = {};
        const questions = COMPONENT_PROPERTIES[cid] || [];
        for (const q of questions) {
          const radio = document.querySelector(`input[name="${cid}__${q.id}"]:checked`);
          props[cid][q.id] = radio ? radio.value === "yes" : null;
        }
      }
      this.state.properties = props;
      const gc = {};
      for (const ctrl of GENERAL_CONTROLS) {
        const radio = document.querySelector(`input[name="general__${ctrl.id}"]:checked`);
        gc[ctrl.id] = radio ? radio.value === "yes" : null;
      }
      this.state.general_controls = gc;
    }
  },

  // === Helpers ===
  _switchField(id, label, value) {
    return `<div class="col-md-6"><div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" id="sw_${id}" ${value ? 'checked' : ''}>
      <label class="form-check-label" for="sw_${id}">${label}</label></div></div>`;
  },

  _yesNoField(prefix, id, label, value) {
    const name = `${prefix}__${id}`;
    return `<div class="mb-3"><label class="form-label fw-semibold">${label}</label>
      <div class="d-flex gap-3">
        <div class="form-check"><input class="form-check-input prop-yn" type="radio" name="${name}" id="${name}_yes" value="yes" ${value === true ? 'checked' : ''}>
          <label class="form-check-label" for="${name}_yes">Sí</label></div>
        <div class="form-check"><input class="form-check-input prop-yn" type="radio" name="${name}" id="${name}_no" value="no" ${value === false ? 'checked' : ''}>
          <label class="form-check-label" for="${name}_no">No</label></div>
      </div></div>`;
  },

  bindEvents() {
    // Re-attach Bootstrap collapse for accordion if needed
  },
};
