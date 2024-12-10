import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from 'framer-motion'
import { getQuestions } from './api/translator'
type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}
const cards = JSON.stringify(localStorage.getItem('flashcards'))
const lang = JSON.stringify(localStorage.getItem('learningLanguage'))
const [quizQuestions, setQuizQuestions] = useState<Question[]>([])

useEffect(() => {
  const fetchQuestions = async () => {
    const questions = await getQuestions(cards, lang)
    setQuizQuestions(questions)
  }
  fetchQuestions()
}, [])

type QuizPageProps = {
  onClose: () => void;
  isTimed?: boolean;
}

export function QuizPage({ onClose, isTimed = false }: QuizPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(isTimed ? 30 : 0)
  const [quizStarted, setQuizStarted] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]

  useEffect(() => {
    if (isTimed && quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isTimed, quizStarted, timeLeft])

  useEffect(() => {
    if (isTimed && timeLeft === 0 && quizStarted) {
      setQuizCompleted(true)
    }
  }, [isTimed, timeLeft, quizStarted])

  const handleAnswerSubmit = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
      setShowCorrectAnimation(true)
      setTimeout(() => setShowCorrectAnimation(false), 1000)
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      setQuizCompleted(true)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    if (isTimed) {
      setTimeLeft(30)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isTimed ? "Timed Quiz" : "Practice Quiz"}</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!quizStarted ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button onClick={startQuiz} className="w-full">
                Begin {isTimed ? "Timed " : "Practice "}Quiz
              </Button>
            </motion.div>
          ) : !quizCompleted ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {isTimed && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">Time Left: {timeLeft}s</div>
                  <Progress value={(timeLeft / 30) * 100} className="h-2" />
                </div>
              )}
              <div className="text-lg font-medium">{currentQuestion.text}</div>
              <RadioGroup value={selectedAnswer || ''} onValueChange={setSelectedAnswer}>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Button 
                onClick={handleAnswerSubmit} 
                disabled={!selectedAnswer}
                className="w-full"
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
              <AnimatePresence>
                {showCorrectAnimation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white p-4 rounded-full"
                  >
                    Correct!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-center"
            >
              <div className="text-2xl font-bold">Quiz Completed!</div>
              <div className="text-lg">Your score: {score} / {quizQuestions.length}</div>
              <Button onClick={onClose} className="w-full">Close Quiz</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}


