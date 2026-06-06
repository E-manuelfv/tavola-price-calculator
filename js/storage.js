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
    let base = Math.floor(value / 10) * 10;
    return base + 9.90;
}
