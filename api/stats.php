<?php
declare(strict_types=1);
require _DIR_ . '/../_bootstrap.php';
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
    $activity[] = ['type' => 'signup', 'message' => (string)$profile['username'] . ' joined the garden', 'created_at' => (string)$profile['created_at']];
}
$completionCount = 0;
$publishedCompletionCount = 0;
foreach ($progress as $row) {
    if (($row['status'] ?? '') !== 'done') continue;
    $lessonId = (int)$row['lesson_id'];
    $completionCount++;
    if (array_key_exists($lessonId, $perLesson)) {
        $perLesson[$lessonId]++;
        if (!empty($lessonById[$lessonId]["is_published"])) $publishedCompletionCount++;
    }
    if (empty($row['completed_at'])) continue;
    $completed = new DateTimeImmutable((string)$row['completed_at']);
    $completedUtc = $completed->setTimezone(new DateTimeZone('UTC'));
    $dayKey = $completedUtc->format('Y-m-d');
    if (isset($weekly[$dayKey])) $weekly[$dayKey]['completions']++;
    if ($completedUtc >= $today) $activeToday[(string)$row['user_id']] = true;
    if ($completedUtc >= $monthStart) $activeMonth[(string)$row['user_id']] = true;
    $profile = $profileById[(string)$row['user_id']] ?? null;
    $lesson = $lessonById[$lessonId] ?? null;
    if ($profile && $lesson) {
        $activity[] = [
            'type' => 'completion',
            'message' => (string)$profile['username'] . ' completed ' . (string)$lesson['title'],
            'created_at' => (string)$row['completed_at'],
        ];
    }
}
usort($activity, static fn(array $a, array $b): int => strtotime($b['created_at']) <=> strtotime($a['created_at']));
$publishedLessons = 0;
foreach ($lessonById as $lesson) if ($lesson['is_published']) $publishedLessons++;
$completionRate = count($profiles) > 0 && $publishedLessons > 0
    ? round(($publishedCompletionCount / (count($profiles) * $publishedLessons)) * 100, 1)
    : 0;

$levelRows = [];
foreach ($lessonById as $id => $lesson) {
    $levelRows[] = [
        'id' => $id,
        'title' => (string)$lesson['title'],
        'chapter_id' => (int)$lesson['chapter_id'],
        'chapter_title' => (string)$lesson['chapter_title'],
        'is_published' => $lesson['is_published'],
        'done' => $perLesson[$id] ?? 0,
    ];
}
$chapterRows = [];
foreach ($chapters as $chapter) {
    $chapterRows[] = [
        'id' => (int)$chapter['id'],
        'title' => (string)$chapter['title'],
        'is_published' => (bool)$chapter['is_published'],
    ];
}
json_out([
    'users' => count($profiles),
    'new_users_7d' => $newUsers,
    'admins' => $admins,
    'suspended' => $suspended,
    'seeds_held' => $seedsHeld,
    'active_today' => count($activeToday),
    'active_30d' => count($activeMonth),
    'lessons' => count($lessons),
    'published_lessons' => $publishedLessons,
    'completions' => $completionCount,
    'completion_rate' => $completionRate,
    'per_lesson' => $levelRows,
    'chapters' => $chapterRows,
    'activity' => array_slice($activity, 0, 12),
    'weekly' => array_values($weekly),
]);
?>
