<?php
require __DIR__ . '/_bootstrap.php';
$method = method_is('GET', 'POST');
$me = require_user();
$uid = q($me['id']);

if ($method === 'GET') {
    $items = sb('GET', '/shop_items?is_active=eq.true&order=cost_seeds.asc&select=id,name,kind,cost_seeds,sprite');
    $plots = sb('GET', "/garden_plots?user_id=eq.$uid&select=slot,item_id,growth_stage,planted_at");
    $stageNames = ['sprout', 'growing', 'blooming'];
    foreach ($plots as &$plot) {
        $plot['growth_stage'] = max(0, min(2, (int)$plot['growth_stage']));
        $plot['stage'] = $stageNames[$plot['growth_stage']];
    }
    unset($plot);
    json_out(['items' => $items, 'plots' => $plots, 'seeds' => (int)$me['seeds']]);
}

$in = read_json();
$action = (string)($in['action'] ?? 'plant');
$itemId = (int)($in['item_id'] ?? 0);
$slot = filter_var($in['slot'] ?? null, FILTER_VALIDATE_INT);
if ($slot === false || $slot < 0 || $slot > 11) fail('Pick a plot from 1 to 12');

if ($action === 'water') {
    $plots = sb('GET', "/garden_plots?user_id=eq.$uid&slot=eq.$slot&select=id,growth_stage");
    if (!$plots) fail('There is no plant in that plot', 404);
    $plotId = (int)$plots[0]['id'];
    $growthStage = (int)$plots[0]['growth_stage'];
    if ($growthStage >= 2) fail('That plant is already in full bloom', 409);

    $nextStage = $growthStage + 1;
    $updated = sb('PATCH', "/garden_plots?id=eq.$plotId&user_id=eq.$uid&growth_stage=eq.$growthStage", [
        'growth_stage' => $nextStage
    ]);
    if (!$updated) fail('That plant changed. Reload the garden and try again', 409);
    $stageNames = ['sprout', 'growing', 'blooming'];
    json_out([
        'ok' => true, 'slot' => $slot, 'growth_stage' => $nextStage,
        'stage' => $stageNames[$nextStage]
    ]);
}

if ($action === 'harvest') {
    $plots = sb('GET', "/garden_plots?user_id=eq.$uid&slot=eq.$slot&select=id,growth_stage");
    if (!$plots) fail('There is no plant in that plot', 404);
    if ((int)$plots[0]['growth_stage'] < 2) fail('Water this plant twice before harvesting it', 409);

    $season = (string)($in['season'] ?? 'summer');
    $seasonalBonuses = [
        'spring' => ['seeds' => 3, 'xp' => 0],
        'summer' => ['seeds' => 0, 'xp' => 3],
        'autumn' => ['seeds' => 5, 'xp' => 0],
        'winter' => ['seeds' => 0, 'xp' => 5],
    ];
    if (!isset($seasonalBonuses[$season])) fail('Choose a valid season');
    $bonus = $seasonalBonuses[$season];
    $rewardSeeds = 10 + $bonus['seeds'];
    $rewardXp = 15 + $bonus['xp'];
    $seeds = (int)$me['seeds'] + $rewardSeeds;
    $xp = (int)$me['xp'] + $rewardXp;

    $updated = sb('PATCH', "/profiles?id=eq.$uid&seeds=eq." . (int)$me['seeds'] . '&xp=eq.' . (int)$me['xp'], [
        'seeds' => $seeds, 'xp' => $xp
    ]);
    if (!$updated) fail('Your balance changed. Reload the garden and try again', 409);

    [$code, $deleted] = sb_raw('DELETE',
        '/garden_plots?id=eq.' . (int)$plots[0]['id'] . '&user_id=eq.' . $uid . '&growth_stage=eq.2',
        null,
        ['return=representation']
    );
    if ($code < 200 || $code >= 300 || !$deleted) {
        sb('PATCH', "/profiles?id=eq.$uid", ['seeds' => (int)$me['seeds'], 'xp' => (int)$me['xp']]);
        fail('The plant changed before it could be harvested. Try again', 409);
    }

    json_out([
        'ok' => true, 'slot' => $slot, 'seeds' => $seeds, 'xp' => $xp,
        'reward_seeds' => $rewardSeeds, 'reward_xp' => $rewardXp, 'seasonal_bonus' => $bonus
    ]);
}

if ($action === 'dig') {
    $deleted = sb('DELETE', "/garden_plots?user_id=eq.$uid&slot=eq.$slot", null, ['return=representation']);
    if (!$deleted) fail('There is no plant in that plot', 404);
    json_out(['ok' => true, 'slot' => $slot]);
}

if ($action !== 'plant') fail('Unknown garden action');
$item = sb('GET', "/shop_items?id=eq.$itemId&is_active=eq.true&select=*");
if (!$item) fail('That item is not for sale', 404);
$cost = (int)$item[0]['cost_seeds'];
$balance = (int)$me['seeds'];
if ($balance < $cost) fail('Not enough seeds yet', 402);
if (sb('GET', "/garden_plots?user_id=eq.$uid&slot=eq.$slot&select=id")) fail('That plot is already planted', 409);

/* spend seeds first, guarded by the old balance so two requests cannot both pay */
$paid = sb('PATCH', "/profiles?id=eq.$uid&seeds=eq.$balance", ['seeds' => $balance - $cost]);
if (!$paid) fail('Your balance changed. Try again.', 409);

[$code] = sb_raw('POST', '/garden_plots', [
    'user_id' => $me['id'], 'slot' => $slot, 'item_id' => $itemId, 'growth_stage' => 0
]);
if ($code < 200 || $code >= 300) {
    sb('PATCH', "/profiles?id=eq.$uid", ['seeds' => $balance]); // refund
    fail('That plot is already planted', 409);
}
json_out(['ok' => true, 'seeds' => $balance - $cost, 'slot' => $slot, 'item_id' => $itemId], 201);
?>