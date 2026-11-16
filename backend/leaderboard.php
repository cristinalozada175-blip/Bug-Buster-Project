<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
method_is('GET');
$me = require_user();

$sortBy = $_GET['sort'] ?? 'xp'; // 'xp', 'levels', 'streak', 'seeds'
$profiles = sb('GET', '/profiles?is_suspended=eq.false&select=id,username,role,xp,seeds,streak,is_verified,created_at');
$progress = sb('GET', '/user_progress?status=eq.done&select=user_id,lesson_id');

$doneCounts = [];
foreach ($progress as $p) {
    $uid = (string)($p['user_id'] ?? '');
    $doneCounts[$uid] = ($doneCounts[$uid] ?? 0) + 1;
}

$ranksDef = [
    ['xp' => 1000, 'name' => 'Master gardener', 'badge' => '🏆'],
    ['xp' => 500,  'name' => 'Botanist',        'badge' => '🌸'],
    ['xp' => 250,  'name' => 'Gardener',        'badge' => '🌿'],
    ['xp' => 100,  'name' => 'Sprout',          'badge' => '🌱'],
    ['xp' => 0,    'name' => 'Seedling',        'badge' => '🌰'],
];

function getRankTitle(int $xp, array $ranks): array {
    foreach ($ranks as $r) {
        if ($xp >= $r['xp']) return $r;
    }
    return $ranks[count($ranks) - 1];
}

$leaderboard = [];
foreach ($profiles as $p) {
    $uid = (string)$p['id'];
    $xp = (int)($p['xp'] ?? 0);
    $rankInfo = getRankTitle($xp, $ranksDef);
    $levelsDone = $doneCounts[$uid] ?? 0;

    $leaderboard[] = [
        'id' => $uid,
        'username' => (string)$p['username'],
        'role' => (string)$p['role'],
        'xp' => $xp,
        'seeds' => (int)($p['seeds'] ?? 0),
        'streak' => (int)($p['streak'] ?? 0),
        'is_verified' => !empty($p['is_verified']),
        'levels_done' => $levelsDone,
        'rank_title' => $rankInfo['name'],
        'rank_badge' => $rankInfo['badge'],
        'is_me' => $uid === (string)$me['id'],
    ];
}

usort($leaderboard, function ($a, $b) use ($sortBy) {
    if ($sortBy === 'levels') {
        if ($b['levels_done'] !== $a['levels_done']) return $b['levels_done'] <=> $a['levels_done'];
    } elseif ($sortBy === 'streak') {
        if ($b['streak'] !== $a['streak']) return $b['streak'] <=> $a['streak'];
    } elseif ($sortBy === 'seeds') {
        if ($b['seeds'] !== $a['seeds']) return $b['seeds'] <=> $a['seeds'];
    }
    // Default to XP desc
    if ($b['xp'] !== $a['xp']) return $b['xp'] <=> $a['xp'];
    return strcmp($a['username'], $b['username']);
});

$myPosition = null;
foreach ($leaderboard as $idx => &$entry) {
    $entry['rank_position'] = $idx + 1;
    if ($entry['is_me']) {
        $myPosition = $idx + 1;
    }
}
unset($entry);

json_out([
    'leaderboard' => $leaderboard,
    'my_rank' => $myPosition,
    'total_gardeners' => count($leaderboard),
    'sort' => $sortBy,
]);
?>
