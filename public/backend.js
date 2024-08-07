document.addEventListener('DOMContentLoaded', function () {
    // Elements For Generating Passwords
    const lengthInput = document.getElementById('length');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateBtn = document.getElementById('generateBtn');
    const generatedPasswordDiv = document.getElementById('generatedPassword');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const saveForm = document.getElementById('saveForm');
    const websiteInput = document.getElementById('website');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const characterTypeError = document.getElementById('characterTypeError');
    const formError = document.getElementById('formError');

    // Elements For Viewing Passwords
    const adminPasswordInput = document.getElementById('adminPassword');
    const viewBtn = document.getElementById('viewBtn');
    const adminPasswordError = document.getElementById('adminPasswordError');
    const passwordList = document.getElementById('passwordList');
    const passwordTable = document.getElementById('passwordTable');
    const passwordTableBody = passwordTable ? passwordTable.getElementsByTagName('tbody')[0] : null;

    // Function To Generate A Password
    function generatePassword() {
        const length = parseInt(lengthInput.value, 10);
        const includeUppercase = uppercaseCheckbox.checked;
        const includeLowercase = lowercaseCheckbox.checked;
        const includeNumbers = numbersCheckbox.checked;
        const includeSymbols = symbolsCheckbox.checked;

        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

        let characters = '';
        if (includeUppercase) characters += uppercase;
        if (includeLowercase) characters += lowercase;
        if (includeNumbers) characters += numbers;
        if (includeSymbols) characters += symbols;

        if (characters.length === 0) {
            // Show Error Message If No Character Type Is Selected
            characterTypeError.textContent = 'To Generate A Password, Please Select At Least One Character Type';
            characterTypeError.style.display = 'block';
            return '';
        }

        characterTypeError.textContent = ''; // Clear Error Message
        characterTypeError.style.display = 'none';

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }

        return password;
    }

    // Event Listener To Generate Password
    if (generateBtn) {
        generateBtn.addEventListener('click', function () {
            const password = generatePassword();
            if (password) {
                generatedPasswordDiv.textContent = password;
                
                // Prefill password field for saving
                if (passwordInput) {
                    passwordInput.value = password;
                }

                // Show Save Button
                if (savePasswordBtn) {
                    savePasswordBtn.classList.remove('hidden');
                }
            }
        });
    }

    // Display The Save Password Form
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', function () {
            if (saveForm) {
                saveForm.style.display = 'block';
                websiteInput.value = '';
                usernameInput.value = '';
                formError.style.display = 'none'; // Hide Form Error On Form Display
            }
        });
    }

    // Event Listener To Submit Password
    if (submitBtn) {
        submitBtn.addEventListener('click', async function () {
            const website = websiteInput.value;
            const username = usernameInput.value;
            const password = passwordInput.value; // Changed to get password from the input field

            if (!website || !username || !password) {
                formError.textContent = 'Error: Please Fill In All Fields'; // Show Error Message
                formError.style.display = 'block'; // Show The Error Message
                return;
            }

            formError.textContent = ''; // Clear The Error Message
            formError.style.display = 'none';

            try {
                const response = await fetch('/save-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ website, username, password })
                });

                const result = await response.json();
                alert(result.message);
                if (saveForm) {
                    saveForm.style.display = 'none';
                }

                // Hide The Save Password Button
                if (savePasswordBtn) {
                    savePasswordBtn.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error saving password:', error);
                alert('An Error Occurred: Failed To Save Password'); // Alert On Save Error
            }
        });
    }

    // Event Listener To View Passwords
    if (viewBtn) {
        viewBtn.addEventListener('click', async function (event) {
            event.preventDefault(); // Prevent Default Form Submission

            const adminPassword = adminPasswordInput.value;

            // Clear Previous Error Messages
            adminPasswordError.textContent = '';
            adminPasswordError.style.display = 'none';

            if (!adminPassword) {
                // Show Error Message If Admin Password Is Empty
                adminPasswordError.textContent = 'Please Enter The Admin Password To Continue';
                adminPasswordError.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('/view-passwords', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminPassword })
                });

                if (response.ok) {
                    const passwords = await response.json();
                    if (passwordList) {
                        passwordList.style.display = 'block';
                    }
                    if (passwordTableBody) {
                        passwordTableBody.innerHTML = ''; // Clear The Table Body

                        passwords.forEach(pw => {
                            const row = document.createElement('tr');
                            const hiddenLength = pw.password.length;
                            row.innerHTML = `
                                <td>${pw.website}</td>
                                <td>${pw.username}</td>
                                <td class="hidden-password" data-password="${pw.password}" data-length="${hiddenLength}">${'*'.repeat(hiddenLength)}</td>
                                <td>
                                    <button class="reveal-btn">Reveal</button>
                                    <button class="delete-btn" data-id="${pw.id}">Delete</button>
                                </td>
                            `;
                            passwordTableBody.appendChild(row);
                        });

                        // Add Event Listeners To Reveal Buttons
                        const revealButtons = document.querySelectorAll('.reveal-btn');
                        revealButtons.forEach(button => {
                            button.addEventListener('click', function () {
                                const passwordCell = this.closest('tr').querySelector('.hidden-password');
                                const password = passwordCell.getAttribute('data-password');
                                if (this.textContent === 'Reveal') {
                                    if (confirm('Are You Sure You Want To Reveal This Password?')) {
                                        passwordCell.textContent = password;
                                        this.textContent = 'Hide';
                                    }
                                } else {
                                    passwordCell.textContent = '*'.repeat(passwordCell.getAttribute('data-length'));
                                    this.textContent = 'Reveal';
                                }
                            });
                        });

                        // Add Event Listeners To Delete Buttons
                        const deleteButtons = document.querySelectorAll('.delete-btn');
                        deleteButtons.forEach(button => {
                            button.addEventListener('click', async function () {
                                const passwordId = this.getAttribute('data-id');
                                if (confirm('Are You Sure You Want To Delete This Password?')) {
                                    try {
                                        const response = await fetch(`/delete-password/${passwordId}`, {
                                            method: 'DELETE',
                                            headers: { 'Content-Type': 'application/json' }
                                        });

                                        if (response.ok) {
                                            alert('Password Successfully Deleted');
                                            // Refresh The Password List
                                            viewBtn.click();
                                        } else {
                                            const result = await response.json();
                                            alert(result.message || 'Failed To Delete Password');
                                        }
                                    } catch (error) {
                                        console.error('Error Deleting Password:', error);
                                        alert('Failed To Delete Password');
                                    }
                                }
                            });
                        });
                    }
                } else {
                    const result = await response.json();
                    // Show Error Message If Admin Password Is Invalid
                    adminPasswordError.textContent = result.message || 'An Error Occurred';
                    adminPasswordError.style.display = 'block';
                }
            } catch (error) {
                console.error('Error fetching passwords:', error);
                adminPasswordError.textContent = 'An Error Occurred While Fetching Passwords';
                adminPasswordError.style.display = 'block';
            }
        });
    }
});