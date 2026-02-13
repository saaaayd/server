const fs = require('fs');
const path = require('path');
const { cleanupOldBackups } = require('./services/backupService');

const backupDir = path.join(__dirname, 'backups');

// Ensure backup dir exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Create 15 dummy backup folders
console.log('Creating 15 dummy backup folders...');
for (let i = 1; i <= 15; i++) {
    // Use ISO-like timestamps so they sort correctly
    // 2023-01-01T10-00-00, 2023-01-01T11-00-00, etc.
    // To ensure they look like real backups, we'll use a prefix
    const pad = (n) => n.toString().padStart(2, '0');
    const folderName = `2099-12-31T${pad(i)}-00-00-000Z`; // Future date to be "newer" or just distinct. 
    // Wait, the logic sorts descending. So "2099" will be the NEWEST.
    // If I want to test deletion of "old" ones, I should make sure the "old" ones are at the end of the sorted list.
    // descending sort: 2099-12-31T15... (Index 0), ... 2099-12-31T01... (Index 14)
    // So 11 through 15 (which are 01-05 in this naming scheme) should be deleted?
    // Let's stick to simple names that sort easily to verify.
    // Logic: backupFolders.sort((a, b) => b.localeCompare(a));
    // Input: 1, 2, ... 15.
    // Sorted Desc: 15, 14, ... 1.
    // Keep: 15..6 (10 items).
    // Delete: 5..1 (5 items).

    // Creating folders
    const dir = path.join(backupDir, folderName);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

console.log('Running cleanup...');
cleanupOldBackups();

// Check results
const remaining = fs.readdirSync(backupDir).filter(f => fs.statSync(path.join(backupDir, f)).isDirectory());
console.log(`Remaining backups: ${remaining.length}`);
console.log('Files:', remaining);

if (remaining.length === 10) {
    console.log('TEST PASSED: Only 10 backups remain.');
} else {
    console.log('TEST FAILED: Incorrect number of backups.');
}
