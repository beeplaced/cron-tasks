const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
let currentIndex = 0;
const configFile = 'cronConfig.json';

const readConfigFile = () => {
    try {
        const data = fs.readFileSync(configFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading config file:', error.message);
        return null;
    }
};

const executeApiRequest = async (apiEndpoint, serviceName, apiKey, toggle) => {
    try {
        let selectedInstance
        let headers = {'x-api-key': apiKey };
        if (toggle !== undefined) {
            selectedInstance = toggle[currentIndex];
            headers['instance'] = selectedInstance;
            currentIndex = (currentIndex + 1) % toggle.length;
        }
        const response = await axios.get(apiEndpoint, { headers });
        console.log(`${serviceName} | ${selectedInstance} | API response:`, response.data);
    } catch (error) {
        console.error(`${serviceName} - Error during API request:`, error.message);
    }
};

const startCronJobs = () => {
    const config = readConfigFile();

    if (config && config.tasks) {
        config.tasks.forEach((task) => {
            const { service, endpoint, schedule, active, apiKey,toggle } = task;
            if (!active) return
            cron.schedule(schedule, () => {
                executeApiRequest(endpoint, service, apiKey,toggle);
            });
        });
    } else {
        console.log('Invalid or missing configuration.');
    }
};

startCronJobs();
