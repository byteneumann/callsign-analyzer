class Metric {
    emoji;
    name;
    value;
    interpretation;
    explanation;
}

class Finding {
    emoji;
    name;
    findings = [];
    interpretation;
    explanation;
}

function syntacticLength(callsign) {
    metric = new Metric();
    metric.name = 'Length';
    metric.value = callsign.length;
    if (metric.value <= 3) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very short');
    } else if (metric.value < 5) {
        metric.emoji = '✅';
        metric.interpretation = 'short';
    } else if (metric.value == 5) {
        metric.emoji = '✅';
        metric.interpretation = 'normal';
    } else if (metric.value <= 6) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('long');
    } else {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very long');
    }
    metric.explanation = '<p>Syntactic length is the number of letters.</p>';
    return metric;
};

function syntacticSymmetry(callsign) {
    finding = new Finding();
    finding.name = 'Symmetry';

    let num_good = 0;
    let num_bad = 0;
    [callsign, prefix, numbers, suffix] = callsign.match(/([A-Z]+)([0-9]+)([A-Z]+)/);
    {
        const symmetry = prefix.length - suffix.length;
        if (symmetry == 0) {
            finding.findings.push('✅ Prefix and suffix have equal length');
            num_good += 1;
        } else if (symmetry < 0) {
            finding.findings.push(`⚠️ Suffix (${suffix}) is shorter than prefix (${prefix})`);
            num_bad += 1;
        } else if (symmetry > 0) {
            finding.findings.push(`⚠️ Suffix (${suffix}) is longer than prefix (${prefix})`);
            num_bad += 1;
        }
    }
    {
        if (prefix == reverse(suffix)) {
            finding.findings.push(`✅ ${callsign} is a true palindrome`);
            num_good += 1;
        } else if (suffix.includes(reverse(prefix))) {
            finding.findings.push(`💡 ${callsign} is nearly a palindrome (${prefix}${numbers}${reverse(prefix)}`);
            num_good += 1;
        }
    }

    finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    finding.interpretation = `${num_good}👍 ${num_bad}👎`;
    finding.explanation = '';
    return finding;
};

function phoneticTranscriptEnglish(callsign) {
    finding = new Finding();
    finding.name = 'English spelling';

    const ipaTranscript = transcribeIpa(callsign);
    const arpaTranscript = transcribeArpa(callsign);
    finding.findings.push(`IPA transcript: [${ipaTranscript}]`);
    //finding.findings.push(`ARPAbet transcript: [${arpaTranscript}]`);

    //finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    //finding.interpretation = `${num_good} positive, ${num_bad} negative`;
    finding.explanation = '';
    return finding;
}

function phoneticTranscriptIcao(callsign) {
    finding = new Finding();
    finding.name = 'NATO spelling alphabet';

    callsign_icao = toIcao(callsign);

    const ipaTranscript = transcribeIpa(callsign_icao, ' ');
    const arpaTranscript = transcribeArpa(callsign_icao, ' ');
    finding.findings.push(`IPA transcript: [${ipaTranscript}]`);
    //finding.findings.push(`ARPAbet transcript: [${arpaTranscript}]`);

    //finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    //finding.interpretation = `${num_good} positive, ${num_bad} negative`;
    finding.explanation = '';
    return finding;
}