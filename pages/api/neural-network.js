// Create a simple model.
const fs = require('fs');
if (language === "Spanish"){
    fs.readFile('Spanish_words_dataset_2000.csv', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
        const rows = data.split('\n'); // Split the file into rows
        const array1 = rows.map(row => row.split(',')[0]); // Split each row into columns
        const array2 = rows.map(row => row.split(',')[1]); // Split each row into columns
    });
}
else {
        fs.readFile('Spanish_words_dataset_2000.csv', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const rows = data.split('\n'); // Split the file into rows
        const array1 = rows.map(row => row.split(',')[0]); // Split each row into columns
        const array2 = rows.map(row => row.split(',')[1]); // Split each row into columns
        });
}    
export const trainModel = async (language) => {
    const inputData = array1
    const outputData = array2
    


    const model = tf.sequential();
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

    // Generate some synthetic data for training. (y = 2x - 1)
    const xs = tf.tensor2d(inputData, [3201, 1]);
    const ys = tf.tensor2d(outputData, [3201, 1]);

    // Train the model using the data.
    await model.fit(xs, ys, {epochs: 250});
    return model
}
export const classifyWord = async (word) => {
    await model.predict(tf.tensor2d([[word]], [1, 1]))

}
export const findSimilarWord = async (word) => {
    // Classify the input word's category
    const category = await classifyWord(word);

    // Split the rows into 2D array (word, category)
    const array = rows.map(row => row.split(','));

    // Filter words that belong to the same category
    const similarWords = array.filter(row => row[1] === category);

    // Extract just the words (first element of each sub-array)
    const wordsOnly = similarWords.map(row => row[0]);

    // Function to get a random word that isn't already in localStorage
    const getRandomUniqueWord = () => {
        let randomWord;
        const storedWords = JSON.parse(localStorage.getItem("storedWords")) || [];

        // Randomly pick a word and check if it's already in localStorage
        do {
            randomWord = wordsOnly[Math.floor(Math.random() * wordsOnly.length)];
        } while (storedWords.includes(randomWord)); // Ensure word is not in localStorage

        // Store the new word in localStorage
        storedWords.push(randomWord);
        localStorage.setItem("storedWords", JSON.stringify(storedWords));

        return randomWord;
    };

    // Get the unique random word and return it
    return getRandomUniqueWord();
}
