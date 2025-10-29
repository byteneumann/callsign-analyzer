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
    html += `<h3>${metric.emoji} ${metric.name}: ${metric.value}`;
    if (metric.interpretation) {
      html += ` (${metric.interpretation})`;
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

  // calculate metrics and build report
  function run(callsign) {
    //TODO "alternative" phonetic spelling alphabet
    let html = '';

    html += showCallsign(callsign);

    html += beginSection('Syntax');
    html += addMetric(syntacticLength(callsign));
    html += addFinding(syntacticPatterns(callsign));
    html += endSection();

    html += beginSection('Phonology (English spelling)');
    html += addFinding(phoneticTranscript(callsign));
    html += addMetric(phoneticLength(callsign));
    html += addFinding(phoneticAnalysisEnglish(callsign));

    html += beginSection('Phonology (NATO spelling alphabet)');
    html += addFinding(phoneticTranscriptIcao(callsign));
    html += addMetric(phoneticLengthIcao(callsign));
    html += addFinding(phoneticAnalysisIcao(callsign));
    html += endSection();

    html += beginSection('Operation');
    html += addFinding(operationOperatingSignals(callsign));
    html += addFinding(operationCommonTerms(callsign));
    html += addFinding(operationAmbiguous(callsign));
    html += endSection();

    html += beginSection('Morse code');
    html += addMetric(morseEncoding(callsign));
    html += addMetric(morseLength(callsign));
    html += addFinding(morsePatterns(callsign));
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