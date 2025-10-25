document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('callsign-input');
  const btn = document.getElementById('analyze-btn');
  const results = document.getElementById('results');

  function beginSection(title) {
    let html = '<section>'
    html += `<h2>${title}</h2>`;
    return html;
  }

  function endSection() {
    let html = '';
    html += '</section>';
    return html;
  }

  function addMetric(name, value, interpretation, explanation) {
    let html = '';
    html += `<h3>${name}: ${value} (${interpretation})</h3>`;
    html += `<span>${explanation}</span>`;
    return html;
  }

  function addFinding(name, findings, interpretation, explanation) {
    let html = '';
    html += `<h3>${name}: ${interpretation}</h3>`;
    html += '<ul>';
    for (f of findings) {
      html += `<li>${f}</li>`;
    }
    html += '</ul>';
    html += `<span>${explanation}</span>`;
    return html;
  }

  function good(text) {
    return `<span class="good">${text}</span>`;
  }

  function bad(text) {
    return `<span class="bad">${text}</span>`;
  }

  function warning(text) {
    return `<span class="warning">${text}</span>`;
  }

  function run(raw) {
    // normalize input
    const callsign = (raw || '').trim().toUpperCase();

    // check for invalid input
    if (!callsign) {
      return null;
    }

    // calculate metrics and build report
    let html = '';

    html += beginSection('General');
    html += addMetric('✅ Length', callsign.length, good('good'), '<p>The syntactic length of the callsign is the number of letters.</p>');
    html += addFinding('❌ Operating Signals', [`${bad('QRP')} means reduced power`], bad('found'), '<p>.</p>');
    html += endSection();

    html += beginSection('Voice');
    html += endSection();

    html += beginSection('Digital');
    html += endSection();

    return html;
  }

  function analyze() {
    const result = run(input.value);
    if (result) {
      results.innerHTML = '<br><hr>' + result;
    }
  }

  btn.addEventListener('click', analyze);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      analyze();
    }
  });
});