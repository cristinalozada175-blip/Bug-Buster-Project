# PYTHON GARDEN
## Complete Python Learning Curriculum (10 Progressive Levels)

---

## Curriculum Overview

| Chapter | Level | Lesson Title | Topic | Core Concept |
| :--- | :--- | :--- | :--- | :--- |
| **Chapter 1: Getting Started** | Level 1 | What is Programming? | Introduction to Programming | Programming Fundamentals |
| **Chapter 1: Getting Started** | Level 2 | What is Python? | Introduction to Python | Python Basics & Syntax |
| **Chapter 1: Getting Started** | Level 3 | Leaving Garden Notes | Comments in Python | Comments (`#`) |
| **Chapter 2: First Sprouts** | Level 4 | Say Hello | The `print()` Function | Printing Output |
| **Chapter 2: First Sprouts** | Level 5 | Name Your Water | Variables in Python | Variables & Assignment |
| **Chapter 2: First Sprouts** | Level 6 | Label Your Plant | Strings in Python | Strings & Concatenation |
| **Chapter 2: First Sprouts** | Level 7 | Count the Seeds | Mathematical Operators | Arithmetic Operations |
| **Chapter 3: Growing Logic** | Level 8 | Sunny or Not? | Conditional Statements | `if`, `elif`, `else` |
| **Chapter 3: Growing Logic** | Level 9 | Water Every Plant | Loops in Python | `for` & `while` Loops |
| **Chapter 3: Growing Logic** | Level 10 | Seed Basket | Lists in Python | Lists & Zero-Based Indexing |

---

# CHAPTER 1 — GETTING STARTED
*Lessons 1–3 · Understanding programming and Python fundamentals*

---

### Level 1: What is Programming?
**Topic:** Introduction to Programming  
**Concept:** Programming Fundamentals

#### 1. Introduction
Have you ever wondered how computers know what to do? When you open an application, play a game, or visit a website, the computer is following instructions created by programmers. These instructions are written using something called a programming language.

Programming is the process of creating instructions that tell a computer how to perform specific tasks. These instructions must be clear, organized, and arranged in the correct order because computers follow commands literally.

*Garden Analogy:* Think of programming as planting a garden. Before a plant can grow, you must follow certain steps: prepare the soil, plant the seed, water it, and provide sunlight. Skipping an important step may prevent the plant from growing properly.

#### 2. What is a Program?
A program is a collection of instructions written to perform a particular task.
- A calculator that performs mathematical operations.
- A messaging application that sends messages.
- A game that responds to player actions.
- A website that displays information.
- A banking application that processes transactions.

#### 3. How Does Programming Work? (The 3-Step Process)
1. **Input:** Information provided to the computer (e.g. entering a username).
2. **Processing:** The computer follows instructions to manipulate information (e.g. preparing a personalized greeting).
3. **Output:** The result produced by the computer (e.g. displaying the welcome message).

#### 4. Understanding Instructions
Computers cannot interpret vague human statements. Instructions must follow exact syntax:
```python
print("Step 1: Plant seed")
```
- `print` is a built-in Python function.
- Parentheses `()` contain the information to display.
- Quotation marks indicate that the information is text.

#### 5. Important Terms
| Term | Meaning |
| :--- | :--- |
| **Programming** | Creating instructions for computers |
| **Program** | A set of instructions |
| **Programmer** | A person who writes programs |
| **Programming language** | A language used to communicate instructions to computers |
| **Input** | Information provided to a program |
| **Process** | Instructions performed on information |
| **Output** | The result produced by a program |

#### 6. Common Mistakes
- Giving incomplete instructions.
- Placing steps in the wrong order.
- Forgetting that computers follow written instructions literally.
- Confusing input with output.

#### 7. Knowledge Check
1. What is programming?
2. What do we call a collection of instructions that performs a task?
3. What are the three basic stages of the programming process?
4. Why should computer instructions be clear and organized?

#### 8. Practice Activity
Write a Python instruction that displays:
```python
print("Step 1: Plant seed")
```
*Expected Output:*
```
Step 1: Plant seed
```

---

### Level 2: What is Python?
**Topic:** Introduction to Python Programming  
**Concept:** Python Introduction & Syntax

#### 1. Introduction
Python is a high-level, general-purpose programming language known for its simple and readable syntax. It was designed to make programming easier to understand, especially for beginners.

#### 2. Why Python is Beginner-Friendly
- Its syntax resembles everyday English.
- It requires fewer lines of code for many tasks.
- It supports different programming styles.
- It has thousands of built-in and third-party libraries.
- It has a large and supportive global community.

#### 3. Where is Python Used?
- **Web Development:** Frameworks like Django and Flask.
- **Artificial Intelligence:** Machine learning, deep learning, and AI models.
- **Game Development:** 2D games and rapid gameplay prototyping.
- **Automation:** Writing scripts to automate repetitive daily tasks.
- **Data Science:** Data analysis, statistics, and visualization.

#### 4. Understanding Python Syntax
Syntax refers to the grammatical rules of the programming language.
```python
print("Hello, Garden!")
```
- `print`: Function name (must be lowercase)
- `(`: Opening parenthesis
- `"Hello, Garden!"`: String literal
- `)`: Closing parenthesis

#### 5. Sequential Execution & The Interpreter
Python executes instructions sequentially from top to bottom:
```python
print("Prepare the soil")
print("Plant the seeds")
print("Water the garden")
```
The **Python interpreter** reads, interprets, and runs each line in sequence. If a syntax error is encountered, execution halts and an error report is shown.

#### 6. Common Mistakes
- **Missing quotation marks:** `print(Hello)` raises a `NameError`.
- **Missing parentheses:** `print "Hello"` is invalid in Python 3.
- **Incorrect capitalization:** `Print("Hello")` fails because Python is strictly case-sensitive.

#### 7. Knowledge Check
1. What is Python?
2. Why is Python considered beginner-friendly?
3. What does the Python interpreter do?
4. What is syntax?
5. Is Python case-sensitive?

#### 8. Practice Activity
Write a Python program that displays:
```python
print("Python is ready!")
```
*Expected Output:*
```
Python is ready!
```

---

### Level 3: Leaving Garden Notes
**Topic:** Comments in Python  
**Concept:** Comments (`#`)

#### 1. Introduction
When writing programs, developers leave notes to explain what certain instructions do. These notes are called **comments**. Comments are written exclusively for human readers; the Python interpreter ignores them completely.

#### 2. Why Comments are Essential
- **Explaining Code:** Clarifying why a specific approach or logic was taken.
- **Organizing Code:** Visually separating sections of a large program.
- **Temporarily Disabling Code:** Testing and debugging without deleting lines.

#### 3. Types of Comments
- **Single-Line Comments:** Begin with `#` on their own line:
  ```python
  # This is a comment explaining the garden setup
  print("Welcome to my garden!")
  ```
- **Inline Comments:** Appear on the same line after executable code:
  ```python
  water = 5  # Number of water containers
  ```

#### 4. Common Mistakes
- Forgetting the `#` symbol: Python will attempt to execute plain English notes, triggering a `SyntaxError`.
- Expecting comments to appear in the terminal output.

#### 5. Knowledge Check
1. What symbol is used to create a Python comment?
2. Does Python execute comments?
3. Why do programmers use comments?
4. What is the difference between a regular comment and an inline comment?

#### 6. Practice Activity
Add a `#` in front of the note line so Python ignores it:
```python
# Add a # in front of this note so Python ignores it
print("Notes are free")
```
*Expected Output:*
```
Notes are free
```

---

# CHAPTER 2 — FIRST SPROUTS
*Lessons 4–7 · Writing instructions, storing information, and performing calculations*

---

### Level 4: Say Hello
**Topic:** The `print()` Function  
**Concept:** Printing

#### 1. Introduction
Programs need to communicate with users. In Python, the standard way to display text and data in the console is the built-in `print()` function.

#### 2. Printing Text (Strings)
Strings can be wrapped in double (`"..."`) or single (`'...'`) quotes:
```python
print("Hello, Garden!")
print('Welcome, Gardener!')
```

#### 3. Printing Numbers
Numeric values do not require quotation marks:
```python
print(25)
print(3.14)
```

#### 4. Printing Multiple Values & Newlines
Separate multiple values with commas inside `print()`. Python adds a space by default:
```python
print("Plant:", "Rose")
print("Water:", 5)
```
Use `\n` to insert a newline inside a string:
```python
print("Hello\nGarden")
```

#### 5. Common Mistakes
- Missing quotes around text: `print(Rose)` (Python searches for a variable named `Rose`).
- Mismatched quotes: `print("Rose')`.
- Forgetting parentheses: `print "Hello"`.

#### 6. Knowledge Check
1. What is the purpose of `print()`?
2. What symbols surround the value inside `print()`?
3. Do numbers require quotation marks?
4. How can you display multiple lines?

#### 7. Practice Activity
```python
print("Hello, garden!")
```
*Expected Output:*
```
Hello, garden!
```

---

### Level 5: Name Your Water
**Topic:** Variables in Python  
**Concept:** Variables & Assignment

#### 1. Introduction
A variable is a named storage container used to hold data values. Think of variables as labeled pots or water jugs in your garden. Once stored, you can recall and modify the value at any time.

#### 2. Creating and Assigning Variables
Variables are created the moment you first assign a value to them using the assignment operator `=`:
```python
water = 4
plant = "Rose"
seeds = 10
```

#### 3. Using & Updating Variables
- Access the stored value: `print(water)` outputs `4`.
- Notice: `print("water")` prints the word `"water"`, while `print(water)` prints the contents of the variable.
- Reassigning values:
  ```python
  water = 4
  water = water + 2
  print(water)  # Outputs 6
  ```

#### 4. Variable Naming Rules
- Must begin with a letter or underscore (`_`).
- Cannot start with a digit (`2water` is invalid).
- Cannot contain spaces or hyphens (use `snake_case`, e.g., `water_level`).
- Case-sensitive: `water`, `Water`, and `WATER` are three distinct variables.
- Cannot use reserved keywords (`if`, `for`, `print`, `while`).

#### 5. Common Mistakes
- Calling an undefined variable before assignment (`NameError`).
- Wrapping the variable name in quotes when printing its value.

#### 6. Practice Activity
```python
water = 4
print(water)
```
*Expected Output:*
```
4
```

---

### Level 6: Label Your Plant
**Topic:** Strings in Python  
**Concept:** Strings & Concatenation

#### 1. Introduction
Strings represent textual data. Any sequence of characters surrounded by quotes is a string.

#### 2. Strings vs. Numbers
- `20` is an integer; `"20"` is a string.
- `20 + 5` produces `25` (arithmetic addition).
- `"20" + "5"` produces `"205"` (string concatenation).

#### 3. String Concatenation
Combine strings using the `+` operator:
```python
first_name = "Sunny"
last_name = "Flower"
full_name = first_name + " " + last_name
print(full_name)  # Outputs: Sunny Flower
```

#### 4. String Length (`len()`)
The `len()` function calculates the number of characters in a string:
```python
plant = "Sunflower"
print(len(plant))  # Outputs: 9
```

#### 5. Practice Activity
```python
crop = "Sunflower"
print(crop)
```
*Expected Output:*
```
Sunflower
```

---

### Level 7: Count the Seeds
**Topic:** Mathematical Operators in Python  
**Concept:** Math & Arithmetic

#### 1. Introduction
Python handles calculations using standard mathematical operators.

#### 2. Arithmetic Operators
| Operator | Name | Purpose | Example | Result |
| :--- | :--- | :--- | :--- | :--- |
| `+` | Addition | Adds numbers | `5 + 3` | `8` |
| `-` | Subtraction | Subtracts numbers | `10 - 4` | `6` |
| `*` | Multiplication | Multiplies numbers | `6 * 3` | `18` |
| `/` | Division | Divides (returns float) | `12 / 3` | `4.0` |
| `//` | Floor Division | Divides and rounds down | `10 // 3` | `3` |
| `%` | Modulus | Returns division remainder | `10 % 3` | `1` |
| `**` | Exponentiation | Raises to a power | `2 ** 3` | `8` |

#### 3. Order of Operations (PEMDAS)
Python evaluates expressions using standard precedence:
1. Parentheses `()`
2. Exponents `**`
3. Multiplication `*`, Division `/`, Floor Division `//`, Modulus `%`
4. Addition `+`, Subtraction `-`

```python
result = (5 + 2) * 3  # 21
```

#### 4. Practice Activity
```python
seeds = 6
pots = 3
print(seeds * pots)
```
*Expected Output:*
```
18
```

---

# CHAPTER 3 — GROWING LOGIC
*Lessons 8–10 · Making decisions, repeating instructions, and organizing data*

---

### Level 8: Sunny or Not?
**Topic:** Conditional Statements (`if`, `elif`, `else`)  
**Concept:** Decisions & Logic

#### 1. Introduction
Programs need to respond to changing conditions. In Python, conditional statements allow code to execute specific blocks depending on whether a condition evaluates to `True` or `False`.

#### 2. The `if` and `else` Statements
```python
sun = 8
if sun > 5:
    print("Grow!")
else:
    print("Wait")
```

#### 3. Comparison Operators
- `==`: Equal to (`5 == 5` is `True`)
- `!=`: Not equal to (`5 != 3` is `True`)
- `>`: Greater than (`8 > 5` is `True`)
- `<`: Less than (`3 < 5` is `True`)
- `>=`: Greater than or equal to (`5 >= 5` is `True`)
- `<=`: Less than or equal to (`4 <= 5` is `True`)

#### 4. Indentation Rules
In Python, indentation (typically 4 spaces) defines which statements belong to an `if`, `elif`, or `else` block. Inconsistent indentation causes an `IndentationError`.

#### 5. Common Mistakes
- Using `=` (assignment) instead of `==` (equality comparison).
- Forgetting the trailing colon `:` on `if` and `else` lines.

#### 6. Practice Activity
```python
sun = 8
if sun > 5:
    print("Grow!")
else:
    print("Wait")
```
*Expected Output:*
```
Grow!
```

---

### Level 9: Water Every Plant
**Topic:** Loops in Python (`for`, `while`)  
**Concept:** Loops & Iteration

#### 1. Introduction
Instead of typing the same instructions over and over, loops allow programs to repeat blocks of code efficiently.

#### 2. The `for` Loop with `range()`
```python
for i in range(3):
    print("Water plant", i + 1)
```
- `range(3)` produces: `0`, `1`, `2`.
- `i + 1` shifts the display count to start at `1`, `2`, `3`.

#### 3. The `while` Loop
A `while` loop continues executing as long as its condition remains `True`:
```python
water = 1
while water <= 3:
    print("Watering count:", water)
    water += 1  # Crucial: update condition to avoid an infinite loop
```

#### 4. Common Mistakes
- Forgetting that `range(n)` counts from `0` to `n - 1`.
- Omitting loop increment in `while` loops, causing infinite execution.

#### 5. Practice Activity
```python
for i in range(3):
    print("Water plant", i + 1)
```
*Expected Output:*
```
Water plant 1
Water plant 2
Water plant 3
```

---

### Level 10: Seed Basket
**Topic:** Lists in Python  
**Concept:** Lists & Zero-Based Indexing

#### 1. Introduction
A list is an ordered, mutable collection of items enclosed in square brackets `[]`. Lists allow storing multiple related values inside one variable.

#### 2. Creating & Indexing Lists
```python
basket = ["Rose", "Mint", "Fern"]
```
Python lists use zero-based indexing:
- `basket[0]` $\rightarrow$ `"Rose"`
- `basket[1]` $\rightarrow$ `"Mint"`
- `basket[2]` $\rightarrow$ `"Fern"`

#### 3. Modifying Lists
- **Change an item:** `basket[1] = "Sunflower"`
- **Append an item:** `basket.append("Daisy")`
- **Remove an item:** `basket.remove("Mint")` or `basket.pop(0)`
- **List length:** `len(basket)`

#### 4. Looping Through a List
```python
for plant in basket:
    print("Growing:", plant)
```

#### 5. Common Mistakes
- Using round parentheses `()` instead of square brackets `[]`.
- Index out of range: requesting `basket[3]` when the list only contains 3 items (indices `0`, `1`, `2`).

#### 6. Practice Activity
```python
basket = ["Rose", "Mint", "Fern"]
print(basket[1])
```
*Expected Output:*
```
Mint
```

---

## Pedagogical Workflow in Python Garden

```
[1. Read Full Lesson & Mascot Tips]
            │
            ▼
[2. Inspect Starter Code & Goals]
            │
            ▼
[3. Code in Python Editor]
            │
            ▼
[4. Run in Dynamic Terminal (Ctrl+Enter)]
            │
            ▼
[5. Verify & Check Output]
            │
            ▼
[6. Win Screen: Earn XP & Seeds, Unlock Next Level!]
```
