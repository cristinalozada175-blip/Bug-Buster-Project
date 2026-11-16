<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
$method = method_is('GET', 'POST');
$admin = require_admin();

if ($method === 'GET') {
    $profiles = sb('GET', '/profiles?order=created_at.desc&limit=200&select=id,username,role,xp,seeds,streak,is_suspended,is_verified,created_at');
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
            'is_suspended' => !empty($profile['is_suspended']),
            'is_verified' => !empty($profile['is_verified']),
            'created_at' => (string)$profile['created_at'],
            'completed_levels' => $completed,
            'total_levels' => $total,
            'progress_percent' => $total > 0 ? (int)round(($completed / $total) * 100) : 0,
        ];
    }
    json_out(['users' => $users, 'me' => (string)$admin['id']]);
}

$in = read_json();
$action = (string)($in['action'] ?? '');

// Handle Create New User by Admin
if ($action === 'create') {
    $username = strtolower(trim((string)($in['username'] ?? '')));
    $email = strtolower(trim((string)($in['email'] ?? '')));
    $password = (string)($in['password'] ?? '');
    $role = (($in['role'] ?? 'user') === 'admin') ? 'admin' : 'user';
    $isVerified = !empty($in['is_verified']);

    if (!preg_match('/^[a-z0-9_]{3,20}$/', $username)) fail('Username: 3 to 20 letters, numbers or underscores', 422);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address', 422);
    if (strlen($password) < 6) fail('Password must be at least 6 characters', 422);

    if (sb('GET', '/profiles?username=eq.' . q($username) . '&select=id')) fail('That username is taken', 409);

    [$code, $user] = sb_auth('/admin/users', ['email' => $email, 'password' => $password, 'email_confirm' => true]);
    if ($code < 200 || $code >= 300 || empty($user['id'])) {
        fail('Could not create the auth user (code ' . $code . ')', 500);
    }

    [$pc] = sb_raw('POST', '/profiles', [
        'id' => $user['id'],
        'username' => $username,
        'role' => $role,
        'is_verified' => $isVerified,
        'xp' => (int)($in['xp'] ?? 0),
        'seeds' => (int)($in['seeds'] ?? 15),
    ]);
    if ($pc < 200 || $pc >= 300) {
        sb_auth('/admin/users/' . $user['id'], null, 'DELETE');
        fail('Could not create the user profile', 500);
    }
    json_out(['ok' => true, 'id' => $user['id']], 201);
}

$id = (string)($in['id'] ?? '');
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
    case 'verify': $patch = ['is_verified' => true]; break;
    case 'unverify': $patch = ['is_verified' => false]; break;
    case 'reset':
        if ($self) fail('You cannot reset your own progress here', 422);
        sb('DELETE', '/user_progress?user_id=eq.' . q($id));
        sb('DELETE', '/garden_plots?user_id=eq.' . q($id));
        $patch = ['xp' => 0, 'seeds' => 0, 'streak' => 0];
        break;
    default: fail('Unknown action: ' . $action, 422);
}
$res = sb('PATCH', '/profiles?id=eq.' . q($id), $patch);
if (!$res) fail('User not found', 404);
json_out(['ok' => true, 'user' => $res[0]]);
?>
