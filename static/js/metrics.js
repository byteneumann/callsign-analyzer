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

function syntacticSymmetry(callsign) {
    let finding = new Finding();
    finding.name = 'Symmetry';

    let num_good = 0;
    let num_bad = 0;
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
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
        } else if (suffix.startsWith(prefix)) {
            finding.findings.push(`💡 Suffix repeats the prefix`);
            num_good += 1;
        }
    }

    finding.emoji = num_bad == 0 ? '✅' : '⚠️';
    finding.interpretation = `${num_good}👍  ${num_bad}👎`;
    finding.explanation = '';
    return finding;
};

function phoneticLength(callsign) {
    let metric = new Metric();
    metric.name = 'Length';

    const callsign_tokens = callsign.split('')
    const arpaTranscript = transcribeArpa(callsign_tokens);
    metric.value = arpaTranscript.map(token => token.length).reduce((a, b) => a + b, 0);

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
    const arpaTranscript = transcribeArpa(callsign_icao);
    metric.value = arpaTranscript.map(token => token.length).reduce((a, b) => a + b, 0);

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
    metric.explanation = '<p>Phonemic length is the number of letters.</p>';
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
    finding.interpretation = '';
    finding.explanation = '';
    return finding;
}

function phoneticTranscriptEnglish(callsign) {
    let finding = new Finding();
    finding.name = 'Pronunciation';

    const callsign_tokens = callsign.split('')

    const ipaTranscript = transcribeIpa(callsign_tokens);
    const arpaTranscript = transcribeArpa(callsign_tokens);
    finding.findings.push(`IPA transcript: /${ipaTranscript.join(' ')}/`);

    return phoneticAnalysis(finding, callsign_tokens, arpaTranscript);
}

function phoneticTranscriptIcao(callsign) {
    let finding = new Finding();
    finding.name = 'Pronunciation';

    const callsign_icao = toIcao(callsign.split(''));

    const ipaTranscript = transcribeIpa(callsign_icao);
    const arpaTranscript = transcribeArpa(callsign_icao);
    finding.findings.push(`NATO spelling: ${callsign_icao.join(' ')}`);
    finding.findings.push(`IPA transcript: /${ipaTranscript.join(' ')}/`);

    return phoneticAnalysis(finding, callsign_icao, arpaTranscript);
}

function operationOperatingSignals(callsign) {
    let finding = new Finding();
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
    finding.explanation = '<p>Operating signals are standardized codes that convey messages quickly and without risk of misunderstanding (brevity codes). However, operating signals contained in callsigns can be confusing. Common Morse code abbreviations have been included here.</p><p>If a callsign is only partially received and resembles an operating signal, the receiving station may be misled. This can be problematic, for example, during contests when Q codes are frequently used in voice and digital modes.</p>';
    return finding;
}

function operationCommonTerms(callsign) {
    let finding = new Finding();
    finding.name = 'Common terms';

    let num_found = 0;
    const commonTerms = [
        // 📡 Radio Operations & Activities
        ['HAM', 'amateur radio operator'],
        ['SWL', '"short wave listener"'],
        ['TEST', 'contest'],
        ['FOX', 'amateur radio direction finding (fox hunting)'],
        ['SAT', 'satellite operation'],
        ['TNX', '"thanks"'],
        ['55', 'good luck'],
        ['72', 'best regards (low power)'],
        ['73', 'best regards'],
        ['OTA', 'on the air'],
        ['RBN', 'reverse beacon network'],
        ['NET', 'network or on-air meeting'],
        ['LOG', 'contact log or logbook'],

        // 🌍 Geography & Regions
        ['USA', 'United States of America'],
        ['AL', 'State of Alabama (USA)'],
        ['AK', 'State of Alaska (USA)'],
        ['AZ', 'State of Arizona (USA)'],
        ['AR', 'State of Arkansas (USA)'],
        ['CA', 'State of California (USA)'],
        ['CO', 'State of Colorado (USA)'],
        ['CT', 'State of Connecticut (USA)'],
        ['DE', 'State of Delaware (USA)'],
        ['FL', 'State of Florida (USA)'],
        ['GA', 'State of Georgia (USA)'],
        ['HI', 'State of Hawaii (USA)'],
        ['ID', 'State of Idaho (USA)'],
        ['IL', 'State of Illinois (USA)'],
        ['IN', 'State of Indiana (USA)'],
        ['IA', 'State of Iowa (USA)'],
        ['KS', 'State of Kansas (USA)'],
        ['KY', 'State of Kentucky (USA)'],
        ['LA', 'State of Louisiana (USA)'],
        ['ME', 'State of Maine (USA)'],
        ['MD', 'State of Maryland (USA)'],
        ['MA', 'State of Massachusetts (USA)'],
        ['MI', 'State of Michigan (USA)'],
        ['MN', 'State of Minnesota (USA)'],
        ['MS', 'State of Mississippi (USA)'],
        ['MO', 'State of Missouri (USA)'],
        ['MT', 'State of Montana (USA)'],
        ['NE', 'State of Nebraska (USA)'],
        ['NV', 'State of Nevada (USA)'],
        ['NH', 'State of New Hampshire (USA)'],
        ['NJ', 'State of New Jersey (USA)'],
        ['NM', 'State of New Mexico (USA)'],
        ['NY', 'State of New York (USA)'],
        ['NC', 'State of North Carolina (USA)'],
        ['ND', 'State of North Dakota (USA)'],
        ['OH', 'State of Ohio (USA)'],
        ['OK', 'State of Oklahoma (USA)'],
        ['OR', 'State of Oregon (USA)'],
        ['PA', 'State of Pennsylvania (USA)'],
        ['RI', 'State of Rhode Island (USA)'],
        ['SC', 'State of South Carolina (USA)'],
        ['SD', 'State of South Dakota (USA)'],
        ['TN', 'State of Tennessee (USA)'],
        ['TX', 'State of Texas (USA)'],
        ['UT', 'State of Utah (USA)'],
        ['VT', 'State of Vermont (USA)'],
        ['VA', 'State of Virginia (USA)'],
        ['WA', 'State of Washington (USA)'],
        ['WV', 'State of West Virginia (USA)'],
        ['WI', 'State of Wisconsin (USA)'],
        ['WY', 'State of Wyoming (USA)'],
        ['NL', 'Netherlands'],
        ['DK', 'Denmark'],
        ['US', 'United States'],
        ['CA', 'Canada'],
        ['GB', 'United Kingdom'],
        ['DE', 'Germany'],
        ['FR', 'France'],
        ['ES', 'Spain'],
        ['IT', 'Italy'],
        ['JP', 'Japan'],
        ['CN', 'China'],
        ['RU', 'Russia'],
        ['BR', 'Brazil'],
        ['AU', 'Australia'],
        ['NZ', 'New Zealand'],
        ['ZA', 'South Africa'],
        ['IN', 'India'],
        ['MX', 'Mexico'],
        ['AR', 'Argentina'],
        ['CL', 'Chile'],
        ['CO', 'Colombia'],
        ['PE', 'Peru'],
        ['VE', 'Venezuela'],
        ['EG', 'Egypt'],
        ['NG', 'Nigeria'],
        ['KE', 'Kenya'],
        ['TR', 'Turkey'],
        ['IL', 'Israel'],
        ['KR', 'South Korea'],
        ['TW', 'Taiwan'],
        ['FI', 'Finland'],
        ['SE', 'Sweden'],
        ['NO', 'Norway'],
        ['PT', 'Portugal'],
        ['BE', 'Belgium'],
        ['CH', 'Switzerland'],
        ['AT', 'Austria'],
        ['PL', 'Poland'],
        ['NA', 'North America'],
        ['SA', 'South America'],
        ['EU', 'Europe'],
        ['OC', 'Oceania'],
        ['AF', 'Africa'],
        ['AS', 'Asia'],
        ['DL', 'Germany (prefix)'],
        ['JA', 'Japan (prefix)'],
        ['VE', 'Canada (prefix)'],
        ['VK', 'Australia (prefix)'],
        ['ZS', 'South Africa (prefix)'],
        ['LU', 'Argentina (prefix)'],
        ['EA', 'Spain (prefix)'],
        ['F', 'France (prefix)'],
        ['G', 'England (prefix)'],
        ['LA', 'Norway (prefix)'],
        ['OH', 'Finland (prefix)'],
        ['SM', 'Sweden (prefix)'],
        ['HB', 'Switzerland (prefix)'],
        ['SP', 'Poland (prefix)'],
        ['OE', 'Austria (prefix)'],
        ['ON', 'Belgium (prefix)'],
        ['YL', 'Latvia (prefix)'],
        ['OM', 'Slovakia (prefix)'],
        ['OK', 'Czech Republic (prefix)'],
        ['TK', 'Corsica (prefix)'],
        ['W', 'USA (prefix)'],
        ['K', 'USA (prefix)'],
        ['CT', 'Portugal (prefix)'],
        ['I', 'Italy (prefix)'],
        ['UA', 'Russia (prefix)'],
        ['EI', 'Ireland (prefix)'],
        ['PY', 'Brazil (prefix)'],
        ['XE', 'Mexico (prefix)'],
        ['CE', 'Chile (prefix)'],
        ['CX', 'Uruguay (prefix)'],
        ['HK', 'Colombia (prefix)'],
        ['HI', 'Dominican Republic (prefix)'],
        ['ZL', 'New Zealand (prefix)'],
        ['OZ', 'Denmark (alternate prefix)'],
        ['TF', 'Iceland (prefix)'],
        ['SV', 'Greece (prefix)'],
        ['LX', 'Luxembourg (prefix)'],
        ['CN', 'Morocco (prefix)'],
        ['HP', 'Panama (prefix)'],
        ['YV', 'Venezuela (prefix)'],
        ['YT', 'Guadeloupe (prefix)'],

        // 🎙️ Modulation & Transmission Modes
        ['AM', 'amplitude modulation'],
        ['FM', 'frequency modulation'],
        ['SSB', 'single side band'],
        ['USB', 'upper side band'],
        ['USB', 'univeral serial bus'],
        ['LSB', 'lower side band'],
        ['CW', 'continuous wave'],
        ['FSK', 'frequency shift keying'],
        ['PSK', 'phase shift keying'],
        ['IQ', 'I/Q modulation'],
        ['EME', 'earth-moon-earth'],
        ['DMR', 'digital mobile radio'],

        // 📶 Frequency Bands
        ['HF', 'high frequency band'],
        ['VHF', 'very high frequency band'],
        ['UHF', 'ultra high frequency band'],
        ['SHF', 'super high frequency band'],
        ['VLF', 'very low frequency band'],
        ['MF', 'medium frequency band'],
        ['ELF', 'extremely low frequency band'],
        ['EHF', 'extremely high frequency band'],
        ['THF', 'tremendously high frequency band'],
        ['LF', 'low frequency band'],

        // 🛠️ Equipment & Hardware
        ['TRX', '"transceiver"'],
        ['PTT', 'push to talk'],
        ['MIC', 'microphone'],
        ['RIT', 'receiver incremental tuning'],
        ['SQL', 'squelch'],
        ['PA', 'power amplifier'],
        ['PSU', 'power supply unit'],
        ['AMP', 'amplifier'],
        ['BNC', 'radio frequency connector'],
        ['SMA', 'radio frequency connector'],
        ['ATU', 'antenna tuning unit'],
        ['DSP', 'digital signal processor'],
        ['LCD', 'liquid crystal display'],
        ['LED', 'light emitting diode'],
        ['GND', 'ground connection'],
        ['IF', 'intermediate frequency'],
        ['RF', 'radio frequency'],
        ['AF', 'audio frequency'],
        ['AGC', 'automatic gain control'],
        ['SWR', 'standing wave ratio'],
        ['FET', 'field-effect transistor'],
        ['PCB', 'printed circuit board'],
        ['VFO', 'variable frequency oscillator'],
        ['RIG', 'radio transceiver'],
        ['DIP', 'dual in-line package (electronics)'],
        ['DDS', 'direct digital synthesis'],
        ['TNC', 'terminal node controller'],
        ['LNA', 'low-noise amplifier'],
        ['ANT', 'antenna'],
        ['RX', 'receiver'],
        ['SMD', 'surface-mount device'],
        ['LAN', 'local area network'],
        ['WAN', 'wide area network'],
        ['SSH', 'secure shell'],
        ['FTP', 'file transfer protocol'],
        ['GPS', 'global positioning system'],
        ['PLC', 'programmable logic controller'],

        // 🧠 Computing & Electronics
        ['BIT', 'unit of information in computing'],
        ['CPU', 'central processing unit'],
        ['AVR', 'Atmel AVR 8-bit microcontroller family'],
        ['PIC', 'PICmicro microcontroller family'],
        ['CAL', '"calibration"'],
        ['MCU', 'microcontroller unit'],
        ['SPI', 'serial peripheral interface'],
        ['PWM', 'pulse width modulation'],
        ['ADC', 'analog to digital converter'],
        ['DAC', 'digital to analog converter'],
        ['TTL', 'transistor-transistor logic'],
        ['ROM', 'read only memory'],
        ['RAM', 'random access memory'],
        ['IRQ', 'interrupt request'],
        ['CLK', 'clock signal'],
        ['BUS', 'data bus'],
        ['CAP', 'capacitor or capacitance'],
        ['ON', 'on state'],
        ['OFF', 'off state'],

        // ⚡ Electrical Units
        ['OHM', 'unit of electrical resistance'],
        ['WATT', 'unit of power'],
        ['KW', 'kilowatt'],
        ['DB', 'decibel'],
        ['DBM', 'decibel-milliwatt'],
        ['V', 'unit of electrical potential difference'],
        ['A', 'unit of electrical current'],
        ['VA', 'Voltampere, i.e. Watt'],

        // 🏢 Organizations & Agencies
        ['CIA', 'agency of the United States of America'],
        ['FCC', 'agency of the United States of America'],
        ['FBI', 'agency of the United States of America'],
        ['ITU', 'International Telecommunication Union'],
        ['ESA', 'European Space Agency'],
        ['BBC', 'British Broadcasting Corporation'],
        ['VOA', 'Voice of America'],
        ['RFI', 'Radio France Internationale'],
        ['WIA', 'Wireless Institute of Australia'],
        ['FAA', 'Federal Aviation Administration'],

        // 🌦️ Environment & Miscellaneous
        ['WX', 'weather'],
        ['UFO', '"unidentified flight object"'],
        ['EMF', 'electromagnetic field'],
        ['EMI', 'electromagnetic interference'],
        ['RFI', 'radio frequency interference'],
        ['ES', 'sporadic E propagation'],
        ['UV', 'ultraviolet radiation'],
        ['IR', 'infrared radiation'],
        ['LOS', 'line of sight'],
        ['LOS', 'loss of signal'],
        ['AOS', 'acquisition of signal'],
        ['LOS', 'line of sight'],
        ['TCA', 'time of closest approach'],

        ['BOB', 'given name'],
        ['UDO', 'given name'],
        ['ANN', 'given name'],
        ['JOE', 'given name'],
        ['MAX', 'given name'],
        ['LEO', 'given name'],
        ['ADA', 'given name'],
        ['EVA', 'given name'],
        ['IDA', 'given name'],
        ['MIA', 'given name'],
        ['AVA', 'given name'],
        ['ZOE', 'given name'],
        ['LIZ', 'given name'],
        ['TOM', 'given name'],
        ['SAM', 'given name'],
        ['BEN', 'given name'],
        ['RAY', 'given name'],
        ['KAI', 'given name']
    ];
    const [_, prefix, numbers, suffix] = splitCallsign(callsign);
    const personal = numbers + suffix;
    for ([code, meaning] of commonTerms) {
        if (personal.includes(code)) {
            finding.findings.push(`☝️ "${code}" hints at ${meaning}`);
            num_found += 1;
        }
    }

    finding.emoji = num_found == 0 ? '' : '☝️';
    finding.interpretation = num_found == 0 ? good('none') : (num_found == 1 ? warning('warning') : `${warning(num_found + ' warnings')}`);
    finding.explanation = '<p>These are terms and abbreviations that are commonly used in amateur radio and other radio services. Additionally, some globally understood terms have been included. The purpose of reporting these findings is to raise awareness.</p>';
    return finding;
}