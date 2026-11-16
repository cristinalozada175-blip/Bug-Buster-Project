<?php
declare(strict_types=1);
require _DIR_ . '/_bootstrap.php';
method_is('POST');
$me = require_user();
$lastSeen = gmdate('c');
sb('PATCH', '/profiles?id=eq.' . q((string)$me['id']), ['last_seen_at' => $lastSeen]);
json_out(['ok' => true, 'last_seen_at' => $lastSeen]);
?>