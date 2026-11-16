<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
method_is('GET');
require_admin();

$profiles = sb('GET', '/profiles?select=id,username,role,created_at,is_suspended,seeds');
$chapters = sb('GET', '/chapters?order=sort_order.asc,id.asc&select=id,title,is_published,sort_order');
$lessons = sb('GET', '/lessons?order=sort_order.asc,id.asc&select=id,title,chapter_id,sort_order');
$progress = sb('GET', '/user_progress?select=user_id,lesson_id,status,attempts,completed_at');

$now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
$today = $now->setTime(0, 0);
$weekStart = $today->modify('-6 days');
$monthStart = $today->modify('-29 days');
$profileById = [];
$chapterById = [];
$lessonById = [];
$newUsers = 0;
$admins = 0;
$suspended = 0;
$seedsHeld = 0;
$activeToday = [];
$activeMonth = [];
$perLesson = [];
$activity = [];
$weekly = [];

for ($i = 0; $i < 7; $i++) {
    $day = $weekStart->modify('+' . $i . ' days');
    $weekly[$day->format('Y-m-d')] = ['date' => $day->format('Y-m-d'), 'signups' => 0, 'completions' => 0];
}
foreach ($chapters as $chapter) $chapterById[(int)$chapter['id']] = $chapter;
foreach ($lessons as $lesson) {
    $chapter = $chapterById[(int)$lesson['chapter_id']] ?? null;
    $lesson['chapter_title'] = $chapter['title'] ?? 'Unassigned';
    $lesson['is_published'] = (bool)($chapter['is_published'] ?? false);
    $lessonById[(int)$lesson['id']] = $lesson;
    $perLesson[(int)$lesson['id']] = 0;
}
foreach ($profiles as $profile) {
    $profileById[(string)$profile['id']] = $profile;
    $created = new DateTimeImmutable((string)$profile['created_at']);
    if ($created >= $weekStart) {
        $newUsers++;
        $dayKey = $created->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d');
        if (isset($weekly[$dayKey])) $weekly[$dayKey]['signups']++;
    }
    if (($profile['role'] ?? '') === 'admin') $admins++;
    if (!empty($profile['is_suspended'])) $suspended++;
    $seedsHeld += (int)($profile['seeds'] ?? 0);
}

$completions7d = 0;
$totalCompletions = 0;
foreach ($progress as $row) {
    $status = (string)($row['status'] ?? '');
    $completedAt = !empty($row['completed_at']) ? new DateTimeImmutable((string)$row['completed_at']) : null;
    $lessonId = (int)($row['lesson_id'] ?? 0);
    $uid = (string)($row['user_id'] ?? '');

    if ($completedAt) {
        if ($completedAt >= $today) $activeToday[$uid] = true;
        if ($completedAt >= $monthStart) $activeMonth[$uid] = true;
        if ($completedAt >= $weekStart) {
            $completions7d++;
            $dayKey = $completedAt->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d');
            if (isset($weekly[$dayKey])) $weekly[$dayKey]['completions']++;
        }
    }
    if ($status === 'done') {
        $totalCompletions++;
        if (isset($perLesson[$lessonId])) $perLesson[$lessonId]++;
        $activity[] = [
            'type' => 'completion',
            'user' => $profileById[$uid]['username'] ?? 'Gardener',
            'level' => $lessonById[$lessonId]['title'] ?? ('Level #' . $lessonId),
            'chapter' => $lessonById[$lessonId]['chapter_title'] ?? 'Garden',
            'time' => $row['completed_at'] ?? gmdate('c'),
        ];
    }
}

usort($activity, static fn(array $a, array $b): int => strcmp((string)$b['time'], (string)$a['time']));
$activity = array_slice($activity, 0, 10);

$perLessonRows = [];
foreach ($lessons as $l) {
    $lid = (int)$l['id'];
    $perLessonRows[] = [
        'id' => $lid,
        'title' => $l['title'],
        'chapter_id' => (int)$l['chapter_id'],
        'chapter_title' => $lessonById[$lid]['chapter_title'] ?? 'Garden',
        'is_published' => $lessonById[$lid]['is_published'] ?? true,
        'done' => $perLesson[$lid] ?? 0,
    ];
}

$userCount = count($profiles);
$maxPossibleCompletions = $userCount * count($lessons);
$rate = $maxPossibleCompletions > 0 ? (int)round(($totalCompletions / $maxPossibleCompletions) * 100) : 0;

json_out([
    'users' => $userCount,
    'new_users_7d' => $newUsers,
    'admins' => $admins,
    'suspended' => $suspended,
    'seeds_held' => $seedsHeld,
    'lessons' => count($lessons),
    'completions' => $totalCompletions,
    'completions_7d' => $completions7d,
    'active_today' => count($activeToday),
    'active_month' => count($activeMonth),
    'completion_rate' => $rate,
    'per_lesson' => $perLessonRows,
    'activity' => $activity,
    'weekly' => array_values($weekly),
    'chapters' => array_values($chapterById),
]);
