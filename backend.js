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
    const adminForm = document.getElementById('adminForm'); // Admin Form Element
    const passwordList = document.getElementById('passwordList');
    const filterContainer = document.getElementById('filterContainer');
    const filterWebsiteInput = document.getElementById('filterWebsite');
    const passwordTable = document.getElementById('passwordTable');
    const passwordTableBody = passwordTable ? passwordTable.querySelector('tbody') : null;

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Variable To Track If A Password Was Generated
    let passwordGenerated = false;

    // Initialise Theme Toggle
    if (darkModeToggle) {
        darkModeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';

        darkModeToggle.addEventListener('change', function () {
            const theme = this.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme); // Save the theme to local storage
        });
    }

    // Initialise Button Text
    if (savePasswordBtn) {
        savePasswordBtn.textContent = 'Save A Password';
    }

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

        if (length < 12 || length > 24) {
            // Show Error Message If Password Length Is Invalid
            characterTypeError.textContent = 'Password Length Must Be Between 12 And 24 Characters';
            characterTypeError.style.display = 'block';
            return '';
        }

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

                // Prefill Password Field
                if (passwordInput) {
                    passwordInput.value = password;
                }

                // Update The Password Generated Flag
                passwordGenerated = true;
                if (savePasswordBtn) {
                    savePasswordBtn.textContent = 'Save Password';
                }
            }
        });
    }

    // Display The Save Password Form And Prefill Generated Password
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', function () {
            if (saveForm) {
                saveForm.style.display = 'block';
                formError.style.display = 'none'; // Hide Form Error On Form Display

                // Check If Password Was Generated
                if (!passwordGenerated && passwordInput) {
                    passwordInput.value = ''; // Clear Any Previous Value
                }
            }
        });

        // Make The Button Always Visible
        savePasswordBtn.classList.remove('hidden');
    }

    // Event Listener To Submit Password
    if (submitBtn) {
        submitBtn.addEventListener('click', async function () {
            const website = websiteInput.value;
            const username = usernameInput.value;
            const password = passwordInput.value; // Use Prefilled Password Or User Input

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

                // Reset The Password Generated Flag
                passwordGenerated = false;

                // Reset Save Password Button Text
                savePasswordBtn.textContent = 'Save A Password';
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
                    const result = await response.json();

                    if (result.passwords) {
                        // Hide Admin Form
                        if (adminForm) {
                            adminForm.style.display = 'none';
                        }

                        // Show Password List
                        if (passwordList) {
                            passwordList.style.display = 'block';
                        }

                        // Show Filter Container
                        if (filterContainer) {
                            filterContainer.style.display = 'block';
                        }

                        if (passwordTableBody) {
                            passwordTableBody.innerHTML = ''; // Clear The Table Body

                            result.passwords.forEach(pw => {
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
                        adminPasswordError.textContent = 'No Passwords Found';
                        adminPasswordError.style.display = 'block';
                    }
                } else {
                    const result = await response.json();
                    // Show Error Message If Admin Password Is Invalid
                    adminPasswordError.textContent = result.message || 'An Error Occurred';
                    adminPasswordError.style.display = 'block';
                }
            } catch (error) {
                console.error('Error Fetching Passwords:', error);
                adminPasswordError.textContent = 'An Error Occurred While Fetching Passwords';
                adminPasswordError.style.display = 'block';
            }
        });
    }

    // Event Listener To Filter Passwords
    if (filterWebsiteInput) {
        filterWebsiteInput.addEventListener('input', function () {
            const filterValue = this.value.toLowerCase();
            const rows = passwordTableBody ? passwordTableBody.querySelectorAll('tr') : [];
            
            rows.forEach(row => {
                const websiteCell = row.querySelector('td:first-child'); // Assuming the website is in the first column
                const websiteText = websiteCell ? websiteCell.textContent.toLowerCase() : '';
                if (websiteText.includes(filterValue)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});