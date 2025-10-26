// ✅❌⚠️

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

  function addMetric(metric) {
    let html = '';
    html += `<h3>${metric.emoji} ${metric.name}`;
    if (metric.interpretation) {
      html += `: ${metric.value} (${metric.interpretation})`;
    }
    html += '</h3>';
    html += `<span>${metric.explanation}</span>`;
    return html;
  }

  function addFinding(finding) {
    let html = '';
    html += `<h3>${metric.emoji} ${finding.name}`;
    if (finding.interpretation) {
      html += `: ${finding.interpretation}`;
    }
    html += '</h3>';
    html += '<ul>';
    for (f of finding.findings) {
      html += `<li>${f}</li>`;
    }
    html += '</ul>';
    html += `<span>${finding.explanation}</span>`;
    return html;
  }

  function run(callsign) {
    // calculate metrics and build report
    let html = '';

    html += beginSection('Syntax');
    html += addMetric(syntacticLength(callsign));
    html += addFinding(syntacticSymmetry(callsign));
    //TODO html += addFinding('❌ Operating Signals', [`${bad('QRP')} means reduced power`], bad('found'), '<p>.</p>');
    //TODO three consonants, long spelling, binding of words (vowel-consonant alternating
    html += endSection();

    html += beginSection('Phonology');
    html += addFinding(phoneticTranscriptEnglish(callsign));
    html += addFinding(phoneticTranscriptIcao(callsign));
    //TODO "alternative" phonetic alphabet
    //TODO misleading: sugar papa, whiskey = alcohol
    html += endSection();

    html += beginSection('Digital');
    html += endSection();

    return html;
  }

  function analyze() {
    // normalize input
    const callsign = (input.value || '').trim().toUpperCase();

    // check for invalid input
    if (!callsign) {
      results.innerHTML = '<br><hr>Sorry, I can not analyze this.';
      return;
    }

    try {
      const result = run(callsign);
      if (result) {
        input.value = callsign;
        results.innerHTML = '<br><hr>' + result;
      }
    } catch (e) {
      results.innerHTML = '<br><hr><p>☠️ Oh no! I got an error during analysis!</p>';
      console.error(e);
    }
  }

  btn.addEventListener('click', analyze);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      analyze();
    }
  });
});