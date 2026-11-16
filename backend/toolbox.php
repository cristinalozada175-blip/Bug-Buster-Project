<?php
require __DIR__ . '/_bootstrap.php';
method_is('GET');
$me = require_user();
[$list, $done] = lessons_for($me['id']);
$titles = [];
foreach ($list as $l) $titles[(int)$l['id']] = $l['title'];

$topics = sb('GET', '/toolbox_topics?order=id.asc&select=*');
$out = [];
foreach ($topics as $t) {
    $need = $t['unlock_lesson_id'] === null ? null : (int)$t['unlock_lesson_id'];
    $unlocked = $need === null || isset($done[$need]);
    $row = ['id' => (int)$t['id'], 'title' => $t['title'], 'unlocked' => $unlocked];
    if ($unlocked) { $row['summary'] = $t['summary']; $row['example_code'] = $t['example_code']; }
    else $row['unlock_hint'] = 'Finish the level "' . ($titles[$need] ?? 'a later level') . '" to unlock this.';
    $out[] = $row;
}
$base = rtrim(
    env_get('SUPABASE_URL') ?: env_get('NEXT_PUBLIC_SUPABASE_URL'),
    '/'
);

$host = parse_url($base, PHP_URL_HOST);

json_out([
    'debug' => [
        'supabase_host' => $host,
        'total_topics' => count($out),
        'topic_ids' => array_column($out, 'id')
    ],
    'topics' => $out
]);
?>