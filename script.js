// Copy the contents of app/static/js/script.js here
// ...existing JavaScript code...

// No changes needed to the script.js file for GitHub Pages
document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('numberInput');
    const clearBtn = document.getElementById('clearBtn');
    const results = document.getElementById('results');
    const charCounter = document.getElementById('charCounter');
    const algorithmSelector = document.getElementById('algorithmSelector');
    
    // Add history variables
    const MAX_HISTORY_ITEMS = 50;
    let inputHistory = [];
    let currentHistoryIndex = -1;
    
    // Load history from localStorage if available
    if (localStorage.getItem('inputHistory')) {
        try {
            inputHistory = JSON.parse(localStorage.getItem('inputHistory'));
        } catch (e) {
            console.error('Failed to load history from localStorage:', e);
            inputHistory = [];
        }
    }
    
    // Create history UI elements - now as a sidebar
    createHistorySidebar();
    
    // Algorithm A categories mapping
    const categoriesA = {
        'Independent': [1,7,13,19,25,31,37,43,49,55],
        'Avoidant': [2,8,14,20,26,32,38,44,50,56],
        'Collaborative': [3,9,15,21,27,33,39,45,51,57],
        'Dependent': [4,10,16,22,28,34,40,46,52,58],
        'Competitive': [5,11,17,23,29,35,41,47,53,59],
        'Participant': [6,12,18,24,30,36,42,48,54,60]
    };
    
    // Algorithm B categories mapping
    const categoriesB = {
        'Cooperative learning': [16,21,29,37,38,39,43],
        'Lecture type': [3,22,25,32,40,44,46],
        'Deductive approach': [5,12,14,18,26,34,36],
        'Inductive Approach': [1,7,13,17,20,42,48],
        'Demonstration': [4,11,19,27,28,35,49],
        'Repetitive exercise': [6,9,15,24,31,45,47],
        'Integrative approach': [2,8,10,23,30,33,41]
    };

    // Create history sidebar
    function createHistorySidebar() {
        // Create sidebar container
        const sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'history-sidebar';
        sidebarContainer.id = 'historySidebar';
        
        // Create sidebar header
        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'history-header';
        
        // Create header with toggle button
        const headerTitle = document.createElement('h3');
        headerTitle.textContent = 'History';
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-history-btn';
        toggleButton.innerHTML = '&times;';
        toggleButton.title = 'Close history sidebar';
        toggleButton.addEventListener('click', toggleHistorySidebar);
        
        sidebarHeader.appendChild(headerTitle);
        sidebarHeader.appendChild(toggleButton);
        sidebarContainer.appendChild(sidebarHeader);
        
        // Create history filter by algorithm
        const filterContainer = document.createElement('div');
        filterContainer.className = 'history-filter';
        
        const algorithmFilter = document.createElement('select');
        algorithmFilter.className = 'algorithm-filter';
        algorithmFilter.id = 'algorithmFilter';
        
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All History';
        
        const algorithmAOption = document.createElement('option');
        algorithmAOption.value = 'algorithmA';
        algorithmAOption.textContent = 'Learning Styles';
        
        const algorithmBOption = document.createElement('option');
        algorithmBOption.value = 'algorithmB';
        algorithmBOption.textContent = 'Teaching Approach';
        
        algorithmFilter.appendChild(allOption);
        algorithmFilter.appendChild(algorithmAOption);
        algorithmFilter.appendChild(algorithmBOption);
        
        algorithmFilter.addEventListener('change', updateHistoryListFiltered);
        
        filterContainer.appendChild(algorithmFilter);
        sidebarContainer.appendChild(filterContainer);
        
        // Create history list
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        historyList.id = 'historyList';
        
        // Populate history list with items from inputHistory
        updateHistoryList(historyList);
        
        sidebarContainer.appendChild(historyList);
        
        // Add clear history button
        const clearHistoryBtn = document.createElement('button');
        clearHistoryBtn.className = 'clear-history-btn';
        clearHistoryBtn.textContent = 'Clear History';
        clearHistoryBtn.addEventListener('click', () => {
            inputHistory = [];
            currentHistoryIndex = -1;
            localStorage.removeItem('inputHistory');
            updateHistoryList();
        });
        sidebarContainer.appendChild(clearHistoryBtn);
        
        // Add sidebar to body
        document.body.appendChild(sidebarContainer);
        
        // Create toggle button for the sidebar (now inside the main container at top right)
        const toggleSidebarBtn = document.createElement('button');
        toggleSidebarBtn.id = 'toggleSidebarBtn';
        toggleSidebarBtn.className = 'toggle-sidebar-btn';
        toggleSidebarBtn.textContent = 'History';
        toggleSidebarBtn.addEventListener('click', toggleHistorySidebar);
        
        // Add toggle button to the container at the top right
        const container = document.querySelector('.container');
        const headerSection = document.createElement('div');
        headerSection.className = 'header-section';
        
        // Get the h1 element
        const h1 = container.querySelector('h1');
        
        // Create a wrapper for the header section
        if (h1 && h1.parentNode === container) {
            // Remove h1 from its current position
            h1.parentNode.removeChild(h1);
            
            // Create header wrapper
            const headerWrapper = document.createElement('div');
            headerWrapper.className = 'header-wrapper';
            
            // Add h1 and toggle button to header wrapper
            headerWrapper.appendChild(h1);
            headerWrapper.appendChild(toggleSidebarBtn);
            
            // Insert header wrapper at the beginning of the container
            container.insertBefore(headerWrapper, container.firstChild);
        } else {
            // Fallback if h1 doesn't exist or is not a direct child of container
            container.insertBefore(toggleSidebarBtn, container.firstChild);
        }
        
        // Check if the sidebar was previously open
        if (localStorage.getItem('sidebarOpen') === 'true') {
            sidebarContainer.classList.add('open');
        }
    }
    
    // Toggle history sidebar
    function toggleHistorySidebar() {
        const sidebar = document.getElementById('historySidebar');
        
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            localStorage.setItem('sidebarOpen', 'false');
        } else {
            sidebar.classList.add('open');
            localStorage.setItem('sidebarOpen', 'true');
        }
    }
    
    // Update history list with filter
    function updateHistoryListFiltered() {
        const filter = document.getElementById('algorithmFilter').value;
        updateHistoryList(document.getElementById('historyList'), filter);
    }
    
    // Update history list UI
    function updateHistoryList(historyListElement = document.getElementById('historyList'), filter = 'all') {
        if (!historyListElement) return;
        
        historyListElement.innerHTML = '';
        
        if (inputHistory.length === 0) {
            const emptyHistory = document.createElement('div');
            emptyHistory.className = 'history-empty';
            emptyHistory.textContent = 'No history entries yet';
            historyListElement.appendChild(emptyHistory);
            return;
        }
        
        // Calculate counts by algorithm
        const algorithmCounts = {
            'algorithmA': inputHistory.filter(item => item.algorithm === 'algorithmA').length,
            'algorithmB': inputHistory.filter(item => item.algorithm === 'algorithmB').length
        };
        
        // Add algorithm counts at the top of history list
        const countsContainer = document.createElement('div');
        countsContainer.className = 'history-counts';
        countsContainer.innerHTML = `
            <div class="count-item"><span class="count-badge learning">${algorithmCounts.algorithmA}</span> Learning Styles</div>
            <div class="count-item"><span class="count-badge teaching">${algorithmCounts.algorithmB}</span> Teaching Approach</div>
        `;
        historyListElement.appendChild(countsContainer);
        
        // Filter history items if needed
        const filteredHistory = filter === 'all' 
            ? inputHistory 
            : inputHistory.filter(item => item.algorithm === filter);
        
        if (filteredHistory.length === 0) {
            const emptyHistory = document.createElement('div');
            emptyHistory.className = 'history-empty';
            emptyHistory.textContent = 'No items match the selected filter';
            historyListElement.appendChild(emptyHistory);
            return;
        }
        
        // Add each history item
        filteredHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Add the date/time
            const dateElement = document.createElement('div');
            dateElement.className = 'history-date';
            
            const date = new Date(item.timestamp);
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedDate = `${date.toLocaleDateString()} ${formattedTime}`;
            dateElement.textContent = formattedDate;
            
            // Add algorithm badge
            const algorithmBadge = document.createElement('div');
            algorithmBadge.className = 'history-algorithm';
            algorithmBadge.textContent = item.algorithm === 'algorithmB' ? 'Teaching' : 'Learning';
            
            // Create header with date and algorithm badge
            const headerContainer = document.createElement('div');
            headerContainer.className = 'history-item-header';
            headerContainer.appendChild(dateElement);
            headerContainer.appendChild(algorithmBadge);
            
            // Create input container with copy button
            const inputContainer = document.createElement('div');
            inputContainer.className = 'history-input-container';
            
            // Only show a preview of the input
            const inputPreview = item.input.length > 20 ? 
                item.input.substring(0, 20) + '...' : 
                item.input;
            
            const inputText = document.createElement('div');
            inputText.className = 'history-input-text';
            inputText.textContent = inputPreview;
            inputText.title = item.input; // Show full text on hover
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'history-copy-btn';
            copyBtn.innerHTML = 'Copy';
            copyBtn.title = 'Copy input to clipboard';
            copyBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                navigator.clipboard.writeText(item.input).then(() => {
                    copyBtn.innerHTML = 'Copied';
                    setTimeout(() => {
                        copyBtn.innerHTML = 'Copy';
                    }, 2000);
                });
            });
            
            inputContainer.appendChild(inputText);
            inputContainer.appendChild(copyBtn);
            
            // Create summary container with key stats only
            const summaryContainer = document.createElement('div');
            summaryContainer.className = 'history-summary';
            
            if (item.summary) {
                // Get number of categories
                const categoryCount = Object.keys(item.summary).length;
                
                // Create summary info
                const summaryInfo = document.createElement('div');
                summaryInfo.className = 'history-summary-row';
                summaryInfo.innerHTML = `<strong>${categoryCount}</strong> categories`;
                summaryContainer.appendChild(summaryInfo);
                
                // For each category, just show the name and mean
                Object.entries(item.summary).slice(0, 3).forEach(([category, data]) => {
                    const categoryRow = document.createElement('div');
                    categoryRow.className = 'history-summary-row';
                    categoryRow.innerHTML = `<strong>${category.split(' ')[0]}:</strong> ${data.mean}`;
                    summaryContainer.appendChild(categoryRow);
                });
                
                if (Object.keys(item.summary).length > 3) {
                    const moreCategories = document.createElement('div');
                    moreCategories.className = 'history-summary-row';
                    moreCategories.textContent = `+ ${Object.keys(item.summary).length - 3} more`;
                    summaryContainer.appendChild(moreCategories);
                }
            }
            
            // Assemble the history item
            historyItem.appendChild(headerContainer);
            historyItem.appendChild(inputContainer);
            historyItem.appendChild(summaryContainer);
            
            // Add click event to load this history item
            historyItem.addEventListener('click', () => {
                const originalIndex = inputHistory.findIndex(h => 
                    h.input === item.input && h.timestamp === item.timestamp);
                if (originalIndex !== -1) {
                    loadHistoryItem(originalIndex);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                        toggleHistorySidebar();
                    }
                }
            });
            
            historyListElement.appendChild(historyItem);
        });
    }
    
    // Add an item to history
    function addToHistory(input, algorithm, summary) {
        // Don't add empty inputs
        if (!input) return;
        
        // Check if we have the required number of digits for this algorithm
        if ((algorithm === 'algorithmA' && input.length < 60) || 
            (algorithm === 'algorithmB' && input.length < 49)) {
            return; // Don't record incomplete entries
        }
        
        // Check for duplicates - only add if it's a new entry
        const isDuplicate = inputHistory.some(item => item.input === input && item.algorithm === algorithm);
        if (isDuplicate) return;
        
        const historyItem = {
            input: input,
            algorithm: algorithm,
            timestamp: new Date().getTime(),
            summary: summary
        };
        
        // Add to the beginning of the array
        inputHistory.unshift(historyItem);
        
        // Limit history size
        if (inputHistory.length > MAX_HISTORY_ITEMS) {
            inputHistory.pop();
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('inputHistory', JSON.stringify(inputHistory));
        } catch (e) {
            console.error('Failed to save history to localStorage:', e);
        }
        
        // Update the UI
        updateHistoryList();
    }
    
    // Load a history item
    function loadHistoryItem(index) {
        if (index >= 0 && index < inputHistory.length) {
            const item = inputHistory[index];
            
            // Set the algorithm selector
            if (algorithmSelector) {
                algorithmSelector.value = item.algorithm || 'algorithmA';
                // Trigger change event to update instructions
                const event = new Event('change');
                algorithmSelector.dispatchEvent(event);
            }
            
            // Set the input value
            numberInput.value = item.input;
            
            // Update counter and results
            const digitsOnly = item.input.replace(/[^\d]/g, '');
            updateCharCounter(digitsOnly.length);
            
            // Format and display
            formatAndDisplayNumbers();
            
            // Set current history index
            currentHistoryIndex = index;
        }
    }

    // Function to find category for a number based on the algorithm
    function findCategory(number, algorithm) {
        const categoriesMap = algorithm === 'algorithmB' ? categoriesB : categoriesA;
        for (const [category, numbers] of Object.entries(categoriesMap)) {
            if (numbers.includes(parseInt(number))) {
                return category;
            }
        }
        return 'Uncategorized';
    }

    function formatAndDisplayNumbers() {
        const input = numberInput.value.trim();
        const digitsOnly = input.replace(/[^\d]/g, '');
        updateCharCounter(digitsOnly.length);
        results.innerHTML = '';

        if (digitsOnly.length > 0) {
            // Get selected algorithm
            const selectedAlgorithm = algorithmSelector ? algorithmSelector.value : 'algorithmA';
            
            if (selectedAlgorithm === 'algorithmB') {
                // Validate input for Algorithm B
                if (!validateAlgorithmB(digitsOnly)) {
                    showError('Algorithm B only accepts ratings between 1-5. Please check your input.');
                    return;
                }
                
                // Algorithm B: Match ratings to question numbers and categorize
                const summary = displayAlgorithmB(digitsOnly);
                
                // Only add to history if we have 49 or more digits
                if (digitsOnly.length >= 49) {
                    addToHistory(digitsOnly, selectedAlgorithm, summary);
                }
            } else {
                // For Algorithm A, we also need to validate (1-5 only)
                if (!validateAlgorithmA(digitsOnly)) {
                    showError('Algorithm A only accepts ratings between 1-5. Please check your input.');
                    return;
                }
                
                // Algorithm A: Group by learning style categories
                const summary = displayAlgorithmA(digitsOnly);
                
                // Only add to history if we have 60 or more digits
                if (digitsOnly.length >= 60) {
                    addToHistory(digitsOnly, selectedAlgorithm, summary);
                }
            }
        } else {
            // Show empty message if no digits found
            const emptyMsg = document.createElement('div');
            emptyMsg.classList.add('empty-message');
            emptyMsg.textContent = 'Your grouped numbers will appear here';
            results.appendChild(emptyMsg);
        }
    }

    // Validate input for Algorithm B (should only contain ratings 1-5)
    function validateAlgorithmB(input) {
        // For Algorithm B, we expect ratings between 1-5
        for (let i = 0; i < input.length; i++) {
            const rating = parseInt(input[i]);
            if (rating < 1 || rating > 5) {
                return false;
            }
        }
        return true;
    }
    
    // Validate input for Algorithm A (should only contain ratings 1-5)
    function validateAlgorithmA(input) {
        // For Algorithm A, we also expect ratings between 1-5
        for (let i = 0; i < input.length; i++) {
            const rating = parseInt(input[i]);
            if (rating < 1 || rating > 5) {
                return false;
            }
        }
        return true;
    }
    
    // Show error message
    function showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.classList.add('error-message');
        errorContainer.textContent = message;
        results.appendChild(errorContainer);
    }

    // Algorithm A: Group input numbers by learning style categories
    function displayAlgorithmA(digitsOnly) {
        // Create a categorized structure to group the ratings
        const categorizedRatings = {};
        const summary = {};
        
        // Initialize categories
        Object.keys(categoriesA).forEach(category => {
            categorizedRatings[category] = [];
        });
        
        // Create an "Uncategorized" entry for numbers that don't fit
        categorizedRatings['Uncategorized'] = [];
        
        // Process each digit in the input as a rating
        for (let i = 0; i < digitsOnly.length; i++) {
            const rating = parseInt(digitsOnly[i]);
            const questionNumber = i + 1; // Question numbers start from 1
            
            // Find which category this question number belongs to
            const category = findCategory(questionNumber, 'algorithmA');
            
            categorizedRatings[category].push({
                questionNumber,
                rating
            });
        }
        
        // Display the ratings grouped by category
        Object.entries(categorizedRatings).forEach(([category, ratings], categoryIndex) => {
            // Only display categories that have ratings
            if (ratings.length > 0 && category !== 'Uncategorized') {
                const categoryContainer = document.createElement('div');
                categoryContainer.classList.add('group-container');
                categoryContainer.classList.add(`group-${(categoryIndex % 6) + 1}`);
                
                // Calculate total and mean
                const total = ratings.reduce((sum, item) => sum + parseInt(item.rating), 0);
                const mean = ratings.length > 0 ? (total / ratings.length).toFixed(2) : 0;
                
                // Add to summary
                summary[category] = { 
                    total, 
                    mean,
                    count: ratings.length 
                };
                
                const categoryTitle = document.createElement('div');
                categoryTitle.classList.add('group-title');
                categoryTitle.textContent = `${category} (${ratings.length} ratings)`;
                categoryContainer.appendChild(categoryTitle);
                
                // Create grid for this category's ratings
                const ratingsGrid = document.createElement('div');
                ratingsGrid.classList.add('ratings-grid');
                
                // Add each rating in this category
                ratings.forEach(({questionNumber, rating}) => {
                    const ratingItem = document.createElement('div');
                    ratingItem.classList.add('rating-item');
                    
                    const questionNumberElement = document.createElement('div');
                    questionNumberElement.classList.add('question-number');
                    questionNumberElement.textContent = `#${questionNumber}`;
                    
                    const ratingElement = document.createElement('div');
                    ratingElement.classList.add('rating-value');
                    ratingElement.textContent = rating;
                    
                    ratingItem.appendChild(questionNumberElement);
                    ratingItem.appendChild(ratingElement);
                    ratingsGrid.appendChild(ratingItem);
                });
                
                categoryContainer.appendChild(ratingsGrid);
                
                // Add statistics container
                const statsContainer = document.createElement('div');
                statsContainer.classList.add('stats-container');
                
                const totalElement = document.createElement('div');
                totalElement.classList.add('stat-item');
                totalElement.innerHTML = `<strong>Total:</strong> ${total}`;
                
                const meanElement = document.createElement('div');
                meanElement.classList.add('stat-item');
                meanElement.innerHTML = `<strong>Mean:</strong> ${mean}`;
                
                statsContainer.appendChild(totalElement);
                statsContainer.appendChild(meanElement);
                categoryContainer.appendChild(statsContainer);
                
                results.appendChild(categoryContainer);
            }
        });
        
        // Show uncategorized numbers if any
        displayUncategorized(categorizedRatings['Uncategorized']);
        
        // If we didn't get enough input to cover all possible question numbers
        if (digitsOnly.length < 60) {
            const missingContainer = document.createElement('div');
            missingContainer.classList.add('group-container', 'group-6');
            
            const missingTitle = document.createElement('div');
            missingTitle.classList.add('group-title');
            missingTitle.textContent = 'Missing Inputs';
            missingContainer.appendChild(missingTitle);
            
            const missingMessage = document.createElement('div');
            missingMessage.classList.add('extra-message');
            missingMessage.textContent = `Note: You've provided ${digitsOnly.length} ratings, but 60 are needed for complete analysis.`;
            missingContainer.appendChild(missingMessage);
            
            results.appendChild(missingContainer);
        }
        
        return summary;
    }

    // Algorithm B: Match ratings to question numbers and categorize
    function displayAlgorithmB(digitsOnly) {
        // Create a categorized structure to group the ratings
        const categorizedRatings = {};
        const summary = {};
        
        // Initialize categories
        Object.keys(categoriesB).forEach(category => {
            categorizedRatings[category] = [];
        });
        
        // Process each digit in the input as a rating
        for (let i = 0; i < digitsOnly.length; i++) {
            const rating = digitsOnly[i];
            const questionNumber = i + 1; // Question numbers start from 1
            
            // Find which category this question number belongs to
            const category = findCategory(questionNumber, 'algorithmB');
            
            if (category !== 'Uncategorized') {
                categorizedRatings[category].push({
                    questionNumber,
                    rating: parseInt(rating)
                });
            }
        }
        
        // Display the ratings grouped by category
        Object.entries(categorizedRatings).forEach(([category, ratings], categoryIndex) => {
            // Only display categories that have ratings
            if (ratings.length > 0) {
                const categoryContainer = document.createElement('div');
                categoryContainer.classList.add('group-container');
                categoryContainer.classList.add(`group-${(categoryIndex % 6) + 1}`);
                
                // Calculate total and mean
                const total = ratings.reduce((sum, item) => sum + item.rating, 0);
                const mean = ratings.length > 0 ? (total / ratings.length).toFixed(2) : 0;
                
                // Add to summary
                summary[category] = { 
                    total, 
                    mean,
                    count: ratings.length 
                };
                
                const categoryTitle = document.createElement('div');
                categoryTitle.classList.add('group-title');
                categoryTitle.textContent = `${category} (${ratings.length} ratings)`;
                categoryContainer.appendChild(categoryTitle);
                
                // Create grid for this category's ratings
                const ratingsGrid = document.createElement('div');
                ratingsGrid.classList.add('ratings-grid');
                
                // Add each rating in this category
                ratings.forEach(({questionNumber, rating}) => {
                    const ratingItem = document.createElement('div');
                    ratingItem.classList.add('rating-item');
                    
                    const questionNumberElement = document.createElement('div');
                    questionNumberElement.classList.add('question-number');
                    questionNumberElement.textContent = `#${questionNumber}`;
                    
                    const ratingElement = document.createElement('div');
                    ratingElement.classList.add('rating-value');
                    ratingElement.textContent = rating;
                    
                    ratingItem.appendChild(questionNumberElement);
                    ratingItem.appendChild(ratingElement);
                    ratingsGrid.appendChild(ratingItem);
                });
                
                categoryContainer.appendChild(ratingsGrid);
                
                // Add statistics container
                const statsContainer = document.createElement('div');
                statsContainer.classList.add('stats-container');
                
                const totalElement = document.createElement('div');
                totalElement.classList.add('stat-item');
                totalElement.innerHTML = `<strong>Total:</strong> ${total}`;
                
                const meanElement = document.createElement('div');
                meanElement.classList.add('stat-item');
                meanElement.innerHTML = `<strong>Mean:</strong> ${mean}`;
                
                statsContainer.appendChild(totalElement);
                statsContainer.appendChild(meanElement);
                categoryContainer.appendChild(statsContainer);
                
                results.appendChild(categoryContainer);
            }
        });
        
        // If there are more ratings than there are question numbers in our categories
        if (digitsOnly.length > 49) {
            const extraContainer = document.createElement('div');
            extraContainer.classList.add('group-container');
            extraContainer.classList.add('group-6');
            
            const extraTitle = document.createElement('div');
            extraTitle.classList.add('group-title');
            extraTitle.textContent = 'Additional Ratings';
            extraContainer.appendChild(extraTitle);
            
            const extraMessage = document.createElement('div');
            extraMessage.classList.add('extra-message');
            extraMessage.textContent = `Note: ${digitsOnly.length - 49} additional ratings were provided beyond the 49 questions in the categories.`;
            extraContainer.appendChild(extraMessage);
            
            results.appendChild(extraContainer);
        }
        
        return summary;
    }
    
    // Display uncategorized numbers
    function displayUncategorized(uncategorizedItems) {
        if (uncategorizedItems.length > 0) {
            const uncatContainer = document.createElement('div');
            uncatContainer.classList.add('group-container', 'group-6');
            
            const uncatTitle = document.createElement('div');
            uncatTitle.classList.add('group-title');
            uncatTitle.textContent = `Uncategorized (${uncategorizedItems.length} ratings)`;
            uncatContainer.appendChild(uncatTitle);
            
            const ratingsGrid = document.createElement('div');
            ratingsGrid.classList.add('ratings-grid');
            
            uncategorizedItems.forEach(({questionNumber, rating}) => {
                const ratingItem = document.createElement('div');
                ratingItem.classList.add('rating-item');
                
                const questionNumberElement = document.createElement('div');
                questionNumberElement.classList.add('question-number');
                questionNumberElement.textContent = `#${questionNumber}`;
                
                const ratingElement = document.createElement('div');
                ratingElement.classList.add('rating-value');
                ratingElement.textContent = rating;
                
                ratingItem.appendChild(questionNumberElement);
                ratingItem.appendChild(ratingElement);
                ratingsGrid.appendChild(ratingItem);
            });
            
            uncatContainer.appendChild(ratingsGrid);
            results.appendChild(uncatContainer);
        }
    }

    // Update character counter
    function updateCharCounter(count) {
        const selectedAlgorithm = algorithmSelector ? algorithmSelector.value : 'algorithmA';
        const maxDigits = selectedAlgorithm === 'algorithmB' ? 49 : 60;
        
        charCounter.textContent = `${count}/${maxDigits} digit${count !== 1 ? 's' : ''}`;
        
        // Change background color based on progress toward limit
        if (count === 0) {
            charCounter.style.backgroundColor = '#95a5a6'; // Gray for empty
        } else if (count < maxDigits) {
            charCounter.style.backgroundColor = '#3498db'; // Blue for in progress
        } else if (count === maxDigits) {
            charCounter.style.backgroundColor = '#27ae60'; // Green for complete
        } else {
            charCounter.style.backgroundColor = '#e74c3c'; // Red for over limit
        }
    }
    
    // Event listeners
    
    numberInput.addEventListener('input', (e) => {
        // Get the current value and selected algorithm
        const currentValue = e.target.value;
        const selectedAlgorithm = algorithmSelector ? algorithmSelector.value : 'algorithmA';
        const maxDigits = selectedAlgorithm === 'algorithmB' ? 49 : 60;
        
        // Filter out non-numeric characters
        const digitsOnly = currentValue.replace(/[^\d]/g, '');
        
        // Check for invalid ratings (not 1-5)
        let validDigits = '';
        for (let i = 0; i < digitsOnly.length; i++) {
            const digit = digitsOnly[i];
            if (digit >= '1' && digit <= '5') {
                validDigits += digit;
            }
        }
        
        // Truncate if exceeding max digits
        const truncatedValue = validDigits.substring(0, maxDigits);
        
        // Update the input if filtered value is different
        if (truncatedValue !== currentValue) {
            e.target.value = truncatedValue;
        }
        
        // Update character count
        updateCharCounter(truncatedValue.length);
        
        // Automatically format and display as user types
        formatAndDisplayNumbers();
    });

    // Add keyboard navigation for history
    numberInput.addEventListener('keydown', (e) => {
        // Up arrow to navigate history up
        if (e.key === 'ArrowUp' && inputHistory.length > 0) {
            e.preventDefault();
            currentHistoryIndex = Math.min(currentHistoryIndex + 1, inputHistory.length - 1);
            loadHistoryItem(currentHistoryIndex);
        }
        
        // Down arrow to navigate history down
        if (e.key === 'ArrowDown' && currentHistoryIndex > 0) {
            e.preventDefault();
            currentHistoryIndex--;
            loadHistoryItem(currentHistoryIndex);
        } else if (e.key === 'ArrowDown' && currentHistoryIndex === 0) {
            e.preventDefault();
            currentHistoryIndex = -1;
            numberInput.value = '';
            updateCharCounter(0);
            formatAndDisplayNumbers();
        }
    });

    // Algorithm selector handler if it exists
    if (algorithmSelector) {
        algorithmSelector.addEventListener('change', function() {
            // When changing algorithm, clear the input and results
            numberInput.value = '';
            const selectedAlgorithm = algorithmSelector.value;
            const maxDigits = selectedAlgorithm === 'algorithmB' ? 49 : 60;
            updateCharCounter(0);
            results.innerHTML = `<div class="empty-message">Your grouped numbers will appear here (max ${maxDigits} digits)</div>`;
            numberInput.focus();
        });
    }
    
    // Initialize the character counter with the appropriate max digits
    const initialAlgorithm = algorithmSelector ? algorithmSelector.value : 'algorithmA';
    const initialMaxDigits = initialAlgorithm === 'algorithmB' ? 49 : 60;
    charCounter.textContent = `0/${initialMaxDigits} digits`;
    
    numberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            formatAndDisplayNumbers();
        }
        
        // Prevent entering non-numeric characters
        if (!/[1-5]/.test(e.key)) {
            e.preventDefault();
        }
        
        // Check if we're at the max digits, prevent more input
        const selectedAlgorithm = algorithmSelector ? algorithmSelector.value : 'algorithmA';
        const maxDigits = selectedAlgorithm === 'algorithmB' ? 49 : 60;
        const digitsOnly = numberInput.value.replace(/[^\d]/g, '');
        
        if (digitsOnly.length >= maxDigits) {
            e.preventDefault();
        }
    });
    
    clearBtn.addEventListener('click', () => {
        numberInput.value = '';
        const selectedAlgorithm = algorithmSelector ? algorithmSelector.value : 'algorithmA';
        const maxDigits = selectedAlgorithm === 'algorithmB' ? 49 : 60;
        results.innerHTML = `<div class="empty-message">Your grouped numbers will appear here (max ${maxDigits} digits)</div>`;
        updateCharCounter(0);
        numberInput.focus();
    });
    
    // Set focus on input field when page loads
    numberInput.focus();

    // Mobile optimization: Ensure virtual keyboard works well
    numberInput.addEventListener('focus', function() {
        // On mobile, scroll to make sure the input is visible when the keyboard opens
        setTimeout(function() {
            numberInput.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    });
    
    // Add touch feedback for buttons on mobile
    [clearBtn].forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.classList.add('button-touch');
        });
        
        btn.addEventListener('touchend', function() {
            this.classList.remove('button-touch');
        });
    });
    
    // Prevent zooming when typing on mobile (iOS fix)
    numberInput.addEventListener('focus', function() {
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            document.body.classList.add('mobile-input-active');
        }
    });
    
    numberInput.addEventListener('blur', function() {
        document.body.classList.remove('mobile-input-active');
    });
});