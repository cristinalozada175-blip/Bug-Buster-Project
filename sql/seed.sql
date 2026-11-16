-- Python Garden seed data. Run once in the Supabase SQL Editor, after sql/schema.sql.
-- Levels, items, users and toolbox topics mirror data/*.json.

-- Chapters
insert into chapters (slug, title, blurb, sort_order, is_published) values 
  ('first-sprouts', 'First sprouts', 'Print, variables, math, decisions and loops.', 1, true),
  ('sprouting-logic', 'Sprouting Logic & Data', 'Lists, indexing, conditionals, and while loops.', 2, true),
  ('master-garden', 'Master Garden Algorithms', 'Dictionaries, f-strings, list filtering, and algorithms.', 3, true)
on conflict (slug) do nothing;

-- Chapter 1 Lessons
insert into lessons (chapter_id, title, concept, goals, starter_code, expected_output, rules, reward_seeds, reward_xp, sort_order) values 
((select id from chapters where slug='first-sprouts'), 'Say hello', 'Printing', '["Use print() to show a message", "Make the console say exactly: Hello, garden!"]'::jsonb, '# Say hello to your garden
print("Hello, garden!")
', 'Hello, garden!', '{"mustContain": ["print("], "hint": "Text goes inside quotes: print(\"Hello, garden!\")"}'::jsonb, 15, 40, 1),

((select id from chapters where slug='first-sprouts'), 'Name your water', 'Variables', '["Create a variable named water and set it to 4", "Print the variable"]'::jsonb, '# Store a number in a variable, then print it
water = 4
print(water)
', '4', '{"mustContain": ["water", "print(water)"], "hint": "A variable is a name, an equals sign and a value: water = 4"}'::jsonb, 15, 40, 2),

((select id from chapters where slug='first-sprouts'), 'Count the seeds', 'Math', '["Multiply seeds by pots using *", "Print the total"]'::jsonb, 'seeds = 6
pots = 3
# Print how many seeds you need in total
print(seeds * pots)
', '18', '{"mustContain": ["*", "print("], "hint": "You can put a calculation inside print: print(seeds * pots)"}'::jsonb, 15, 40, 3),

((select id from chapters where slug='first-sprouts'), 'Sunny or not', 'Decisions', '["Write an if that checks sun > 5", "Add an else for the other case", "Print Grow! when the sun is bright"]'::jsonb, 'sun = 8
# If sun is above 5, print Grow! Otherwise print Wait
if sun > 5:
    print("Grow!")
else:
    print("Wait")
', 'Grow!', '{"mustContain": ["if", "else", "print("], "hint": "End the if line with a colon and indent the next line by 4 spaces."}'::jsonb, 15, 40, 4),

((select id from chapters where slug='first-sprouts'), 'Water every plant', 'Loops', '["Use a for loop with range(3)", "Print Water plant 1, Water plant 2 and Water plant 3"]'::jsonb, '# Water 3 plants, one line each
for i in range(3):
    print("Water plant", i + 1)
', 'Water plant 1
Water plant 2
Water plant 3', '{"mustContain": ["for", "range"], "hint": "range(3) counts 0, 1, 2. Print i + 1 to start at 1."}'::jsonb, 15, 40, 5);

-- Chapter 2 Lessons
insert into lessons (chapter_id, title, concept, goals, starter_code, expected_output, rules, reward_seeds, reward_xp, sort_order) values 
((select id from chapters where slug='sprouting-logic'), 'Gather the Harvest', 'Lists', '["Access the first element of harvest with [0]", "Print the first vegetable"]'::jsonb, '# Store 3 garden vegetables in a list
harvest = ["carrot", "tomato", "radish"]
# Print the first vegetable
print(harvest[0])
', 'carrot', '{"mustContain": ["harvest[0]", "print("], "hint": "Lists in Python start at index 0: harvest[0]"}'::jsonb, 20, 50, 1),

((select id from chapters where slug='sprouting-logic'), 'Count the Petals', 'List Length', '["Use len() to measure the flowers list", "Print the length"]'::jsonb, 'flowers = ["rose", "tulip", "daisy", "sunflower"]
# Print how many flowers are in the garden
print(len(flowers))
', '4', '{"mustContain": ["len(flowers)", "print("], "hint": "len(flowers) returns the total number of items in the list."}'::jsonb, 20, 50, 2),

((select id from chapters where slug='sprouting-logic'), 'Flower Bloom Checker', 'Logic and Conditions', '["Use an if condition with and", "Print Blooming! when both sun >= 7 and water >= 5", "Add else block printing Wilting"]'::jsonb, 'sun = 10
water = 8
# If sun >= 7 and water >= 5, print Blooming! Otherwise print Wilting
if sun >= 7 and water >= 5:
    print("Blooming!")
else:
    print("Wilting")
', 'Blooming!', '{"mustContain": ["if", "and", "else", "print("], "hint": "Combine conditions with and: if sun >= 7 and water >= 5:"}'::jsonb, 25, 60, 3),

((select id from chapters where slug='sprouting-logic'), 'Watering While Sprouting', 'While Loops', '["Use a while loop checking drops > 0", "Print Drop with current drops count", "Subtract 1 from drops inside the loop"]'::jsonb, 'drops = 3
# Use a while loop to count down drops
while drops > 0:
    print("Drop " + str(drops))
    drops -= 1
', 'Drop 3
Drop 2
Drop 1', '{"mustContain": ["while", "drops", "print("], "hint": "Don''t forget to decrease drops inside the while loop: drops -= 1"}'::jsonb, 25, 60, 4),

((select id from chapters where slug='sprouting-logic'), 'Garden Greeting Function', 'Functions', '["Define a function named greet_plant with one parameter", "Return greeting text", "Call the function and print the result"]'::jsonb, '# Define a function named greet_plant with one parameter
def greet_plant(name):
    return "Hello " + name

print(greet_plant("Daisy"))
', 'Hello Daisy', '{"mustContain": ["def greet_plant", "return", "print("], "hint": "Functions let you reuse code. Indent the function body with 4 spaces."}'::jsonb, 30, 75, 5);

-- Chapter 3 Lessons
insert into lessons (chapter_id, title, concept, goals, starter_code, expected_output, rules, reward_seeds, reward_xp, sort_order) values 
((select id from chapters where slug='master-garden'), 'Catalog the Seeds', 'Dictionaries', '["Access the sunflower price using prices[\"sunflower\"]", "Print the price"]'::jsonb, 'prices = {"sunflower": 20, "tulip": 30}
# Print the price of a sunflower
print(prices["sunflower"])
', '20', '{"mustContain": ["prices[", "print("], "hint": "Dictionary values are retrieved with their key: prices[\"sunflower\"]"}'::jsonb, 30, 80, 1),

((select id from chapters where slug='master-garden'), 'Greenhouse Temperature', 'F-Strings', '["Use an f-string or formatting to combine variables", "Print exactly: The Fern is at 24C"]'::jsonb, 'temp = 24
plant = "Fern"
# Print: The Fern is at 24C
print(f"The {plant} is at {temp}C")
', 'The Fern is at 24C', '{"mustContain": ["print(", "24"], "hint": "Use formatted text: print(f\"The {plant} is at {temp}C\")"}'::jsonb, 35, 85, 2),

((select id from chapters where slug='master-garden'), 'Weed Remover', 'List Filtering', '["Loop over garden_bed", "Use if item == flower:", "Print only the flowers"]'::jsonb, 'garden_bed = ["flower", "weed", "flower", "weed", "flower"]
# Loop over garden_bed and print only items that equal flower
for item in garden_bed:
    if item == "flower":
        print(item)
', 'flower
flower
flower', '{"mustContain": ["for", "if", "print("], "hint": "Check each item inside the loop: if item == \"flower\": print(item)"}'::jsonb, 35, 90, 3),

((select id from chapters where slug='master-garden'), 'Garden Grid Matrix', 'Nested Loops', '["Use nested for loops with range()", "Print the plot coordinates for each cell"]'::jsonb, '# Plant a 2x3 garden grid: Rows 1 to 2, Columns 1 to 3
for row in range(1, 3):
    for col in range(1, 4):
        print(f"Plot ({row},{col})")
', 'Plot (1,1)
Plot (1,2)
Plot (1,3)
Plot (2,1)
Plot (2,2)
Plot (2,3)', '{"mustContain": ["for", "range", "print("], "hint": "A loop inside another loop generates coordinates for rows and columns."}'::jsonb, 40, 100, 4),

((select id from chapters where slug='master-garden'), 'Ultimate Garden Simulator', 'Capstone Project', '["Sum all numbers in the crops list", "Print exactly: Harvest total: 50"]'::jsonb, '# Garden Simulator: Calculate total harvest seeds
crops = [10, 25, 15]
total = 0
for yield_amount in crops:
    total += yield_amount
print("Harvest total:", total)
', 'Harvest total: 50', '{"mustContain": ["for", "total", "print("], "hint": "Accumulate the sum with total += yield_amount inside your loop."}'::jsonb, 50, 150, 5);

-- Shop Items
insert into shop_items (name, kind, cost_seeds, sprite) values ('Sunflower seed', 'seed', 20, 'sunflower');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Tulip bulb', 'seed', 30, 'tulip');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Mushroom spore', 'seed', 25, 'mushroom');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Cactus sprout', 'seed', 35, 'cactus');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Watering can', 'tool', 40, 'can');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Picket fence', 'decor', 50, 'fence');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Garden lantern', 'decor', 60, 'lantern');
insert into shop_items (name, kind, cost_seeds, sprite) values ('Lily pond', 'decor', 80, 'pond');

-- Toolbox Topics
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('Comments', 'Text after # is ignored by Python. Use it to leave notes for yourself.', '# This line is a note
print("Notes are free")  # so is this part', null);
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('print()', 'print() shows text or values in the console. Text goes inside quotes. Several values can be separated with commas.', 'print("Hello, garden!")
print("Plants:", 3)', (select id from lessons where title='Say hello' limit 1));
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('Variables', 'A variable stores a value under a name. Use = to store it, then use the name later.', 'water = 4
name = "Sprout"
print(name, water)', (select id from lessons where title='Name your water' limit 1));
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('Math operators', 'Use + - * / for arithmetic. // divides and drops the decimals, % gives the remainder, ** is a power.', 'print(6 * 3)
print(7 // 2)
print(7 % 3)
print(2 ** 3)', (select id from lessons where title='Count the seeds' limit 1));
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('if and else', 'if runs code only when a condition is true. else runs when it is not. Indent the code inside by 4 spaces.', 'sun = 8
if sun > 5:
    print("Grow!")
else:
    print("Wait")', (select id from lessons where title='Sunny or not' limit 1));
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('for loops and range()', 'A for loop repeats code. range(3) gives 0, 1 and 2, so the loop body runs three times.', 'for i in range(3):
    print("Water plant", i + 1)', (select id from lessons where title='Water every plant' limit 1));
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('Lists and Indexing', 'Lists hold multiple items in order. The first item is at index 0.', 'harvest = ["carrot", "tomato", "radish"]
print(harvest[0])', (select id from lessons where title='Gather the Harvest' limit 1));
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values ('Functions', 'Functions group statements under a name with def.', 'def water_flower(name):
    return "Watered " + name
print(water_flower("Rose"))', (select id from lessons where title='Garden Greeting Function' limit 1));

-- Achievements
insert into achievements (title, description, rule_key, threshold) values ('First sprout', 'Finish your first level', 'lessons_done', 1);
insert into achievements (title, description, rule_key, threshold) values ('Green thumb', 'Finish 5 levels', 'lessons_done', 5);
insert into achievements (title, description, rule_key, threshold) values ('Master Harvester', 'Finish 15 levels', 'lessons_done', 15);
insert into achievements (title, description, rule_key, threshold) values ('Getting started', 'Earn 100 XP', 'xp', 100);
insert into achievements (title, description, rule_key, threshold) values ('Gardener', 'Earn 250 XP', 'xp', 250);
insert into achievements (title, description, rule_key, threshold) values ('Botanist', 'Earn 500 XP', 'xp', 500);
insert into achievements (title, description, rule_key, threshold) values ('Master Gardener', 'Earn 1000 XP', 'xp', 1000);
insert into achievements (title, description, rule_key, threshold) values ('Three in a row', 'Reach a 3 day streak', 'streak', 3);
insert into achievements (title, description, rule_key, threshold) values ('Week in the dirt', 'Reach a 7 day streak', 'streak', 7);

-- Sample Gardeners (Users) for Leaderboard and Admin testing
-- If run on a live Supabase database with auth, replace UUIDs with auth.users IDs or run via admin API.
-- Profiles table seed:
insert into profiles (id, username, role, xp, seeds, streak, is_verified, is_suspended, created_at) values
  ('a0000001-0000-0000-0000-000000000001', 'flora_coder', 'user', 1420, 420, 14, true, false, now() - interval '30 days'),
  ('a0000002-0000-0000-0000-000000000002', 'python_sprout', 'user', 1150, 310, 10, true, false, now() - interval '24 days'),
  ('a0000003-0000-0000-0000-000000000003', 'botanist_bob', 'user', 890, 240, 7, true, false, now() - interval '18 days'),
  ('a0000004-0000-0000-0000-000000000004', 'green_thumb_max', 'user', 680, 180, 6, false, false, now() - interval '14 days'),
  ('a0000005-0000-0000-0000-000000000005', 'leafy_luna', 'user', 520, 135, 5, true, false, now() - interval '12 days'),
  ('a0000006-0000-0000-0000-000000000006', 'clover_clara', 'user', 380, 95, 4, false, false, now() - interval '9 days'),
  ('a0000007-0000-0000-0000-000000000007', 'seedling_sam', 'user', 240, 60, 3, true, false, now() - interval '6 days'),
  ('a0000008-0000-0000-0000-000000000008', 'blossom_bee', 'user', 140, 35, 2, false, false, now() - interval '4 days'),
  ('a0000009-0000-0000-0000-000000000009', 'sunflower_sid', 'user', 80, 20, 1, false, false, now() - interval '2 days'),
  ('a000000a-0000-0000-0000-00000000000a', 'admin_rose', 'admin', 2500, 999, 21, true, false, now() - interval '45 days')
on conflict (id) do nothing;
