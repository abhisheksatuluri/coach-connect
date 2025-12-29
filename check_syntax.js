
import { base44 } from './src/api/base44Client.js';
import { CLIENTS } from './src/data/testData.js';

console.log("Successfully imported base44");
console.log("CLIENTS length:", CLIENTS.length);

base44.auth.me().then(user => {
    console.log("Mock Auth Me:", user.full_name);

    base44.entities.Client.list().then(clients => {
        console.log("Mock Client List:", clients.length);
        console.log("TEST PASSED");
    }).catch(err => {
        console.error("Client List Failed:", err);
    });
}).catch(err => {
    console.error("Auth Me Failed:", err);
});
