const display = document.getElementById('display');
let isCalculated = false;

/**
 * Clears the calculator display
 */
function clearDisplay() {
    display.value = '';
    isCalculated = false;
}

/**
 * Deletes the last entered character
 */
function deleteLast() {
    if (display.value === 'Error' || display.value === 'Cannot divide by 0') {
        clearDisplay();
        return;
    }
    display.value = display.value.slice(0, -1);
}

/**
 * Appends a number or operator to the display
 * @param {string} value 
 */
function addValue(value) {
    // If an error is shown, reset before adding
    if (display.value === 'Error' || display.value === 'Cannot divide by 0') {
        display.value = '';
        isCalculated = false;
    }

    const operators = ['+', '-', '*', '/'];
    const current = display.value;
    const lastChar = current.slice(-1);

    // If calculation just completed:
    if (isCalculated) {
        if (operators.includes(value)) {
            // Continue calculating with the previous result
            isCalculated = false;
        } else {
            // Start fresh with a new number
            display.value = '';
            isCalculated = false;
        }
    }

    // Handle operator inputs
    if (operators.includes(value)) {
        if (display.value === '') {
            // Allow negative sign at start
            if (value === '-') {
                display.value = '-';
            }
            return;
        }

        // Replace consecutive operators unless it's a negative sign after * or /
        if (operators.includes(lastChar)) {
            if (value === '-' && (lastChar === '*' || lastChar === '/')) {
                display.value += value;
                return;
            }
            display.value = display.value.slice(0, -1) + value;
            return;
        }
    }

    // Handle decimal point
    if (value === '.') {
        // Find current number segment after the last operator
        const segments = display.value.split(/[+\-*/]/);
        const lastSegment = segments[segments.length - 1];

        // Prevent multiple decimals in the same number
        if (lastSegment.includes('.')) {
            return;
        }

        // If decimal is first character or immediately follows an operator
        if (lastSegment === '') {
            display.value += '0.';
            return;
        }
    }

    // Handle leading zero
    if (value === '0') {
        const segments = display.value.split(/[+\-*/]/);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment === '0') {
            return; // Prevent multiple leading zeroes like '00'
        }
    } else if (/[1-9]/.test(value)) {
        const segments = display.value.split(/[+\-*/]/);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment === '0') {
            // Replace leading single '0' with the new digit
            display.value = display.value.slice(0, -1) + value;
            return;
        }
    }

    display.value += value;
}

/**
 * Evaluates the mathematical expression and displays the result
 */
function calculate() {
    let expression = display.value.trim();

    if (!expression || expression === 'Error' || expression === 'Cannot divide by 0') {
        return;
    }

    // Remove any trailing operators before calculating
    expression = expression.replace(/[+\-*/]+$/, '');

    // Strict validation: allow only valid math characters
    if (!/^[0-9+\-*/. ]+$/.test(expression)) {
        display.value = 'Error';
        isCalculated = true;
        return;
    }

    try {
        // Safe evaluation using Function constructor with restricted characters
        const result = Function(`'use strict'; return (${expression})`)();

        if (!isFinite(result)) {
            display.value = 'Cannot divide by 0';
        } else {
            // Fix floating point precision issues (e.g. 0.1 + 0.2 = 0.3)
            const formattedResult = parseFloat(result.toFixed(10));
            display.value = formattedResult.toString();
        }
    } catch (e) {
        display.value = 'Error';
    }

    isCalculated = true;
}

// Add physical keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        addValue(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        addValue(key);
    } else if (key === '.') {
        addValue('.');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault();
        clearDisplay();
    }
});
