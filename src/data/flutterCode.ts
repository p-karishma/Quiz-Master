export interface FlutterFile {
  filename: string;
  category: 'config' | 'models' | 'providers' | 'screens';
  description: string;
  content: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    filename: 'pubspec.yaml',
    category: 'config',
    description: 'Flutter project dependencies (Provider, SharedPreferences, http, google_fonts)',
    content: `name: quizmaster
description: "QuizMaster - Interactive Quiz Application for Android"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.35.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  shared_preferences: ^2.2.3
  http: ^1.2.1
  google_fonts: ^6.2.1
  percent_indicator: ^4.2.3
  confetti: ^0.7.0
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`,
  },
  {
    filename: 'lib/main.dart',
    category: 'config',
    description: 'Application entry point with MultiProvider setup & Material 3 Theme',
    content: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'providers/quiz_provider.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final quizProvider = QuizProvider();
  await quizProvider.initPreferences();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: quizProvider),
      ],
      child: const QuizMasterApp(),
    ),
  );
}

class QuizMasterApp extends StatelessWidget {
  const QuizMasterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuizMaster',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6750A4),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD0BCFF),
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
      ),
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
`,
  },
  {
    filename: 'lib/models/quiz_models.dart',
    category: 'models',
    description: 'Question, Category, QuizResult and Attempt data models with JSON serialization',
    content: `import 'dart:convert';

class QuizCategory {
  final String id;
  final String name;
  final String icon;
  final String description;
  final int colorHex;
  final int? openTdbId;

  const QuizCategory({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
    required this.colorHex,
    this.openTdbId,
  });
}

class QuizQuestion {
  final String id;
  final String categoryId;
  final String categoryName;
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final String? explanation;
  final bool isCustom;

  QuizQuestion({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
    this.explanation,
    this.isCustom = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'categoryId': categoryId,
    'categoryName': categoryName,
    'question': question,
    'options': options,
    'correctAnswerIndex': correctAnswerIndex,
    'explanation': explanation,
    'isCustom': isCustom,
  };

  factory QuizQuestion.fromMap(Map<String, dynamic> map) => QuizQuestion(
    id: map['id'],
    categoryId: map['categoryId'],
    categoryName: map['categoryName'],
    question: map['question'],
    options: List<String>.from(map['options']),
    correctAnswerIndex: map['correctAnswerIndex'],
    explanation: map['explanation'],
    isCustom: map['isCustom'] ?? false,
  );
}

class QuizAttempt {
  final String id;
  final String categoryId;
  final String categoryName;
  final DateTime timestamp;
  final int totalQuestions;
  final int correctAnswers;
  final int score;
  final double percentage;

  QuizAttempt({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.timestamp,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.score,
    required this.percentage,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'categoryId': categoryId,
    'categoryName': categoryName,
    'timestamp': timestamp.toIso8601String(),
    'totalQuestions': totalQuestions,
    'correctAnswers': correctAnswers,
    'score': score,
    'percentage': percentage,
  };

  factory QuizAttempt.fromMap(Map<String, dynamic> map) => QuizAttempt(
    id: map['id'],
    categoryId: map['categoryId'],
    categoryName: map['categoryName'],
    timestamp: DateTime.parse(map['timestamp']),
    totalQuestions: map['totalQuestions'],
    correctAnswers: map['correctAnswers'],
    score: map['score'],
    percentage: (map['percentage'] as num).toDouble(),
  );
}
`,
  },
  {
    filename: 'lib/providers/quiz_provider.dart',
    category: 'providers',
    description: 'ChangeNotifier state management with SharedPreferences & OpenTDB API integration',
    content: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/quiz_models.dart';

class QuizProvider extends ChangeNotifier {
  late SharedPreferences _prefs;
  List<QuizQuestion> _customQuestions = [];
  List<QuizAttempt> _attempts = [];

  // Active quiz session state
  List<QuizQuestion> _currentQuestions = [];
  int _currentQuestionIndex = 0;
  int? _selectedAnswerIndex;
  bool _isAnswerSubmitted = false;
  int _score = 0;
  int _correctCount = 0;

  // Getters
  List<QuizQuestion> get customQuestions => _customQuestions;
  List<QuizAttempt> get attempts => _attempts;
  List<QuizQuestion> get currentQuestions => _currentQuestions;
  int get currentQuestionIndex => _currentQuestionIndex;
  int? get selectedAnswerIndex => _selectedAnswerIndex;
  bool get isAnswerSubmitted => _isAnswerSubmitted;
  int get score => _score;
  int get correctCount => _correctCount;

  int get highestScore {
    if (_attempts.isEmpty) return 0;
    return _attempts.map((a) => a.score).reduce((a, b) => a > b ? a : b);
  }

  Future<void> initPreferences() async {
    _prefs = await SharedPreferences.getInstance();
    _loadCustomQuestions();
    _loadAttempts();
  }

  void _loadCustomQuestions() {
    final raw = _prefs.getString('custom_questions');
    if (raw != null) {
      final list = jsonDecode(raw) as List;
      _customQuestions = list.map((e) => QuizQuestion.fromMap(e)).toList();
      notifyListeners();
    }
  }

  Future<void> addCustomQuestion(QuizQuestion q) async {
    _customQuestions.insert(0, q);
    final jsonList = _customQuestions.map((e) => e.toMap()).toList();
    await _prefs.setString('custom_questions', jsonEncode(jsonList));
    notifyListeners();
  }

  void _loadAttempts() {
    final raw = _prefs.getString('quiz_history');
    if (raw != null) {
      final list = jsonDecode(raw) as List;
      _attempts = list.map((e) => QuizAttempt.fromMap(e)).toList();
      notifyListeners();
    }
  }

  Future<void> recordAttempt(QuizAttempt attempt) async {
    _attempts.insert(0, attempt);
    final jsonList = _attempts.map((e) => e.toMap()).toList();
    await _prefs.setString('quiz_history', jsonEncode(jsonList));
    notifyListeners();
  }

  void startQuiz(List<QuizQuestion> questions) {
    _currentQuestions = questions;
    _currentQuestionIndex = 0;
    _selectedAnswerIndex = null;
    _isAnswerSubmitted = false;
    _score = 0;
    _correctCount = 0;
    notifyListeners();
  }

  void selectAnswer(int index) {
    if (_isAnswerSubmitted) return; // Prevent multiple submissions
    _selectedAnswerIndex = index;
    _isAnswerSubmitted = true;

    final currentQ = _currentQuestions[_currentQuestionIndex];
    if (index == currentQ.correctAnswerIndex) {
      _correctCount++;
      _score += 100;
    }
    notifyListeners();
  }

  bool nextQuestion() {
    if (_currentQuestionIndex < _currentQuestions.length - 1) {
      _currentQuestionIndex++;
      _selectedAnswerIndex = null;
      _isAnswerSubmitted = false;
      notifyListeners();
      return true;
    }
    return false; // Quiz completed
  }
}
`,
  },
  {
    filename: 'lib/screens/home_screen.dart',
    category: 'screens',
    description: 'Screen 1: Home dashboard with categories, stats, start quiz button & nav',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/quiz_provider.dart';
import 'categories_screen.dart';
import 'add_question_screen.dart';
import 'leaderboard_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final quizProvider = context.watch<QuizProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('QuizMaster', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.leaderboard),
            tooltip: 'Leaderboard & History',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaderboardScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Add Question',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddQuestionScreen())),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [theme.colorScheme.primary, theme.colorScheme.tertiary],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Welcome Back, Scholar! 👋', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Test your knowledge across 8 subjects and master your skills.', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: theme.colorScheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.play_arrow),
                    label: const Text('Start Quick Quiz', style: TextStyle(fontWeight: FontWeight.bold)),
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CategoriesScreen())),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // User Highest Score & Stats
            Row(
              children: [
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Highest Score', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('\${quizProvider.highestScore} pts', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Quizzes Completed', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 4),
                          Text('\${quizProvider.attempts.length}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    filename: 'lib/screens/quiz_screen.dart',
    category: 'screens',
    description: 'Screen 3: Quiz questions screen with countdown timer, MCQ option locking & exit dialog',
    content: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/quiz_provider.dart';
import 'result_screen.dart';

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  Timer? _timer;
  int _secondsRemaining = 30;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _secondsRemaining = 30;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        _timer?.cancel();
        // Auto submit timeout
        context.read<QuizProvider>().selectAnswer(-1);
      }
    });
  }

  Future<bool> _onWillPop() async {
    final shouldExit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Exit Quiz?'),
        content: const Text('Are you sure you want to quit? Your current quiz progress will be lost.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Continue Quiz')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Exit')),
        ],
      ),
    );
    return shouldExit ?? false;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final quiz = context.watch<QuizProvider>();
    final currentQ = quiz.currentQuestions[quiz.currentQuestionIndex];
    final progress = (quiz.currentQuestionIndex + 1) / quiz.currentQuestions.length;

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Question \${quiz.currentQuestionIndex + 1} of \${quiz.currentQuestions.length}'),
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _secondsRemaining < 5 ? Colors.red.shade100 : Colors.blue.shade50,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Icon(Icons.timer, size: 16, color: _secondsRemaining < 5 ? Colors.red : Colors.blue),
                  const SizedBox(width: 4),
                  Text('\${_secondsRemaining}s', style: TextStyle(fontWeight: FontWeight.bold, color: _secondsRemaining < 5 ? Colors.red : Colors.blue)),
                ],
              ),
            ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(4),
            child: LinearProgressIndicator(value: progress),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(currentQ.question, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              ...List.generate(4, (index) {
                final isSelected = quiz.selectedAnswerIndex == index;
                final isCorrect = index == currentQ.correctAnswerIndex;
                Color? btnColor;
                if (quiz.isAnswerSubmitted) {
                  if (isCorrect) btnColor = Colors.green.shade100;
                  else if (isSelected) btnColor = Colors.red.shade100;
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: btnColor,
                      padding: const EdgeInsets.all(16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: quiz.isAnswerSubmitted ? null : () => quiz.selectAnswer(index),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(currentQ.options[index], style: const TextStyle(fontSize: 16)),
                    ),
                  ),
                );
              }),
              const Spacer(),
              if (quiz.isAnswerSubmitted)
                FilledButton(
                  onPressed: () {
                    final hasNext = quiz.nextQuestion();
                    if (hasNext) {
                      _startTimer();
                    } else {
                      _timer?.cancel();
                      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ResultScreen()));
                    }
                  },
                  child: Text(quiz.currentQuestionIndex == quiz.currentQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
];
