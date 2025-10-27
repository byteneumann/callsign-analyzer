// ✅❌⚠️

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('callsign-input');
  const btn = document.getElementById('analyze-btn');
  const results = document.getElementById('results');

  function showCallsign(callsign) {
    return `<section class="callsign-banner"><h2>${callsign}</h2><hr></section>`;
  }

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
    html += `<small>${metric.explanation}</small>`;
    return html;
  }

  function addFinding(finding) {
    let html = '';
    html += '<h3>';
    if (finding.emoji) {
      html += `${finding.emoji} `;
    }
    html += `${finding.name}`;
    if (finding.interpretation) {
      html += `: ${finding.interpretation}`;
    }
    html += '</h3>';
    html += '<ul>';
    for (f of finding.findings) {
      html += `<li>${f}</li>`;
    }
    html += '</ul>';
    html += `<small>${finding.explanation}</small>`;
    return html;
  }

  function run(callsign) {
    // calculate metrics and build report
    let html = '';

    html += showCallsign(callsign);

    html += beginSection('Syntax');
    html += addMetric(syntacticLength(callsign));
    html += addFinding(syntacticSymmetry(callsign));
    html += endSection();
    
    html += beginSection('Phonology');
    html += addFinding(phoneticTranscriptEnglish(callsign));
    html += addFinding(phoneticTranscriptIcao(callsign));
    //TODO three consonants, long spelling
    //TODO "alternative" phonetic alphabet
    html += endSection();
    
    html += beginSection('Operation');
    html += addFinding(operationOperatingSignals(callsign));
    html += addFinding(operationCommonTerms(callsign));
    //TODO misleading: sugar papa, whiskey = alcohol
    html += endSection();

    return html;
  }

  function analyze() {
    // normalize input
    const callsign = (input.value || '').trim().toUpperCase();

    // check for invalid input
    if (!callsign) {
      results.innerHTML = '<br><hr><p>☠️ Sorry, I can not analyze this.</p><hr>';
      return;
    }

    try {
      const result = run(callsign);
      if (result) {
        input.value = callsign;
        results.innerHTML = '<br><hr>' + result + '<hr>';
      }
    } catch (e) {
      results.innerHTML = '<br><hr><p>☠️ Oh no! I got an error during analysis!</p><hr>';
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