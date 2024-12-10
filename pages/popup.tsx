import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BookOpen, MessageCircle, Languages, Settings2, ArrowRightLeft, Clock, ThumbsUp, ThumbsDown, Plus, Flame, ArrowLeft } from 'lucide-react'
import { cn } from "@/lib/utils"
import { QuizPage } from './quiz-page'
import { motion, AnimatePresence } from 'framer-motion'
import { translate, makeSentence } from './api/translator'
import { InitialLanguageSelect } from './initial-page'
import { classifyWord, findSimilarWord } from './api/neural-network'
type Flashcard = {
  word: string;
  translation: string;
  language: string;
}

export default function Popup() {
  const [showInitialLanguageSelect, setShowInitialLanguageSelect] = useState(true)
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [showQuiz, setShowQuiz] = useState(false)
  const [isTimedQuiz, setIsTimedQuiz] = useState(false)
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learningLanguage, setLearningLanguage] = useState('Spanish')
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [streak, setStreak] = useState(0)
  const [exampleSentence, setExampleSentence] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  if(learningLanguage === 'Spanish'){
    const [flashcards, setFlashcards] = useState<Flashcard[]>([
      { word: "Hola", translation: "Hello", language: "French" },
      { word: "Gracias", translation: "Thank you", language: "Spanish" },
      { word: "Konnichiwa", translation: "Hello", language: "Japanese" },
      { word: "Adios", translation: "Goodbye", language: "Spanish" },
      { word: "Buenos días", translation: "Good morning", language: "Spanish" },
      { word: "Buenos tardes", translation: "Good afternoon", language: "Spanish" },
      { word: "Buenos noches", translation: "Good evening", language: "Spanish" },
      { word: "¿Cómo estás?", translation: "How are you?", language: "Spanish" },
      { word: "¿Cuál es tu nombre?", translation: "What's your name?", language: "Spanish" },
      { word: "¿Dónde vives?", translation: "Where do you live?", language: "Spanish" },
    ])
  }
  else {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([
      { word: "こんにちは", translation: "Hello", language: "Japanese" },
      { word: "ありがとう", translation: "Thank you", language: "Japanese" },
      { word: "さようなら", translation: "Goodbye", language: "Japanese" },
      { word: "はい", translation: "Yes", language: "Japanese" },
      { word: "いいえ", translation: "No", language: "Japanese" },
      { word: "おはようございます", translation: "Good morning", language: "Japanese" },
      { word: "こんばんは", translation: "Good evening", language: "Japanese" },
    ])
  }
  useEffect(() => {
    const hasSelectedInitialLanguage = localStorage.getItem('hasSelectedInitialLanguage')
    if (hasSelectedInitialLanguage === 'true') {
      setShowInitialLanguageSelect(false)
      const savedLearningLanguage = localStorage.getItem('learningLanguage')
      if (savedLearningLanguage) {
        setLearningLanguage(savedLearningLanguage)
      }
    }

    const savedFlashcards = localStorage.getItem('flashcards')
    if (savedFlashcards) {
      setFlashcards(JSON.parse(savedFlashcards))
    }

    const lastUsedDate = localStorage.getItem('lastUsedDate')
    const currentDate = new Date().toDateString()
    
    if (lastUsedDate !== currentDate) {
      // It's a new day, increase the streak
      const newStreak = (lastUsedDate === new Date(Date.now() - 86400000).toDateString())
        ? streak + 1  // Yesterday's date, continue the streak
        : 1           // Not yesterday, reset to 1
      setStreak(newStreak)
      localStorage.setItem('streak', newStreak.toString())
      localStorage.setItem('lastUsedDate', currentDate)
    } else {
      // Same day, load the existing streak
      const savedStreak = localStorage.getItem('streak')
      if (savedStreak) {
        setStreak(parseInt(savedStreak))
      }
    }
  }, [])
  const handleInitialLanguageSelect = (language: string) => {
    setLearningLanguage(language)
    setShowInitialLanguageSelect(false)
  }
  const handleTranslate = () => {
    // Simulating translation (replace with actual API call in production)
    const translatedText = translate(inputText, selectedLanguage)
    return translatedText
  }
  const createSentance = (text: string) => {
    const exampleSentence = makeSentence(text, learningLanguage);
    return exampleSentence
  }
  const handleFlashcardResponse = (needsPractice: boolean) => {
    if (needsPractice) {
      duplicateCurrentFlashcard();
    }
    setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setIsFlipped(false);
  }
  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }
  const saveTranslation = () => {
    const newFlashcard: Flashcard = {
      word: inputText,
      translation: outputText.replace('Translated: ', ''),
      language: learningLanguage
    }
    const updatedFlashcards = [...flashcards, newFlashcard]
    setFlashcards(updatedFlashcards)
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards))
  }
  const duplicateCurrentFlashcard = () => {
    const currentCard = flashcards[currentFlashcardIndex];
    const updatedFlashcards = [...flashcards, { ...currentCard }];
    setFlashcards(updatedFlashcards);
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
  };

  if (showInitialLanguageSelect) {
    return <InitialLanguageSelect onLanguageSelect={handleInitialLanguageSelect} />
  }
  return (
    <Card className="w-[350px] shadow-none border-0 bg-stone-100">
      <CardContent className="p-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between border-b border-stone-200 p-4 bg-white"
        >
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg text-stone-800">LingoFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
              <Flame className="w-4 h-4" />
              <span>{streak}</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-stone-600 hover:text-stone-800 hover:bg-stone-100">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="learningLanguage">Learning Language</Label>
                    <Select 
                      value={learningLanguage} 
                      onValueChange={setLearningLanguage}
                    >
                      <SelectTrigger id="learningLanguage">
                        <SelectValue placeholder="Select language to learn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 border-b border-stone-200 bg-stone-50"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-stone-700">Daily Progress</span>
            <span className="text-sm text-stone-600">12/20 words</span>
          </div>
          <Progress value={60} className="h-2 bg-stone-200 [&::-webkit-progress-value]:bg-amber-600 [&::-moz-progress-bar]:bg-amber-600" />
        </motion.div>

        <Tabs defaultValue="flashcards" className="w-full">
          <TabsList className="w-full justify-start p-0 h-12 rounded-none border-b border-stone-200 bg-stone-50">
            <TabsTrigger 
              value="flashcards" 
              className={cn(
                "flex-1 h-12 rounded-none data-[state=active]:bg-amber-700 data-[state=active]:text-white",
                "text-stone-600 hover:bg-amber-100 hover:text-amber-700"
              )}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger 
              value="practice" 
              className={cn(
                "flex-1 h-12 rounded-none data-[state=active]:bg-amber-700 data-[state=active]:text-white",
                "text-stone-600 hover:bg-amber-100 hover:text-amber-700"
              )}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
            <TabsTrigger 
              value="translate" 
              className={cn(
                "flex-1 h-12 rounded-none data-[state=active]:bg-amber-700 data-[state=active]:text-white",
                "text-stone-600 hover:bg-amber-100 hover:text-amber-700"
              )}
            >
              <Languages className="h-4 w-4 mr-2" />
              Translate
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <TabsContent value="flashcards" className="p-4 bg-white">
              <motion.div
                key={currentFlashcardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <motion.div 
                  className="bg-amber-50 rounded-lg border border-amber-100 cursor-pointer mb-4 overflow-hidden"
                  onClick={flipCard}
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '200px',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 p-6 flex flex-col justify-between"
                      >
                        <div className="text-left">
                          <div className="font-medium mb-1 text-amber-800 text-lg">
                            {flashcards[currentFlashcardIndex].language}
                          </div>
                          <div className="text-3xl font-bold mb-1 text-amber-900">
                            {flashcards[currentFlashcardIndex].word}
                          </div>
                        </div>
                        <div className="text-amber-700 mt-4 text-lg text-left">
                          Click to see translation
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 p-6 flex flex-col justify-between"
                        style={{ transform: 'rotateY(180deg)' }}
                      >
                        <div className="text-left">
                          <div className="font-medium mb-1 text-amber-800 text-lg">
                            English
                          </div>
                          <div className="text-3xl font-bold mb-1 text-amber-900">
                            {flashcards[currentFlashcardIndex].translation}
                          </div>
                        </div>
                        <div className="text-amber-700 mt-4 text-lg text-left">
                          Click to see original
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleFlashcardResponse(false)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Confident
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
                    onClick={() => handleFlashcardResponse(true)}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Need Practice
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="practice" className="p-4 bg-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {!showQuiz ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="w-full" onClick={() => { setShowQuiz(true); setIsTimedQuiz(false); }}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Practice Quiz
                      </Button>
                      <Button className="w-full" onClick={() => { setShowQuiz(true); setIsTimedQuiz(true); }}>
                        <Clock className="h-4 w-4 mr-2" />
                        Timed Quiz
                      </Button>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                      <h3 className="font-semibold text-lg mb-2 text-stone-800">Your Progress</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-stone-600">Words Learned</span>
                          <span className="font-medium text-stone-800">150</span>
                        </div>
                        <Progress value={75} className="h-2 bg-stone-200 [&::-webkit-progress-value]:bg-amber-600 [&::-moz-progress-bar]:bg-amber-600" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-stone-600">Accuracy</span>
                          <span className="font-medium text-stone-800">85%</span>
                        </div>
                        <Progress value={85} className="h-2 bg-stone-200 [&::-webkit-progress-value]:bg-amber-600 [&::-moz-progress-bar]:bg-amber-600" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-stone-600">Daily Quiz Streak</span>
                          <span className="font-medium text-stone-800">7 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuiz(false)}
                      className="mb-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <QuizPage onClose={() => setShowQuiz(false)} isTimed={isTimedQuiz} />
                  </div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="translate" className="p-4 bg-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <Textarea 
                  placeholder="Enter text to translate..." 
                  className="w-full resize-none"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleTranslate} className="flex-1">
                    <ArrowRightLeft className="w-4 w-4 mr-2" />
                    Translate
                  </Button>
                </div>
                <AnimatePresence>
                  {outputText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-amber-50 p-3 rounded-lg border border-amber-100"
                    >
                      <div className="font-medium mb-1 text-amber-800">Result</div>
                      <div className="text-amber-700 whitespace-pre-wrap">{outputText}</div>
                      {exampleSentence && (
                        <div className="mt-2 text-amber-600 italic">{exampleSentence}</div>
                      )}
                      <Button onClick={saveTranslation} className="mt-2 w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Flashcards
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  )
}
