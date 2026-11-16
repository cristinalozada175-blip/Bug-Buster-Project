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

    // Try type 'email' first (used by default Supabase confirmation emails)
    [$vCode, $vRes] = sb_auth('/verify', [
        'type' => 'email',
        'email' => $email,
        'token' => $code
    ], 'POST', false);

    // If that fails, try type 'signup'
    if ($vCode < 200 || $vCode >= 300 || empty($vRes['user']['id'])) {
        [$vCode, $vRes] = sb_auth('/verify', [
            'type' => 'signup',
            'email' => $email,
            'token' => $code
        ], 'POST', false);
    }

    $userId = $vRes['user']['id'] ?? ($vRes['id'] ?? null);

    // If still null, try finding user id from profiles table
    if (empty($userId)) {
        $pCheck = sb('GET', '/profiles?select=id,role&limit=1');
        if ($vCode >= 200 && $vCode < 300) {
            $uRow = sb('GET', '/profiles?username=eq.' . q(explode('@', $email)[0]) . '&select=id,role');
            $userId = $uRow[0]['id'] ?? null;
        }
    }

    if ($vCode < 200 || $vCode >= 300 || empty($userId)) {
        fail('Invalid or expired verification code. Please check your code or resend email.', 400);
    }

    // Update profile is_verified
    sb('PATCH', '/profiles?id=eq.' . q((string)$userId), ['is_verified' => true]);

    // Automatically log user in upon successful verification!
    $token = session_set((string)$userId, 'user');

    json_out([
        'ok' => true,
        'message' => 'Your account has been verified and approved!',
        'is_verified' => true,
        'token' => $token,
        'role' => 'user'
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
