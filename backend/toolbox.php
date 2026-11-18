<?php
require __DIR__ . '/_bootstrap.php';
method_is('GET');
$me = require_user();
[$list, $done] = lessons_for($me['id']);
$titles = [];
foreach ($list as $l) $titles[(int)$l['id']] = $l['title'];

$topics = sb('GET', '/toolbox_topics?order=id.asc&select=*');
$out = [];
$seenTitles = [];
$seenIds = [];
foreach ($topics as $t) {
    $need = $t['unlock_lesson_id'] === null ? null : (int)$t['unlock_lesson_id'];
    $unlocked = $need === null || isset($done[$need]);
    $row = ['id' => (int)$t['id'], 'title' => $t['title'], 'unlocked' => $unlocked];
    if ($unlocked) { $row['summary'] = $t['summary']; $row['example_code'] = $t['example_code']; }
    else $row['unlock_hint'] = 'Finish the level "' . ($titles[$need] ?? 'a later level') . '" to unlock this.';
    $out[] = $row;
    $key = strtolower(trim($t['title']));
    $seenTitles[$key === 'print()' ? 'print() function' : $key] = true;
    $seenIds[(int)$t['id']] = true;
}

$catalogPath = dirname(__DIR__) . '/data/toolbox.json';
$catalogContents = file_get_contents($catalogPath);
if ($catalogContents === false) fail('Toolbox catalog unavailable', 500);
$catalog = json_decode($catalogContents, true);
if (!is_array($catalog) || !isset($catalog['topics']) || !is_array($catalog['topics'])) {
    fail('Toolbox catalog is invalid', 500);
}

foreach ($catalog['topics'] as $topic) {
    $key = strtolower(trim($topic['title']));
    if ($key === 'print()') $key = 'print() function';
    $id = (int)$topic['id'];
    if (isset($seenTitles[$key]) || isset($seenIds[$id])) continue;

    $unlockTitle = $topic['unlock_lesson_title'] ?? null;
    $need = null;
    if ($unlockTitle !== null) {
        foreach ($list as $lesson) {
            if (strcasecmp(trim($lesson['title']), trim($unlockTitle)) === 0) {
                $need = (int)$lesson['id'];
                break;
            }
        }
    }

    $unlocked = $unlockTitle === null;
    if ($need !== null && isset($done[$need])) $unlocked = true;
    $row = ['id' => $id, 'title' => $topic['title'], 'unlocked' => $unlocked];
    if ($unlocked) {
        $row['summary'] = $topic['summary'];
        $row['example_code'] = $topic['example_code'];
    } else {
        $row['unlock_hint'] = 'Finish the level "' . ($unlockTitle ?? 'a later level') . '" to unlock this.';
    }
    $out[] = $row;
    $seenTitles[$key] = true;
    $seenIds[$id] = true;
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