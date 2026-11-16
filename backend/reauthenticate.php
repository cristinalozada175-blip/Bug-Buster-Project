<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('POST');
$me = require_user();
$in = read_json();

$action = (string)($in['action'] ?? 'send');

// 1. Send Reauthentication Token
if ($action === 'send') {
    // Look up user's email from auth
    [$code, $userAuth] = sb_auth('/admin/users/' . $me['id'], null, 'GET');
    $email = $userAuth['email'] ?? '';
    if ($email === '') {
        fail('Could not find user email', 500);
    }

    // Call Supabase reauthenticate endpoint
    [$rCode, $rRes] = sb_auth('/reauthenticate', [
        'email' => $email
    ]);

    json_out([
        'ok' => true,
        'message' => 'Reauthentication security code sent to your email.'
    ]);
}

// 2. Verify Reauthentication Token
if ($action === 'verify') {
    $code = trim((string)($in['code'] ?? ''));
    if ($code === '' || strlen($code) < 4) {
        fail('Enter your 6-digit security code', 422);
    }

    [$vCode, $vRes] = sb_auth('/verify', [
        'type' => 'reauthentication',
        'token' => $code
    ]);

    if ($vCode < 200 || $vCode >= 300) {
        fail('Invalid or expired security code', 400);
    }

    json_out([
        'ok' => true,
        'message' => 'Identity verified successfully!'
    ]);
}

fail('Unknown action: ' . $action, 422);
