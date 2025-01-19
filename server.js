const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3300;
const host = '0.0.0.0';
const dataFile = 'musicnotes.json';

app.use(express.json());
app.use(express.static('public'));

// Route to send all data
app.get('/data', async (req, res) => {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error reading data' });
    }
});

// Route to add a new entry
app.post('/newentry', async (req, res) => {
    const { title, pdfPath, page } = req.body; // Get data from request body
    const newEntry = {
        title: title,
        pdfPath: decodeURIComponent(pdfPath), // Decode the escaped path
        page: parseInt(page, 10)
    };

    try {
        const data = await fs.readFile(dataFile, 'utf8');
        const jsonData = JSON.parse(data);
        jsonData.pieces.push(newEntry); // Add new entry to pieces
        await fs.writeFile(dataFile, JSON.stringify(jsonData, null, 2)); // Save updated data
        res.json({ message: 'Entry added successfully', entry: newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating data' });
    }
});


// Route to open PDF with Okular
app.get('/open-pdf/:file/:page', (req, res) => {
    const { file, page } = req.params;
    const command = `okular --unique -p ${page} "${file}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Okular: ${error}`);
            return res.status(500).send('Error opening PDF');
        }
        res.send('PDF opened successfully');
    });
});

app.delete('/delete/:index', async (req, res) => {
    const index = parseInt(req.params.index);
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        const jsonData = JSON.parse(data);
        if (index >= 0 && index < jsonData.pieces.length) {
            jsonData.pieces.splice(index, 1);
            await fs.writeFile(dataFile, JSON.stringify(jsonData, null, 2));
            res.json({ message: 'Entry deleted successfully' });
        } else {
            res.status(400).json({ error: 'Invalid index' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting entry' });
    }
});

app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});
