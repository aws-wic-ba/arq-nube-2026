/**
 * ResultRenderer — renders the canonical AssessmentResult into HTML.
 * Consumes the same contract as result_to_dict() from the engine.
 */

const ResultRenderer = {
  render(result) {
    const container = document.getElementById("wizard-container");
    container.innerHTML = this._buildHtml(result);
    window.scrollTo(0, 0);
  },

  _buildHtml(r) {
    const gateClass = { danger: "danger", warning: "warning", success: "success" }[r.gate.css_class] || "secondary";
    const riskClass = { critical: "danger", high: "warning", medium: "info", none: "success", low: "secondary" }[r.overall_risk] || "secondary";

    return `
    <!-- Gate -->
    <div class="card mb-4 border-${gateClass}">
      <div class="card-header bg-${gateClass} ${gateClass !== 'warning' ? 'text-white' : 'text-dark'}"><strong>Security Architecture Gate</strong></div>
      <div class="card-body">
        <h1 class="h3 text-${gateClass}">${r.gate.decision}</h1>
        <p class="mb-2">${r.gate.reason}</p>
        <div class="row">
          <div class="col-md-6"><dl class="mb-0">
            <dt>Solución</dt><dd>${r.assessment.context.solution_name}</dd>
            <dt>Criticidad</dt><dd><span class="badge bg-${riskClass}">${r.assessment.context.criticality.toUpperCase()}</span></dd></dl></div>
          <div class="col-md-6"><dl class="mb-0">
            <dt>Riesgo general</dt><dd><span class="badge bg-${riskClass}">${r.overall_risk === 'none' ? 'SIN RIESGOS' : r.overall_risk.toUpperCase()}</span></dd>
            <dt>Amenazas</dt><dd class="fs-5 fw-bold">${r.findings.length}</dd></dl></div>
        </div>
        <div class="alert alert-${gateClass} mt-3 mb-0"><strong>Próximo paso:</strong> ${r.gate.next_action}</div>
      </div>
    </div>

    <!-- Architecture -->
    <div class="card mb-4"><div class="card-header"><strong>Arquitectura</strong></div><div class="card-body">
      <div class="architecture-viz">${r.viz_nodes.map((n, i) => `
        <div class="viz-node viz-${n.type}"><span class="node-icon">${n.icon}</span><span class="node-label">${n.label}</span>
          ${n.threat_count > 0 ? `<span class="threat-badge badge bg-${n.max_level === 'critical' ? 'danger' : n.max_level === 'high' ? 'warning' : 'info'}">⚠ ${n.threat_count}</span>` : ''}
        </div>${i < r.viz_nodes.length - 1 ? '<div class="viz-connector">↓</div>' : ''}`).join("")}
      </div></div></div>

    <!-- Findings -->
    <div class="card mb-4"><div class="card-header"><strong>Threat Modeling — Findings STRIDE</strong></div>
      <div class="card-body p-0">${r.findings.length > 0 ? `
        <div class="table-responsive"><table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Componente</th><th>STRIDE</th><th>Amenaza</th><th>L</th><th>I</th><th>Score</th><th>Nivel</th></tr></thead>
          <tbody>${r.findings.map(f => {
            const lvl = f.risk.level;
            const lvlClass = lvl === 'critical' ? 'danger' : lvl === 'high' ? 'warning' : lvl === 'medium' ? 'info' : 'secondary';
            return `<tr><td><strong>${f.component}</strong></td><td><span class="badge bg-dark">${f.stride}</span></td>
              <td><strong>${f.title}</strong><br><small class="text-muted">${f.description}</small>${f.evidence ? `<br><small class="fst-italic text-secondary">${f.evidence.join(' · ')}</small>` : ''}</td>
              <td>${f.risk.final_likelihood}</td><td>${f.risk.final_impact}</td><td><strong>${f.risk.score}</strong></td>
              <td><span class="badge bg-${lvlClass}">${lvl.toUpperCase()}</span></td></tr>`;
          }).join("")}</tbody></table></div>` : `<div class="p-4 text-center text-muted">No se identificaron amenazas.</div>`}
      </div></div>

    <!-- STRIDE Overview -->
    <div class="card mb-4"><div class="card-header"><strong>STRIDE Overview</strong></div><div class="card-body">
      <div class="row text-center">${Object.entries(r.stride_summary).map(([cat, count]) => `
        <div class="col-4 col-md-2 mb-2"><div class="p-2 rounded ${count > 0 ? 'bg-warning bg-opacity-25' : 'bg-light'}">
          <div class="fw-bold fs-5">${count}</div><small class="fw-semibold">${cat[0]}</small></div>
          <small class="text-muted" style="font-size:0.7rem">${cat}</small></div>`).join("")}
      </div></div></div>

    <!-- Zero Trust -->
    <div class="card mb-4"><div class="card-header"><strong>Zero Trust — Alineamiento preliminar</strong></div><div class="card-body">
      <div class="row mb-3"><div class="col-md-4 text-center">
        <div class="fs-2 fw-bold">${r.zt_report.overall_percentage}%</div>
        <small class="text-muted">${r.zt_report.overall_label}</small></div>
        <div class="col-md-8"><div class="progress" style="height:20px">
          <div class="progress-bar bg-${r.zt_report.overall_percentage >= 80 ? 'success' : r.zt_report.overall_percentage >= 50 ? 'warning' : 'danger'}" style="width:${r.zt_report.overall_percentage}%">${r.zt_report.overall_percentage}%</div></div></div></div>
      ${r.zt_report.dimensions.map(dim => {
        const alClass = dim.alignment === 'cumple' ? 'success' : dim.alignment === 'parcial' ? 'warning' : 'danger';
        return `<div class="mb-3 p-2 border rounded"><div class="d-flex justify-content-between align-items-center">
          <strong>${dim.name}</strong><span class="badge bg-${alClass}">${dim.alignment.toUpperCase()}</span></div>
          ${dim.checks.map(c => `<small class="d-block text-muted ms-2">${c.status === 'cumple' ? '✓' : c.status === 'parcial' ? '△' : '✗'} ${c.description} — <em>${c.evidence}</em></small>`).join("")}</div>`;
      }).join("")}
      <div class="alert alert-secondary mt-3 mb-0"><small>Esta evaluación representa un <strong>alineamiento preliminar</strong> y no constituye una certificación Zero Trust.</small></div>
    </div></div>

    <!-- Recommendations -->
    <div class="card mb-4"><div class="card-header"><strong>Security Requirements & AWS Recommendations</strong></div><div class="card-body">
      ${r.recommendations.length > 0 ? r.recommendations.map(rec => {
        const recClass = rec.max_risk_level === 'critical' ? 'danger' : rec.max_risk_level === 'high' ? 'warning' : 'info';
        return `<div class="mb-4 p-3 border rounded">
          <div class="d-flex justify-content-between align-items-start mb-2"><h6 class="mb-0">${rec.control}</h6>
            <span class="badge bg-${recClass}">${rec.max_risk_level.toUpperCase()}</span></div>
          <p class="mb-1"><strong>Requisito:</strong> ${rec.requirement}</p>
          <p class="mb-1"><strong>AWS:</strong> ${rec.aws_services.join(', ')}</p>
          <p class="mb-1 text-muted"><small><strong>Por qué:</strong> ${rec.explanation}</small></p>
          <div class="mt-2"><small class="text-secondary">Amenazas:</small>
            ${rec.related_findings.map(rf => `<span class="badge bg-light text-dark border me-1">${rf.component} · ${rf.stride}</span>`).join("")}</div></div>`;
      }).join("") : '<p class="text-muted">No se generaron recomendaciones.</p>'}
    </div></div>

    <div class="text-center mt-4 mb-3">
      <button class="btn btn-outline-primary" onclick="Wizard.init()">Nueva evaluación</button>
    </div>`;
  },
};
