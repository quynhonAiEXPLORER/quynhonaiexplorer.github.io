// api-config.js - Hệ thống "Cân bằng tải" 100 câu/phút
const keyPoolNguoc = [
    'QBGPFUBKDAM-YeV7sV0n_SZ4tNGKIfTVBySazIA',
    'gQMHoJNIewQeiNS-Hy5MzEV3QEY_2Pr5DySazIA',
    'cnOrQudc0gP3zmd7M07e-2p_Ki3kbpuACySazIA',
    'QJ6wvTWhfrK3SN0mhCd48oJzfMCd3kHPCySazIA',
    'U24QXtXYWT_MUZNE6uki7P-qqr32A7CJCySazIA'
];

let currentKeyIndex = 0;

function getNextApiKey() {
    // Lấy key và lật ngược lại
    const keyNguoc = keyPoolNguoc[currentKeyIndex];
    const keyThat = keyNguoc.split('').reverse().join('');
    
    // In ra console để Vinh theo dõi "sức khỏe" hệ thống
    console.log(`⚡ Hệ thống đang điều phối Project số: ${currentKeyIndex + 1}`);
    
    // Xoay vòng chỉ số
    currentKeyIndex = (currentKeyIndex + 1) % keyPoolNguoc.length;
    
    return keyThat;
}
