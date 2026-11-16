-- Python Garden seed data. Run once in the Supabase SQL Editor, after sql/schema.sql.
-- Levels, items, users and toolbox topics mirror data/*.json.

-- Chapters
insert into chapters (slug, title, blurb, sort_order, is_published) values 
  ('getting-started', 'Getting Started', 'Understanding programming, Python fundamentals, and leaving garden notes.', 1, true),
  ('first-sprouts', 'First Sprouts', 'Displaying output, variables, plant labels, and math calculations.', 2, true),
  ('growing-logic', 'Growing Logic', 'Making decisions with conditionals, repeating with loops, and organizing lists.', 3, true)
on conflict (slug) do nothing;

-- Chapter 1 Lessons
insert into lessons (chapter_id, title, concept, goals, starter_code, expected_output, rules, reward_seeds, reward_xp, sort_order) values 
((select id from chapters where slug='getting-started'), 'What is Programming?', 'Programming Fundamentals', '["Understand that programs follow instructions step by step", "Display your first instruction: Step 1: Plant seed"]'::jsonb, '# Computers follow instructions step by step
print("Step 1: Plant seed")
', 'Step 1: Plant seed', '{"mustContain": ["print(", "Step 1: Plant seed"], "hint": "Put your text inside quotes: print(\"Step 1: Plant seed\")"}'::jsonb, 15, 40, 1),

((select id from chapters where slug='getting-started'), 'What is Python?', 'Python Basics', '["Learn that Python runs code from top to bottom", "Make the console say: Python is ready!"]'::jsonb, '# Python is case-sensitive! Always use lowercase print()
print("Python is ready!")
', 'Python is ready!', '{"mustContain": ["print(", "Python is ready!"], "hint": "Remember lowercase print: print(\"Python is ready!\")"}'::jsonb, 15, 40, 2),

((select id from chapters where slug='getting-started'), 'Leaving Garden Notes', 'Comments', '["Use the # symbol to write a comment that Python ignores", "Keep the message line active to print: Notes are free"]'::jsonb, '# Add a # in front of this note so Python ignores it
# Plant seeds carefully
print("Notes are free")
', 'Notes are free', '{"mustContain": ["#", "print("], "hint": "Lines starting with # are notes for you. Python only runs lines without #"}'::jsonb, 15, 40, 3);

-- Chapter 2 Lessons
insert into lessons (chapter_id, title, concept, goals, starter_code, expected_output, rules, reward_seeds, reward_xp, sort_order) values 
((select id from chapters where slug='first-sprouts'), 'Say Hello', 'Printing', '["Use print() to say hello to your garden", "Make the console say exactly: Hello, garden!"]'::jsonb, '# Say hello to your garden
print("Hello, garden!")
', 'Hello, garden!', '{"mustContain": ["print("], "hint": "Text goes inside quotes: print(\"Hello, garden!\")"}'::jsonb, 15, 40, 1),

((select id from chapters where slug='first-sprouts'), 'Name Your Water', 'Variables', '["Create a variable named water and set it to 4", "Print the variable''s value using print(water)"]'::jsonb, '# Store a number in a variable, then print it
water = 4
print(water)
', '4', '{"mustContain": ["water", "print(water)"], "hint": "A variable stores a value: water = 4. Print it without quotes: print(water)"}'::jsonb, 15, 40, 2),

((select id from chapters where slug='first-sprouts'), 'Label Your Plant', 'Strings', '["Store the plant name \"Sunflower\" in the crop variable", "Print the plant label to the console"]'::jsonb, '# Label your plant with a text string
crop = "Sunflower"
print(crop)
', 'Sunflower', '{"mustContain": ["crop", "print(crop)"], "hint": "Words go inside quotation marks: crop = \"Sunflower\""}'::jsonb, 20, 50, 3),

((select id from chapters where slug='first-sprouts'), 'Count the Seeds', 'Math', '["Multiply seeds by pots using *", "Print the total seeds needed (18)"]'::jsonb, 'seeds = 6
pots = 3
# Multiply seeds by pots and print total
print(seeds * pots)
', '18', '{"mustContain": ["*", "print("], "hint": "Python uses * for multiplication: print(seeds * pots)"}'::jsonb, 20, 50, 4);

-- Chapter 3 Lessons
insert into lessons (chapter_id, title, concept, goals, starter_code, expected_output, rules, reward_seeds, reward_xp, sort_order) values 
((select id from chapters where slug='growing-logic'), 'Sunny or Not?', 'Decisions', '["Write an if that checks if sun > 5", "Add an else block for when sunlight is low", "Print Grow! when the sun is bright"]'::jsonb, 'sun = 8
# If sun is above 5, print Grow! Otherwise print Wait
if sun > 5:
    print("Grow!")
else:
    print("Wait")
', 'Grow!', '{"mustContain": ["if", "else", "print("], "hint": "End the if and else lines with a colon (:) and indent the print lines by 4 spaces."}'::jsonb, 25, 60, 1),

((select id from chapters where slug='growing-logic'), 'Water Every Plant', 'Loops', '["Use a for loop with range(3)", "Print Water plant 1, Water plant 2, and Water plant 3"]'::jsonb, '# Water 3 plants using a loop
for i in range(3):
    print("Water plant", i + 1)
', 'Water plant 1
Water plant 2
Water plant 3', '{"mustContain": ["for", "range"], "hint": "range(3) counts 0, 1, 2. Use i + 1 to display 1, 2, 3!"}'::jsonb, 25, 60, 2),

((select id from chapters where slug='growing-logic'), 'Seed Basket', 'Lists', '["Create a list of 3 plants with square brackets [ ]", "Access and print the second plant using [1]", "Make the console display: Mint"]'::jsonb, '# Store 3 garden plants in a list
basket = ["Rose", "Mint", "Fern"]
# Print the second plant (index 1)
print(basket[1])
', 'Mint', '{"mustContain": ["basket[1]", "print("], "hint": "Python starts counting at index 0! So basket[0] is Rose, and basket[1] is Mint."}'::jsonb, 30, 75, 3);

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
insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('Programming Fundamentals', 'Programming is creating instructions for computers. Every program follows 3 stages: Input (information entered), Process (computer follows steps), and Output (results displayed).', '# Input -> Process -> Output
# Displaying an instruction:
print("Step 1: Plant seed")', null);

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('What is Python?', 'Python executes instructions sequentially from top to bottom. Python is case-sensitive: always use lowercase print().', 'print("Prepare the soil")
print("Plant the seeds")
print("Water the garden")', (select id from lessons where title='What is Python?' limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('Comments', 'Text after # is ignored by Python. Use it to leave notes for yourself.', '# This line is a note
print("Notes are free")  # so is this part', (select id from lessons where title='Leaving Garden Notes' limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('print()', 'print() shows text or values in the console. Text goes inside quotes. Several values can be separated with commas.', 'print("Hello, garden!")
print("Plants:", 3)', (select id from lessons where lower(title)=lower('Say Hello') limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('Variables', 'A variable stores a value under a name. Use = to store it, then use the name later.', 'water = 4
name = "Sprout"
print(name, water)', (select id from lessons where lower(title)=lower('Name Your Water') limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('Strings & Concatenation', 'Strings represent text in quotes. Combine them using + (concatenation). Measure the number of characters in a string with len().', 'first = "Python"
second = "Garden"
print(first + " " + second)
print(len(first))', (select id from lessons where lower(title)=lower('Label Your Plant') limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('Math operators', 'Use + - * / for arithmetic. // divides and drops the decimals, % gives the remainder, ** is a power.', 'print(6 * 3)
print(7 // 2)
print(7 % 3)
print(2 ** 3)', (select id from lessons where lower(title)=lower('Count the Seeds') limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('if and else', 'if runs code only when a condition is true. else runs when it is not. Indent the code inside by 4 spaces.', 'sun = 8
if sun > 5:
    print("Grow!")
else:
    print("Wait")', (select id from lessons where lower(title)=lower('Sunny or Not?') limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('for loops and range()', 'A for loop repeats code. range(3) gives 0, 1 and 2, so the loop body runs three times.', 'for i in range(3):
    print("Water plant", i + 1)', (select id from lessons where lower(title)=lower('Water Every Plant') limit 1));

insert into toolbox_topics (title, summary, example_code, unlock_lesson_id) values 
('Lists and Indexing', 'Lists hold multiple items in order. The first item is at index 0.', 'basket = ["Rose", "Mint", "Fern"]
print(basket[1])', (select id from lessons where lower(title)=lower('Seed Basket') limit 1));

-- Achievements
insert into achievements (title, description, rule_key, threshold) values ('First sprout', 'Finish your first level', 'lessons_done', 1);
insert into achievements (title, description, rule_key, threshold) values ('Green thumb', 'Finish 5 levels', 'lessons_done', 5);
insert into achievements (title, description, rule_key, threshold) values ('Master Harvester', 'Finish 10 levels', 'lessons_done', 10);
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
