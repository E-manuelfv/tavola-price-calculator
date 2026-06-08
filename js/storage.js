const TPS_Storage = {
    save(key, data) {
        localStorage.setItem(`tps_${key}`, JSON.stringify(data));
    },
    load(key, defaultValue) {
        const data = localStorage.getItem(`tps_${key}`);
        return data ? JSON.parse(data) : defaultValue;
    }
};

function roundToTavolaPattern(value) {
    if (value <= 0) return 0;
    return Math.round((value - 9.90) / 10) * 10 + 9.90;
}

window.TPS_UTILS = {
    roundToTavolaPattern
};
