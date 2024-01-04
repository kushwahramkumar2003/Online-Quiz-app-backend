const Quiz = require("../models/Quiz.model.js");
const Question = require("../models/Question.model.js");
const UserQuiz = require("../models/UserQuiz.js");
const QuizResult = require("../models/Result.model.js");
const asyncHandler = require("../services/asyncHandler.js");

// Inside your quiz controller or a dedicated timer service
const quizTimers = {}; // Keep track of timers for multiple quizzes

exports.getQuizByIdForUser = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  console.log("Backend Quiz id:", req.params.quizId);
  const quizData = await Quiz.findById(req.params.quizId)
    .populate("questions", "text options")
    .exec();

  if (quizData) {
    await this.startQuiz(req, res, quizData);
  } else {
    res.status(404);
    throw new Error("Quiz not found");
  }
});

exports.startQuiz = async (req, res, quizData) => {
  const { quizId } = req.params;
  console.log("Quiz id:", quizId);

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if the user has already started the quiz
    const userQuizAlreadyStarted = await UserQuiz.findOne({
      userId: req.user._id,
      quizId,
    });

    if (userQuizAlreadyStarted) {
      return res.status(201).json({
        message: "User has already started the quiz",
        userQuizAlreadyStarted,
        quizData,
      });
    }

    // Set the quiz duration in seconds (adjust as needed)
    const quizDuration = quiz.duration * 60;

    // Start the quiz timer
    this.startQuizTimer(quizId, req.user._id, quizDuration);

    // Store user-specific quiz details in the database
    const userQuiz = new UserQuiz({
      userId: req.user._id,
      quizId,
      startTime: new Date(),
    });

    await userQuiz.save();

    // Other logic to start the quiz
    return res.json(quizData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error });
  }
};

exports.submitAnswer = asyncHandler(async (req, res) => {
  const { quizId, questionId, answer } = req.body;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const userQuiz = await UserQuiz.findOne({
    userId: req.user._id,
    quizId,
  });

  if (!userQuiz) {
    return res.status(400).json({ message: "User has not started the quiz" });
  }

  userQuiz.answers.set(questionId, answer);
  await userQuiz.save();

  res.status(200).json({ message: "Answer submitted successfully" });
});

exports.startQuizTimer = (quizId, userId, duration) => {
  console.log("StartQuizTimer called for quiz: ", quizId);

  quizTimers[quizId] = setTimeout(async () => {
    const userQuiz = await UserQuiz.findOne({
      userId,
      quizId,
    });

    console.log(`Automatic submission for quiz ${quizId}`);

    if (userQuiz) {
      // Check if the quiz is already submitted by the user
      if (!userQuiz.endTime) {
        // If not, submit the quiz
        submitQuizAfterTimeOver(quizId, userId);
      }
    }
  }, duration * 1000); // Convert seconds to milliseconds
};

exports.stopQuizTimer = (quizId) => {
  clearTimeout(quizTimers[quizId]);
  delete quizTimers[quizId];
};

exports.finishQuiz = asyncHandler(async (req, res, quizid) => {
  const { quizId } = req.params || quizid;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const userQuiz = await UserQuiz.findOne({
    userId: req.user._id,
    quizId,
  });

  if (!userQuiz) {
    return res.status(400).json({ message: "User has not started the quiz" });
  }

  const answeredQuestionIds = Array.from(userQuiz.answers.keys());
  const allQuestionIds = quiz.questions.map((q) => q.toString());

  const unansweredQuestionIds = allQuestionIds.filter(
    (questionId) => !answeredQuestionIds.includes(questionId)
  );

  console.log("Unanswered questions:", unansweredQuestionIds.length);

  // Calculate the result
  let score = 0;

  const userAnswersMap = new Map();

  for (const [questionId, userAnswer] of userQuiz.answers.entries()) {
    userAnswersMap.set(questionId, userAnswer);

    const question = await Question.findById(questionId);

    if (question && question.answer === userAnswer) {
      score++;
    }
  }

  console.log("All question ids:", allQuestionIds.length);

  const totalQuestions = allQuestionIds.length;
  const percentageScore = (score / totalQuestions) * 100;

  const enm = ["Poor", "Average", "Good", "Excellent"];

  const performance =
    percentageScore >= 75
      ? enm[3]
      : percentageScore >= 50
      ? enm[2]
      : percentageScore >= 25
      ? enm[1]
      : enm[0];

  const quizResult = new QuizResult({
    quiz: quizId,
    user: req.user._id,
    score,
    totalQuestions,
    percentage: percentageScore,
    answers: userAnswersMap,
    performance,
  });

  await quizResult.save();
  console.log("Score:", score);

  this.stopQuizTimer(quizId);

  await UserQuiz.deleteOne({ _id: userQuiz._id });

  res.status(200).json({
    message: "Quiz finished and result calculated successfully",
    result: quizResult,
  });
});

exports.getResultByQuizIdAndResultIdAndUserId = asyncHandler(
  async (req, res) => {
    const { quizId, resultId } = req.params;
    const userId = req.user._id;

    console.log("Quiz id:", quizId);
    console.log("Result id:", resultId);
    console.log("User id:", userId);

    const quizResult = await QuizResult.findOne({
      _id: resultId,
      quiz: quizId,
      user: userId,
    });

    if (!quizResult) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    res.json(quizResult);
  }
);

const submitQuizAfterTimeOver = asyncHandler(async (quizId, userId) => {
  console.log("SubmitQuizAfterTimeOver called for quiz: ", quizId);

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    console.log("Quiz not found!!");
    return;
  }

  const userQuiz = await UserQuiz.findOne({
    userId,
    quizId,
  });

  if (!userQuiz) {
    console.log("User has not started the quiz");
  }

  const answeredQuestionIds = Array.from(userQuiz.answers.keys());
  const allQuestionIds = quiz.questions.map((q) => q.toString());

  const unansweredQuestionIds = allQuestionIds.filter(
    (questionId) => !answeredQuestionIds.includes(questionId)
  );

  console.log("Unanswered questions:", unansweredQuestionIds.length);

  // Calculate the result
  let score = 0;

  const userAnswersMap = new Map();

  for (const [questionId, userAnswer] of userQuiz.answers.entries()) {
    userAnswersMap.set(questionId, userAnswer);

    const question = await Question.findById(questionId);

    if (question && question.answer === userAnswer) {
      score++;
    }
  }

  console.log("All question ids:", allQuestionIds.length);

  const totalQuestions = allQuestionIds.length;
  const percentageScore = (score / totalQuestions) * 100;

  const enm = ["Poor", "Average", "Good", "Excellent"];

  const performance =
    percentageScore >= 75
      ? enm[3]
      : percentageScore >= 50
      ? enm[2]
      : percentageScore >= 25
      ? enm[1]
      : enm[0];

  const quizResult = new QuizResult({
    quiz: quizId,
    user: userId,
    score,
    totalQuestions,
    percentage: percentageScore,
    answers: userAnswersMap,
    performance,
  });

  await quizResult.save();
  console.log("Score:", score);

  this.stopQuizTimer(quizId);

  await UserQuiz.deleteOne({ _id: quizId });

  console.log("Quiz finished and result calculated successfully");
});
