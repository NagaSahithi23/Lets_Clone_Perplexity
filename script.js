document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea');
    const searchBox = document.querySelector('.search-box');
    const modelBtn = document.getElementById('modelBtn');
    const modelMenu = document.getElementById('modelMenu');
    const responseContainer = document.getElementById('responseContainer');
    const responseQuery = document.getElementById('responseQuery');
    const responseText = document.getElementById('responseText');
    const typingIndicator = document.getElementById('typingIndicator');
    const heroSection = document.querySelector('.hero-section');
    const suggestionsSection = document.querySelector('.suggestions-section');
    const newThreadBtn = document.getElementById('newThreadBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // PDF related elements
    const attachBtn = document.getElementById('attachBtn');
    const pdfInput = document.getElementById('pdfInput');
    const pdfBadge = document.getElementById('pdfBadge');
    const pdfFilename = document.getElementById('pdfFilename');
    const removePdfBtn = document.getElementById('removePdfBtn');

    let currentModel = "gemini-2.5-flash"; // Default model

    // Focus on load
    textarea.focus();

    // Auto-resize textarea
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        if (this.value.trim().length > 0) {
            submitBtn.classList.add('active');
        } else {
            submitBtn.classList.remove('active');
        }
    });

    // New Thread logic
    newThreadBtn.addEventListener('click', () => {
        heroSection.style.display = 'block';
        suggestionsSection.style.display = 'block';
        responseContainer.style.display = 'none';
        textarea.value = "";
        textarea.style.height = 'auto';
        textarea.focus();
        submitBtn.classList.remove('active');
        
        // Reset PDF context on New Thread
        resetPdf();
    });

    // PDF Attach Logic
    attachBtn.addEventListener('click', () => {
        pdfInput.click();
    });

    pdfInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.pdf')) {
            alert('Only PDF files are supported.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            pdfFilename.innerText = "Uploading...";
            pdfBadge.style.display = 'flex';

            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                pdfFilename.innerText = file.name;
                pdfBadge.classList.add('ready');
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Failed to upload PDF: ' + error.message);
            resetPdf();
        }
    });

    removePdfBtn.addEventListener('click', () => {
        resetPdf();
    });

    function resetPdf() {
        pdfInput.value = "";
        pdfBadge.style.display = 'none';
        pdfFilename.innerText = "No file attached";
        // Optionally notify backend to clear current_pdf_context
    }

    // Model Selection logic
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const label = item.querySelector('.menu-label').innerText;
            modelBtn.querySelector('span').innerText = label;
            
            if (label.includes('Claude')) currentModel = 'claude-3-5-sonnet';
            else if (label.includes('GPT')) currentModel = 'gpt-4o';
            else if (label.includes('Sonar')) currentModel = 'gemini-2.5-flash';
            
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            modelMenu.classList.remove('show');
        });
    });

    // API Response function
    async function generateResponse(query) {
        if (!query) return;

        heroSection.style.display = 'none';
        suggestionsSection.style.display = 'none';
        responseContainer.style.display = 'block';
        responseQuery.innerText = query;
        responseText.innerText = "...";
        typingIndicator.style.display = 'inline-block';

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: query,
                    model: currentModel
                })
            });

            if (!response.ok) {
                throw new Error('Backend failed to respond');
            }

            const data = await response.json();
            const rawResponse = data.response || "No response received.";
            
            responseText.innerText = "";
            let index = 0;

            function type() {
                if (index < rawResponse.length) {
                    responseText.innerText += rawResponse.charAt(index);
                    index++;
                    setTimeout(type, 10);
                } else {
                    typingIndicator.style.display = 'none';
                }
            }
            type();

        } catch (error) {
            console.error('Error:', error);
            responseText.innerText = "Error: Could not connect to the backend/API. Please check your credentials.";
            typingIndicator.style.display = 'none';
        }
    }

    // Submit Logic
    const handleSubmit = () => {
        const query = textarea.value.trim();
        if (query) {
            generateResponse(query);
            textarea.value = "";
            textarea.style.height = 'auto';
            submitBtn.classList.remove('active');
        }
    };

    submitBtn.addEventListener('click', handleSubmit);

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });

    textarea.addEventListener('focus', () => searchBox.classList.add('focused'));
    textarea.addEventListener('blur', () => searchBox.classList.remove('focused'));

    modelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modelMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        modelMenu.classList.remove('show');
    });

    const queryItems = document.querySelectorAll('.query-list li, .pill-btn');
    queryItems.forEach(item => {
        item.addEventListener('click', () => {
            const query = item.innerText.trim();
            generateResponse(query);
        });
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    lucide.createIcons();
});
