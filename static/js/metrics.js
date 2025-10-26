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

function syntacticSymmetry(callsign) {
    finding = new Finding();
    finding.name = 'Symmetry';

    let num_good = 0;
    let num_bad = 0;
    [callsign, prefix, numbers, suffix] = splitCallsign(callsign);
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

    //finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    //finding.interpretation = `${num_good} positive, ${num_bad} negative`;
    finding.explanation = '';
    return finding;
}

function operationOperatingSignals(callsign) {
    finding = new Finding();
    finding.name = 'Operating signals';

    const operatingSignals = [
        [0, 'AA', 'ITU-R M.1172', 'all after'],
        [0, 'AB', 'ITU-R M.1172', 'all before'],
        [0, 'ADRS', 'ITU-T Rec. F.1', 'address'],
        [0, 'ADS', 'ITU-R M.1172', 'address'],
        [1, 'AGN', '', 'again'],
        [1, 'ANT', '', 'antenna'],
        [1, 'AR', 'ITU-R M.1172', 'end of transmission'],
        [0, 'AS', '', 'wait'],
        [1, 'BK', 'ITU-R M.1172', 'break'],
        [0, 'BN', 'ITU-R M.1172', 'all between'],
        [0, 'C', '', 'correct'],
        [0, 'CFM', 'ITU-R M.1172', 'confirm'],
        [0, 'CK', '', 'check'],
        [0, 'CL', 'ITU-R M.1172', 'closing'],
        [0, 'CP', '', 'calling multiple stations'],
        [1, 'CQ', 'ITU-R M.1172', 'calling all stations'],
        [0, 'CQD', '', 'all stations distress'],
        [0, 'CS', 'ITU-R M.1172', 'calling station'],
        [1, 'DE', 'ITU-R M.1172', 'from'],
        [1, 'DX', '', 'long distance'],
        [1, 'ES', '', 'and'],
        [0, 'FB', '', 'fine business'],
        [0, 'FM', '', 'from'],
        [0, 'FWD', '', 'forward'],
        [0, 'I', '', 'ditto'],
        [0, 'K', 'ITU-R M.1172, ITU-R M.1677-1', 'invitation to transmit'],
        [1, 'KN', 'ITU-R M.1677-1', 'over to you'],
        [0, 'LID', '', 'poor operator'],
        [0, 'MSG', 'ITU-R M.1172', 'message'],
        [0, 'N', '', 'no'],
        [0, 'NIL', 'ITU-R M.1172', 'I have nothing to send you'],
        [0, 'NR', '', 'number follows'],
        [0, 'OK', 'ITU-R M.1172, ITU-T Rec. F.1', 'okay'],
        [0, 'OM', '', 'old man'],
        [0, 'PLS', 'ITU-T Rec. F.1', 'please'],
        [0, 'PPR', 'ITU-T Rec. F.1', 'paper'],
        [0, 'PSE', 'ITU-R M.1172', 'please'],
        [0, 'PX', '', 'prefix'],
        [0, 'R', 'ITU-T Rec. F.1', 'received as transmitted'],
        [0, 'RX', '', 'receiver'],
        [0, 'RPT', 'ITU-R M.1172, ITU-T Rec. F.1', 'report'],
        [0, 'RSN', '', 'readability, strength, noise'],
        [1, 'RST', '', 'readability, signal strength, tone'],
        [0, 'SFR', '', 'so far'],
        [0, 'SIG', 'ITU-T Rec. F.1', 'signature'],
        [1, 'SK', '', 'end of contant or silent key'],
        [0, 'SVP', 'ITU-T Rec. F.1', 'please'],
        [0, 'SX', 'Philips Code', 'dollars'],
        [0, 'THX', '', 'thanks'],
        [1, 'TU', '', 'thank you'],
        [0, 'TX', '', 'transmitter'],
        [0, 'W', 'ITU-T Rec. F.1', 'word'],
        [0, 'WA', 'ITU-R M.1172', 'word after'],
        [0, 'WB', 'ITU-R M.1172', 'word before'],
        [0, 'WC', '', 'will comply'],
        [0, 'WD', 'ITU-R M.1172', 'word'],
        [0, 'WX', 'ITU-R M.1172', 'weather'],
        [0, 'XCVR', '', 'transceiver'],
        [0, 'XYL', '', 'former young lady'],
        [0, 'YL', '', 'young lady'],
        [0, 'Z', '', 'Zulu time'],
        [0, '161', '92 Codes', 'best regards + love and kisses'],
        [1, '72', '', 'best regards (low power)'],
        [1, '73', '92 Codes', 'best regards'],
        [0, '75', '', 'swearing'],
        [0, '77', '', 'long live CW'],
        [0, '88', '92 Codes', 'love and kisses'],
        [0, '99', '', 'get lost'],
        [1, 'QRA', 'Q code', 'name of station'],
        [1, 'QRG', 'Q code', 'exact frequency'],
        [0, 'QRH', 'Q code', 'frequency varies'],
        [0, 'QRI', 'Q code', 'tone of transmission'],
        [0, 'QRJ', 'Q code', 'number of voice contacts'],
        [1, 'QRK', 'Q code', 'readability of signal'],
        [1, 'QRL', 'Q code', 'busy'],
        [1, 'QRM', 'Q code', 'interference'],
        [1, 'QRN', 'Q code', 'static'],
        [1, 'QRO', 'Q code', 'increase power'],
        [1, 'QRP', 'Q code', 'reduce power'],
        [1, 'QRQ', 'Q code', 'faster'],
        [1, 'QRS', 'Q code', 'slower'],
        [1, 'QRT', 'Q code', 'stop transmission'],
        [0, 'QRU', 'Q code', 'have message'],
        [1, 'QRV', 'Q code', 'ready'],
        [0, 'QRW', 'Q code', 'inform other'],
        [1, 'QRX', 'Q code', 'standy'],
        [1, 'QRZ', 'Q code', 'being called'],
        [1, 'QSA', 'Q code', 'strength of signals'],
        [1, 'QSB', 'Q code', 'fading'],
        [0, 'QSD', 'Q code', 'keying defective'],
        [0, 'QSG', 'Q code', 'send telegrams'],
        [1, 'QSK', 'Q code', 'hear between signals'],
        [1, 'QSL', 'Q code', 'acknowledge receipt'],
        [0, 'QSM', 'Q code', 'repeat last telegram'],
        [0, 'QSN', 'Q code', 'heard you'],
        [1, 'QSO', 'Q code', 'can communicate with'],
        [0, 'QSP', 'Q code', 'relay message'],
        [0, 'QSR', 'Q code', 'repeat call'],
        [0, 'QSS', 'Q code', 'working frequency'],
        [0, 'QST', 'Q code', 'broadcast message'],
        [0, 'QSU', 'Q code', 'reply on this frequency'],
        [0, 'QSW', 'Q code', 'going to send on this frequency'],
        [0, 'QSX', 'Q code', 'listening on this frequency'],
        [1, 'QSY', 'Q code', 'change frequency'],
        [0, 'QSZ', 'Q code', 'send each word or group twice'],
        [0, 'QTA', 'Q code', 'cancel telegram'],
        [1, 'QTC', 'Q code', 'have telegram'],
        [1, 'QTH', 'Q code', 'position'],
        [0, 'QTR', 'Q code', 'correct time'],
        [0, 'QTU', 'Q code', 'operating times'],
        [0, 'QTX', 'Q code', 'keeping station open for communication'],
        [0, 'QUA', 'Q code', 'news from'],
        [0, 'QUC', 'Q code', 'number of last message'],
        [0, 'QUD', 'Q code', 'received urgency signal'],
        [0, 'QUE', 'Q code', 'can speak language'],
        [0, 'QUF', 'Q code', 'received distress signal'],
    ];

    let num_critical = 0;
    let num_warnings = 0;
    [callsign, prefix, numbers, suffix] = splitCallsign(callsign);
    personal = numbers + suffix;
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
    finding.explanation = '<p>Operating signals are standardized codes that convey messages quickly and without risk of misunderstanding (brevity codes). However, operating signals contained in callsigns can be confusing. Common Morse code abbreviations have been included here.</p><p>If a callsign is only partially received and resembles an operating signal, the receiving station may be misled. This can be problematic, for example, during contests when Q codes are frequently used in voice and digital modes.</p>';
    return finding;
}

function operationCommonTerms(callsign) {
    finding = new Finding();
    finding.name = 'Common terms';

    let num_found = 0;
    const commonTerms = [
        ['FOX', 'amateur radio direction finding (fox hunting)'],
        ['TNX', '"thanks"'],
        ['BIT', 'unit of information in computing'],
        ['BYTE', 'unit of information in computing'],
        ['SAT', 'satellite operation'],
        ['ICOM', 'Japanese manufacturer of radio equipment'],
        ['DL', 'Germany'],
        ['USA', 'United States of America'],
        ['NA', 'North America'],
        ['SA', 'South America'],
        ['EU', 'Europe'],
        ['OC', 'Oceania'],
        ['AS', 'Asia'],
        ['NL', 'Netherlands'],
        ['DK', 'Denmark'],
        ['TX', 'State of Texas (USA)'],
        ['CAL', '"calibration"'],
        ['TRX', '"transceiver"'],
        ['UFO', '"unidentified flight object"'],
        ['SWL', '"short wave listener"'],
        ['FM', 'frequency modulation'],
        ['VHF', 'very high frequency band'],
        ['UHF', 'ultra high frequency band'],
        ['SHF', 'super high frequency band'],
        ['HF', 'high frequency band'],
        ['VLF', 'very low frequency band'],
        ['AVR', 'Atmel AVR 8-bit microcontroller family'],
        ['PIC', 'PICmicro microcontroller family'],
        ['55', 'good luck'],
        ['WX', 'weather'],
        ['RIT', 'receiver incremental tuning'],
        ['SQL', 'squelch'],
        ['PTT', 'push to talk'],
        ['MIC', 'microphone'],
        ['HAM', 'ham radio operator'],
        ['CIA', 'agency of the United States of America'],
        ['FCC', 'agency of the United States of America'],
        ['NASA', 'agency of the United States of America'],
        ['FBI', 'agency of the United States of America']
    ];
    for ([code, meaning] of commonTerms) {
        if (callsign.includes(code)) {
            finding.findings.push(`☝️ "${code}" hints at ${meaning}`);
            num_found += 1;
        }
    }

    finding.emoji = num_found == 0 ? '' : '☝️';
    finding.interpretation = num_found == 0 ? good('none') : warning('warning');
    finding.explanation = '<p>These are terms and abbreviations that are commonly used in amateur radio and other radio services. Additionally, some globally understood terms have been included. The purpose of reporting these findings is to raise awareness.</p>';
    return finding;
}