<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('POST');
$in = read_json();

$action = (string)($in['action'] ?? 'request_otp');

if ($action === 'request_otp') {
    $email = strtolower(trim((string)($in['email'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Enter a valid email address', 422);
    }

    // Trigger Supabase password recovery email with OTP/reset token
    [$code, $res] = sb_auth('/recover', [
        'email' => $email
    ]);

    // Supabase returns 200 on success
    json_out([
        'ok' => true,
        'message' => 'If an account exists with that email, a 6-digit password reset code has been sent. Please check your inbox and spam folder.'
    ]);
}

if ($action === 'reset_password') {
    $email = strtolower(trim((string)($in['email'] ?? '')));
    $code = trim((string)($in['code'] ?? ''));
    $newPassword = (string)($in['new_password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Enter a valid email address', 422);
    }
    if ($code === '' || strlen($code) < 4) {
        fail('Enter the reset code sent to your email', 422);
    }
    if (strlen($newPassword) < 8 || strlen($newPassword) > 72) {
        fail('New password must be at least 8 characters', 422);
    }

    // Verify recovery token/OTP with Supabase Auth
    [$vCode, $vRes] = sb_auth('/verify', [
        'type' => 'recovery',
        'email' => $email,
        'token' => $code
    ]);

    $userId = $vRes['user']['id'] ?? ($vRes['id'] ?? null);

    if ($vCode < 200 || $vCode >= 300 || empty($userId)) {
        fail('Invalid or expired reset code. Please request a new code.', 400);
    }

    // Update password using Supabase Auth admin API
    [$pCode, $pRes] = sb_auth('/admin/users/' . $userId, [
        'password' => $newPassword
    ], 'PUT');

    if ($pCode < 200 || $pCode >= 300) {
        error_log('Failed to update password for ' . $userId . ': ' . json_encode($pRes));
        fail('Could not update password. Please try again.', 500);
    }

    json_out([
        'ok' => true,
        'message' => 'Your password has been changed successfully! You can now log in.'
    ]);
}

fail('Unknown action: ' . $action, 422);
