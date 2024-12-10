import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Languages } from 'lucide-react'
import { trainModel } from './api/neural-network'
type InitialLanguageSelectProps = {
  onLanguageSelect: (language: string) => void;
}

export function InitialLanguageSelect({ onLanguageSelect }: InitialLanguageSelectProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')

  const handleContinue = () => {
    if (selectedLanguage) {
      onLanguageSelect(selectedLanguage)
      localStorage.setItem('learningLanguage', selectedLanguage)
      localStorage.setItem('hasSelectedInitialLanguage', 'true')
      trainModel(selectedLanguage)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-[350px] shadow-none border-0 bg-stone-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-stone-800">Welcome to LingoFlow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-stone-600">
            Select the language you'd like to learn:
          </div>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedLanguage}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Languages className="mr-2 h-4 w-4" />
            Start Learning
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

