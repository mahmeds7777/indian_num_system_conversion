document.addEventListener('DOMContentLoaded', () => {
    const convertButton = document.getElementById('convertButton');
    const noConversionCheckbox = document.getElementById('noConversion');
    const currencyGroup = document.getElementById('currencyGroup');
    const amountInput = document.getElementById('amount');
  
    const sideMenu = document.getElementById('sideMenu');
    const menuToggle = document.getElementById('menuToggle');
    const smallScreenMenuToggle = document.getElementById('smallScreenMenuToggle');
    const mainContent = document.getElementById('mainContent');
    const menuOverlay = document.getElementById('menuOverlay');
  
    // Set default value and clear on focus
    amountInput.addEventListener('focus', () => {
      if (amountInput.value === '5000') {
        amountInput.value = '';
      }
    });
  
    amountInput.addEventListener('blur', () => {
      if (amountInput.value === '') {
        amountInput.value = '5000';
      }
    });
  
    // Restrict input to 10 digits
    amountInput.addEventListener('input', () => {
      if (amountInput.value.length > 10) {
        amountInput.value = amountInput.value.slice(0, 10);
      }
    });
  
    noConversionCheckbox.addEventListener('change', toggleCurrencyFields);
    convertButton.addEventListener('click', convertCurrency);
  
    // Show side menu when hamburger icon is clicked
    smallScreenMenuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      sideMenu.classList.add('show');
      menuOverlay.classList.add('show');
      mainContent.classList.add('menu-open');
      smallScreenMenuToggle.style.display = 'none'; // Hide hamburger icon when menu is open
    });
  
    // Hide side menu when clicking outside of it or on the overlay
    function hideSideMenu() {
      sideMenu.classList.remove('show');
      menuOverlay.classList.remove('show');
      mainContent.classList.remove('menu-open');
      smallScreenMenuToggle.style.display = 'block'; // Show hamburger icon when menu is closed
    }
  
    document.addEventListener('click', (event) => {
      if (!sideMenu.contains(event.target) && !smallScreenMenuToggle.contains(event.target) && sideMenu.classList.contains('show')) {
        hideSideMenu();
      }
    });
  
    // Prevent propagation when clicking inside the side menu
    sideMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  
    // Hide side menu when clicking on the overlay
    menuOverlay.addEventListener('click', () => {
      hideSideMenu();
    });
  
    // Toggle side menu when chevron is clicked
    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
  
      if (sideMenu.classList.contains('show')) {
        // Hide menu (mobile view)
        hideSideMenu();
      } else if (sideMenu.classList.contains('hide')) {
        // Show menu (desktop view)
        sideMenu.classList.remove('hide');
        mainContent.classList.remove('full-width');
        menuToggle.classList.remove('rotate');
        // Change icon direction
        const icon = menuToggle.querySelector('i');
        icon.classList.replace('fa-chevron-right', 'fa-chevron-left');
      } else {
        // Hide menu (desktop view)
        sideMenu.classList.add('hide');
        mainContent.classList.add('full-width');
        menuToggle.classList.add('rotate');
        // Change icon direction
        const icon = menuToggle.querySelector('i');
        icon.classList.replace('fa-chevron-left', 'fa-chevron-right');
      }
    });
  
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;
  });
  
  function toggleCurrencyFields() {
    const noConversion = document.getElementById('noConversion').checked;
    const currencyGroup = document.getElementById('currencyGroup');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
  
    if (noConversion) {
      currencyGroup.classList.add('hidden');
      fromCurrency.disabled = true;
      toCurrency.disabled = true;
    } else {
      currencyGroup.classList.remove('hidden');
      fromCurrency.disabled = false;
      toCurrency.disabled = false;
      // Clear the English equivalent when currency conversion is active
      document.getElementById('englishEquivalent').innerHTML = '';
    }
  }
  
  async function getExchangeRate(fromCurrency, toCurrency) {
    // Use the specified ExchangeRate-API
    const apiKey = 'c8ccaa376ec5e8ed0606fddb'; // Replace with your actual API key
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
  
    try {
      const response = await fetch(apiUrl);
  
      if (!response.ok) throw new Error('Network response was not ok');
  
      const data = await response.json();
  
      if (data.result !== 'success' || !data.conversion_rates[toCurrency]) {
        throw new Error('Invalid exchange rate data');
      }
  
      return data.conversion_rates[toCurrency];
    } catch (error) {
      console.warn('Error fetching exchange rates:', error);
      //alert('Cannot fetch exchange rate from API. Please try again later.');
      return null;
    }
  }
  
  async function convertCurrency() {
    const amountInput = document.getElementById('amount');
    const suffixMultiplier = parseFloat(document.getElementById('amountSuffix').value);
    const amountValue = parseFloat(amountInput.value);
    const noConversion = document.getElementById('noConversion').checked;
  
    const amount = amountValue * suffixMultiplier;
  
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount.');
      amountInput.focus();
      return;
    }
  
    let convertedAmount = amount;
  
    if (!noConversion) {
      const fromCurrency = document.getElementById('fromCurrency').value;
      const toCurrency = document.getElementById('toCurrency').value;
  
      const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
      if (exchangeRate === null) return;
  
      convertedAmount = amount * exchangeRate;
  
      // Display the converted amount with proper formatting
      document.getElementById('convertedAmount').innerHTML =
        `<strong>${formatNumber(amount)} ${fromCurrency}</strong> = <strong>${formatNumber(convertedAmount.toFixed(2))} ${toCurrency}</strong>`;
    } else {
      // No currency conversion
      document.getElementById('convertedAmount').innerHTML =
        `<strong>${formatNumber(amount)}</strong>`;
  
      // Display the English equivalent
      const englishEquivalent = getEnglishEquivalent(amount);
      document.getElementById('englishEquivalent').innerHTML = `≈ ${englishEquivalent}`;
    }
  
    // Display the number in Indian numbering system
    const indianNumbering = formatIndianNumber(convertedAmount);
    document.getElementById('indianNumbering').innerHTML = indianNumbering;
  }
  
  // Function to format numbers with commas (International)
  function formatNumber(number) {
    return Number(number).toLocaleString('en-US');
  }
  
  // Function to format numbers with commas (Indian)
  function formatNumberIndian(number) {
    const x = Math.floor(number).toString();
    const lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    let result = '';
  
    if (otherNumbers !== '') {
      result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      result = lastThree;
    }
  
    return result;
  }
  
  function formatIndianNumber(number) {
    const units = [
      { value: 1e19, symbol: 'Mahashankh', hindi: 'महाशंख', urdu: 'مہاشنکھ' },
      { value: 1e17, symbol: 'Shankh', hindi: 'शंख', urdu: 'شنگھ' },
      { value: 1e15, symbol: 'Padma', hindi: 'पद्म', urdu: 'پدم' },
      { value: 1e13, symbol: 'Neel', hindi: 'नील', urdu: 'نیل' },
      { value: 1e11, symbol: 'Kharab', hindi: 'खरब', urdu: 'کھرب' },
      { value: 1e9,  symbol: 'Arab', hindi: 'अरब', urdu: 'ارب' },
      { value: 1e7,  symbol: 'Crore', hindi: 'करोड़', urdu: 'کروڑ' },
      { value: 1e5,  symbol: 'Lakh', hindi: 'लाख', urdu: 'لاکھ' },
      { value: 1e3,  symbol: 'Hizar', hindi: 'हज़ार', urdu: 'ہزار' },
      { value: 1e2,  symbol: 'Su', hindi: 'सौ', urdu: 'سو' }
      // Units less than hundred are omitted
    ];
  
    let remainder = BigInt(Math.floor(number));
    let result = '';
  
    // Display the number with Indian commas
    const formattedIndianNumber = `<div class="formatted-number">${formatNumberIndianBigInt(remainder)}</div>`;
    result += formattedIndianNumber;
  
    for (let unit of units) {
      const unitValueBigInt = BigInt(unit.value);
      if (remainder >= unitValueBigInt) {
        const unitValue = remainder / unitValueBigInt;
        remainder = remainder % unitValueBigInt;
  
        if (unit.symbol && unitValue > 0) {
          result += `
            <div class="unit-line">
              <span><strong>${formatNumberIndianBigInt(unitValue)}</strong> ${unit.symbol}</span>
              <span>(${unit.hindi} | ${unit.urdu})</span>
            </div>
          `;
        }
      }
    }
  
    return result;
  }
  
  // Function to format BigInt numbers with Indian commas
  function formatNumberIndianBigInt(number) {
    const x = number.toString();
    const lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    let result = '';
  
    if (otherNumbers !== '') {
      result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      result = lastThree;
    }
  
    return result;
  }
  
  // Function to get English equivalent (most significant unit)
  function getEnglishEquivalent(number) {
    const units = [
      { value: 1e12, symbol: 'trillion' },
      { value: 1e9,  symbol: 'billion' },
      { value: 1e6,  symbol: 'million' },
      { value: 1e3,  symbol: 'thousand' }
    ];
  
    for (let unit of units) {
      if (number >= unit.value) {
        const unitValue = number / unit.value;
        const formattedValue = unitValue.toFixed(3).replace(/\.?0+$/, '');
        return `${formattedValue} ${unit.symbol}`;
      }
    }
  
    return formatNumber(number);
  }
  