require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  {
    question_text: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    correct_answer: "Rs. 698",
    section: "numerical",
    difficulty: "medium",
    explanation: "Interest for 1 year = 854 - 815 = 39. Interest for 3 years = 39 * 3 = 117. Sum = 815 - 117 = 698."
  },
  {
    question_text: "Find the odd one out: 3, 5, 11, 14, 17, 21",
    options: ["14", "21", "11", "17"],
    correct_answer: "14",
    section: "reasoning",
    difficulty: "easy",
    explanation: "All are odd numbers except 14."
  },
  {
    question_text: "Choose the correct synonym for 'Diligent'",
    options: ["Lazy", "Hardworking", "Careless", "Slow"],
    correct_answer: "Hardworking",
    section: "verbal",
    difficulty: "easy"
  },
  {
    question_text: "What is the output of the following pseudocode? \n n = 5 \n fact = 1 \n for i from 1 to n: \n   fact = fact * i \n print fact",
    options: ["100", "120", "24", "720"],
    correct_answer: "120",
    section: "programming_logic",
    difficulty: "medium",
    explanation: "It calculates 5! = 120."
  },
  {
    question_text: "Write a program to check if a number is prime.",
    section: "coding",
    difficulty: "medium",
    code_templates: {
      python: "def is_prime(n):\n    # Write your code here\n    pass\n\nimport sys\nline = sys.stdin.readline()\nif line:\n    print(is_prime(int(line)))",
      cpp: "#include <iostream>\nusing namespace std;\n\nbool is_prime(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << (is_prime(n) ? \"True\" : \"False\") << endl;\n    return 0;\n}",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isPrime(int n) {\n        // Write your code here\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isPrime(n));\n        }\n    }\n}"
    },
    test_cases: [
      { input: "7", expected_output: "True", is_hidden: false },
      { input: "10", expected_output: "False", is_hidden: false }
    ]
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding...');
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log('Database Seeded!');
    process.exit();
  })
  .catch(err => console.log(err));
