document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const resultsList = document.getElementById('results');
    let allData = [];
    
    fetch('/data')
    .then(response => response.json())
    .then(data => {
        allData = data.pieces;
        displayResults(allData);
    })
    .catch(error => console.error('Error loading data:', error));
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = allData.filter(item => 
        item.title.toLowerCase().includes(searchTerm)
        );
        displayResults(filteredData);
    });
    
    function displayResults(data) {
        resultsList.innerHTML = '';
        data.forEach((item, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            const itemPath = item.pdfPath.replace(/^.*\//, '');
            a.href = '#';
            a.textContent = `${item.title} (${itemPath})`;
            a.onclick = (e) => {
                e.preventDefault();
                openPDF(item.pdfPath, item.page);
            };
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.onclick = () => {
                if (confirm("Delete this entry?")) {
                    deleteEntry(index);
                }
            };
            
            
            li.appendChild(a);
            li.appendChild(deleteButton);
            resultsList.appendChild(li);
        });
    }
    
    function openPDF(pdfPath, page) {
        fetch(`/open-pdf/${encodeURIComponent(pdfPath)}/${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error opening PDF');
            }
            console.log('PDF opened successfully');
        })
        .catch(error => console.error('Error:', error));
    }
    
    function deleteEntry(index) {
        fetch(`/delete/${index}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('Entry deleted:', data);
            // Refresh the list
            fetch('/data')
            .then(response => response.json())
            .then(data => {
                allData = data.pieces;
                displayResults(allData);
            });
        })
        .catch(error => console.error('Error deleting entry:', error));
    }
    
    document.getElementById('addMusicForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const pdfPath = encodeURIComponent(document.getElementById('pdfPath').value); // Escape PDF path
        const page = document.getElementById('page').value;
        
        fetch('/newentry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                pdfPath: pdfPath,
                page: page
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            fetch('/data')
            .then(response => response.json())
            .then(data => {
                allData = data.pieces;
                displayResults(allData);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
