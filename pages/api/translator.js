import { json } from "stream/consumers";

export const translate = async (sourceText, targetLanguage) => {
  // Define the language pair with English as the source language and the passed target language.
  const languagePair = {
    sourceLanguage: 'en',  // Source language is always English
    targetLanguage: targetLanguage,  // Target language passed as a parameter
  };

  // Check if translation is available for the given language pair.
  const canTranslate = await translation.canTranslate(languagePair);
  
  let translator;

  if (canTranslate !== 'no') {
    if (canTranslate === 'readily') {
      // The translator can immediately be used.
      translator = await translation.createTranslator(languagePair);
    } else {
      // If the model is not ready, handle download and progress.
      translator = await translation.createTranslator(languagePair);
      translator.addEventListener('downloadprogress', (e) => {
        console.log(e.loaded, e.total); // Optionally log download progress
      });
      await translator.ready;  // Wait until the translator is ready to use
    }

    // Perform the translation and return the result.
    const translatedText = await translator.translate(sourceText);
    return translatedText;
  } else {
    throw new Error('Translation is not available for the given language pair.');
  }
}
export const makeSentence = async (word, targetLanguage) => {
  const session = await ai.languageModel.create({
    systemPrompt: 'You are a specialized AI that can take a in ${targetLanguage} word and put it into a sentence that could help even a first grader further their understanding'
  });
  const result = await session.prompt(word);
  return result.response.text;
}
export const getQuestions = async (data, targetLanguage) => {
  const prompt = `Create a list of 10 language learning multiple choice questions about using this data: ${data},
  if there is not enough of data use your own knowledge to make up your own questions in the language ${targetLanguage},
  the output should only be in the following format: [
    {
      id: 1,
      text: "What is 'Hello' in Spanish?",
      options: ["Hola", "Bonjour", "Ciao", "Hallo"],
      correctAnswer: "Hola"
    },
    {
      id: 2,
      text: "What is 'Goodbye' in Japanese?",
      options: ["Sayonara", "Arigato", "Konnichiwa", "Ohayo"],
      correctAnswer: "Sayonara"
    },
    // Add more questions as needed
  ] `;
  const session = await ai.languageModel.create({
    systemPrompt: 'You are a specialized AI that can take data related to language and create a list of questions about it, in the event there is not enough data use some of your own knowledge to create the extra questions'
  });
  const result = await session.prompt(prompt);
  const questions = json.parse(result.response.text);
  return questions;
}