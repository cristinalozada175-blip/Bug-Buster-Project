<?php
declare(strict_types=1);
require _DIR_ . '/../_bootstrap.php';
$method = method_is('GET', 'POST');
$admin = require_admin();

if ($method === 'GET') {
    $profiles = sb('GET', '/profiles?order=created_at.desc&limit=200&select=id,username,role,xp,seeds,streak,is_suspended,created_at');
    $chapters = sb('GET', '/chapters?select=id,is_published');
    $publishedChapters = [];
    foreach ($chapters as $chapter) if (!empty($chapter['is_published'])) $publishedChapters[(int)$chapter['id']] = true;
    $lessons = sb('GET', '/lessons?select=id,chapter_id');
    $publishedLessons = [];
    foreach ($lessons as $lesson) {
        if (isset($publishedChapters[(int)$lesson['chapter_id']])) $publishedLessons[(int)$lesson['id']] = true;
    }
    $doneByUser = [];
    $progress = sb('GET', '/user_progress?select=user_id,lesson_id,status');
    foreach ($progress as $row) {
        if (($row['status'] ?? '') !== 'done' || !isset($publishedLessons[(int)$row['lesson_id']])) continue;
        $uid = (string)$row['user_id'];
        $doneByUser[$uid] = ($doneByUser[$uid] ?? 0) + 1;
    }
    $total = count($publishedLessons);
    $users = [];
    foreach ($profiles as $profile) {
        $uid = (string)$profile['id'];
        $completed = $doneByUser[$uid] ?? 0;
        $users[] = [
            'id' => $uid,
            'username' => (string)$profile['username'],
            'role' => (string)$profile['role'],
            'xp' => (int)$profile['xp'],
            'seeds' => (int)$profile['seeds'],
            'streak' => (int)$profile['streak'],
            'is_suspended' => (bool)$profile['is_suspended'],
            'created_at' => (string)$profile['created_at'],
            'completed_levels' => $completed,
            'total_levels' => $total,
            'progress_percent' => $total > 0 ? (int)round(($completed / $total) * 100) : 0,
        ];
    }
    json_out(['users' => $users, 'me' => (string)$admin['id']]);
}

$in = read_json();
$id = (string)($in['id'] ?? '');
$action = (string)($in['action'] ?? '');
if (!preg_match('/^[0-9a-f-]{36}$/i', $id)) fail('Invalid user', 422);
$self = $id === (string)$admin['id'];

switch ($action) {
    case 'promote': $patch = ['role' => 'admin']; break;
    case 'demote':
        if ($self) fail('You cannot demote yourself', 422);
        $patch = ['role' => 'user']; break;
    case 'suspend':
        if ($self) fail('You cannot suspend yourself', 422);
        $patch = ['is_suspended' => true]; break;
    case 'unsuspend': $patch = ['is_suspended' => false]; break;
    case 'reset':
        if ($self) fail('You cannot reset your own progress here', 422);
        sb('DELETE', '/user_progress?user_id=eq.' . q($id));
        sb('DELETE', '/garden_plots?user_id=eq.' . q($id));
        $patch = ['xp' => 0, 'seeds' => 0, 'streak' => 0];
        break;
    default: fail('Unknown action', 422);
}
$res = sb('PATCH', '/profiles?id=eq.' . q($id), $patch);
if (!$res) fail('User not found', 404);
json_out(['ok' => true, 'user' => $res[0]]);
?>