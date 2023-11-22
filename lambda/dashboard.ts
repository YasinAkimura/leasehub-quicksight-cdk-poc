import * as AWS from 'aws-sdk';
const quicksight = new AWS.QuickSight();

// Die Handler-Funktion, die von der Lambda-Funktion aufgerufen wird
export const handler = async () => {
    try {
        // Lesen Sie die Umgebungsvariablen aus
        const dashboardId = process.env.DASHBOARD_ID;
        const awsAccountId = process.env.AWS_ACCOUNT_ID;

        if (!dashboardId || !awsAccountId) return;
        // Erstellen Sie die Parameter für die QuickSight-SDK
        const params = {
            AwsAccountId: awsAccountId,
            DashboardId: dashboardId,
            IdentityType: 'ANONYMOUS', // wählen Sie den Identitätstyp aus
            ResetDisabled: true, // wählen Sie aus, ob die Zurücksetzen-Schaltfläche angezeigt werden soll oder nicht
            SessionLifetimeInMinutes: 10, // wählen Sie die Sitzungsdauer aus
            UndoRedoDisabled: true, // wählen Sie aus, ob die Rückgängig/Wiederholen-Schaltflächen angezeigt werden sollen oder nicht
        } satisfies AWS.QuickSight.GetDashboardEmbedUrlRequest;

        // Rufen Sie die getDashboardEmbedUrl-Methode der QuickSight-SDK auf
        const response = await quicksight.getDashboardEmbedUrl(params).promise();

        // Extrahieren Sie die URL aus der Antwort
        const url = response.EmbedUrl;

        // Erstellen Sie die Antwort für die API-Gateway-SDK
        const result = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // ändern Sie dies nach Bedarf
            },
            body: JSON.stringify({
                url: url,
            }),
        };

        // Geben Sie die Antwort zurück
        return result;
    } catch (error: any) {
        // Behandeln Sie den Fehler
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // ändern Sie dies nach Bedarf
            },
            body: JSON.stringify({
                error: error.message,
            }),
        };
    }
};
