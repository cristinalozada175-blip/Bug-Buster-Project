<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('POST');
$in = read_json();

$email = strtolower(trim((string)($in['email'] ?? '')));
$password = (string)($in['password'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    fail('Enter your email and password');
}

[$code, $auth] = sb_auth('/token?grant_type=password', [
    'email' => $email,
    'password' => $password
]);

if ($code !== 200 || empty($auth['user']['id'])) {
    $errDesc = strtolower((string)($auth['error_description'] ?? ($auth['msg'] ?? '')));
    if (strpos($errDesc, 'confirm') !== false || strpos($errDesc, 'verified') !== false) {
        fail('Your account has not been verified yet. Please check your email and click the confirmation link (or enter your verification code) before logging in.', 403);
    }
    fail('Wrong email or password', 401);
}

$userId = (string)$auth['user']['id'];
$rows = sb('GET', '/profiles?id=eq.' . q($userId) . '&select=id,role,is_suspended,is_verified');

if (!$rows) {
    // If profile is missing, create it
    $username = explode('@', $email)[0];
    sb_raw('POST', '/profiles', [
        'id' => $userId,
        'username' => $username,
        'role' => 'user',
        'is_verified' => true
    ]);
    $rows = [['id' => $userId, 'role' => 'user', 'is_suspended' => false, 'is_verified' => true]];
}

if (!empty($rows[0]['is_suspended'])) {
    fail('This account is suspended', 403);
}

// Since Supabase confirmed login, email is verified — synchronize is_verified in profiles if needed
if (empty($rows[0]['is_verified'])) {
    sb('PATCH', '/profiles?id=eq.' . q($userId), ['is_verified' => true]);
}

$token = session_set($rows[0]['id'], $rows[0]['role']);
json_out([
    'ok' => true,
    'role' => $rows[0]['role'],
    'token' => $token,
    'user' => [
        'id' => $rows[0]['id'],
        'role' => $rows[0]['role']
    ]
]);
