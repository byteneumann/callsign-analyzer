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
    let metric = new Metric();
    metric.name = 'Length';
    metric.value = callsign.length;
    if (metric.value <= 3) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very short');
    } else if (metric.value < 5) {
        metric.emoji = '✅';
        metric.interpretation = good('short');
    } else if (metric.value == 5) {
        metric.emoji = '✅';
        metric.interpretation = good('normal');
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

function syntacticPatterns(callsign) {
    let finding = new Finding();
    finding.name = 'Patterns';

    let num_good = 0;
    let num_bad = 0;
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
    {
        const symmetry = prefix.length - suffix.length;
        if (symmetry == 0) {
            finding.findings.push('✅ Prefix and suffix have equal length');
            num_good += 1;
        } else if (symmetry > 0) {
            finding.findings.push(`⚠️ Suffix (${suffix}) is shorter than prefix (${prefix})`);
            num_bad += 1;
        } else if (symmetry < 0) {
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
        } else if (suffix.startsWith(prefix)) {
            finding.findings.push(`💡 Suffix repeats the prefix`);
            num_good += 1;
        }
    }
    {
        if (suffix.length > 1 && (suffix.match(new RegExp(`${suffix[0]}`, 'g') || []).length) == suffix.length) {
            finding.findings.push(`⚠️ Suffix contains only the letter ${suffix[0]}`);
            num_bad += 1;
        }
    }

    finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    finding.interpretation = `${num_good}👍  ${num_bad}👎`;
    finding.explanation = 'Patterns can have positive effects (e.g. easy to remember or spell) or negative effects (e.g. unclear whether parts are missing).';
    return finding;
};

function phoneticTranscript(callsign) {
    let finding = new Finding();
    finding.name = 'Phonetic transcript';

    const callsign_tokens = callsign.split('');
    const ipaTranscript = transcribeIpa(callsign_tokens);
    finding.findings.push(`IPA transcript: /${ipaTranscript.join(' ')}/`);

    finding.emoji = '💡';
    finding.interpretation = '';
    finding.explanation = '';
    return finding;
};

function phoneticTranscriptIcao(callsign) {
    let finding = new Finding();
    finding.name = 'Phonetic transcript';

    const callsign_icao = toIcao(callsign.split(''));
    const ipaTranscript = transcribeIpa(callsign_icao);
    finding.findings.push(`IPA transcript: /${ipaTranscript.join(' ')}/`);

    finding.emoji = '💡';
    finding.interpretation = '';
    finding.explanation = '';
    return finding;
};

function phoneticLength(callsign) {
    let metric = new Metric();
    metric.name = 'Length';

    const callsign_icao = callsign.split('');
    const ipaTranscript = transcribeIpa(callsign_icao);
    metric.value = ipaTranscript.map(token => token.length).reduce((a, b) => a + b, 0);

    if (metric.value <= 6) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very short');
    } else if (metric.value < 10) {
        metric.emoji = '✅';
        metric.interpretation = good('short');
    } else if (metric.value < 14) {
        metric.emoji = '✅';
        metric.interpretation = good('normal');
    } else if (metric.value <= 18) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('long');
    } else {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very long');
    }
    metric.explanation = '<p>Phonemic length is the number of phonemes.</p>';
    return metric;
};

function phoneticLengthIcao(callsign) {
    let metric = new Metric();
    metric.name = 'Length';

    const callsign_icao = toIcao(callsign.split(''));
    const ipaTranscript = transcribeIpa(callsign_icao);
    metric.value = ipaTranscript.map(token => token.length).reduce((a, b) => a + b, 0);

    if (metric.value <= 12) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very short');
    } else if (metric.value < 20) {
        metric.emoji = '✅';
        metric.interpretation = good('short');
    } else if (metric.value < 28) {
        metric.emoji = '✅';
        metric.interpretation = good('normal');
    } else if (metric.value <= 36) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('long');
    } else {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very long');
    }
    metric.explanation = '<p>Phonemic length is the number of phonemes.</p>';
    return metric;
};

function phoneticAnalysis(finding, callsign, transcript) {
    let num_problems = 0;
    for (let i = 0; i < transcript.length - 1; ++i) {
        const phonemeFrom = transcript[i][transcript[i].length - 1];
        const phonemeTo = transcript[i + 1][0];
        const phonemeFromClass = phoneticAlphabetArpa[phonemeFrom];
        const phonemeToClass = phoneticAlphabetArpa[phonemeTo];
        if (phonemeFromClass == phonemeToClass) {
            finding.findings.push(`⚠️ Two consecutive ${phonemeFromClass}s found here: ${callsign[i].substring(0, callsign[i].length - 1)}<span style="text-decoration: dashed underline">${callsign[i][callsign[i].length - 1]} ${callsign[i + 1][0]}</span>${callsign[i + 1].substring(1)}`);
            num_problems += 1;
        }
    }

    finding.emoji = num_problems == 0 ? '✅' : '⚠️';
    finding.interpretation = num_problems == 0 ? good('none') : (num_problems == 1 ? warning('1 warning') : `${warning(num_problems + ' warnings')}`);
    finding.explanation = '<p>Pronunciation can be systematically checked by translating letters or words into phonetic transcripts using a phonetic dictionary.</p><p>Hard to pronounce callsigns can be detected by searching for patterns inside phonetic transcripts. Some pairs of phonems are considered hard to pronounce because they enforce stops when articulated.</p>';
    return finding;
}

function phoneticAnalysisEnglish(callsign) {
    let finding = new Finding();
    finding.name = 'Pronunciation';

    const callsign_tokens = callsign.split('')
    const arpaTranscript = transcribeArpa(callsign_tokens);

    return phoneticAnalysis(finding, callsign_tokens, arpaTranscript);
}

function phoneticAnalysisIcao(callsign) {
    let finding = new Finding();
    finding.name = 'Pronunciation';

    const callsign_icao = toIcao(callsign.split(''));
    const arpaTranscript = transcribeArpa(callsign_icao);

    return phoneticAnalysis(finding, callsign_icao, arpaTranscript);
}

function operationOperatingSignals(callsign) {
    let finding = new Finding();
    finding.name = 'Operating signals';

    let num_critical = 0;
    let num_warnings = 0;
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
    const personal = numbers + suffix;
    for ([severity, code, source, meaning] of operatingSignals) {
        if (personal.includes(code)) {
            let f = '';
            if (severity == 0) {
                f += `⚠️ ${warning(code)}`;
                num_warnings += 1;
            } else if (severity == 1) {
                f += `❌ ${bad(code)}`;
                num_critical += 1;
            }
            if (source) {
                f += ` (${source})`;
            }
            f += ` means: ${meaning}`;
            finding.findings.push(f);
        }
    }

    finding.emoji = num_critical == 0 ? (num_warnings == 0 ? '✅' : '⚠️') : '❌';
    finding.interpretation = num_critical == 0 ? (num_warnings == 0 ? good('none') : warning('warning')) : bad('found');
    finding.explanation = '<p>Letters or words can be translated into phonetic transcripts using a phonetic dictionary to systematically check their pronunciation.</p><p>Patterns in phonetic transcripts can be searched for to detect hard-to-pronounce callsigns. Some pairs of phonemes are considered difficult to pronounce because they create stops when articulated.</p>';
    return finding;
}

function operationCommonTerms(callsign) {
    let finding = new Finding();
    finding.name = 'Common terms';

    let num_found = 0;
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
    const personal = numbers + suffix;
    for ([code, meaning] of commonTerms) {
        if (personal.includes(code)) {
            finding.findings.push(`☝️ "${code}" hints at ${meaning}`);
            num_found += 1;
        }
    }

    finding.emoji = num_found == 0 ? '✅' : '☝️';
    finding.interpretation = num_found == 0 ? good('none') : (num_found == 1 ? warning('warning') : `${warning(num_found + ' warnings')}`);
    finding.explanation = '<p>These are terms and abbreviations that are commonly used in amateur radio and other radio services. Additionally, some globally understood terms have been included. The purpose of reporting these findings is to raise awareness.</p>';
    return finding;
}

function operationAmbiguous(callsign) {
    let finding = new Finding();
    finding.name = 'Ambigious terms';

    let num_found = 0;
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
    const personal = numbers + suffix;
    for ([code, decoded, meaning] of ambiguousTerms) {
        if (personal.includes(code)) {
            finding.findings.push(`☝️ "${code}" can be read as "${decoded}" and hint at ${meaning}`);
            num_found += 1;
        }
    }

    finding.emoji = num_found == 0 ? '✅' : '☝️';
    finding.interpretation = num_found == 0 ? good('none') : (num_found == 1 ? warning('warning') : `${warning(num_found + ' warnings')}`);
    finding.explanation = '<p>In addition to the previous categories, potentially ambiguous means are revealed here. This classification is highly subjective.</p>';
    return finding;
}

function morseEncoding(callsign) {
    let metric = new Metric();
    metric.name = 'Encoding';

    const callsign_morse = encodeMorse(callsign.split(''));
    metric.value = `<span style="letter-spacing: 3  pt">${callsign_morse.join(' ')}</span>`;

    metric.emoji = '☝️';
    metric.explanation = '<p></p>';
    return metric;
}

function morseLength(callsign) {
    let metric = new Metric();
    metric.name = 'Length';

    const callsign_morse = encodeMorse(callsign.split(''));
    metric.value = callsign_morse.map(token => token.length).reduce((a, b) => a + b, 0);

    if (metric.value <= 10) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very short');
    } else if (metric.value < 14) {
        metric.emoji = '✅';
        metric.interpretation = good('short');
    } else if (metric.value < 18) {
        metric.emoji = '✅';
        metric.interpretation = good('normal');
    } else if (metric.value <= 22) {
        metric.emoji = '⚠️';
        metric.interpretation = warning('long');
    } else {
        metric.emoji = '⚠️';
        metric.interpretation = warning('very long');
    }
    metric.explanation = '<p>Length of Morse code is the number of dits and dahs required to encode the callsign.</p>';
    return metric;
}

function morsePatterns(callsign) {
    let finding = new Finding();
    finding.name = 'Patterns';

    let num_good = 0;
    let num_bad = 0;
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
    const prefix_morse = encodeMorse(prefix.split('')).join(' ');
    const numbers_morse = encodeMorse(numbers.split('')).join(' ');
    const suffix_morse = encodeMorse(suffix.split('')).join(' ');
    {
        if (prefix_morse == reverse(suffix_morse)) {
            finding.findings.push(`✅ ${callsign} is a true palindrome`);
            num_good += 1;
        } else if (suffix_morse.includes(reverse(prefix_morse))) {
            finding.findings.push(`💡 ${callsign} is nearly a palindrome (${prefix_morse}${numbers}${reverse(prefix_morse)}`);
            num_good += 1;
        } else if (suffix_morse.startsWith(prefix_morse)) {
            finding.findings.push(`💡 Suffix repeats the prefix`);
            num_good += 1;
        }
    }
    {
        const suffix_morse_first = suffix_morse.split(' ')[0];
        if (numbers_morse.startsWith(suffix_morse_first)) {
            finding.findings.push(`✅ Numbers and first letter of suffix start with ${suffix_morse_first}`);
            num_good += 1;
        }
    }
    {
        function invertCode(code) {
            return code.replaceAll('·', '!').replaceAll('-', '·').replaceAll('!', '-');
        }
        if (prefix_morse == invertCode(suffix_morse)) {
            finding.findings.push(`✅ Suffix is the inverse of the prefix`);
            num_good += 1;
        }
    }
    {
        if (suffix.length > 1 && (suffix_morse.match(/·/g) || []).length == suffix_morse.replaceAll(' ', '').length) {
            finding.findings.push(`⚠️ Suffix only contains dits`);
            num_bad += 1;
        } else if (suffix.length > 1 && (suffix_morse.match(/-/g) || []).length == suffix_morse.replaceAll(' ', '').length) {
            finding.findings.push(`⚠️ Suffix only contains dahs`);
            num_bad += 1;
        }
    }

    finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    finding.interpretation = `${num_good}👍  ${num_bad}👎`;
    finding.explanation = '<p>Patterns can have positive effects (e.g. easy to remember or spell) or negative effects (e.g. against expectation or similar to likely transmission errors).</p>';
    return finding;
}