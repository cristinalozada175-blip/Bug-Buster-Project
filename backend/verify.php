<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$method = method_is('GET', 'POST');
$me = require_user();
$uid = q((string)$me['id']);

if ($method === 'GET') {
    json_out([
        'is_verified' => !empty($me['is_verified']),
        'username' => $me['username'],
    ]);
}

$in = read_json();
$code = trim((string)($in['code'] ?? ''));

// If a 6-digit code or confirmation is submitted
if ($code === '' || strlen($code) < 4) {
    fail('Enter your verification code (e.g. 123456)', 422);
}

// Mark profile as verified
$res = sb('PATCH', '/profiles?id=eq.' . $uid, ['is_verified' => true]);
if (!$res) fail('Could not verify account', 500);

json_out([
    'ok' => true,
    'message' => 'Your gardener account is now verified! 🌱',
    'is_verified' => true,
]);
?>
