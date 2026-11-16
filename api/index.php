<?php
declare(strict_types=1);

/**
 * Bug Buster - Centralized Vercel API Gateway
 *
 * Directs all /api/* requests to the corresponding backend handler in /backend
 * while consolidating everything into a single Serverless Function for Vercel deployment.
 */

// Parse incoming request path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?? '/';

// Preserve query parameters in $_GET if not populated automatically
if (empty($_GET) && !empty($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $_GET);
}

// Strip leading slash and 'api/' prefix
$route = preg_replace('#^/?api/?#i', '', $path);
$route = trim($route, '/');

// Root API health check
if ($route === '' || strtolower($route) === 'index.php') {
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => true,
        'status' => 'online',
        'message' => 'Bug Buster API Gateway is active',
        'functions' => 1
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Ensure .php extension is present
if (!preg_match('/\.php$/i', $route)) {
    $route .= '.php';
}

// Sanitize route to prevent directory traversal
$cleanRoute = str_replace('\\', '/', $route);
if (strpos($cleanRoute, '..') !== false || strpos($cleanRoute, "\0") !== false) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Invalid route path'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Target handler path in /backend
$targetFile = dirname(__DIR__) . '/backend/' . $cleanRoute;

if (is_file($targetFile)) {
    $_SERVER['SCRIPT_FILENAME'] = $targetFile;
    require $targetFile;
    exit;
}

// Handler not found
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'error' => 'API endpoint not found',
    'route' => $cleanRoute
], JSON_UNESCAPED_UNICODE);
exit;
