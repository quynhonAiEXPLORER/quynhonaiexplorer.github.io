<?php
// Cấu hình Header để cho phép nhận dữ liệu JSON từ Frontend
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Xử lý request OPTIONS (Preflight) của trình duyệt
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Kho API Keys của bạn (Sử dụng hàm strrev để đảo ngược lại thành key chuẩn)
$GEMINI_KEY_POOL = [
    strrev('QBGPFUBKDAM-YeV7sV0n_SZ4tNGKIfTVBySazIA'),
    strrev('gQMHoJNIewQeiNS-Hy5MzEV3QEY_2Pr5DySazIA'),
    strrev('cnOrQudc0gP3zmd7M07e-2p_Ki3kbpuACySazIA'),
    strrev('QJ6wvTWhfrK3SN0mhCd48oJzfMCd3kHPCySazIA'),
    strrev('U24QXtXYWT_MUZNE6uki7P-qqr32A7CJCySazIA')
];

// Lấy ngẫu nhiên 1 key để phân tải (Load Balancing)
$apiKey = $GEMINI_KEY_POOL[array_rand($GEMINI_KEY_POOL)];

// 2. Lấy dữ liệu Payload (JSON) từ frontend gửi lên
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Dữ liệu đầu vào không hợp lệ']);
    exit();
}

// 3. Khởi tạo URL kết nối tới Google Gemini (Sử dụng gemini-1.5-flash)
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;

// 4. Dùng cURL để bắn Request tới Google
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputJSON);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

// 5. Nhận kết quả và trả ngược về cho Frontend
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Lỗi kết nối tới AI Server: ' . curl_error($ch)]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>