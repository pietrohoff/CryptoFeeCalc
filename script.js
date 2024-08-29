const exchangeFees = {
    binance: 0.1,
    coinbase: 1.49,
    kraken: 0.26,
    bitstamp: 0.5,
    gemini: 1.49
};

let exchangeRates = {}; // Object to hold exchange rates
let selectedCurrency = 'USD';

async function fetchExchangeRates() {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    exchangeRates = data.rates;
}

function updateCurrency() {
    selectedCurrency = document.getElementById('currency').value;
    const currencyLabel = selectedCurrency;
    document.getElementById('currencyLabel').textContent = currencyLabel;
    calculateCrypto();
}

function convertCurrency(amount, rate) {
    return amount / rate; // Corrected for division
}

function setFee() {
    if (!document.getElementById('manualFee').checked) {
        const exchange = document.getElementById('exchange').value;
        document.getElementById('fee').value = exchangeFees[exchange];
    }
}

function toggleManualFee() {
    const feeInput = document.getElementById('fee');
    if (document.getElementById('manualFee').checked) {
        feeInput.removeAttribute('readonly');
        feeInput.value = '';
    } else {
        feeInput.setAttribute('readonly', true);
        setFee(); // Revert to automatic exchange fee
    }
}

function toggleManualCryptoPrice() {
    const cryptoSelect = document.getElementById('crypto');
    const manualCryptoPriceContainer = document.getElementById('manualCryptoPriceContainer');

    if (cryptoSelect.value === 'other') {
        manualCryptoPriceContainer.style.display = 'block';
    } else {
        manualCryptoPriceContainer.style.display = 'none';
    }
}

async function getCryptoPrice(crypto) {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`);
    const data = await response.json();
    return data[crypto].usd;
}

async function calculateCrypto() {
    const crypto = document.getElementById('crypto').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const fee = parseFloat(document.getElementById('fee').value);
    let cryptoPrice;

    if (crypto === 'other') {
        cryptoPrice = parseFloat(document.getElementById('cryptoPrice').value);
        if (isNaN(cryptoPrice)) {
            document.getElementById('result').innerHTML = "Please enter a valid cryptocurrency price.";
            return;
        }
    } else {
        cryptoPrice = await getCryptoPrice(crypto);
    }

    if (isNaN(amount) || isNaN(fee)) {
        document.getElementById('result').innerHTML = "Please fill out all fields correctly.";
        return;
    }

    const rate = exchangeRates[selectedCurrency] || 1;
    const convertedAmount = convertCurrency(amount, rate);  // Convert the amount to USD
    const cryptoBought = convertedAmount / cryptoPrice;
    const feeAmount = (fee / 100) * convertedAmount;
    const totalAmount = convertedAmount - feeAmount; // In USD
    const finalCryptoBought = totalAmount / cryptoPrice;

    // Convert values back to selected currency
    const convertedFeeAmount = feeAmount * rate;
    const convertedTotalAmount = totalAmount * rate;

    document.getElementById('result').innerHTML = `
        <p>- Crypto bought before fees: ${cryptoBought.toFixed(6)} ${crypto.toUpperCase()}</p>
        <p>- Crypto bought after fees: ${finalCryptoBought.toFixed(6)} ${crypto.toUpperCase()}</p>
        <p>- Transaction fee: ${convertedFeeAmount.toFixed(2)} ${selectedCurrency}</p>
        <p>- Amount in ${selectedCurrency} after fees: ${convertedTotalAmount.toFixed(2)} ${selectedCurrency}</p>
    `;
}

function clearFields() {
    document.getElementById('crypto').value = 'bitcoin';
    document.getElementById('exchange').value = 'binance';
    document.getElementById('amount').value = '';
    document.getElementById('fee').value = '';
    document.getElementById('cryptoPrice').value = '';
    document.getElementById('manualFee').checked = false;
    document.getElementById('manualCryptoPriceContainer').style.display = 'none';
    document.getElementById('fee').setAttribute('readonly', true);
    document.getElementById('result').innerHTML = '';
    setFee(); // Revert to automatic fee
}

// Initialize exchange rates and set the default exchange fee
document.addEventListener("DOMContentLoaded", () => {
    fetchExchangeRates();
    setFee();
});
