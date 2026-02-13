const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Import Models
const User = require('../models/User');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Room = require('../models/Room');
const Announcement = require('../models/Announcement');
const AttendanceLog = require('../models/Attendance');
// Task model if it exists, otherwise skip or import dynamically
let Task;
try {
    Task = require('../models/Task');
} catch (e) {
    console.warn('Task model not found, skipping Task backup');
}

const backupDir = path.join(__dirname, '../backups');

const backupDatabase = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const specificBackupDir = path.join(backupDir, timestamp);

    try {
        if (!fs.existsSync(specificBackupDir)) {
            fs.mkdirSync(specificBackupDir, { recursive: true });
        }

        console.log(`[Backup] Starting backup at ${timestamp}...`);

        const collections = {
            users: User,
            payments: Payment,
            maintenance_requests: MaintenanceRequest,
            rooms: Room,
            announcements: Announcement,
            attendance_logs: AttendanceLog,
        };

        if (Task) collections.tasks = Task;

        for (const [name, model] of Object.entries(collections)) {
            const data = await model.find({});
            fs.writeFileSync(
                path.join(specificBackupDir, `${name}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`[Backup] Backed up ${name}: ${data.length} records`);
        }

        console.log(`[Backup] Backup completed successfully at ${specificBackupDir}`);

        // Optional: Delete old backups (older than 7 days)
        cleanupOldBackups();

    } catch (error) {
        console.error('[Backup] Backup failed:', error);
    }
};

const cleanupOldBackups = () => {
    try {
        const files = fs.readdirSync(backupDir);

        // Filter only directories (assuming backups are directories) or whatever your backup format is
        // Based on backupDatabase(), we create directories with timestamps.
        const backupFolders = files.filter(file => {
            const filePath = path.join(backupDir, file);
            return fs.statSync(filePath).isDirectory();
        });

        // Sort by name (descending) since name is timestamp (ISO string)
        // Newest backups will be at the beginning of the array
        backupFolders.sort((a, b) => b.localeCompare(a));

        const MAX_BACKUPS = 10;

        if (backupFolders.length > MAX_BACKUPS) {
            const backupsToDelete = backupFolders.slice(MAX_BACKUPS);

            backupsToDelete.forEach(folder => {
                const folderPath = path.join(backupDir, folder);
                fs.rmSync(folderPath, { recursive: true, force: true });
                console.log(`[Backup] Deleted old backup (Limit 10): ${folder}`);
            });
        }
    } catch (error) {
        console.error('[Backup] Cleanup failed:', error);
    }
};

const scheduleBackups = () => {
    // Schedule task to run every hour
    cron.schedule('0 * * * *', () => {
        backupDatabase();
    });
    console.log('[Backup] Backup service scheduled (Every hour)');
};

module.exports = { scheduleBackups, backupDatabase, cleanupOldBackups };
