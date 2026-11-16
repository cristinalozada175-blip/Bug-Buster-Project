<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$method = method_is('GET', 'POST');

if ($method === 'GET') {
    $me = require_user();
    json_out([
        'is_verified' => !empty($me['is_verified']),
        'username' => $me['username'],
    ]);
}

$in = read_json();
$action = (string)($in['action'] ?? '');

// Unauthenticated: Verify signup email using code
if ($action === 'verify_signup') {
    $email = strtolower(trim((string)($in['email'] ?? '')));
    $code = trim((string)($in['code'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address', 422);
    if ($code === '' || strlen($code) < 4) fail('Enter the verification code sent to your email', 422);

    [$vCode, $vRes] = sb_auth('/verify', [
        'type' => 'signup',
        'email' => $email,
        'token' => $code
    ]);

    $userId = $vRes['user']['id'] ?? ($vRes['id'] ?? null);

    if ($vCode < 200 || $vCode >= 300 || empty($userId)) {
        fail('Invalid or expired verification code', 400);
    }

    // Update profile is_verified
    sb('PATCH', '/profiles?id=eq.' . q((string)$userId), ['is_verified' => true]);

    json_out([
        'ok' => true,
        'message' => 'Your account has been verified and approved! You can now log in.',
        'is_verified' => true
    ]);
}

// Unauthenticated: Resend signup verification email
if ($action === 'resend_signup') {
    $email = strtolower(trim((string)($in['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address', 422);

    sb_auth('/resend', [
        'type' => 'signup',
        'email' => $email
    ]);

    json_out([
        'ok' => true,
        'message' => 'Verification email resent! Please check your inbox and spam folder.'
    ]);
}

// Authenticated verification for logged-in user
$me = require_user();
$uid = q((string)$me['id']);
$code = trim((string)($in['code'] ?? ''));

if ($code === '' || strlen($code) < 4) {
    fail('Enter your verification code', 422);
}

$res = sb('PATCH', '/profiles?id=eq.' . $uid, ['is_verified' => true]);
if (!$res) fail('Could not verify account', 500);

json_out([
    'ok' => true,
    'message' => 'Your account is now verified! ✓',
    'is_verified' => true,
]);
