document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('callsign-input');
    const btn = document.getElementById('analyze-btn');
    const captionEl = document.getElementById('results-caption');
    const textEl = document.getElementById('results-text');
  
    function simpleAnalyze(raw) {
      const value = (raw || '').trim();
      if (!value) {
        return {
          caption: 'No callsign provided',
          html: '<em>Please enter a callsign above and press Analyze.</em>'
        };
      }
  
      const canonical = value.toUpperCase();
      const letters = (canonical.match(/[A-Z]/g) || []).length;
      const digits = (canonical.match(/[0-9]/g) || []).length;
      const hyphens = (canonical.match(/-/g) || []).length;
      const validChars = /^[A-Z0-9-]+$/i.test(canonical);
  
      // Basic heuristic: a callsign often has letters and digits; show some sample messages
      const probableType = (digits > 0 && letters > 0) ? 'Standard callsign-like' : 'Unusual format';
  
      let html = '';
      html += '<strong>Canonical:</strong> ' + escapeHtml(canonical) + '<br>';
      html += '<strong>Length:</strong> ' + canonical.length + ' characters<br>';
      html += '<strong>Letters:</strong> ' + letters + '<br>';
      html += '<strong>Digits:</strong> ' + digits + '<br>';
      html += '<strong>Hyphens:</strong> ' + hyphens + '<br>';
      html += '<strong>Valid characters (A–Z, 0–9, -):</strong> ' + (validChars ? 'Yes' : 'No') + '<br>';
      html += '<strong>Heuristic:</strong> ' + probableType + '<br>';
  
      // Example suggestions
      html += '<hr>';
      if (probableType === 'Standard callsign-like') {
        html += '<em>Tip:</em> Looks like a normal callsign. You can use this site to add more checks or lookups.';
      } else {
        html += '<em>Tip:</em> Consider removing spaces or special characters if this is intended to be a callsign.';
      }
  
      return {
        caption: 'Analysis for "' + escapeHtml(canonical) + '"',
        html
      };
    }
  
    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  
    function runAnalysis() {
      const result = simpleAnalyze(input.value);
      captionEl.textContent = result.caption;
      textEl.innerHTML = result.html;
    }
  
    btn.addEventListener('click', runAnalysis);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runAnalysis();
      }
    });
  });