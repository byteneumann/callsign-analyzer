document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('callsign-input');
    const btn = document.getElementById('analyze-btn');
    const results = document.getElementById('results');
  
    function beginSection() {
      return '<section>';
    }

    function endSection() {
      return '</section>';
    }

    function addHeading(title) {
      return `<h2>${title}</h2>`;
    }

    function beginTable(header) {
      let html = '<table>';
      html += '<tr>';
      for (let h of header) {
        html += `<td>${h}</td>`
      }
      html += '</tr>';
      return html;
    }

    function endTable() {
      return '</table>';
    }

    function simpleAnalyze(callsign) {
      const value = (callsign || '').trim();
      if (!value) {
        return null;
      }
  
      const canonical = value.toUpperCase();
      const letters = (canonical.match(/[A-Z]/g) || []).length;
      const digits = (canonical.match(/[0-9]/g) || []).length;
      const hyphens = (canonical.match(/-/g) || []).length;
      const validChars = /^[A-Z0-9-]+$/i.test(canonical);
  
      // Basic heuristic: a callsign often has letters and digits; show some sample messages
      const probableType = (digits > 0 && letters > 0) ? 'Standard callsign-like' : 'Unusual format';
  
      let html = '';

      html += beginSection();
      html += addHeading('General');
      html += endSection();

      html += beginSection();
      html += addHeading('Voice');
      html += endSection();

      html += beginSection();
      html += addHeading('Digital');
      html += endSection();
  
      return html;
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
      if (result) {
        results.innerHTML = result;
      }
    }
  
    btn.addEventListener('click', runAnalysis);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runAnalysis();
      }
    });
  });