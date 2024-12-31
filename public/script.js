const socket = io();  
const dataDisplay = document.getElementById('data-display');  
const energyDisplay = document.getElementById('energy-display');  
const ctx = document.getElementById('dataChart').getContext('2d');  

// Chart configuration  
let chartData = {  
    labels: [],  
    datasets: [  
        {  
            label: 'Wind Speed (m/s)',  
            data: [],  
            borderColor: 'rgba(75, 192, 192, 1)',  
            borderWidth: 2,  
            fill: false  
        },  
        {  
            label: 'Voltage (V)',  
            data: [],  
            borderColor: 'rgba(153, 102, 255, 1)',  
            borderWidth: 2,  
            fill: false  
        },  
        {  
            label: 'Current (A)',  
            data: [],  
            borderColor: 'rgba(255, 159, 64, 1)',  
            borderWidth: 2,  
            fill: false  
        },  
        {  
            label: 'Power (W)',  
            data: [],  
            borderColor: 'rgba(255, 99, 132, 1)',  
            borderWidth: 2,  
            fill: false  
        }  
    ]  
};  

const chartOptions = {  
    responsive: true,  
    plugins: {  
        legend: {  
            display: true,  
            position: 'top'  
        }  
    },  
    scales: {  
        x: { display: true, title: { display: true, text: 'Time' } },  
        y: { display: true, title: { display: true, text: 'Values' } }  
    }  
};  

const sensorChart = new Chart(ctx, {  
    type: 'line',  
    data: chartData,  
    options: chartOptions  
});  

// Handle real-time data  
let sensorLog = []; // Store data for future use  
let totalEnergy = 0; // Total energy generated in kWh  
let lastTimestamp = performance.now();  

socket.on('sensor-data', (data) => {  
    const timestamp = new Date().toLocaleTimeString();  
    const { windSpeed, voltage, current, power } = data;  

    // Display latest data  
    dataDisplay.textContent = `Latest Data: Wind Speed: ${windSpeed} m/s, Voltage: ${voltage} V, Current: ${current} A, Power: ${power} W`;  

    // Update chart data  
    chartData.labels.push(timestamp);  
    chartData.datasets[0].data.push(windSpeed);  
    chartData.datasets[1].data.push(voltage);  
    chartData.datasets[2].data.push(current);  
    chartData.datasets[3].data.push(power);  
    sensorLog.push({ time: timestamp, windSpeed, voltage, current, power });  

    // Calculate energy generated  
    const timeDiff = (performance.now() - lastTimestamp) / 3600000; // Convert milliseconds to hours  
    totalEnergy += (power / 1000) * timeDiff; // Power in kW  
    lastTimestamp = performance.now();  

    energyDisplay.textContent = `Energy Generated: ${totalEnergy.toFixed(2)} kWh`;  

    // Limit chart data to last 20 points  
    if (chartData.labels.length > 20) {  
        chartData.labels.shift();  
        chartData.datasets.forEach(dataset => dataset.data.shift());  
    }  
    sensorChart.update();  
});  
