function good(text) {
    return `<span class="good">${text}</span>`;
}

function bad(text) {
    return `<span class="bad">${text}</span>`;
}

function warning(text) {
    return `<span class="warning">${text}</span>`;
}

function editDistance(a, b) {
    if (!a.length) {
        return b.length;
    }
    if (!b.length) {
        return a.length;
    }

    const arr = [];
    for (let i = 0; i <= b.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= a.length; j++) {
            arr[i][j] =
                i === 0
                    ? j
                    : Math.min(
                        arr[i - 1][j] + 1,
                        arr[i][j - 1] + 1,
                        arr[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
                    );
        }
    }
    return arr[b.length][a.length];
}

function reverse(s){
    return [...s].reverse().join("");
}

function splitCallsign(callsign) {
    [callsign, prefix, numbers, suffix] = callsign.match(/([A-Z]+)([0-9]+)([A-Z]+)/)
    return [callsign, prefix, numbers, suffix];
}