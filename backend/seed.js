const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

const verbal_pool = [
  { text: "Choose the correct synonym for 'Diligent':", options: ["Lazy", "Hardworking", "Proud", "Careless"], answer: "Hardworking" },
  { text: "Find the error: 'None of the students (A) / have finished (B) / their homework (C) / yet (D).'", options: ["None of the students", "have finished", "their homework", "yet"], answer: "have finished" },
  { text: "Choose the correctly spelled word:", options: ["Occurance", "Occurrence", "Occurence", "Occurrance"], answer: "Occurrence" },
  { text: "Synonym of 'Ephemeral':", options: ["Short-lived", "Permanent", "Eternal", "Stable"], answer: "Short-lived" },
  { text: "Complete the sentence: 'The manager was ____ about the new project results.'", options: ["Optimistic", "Pessimistic", "Neutral", "Angry"], answer: "Optimistic" },
  { text: "Antonym of 'Abundant':", options: ["Scarce", "Plentiful", "Rich", "Full"], answer: "Scarce" },
  { text: "Identify the part of speech for 'quickly' in 'He ran quickly.':", options: ["Adjective", "Adverb", "Noun", "Verb"], answer: "Adverb" },
  { text: "Choose the correct preposition: 'He is fond ____ music.'", options: ["of", "off", "to", "with"], answer: "of" },
  { text: "Select the correctly punctuated sentence:", options: ["He said, 'I am busy.'", "He said 'I am busy.'", "He said, I am busy.", "He said: I am busy."], answer: "He said, 'I am busy.'" },
  { text: "Synonym of 'Fragile':", options: ["Strong", "Weak", "Brittle", "Tough"], answer: "Brittle" },
  { text: "Identify the tense: 'I have been working here for five years.'", options: ["Present Perfect", "Present Perfect Continuous", "Past Perfect", "Future Perfect"], answer: "Present Perfect Continuous" },
  { text: "Choose the word with the opposite meaning of 'Advance':", options: ["Retreat", "Forward", "Progress", "Move"], answer: "Retreat" },
  { text: "Fill in the blank: 'Either the teacher or the students ____ to be blamed.'", options: ["is", "are", "am", "was"], answer: "are" },
  { text: "One word substitution: 'A person who hates mankind.'", options: ["Misanthrope", "Philanthropist", "Optimist", "Pessimist"], answer: "Misanthrope" },
  { text: "Idiom: 'Piece of cake' means:", options: ["Difficult task", "Easy task", "Something tasty", "A celebration"], answer: "Easy task" },
  { text: "Synonym of 'Benevolent':", options: ["Kind", "Cruel", "Selfish", "Stingy"], answer: "Kind" },
  { text: "Antonym of 'Amateur':", options: ["Novice", "Professional", "Beginner", "Learner"], answer: "Professional" },
  { text: "Choose the correct article: 'He is ____ honest man.'", options: ["a", "an", "the", "no article"], answer: "an" },
  { text: "Identify the correctly spelled word:", options: ["Accomodation", "Accommodation", "Acommodation", "Accomodasion"], answer: "Accommodation" },
  { text: "Synonym of 'Candid':", options: ["Frank", "Secretive", "Doubtful", "False"], answer: "Frank" },
  { text: "Antonym of 'Gigantic':", options: ["Huge", "Tiny", "Massive", "Great"], answer: "Tiny" },
  { text: "Change to Passive Voice: 'The cat killed the mouse.'", options: ["The mouse was killed by the cat.", "The mouse is killed by the cat.", "The mouse has been killed by the cat.", "The mouse killed the cat."], answer: "The mouse was killed by the cat." },
  { text: "Choose the correct word for 'A collection of ships':", options: ["Fleet", "Flock", "Herd", "Swarm"], answer: "Fleet" },
  { text: "Synonym of 'Eloquent':", options: ["Fluent", "Silent", "Dull", "Inarticulate"], answer: "Fluent" },
  { text: "Antonym of 'Flexible':", options: ["Rigid", "Soft", "Pliable", "Elastic"], answer: "Rigid" },
  { text: "Complete the sentence: 'She has been studying ____ morning.'", options: ["since", "for", "from", "at"], answer: "since" },
  { text: "One word substitution: 'Study of sound.'", options: ["Acoustics", "Optics", "Botany", "Zoology"], answer: "Acoustics" },
  { text: "Idiom: 'Under the weather' means:", options: ["Feeling sick", "Feeling happy", "Feeling angry", "Feeling excited"], answer: "Feeling sick" },
  { text: "Synonym of 'Humble':", options: ["Modest", "Proud", "Arrogant", "Vain"], answer: "Modest" },
  { text: "Antonym of 'Ascent':", options: ["Descent", "Climb", "Rise", "Peak"], answer: "Descent" },
  { text: "Choose the correctly spelled word:", options: ["Maintenance", "Maintainence", "Maintenence", "Maintainance"], answer: "Maintenance" },
  { text: "Synonym of 'Incredible':", options: ["Unbelievable", "Ordinary", "Possible", "Likely"], answer: "Unbelievable" },
  { text: "Antonym of 'Optimistic':", options: ["Pessimistic", "Hopeful", "Positive", "Cheerful"], answer: "Pessimistic" },
  { text: "Fill in the blank: 'Neither of them ____ ready.'", options: ["is", "are", "were", "am"], answer: "is" },
  { text: "One word substitution: 'A place where bees are kept.'", options: ["Apiary", "Aviary", "Aquarium", "Orchard"], answer: "Apiary" },
  { text: "Idiom: 'Burn the midnight oil' means:", options: ["Work late into the night", "Sleep early", "Waste time", "Save energy"], answer: "Work late into the night" },
  { text: "Synonym of 'Meticulous':", options: ["Careful", "Careless", "Lazy", "Quick"], answer: "Careful" },
  { text: "Antonym of 'Victory':", options: ["Defeat", "Success", "Triumph", "Win"], answer: "Defeat" },
  { text: "Choose the correct word: 'The ____ of the city is beautiful.'", options: ["Sight", "Site", "Cite", "Slight"], answer: "Sight" },
  { text: "Synonym of 'Prudent':", options: ["Wise", "Foolish", "Rash", "Careless"], answer: "Wise" },
];

const numerical_pool = [
  { text: "A person crosses a 600m long street in 5 minutes. What is his speed in km/hr?", options: ["7.2", "8.4", "10", "3.6"], answer: "7.2" },
  { text: "The sum of two numbers is 25 and their difference is 13. Find their product.", options: ["114", "115", "116", "117"], answer: "114" },
  { text: "If 20% of a = b, then b% of 20 is the same as:", options: ["4% of a", "5% of a", "20% of a", "None"], answer: "4% of a" },
  { text: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:", options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"], answer: "Rs. 698" },
  { text: "What is the average of first five multiples of 3?", options: ["9", "12", "15", "18"], answer: "9" },
  { text: "A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price?", options: ["Rs. 1190", "Rs. 1200", "Rs. 1100", "Rs. 1150"], answer: "Rs. 1190" },
  { text: "The ratio of ages of A and B is 3:4. The sum of their ages is 28. Find A's age.", options: ["12", "16", "14", "18"], answer: "12" },
  { text: "A can do a work in 15 days and B in 20 days. Together they can do it in:", options: ["8.57 days", "10 days", "12 days", "7 days"], answer: "8.57 days" },
  { text: "Find the surface area of a cube whose edge is 5 cm.", options: ["150 sq cm", "125 sq cm", "100 sq cm", "75 sq cm"], answer: "150 sq cm" },
  { text: "If x:y = 2:3, then 5x+2y : 3x-y is:", options: ["16:3", "10:3", "7:3", "15:2"], answer: "16:3" },
  { text: "The average of seven consecutive numbers is 20. The largest number is:", options: ["23", "24", "22", "21"], answer: "23" },
  { text: "A train 120m long passes a pole in 6 seconds. Its speed is:", options: ["72 km/hr", "60 km/hr", "80 km/hr", "90 km/hr"], answer: "72 km/hr" },
  { text: "Find the LCM of 12, 15 and 20.", options: ["60", "120", "40", "80"], answer: "60" },
  { text: "In how many years will Rs. 500 double at 10% simple interest?", options: ["10", "12", "8", "15"], answer: "10" },
  { text: "The area of a circle is 154 sq cm. Its radius is:", options: ["7 cm", "14 cm", "21 cm", "3.5 cm"], answer: "7 cm" },
  { text: "If 15 men can complete a work in 20 days, how many men can do it in 12 days?", options: ["25", "30", "20", "18"], answer: "25" },
  { text: "A mixture contains milk and water in ratio 4:1. If 5L water is added, ratio becomes 2:1. Original milk was:", options: ["10L", "20L", "15L", "5L"], answer: "10L" },
  { text: "The cost price of 20 articles is same as selling price of x articles. If profit is 25%, x is:", options: ["16", "15", "18", "20"], answer: "16" },
  { text: "Find the 10th term of AP: 2, 7, 12...", options: ["47", "52", "42", "50"], answer: "47" },
  { text: "Successive discounts of 10% and 10% are equivalent to a single discount of:", options: ["19%", "20%", "21%", "18%"], answer: "19%" },
  { text: "The diagonal of a square is 10 cm. Its area is:", options: ["50 sq cm", "100 sq cm", "25 sq cm", "75 sq cm"], answer: "50 sq cm" },
  { text: "Average of first 100 natural numbers is:", options: ["50.5", "50", "51", "49.5"], answer: "50.5" },
  { text: "If a:b = 2:3 and b:c = 4:5, then a:b:c is:", options: ["8:12:15", "2:3:5", "4:6:10", "6:9:15"], answer: "8:12:15" },
  { text: "Two numbers are in ratio 3:5. If 9 is subtracted from each, ratio becomes 12:23. The numbers are:", options: ["33, 55", "36, 60", "30, 50", "39, 65"], answer: "33, 55" },
  { text: "The value of 0.003 * 0.02 is:", options: ["0.00006", "0.0006", "0.006", "0.06"], answer: "0.00006" },
  { text: "A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?", options: ["5", "3", "4", "2"], answer: "5" },
  { text: "The population of a town increases by 5% annually. If present is 9261, 3 years ago it was:", options: ["8000", "7500", "8500", "9000"], answer: "8000" },
  { text: "Distance between two cities is 300km. A train covers first 100km at 50km/hr and next 200km at 100km/hr. Avg speed:", options: ["75 km/hr", "60 km/hr", "80 km/hr", "70 km/hr"], answer: "75 km/hr" },
  { text: "A sum of money doubles itself in 10 years at CI. In how many years will it be 4 times?", options: ["20", "15", "30", "25"], answer: "20" },
  { text: "Find the remainder when 2^31 is divided by 5.", options: ["3", "1", "2", "4"], answer: "3" },
];

const reasoning_pool = [
  { text: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", options: ["7", "10", "12", "13"], answer: "10" },
  { text: "SCD, TEF, UGH, ____, WKL", options: ["CMN", "UJI", "VIJ", "IJT"], answer: "VIJ" },
  { text: "Which word does NOT belong with the others?", options: ["Leopard", "Cougar", "Tiger", "Elephant"], answer: "Elephant" },
  { text: "If ACNE is coded as 3, 7, 29, 11, then BOIL will be coded as:", options: ["5, 31, 19, 25", "5, 29, 19, 27", "5, 31, 21, 25", "5, 31, 19, 23"], answer: "5, 31, 19, 25" },
  { text: "Statement: Some actors are singers. All singers are dancers. Conclusion: I. Some actors are dancers. II. No singer is an actor.", options: ["Only I follows", "Only II follows", "Both follow", "None follow"], answer: "Only I follows" },
  { text: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: ["His own", "His son's", "His father's", "His nephew's"], answer: "His son's" },
  { text: "If 'A+B' means A is the son of B; 'A-B' means A is the husband of B; 'A*B' means A is the sister of B, then what does 'P*Q-R' mean?", options: ["P is the sister-in-law of R", "P is the sister of R", "P is the daughter of R", "P is the mother of R"], answer: "P is the sister-in-law of R" },
  { text: "Arrange the following in a meaningful sequence: 1. Presentation 2. Recommendation 3. Arrival 4. Discussion 5. Introduction", options: ["3, 5, 1, 4, 2", "5, 3, 4, 1, 2", "3, 5, 4, 2, 1", "5, 3, 1, 2, 4"], answer: "3, 5, 1, 4, 2" },
  { text: "A is 40m South-West of B. C is 40m South-East of B. Then C is in which direction of A?", options: ["East", "West", "North", "South"], answer: "East" },
  { text: "One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. Direction he is facing?", options: ["South", "East", "West", "North"], answer: "South" },
  { text: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: ["1/3", "1/8", "2/8", "1/16"], answer: "1/8" },
  { text: "FAG, GAF, HAI, IAH, ____", options: ["JAK", "HAL", "HAK", "JAI"], answer: "JAK" },
  { text: "Identify the missing number: 4, 7, 12, 19, 28, ?", options: ["39", "30", "36", "49"], answer: "39" },
  { text: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written?", options: ["EOJDJEFM", "EOHDKFJM", "MFEJDJOE", "MFEDJJOE"], answer: "EOJDJEFM" },
  { text: "Find the odd one: 3, 5, 11, 14, 17, 21", options: ["14", "21", "17", "11"], answer: "14" },
  { text: "Paw : Cat :: Hoof : ?", options: ["Horse", "Dog", "Lion", "Lamb"], answer: "Horse" },
  { text: "A person moves 3km North, then 4km East. How far is he from start?", options: ["5km", "7km", "1km", "10km"], answer: "5km" },
  { text: "If South-East becomes North, North-East becomes West and so on. What will West become?", options: ["South-East", "North-East", "North-West", "South-West"], answer: "South-East" },
  { text: "Choose the word which is least like other words in the group:", options: ["Copper", "Zinc", "Brass", "Aluminum"], answer: "Brass" },
  { text: "BCB, DED, FGF, HIH, ___", options: ["JKJ", "HJH", "IJI", "JHJ"], answer: "JKJ" },
  { text: "Find the next number: 1, 2, 6, 24, 120, ?", options: ["720", "600", "240", "144"], answer: "720" },
  { text: "If 'white' is called 'blue', 'blue' is called 'red', 'red' is called 'yellow', what is color of sky?", options: ["Red", "Blue", "Yellow", "White"], answer: "Red" },
  { text: "Rohan is 14th from either end of a row. How many boys in the row?", options: ["27", "28", "29", "26"], answer: "27" },
  { text: "Insert the missing number: 16, 33, 65, 131, 261, ?", options: ["523", "521", "613", "721"], answer: "523" },
  { text: "Find the odd number: 1, 4, 9, 16, 23, 25, 36", options: ["23", "16", "25", "36"], answer: "23" },
  { text: "Statement: All mangoes are golden. No golden is cheap. Conclusion: I. All mangoes are cheap. II. Golden things are limited.", options: ["None follow", "Only I follows", "Only II follows", "Both follow"], answer: "None follow" },
  { text: "Look at series: 36, 34, 30, 28, 24, ... What number should come next?", options: ["22", "20", "26", "23"], answer: "22" },
  { text: "ELFA, GLHA, ILJA, ____, MLNA", options: ["KLLA", "OLPA", "KLMA", "LLMA"], answer: "KLLA" },
  { text: "If 1st Oct is Sunday, then 1st Nov is:", options: ["Wednesday", "Tuesday", "Monday", "Thursday"], answer: "Wednesday" },
  { text: "Which number replaces the question mark? 121, 144, 169, 196, ?", options: ["225", "256", "289", "324"], answer: "225" },
];

const advanced_pool = [
  { text: "X can do a piece of work in 40 days. He works at it for 8 days and then Y finished it in 16 days. How long will X and Y take together?", options: ["13.33 days", "15 days", "20 days", "25 days"], answer: "13.33 days" },
  { text: "A boat goes 12 km/hr in still water. The speed of the stream is 3 km/hr. Find the distance at which it can travel and come back in 8 hours.", options: ["45 km", "50 km", "42 km", "36 km"], answer: "45 km" },
  { text: "If log 27 = 1.431, then log 9 is:", options: ["0.934", "0.945", "0.954", "0.958"], answer: "0.954" },
  { text: "The probability that a non-leap year has 53 Sundays is:", options: ["1/7", "2/7", "5/7", "6/7"], answer: "1/7" },
  { text: "Pipe A can fill a tank in 5 hours, Pipe B in 10 hours and Pipe C in 30 hours. All pipes are opened. In how many hours will the tank be filled?", options: ["3 hours", "4 hours", "5 hours", "6 hours"], answer: "3 hours" },
  { text: "In how many ways can letters of word 'LEADER' be arranged?", options: ["360", "720", "120", "480"], answer: "360" },
  { text: "The difference between SI and CI on Rs. 2500 for 2 years at 4% is:", options: ["Rs. 4", "Rs. 2", "Rs. 8", "Rs. 10"], answer: "Rs. 4" },
  { text: "Two cards are drawn from a pack of 52. Probability that both are aces:", options: ["1/221", "1/13", "1/26", "1/52"], answer: "1/221" },
  { text: "A container contains 40L milk. 4L taken out, replaced by water. Process repeated 2 more times. Final milk amount:", options: ["29.16L", "30L", "28.5L", "27L"], answer: "29.16L" },
  { text: "Find the unit digit in (264)^102 + (264)^103", options: ["0", "4", "6", "8"], answer: "0" },
  { text: "A, B, C start at same time in same direction to run around a circular stadium. A completes in 252s, B in 308s, C in 198s. They meet again at start after:", options: ["46 min 12s", "45 min", "40 min", "48 min"], answer: "46 min 12s" },
  { text: "HCF of two numbers is 11 and LCM is 693. If one is 77, other is:", options: ["99", "101", "88", "121"], answer: "99" },
  { text: "Surface area of sphere is 616 sq cm. Its volume is:", options: ["1437.33 cu cm", "1200 cu cm", "1500 cu cm", "1400 cu cm"], answer: "1437.33 cu cm" },
  { text: "If x + 1/x = 3, then x^2 + 1/x^2 is:", options: ["7", "9", "11", "5"], answer: "7" },
  { text: "The number of ways to pick 3 people from 10 is:", options: ["120", "720", "240", "360"], answer: "120" },
  { text: "A sum at CI amounts to 3 times in 4 years. It will become 9 times in:", options: ["8 years", "12 years", "16 years", "10 years"], answer: "8 years" },
  { text: "Find the angle between min and hour hand at 4:20.", options: ["10 deg", "0 deg", "20 deg", "15 deg"], answer: "10 deg" },
  { text: "If 3 men or 6 women can do a work in 16 days, 12 men and 8 women can do it in:", options: ["3 days", "4 days", "5 days", "2 days"], answer: "3 days" },
  { text: "Area of rhombus with diagonals 16cm and 12cm is:", options: ["96 sq cm", "192 sq cm", "48 sq cm", "100 sq cm"], answer: "96 sq cm" },
  { text: "Probability of getting total 7 in a throw of 2 dice:", options: ["1/6", "1/12", "1/9", "5/36"], answer: "1/6" },
  { text: "Compound interest on Rs. 1000 at 10% for 3 years is:", options: ["Rs. 331", "Rs. 300", "Rs. 310", "Rs. 350"], answer: "Rs. 331" },
  { text: "Simplest form of (1-1/2)(1-1/3)(1-1/4)...(1-1/n) is:", options: ["1/n", "2/n", "(n-1)/n", "1/2n"], answer: "1/n" },
  { text: "A sum of money at CI doubles in 15 years. It will become 8 times in:", options: ["45 years", "30 years", "60 years", "75 years"], answer: "45 years" },
  { text: "Area of largest circle inscribed in square of side 14cm is:", options: ["154 sq cm", "196 sq cm", "44 sq cm", "308 sq cm"], answer: "154 sq cm" },
  { text: "Find the mean of first 10 prime numbers:", options: ["12.9", "12.5", "11.9", "13.5"], answer: "12.9" },
];

const codingQuestions = [
  {
    question_text: "[TCS NQT PREVIOUSLY ASKED] Write a program to find the nth number in the Fibonacci series. Input is a single integer n.",
    section: "coding", difficulty: "medium", is_previous_nqt_question: true,
    code_templates: { python: "def solve(n):\n    # Write code here\n    pass\n\nn = int(input())\nprint(solve(n))", cpp: "#include <iostream>\nusing namespace std;\nint main() { int n; cin >> n; return 0; }", java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}" },
    test_cases: [{ input: "5", expected_output: "5" }, { input: "1", expected_output: "1" }]
  },
  {
    question_text: "[TCS NQT PREVIOUSLY ASKED] Given an array of integers, find the maximum product of any two elements in the array.",
    section: "coding", difficulty: "hard", is_previous_nqt_question: true,
    code_templates: { python: "def max_product(arr):\n    pass\narr = list(map(int, input().split()))\nprint(max_product(arr))", cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() { return 0; }", java: "import java.util.*;\npublic class Main { public static void main(String[] args) {} }" },
    test_cases: [{ input: "1 10 2 6 5 3", expected_output: "60" }, { input: "-10 -3 5 6", expected_output: "30" }]
  },
  {
    question_text: "[TCS NQT PREVIOUSLY ASKED] Write a program to check if a given string is a Palindrome. Ignore case sensitivity.",
    section: "coding", difficulty: "easy", is_previous_nqt_question: true,
    code_templates: { python: "s = input().lower()\nprint('true' if s == s[::-1] else 'false')", cpp: "#include <iostream>\n#include <string>\nusing namespace std;\nint main() { return 0; }", java: "import java.util.*;\npublic class Main { public static void main(String[] args) {} }" },
    test_cases: [{ input: "Radar", expected_output: "true" }, { input: "Hello", expected_output: "false" }]
  },
  {
    question_text: "[TCS NQT PREVIOUSLY ASKED] Find the smallest number in an array without using built-in sort functions.",
    section: "coding", difficulty: "easy", is_previous_nqt_question: true,
    code_templates: { python: "arr = list(map(int, input().split()))\nprint(min(arr))", cpp: "#include <iostream>\nusing namespace std;\nint main() { return 0; }", java: "import java.util.*;\npublic class Main { public static void main(String[] args) {} }" },
    test_cases: [{ input: "4 2 8 1 9", expected_output: "1" }, { input: "10 20 5", expected_output: "5" }]
  },
  {
    question_text: "[TCS NQT PREVIOUSLY ASKED] Write a program to rotate a square matrix by 90 degrees clockwise.",
    section: "coding", difficulty: "hard", is_previous_nqt_question: true,
    code_templates: { python: "n = int(input())\nmat = [list(map(int, input().split())) for _ in range(n)]", cpp: "#include <iostream>\nusing namespace std;\nint main() { return 0; }", java: "import java.util.*;\npublic class Main { public static void main(String[] args) {} }" },
    test_cases: [{ input: "2\n1 2\n3 4", expected_output: "3 1\n4 2" }]
  }
];

const allQuestions = [
  ...verbal_pool.map(q => ({ ...q, question_text: `[TCS NQT PREVIOUSLY ASKED] ${q.text}`, section: 'verbal', difficulty: 'medium', is_previous_nqt_question: true })),
  ...numerical_pool.map(q => ({ ...q, question_text: `[TCS NQT PREVIOUSLY ASKED] ${q.text}`, section: 'numerical', difficulty: 'medium', is_previous_nqt_question: true })),
  ...reasoning_pool.map(q => ({ ...q, question_text: `[TCS NQT PREVIOUSLY ASKED] ${q.text}`, section: 'reasoning', difficulty: 'medium', is_previous_nqt_question: true })),
  ...advanced_pool.map(q => ({ ...q, question_text: `[TCS NQT PREVIOUSLY ASKED] ${q.text}`, section: 'advanced_quant_reasoning', difficulty: 'hard', is_previous_nqt_question: true })),
  ...codingQuestions
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Seeding...");
    await Question.deleteMany({});
    await Question.insertMany(allQuestions);
    console.log(`Successfully seeded ${allQuestions.length} unique questions.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
