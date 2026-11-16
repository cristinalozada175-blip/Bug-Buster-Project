<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('POST');
$in = read_json();

$username = strtolower(trim((string)($in['username'] ?? '')));
$email = strtolower(trim((string)($in['email'] ?? '')));
$password = (string)($in['password'] ?? '');

if (!preg_match('/^[a-z0-9_]{3,20}$/', $username)) fail('Username: 3 to 20 letters, numbers or underscores', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address', 422);
if (strlen($password) < 8 || strlen($password) > 72) fail('Password must be 8 to 72 characters', 422);

// Check if username already exists in profiles
if (sb('GET', '/profiles?username=eq.' . q($username) . '&select=id')) {
    fail('That username is already taken', 409);
}

// Call Supabase Auth signup using the anon key so Supabase
// sends the confirmation email with the OTP code via SMTP.
[$code, $userRes] = sb_auth('/signup', [
    'email' => $email,
    'password' => $password,
    'data' => [
        'username' => $username,
    ]
], 'POST', false);

// Explicitly trigger confirmation email via resend to guarantee delivery
try {
    sb_auth('/resend', [
        'type' => 'signup',
        'email' => $email
    ], 'POST', false);
} catch (_) {}

if ($code === 422 || $code === 409) {
    fail('That email is already registered', 409);
}

// Extract user ID from Supabase response
$userId = $userRes['id'] ?? ($userRes['user']['id'] ?? null);

if ($code < 200 || $code >= 300 || empty($userId)) {
    $msg = $userRes['msg'] ?? ($userRes['error_description'] ?? 'Could not create account');
    error_log('Auth signup failed: ' . $code . ' ' . json_encode($userRes));
    fail($msg, $code >= 400 && $code < 500 ? $code : 500);
}

// Create profile record (is_verified = false until email confirmation/approval)
[$pc, $profRes] = sb_raw('POST', '/profiles?on_conflict=id', [
    'id' => $userId,
    'username' => $username,
    'role' => 'user',
    'is_verified' => false,
], ['resolution=merge-duplicates']);

if ($pc < 200 || $pc >= 300) {
    // If profile insert failed, clean up auth user
    sb_auth('/admin/users/' . $userId, null, 'DELETE');
    error_log('Profile creation failed: ' . $pc . ' ' . json_encode($profRes));
    fail('Could not create profile record', 500);
}

// Do NOT set a session cookie here:
// User cannot log in until they have verified/approved via the confirmation email.
json_out([
    'ok' => true,
    'needs_verification' => true,
    'email' => $email,
    'message' => 'Account created! A verification email has been sent to ' . $email . '. Please check your inbox and verify your account before logging in.'
], 201);
