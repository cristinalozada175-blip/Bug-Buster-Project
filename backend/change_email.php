<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('POST');
$me = require_user();
$in = read_json();

$newEmail = strtolower(trim((string)($in['new_email'] ?? '')));
if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
    fail('Enter a valid new email address', 422);
}

// Request email change via Supabase Auth
// Supabase will trigger the "Change email address" email template to verify the new address
[$code, $res] = sb_auth('/admin/users/' . $me['id'], [
    'email' => $newEmail
], 'PUT');

if ($code < 200 || $code >= 300) {
    fail($res['msg'] ?? ($res['error_description'] ?? 'Could not update email'), 400);
}

json_out([
    'ok' => true,
    'message' => 'Verification email sent to ' . $newEmail . '. Please confirm the change in your email.'
]);
