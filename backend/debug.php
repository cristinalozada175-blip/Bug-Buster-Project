<?php
/**
 * TEMPORARY DEBUG ENDPOINT — DELETE AFTER TESTING
 * Hit /api/debug.php on live URL to verify environment and session config.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$anonKey = env_get('SUPABASE_ANON_KEY') ?: env_get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
$serviceKey = env_get('SUPABASE_SERVICE_KEY') ?: env_get('SUPABASE_SECRET_KEY');
$sessionSecret = env_get('SESSION_SECRET');

$sessionStatus = 'NOT SET (using fallback derived from service key)';
if ($sessionSecret !== '' && strlen($sessionSecret) >= 16) {
    $sessionStatus = 'SET (' . strlen($sessionSecret) . ' chars)';
}

$anonSameAsService = ($anonKey !== '' && $serviceKey !== '' && $anonKey === $serviceKey);

$cookieToken = $_COOKIE['pg_session'] ?? '';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
$xToken = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';

$sessionRead = session_read();

json_out([
    'env' => [
        'SUPABASE_URL' => env_get('SUPABASE_URL') !== '' ? 'SET' : 'MISSING ⚠️',
        'SUPABASE_ANON_KEY' => $anonKey !== '' ? ('SET (' . substr($anonKey, 0, 8) . '...)') : 'MISSING ⚠️ — Emails will NOT send!',
        'SUPABASE_SERVICE_KEY' => $serviceKey !== '' ? ('SET (' . substr($serviceKey, 0, 8) . '...)') : 'MISSING ⚠️',
        'anon_same_as_service' => $anonSameAsService ? 'YES ⚠️ — Set SUPABASE_ANON_KEY separately!' : 'Different (good)',
        'SESSION_SECRET' => $sessionStatus,
    ],
    'request' => [
        'has_cookie' => $cookieToken !== '' ? 'YES' : 'no',
        'has_auth_header' => $authHeader !== '' ? 'YES' : 'no',
        'has_x_session_token' => $xToken !== '' ? 'YES' : 'no',
        'is_https' => is_https() ? 'YES' : 'no',
        'php_version' => PHP_VERSION,
        'has_curl' => function_exists('curl_init') ? 'YES' : 'NO ⚠️',
    ],
    'session' => [
        'valid' => $sessionRead !== null ? 'YES' : 'no',
        'uid' => $sessionRead['uid'] ?? null,
        'role' => $sessionRead['role'] ?? null,
    ],
    'warning' => '⚠️ Delete this file after testing! It exposes server config.',
]);
