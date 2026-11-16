<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('POST');
$in = read_json();

$action = (string)($in['action'] ?? 'send');
$email = strtolower(trim((string)($in['email'] ?? '')));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Enter a valid email address', 422);
}

// 1. Send Magic Link / Login OTP
if ($action === 'send') {
    [$code, $res] = sb_auth('/otp', [
        'email' => $email,
        'create_user' => false
    ]);

    json_out([
        'ok' => true,
        'message' => 'Magic login link and OTP code sent! Please check your email inbox.'
    ]);
}

// 2. Verify Magic Link OTP Code
if ($action === 'verify') {
    $token = trim((string)($in['token'] ?? ($in['code'] ?? '')));
    if ($token === '') {
        fail('Enter the OTP code from your email', 422);
    }

    // Try type 'magiclink' or 'email'
    [$code, $auth] = sb_auth('/verify', [
        'type' => 'magiclink',
        'email' => $email,
        'token' => $token
    ]);

    if ($code < 200 || $code >= 300 || empty($auth['user']['id'])) {
        // Fallback to type 'email'
        [$code, $auth] = sb_auth('/verify', [
            'type' => 'email',
            'email' => $email,
            'token' => $token
        ]);
    }

    if ($code < 200 || $code >= 300 || empty($auth['user']['id'])) {
        fail('Invalid or expired login code. Please request a new one.', 400);
    }

    $userId = (string)$auth['user']['id'];
    $rows = sb('GET', '/profiles?id=eq.' . q($userId) . '&select=id,role,is_suspended');
    if (!$rows) {
        $username = explode('@', $email)[0];
        sb_raw('POST', '/profiles', [
            'id' => $userId,
            'username' => $username,
            'role' => 'user',
            'is_verified' => true
        ]);
        $rows = [['id' => $userId, 'role' => 'user', 'is_suspended' => false]];
    }

    if (!empty($rows[0]['is_suspended'])) {
        fail('This account is suspended', 403);
    }

    session_set($rows[0]['id'], $rows[0]['role']);
    json_out(['ok' => true, 'role' => $rows[0]['role']]);
}

fail('Unknown action: ' . $action, 422);
