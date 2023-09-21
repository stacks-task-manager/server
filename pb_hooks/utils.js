module.exports = {
    clearLogs: () => {
        try {
            const logs = $app.dao().findRecordsByExpr("logs");
            console.log(`Clearing ${logs.length} logs`);
            for (const log of logs) {
                $app.dao().deleteRecord(log);
            }
        } catch (e) {
            //
        }
    }
}